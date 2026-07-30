import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Upload, Bookmark, User, LogOut, Globe, Menu, Check, BookOpen } from "lucide-react";
import type { Language } from "@/i18n/translations";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { to: "/database", label: t("nav.database"), icon: Search },
    { to: "/sources", label: t("nav.sources"), icon: BookOpen },
    { to: "/submit", label: t("nav.submit"), icon: Upload },
    { to: "/my-collections", label: t("nav.collections"), icon: Bookmark },
    { to: "/profile", label: t("nav.profile"), icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  const languageOptions: { code: Language; label: string }[] = [
    { code: "fr", label: "Français" },
    { code: "en", label: "English" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/hexbiblio-logo.svg"
            alt="HexBiblio"
            className="h-8 w-8 transition-transform group-hover:scale-105"
          />
          <span className="hidden sm:inline font-bold text-foreground tracking-tight" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            HexBiblio
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs font-medium rounded-full px-3"
              >
                <Globe className="h-3.5 w-3.5" />
                {language.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languageOptions.map(({ code, label }) => (
                <DropdownMenuItem key={code} onClick={() => setLanguage(code)} className="gap-2">
                  <Check className={`h-4 w-4 ${language === code ? "opacity-100" : "opacity-0"}`} />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {user && (
            <>
              {/* Full nav — tablet and up */}
              <div className="hidden sm:flex items-center gap-0.5">
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
              </div>

              {/* Hamburger menu — mobile only */}
              <div className="sm:hidden">
                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72">
                    <SheetTitle style={{ fontFamily: "'Libre Baskerville', serif" }}>HexBiblio</SheetTitle>
                    <nav className="mt-6 flex flex-col gap-1">
                      {links.map(({ to, label, icon: Icon }) => (
                        <SheetClose asChild key={to}>
                          <Link
                            to={to}
                            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                              isActive(to) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {label}
                          </Link>
                        </SheetClose>
                      ))}
                      <div className="my-2 h-px bg-border" />
                      <SheetClose asChild>
                        <button
                          onClick={signOut}
                          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                          {t("nav.signOut")}
                        </button>
                      </SheetClose>
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>
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
