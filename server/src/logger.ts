import pinoHttp from 'pino-http';

class Logger {

  constructor() {

    this.enabled = true;
    this.type = 'pino';
    
    this.logger = pinoHttp();
  }

  get middleware() {
    
    return (req, res, next) => {

      if (!this.enabled || this.type == 'none') {
	req.log = {info: ()=>{}, error: ()=>{}, warn: ()=>{}, debug: ()=>{}};
	return next();
      }

      if (this.type == 'console') {

	req.log = {
	  info: (...args) => console.log(`[INFO] [Req: ${req.url}]`, ...args),
	  error: (...args) => console.log(`[ERROR] [Req: ${req.url}]`, ...args),
	  warn: (...args) => console.log(`[WARN] [Req: ${req.url}]`, ...args),
	  debug: (...args) => console.log(`[DEBUG] [Req: ${req.url}]`, ...args)
	};

	console.log(`--> ${req.method} ${req.url}`);
	res.on('finish', () => console.log(`<-- ${req.method} ${req.url} ${res.statusCode}`));
	return next();
      }

      this.logger(req, res);
      next();
    };
  }

  error(...args) {
    if (this.type == 'none') return;
    if (this.type == 'console') return console.log('[ERROR] ', ...args);
    this.logger.logger.error(arg1, ...args);
  }

  info(...args) {
    if (this.type == 'none') return;
    if (this.type == 'console') return console.log('[INFO] ', ...args);
    this.logger.logger.info(arg1, ...args);
  }

  warn(...args) {
    if (this.type == 'none') return;
    if (this.type == 'console') return console.log('[WARN] ', ...args);
    this.logger.logger.warn(arg1, ...args);
  }

  debug(...args) {
    if (this.type == 'none') return;
    if (this.type == 'console') return console.log('[DEBUG] ', ...args);
    this.logger.logger.warn(arg1, ...args);
  }

}

const log = new Logger();
export default log;
