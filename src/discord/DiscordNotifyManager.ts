import { WebhookClient } from "discord.js";
import { debug } from "../index";

async function notify(
  platform: string,
  id: string,
  offline?: boolean,
) {
  const youtubeWebhook = debug
    ? new WebhookClient({
        id: "1171013784576458774",
        token:
          "VA7pebh2wHt2EB81MjMGB9humP4cYwFQ0Mjy8Cduk6FHg7C2W6U_j4mcFmMRNtsv9c64",
      })
    : new WebhookClient({
        id: "1152256836599304313",
        token:
          "n9iBS6kOuk3y6sUx05q6GzE5JLdG_u4JU96EvfpVBstUsT4h7NdDsM5Dt0FVUyJoS-DN",
      });
  const twitchWebhook = debug
    ? new WebhookClient({
        id: "1171013786380021822",
        token:
          "DdAmMUPjW0SFPmMN-ELiNDxwpKRPiPVdb6yB2o7dOUFaGzJQGn9LVdw5FhCtMxJ3jTkE",
      })
    : new WebhookClient({
        id: "1152256927238201354",
        token:
          "lHXsDEkCa6SImm3vIzI-5yXncB-ca8aE_3Ayx6b8LEKBw6Q95ARIIGpOvWTOjqUQu3jb",
      });

  if (platform == "youtube") {
    const ping = debug ? "" : "<@&1152280352728027246> ";
    await youtubeWebhook.send({
      content:
        ping +
        `플래그의 새 영상이 업로드되었습니다! ˖ ࣪‧₊˚⋆✩٩(ˊᗜˋ*)و ✩\n\n**[영상 보러가기](https://youtu.be/${id})**`,
    });
  } else if (platform == "twitch") {
    const isLive = offline ? "종료" : "시작";
    const ping = debug ? "" : offline ? "" : "<@&1152280449796816906> ";

    await twitchWebhook.send({
      content:
        ping +
        "플래그의 방송이 " +
        isLive +
        "되었습니다! ˖ ࣪‧₊˚⋆✩٩(ˊᗜˋ*)و ✩" +
        !offline
          ? `\n\n**[방송 보러가기](https://twitch.tv/${id})**`
          : "오뱅알!",
    });
  }
}

export { notify };
