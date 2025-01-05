import { createClient, SupabaseClient as Client } from '@supabase/supabase-js';

import { User, Transaction, Config, PizzaCoinError } from '../types';

export class SupabaseClient {
  private client: Client;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * ユーザー情報の取得
   */
  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new PizzaCoinError(`Failed to get user: ${error.message}`);
    }

    if (data) {
      return {
        id: data.id,
        pizzaCoins: data.pizza_coins,
        isDisabled: data.is_disabled,
        createdAt: new Date(data.created_at)
      };
    }

    return null;
  }

  /**
   * 新規ユーザーの作成
   */
  async createUser(userId: string): Promise<void> {
    const { error } = await this.client
      .from('users')
      .insert({
        id: userId,
        pizza_coins: 0,
        is_disabled: false
      });

    if (error && error.code !== '23505') { // 一意性制約違反のエラーは無視
      throw new PizzaCoinError(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * ユーザーのコイン残高更新
   */
  async updateUserCoins(userId: string, coins: number): Promise<void> {
    const { error } = await this.client
      .from('users')
      .update({
        pizza_coins: coins,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new PizzaCoinError(`Failed to update user coins: ${error.message}`);
    }
  }

  /**
   * ユーザーの無効化状態を更新
   */
  async updateUserDisabledStatus(userId: string, isDisabled: boolean): Promise<void> {
    const { error } = await this.client
      .from('users')
      .update({
        is_disabled: isDisabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new PizzaCoinError(`Failed to update user status: ${error.message}`);
    }
  }

  /**
   * 取引履歴の記録
   */
  async recordTransaction(transaction: Omit<Transaction, 'id'>): Promise<void> {
    const { error } = await this.client
      .from('transactions')
      .insert({
        sender_id: transaction.senderId,
        receiver_id: transaction.receiverId,
        amount: transaction.amount,
        timestamp: transaction.timestamp.toISOString()
      });

    if (error) {
      throw new PizzaCoinError(`Failed to record transaction: ${error.message}`);
    }
  }

/**
 * 没収の記録
 */
  async recordConfiscation(confiscation: {
    adminId: string;
    targetUserId: string;
    amount: number;
    reason: string;
    timestamp: Date;
  }): Promise<void> {
    const { error } = await this.client
      .from('confiscations')
      .insert([{
        admin_id: confiscation.adminId,
        target_user_id: confiscation.targetUserId,
        amount: confiscation.amount,
        reason: confiscation.reason,
        timestamp: confiscation.timestamp.toISOString()
      }]);

    if (error) {
      throw new PizzaCoinError(`Failed to record confiscation: ${error.message}`);
    }
  }

/**
 * 全ユーザーのコインをリセット
 */
  async resetAllCoins(): Promise<number> {
    const { data, error } = await this.client
      .from('users')
      .update({ pizza_coins: 0 })
      .neq('pizza_coins', 0)
      .select('id');

    if (error) {
      throw new PizzaCoinError(`Failed to reset all coins: ${error.message}`);
    }

    return data.length;
  }

  /**
   * BOT設定の取得
   */
  async getConfig(): Promise<Config> {
    const { data, error } = await this.client
      .from('config')
      .select('*')
      .eq('id', true)
      .single();

    if (error) {
      throw new PizzaCoinError(`Failed to get config: ${error.message}`);
    }

    return {
      id: data.id,
      coinsPerMessage: data.coins_per_message,
      adminIds: data.admin_ids
    };
  }

    /**
   * リーダーボードデータの取得
   */
  async getLeaderboard(page: number = 1): Promise<{
    users: User[];
    total: number;
    totalCoins: number;
  }> {
    const limit = 10;
    const offset = (page - 1) * limit;

    // アクティブなユーザーのみを取得
    const { data: users, error, count } = await this.client
      .from('users')
      .select('*', { count: 'exact' })
      .eq('is_disabled', false)
      .order('pizza_coins', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new PizzaCoinError(`Failed to get leaderboard: ${error.message}`);
    }

    // 総コイン数の計算
    const { data: totalData, error: totalError } = await this.client
      .from('users')
      .select('pizza_coins')
      .eq('is_disabled', false);

    if (totalError) {
      throw new PizzaCoinError(`Failed to get total coins: ${totalError.message}`);
    }

    const totalCoins = totalData.reduce((sum, user) => sum + (user.pizza_coins || 0), 0);

    return {
      users: users.map(user => ({
        id: user.id,
        pizzaCoins: user.pizza_coins,
        isDisabled: user.is_disabled,
        createdAt: new Date(user.created_at)
      })),
      total: count || 0,
      totalCoins
    };
  }

  /**
   * メッセージあたりのコイン獲得数を更新
   */
  async updateCoinsPerMessage(amount: number): Promise<void> {
    const { error } = await this.client
      .from('config')
      .update({
        coins_per_message: amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', true);

    if (error) {
      throw new PizzaCoinError(`Failed to update coins per message: ${error.message}`);
    }
  }
}