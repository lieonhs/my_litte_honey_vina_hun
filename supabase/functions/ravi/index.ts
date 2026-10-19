// Edge Function "ravi": notifikasi push (Web Push) + server TURN untuk telepon.
// Deploy: Supabase → Edge Functions → Deploy a new function → Via Editor → nama: ravi → paste file ini → Deploy.
// Opsional (untuk telepon di jaringan yang ketat): set secrets CF_TURN_KEY_ID dan CF_TURN_API_TOKEN.
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

  // 1) Hanya user yang login dan terdaftar sebagai pasangan.
  const auth = req.headers.get("Authorization") ?? "";
  const supa = createClient(URL_, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return json({ error: "Harus login." }, 401);
  const { data: members, error: mErr } = await admin.from("couple_members").select("user_id,name");
  if (mErr) return json({ error: "Jalankan setup-ravi.sql dulu: " + mErr.message }, 500);
  const me = members?.find((m) => m.user_id === user.id);
  if (!me) return json({ error: "Akun ini bukan anggota pasangan." }, 403);

  let body: { action?: string; kind?: string; title?: string; body?: string; url?: string; tag?: string };
  try { body = await req.json(); } catch { return json({ error: "Body bukan JSON." }, 400); }

  // 2) Kunci publik untuk berlangganan notifikasi.
  if (body.action === "vapid") {
    const k = await vapid();
    return json({ publicKey: k.vapid_pub });
  }

  // 3) Server ICE (STUN + TURN Cloudflare bila diset).
  if (body.action === "ice") {
    const stun = [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }];
    const id = Deno.env.get("CF_TURN_KEY_ID"), tok = Deno.env.get("CF_TURN_API_TOKEN");
    if (!id || !tok) return json({ iceServers: stun, turn: false });
    try {
      const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${id}/credentials/generate-ice-servers`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ttl: 86400 }),
      });
      if (!r.ok) return json({ iceServers: stun, turn: false, error: "Cloudflare TURN " + r.status });
      const j = await r.json();
      // Port 53 diblokir browser → buang supaya tidak menunggu timeout.
      const servers = (j.iceServers ?? []).map((s: { urls: string | string[]; username?: string; credential?: string }) => ({
        ...s, urls: (Array.isArray(s.urls) ? s.urls : [s.urls]).filter((u) => !/:53(\?|$)/.test(u)),
      })).filter((s: { urls: string[] }) => s.urls.length);
      return json({ iceServers: servers, turn: true });
    } catch (e) {
      return json({ iceServers: stun, turn: false, error: String(e) });
    }
  }

  // 4) Kirim notifikasi ke HP pasangan.
  if (body.action === "push") {
    const k = await vapid();
    webpush.setVapidDetails("mailto:ravi@example.com", k.vapid_pub, k.vapid_priv);
    const others = (members ?? []).filter((m) => m.user_id !== user.id).map((m) => m.user_id);
    const { data: subs } = await admin.from("push_subs").select("endpoint,sub").in("user_id", others);
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

  return json({ error: "action tidak dikenal" }, 400);
});
