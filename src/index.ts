import { 
  Client, 
  Events, 
  GatewayIntentBits,
  ChatInputCommandInteraction,
  InteractionReplyOptions,
  MessageFlags
} from 'discord.js';
import { config } from 'dotenv';

import { PizzaCoinError, UserDisabledError } from './types';
import { SupabaseClient } from './infrastructure/supabase';
import { UserService } from './services/userService';
import { handleCommand } from './commands';
import { validateEnvironment } from './utils/validators';
import { commands } from './commands';
import { log } from './utils/logger';

config();
const env = validateEnvironment(process.env);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const supabase = new SupabaseClient(env.SUPABASE_URL, env.SUPABASE_KEY);
const userService = new UserService(supabase);

client.once(Events.ClientReady, async (c) => {
  log.startup(`Bot is ready! Logged in as ${c.user.tag}`);
  
  try {
    await client.application?.commands.set(commands);
    log.systemAction('Application commands registered successfully');
  } catch (error) {
    log.error('Failed to register application commands', { error });
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  try {
    const config = await supabase.getConfig();
    await userService.addCoins(message.author.id, config.coinsPerMessage);
    log.debug(`Coins added to user`, {
      userId: message.author.id,
      amount: config.coinsPerMessage
    });
  } catch (error) {
    if (error instanceof UserDisabledError) {
      log.debug(`Skipped coin addition: disabled user`, {
        userId: message.author.id
      });
    } else {
      log.error('Failed to add coins', { error });
    }
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    log.command(interaction.commandName, interaction.user.id, {
      options: interaction.options.data
    });

    await handleCommand(interaction as ChatInputCommandInteraction, userService);
  } catch (error) {
    log.error('Command execution failed', {
      command: interaction.commandName,
      userId: interaction.user.id,
      error
    });

    const errorMessage = error instanceof PizzaCoinError
      ? error.message
      : 'An unexpected error occurred. Please try again later.';

    const replyOptions: InteractionReplyOptions = {
      content: `❌ ${errorMessage}`,
      flags: MessageFlags.Ephemeral
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyOptions);
    } else {
      await interaction.reply(replyOptions);
    }
  }
});

async function shutdown() {
  log.shutdown('Initiating graceful shutdown...');
  
  if (client.isReady()) {
    await client.destroy();
    log.shutdown('Discord client destroyed');
  }

  log.shutdown('Shutdown complete');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

process.on('unhandledRejection', (error) => {
  log.error('Unhandled promise rejection', { error });
});

process.on('uncaughtException', (error) => {
  log.error('Uncaught exception', { error });
  shutdown().catch((error) => {
    log.error('Error during shutdown', { error });
    process.exit(1);
  });
});

client.login(env.DISCORD_TOKEN).catch((error) => {
  log.error('Failed to login', { error });
  process.exit(1);
});