import { ChatInputCommandInteraction } from 'discord.js';

import { UserService } from '../../services/userService';
import { createAdminActionEmbed } from '../../utils/embeds';
import { validateCoinAmount } from '../../utils/validators';

export async function handleSetRateCommand(
  interaction: ChatInputCommandInteraction,
  userService: UserService
): Promise<void> {
  await interaction.deferReply({ ephemeral: true });

  try {
    const amount = interaction.options.getInteger('amount', true);
    validateCoinAmount(amount);

    await userService.updateCoinsPerMessage(
      interaction.user.id,
      amount
    );

    const embed = createAdminActionEmbed(
      'Rate Updated',
      `Successfully updated coins per message to ${amount} Pizza coins`
    );

    await interaction.editReply({
      embeds: [embed]
    });
  } catch (error) {
    throw error;
  }
}