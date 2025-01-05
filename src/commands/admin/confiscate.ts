import { ChatInputCommandInteraction } from 'discord.js';
import { UserService } from '../../services/userService';
import { createAdminActionEmbed } from '../../utils/embeds';
import { log } from '../../utils/logger';

export async function handleConfiscateCommand(
  interaction: ChatInputCommandInteraction,
  userService: UserService
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (targetUser.bot) {
      throw new Error('Cannot confiscate coins from a bot');
    }

    if (targetUser.id === interaction.user.id) {
      throw new Error('Cannot confiscate your own coins');
    }

    const confiscatedAmount = await userService.confiscateCoins(
      interaction.user.id,
      targetUser.id,
      reason
    );

    const embed = createAdminActionEmbed(
      '🚫 Coins Confiscated',
      `Successfully confiscated ${confiscatedAmount} coins from ${targetUser.toString()}\nReason: ${reason}`
    );

    log.systemAction('Coins confiscated', {
      adminId: interaction.user.id,
      targetUserId: targetUser.id,
      amount: confiscatedAmount,
      reason
    });

    await interaction.editReply({
      embeds: [embed]
    });
  } catch (error) {
    throw error;
  }
}