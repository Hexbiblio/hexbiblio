import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Upload, Users, ArrowRight, Sparkles } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import ThesisQuests, { useQuestProgress, QuestId } from "@/components/ThesisQuests";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Index = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { completed, complete, toggle } = useQuestProgress();
  const { toast } = useToast();
  const [justCompleted, setJustCompleted] = useState<QuestId | null>(null);

  const handleQuestProgress = (ids: QuestId[]) => {
    const added = complete(ids);
    if (added.length > 0) {
      const last = added[added.length - 1];
      setJustCompleted(last);
      toast({
        title: language === "fr" ? "🎉 Quête accomplie !" : "🎉 Quest complete!",
        description:
          language === "fr"
            ? `+${added.length} étape${added.length > 1 ? "s" : ""} validée${added.length > 1 ? "s" : ""}`
            : `+${added.length} step${added.length > 1 ? "s" : ""} unlocked`,
      });
      setTimeout(() => setJustCompleted(null), 1500);
    }
  };

  const features = [
    { icon: BookOpen, title: t("landing.disciplineTitle"), desc: t("landing.disciplineDesc"), color: "from-primary/20 to-primary/5" },
    { icon: Search, title: t("landing.themeTitle"), desc: t("landing.themeDesc"), color: "from-accent/20 to-accent/5" },
    { icon: Upload, title: t("landing.repoTitle"), desc: t("landing.repoDesc"), color: "from-primary/15 to-accent/10" },
    { icon: Users, title: t("landing.feedbackTitle"), desc: t("landing.feedbackDesc"), color: "from-accent/15 to-primary/10" },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/[0.06] via-background to-accent/[0.04] px-4 py-16 md:py-20">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-accent/[0.08] blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                HexBiblio
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
              {t("landing.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Embedded Chat + Quests */}
      <section className="mx-auto w-full max-w-6xl px-4 -mt-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={user ? "grid gap-6 lg:grid-cols-[1fr_320px]" : ""}
        >
          <div className="min-w-0">
            <ChatInterface embedded onQuestProgress={user ? handleQuestProgress : undefined} />
          </div>
          {user && (
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <ThesisQuests completed={completed} justCompleted={justCompleted} />
            </aside>
          )}
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-2xl font-bold sm:text-3xl">{t("landing.title")}</h2>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link to="/auth" className="group block h-full">
                <div className={`relative h-full overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base mb-1.5">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-auto border-t bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold sm:text-3xl">
              {t("landing.getStarted")}
            </h2>
            <p className="text-muted-foreground">{t("landing.subtitle")}</p>
            <Link to="/auth">
              <Button size="lg" className="mt-4 rounded-full px-8 gap-2 shadow-lg shadow-primary/25">
                {t("nav.signIn")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;