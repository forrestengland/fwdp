import pinoHttp from 'pino-http';
import { Logger as PinoLogger } from 'pino';
import { RequestHandler } from 'express';

class Logger {

  public enabled: boolean;
  public type: string;
  public logger: ReturnType<typeof pinoHttp>;

  constructor() {

    this.enabled = true;
    this.type = 'console';
    
    this.logger = pinoHttp();
  }

  get middleware(): RequestHandler {
    
    return (req, res, next) => {

      if (!this.enabled || this.type == 'none') {
	req.log = {info: ()=>{}, error: ()=>{}, warn: ()=>{}, debug: ()=>{}} as unknown as PinoLogger;
	return next();
      }

      if (this.type == 'console') {

	req.log = {
	  info: (...args: any) => console.log(`[INFO] [Req: ${req.url}]`, ...args),
	  error: (...args: any) => console.log(`[ERROR] [Req: ${req.url}]`, ...args),
	  warn: (...args: any) => console.log(`[WARN] [Req: ${req.url}]`, ...args),
	  debug: (...args: any) => console.log(`[DEBUG] [Req: ${req.url}]`, ...args)
	} as unknown as PinoLogger;

	console.log(`--> ${req.method} ${req.url}`);
	res.on('finish', () => console.log(`<-- ${req.method} ${req.url} ${res.statusCode}`));
	return next();
      }

      this.logger(req, res);
      next();
    };
  }

  error(...args: any[]) {
    if (this.type == 'none') return;
    if (this.type == 'console') return console.log('[ERROR] ', ...args);
    (this.logger.logger.error as any)(...args);
  }

  info(...args: any[]) {
    if (this.type == 'none') return;
    if (this.type == 'console') return console.log('[INFO] ', ...args);
    (this.logger.logger.info as any)(...args);
  }

  warn(...args: any[]) {
    if (this.type == 'none') return;
    if (this.type == 'console') return console.log('[WARN] ', ...args);
    (this.logger.logger.warn as any)(...args);
  }

  debug(...args: any[]) {
    if (this.type == 'none') return;
    if (this.type == 'console') return console.log('[DEBUG] ', ...args);
    (this.logger.logger.warn as any)(...args);
  }

}

const log = new Logger();
export default log;
