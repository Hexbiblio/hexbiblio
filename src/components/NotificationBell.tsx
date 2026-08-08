import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageSquare, Star, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { getResearcherTitle } from "@/components/ThesisQuests";

type NotificationType = "comment" | "rating" | "accuracy_rating";

interface NotificationRow {
  id: string;
  type: NotificationType;
  thesis_id: string;
  actor_id: string | null;
  read: boolean;
  created_at: string;
  theses: { title: string } | null;
  actorName?: string;
  actorQuestCount?: number;
}

// A live push (Realtime channel) would be nicer, but this is a low-traffic
// academic tool — a light poll for the unread count keeps the badge fresh
// without another subscription to manage. The list itself always refetches
// fresh when the popover opens, so it's never actually stale when it matters.
const POLL_INTERVAL_MS = 60_000;

const typeIcon: Record<NotificationType, typeof MessageSquare> = {
  comment: MessageSquare,
  rating: Star,
  accuracy_rating: ShieldCheck,
};

const NotificationBell = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchUnreadCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setUnreadCount(count ?? 0);
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("id, type, thesis_id, actor_id, read, created_at, theses:thesis_id(title)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    const rows = (data as unknown as NotificationRow[]) || [];
    const actorIds = [...new Set(rows.map((r) => r.actor_id).filter((id): id is string => !!id))];
    const { data: profiles } = actorIds.length
      ? await supabase.from("profiles_public").select("user_id, username, completed_quests_count").in("user_id", actorIds)
      : { data: [] as { user_id: string; username: string | null; completed_quests_count: number | null }[] };
    const nameMap = new Map(profiles?.map((p) => [p.user_id, p.username]) || []);
    const questCountMap = new Map(profiles?.map((p) => [p.user_id, p.completed_quests_count]) || []);
    setNotifications(
      rows.map((r) => ({
        ...r,
        actorName: (r.actor_id && nameMap.get(r.actor_id)) || undefined,
        actorQuestCount: (r.actor_id && questCountMap.get(r.actor_id)) ?? undefined,
      }))
    );
  };

  const handleOpenChange = async (next: boolean) => {
    setOpen(next);
    if (!next || !user) return;
    await fetchNotifications();
    // Opening the list is "seen" — matches the common bell-icon convention
    // (GitHub, etc.) of marking everything read on open rather than per-item.
    const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    if (!error) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  if (!user) return null;

  const notificationText = (n: NotificationRow) => {
    const actor = n.actorName || t("notifications.someone");
    const title = n.theses?.title || "";
    if (n.type === "comment") {
      return language === "fr" ? `${actor} a commenté « ${title} »` : `${actor} commented on "${title}"`;
    }
    if (n.type === "accuracy_rating") {
      return language === "fr" ? `${actor} a noté la précision de « ${title} »` : `${actor} rated the accuracy of "${title}"`;
    }
    return language === "fr" ? `${actor} a noté la qualité de « ${title} »` : `${actor} rated the quality of "${title}"`;
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0 rounded-full" aria-label={t("notifications.title")}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b p-3">
          <p className="text-sm font-semibold">{t("notifications.title")}</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">{t("notifications.empty")}</p>
          ) : (
            notifications.map((n) => {
              const Icon = typeIcon[n.type];
              return (
                <Link
                  key={n.id}
                  to={`/database/${n.thesis_id}`}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-2.5 border-b p-3 text-sm transition-colors last:border-0 hover:bg-muted/50 ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="leading-snug">{notificationText(n)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleDateString()}
                      {n.actorQuestCount !== undefined && ` · ${getResearcherTitle(n.actorQuestCount)[language]}`}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
