import { 
  ChatInputCommandInteraction,
  SlashCommandBuilder
} from 'discord.js';

import { UserService } from '../services/userService';
import { handleBalanceCommand } from './balance';
import { handleSendCommand } from './send';
import { handleLeaderboardCommand } from './leaderboard';
import { handleDisableCommand } from './admin/disable';
import { handleEnableCommand } from './admin/enable';
import { handleSetRateCommand } from './admin/setRate';
import { handleResetCommand } from './admin/reset';
import { handleConfiscateCommand } from './admin/confiscate';
import { createErrorEmbed } from '../utils/embeds';

export const commands = [
  new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your Pizza coin balance')
    .toJSON(),

  new SlashCommandBuilder()
    .setName('send')
    .setDescription('Send Pizza coins to another user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to send coins to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of coins to send')
        .setRequired(true)
        .setMinValue(1)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Show Pizza coin leaderboard')
    .addIntegerOption(option =>
      option
        .setName('page')
        .setDescription('Page number')
        .setMinValue(1)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName('admin-disable')
    .setDescription('Disable a user from using Pizza coins')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to disable')
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName('admin-enable')
    .setDescription('Enable a disabled user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to enable')
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName('admin-set-rate')
    .setDescription('Set coins earned per message')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Amount of coins per message')
        .setRequired(true)
        .setMinValue(1)
    )
    .toJSON(),

  new SlashCommandBuilder()
  .setName('admin-reset-all')
  .setDescription('Reset all users coin balance to 0')
  .addStringOption(option =>
    option
      .setName('confirm_code')
      .setDescription('Type RESET_ALL_CONFIRM to proceed')
      .setRequired(true)
  )
  .toJSON(),

  new SlashCommandBuilder()
    .setName('admin-confiscate')
    .setDescription('Confiscate all coins from a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to confiscate coins from')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for confiscation')
    )
    .toJSON(),
];

export async function handleCommand(
  interaction: ChatInputCommandInteraction,
  userService: UserService
): Promise<void> {
  try {
    switch (interaction.commandName) {
      case 'balance':
        await handleBalanceCommand(interaction, userService);
        break;

      case 'send':
        await handleSendCommand(interaction, userService);
        break;

      case 'leaderboard':
        await handleLeaderboardCommand(interaction, userService);
        break;

      case 'admin-disable':
        await handleDisableCommand(interaction, userService);
        break;

      case 'admin-enable':
        await handleEnableCommand(interaction, userService);
        break;

      case 'admin-set-rate':
        await handleSetRateCommand(interaction, userService);
        break;

      case 'admin-reset-all':
        await handleResetCommand(interaction, userService);
        break;

      case 'admin-confiscate':
        await handleConfiscateCommand(interaction, userService);
        break;

      default:
        await interaction.reply({
          embeds: [createErrorEmbed(new Error('Unknown command'))],
          ephemeral: true
        });
    }
  } catch (error) {
    throw error;
  }
}