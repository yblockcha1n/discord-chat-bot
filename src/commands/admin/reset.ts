import { ChatInputCommandInteraction } from 'discord.js';
import { UserService } from '../../services/userService';
import { createAdminActionEmbed } from '../../utils/embeds';
import { log } from '../../utils/logger';

export async function handleResetCommand(
  interaction: ChatInputCommandInteraction,
  userService: UserService
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    // 確認コードの検証
    const confirmCode = interaction.options.getString('confirm_code', true);
    if (confirmCode !== 'RESET_ALL_CONFIRM') {
      throw new Error('Invalid confirmation code. Use RESET_ALL_CONFIRM to proceed.');
    }

    const resetCount = await userService.resetAllCoins(interaction.user.id);

    const embed = createAdminActionEmbed(
      '🚨 System Reset',
      `Successfully reset all users' coin balance to 0.\nAffected users: ${resetCount}`
    );

    log.systemAction('All coins reset', {
      adminId: interaction.user.id,
      affectedUsers: resetCount
    });

    await interaction.editReply({
      embeds: [embed]
    });
  } catch (error) {
    throw error;
  }
}