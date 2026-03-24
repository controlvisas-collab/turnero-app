import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const url = process.env.https://yjwsihigrrduhvnxzqad.supabase.co;
  const key = process.env.sb_publishable_nitzwBj1-NNQnn8gFFxzSg_VqgvW_Sp;

  if (!url || !key) {
    throw new Error("Faltan variables de entorno de Supabase");
  }

  return createClient(url, key);
}
