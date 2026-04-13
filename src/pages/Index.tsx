import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Upload, MessageSquare, Users } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center space-y-6 mb-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          ThesisHub
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Your AI-powered research companion and community-driven thesis repository. 
          Get guided through your research journey and share your work with fellow scholars.
        </p>
        {!user && (
          <Link to="/auth">
            <Button size="lg" className="mt-4">Get Started</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: MessageSquare, title: "AI Research Guide", desc: "Chat with our AI assistant for guidance on every stage of your thesis research.", to: "/", soon: true },
          { icon: Search, title: "Browse Theses", desc: "Explore a growing collection of theses from researchers across disciplines.", to: "/database" },
          { icon: Upload, title: "Submit Your Work", desc: "Deposit your thesis and make it accessible to the academic community.", to: "/submit" },
          { icon: Users, title: "Community Feedback", desc: "Rate theses, leave comments, and engage with fellow researchers.", to: "/database" },
        ].map(({ icon: Icon, title, desc, to, soon }) => (
          <Link key={title} to={user ? to : "/auth"} className="group">
            <div className="rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/20 h-full">
              <Icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg mb-1">{title} {soon && <span className="text-xs text-accent">(coming soon)</span>}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Index;
