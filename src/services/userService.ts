import { User, InsufficientCoinsError, UserDisabledError, UnauthorizedError } from '../types';
import { SupabaseClient } from '../infrastructure/supabase';

export class UserService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * ユーザーの取得（存在しない場合は作成）
   */
  async ensureUser(userId: string): Promise<User> {
    let user = await this.supabase.getUser(userId);
    if (!user) {
      await this.supabase.createUser(userId);
      user = await this.supabase.getUser(userId);
      if (!user) {
        throw new Error('Failed to create user');
      }
    }
    return user;
  }

  /**
   * コインの追加
   */
  async addCoins(userId: string, amount: number): Promise<void> {
    const user = await this.ensureUser(userId);
    
    if (user.isDisabled) {
      throw new UserDisabledError(userId);
    }

    if (amount < 0) {
      throw new Error('Amount must be positive');
    }

    await this.supabase.updateUserCoins(userId, user.pizzaCoins + amount);
  }

  /**
   * コインの送信
   */
  async transferCoins(
    senderId: string,
    receiverId: string,
    amount: number
  ): Promise<void> {
    const sender = await this.ensureUser(senderId);
    const receiver = await this.ensureUser(receiverId);

    if (sender.isDisabled) {
      throw new UserDisabledError(senderId);
    }

    if (receiver.isDisabled) {
      throw new UserDisabledError(receiverId);
    }

    if (amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }

    if (sender.pizzaCoins < amount) {
      throw new InsufficientCoinsError(amount, sender.pizzaCoins);
    }

    await this.supabase.updateUserCoins(senderId, sender.pizzaCoins - amount);
    await this.supabase.updateUserCoins(receiverId, receiver.pizzaCoins + amount);

    await this.supabase.recordTransaction({
      senderId,
      receiverId,
      amount,
      timestamp: new Date()
    });
  }

  /**
   * ユーザーの無効化（管理者のみ）
   */
  async disableUser(
    adminId: string,
    targetUserId: string
  ): Promise<void> {
    const config = await this.supabase.getConfig();
    
    if (!config.adminIds.includes(adminId)) {
      throw new UnauthorizedError();
    }

    await this.supabase.updateUserDisabledStatus(targetUserId, true);
  }

  /**
 * 全ユーザーのコインをリセット
 */
  async resetAllCoins(adminId: string): Promise<number> {
    const config = await this.supabase.getConfig();
    
    if (!config.adminIds.includes(adminId)) {
      throw new UnauthorizedError();
    }

    return await this.supabase.resetAllCoins();
  }

  /**
   * 特定ユーザーのコインを没収
   */
  async confiscateCoins(
    adminId: string,
    targetUserId: string,
    reason: string
  ): Promise<number> {
    const config = await this.supabase.getConfig();
    
    if (!config.adminIds.includes(adminId)) {
      throw new UnauthorizedError();
    }

    const user = await this.ensureUser(targetUserId);
    const confiscatedAmount = user.pizzaCoins;

    // コインを0にリセット
    await this.supabase.updateUserCoins(targetUserId, 0);

    // 没収記録
    await this.supabase.recordConfiscation({
      adminId,
      targetUserId,
      amount: confiscatedAmount,
      reason,
      timestamp: new Date()
    });

    return confiscatedAmount;
  }

    /**
   * ユーザーの有効化
   */
  async enableUser(
    adminId: string,
    targetUserId: string
  ): Promise<void> {
    const config = await this.supabase.getConfig();
    
    if (!config.adminIds.includes(adminId)) {
      throw new UnauthorizedError();
    }

    await this.supabase.updateUserDisabledStatus(targetUserId, false);
  }

  /**
   * リーダーボードの取得
   */
  async getLeaderboard(page: number = 1): Promise<{
    users: User[];
    total: number;
    totalCoins: number;
  }> {
    return await this.supabase.getLeaderboard(page);
  }

  /**
   * メッセージあたりのコイン獲得数の変更（管理者のみ）
   */
  async updateCoinsPerMessage(
    adminId: string,
    amount: number
  ): Promise<void> {
    const config = await this.supabase.getConfig();
    
    if (!config.adminIds.includes(adminId)) {
      throw new UnauthorizedError();
    }

    if (amount < 0) {
      throw new Error('Coins per message must be positive');
    }

    await this.supabase.updateCoinsPerMessage(amount);
  }
}