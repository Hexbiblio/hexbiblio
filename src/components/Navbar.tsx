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
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
          <BookOpen className="h-5 w-5" />
          <span className="hidden sm:inline" style={{ fontFamily: "'Libre Baskerville', serif" }}>ThesisHub</span>
        </Link>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-1 text-xs font-medium">
            <Globe className="h-4 w-4" />
            <span>{language === "en" ? "FR" : "EN"}</span>
          </Button>

          {user && (
            <>
              {links.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}>
                  <Button variant={isActive(to) ? "secondary" : "ghost"} size="sm" className="gap-1.5 text-xs sm:text-sm">
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{label}</span>
                  </Button>
                </Link>
              ))}
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-xs text-muted-foreground">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}

          {!user && (
            <Link to="/auth">
              <Button size="sm">{t("nav.signIn")}</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
