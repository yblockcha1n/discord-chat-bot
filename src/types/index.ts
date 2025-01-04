/**
 * ユーザー情報の型定義
 */
export interface User {
    id: string;
    pizzaCoins: number;
    isDisabled: boolean;
    createdAt: Date;
  }
  
  /**
   * コイン取引履歴の型定義
   */
  export interface Transaction {
    id: string;
    senderId: string;
    receiverId: string;
    amount: number;
    timestamp: Date;
  }
  
  /**
   * BOTの設定情報の型定義
   */
  export interface Config {
    id: boolean;
    coinsPerMessage: number;
    adminIds: string[];
  }
  
  /**
   * エラー型の定義
   */
  export class PizzaCoinError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'PizzaCoinError';
    }
  }
  
  export class InsufficientCoinsError extends PizzaCoinError {
    constructor(required: number, current: number) {
      super(`Insufficient coins. Required: ${required}, Current: ${current}`);
      this.name = 'InsufficientCoinsError';
    }
  }
  
  export class UserDisabledError extends PizzaCoinError {
    constructor(userId: string) {
      super(`User ${userId} is disabled`);
      this.name = 'UserDisabledError';
    }
  }
  
  export class UnauthorizedError extends PizzaCoinError {
    constructor() {
      super('You are not authorized to perform this action');
      this.name = 'UnauthorizedError';
    }
  }
  
  /**
   * 環境変数の型定義
   */
  export interface Environment {
    DISCORD_TOKEN: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    TRANSACTION_LOG_CHANNEL_ID: string;
  }