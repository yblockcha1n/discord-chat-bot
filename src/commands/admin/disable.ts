import { ChatInputCommandInteraction } from 'discord.js';

import { UserService } from '../../services/userService';
import { createAdminActionEmbed } from '../../utils/embeds';

export async function handleDisableCommand(
  interaction: ChatInputCommandInteraction,
  userService: UserService
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const targetUser = interaction.options.getUser('user', true);

    if (targetUser.bot) {
      throw new Error('You cannot disable a bot');
    }

    if (targetUser.id === interaction.user.id) {
      throw new Error('You cannot disable yourself');
    }

    await userService.disableUser(
      interaction.user.id,
      targetUser.id
    );

    const embed = createAdminActionEmbed(
      'User Disabled',
      `Successfully disabled ${targetUser.toString()} from using Pizza coins`
    );

    await interaction.editReply({
      embeds: [embed]
    });
  } catch (error) {
    throw error;
  }
}