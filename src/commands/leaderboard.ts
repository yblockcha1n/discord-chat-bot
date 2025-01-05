import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { UserService } from '../services/userService';
import { log } from '../utils/logger';

export async function handleLeaderboardCommand(
  interaction: ChatInputCommandInteraction,
  userService: UserService
): Promise<void> {
  await interaction.deferReply();

  try {
    const page = interaction.options.getInteger('page') || 1;
    const leaderboard = await userService.getLeaderboard(page);

    if (leaderboard.users.length === 0) {
      throw new Error('No users found in the leaderboard');
    }

    // リーダーボードの埋め込みメッセージを作成
    const embed = new EmbedBuilder()
      .setColor('#FFD700') // Gold color
      .setTitle('🏆 Pizza Coin Leaderboard')
      .setDescription('Top Pizza coin holders')
      .setTimestamp();

    // ユーザー情報を追加
    const leaderboardText = await Promise.all(
      leaderboard.users.map(async (user, index) => {
        const rank = (page - 1) * 10 + index + 1;
        const discordUser = await interaction.client.users.fetch(user.id);
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '📍';
        return `${medal} **${rank}.** ${discordUser.toString()} - ${user.pizzaCoins.toLocaleString()} coins`;
      })
    );

    embed.addFields({ 
      name: `Page ${page}/${Math.ceil(leaderboard.total / 10)}`,
      value: leaderboardText.join('\n')
    });

    // 総統計を追加
    embed.setFooter({
      text: `Total Users: ${leaderboard.total} | Total Coins: ${leaderboard.totalCoins.toLocaleString()}`
    });

    log.info('Leaderboard displayed', {
      page,
      totalUsers: leaderboard.total
    });

    await interaction.editReply({
      embeds: [embed]
    });
  } catch (error) {
    throw error;
  }
}