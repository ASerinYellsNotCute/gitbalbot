import { pubsub } from "./pubsub/pubsub";
import fs from "fs/promises";
import { twitch } from "./twitch/TwitchManager";
import { botMain } from "./discord/DiscordManager";
import { argv } from "process";

let debug: boolean;

async function readConfig(key: string): Promise<string> {
  try {
    const rawData: string = await fs.readFile("./config.json", "utf8");
    const config: Record<string, string> = JSON.parse(rawData);
    return config[key];
  } catch (error) {
    console.error("Error reading config.json:", error);
    return "";
  }
}

async function main() {
  debug = argv[2] == "--debug";

  if (debug) {
    console.log("Debug mode enabled.");
  }

  pubsub();
  twitch();
  botMain();
}

main();

export { readConfig, debug };
