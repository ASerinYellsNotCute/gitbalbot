import { debug } from "../index";
import { SlashCommandBuilder } from "@discordjs/builders";
import {
  ChatInputCommandInteraction,
  GuildMember,
  WebhookClient,
} from "discord.js";

const slashCommand = new SlashCommandBuilder()
  .setName("youtube")
  .setDescription("유튜브 영상 알림을 보냅니다.")
  .addStringOption((option) =>
    option
      .setName("url")
      .setDescription("알림에 포함될 영상의 URL을 입력해주세요.")
      .setRequired(true)
  );

const slashCommandExecute = async (
  interaction: ChatInputCommandInteraction
) => {
  const member = interaction.member as GuildMember;
  let url = interaction.options.getString("url");

  if (
    !(
      member.id in
      ["1049682162468802571", "1072144162335502416", "294146247512555521"]
    )
  ) {
    await interaction.reply({
      content: ":x: 권한이 없습니다!",
      ephemeral: true,
    });
    return;
  }

  if (
    url !== null &&
    (url.startsWith("https://www.youtube.com/watch?v=") ||
      url.startsWith("https://youtu.be/"))
  ) {
    if (url.startsWith("https://www.youtube.com/watch?v=")) {
      url = url.split("&")[0];
    } else if (url.startsWith("https://youtu.be/")) {
      url = url.split("?")[0];
    }

    await interaction.reply({
      content: ":white_check_mark:",
      ephemeral: true,
    });

    const ping = debug ? "" : "<@&1152280352728027246>";

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

    youtubeWebhook.send({
      content:
        ping +
        `\n플래그의 새 영상이 업로드되었습니다! ˖ ࣪‧₊˚⋆✩٩(ˊᗜˋ*)و ✩\n\n**[영상 보러가기](${url})**`,
    });
  } else {
    await interaction.reply({
      content:
        ":x: 올바른 URL을 입력해주세요! `https://www.youtube.com/watch?v=` 또는 `https://youtu.be/`로 시작해야 합니다.",
      ephemeral: true,
    });
    return;
  }
};

export { slashCommand, slashCommandExecute };
