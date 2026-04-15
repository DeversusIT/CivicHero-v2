import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LEVEL_META = [
  { id: 0, emoji: "🎮", name: "Tutorial", theme: "Introduzione al gioco" },
  {
    id: 1,
    emoji: "🤝",
    name: "Bullismo",
    theme: "Bullismo e Cyberbullismo",
  },
  {
    id: 2,
    emoji: "🏙️",
    name: "Vandalismo",
    theme: "Vandalismo e Graffiti",
  },
  {
    id: 3,
    emoji: "🚦",
    name: "Strada",
    theme: "Regole della Strada",
  },
  {
    id: 4,
    emoji: "💻",
    name: "Cybercrime",
    theme: "Cybercrime e Fake News",
  },
  {
    id: 5,
    emoji: "🚔",
    name: "Missione Polizia",
    theme: "Boss Level — Polizia di Stato",
  },
];

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

  const { data: scores } = await supabase
    .from("scores")
    .select("level_id, score, quiz_bonus")
    .eq("user_id", user.id);

  const scoreMap = new Map<number, number>(
    (scores ?? []).map((s) => [s.level_id, s.score + s.quiz_bonus])
  );

  const totalScore = Array.from(scoreMap.values()).reduce((a, b) => a + b, 0);
  const levelsCompleted = scoreMap.size;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#003087] to-[#001a4d] py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Welcome banner */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Ciao, {profile?.username ?? user.email}! 👋
          </h1>
          <div className="flex flex-wrap gap-4 text-blue-200">
            <span>
              Punteggio totale:{" "}
              <span className="text-[#FFD700] font-bold text-xl">
                {totalScore.toLocaleString()}
              </span>
            </span>
            <span>·</span>
            <span>
              Livelli completati:{" "}
              <span className="text-[#FFD700] font-bold text-xl">
                {levelsCompleted}/6
              </span>
            </span>
          </div>
        </div>

        {/* Levels grid */}
        <h2 className="text-white text-xl font-semibold mb-4">I tuoi livelli</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVEL_META.map((level) => {
            const levelScore = scoreMap.get(level.id);
            const isCompleted = levelScore !== undefined;

            return (
              <Card
                key={level.id}
                className={`border transition-all ${
                  isCompleted
                    ? "bg-[#FFD700]/10 border-[#FFD700]/40 hover:border-[#FFD700]/60"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{level.emoji}</span>
                    {isCompleted ? (
                      <Badge className="bg-[#FFD700] text-[#003087] font-semibold text-xs">
                        ✓ Completato
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-white/20 text-blue-300 text-xs"
                      >
                        {level.id === 0 ? "Disponibile" : "Da giocare"}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white text-lg mt-1">
                    {level.id === 0 ? "Tutorial" : `Livello ${level.id}`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-300 text-sm mb-3">{level.theme}</p>
                  {isCompleted && (
                    <p className="text-[#FFD700] font-bold text-2xl mb-3">
                      {levelScore.toLocaleString()} pt
                    </p>
                  )}
                  <Link
                    href={`/game/${level.id}`}
                    className={`inline-block text-sm font-semibold px-4 py-2 rounded-md transition-colors ${
                      isCompleted
                        ? "bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/30"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {isCompleted ? "Rigioca" : "Gioca"} ▶
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
