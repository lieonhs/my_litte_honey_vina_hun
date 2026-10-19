// Edge Function "ravi": notifikasi push (Web Push) + server TURN untuk telepon.
// Deploy: Supabase → Edge Functions → Deploy a new function → Via Editor → nama: ravi → paste file ini → Deploy.
// Opsional (untuk telepon di jaringan yang ketat): set secrets CF_TURN_KEY_ID + CF_TURN_API_TOKEN (Cloudflare)
// atau METERED_DOMAIN + METERED_API_KEY (Metered, gratis 20 GB/bulan).
// Kunci push (VAPID) dibuat otomatis saat pertama dipakai dan disimpan di tabel ravi_keys.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const URL_ = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(URL_, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

async function vapid() {
  const { data } = await admin.from("ravi_keys").select("vapid_pub,vapid_priv").eq("id", 1).maybeSingle();
  if (data) return data;
  const k = webpush.generateVAPIDKeys();
  const row = { id: 1, vapid_pub: k.publicKey, vapid_priv: k.privateKey };
  const { error } = await admin.from("ravi_keys").insert(row);
  if (error) { // dua permintaan bersamaan: ambil yang sudah tersimpan
    const { data: again } = await admin.from("ravi_keys").select("vapid_pub,vapid_priv").eq("id", 1).single();
    return again!;
  }
  return row;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // 1) Hanya user yang login dan terdaftar sebagai anggota RaVi.
  const auth = req.headers.get("Authorization") ?? "";
  const supa = createClient(URL_, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return json({ error: "Harus login." }, 401);
  const { data: members, error: mErr } = await admin.from("couple_members").select("user_id,name,partner,role");
  if (mErr) return json({ error: "Jalankan setup-ravi.sql dulu: " + mErr.message }, 500);
  const me = members?.find((m) => m.user_id === user.id);
  if (!me) return json({ error: "Akun ini bukan anggota RaVi." }, 403);

  type Body = { action?: string; kind?: string; title?: string; body?: string; url?: string; tag?: string;
    conv?: string; to?: string[]; skip?: string[]; email?: string; password?: string; name?: string };
  let body: Body;
  try { body = await req.json(); } catch { return json({ error: "Body bukan JSON." }, 400); }

  // 2) Kunci publik untuk berlangganan notifikasi.
  if (body.action === "vapid") {
    const k = await vapid();
    return json({ publicKey: k.vapid_pub });
  }

  // 3) Server ICE: STUN + TURN (Cloudflare, atau Metered sebagai cadangan) bila diset.
  if (body.action === "ice") {
    const stun = [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }];
    const id = Deno.env.get("CF_TURN_KEY_ID"), tok = Deno.env.get("CF_TURN_API_TOKEN");
    const mDom = Deno.env.get("METERED_DOMAIN"), mKey = Deno.env.get("METERED_API_KEY");
    if (id && tok) {
      try {
        const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${id}/credentials/generate-ice-servers`, {
          method: "POST",
          headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
          body: JSON.stringify({ ttl: 86400 }),
        });
        if (r.ok) {
          const j = await r.json();
          // Port 53 diblokir browser → buang supaya tidak menunggu timeout.
          const servers = (j.iceServers ?? []).map((s: { urls: string | string[]; username?: string; credential?: string }) => ({
            ...s, urls: (Array.isArray(s.urls) ? s.urls : [s.urls]).filter((u) => !/:53(\?|$)/.test(u)),
          })).filter((s: { urls: string[] }) => s.urls.length);
          return json({ iceServers: servers, turn: true, via: "cloudflare" });
        }
      } catch (_) { /* coba cadangan */ }
    }
    if (mDom && mKey) {
      try {
        const r = await fetch(`https://${mDom}/api/v1/turn/credentials?apiKey=${encodeURIComponent(mKey)}`);
        if (r.ok) return json({ iceServers: [...stun, ...(await r.json())], turn: true, via: "metered" });
      } catch (_) { /* pakai STUN saja */ }
    }
    return json({ iceServers: stun, turn: false });
  }

  // 4) Kirim notifikasi ke anggota chat / kontak tertentu.
  if (body.action === "push") {
    const ids = new Set((members ?? []).map((m) => m.user_id));
    let targets: string[] = [];
    if (body.conv) {
      const { data: cm } = await admin.from("couple_conv_members").select("user_id,role").eq("conv_id", body.conv);
      const act = (cm ?? []).filter((x) => x.role !== "left").map((x) => x.user_id);
      if (!act.includes(user.id)) return json({ error: "Bukan anggota chat ini." }, 403);
      targets = act;
    } else if (body.to && body.to.length) {
      targets = body.to.filter((u) => ids.has(u));
      if (body.kind === "post") targets = targets.filter((u) => members!.find((m) => m.user_id === u)?.partner);
    } else {
      targets = (members ?? []).filter((m) => m.partner).map((m) => m.user_id);
    }
    const skip = new Set(body.skip ?? []);
    targets = targets.filter((u) => u !== user.id && !skip.has(u));
    if (!targets.length) return json({ sent: 0, devices: 0 });
    const k = await vapid();
    webpush.setVapidDetails("mailto:ravi@example.com", k.vapid_pub, k.vapid_priv);
    const { data: subs } = await admin.from("push_subs").select("endpoint,sub").in("user_id", targets);
    const payload = JSON.stringify({
      kind: body.kind ?? "msg",
      title: (body.title ?? me.name ?? "RaVi").slice(0, 80),
      body: (body.body ?? "").slice(0, 160),
      url: (body.url ?? "./?go=chat").slice(0, 200),
      tag: (body.tag ?? body.kind ?? "msg").slice(0, 40),
    });
    let sent = 0;
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(s.sub, payload, { TTL: body.kind === "call" ? 45 : 3600, urgency: "high" });
        sent++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await admin.from("push_subs").delete().eq("endpoint", s.endpoint);
      }
    }
    return json({ sent, devices: (subs ?? []).length });
  }

  // 5) Admin menambah anggota baru (akun dibuat dengan password sementara).
  if (body.action === "add_member") {
    if (me.role !== "admin") return json({ error: "Hanya admin RaVi yang bisa menambah anggota." }, 403);
    const email = String(body.email ?? "").trim().toLowerCase(), password = String(body.password ?? ""), name = String(body.name ?? "").trim().slice(0, 40);
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !name) return json({ error: "Email, nama, atau password (min. 8) tidak valid." }, 400);
    let uid: string | null = null;
    const { data: cu, error: cErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (cErr) {
      if (!/already|registered|exists/i.test(cErr.message)) return json({ error: cErr.message }, 400);
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      uid = list?.users?.find((u) => (u.email ?? "").toLowerCase() === email)?.id ?? null;
      if (!uid) return json({ error: cErr.message }, 400);
    } else uid = cu.user?.id ?? null;
    const { error: iErr } = await admin.from("couple_members").upsert({ user_id: uid, name }, { onConflict: "user_id", ignoreDuplicates: true });
    if (iErr) return json({ error: iErr.message }, 500);
    return json({ ok: true, user_id: uid });
  }

  return json({ error: "action tidak dikenal" }, 400);
});
