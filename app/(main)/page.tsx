import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const LEVELS = [
  { id: 0, emoji: "🎮", name: "Tutorial", description: "Impara i controlli" },
  {
    id: 1,
    emoji: "🤝",
    name: "Bullismo",
    description: "Difendi i compagni",
  },
  {
    id: 2,
    emoji: "🏙️",
    name: "Vandalismo",
    description: "Proteggi la città",
  },
  {
    id: 3,
    emoji: "🚦",
    name: "Strada",
    description: "Rispetta il Codice",
  },
  {
    id: 4,
    emoji: "💻",
    name: "Cybercrime",
    description: "Naviga sicuro",
  },
  {
    id: 5,
    emoji: "🚔",
    name: "Missione Polizia",
    description: "Affianca gli agenti",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#003087] to-[#001a4d] text-white py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <div className="text-7xl mb-6">🚔</div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 leading-tight">
            Diventa un{" "}
            <span className="text-[#FFD700]">CivicHero</span>
          </h1>
          <p className="text-blue-200 text-lg sm:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
            Un videogioco educativo su legalità e rispetto delle regole civiche.
            Affronta 6 livelli tematici, rispondi ai quiz e scala la classifica!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-[#FFD700] text-[#003087] hover:bg-[#FFD700]/90 font-bold text-lg h-14 px-10"
                )}
              >
                Vai alla Dashboard ▶
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "bg-[#FFD700] text-[#003087] hover:bg-[#FFD700]/90 font-bold text-lg h-14 px-10"
                  )}
                >
                  Inizia a giocare ▶
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "border-white/30 text-white hover:bg-white/10 text-lg h-14 px-10"
                  )}
                >
                  Hai già un account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Levels Preview */}
      <section className="bg-[#001a4d] py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-white text-3xl font-bold text-center mb-3">
            6 Livelli di Legalità
          </h2>
          <p className="text-blue-300 text-center mb-10">
            Ogni livello insegna un tema civico con quiz e meccaniche di gioco
            uniche
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {LEVELS.map((level) => (
              <Card
                key={level.id}
                className="bg-white/5 border-white/10 text-center hover:bg-white/10 transition-colors"
              >
                <CardContent className="pt-6 pb-4 px-3">
                  <div className="text-4xl mb-2">{level.emoji}</div>
                  <div className="text-white font-semibold text-sm">
                    {level.id === 0 ? "Tutorial" : `Liv. ${level.id}`}
                  </div>
                  <div className="text-blue-300 text-xs mt-1">{level.name}</div>
                  <div className="text-blue-400 text-xs mt-1 leading-tight">
                    {level.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#002070] py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
            <div>
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-white font-bold text-xl mb-2">
                Classifica Globale
              </h3>
              <p className="text-blue-300 text-sm leading-relaxed">
                Scala la leaderboard e sfida altri ragazzi da tutta Italia
              </p>
            </div>
            <div>
              <div className="text-5xl mb-4">🎖️</div>
              <h3 className="text-white font-bold text-xl mb-2">
                Badge e Premi
              </h3>
              <p className="text-blue-300 text-sm leading-relaxed">
                Sblocca badge esclusivi completando i livelli e i quiz
              </p>
            </div>
            <div>
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-white font-bold text-xl mb-2">
                Impara Giocando
              </h3>
              <p className="text-blue-300 text-sm leading-relaxed">
                Quiz su leggi e regole civiche reali con riferimenti normativi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom (for guests) */}
      {!user && (
        <section className="bg-[#003087] py-16 px-4 text-center">
          <div className="container mx-auto max-w-xl">
            <h2 className="text-white text-3xl font-bold mb-4">
              Pronto a diventare un eroe civico?
            </h2>
            <p className="text-blue-200 mb-8">
              Registrati gratuitamente e inizia a giocare in pochi secondi.
            </p>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-[#FFD700] text-[#003087] hover:bg-[#FFD700]/90 font-bold text-lg h-14 px-10"
              )}
            >
              Inizia ora — è gratis!
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
