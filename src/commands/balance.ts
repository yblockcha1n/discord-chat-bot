import { CommandInteraction } from 'discord.js';

import { UserService } from '../services/userService';
import { createBalanceEmbed } from '../utils/embeds';

/**
 * balanceコマンドのハンドラー
 * ユーザーの保有するPizzaコインの残高を表示
 */
export async function handleBalanceCommand(
  interaction: CommandInteraction,
  userService: UserService
): Promise<void> {
  // コマンドの実行を遅延
  await interaction.deferReply();

  try {
    // ユーザー情報の取得
    const user = await userService.ensureUser(interaction.user.id);

    // 埋め込みメッセージの作成と送信
    const embed = createBalanceEmbed(interaction.user, user.pizzaCoins);
    
    await interaction.editReply({
      embeds: [embed]
    });
  } catch (error) {
    // エラーは上位で処理するために再スロー
    throw error;
  }
}