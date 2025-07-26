type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;
  private logHistory: LogEntry[] = [];
  private readonly MAX_HISTORY = 100;
  private readonly LOG_ENDPOINT = '/api/logs';

  private constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, data?: any, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error
    };
  }

  private async sendToServer(entry: LogEntry) {
    try {
      // Don't send debug logs to server in production
      if (!this.isDevelopment && entry.level === 'debug') {
        return;
      }

      const response = await fetch(this.LOG_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        console.error('Failed to send log to server:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending log to server:', error);
    }
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    const entry = this.formatMessage(level, message, data, error);
    
    // Store in history
    this.logHistory.push(entry);
    if (this.logHistory.length > this.MAX_HISTORY) {
      this.logHistory.shift();
    }

    // Format console output
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    // Development mode gets more detailed logging
    if (this.isDevelopment) {
      switch (level) {
        case 'debug':
          console.debug(prefix, message, data || '');
          break;
        case 'info':
          console.info(prefix, message, data || '');
          break;
        case 'warn':
          console.warn(prefix, message, data || '');
          break;
        case 'error':
          console.error(prefix, message, data || '', error || '');
          break;
      }
    } else {
      // Production mode only logs warnings and errors
      if (level === 'warn' || level === 'error') {
        console[level](prefix, message, data || '', error || '');
      }
    }

    // Send to server
    this.sendToServer(entry);

    // If it's an error, we might want to send it to an error tracking service
    if (level === 'error') {
      this.handleError(entry);
    }
  }

  private handleError(entry: LogEntry) {
    if (this.isDevelopment) {
      console.error('🚨 Error occurred:', entry);
    }
  }

  public debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  public info(message: string, data?: any) {
    this.log('info', message, data);
  }

  public warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  public error(message: string, error?: Error, data?: any) {
    this.log('error', message, data, error);
  }

  public getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  public clearHistory() {
    this.logHistory = [];
  }
}

// Export a singleton instance
export const logger = Logger.getInstance();

// Export types for use in other files
export type { LogEntry, LogLevel };
