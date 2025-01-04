import { Environment } from '../types';

/**
 * 環境変数の検証
 */
export function validateEnvironment(env: NodeJS.ProcessEnv): Environment {
  const requiredEnvVars = [
    'DISCORD_TOKEN',
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'TRANSACTION_LOG_CHANNEL_ID'
  ] as const;

  for (const varName of requiredEnvVars) {
    if (!env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  return {
    DISCORD_TOKEN: env.DISCORD_TOKEN!,
    SUPABASE_URL: env.SUPABASE_URL!,
    SUPABASE_KEY: env.SUPABASE_KEY!,
    TRANSACTION_LOG_CHANNEL_ID: env.TRANSACTION_LOG_CHANNEL_ID!
  };
}

/**
 * コイン数の検証
 */
export function validateCoinAmount(amount: number): void {
  if (!Number.isInteger(amount)) {
    throw new Error('Coin amount must be an integer');
  }

  if (amount <= 0) {
    throw new Error('Coin amount must be positive');
  }

  if (amount > 1000000) {
    throw new Error('Coin amount is too large');
  }
}

/**
 * ユーザーIDの検証
 */
export function validateUserId(userId: string): void {
  if (!userId.match(/^\d{17,19}$/)) {
    throw new Error('Invalid user ID format');
  }
}