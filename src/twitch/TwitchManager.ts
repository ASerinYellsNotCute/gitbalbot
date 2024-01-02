import { ApiClient } from "@twurple/api";
import { readConfig } from "../index";
import { notify } from "../discord/DiscordNotifyManager";
import { AppTokenAuthProvider } from "@twurple/auth";
import { debug } from "../index";
import express from "express";
import {
  EventSubMiddleware,
  EventSubHttpListener,
} from "@twurple/eventsub-http";
import { NgrokAdapter } from "@twurple/eventsub-ngrok";
import { EventSubStreamOnlineEvent } from "@twurple/eventsub-base";

const POLL_INTERVAL = 15000;
const PORT_NUMBER = 13669;

const streamCallback = async (e: EventSubStreamOnlineEvent) => {
  const notifyStream = async () => {
    const stream = await e.getStream();

    if (stream !== null) {
      notify("twitch", e.broadcasterName, false);
    } else {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      await notifyStream();
    }
  };

  await notifyStream();
};

async function twitch(): Promise<void> {
  const userId: string = debug ? "224932651" : "717454625";

  const clientId: string = await readConfig("clientId");
  const clientSecret: string = await readConfig("clientSecret");

  const authProvider = new AppTokenAuthProvider(clientId, clientSecret);
  const apiClient = new ApiClient({ authProvider });
  const secret = "therandomstringthatyouhaveneverheardof";

  await apiClient.eventSub.deleteAllSubscriptions();

  if (debug) {
    const listener = new EventSubHttpListener({
      apiClient,
      adapter: new NgrokAdapter(),
      secret: secret,
    });

    listener.onStreamOnline(userId, streamCallback);
    listener.onStreamOffline(userId, (e) =>
      notify("twitch", e.broadcasterName, true)
    );

    listener.start();
  } else {
    const app = express();

    const middleware = new EventSubMiddleware({
      apiClient,
      hostName: "serinchan.me",
      pathPrefix: "/hattachitwitch",
      secret: secret,
    });

    middleware.apply(app);

    app.listen(PORT_NUMBER, async () => {
      await middleware.markAsReady();
      console.log("Twitch EventSub server is running");

      middleware.onStreamOnline(userId, streamCallback);
      middleware.onStreamOffline(userId, (e) =>
        notify("twitch", e.broadcasterName, true)
      );
    });
  }
}

export { twitch };
