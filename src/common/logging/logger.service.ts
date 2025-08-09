import { LoggerService, Injectable } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class MyLogger implements LoggerService {
    private logger: winston.Logger;

    constructor() {
        const isProd = process.env.NODE_ENV === 'production';

        this.logger = winston.createLogger({
            level: isProd ? 'warn' : 'debug', // 👈 Chỉ ghi từ 'warn' trở lên nếu là production
            format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
                }),
            ),
            transports: [
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                }),
                new winston.transports.File({
                    filename: 'logs/combined.log',
                }),
            ],
        })

        // 👇 Optional: log to console only in development
        if (!isProd) {
            this.logger.add(
                new winston.transports.Console({
                    format: winston.format.simple(),
                }),
            );
        }
    }

    log(message: string) {
        this.logger.info(message);
    }

    error(message: string, trace?: string) {
        this.logger.error(`${message} ${trace ?? ''}`);
    }

    warn(message: string) {
        this.logger.warn(message);
    }

    debug(message: string) {
        this.logger.debug(message);
    }

    verbose(message: string) {
        this.logger.verbose(message);
    }
}
