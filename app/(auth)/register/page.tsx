"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register as registerAction } from "@/app/actions/auth";
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

export default function RegisterPage() {
  const [state, action, isPending] = useActionState(registerAction, null);

  return (
    <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Crea account</CardTitle>
        <CardDescription className="text-blue-200">
          Registrati per salvare i tuoi progressi e competere nella classifica
        </CardDescription>
      </CardHeader>
      <CardContent>
        {state?.error && (
          <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
            {state.error}
          </div>
        )}
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-blue-100">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="CivicHero123"
              autoComplete="username"
              required
              className="bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
            />
            <p className="text-blue-300 text-xs">3–20 caratteri, solo lettere, numeri e underscore</p>
          </div>
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
              autoComplete="new-password"
              minLength={6}
              required
              className="bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
            />
            <p className="text-blue-300 text-xs">Minimo 6 caratteri</p>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#003087] font-bold"
          >
            {isPending ? "Registrazione in corso..." : "Crea account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-blue-200">
        <p className="w-full">
          Hai già un account?{" "}
          <Link href="/login" className="text-[#FFD700] hover:underline font-medium">Accedi</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
