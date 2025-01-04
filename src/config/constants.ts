/**
 * Discord関連の定数
 */
export const DISCORD = {
    // 埋め込みメッセージの色
    COLORS: {
      PRIMARY: '#4169E1',    // メインカラー（青）
      SUCCESS: '#32CD32',    // 成功時（緑）
      WARNING: '#FFA500',    // 警告時（オレンジ）
      ERROR: '#FF0000',      // エラー時（赤）
      PIZZA: '#FFA500'       // Pizzaコイン関連（オレンジ）
    },
  
    // 埋め込みメッセージのEmoji
    EMOJI: {
      PIZZA: '🍕',
      ERROR: '❌',
      SUCCESS: '✅',
      ADMIN: '👮',
      SETTINGS: '⚙️',
      COIN: '💰',
      TRANSFER: '💸'
    }
  } as const;
  
  /**
   * バリデーション関連の定数
   */
  export const VALIDATION = {
    COINS: {
      MIN: 1,                // 最小コイン数
      MAX: 1000000,         // 最大コイン数
      DEFAULT_RATE: 1       // デフォルトのメッセージあたりのコイン数
    },
  
    // Discord IDのバリデーション用正規表現
    DISCORD_ID_REGEX: /^\d{17,19}$/
  } as const;
  
  /**
   * データベース関連の定数
   */
  export const DATABASE = {
    TABLES: {
      USERS: 'users',
      TRANSACTIONS: 'transactions',
      CONFIG: 'config'
    },
  
    // デフォルト値
    DEFAULTS: {
      INITIAL_COINS: 0,
      IS_DISABLED: false
    }
  } as const;
  
  /**
   * アプリケーション全体の設定
   */
  export const APP_CONFIG = {
    // コマンドのクールダウン（ミリ秒）
    COOLDOWNS: {
      SEND: 5000,           // 送信コマンドのクールダウン
      ADMIN_ACTIONS: 10000  // 管理者アクションのクールダウン
    },
  
    // ログ関連の設定
    LOGGING: {
      MAX_TRANSACTION_HISTORY: 100  // トランザクション履歴の最大表示数
    },
  
    // メッセージ関連の設定
    MESSAGES: {
      MAX_LENGTH: 2000      // Discordの最大メッセージ長
    }
  } as const;
  
  /**
   * エラーメッセージ
   */
  export const ERROR_MESSAGES = {
    INVALID_AMOUNT: 'Invalid coin amount. Must be between {min} and {max}.',
    INSUFFICIENT_COINS: 'Insufficient coins. You need {required} coins but only have {current}.',
    USER_DISABLED: 'This user has been disabled from using Pizza coins.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    SELF_TRANSFER: 'You cannot send coins to yourself.',
    BOT_TRANSFER: 'You cannot send coins to a bot.',
    UNKNOWN_ERROR: 'An unknown error occurred. Please try again later.',
    COOLDOWN: 'Please wait {seconds} seconds before using this command again.'
  } as const;
  
  /**
   * ヘルプメッセージ
   */
  export const HELP_MESSAGES = {
    COMMANDS: {
      BALANCE: 'Check your Pizza coin balance',
      SEND: 'Send Pizza coins to another user',
      HELP: 'Show this help message',
      ADMIN_DISABLE: 'Disable a user from using Pizza coins',
      ADMIN_SET_RATE: 'Set coins earned per message'
    },
  
    EXAMPLES: {
      SEND: '/send @user 100',
      ADMIN_SET_RATE: '/admin-set-rate 5'
    }
  } as const;