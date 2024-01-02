import fs from "fs/promises";
import axios from "axios";
import { debug, readConfig } from "../index";
import bodyParserXml from "body-parser-xml";
import bodyParser from "body-parser";
import express from "express";
import { notify } from "../discord/DiscordNotifyManager";

const app = express();

async function checkTimeStamp(
  newTimeStamp: number,
  channelId: string
): Promise<boolean> {
  try {
    const timestampData = await fs.readFile(
      `./timestamps/timestamp-${channelId}.txt`,
      "utf-8"
    );
    const existingTimeStamp = parseInt(timestampData, 10);

    if (newTimeStamp > existingTimeStamp) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("[ERROR/PUBSUB] Error reading timestamp.txt:", error);
    return false;
  }
}

async function serverMain() {
  bodyParserXml(bodyParser);

  app.use(bodyParser.xml());

  app.get("/", (req, res) => {
    const challenge = req.query["hub.challenge"];

    if (challenge) {
      res.status(200).send(challenge);
    } else {
      res.status(200).send("");
    }
  });

  app.post("/", async (req, res) => {
    const parsedBody = req.body;

    try {
      const videoId = parsedBody.feed.entry[0]["yt:videoId"][0];
      const channelId = parsedBody.feed.entry[0]["yt:channelId"][0];
      const published = parsedBody.feed.entry[0].published[0];
      const title = parsedBody.feed.entry[0].title[0];

      const pubDate = Date.parse(published);

      if (!(await checkTimeStamp(pubDate, channelId))) return;
      await notify("youtube", videoId);
      await fs.writeFile(
        `./timestamps/timestamp-${channelId}.txt`,
        pubDate.toString(),
        "utf-8"
      );
    } catch (error) {
      console.error("[ERROR/PUBSUB] Error parsing body:", error);
    }

    res.status(200).send("OK");
  });

  app.use((_, res) => {
    res.status(400).send("Bad request");
  });

  app.listen(8888, () => {
    console.log("[INFO] PubSubHubbub is running on port", 8888);
  });
}

async function pubsub() {
  const currentTimestamp = Date.now();
  const debugIp = await readConfig("debugIp");

  try {
    await fs.access("timestamps");
  } catch (error) {
    await fs.mkdir("timestamps");
  }

  serverMain();

  const channelIds = debug
    ? ["UCkZzDzsNHj1Ow0ynrMRbJlA"]
    : ["UC2eGI7us9gmMahbByyPnTwg", "UCvGEIjIvOkrKnUAf05t6b2w"];

  channelIds.forEach(async (channelId, index) => {
    await fs.writeFile(
      `./timestamps/timestamp-${channelId}.txt`,
      currentTimestamp.toString(),
      "utf-8"
    );

    const topic = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;
    const hub = "https://pubsubhubbub.appspot.com/";

    const subscribe = async () => {
      await axios.post(
        hub,
        {
          "hub.callback": debug
            ? `http://${debugIp}:8888`
            : "https://serinchan.me/hattachicallback",
          "hub.mode": "subscribe",
          "hub.topic": topic,
          "hub.verify": "async",
          "hub.verify_token": "",
          "hub.secret": "",
          "hub.lease_seconds": "828000",
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (debug) {
        console.log(`[PubSub] Subscribed ${channelId}`);
      }

      setInterval(async () => subscribe(), 828000 * 1000);
    };

    const delayTime = index * 1000;
    setTimeout(subscribe, delayTime);
  });
}

export { pubsub };
