import * as config from 'config';
import * as winston from 'winston';
// const loggly = require('winston-loggly-bulk');

export class Log {
  public static logLevels = {
    debug1: 2,
    debug2: 3,
    error: 0,
    info: 1
  };

  public static logColors = {
    debug1: 'blue',
    debug2: 'green',
    error: 'red',
    info: 'yellow'
  };

  public static logger = new winston.Logger({
    colors: Log.logColors,
    levels: Log.logLevels,
    transports: [
      new winston.transports.Console({
        colorize: true,
        level: config.get('LogLevel'),
        timestamp: true
      }),
      new winston.transports.File({
        filename: 'debug.log',
        level: 'debug1'
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

  public static debug1(s: any) {
    Log.logger.debug1(s); 
  }

  public static debug2(s: any) {
    Log.logger.debug2(s);
  }

  // public static flushLogsAndExit() {
  //   // loggly.flushLogsAndExit();
  // }
}
