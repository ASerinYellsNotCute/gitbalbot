import { readConfig } from "../index";
import {
  Client,
  GatewayIntentBits,
  Events,
  Partials,
  REST,
  Routes,
  User,
  MessageReaction,
} from "discord.js";
import { slashCommand, slashCommandExecute } from "./DiscordCommandManager";

const handleReaction = async (
  reaction: MessageReaction,
  user: User,
  addReaction: boolean
): Promise<void> => {
  if (!user.bot) {
    try {
      const messageReaction = await reaction.fetch();
      const message = await messageReaction.message.fetch();

      if (message.id === "1190961325631864872") {
        let roleId: string | undefined;

        switch (reaction.emoji.id) {
          case "1152259238886907985":
            roleId = "1152280352728027246";
            break;
          case "1152259269312397403":
            roleId = "1152280449796816906";
            break;
          case "1190990674552692826":
            roleId = "1189141946942369812";
            break;
        }

        if (roleId !== undefined) {
          const role = await message.guild!.roles.fetch(roleId);
          const member = await message.guild!.members.fetch(user.id);

          if (addReaction) {
            try {
              member!.roles.add(role!);
            } catch (error) {
              console.error("Something went wrong when adding a role:", error);
            }
          } else {
            try {
              member!.roles.remove(role!);
            } catch (error) {
              console.error(
                "Something went wrong when removing a role:",
                error
              );
            }
          }
        }
      }
    } catch (error) {
      console.error("Something went wrong when fetching the message:", error);
    }
  }
};

async function botMain(): Promise<void> {
  const token = await readConfig("token");
  const rest = new REST().setToken(token);

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildPresences,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
  });

  client.on(Events.ClientReady, async () => {
    const guild = await client.guilds.fetch("936534941985013830");

    client.application!!.commands.create(slashCommand, guild.id);

    try {
      await rest.put(
        Routes.applicationGuildCommands("1152253582175903844", guild.id),
        {
          body: [slashCommand.toJSON()],
        }
      );
    } catch (error) {
      console.error(error);
    }

    console.log("Discord bot is ready");
  });

  client.on(Events.MessageReactionAdd, async (reaction, user) => {
    if (!reaction.partial && !user.partial)
      handleReaction(reaction, user, true);
  });

  client.on(Events.MessageReactionRemove, async (reaction, user) => {
    if (!reaction.partial && !user.partial)
      handleReaction(reaction, user, false);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.application!!.commands.fetch(interaction.commandId);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await slashCommandExecute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  });

  client.login(token);
}

export { botMain };
