import Fastify from "fastify";
import cron from "node-cron";

const { GEMINI_API_KEY, TWITCH_CLIENT_ID, TWITCH_TOKEN, DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID } = process.env;
const app = Fastify({ logger: true });
app.get("/api/health", async () => ({ ok: true }));

async function helix(path, opts = {}) {
  const r = await fetch("https://api.twitch.tv/helix" + path, {
    ...opts,
    headers: {
      "Client-ID": TWITCH_CLIENT_ID,
      Authorization: "Bearer " + TWITCH_TOKEN,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  if (!r.ok) throw new Error("Twitch " + r.status + " : " + (await r.text()));
  return r.json();
}

app.post("/api/ai/chat", async (req) => {
  const { prompt } = req.body || {};
  if (!prompt) return { error: "prompt requis" };
  const context = `Tu es le copilote streaming de eurasia_ryuu, streameuse française (mannequin + gameuse, Dark Souls, Valorant, Just Chatting, identité anime dragonne au coucher de soleil). Réponds en français, concrètement, chaleureusement.`;
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: context + "\n\n" + prompt }] }] }),
  });
  const j = await r.json();
  return { text: j.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") || j.error?.message || "Pas de réponse" };
});

app.get("/api/twitch/user", async () => (await helix("/users")).data[0]);
app.get("/api/twitch/schedule", async () => { const u = await helix("/users"); return helix("/schedule?broadcaster_id=" + u.data[0].id); });
app.get("/api/twitch/videos", async () => { const u = await helix("/users"); return helix("/videos?user_id=" + u.data[0].id + "&first=8"); });
app.post("/api/twitch/title", async (req) => {
  const { title, game_id } = req.body || {};
  const u = await helix("/users");
  const body = {};
  if (title) body.title = title;
  if (game_id) body.game_id = game_id;
  await helix("/channels?broadcaster_id=" + u.data[0].id, { method: "PATCH", body: JSON.stringify(body) });
  return { ok: true };
});

async function postDiscord(content) {
  if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID) return;
  await fetch(`https://discord.com/api/v10/channels/${DISCORD_CHANNEL_ID}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bot " + DISCORD_BOT_TOKEN },
    body: JSON.stringify({ content }),
  });
}
cron.schedule("0 9 * * 1", async () => {
  try {
    const r = await fetch(`https://api.twitch.tv/helix/users`, { headers: { "Client-ID": TWITCH_CLIENT_ID, Authorization: "Bearer " + TWITCH_TOKEN } });
    const u = await r.json();
    const login = u.data[0]?.login || "la chaîne";
    await postDiscord(`📅 Résumé du lundi : le planning de ${login} est prêt — pensez à vos créneaux de la semaine ! 🐉`);
  } catch (e) { app.log.error(e); }
}, { timezone: "Europe/Paris" });

app.listen({ host: "0.0.0.0", port: 3000 });
