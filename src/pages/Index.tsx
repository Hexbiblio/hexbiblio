import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Upload, Users } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (user) {
    return <ChatInterface />;
  }

  const features = [
    { icon: BookOpen, title: t("landing.disciplineTitle"), desc: t("landing.disciplineDesc") },
    { icon: Search, title: t("landing.themeTitle"), desc: t("landing.themeDesc") },
    { icon: Upload, title: t("landing.repoTitle"), desc: t("landing.repoDesc") },
    { icon: Users, title: t("landing.feedbackTitle"), desc: t("landing.feedbackDesc") },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center space-y-6 mb-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{t("landing.title")}</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{t("landing.subtitle")}</p>
        <Link to="/auth">
          <Button size="lg" className="mt-4">{t("landing.getStarted")}</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <Link key={title} to="/auth" className="group">
            <div className="rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20 h-full">
              <Icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Index;
