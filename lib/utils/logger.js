const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

class Logger {
  constructor() {
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };

    this.currentLogLevel = this.logLevels.INFO;
    this.logDir = path.join(__dirname, '../../logs');

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    this.logFile = path.join(this.logDir, `app-${format(new Date(), 'yyyy-MM-dd')}.log`);
  }

  setLogLevel(level) {
    if (this.logLevels[level] !== undefined) {
      this.currentLogLevel = this.logLevels[level];
    }
  }

  getTimestamp() {
    return format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
  }

  writeToFile(message) {
    const logMessage = `${this.getTimestamp()} - ${message}\n`;
    fs.appendFileSync(this.logFile, logMessage);
  }

  debug(message, ...args) {
    if (this.currentLogLevel <= this.logLevels.DEBUG) {
      const formattedMessage = `[DEBUG] ${message}`;
      console.debug(formattedMessage, ...args);
      this.writeToFile(formattedMessage);
    }
  }

  info(message, ...args) {
    if (this.currentLogLevel <= this.logLevels.INFO) {
      const formattedMessage = `[INFO] ${message}`;
      console.info(formattedMessage, ...args);
      this.writeToFile(formattedMessage);
    }
  }

  warn(message, ...args) {
    if (this.currentLogLevel <= this.logLevels.WARN) {
      const formattedMessage = `[WARN] ${message}`;
      console.warn(formattedMessage, ...args);
      this.writeToFile(formattedMessage);
    }
  }

  error(message, ...args) {
    if (this.currentLogLevel <= this.logLevels.ERROR) {
      const formattedMessage = `[ERROR] ${message}`;
      console.error(formattedMessage, ...args);
      this.writeToFile(formattedMessage);
    }
  }

  logRequest(req) {
    this.info(`Request: ${req.method} ${req.url}`, {
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params
    });
  }

  logResponse(res, data) {
    this.info(`Response: ${res.statusCode}`, {
      data: data
    });
  }

  logError(error) {
    this.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      ...error
    });
  }
}

// Create a singleton instance
const logger = new Logger();

module.exports = logger;
