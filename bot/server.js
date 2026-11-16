import { Client, GatewayIntentBits } from "discord.js";

const { DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID, TWITCH_CLIENT_ID, TWITCH_TOKEN } = process.env;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const API = "http://backend:3000";

client.once("ready", async () => {
  console.log("Bot Discord prêt");
  if (DISCORD_CHANNEL_ID) {
    const ch = await client.channels.fetch(DISCORD_CHANNEL_ID).catch(() => null);
    if (ch) await ch.send("Le nid de Ryuu est en ligne 🐉");
  }
  startLivePolling();
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  const c = msg.content.trim();
  if (c === "!planning") {
    const r = await fetch(`${API}/api/twitch/schedule`).then(r => r.json()).catch(() => null);
    const segs = r?.data?.segments || [];
    if (!segs.length) return msg.reply("Aucun créneau programmé pour l'instant. Ajoute-le dans le Copilote !");
    const lines = segs.map(s => `• ${new Date(s.start_time).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} — ${s.title} (${s.duration} min)`);
    return msg.reply("📅 Créneaux à venir :\n" + lines.join("\n"));
  }
  if (c === "!titre" || c === "!bio") {
    const prompt = c === "!titre"
      ? "Propose 5 titres de stream Twitch accrocheurs pour cette semaine (2 Dark Souls, 2 Valorant, 1 Just Chatting), courts et en français."
      : "Rédige une bio Twitch courte et personnelle pour eurasia_ryuu, chaleureuse, avec sa vibe mannequin + gameuse + dragon.";
    const r = await fetch(`${API}/api/ai/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) }).then(r => r.json()).catch(() => null);
    return msg.reply(r?.text || "Le copilote IA est indisponible pour l'instant.");
  }
});

let wasLive = false;
async function startLivePolling() {
  if (!DISCORD_CHANNEL_ID) return;
  setInterval(async () => {
    try {
      const u = await fetch("https://api.twitch.tv/helix/users", { headers: { "Client-ID": TWITCH_CLIENT_ID, Authorization: "Bearer " + TWITCH_TOKEN } }).then(r => r.json());
      const login = u.data[0].login;
      const s = await fetch(`https://api.twitch.tv/helix/streams?user_login=${login}`, { headers: { "Client-ID": TWITCH_CLIENT_ID, Authorization: "Bearer " + TWITCH_TOKEN } }).then(r => r.json());
      const live = (s.data || []).length > 0;
      if (live && !wasLive) {
        const ch = await client.channels.fetch(DISCORD_CHANNEL_ID).catch(() => null);
        if (ch) await ch.send(`🔴 **${login} est en live !** Viens te poser : https://twitch.tv/${login} 🐉`);
      }
      wasLive = live;
    } catch (e) { console.error("polling:", e.message); }
  }, 120000);
}

client.login(DISCORD_BOT_TOKEN);
