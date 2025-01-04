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