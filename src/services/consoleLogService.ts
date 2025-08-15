class ConsoleLogService {
  public static init(): void {
    // Example: subscribe via Overwolf Media or file reader
  }

  private static parseLine(line: string): any {
    // Implement parsing logic here
    return { line };
  }

  public static handleLogEntry(line: string): void {
    const data = this.parseLine(line);
    overwolf.windows.sendMessage('overlay', { event: 'update-log', data }, () => {});
  }
}

export default ConsoleLogService;
