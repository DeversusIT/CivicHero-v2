"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [state, action, isPending] = useActionState(login, null);

  return (
    <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Accedi</CardTitle>
        <CardDescription className="text-blue-200">
          Inserisci le tue credenziali per continuare
        </CardDescription>
      </CardHeader>
      <CardContent>
        {registered && (
          <div className="mb-4 p-3 rounded-md bg-green-500/20 border border-green-400/30 text-green-200 text-sm">
            Registrazione completata! Ora puoi accedere.
          </div>
        )}
        {state?.error && (
          <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
            {state.error}
          </div>
        )}
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-100">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="mario@esempio.it"
              autoComplete="email"
              required
              className="bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-100">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#003087] font-bold"
          >
            {isPending ? "Accesso in corso..." : "Accedi"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-center text-sm text-blue-200">
        <p>
          Non hai un account?{" "}
          <Link href="/register" className="text-[#FFD700] hover:underline font-medium">Registrati</Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
