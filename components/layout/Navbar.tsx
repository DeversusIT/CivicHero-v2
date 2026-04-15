import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import UserMenu from "./UserMenu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
  }

  return (
    <nav className="bg-[#003087] border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-90 transition-opacity"
        >
          🚔 CivicHero
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/leaderboard"
            className="text-blue-200 hover:text-white text-sm transition-colors hidden sm:block"
          >
            Classifica
          </Link>

          {user && username ? (
            <UserMenu username={username} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "text-blue-200 hover:text-white hover:bg-white/10"
                )}
              >
                Accedi
              </Link>
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-[#FFD700] text-[#003087] hover:bg-[#FFD700]/90 font-semibold"
                )}
              >
                Registrati
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
