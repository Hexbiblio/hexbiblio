-- ============================================================
-- Notifications — alert thesis owners on new comments/ratings
-- ============================================================
-- In-app only for now (see CLAUDE.md — email deferred until there's a
-- custom domain to send transactional mail from). Populated exclusively by
-- SECURITY DEFINER triggers on comments/ratings/accuracy_ratings, the same
-- "server is the only writer" pattern already used for theses/sources — a
-- client can never insert a fake notification for itself.

CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  thesis_id UUID NOT NULL REFERENCES public.theses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'rating', 'accuracy_rating')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- The only mutation a client can make is marking their own as read.
CREATE POLICY "Users can mark own notifications read"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE read = false;

-- Shared by all three trigger functions below: look up the thesis owner and
-- insert a notification for them, unless they're the one who just acted on
-- their own thesis (rating your own work isn't news to you).
CREATE OR REPLACE FUNCTION public.notify_thesis_owner(_thesis_id uuid, _actor_id uuid, _type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id UUID;
BEGIN
  SELECT user_id INTO owner_id FROM public.theses WHERE id = _thesis_id;
  IF owner_id IS NOT NULL AND owner_id != _actor_id THEN
    INSERT INTO public.notifications (user_id, actor_id, thesis_id, type)
    VALUES (owner_id, _actor_id, _thesis_id, _type);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_thesis_owner(NEW.thesis_id, NEW.user_id, 'comment');
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_on_comment_trigger
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();

-- Ratings/accuracy_ratings are upserted (UNIQUE(thesis_id, user_id) — see
-- RatingWidget.tsx), so AFTER INSERT only fires on someone's *first* rating,
-- never when they tweak an existing score. That's deliberate: "someone rated
-- your thesis" is the meaningful signal, not every adjustment to it.
CREATE OR REPLACE FUNCTION public.notify_on_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_thesis_owner(NEW.thesis_id, NEW.user_id, 'rating');
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_on_rating_trigger
AFTER INSERT ON public.ratings
FOR EACH ROW EXECUTE FUNCTION public.notify_on_rating();

CREATE OR REPLACE FUNCTION public.notify_on_accuracy_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_thesis_owner(NEW.thesis_id, NEW.user_id, 'accuracy_rating');
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_on_accuracy_rating_trigger
AFTER INSERT ON public.accuracy_ratings
FOR EACH ROW EXECUTE FUNCTION public.notify_on_accuracy_rating();
