// Edge Function "ravi-join": pendaftaran lewat LINK UNDANGAN dari admin RaVi.
// Tanpa login (verify_jwt = false) — keamanan dari kode undangan acak, sekali pakai, berlaku 7 hari.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const dmKey = (a: string, b: string) => (a < b ? a + ":" + b : b + ":" + a);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let b: { action?: string; code?: string; email?: string; password?: string; name?: string };
  try { b = await req.json(); } catch { return json({ error: "Body bukan JSON." }, 400); }
  const code = String(b.code ?? "").trim();
  if (!/^[A-Za-z0-9]{10,40}$/.test(code)) return json({ error: "Link undangan tidak valid." }, 400);
  const { data: inv } = await admin.from("ravi_invites").select("*").eq("code", code).maybeSingle();
  if (!inv || inv.used_by || new Date(inv.expires_at) < new Date()) return json({ error: "Link undangan sudah dipakai atau kedaluwarsa. Minta link baru." }, 410);
  const { data: host } = await admin.from("couple_members").select("name").eq("user_id", inv.created_by).maybeSingle();

  // cek link saja (untuk menampilkan "Diundang oleh …")
  if (b.action === "check") return json({ ok: true, host: host?.name ?? "RaVi", note: inv.note ?? null });

  const email = String(b.email ?? "").trim().toLowerCase(), password = String(b.password ?? ""), name = String(b.name ?? "").trim().slice(0, 40);
  if (!name) return json({ error: "Nama wajib diisi." }, 400);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Email tidak valid." }, 400);
  if (password.length < 8) return json({ error: "Password minimal 8 karakter." }, 400);

  // tandai dulu supaya satu link tidak bisa dipakai dua orang bersamaan
  const { data: claimed } = await admin.from("ravi_invites").update({ used_at: new Date().toISOString() })
    .eq("code", code).is("used_by", null).is("used_at", null).select("code");
  if (!claimed || !claimed.length) return json({ error: "Link undangan sedang/sudah dipakai. Minta link baru." }, 409);

  const { data: cu, error: cErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
  if (cErr || !cu.user) {
    await admin.from("ravi_invites").update({ used_at: null }).eq("code", code);
    return json({ error: /already|registered|exists/i.test(cErr?.message ?? "") ? "Email ini sudah terdaftar. Coba masuk (login) saja." : (cErr?.message ?? "Gagal membuat akun.") }, 400);
  }
  const uid = cu.user.id;
  await admin.from("couple_members").upsert({ user_id: uid, name }, { onConflict: "user_id", ignoreDuplicates: true });
  await admin.from("ravi_invites").update({ used_by: uid, used_at: new Date().toISOString() }).eq("code", code);
  // langsung buat chat dengan pengundang
  try {
    const key = dmKey(uid, inv.created_by);
    const { data: c } = await admin.from("couple_convs").upsert({ kind: "dm", dm_key: key, created_by: inv.created_by }, { onConflict: "dm_key" }).select("id").single();
    if (c) await admin.from("couple_conv_members").upsert([{ conv_id: c.id, user_id: uid }, { conv_id: c.id, user_id: inv.created_by }], { onConflict: "conv_id,user_id", ignoreDuplicates: true });
  } catch (_) { /* tidak wajib */ }
  return json({ ok: true });
});
