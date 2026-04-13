import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Upload, Bookmark, User, LogOut, MessageSquare } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const links = [
    { to: "/", label: "Chatbot", icon: MessageSquare },
    { to: "/database", label: "Database", icon: Search },
    { to: "/submit", label: "Submit", icon: Upload },
    { to: "/my-collections", label: "Collections", icon: Bookmark },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-primary">
          <BookOpen className="h-5 w-5" />
          <span className="hidden sm:inline" style={{ fontFamily: "'Libre Baskerville', serif" }}>ThesisHub</span>
        </Link>

        {user && (
          <div className="flex items-center gap-1">
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
          </div>
        )}

        {!user && (
          <Link to="/auth">
            <Button size="sm">Sign In</Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
