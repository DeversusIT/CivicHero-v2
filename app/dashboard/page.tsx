import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#003087] to-[#001a4d] p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">🚔 CivicHero</h1>
          <form action={logout}>
            <Button
              type="submit"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              Esci
            </Button>
          </form>
        </header>

        <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              Benvenuto, {profile?.username ?? user.email}!
            </CardTitle>
            <CardDescription className="text-blue-200">
              Sei pronto a diventare un CivicHero?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100 mb-4">
              I livelli del gioco saranno disponibili presto. Per ora puoi
              esplorare la piattaforma.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { id: 0, name: "Tutorial", locked: false },
                { id: 1, name: "Bullismo", locked: true },
                { id: 2, name: "Vandalismo", locked: true },
                { id: 3, name: "Strada", locked: true },
                { id: 4, name: "Cybercrime", locked: true },
                { id: 5, name: "Missione Polizia", locked: true },
              ].map((level) => (
                <div
                  key={level.id}
                  className={`p-4 rounded-lg border text-center ${
                    level.locked
                      ? "border-white/10 bg-white/5 text-white/40"
                      : "border-[#FFD700]/50 bg-[#FFD700]/10 text-white"
                  }`}
                >
                  <div className="text-2xl mb-1">
                    {level.locked ? "🔒" : "▶"}
                  </div>
                  <div className="text-sm font-medium">
                    {level.id === 0 ? "Tutorial" : `Liv. ${level.id}`}
                  </div>
                  <div className="text-xs mt-1 opacity-70">{level.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
