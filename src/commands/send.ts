import { ChatInputCommandInteraction, TextChannel } from 'discord.js';

import { UserService } from '../services/userService';
import { createTransferEmbed, createTransactionLogEmbed } from '../utils/embeds';
import { validateCoinAmount } from '../utils/validators';
import { validateEnvironment } from '../utils/validators';

export async function handleSendCommand(
  interaction: ChatInputCommandInteraction,
  userService: UserService
): Promise<void> {
  await interaction.deferReply();

  try {
    const targetUser = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);

    if (targetUser.id === interaction.user.id) {
      throw new Error('You cannot send coins to yourself');
    }

    if (targetUser.bot) {
      throw new Error('You cannot send coins to a bot');
    }

    validateCoinAmount(amount);

    await userService.transferCoins(
      interaction.user.id,
      targetUser.id,
      amount
    );

    const successEmbed = createTransferEmbed(
      interaction.user,
      targetUser,
      amount
    );

    await interaction.editReply({
      embeds: [successEmbed]
    });

    try {
      const env = validateEnvironment(process.env);
      const logChannel = await interaction.client.channels.fetch(
        env.TRANSACTION_LOG_CHANNEL_ID
      ) as TextChannel;

      if (logChannel?.isTextBased()) {
        const logEmbed = createTransactionLogEmbed(
          interaction.user,
          targetUser,
          amount
        );

        await logChannel.send({
          embeds: [logEmbed]
        });
      }
    } catch (error) {
      console.error('Failed to send transaction log:', error);
    }
  } catch (error) {
    throw error;
  }
}