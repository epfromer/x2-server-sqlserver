import * as config from 'config';
import * as winston from 'winston';
// const loggly = require('winston-loggly-bulk');

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
      // new winston.transports.Loggly({
      //     subdomain: 'epfromer',
      //     token: "5b6ea74c-ba58-4af5-95bc-7a4d2d6207be",
      //     tags: ["Winston-NodeJS"],
      //     json: true
      // })
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

  // public static flushLogsAndExit() {
  //   // loggly.flushLogsAndExit();
  // }
}
