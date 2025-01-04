import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// ログレベルの色設定
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

// Winstonの色設定を追加
winston.addColors(colors);

// カスタムフォーマットの作成
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // メタデータがある場合はJSONとして追加
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    
    // ログレベルに応じた絵文字を設定
    const emoji = {
      error: '❌',
      warn: '⚠️',
      info: '✨',
      debug: '🔍',
    }[level] || '📝';

    return `${timestamp} ${emoji} ${level.toUpperCase()}: ${message}${metaStr}`;
  })
);

// ログファイルの保存先ディレクトリ
const logDir = path.join(process.cwd(), 'logs');

// ロガーの作成
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: customFormat,
  transports: [
    // コンソール出力
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      ),
    }),
    // 日次ローテーションファイル（全レベル）
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'pizza-coin-bot-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
    }),
    // エラーログ専用ファイル
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      maxSize: '20m',
      level: 'error',
    }),
  ],
});

// ロガーのラッパー関数
export const log = {
  error: (message: string, meta?: object) => {
    logger.error(message, meta);
  },
  warn: (message: string, meta?: object) => {
    logger.warn(message, meta);
  },
  info: (message: string, meta?: object) => {
    logger.info(message, meta);
  },
  debug: (message: string, meta?: object) => {
    logger.debug(message, meta);
  },
  // 特殊なログタイプ
  startup: (message: string) => {
    logger.info(`🚀 ${message}`);
  },
  shutdown: (message: string) => {
    logger.info(`🔄 ${message}`);
  },
  command: (command: string, userId: string, meta?: object) => {
    logger.info(`🎮 Command executed: ${command}`, { userId, ...meta });
  },
  transaction: (message: string, meta?: object) => {
    logger.info(`💰 ${message}`, meta);
  },
  userAction: (message: string, userId: string, meta?: object) => {
    logger.info(`👤 ${message}`, { userId, ...meta });
  },
  systemAction: (message: string, meta?: object) => {
    logger.info(`⚙️ ${message}`, meta);
  }
};