"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
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
import { useState } from "react";

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("username", values.username);
      const result = await registerAction(formData);
      if (result?.error) {
        setServerError(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="bg-white/10 border-white/20 text-white backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Crea account</CardTitle>
        <CardDescription className="text-blue-200">
          Registrati per salvare i tuoi progressi e competere nella classifica
        </CardDescription>
      </CardHeader>
      <CardContent>
        {serverError && (
          <div className="mb-4 p-3 rounded-md bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-blue-100">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="CivicHero123"
              autoComplete="username"
              className="bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-red-300 text-sm">{errors.username.message}</p>
            )}
            <p className="text-blue-300 text-xs">
              3–20 caratteri, solo lettere, numeri e underscore
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-100">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="mario@esempio.it"
              autoComplete="email"
              className="bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-300 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-100">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="bg-white/10 border-white/30 text-white placeholder:text-blue-300 focus:border-[#FFD700] focus:ring-[#FFD700]/20"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-300 text-sm">{errors.password.message}</p>
            )}
            <p className="text-blue-300 text-xs">Minimo 6 caratteri</p>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#003087] font-bold"
          >
            {isLoading ? "Registrazione in corso..." : "Crea account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm text-blue-200">
        <p className="w-full">
          Hai già un account?{" "}
          <Link href="/login" className="text-[#FFD700] hover:underline font-medium">
            Accedi
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
