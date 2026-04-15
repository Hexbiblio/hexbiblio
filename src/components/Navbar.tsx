import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Upload, Bookmark, User, LogOut, MessageSquare, Globe } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const links = [
    { to: "/", label: t("nav.chatbot"), icon: MessageSquare },
    { to: "/database", label: t("nav.database"), icon: Search },
    { to: "/submit", label: t("nav.submit"), icon: Upload },
    { to: "/my-collections", label: t("nav.collections"), icon: Bookmark },
    { to: "/profile", label: t("nav.profile"), icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleLanguage = () => setLanguage(language === "en" ? "fr" : "en");

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline font-bold text-foreground tracking-tight" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            HexBiblio
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="gap-1 text-xs font-medium rounded-full h-8 w-8 p-0 sm:w-auto sm:px-3 sm:gap-1.5"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{language === "en" ? "FR" : "EN"}</span>
          </Button>

          {user && (
            <>
              {links.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}>
                  <Button
                    variant={isActive(to) ? "default" : "ghost"}
                    size="sm"
                    className={`gap-1.5 text-xs sm:text-sm rounded-full transition-all ${
                      isActive(to) ? "shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{label}</span>
                  </Button>
                </Link>
              ))}
              <div className="ml-1 h-5 w-px bg-border" />
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="gap-1.5 text-xs text-muted-foreground hover:text-destructive rounded-full"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}

          {!user && (
            <Link to="/auth">
              <Button size="sm" className="rounded-full px-5 shadow-sm">{t("nav.signIn")}</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
