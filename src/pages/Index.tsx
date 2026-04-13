import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Upload, Users } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  const { user } = useAuth();

  if (user) {
    return <ChatInterface />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="text-center space-y-6 mb-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">ThesisHub</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Submit your research question and our AI instantly recognizes your discipline, 
          extracts key themes, and guides you through every stage of your thesis — 
          from refining the question to choosing methodology.
        </p>
        <Link to="/auth">
          <Button size="lg" className="mt-4">Get Started</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: BookOpen, title: "Discipline Recognition", desc: "AI identifies your academic field and interdisciplinary connections from your research question." },
          { icon: Search, title: "Theme Extraction", desc: "Key themes, concepts, and keywords are automatically identified to sharpen your research focus." },
          { icon: Upload, title: "Thesis Repository", desc: "Deposit your thesis and make it accessible to the academic community for feedback." },
          { icon: Users, title: "Community Feedback", desc: "Rate theses, leave comments, and engage with fellow researchers across disciplines." },
        ].map(({ icon: Icon, title, desc }) => (
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
