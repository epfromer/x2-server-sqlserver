import * as config from 'config';
import * as winston from 'winston';

export class Log {
  public static logColors = {
    debug: 'blue',
    error: 'red',
    info: 'yellow'
  };

  public static logger = new winston.Logger({
    colors: Log.logColors,
    transports: [
      new winston.transports.Console({
        colorize: true,
        level: config.get('LogLevel'),
        timestamp: true
      }),
      new winston.transports.File({
        filename: 'debug.log',
        level: 'debug'
      })
    ]
  });

  public static error(s: any) {
    Log.logger.error(s);
  }

  public static info(s: any) {
    Log.logger.info(s);
  }

  public static debug(s: any) {
    Log.logger.debug(s);
  }
}
