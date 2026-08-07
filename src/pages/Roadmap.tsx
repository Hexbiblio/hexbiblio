import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { QUESTS, getNextQuest, useQuestProgress } from "@/components/ThesisQuests";
import { ROADMAP_CONTENT } from "@/data/roadmapContent";
import MascotAvatar from "@/components/MascotAvatar";

// The one visual "roadmap" surface in the app besides the sidebar quest
// widget (ThesisQuests.tsx) — same underlying QUESTS order/icons and the
// same useQuestProgress() source of truth, just laid out as a fuller,
// alternating (zigzag) almanac instead of a compact checklist. Deliberately
// shows every step's full content even before it's reached (dimmed, not
// hidden) — the point of an almanac is to preview the whole journey, not to
// gate it. No SVG path: this codebase has no existing precedent for one, so
// the zigzag is expressed purely with a CSS grid alternating content left/
// right of a shared center icon column, matching the plain-CSS timeline
// ThesisQuests.tsx's own sidebar already uses.
const Roadmap = () => {
  const { t, language } = useLanguage();
  const { completed } = useQuestProgress();
  const nextQuest = getNextQuest(completed);
  const total = QUESTS.length;
  const done = completed.size;
  const pct = useMemo(() => Math.round((done / total) * 100), [done, total]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{t("roadmap.title")}</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">{t("roadmap.subtitle")}</p>

        {/* UX-01: the page used to promise "real-time progress" in its own
            subtitle without showing any — same counter/%/bar the sidebar
            widget (ThesisQuests.tsx) already renders, so a visitor doesn't
            have to scan all 7 cards to know where they stand. */}
        <div className="mx-auto mt-5 max-w-sm">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium">
              {done}/{total} · {pct}%
            </span>
            {nextQuest && (
              <span className="text-muted-foreground">
                {t("roadmap.currentlyLabel")} {nextQuest.label[language]}
              </span>
            )}
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      </div>

      <div className="relative">
        {/* Center spine — desktop only. Aligns with the icon column because
            the grid's side columns are equal (1fr each), so "auto" sits
            exactly centered regardless of content length. */}
        <div
          className="absolute left-1/2 top-2 bottom-2 hidden w-px -translate-x-1/2 bg-border md:block"
          aria-hidden="true"
        />

        <ol className="space-y-10 md:space-y-14">
          {QUESTS.map((q, i) => {
            const content = ROADMAP_CONTENT[q.id];
            const isDone = completed.has(q.id);
            const isCurrent = !isDone && q.id === nextQuest?.id;
            const onRight = i % 2 === 1;
            const Icon = q.icon;

            return (
              <motion.li
                key={q.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4 }}
                className="md:grid md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-6"
              >
                <div className="relative z-10 flex flex-col items-center gap-1.5 md:col-start-2 md:row-start-1">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 bg-background transition-colors ${
                      isDone
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCurrent
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground/40"
                    }`}
                  >
                    {isDone ? <Check className="h-6 w-6" strokeWidth={3} /> : <Icon className="h-6 w-6" />}
                  </div>
                  {isCurrent && (
                    <span className="whitespace-nowrap rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {t("roadmap.currentBadge")}
                    </span>
                  )}
                </div>

                <div
                  className={`mt-4 min-w-0 md:mt-0 md:row-start-1 ${onRight ? "md:col-start-3" : "md:col-start-1"}`}
                >
                  <div
                    className={`rounded-lg border bg-card/80 p-5 shadow-sm transition-opacity ${
                      isDone || isCurrent ? "" : "opacity-60"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{q.label[language]}</h2>
                      {isDone && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {t("roadmap.doneBadge")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/80">{content.context[language]}</p>
                    <p className="mt-2 text-sm italic text-muted-foreground">{content.motivation[language]}</p>
                    <ul className="mt-3 space-y-1.5">
                      {content.tips.map((tip, ti) => (
                        <li key={ti} className="flex gap-2 text-sm text-foreground/80">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                          <span>{tip[language]}</span>
                        </li>
                      ))}
                    </ul>

                    {/* UX-02: the page used to be a dead end — no link out to
                        actually DO the step. The sources step gets a direct
                        link to browse them (previously just mentioned in
                        prose); whichever step is current gets an action
                        button — to the chat for every chat-detectable step,
                        or to the profile page for "plan," the one step chat
                        can't complete. */}
                    {q.id === "sources" && (
                      <Button asChild variant="outline" size="sm" className="mt-3 gap-1.5">
                        <Link to="/sources">
                          {t("roadmap.sourcesLink")}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                    {isCurrent && (
                      <Button asChild size="sm" className="mt-3 gap-1.5">
                        <Link to={q.id === "plan" ? "/profile" : "/"}>
                          {q.id === "plan" ? t("roadmap.planCTA") : t("roadmap.continueCTA")}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Mascot mini-tip — lives in the column the zigzag leaves
                    empty opposite the content card (mirrors "onRight": card
                    and mascot always sit on opposite sides), filling what
                    would otherwise be dead space. Reads content.mascotTip,
                    a dedicated "classic pitfall" line — NOT tips[0], which
                    used to duplicate a bullet already shown right next to it
                    in the card (BUG-02). On mobile the grid collapses so
                    there's no void to fill — it just drops into the normal
                    stacked flow below the card instead of disappearing. Same
                    speech-bubble treatment as a real chat message (see
                    ChatInterface.tsx/OnboardingCard.tsx). */}
                <div
                  className={`mt-4 flex items-start gap-2 md:mt-0 md:row-start-1 md:h-full md:items-center ${
                    onRight ? "md:col-start-1" : "md:col-start-3"
                  }`}
                >
                  <MascotAvatar className="h-8 w-7" />
                  <div className="relative rounded-2xl rounded-tl-md bg-muted px-3 py-2">
                    <span className="absolute -left-1 top-2.5 h-3 w-3 rotate-45 rounded-[2px] bg-muted" />
                    <p className="text-sm text-foreground/90">{content.mascotTip[language]}</p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default Roadmap;
