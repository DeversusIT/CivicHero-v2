"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Email o password non corretti" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Conferma la tua email prima di accedere" };
    }
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const admin = createAdminClient();

  // Check username uniqueness before signup
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("username", parsed.data.username)
    .single();

  if (existing) {
    return { error: "Username già in uso, scegline un altro" };
  }

  // Create auth user
  const { data: authData, error: signUpError } =
    await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true, // Auto-confirm for now; change to false when Resend is configured
    });

  if (signUpError) {
    if (
      signUpError.message.includes("already registered") ||
      signUpError.message.includes("already been registered")
    ) {
      return { error: "Email già registrata" };
    }
    return { error: signUpError.message };
  }

  if (!authData.user) {
    return { error: "Errore durante la registrazione" };
  }

  // Create profile
  const { error: profileError } = await admin.from("profiles").insert({
    id: authData.user.id,
    username: parsed.data.username,
  });

  if (profileError) {
    // Rollback: delete the auth user if profile creation fails
    await admin.auth.admin.deleteUser(authData.user.id);
    if (profileError.message.includes("unique")) {
      return { error: "Username già in uso, scegline un altro" };
    }
    return { error: "Errore nella creazione del profilo" };
  }

  // Sign in the user after registration
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    // Registration succeeded, just redirect to login
    redirect("/login?registered=1");
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
