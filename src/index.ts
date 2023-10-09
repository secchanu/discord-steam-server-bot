import { config } from "dotenv";
config();

import { ActivityType, Client } from "discord.js";
import { queryGameServerInfo, queryGameServerPlayer } from "steam-server-query";

const serverHost = process.env.SERVER_HOST ?? "";
const serverPort = parseInt(`${process.env.SERVER_PORT}`) || 27015;
const gameServer = `${serverHost}:${serverPort}`;
console.log(gameServer);

const getServer = async () => {
	const res = await queryGameServerInfo(gameServer).catch(() => {});
	return res;
};

const getPlayers = async () => {
	const res = await queryGameServerPlayer(gameServer).catch(() => {});
	const players = res?.players?.filter((p) => p.name) ?? [];
	return players;
};

const client = new Client({ intents: [] });
const updateStatus = async () => {
	const user = client.user;
	if (!user) return;
	const server = await getServer();
	if (server) {
		const players = await getPlayers();
		user.setPresence({
			activities: [
				{
					name: `${players.length}人が${server.map}`,
					type: ActivityType.Playing,
				},
			],
			status: players.length ? "online" : "idle",
		});
	} else {
		user.setPresence({
			status: "dnd",
			activities: [{ name: `サーバーオフライン`, type: ActivityType.Custom }],
		});
	}
};
(async () => {
	await client.login(process.env.DISCORD_TOKEN);
	setInterval(updateStatus, 5 * 60 * 1000);
	updateStatus();
})();
