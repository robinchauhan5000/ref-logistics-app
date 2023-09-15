import winston, { format, transports } from 'winston';
import LokiTransport from 'winston-loki';
import dotenv from 'dotenv';
dotenv.config();

const commonOptions: winston.LoggerOptions = {
  level: 'info',
  format: winston.format.combine(
    winston.format.printf(({ level, message }) => {
      return `[${level.toUpperCase()}]: ${message}`;
    }),
  ),
};

//using winston for local env
const localConfig: winston.LoggerOptions = {
  transports: [new winston.transports.Console()],
};

//using winston-cloudwatch for production
const productionConfig: winston.LoggerOptions = {
  transports: [
    new LokiTransport({
      host: process.env.LOKI_HOST as string,
      labels: { app: 'logistics' },
      json: true,
      format: format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err),
    }),
    new transports.Console({
      format: format.combine(format.simple(), format.colorize()),
    }),
  ],
};

const config: winston.LoggerOptions = process.env.NODE_ENV === 'staging' ? productionConfig : localConfig;

const logger = winston.createLogger({ ...commonOptions, ...config });
export default logger;
