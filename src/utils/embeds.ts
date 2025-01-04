import { EmbedBuilder, User } from 'discord.js';

/**
 * 残高確認用の埋め込みメッセージを作成
 */
export function createBalanceEmbed(user: User, coins: number): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('🍕 Pizza Coin Balance')
    .setDescription(`${user.toString()} has ${coins} Pizza coins`)
    .setTimestamp();
}

/**
 * コイン送信用の埋め込みメッセージを作成
 */
export function createTransferEmbed(
  sender: User,
  receiver: User,
  amount: number
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#32CD32')
    .setTitle('🍕 Pizza Coin Transfer')
    .setDescription(
      `${sender.toString()} sent ${amount} Pizza coins to ${receiver.toString()}`
    )
    .setTimestamp();
}

/**
 * 取引記録用の埋め込みメッセージを作成
 */
export function createTransactionLogEmbed(
  sender: User,
  receiver: User,
  amount: number
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#4169E1')
    .setTitle('🍕 Transaction Record')
    .addFields(
      { name: 'Sender', value: sender.toString(), inline: true },
      { name: 'Receiver', value: receiver.toString(), inline: true },
      { name: 'Amount', value: `${amount} Pizza coins`, inline: true }
    )
    .setTimestamp();
}

/**
 * 管理者アクション用の埋め込みメッセージを作成
 */
export function createAdminActionEmbed(
  title: string,
  description: string
): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle(`👮 ${title}`)
    .setDescription(description)
    .setTimestamp();
}

/**
 * エラー用の埋め込みメッセージを作成
 */
export function createErrorEmbed(error: Error): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('❌ Error')
    .setDescription(error.message)
    .setTimestamp();
}

/**
 * ヘルプ用の埋め込みメッセージを作成
 */
export function createHelpEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#4169E1')
    .setTitle('🍕 Pizza Coin Bot Commands')
    .addFields(
      { 
        name: '一般コマンド',
        value: [
          '`/balance` - Check your Pizza coin balance',
          '`/send <user> <amount>` - Send Pizza coins to another user',
          '`/help` - Show this help message'
        ].join('\n')
      },
      {
        name: '管理者コマンド',
        value: [
          '`/admin-disable <user>` - Disable a user from using Pizza coins',
          '`/admin-set-rate <amount>` - Set coins earned per message'
        ].join('\n')
      }
    )
    .setFooter({ text: 'Chat to earn Pizza coins!' });
}