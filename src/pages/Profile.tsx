import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ThesisCard from "@/components/ThesisCard";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [myTheses, setMyTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (profile) setUsername(profile.username || "");

      const { data: theses } = await supabase.from("theses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setMyTheses(theses || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ username: username.trim() }).eq("user_id", user.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated!" });
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <div className="flex gap-2">
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" />
              <Button onClick={handleUpdateProfile}>Save</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">My Theses ({myTheses.length})</h2>
        {myTheses.length === 0 ? (
          <p className="text-muted-foreground">You haven't submitted any theses yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {myTheses.map(thesis => <ThesisCard key={thesis.id} {...thesis} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
