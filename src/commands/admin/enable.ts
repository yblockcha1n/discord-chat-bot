import { ChatInputCommandInteraction } from 'discord.js';
import { UserService } from '../../services/userService';
import { createAdminActionEmbed } from '../../utils/embeds';
import { log } from '../../utils/logger';

export async function handleEnableCommand(
  interaction: ChatInputCommandInteraction,
  userService: UserService
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const targetUser = interaction.options.getUser('user', true);

    if (targetUser.bot) {
      throw new Error('You cannot enable/disable a bot');
    }

    if (targetUser.id === interaction.user.id) {
      throw new Error('You cannot enable/disable yourself');
    }

    await userService.enableUser(
      interaction.user.id,
      targetUser.id
    );

    const embed = createAdminActionEmbed(
      'User Enabled',
      `Successfully enabled ${targetUser.toString()} to use Pizza coins`
    );

    log.userAction('User enabled', interaction.user.id, {
      targetUserId: targetUser.id
    });

    await interaction.editReply({
      embeds: [embed]
    });
  } catch (error) {
    throw error;
  }
}