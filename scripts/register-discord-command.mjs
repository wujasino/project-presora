#!/usr/bin/env node
/**
 * One-time (or re-run whenever /announce's options change) registration of
 * the guild-scoped /announce slash command. Guild-scoped commands show up
 * on that one server within seconds — unlike a global command registration,
 * which can take up to an hour to propagate everywhere.
 *
 * Usage:
 *   DISCORD_APPLICATION_ID=... DISCORD_BOT_TOKEN=... node scripts/register-discord-command.mjs
 *
 * Never commit real values for these — pass them as env vars on the
 * command line (or export them in your shell for this one run) so the bot
 * token never ends up in shell history files or source control.
 */

const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = '1462455173023793276';

if (!APPLICATION_ID || !BOT_TOKEN) {
  console.error('Set DISCORD_APPLICATION_ID and DISCORD_BOT_TOKEN in your environment first.');
  process.exit(1);
}

const command = {
  name: 'announce',
  description: 'Broadcast a notification to Presora accounts',
  options: [
    { name: 'title', description: 'Notification title', type: 3, required: true },
    { name: 'message', description: 'Notification body', type: 3, required: true },
    {
      name: 'plans',
      description: 'Comma-separated: Free,Starter,Solo,Business,Agency — blank = everyone',
      type: 3,
      required: false,
    },
    {
      name: 'hide_after_days',
      description: 'Auto-hide from the notification bell after this many days',
      type: 4,
      required: false,
    },
  ],
};

const res = await fetch(
  `https://discord.com/api/v10/applications/${APPLICATION_ID}/guilds/${GUILD_ID}/commands`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${BOT_TOKEN}`,
    },
    body: JSON.stringify(command),
  }
);

const body = await res.json();
if (!res.ok) {
  console.error('Failed to register command:', res.status, body);
  process.exit(1);
}
console.log('Registered /announce on the guild. Command id:', body.id);
