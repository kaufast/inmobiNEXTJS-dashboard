// File logging utility for i18n debugging
class FileLogger {
  private logs: string[] = [];
  private logFile = 'i18n-debug.log';
  private autoDownloadTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-download logs after 10 seconds of activity
    this.scheduleAutoDownload();
  }

  log(level: 'INFO' | 'WARN' | 'ERROR', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level}: ${message}`;
    const dataString = data ? `\nData: ${JSON.stringify(data, null, 2)}` : '';
    const fullLog = logEntry + dataString + '\n';

    // Add to memory buffer
    this.logs.push(fullLog);

    // Console log with emoji
    const emoji = level === 'ERROR' ? '❌' : level === 'WARN' ? '⚠️' : '📝';
    console.log(`${emoji} ${logEntry}`, data || '');

    // Write to file (browser environment)
    this.writeToFile(fullLog);
    
    // Reset auto-download timer
    this.scheduleAutoDownload();
  }

  private scheduleAutoDownload() {
    if (this.autoDownloadTimer) {
      clearTimeout(this.autoDownloadTimer);
    }
    
    // Auto-download after 10 seconds of no new logs
    this.autoDownloadTimer = setTimeout(() => {
      if (this.logs.length > 0) {
        console.log('📁 Auto-downloading i18n debug logs...');
        this.downloadLogs();
      }
    }, 10000);
  }

  private writeToFile(content: string) {
    try {
      // In browser, we'll use localStorage to accumulate logs
      const existing = localStorage.getItem('i18n-debug-logs') || '';
      localStorage.setItem('i18n-debug-logs', existing + content);
      
      // Also immediately try to save to file system if possible
      if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
        this.trySaveToFileSystem(existing + content);
      }
    } catch (error) {
      console.error('Failed to write to log storage:', error);
    }
  }

  private async trySaveToFileSystem(content: string) {
    try {
      // Modern browsers with File System Access API
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: 'i18n-debug.log',
        types: [{
          description: 'Log files',
          accept: { 'text/plain': ['.log'] },
        }],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      console.log('📁 Log file saved to file system');
    } catch (error) {
      // Silently fail - not all browsers support this
    }
  }

  downloadLogs() {
    try {
      const logs = localStorage.getItem('i18n-debug-logs') || 'No logs available';
      const blob = new Blob([logs], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.logFile;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download logs:', error);
    }
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('i18n-debug-logs');
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  getLogsFromStorage(): string {
    return localStorage.getItem('i18n-debug-logs') || '';
  }
}

// Create singleton instance
export const fileLogger = new FileLogger();

// Helper functions
export const logInfo = (message: string, data?: any) => fileLogger.log('INFO', message, data);
export const logWarn = (message: string, data?: any) => fileLogger.log('WARN', message, data);
export const logError = (message: string, data?: any) => fileLogger.log('ERROR', message, data);