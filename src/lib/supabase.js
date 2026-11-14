import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const CONFIG_PKL = {
  BUCKET_NAME: "pkl-files",
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25 MB
  DAFTAR_KELAS: ["12 DKV 1", "12 DKV 2"],
};