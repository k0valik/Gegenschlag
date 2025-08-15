class GSIService {
  private static interval: number;

  public static init(): void {
    this.interval = window.setInterval(() => this.fetchGSI(), 5000);
  }

  public static async fetchGSI(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3000/gsi');
      const gsiData = await response.json();
      overwolf.windows.sendMessage('overlay', { event: 'update-gsi', data: gsiData }, () => {});
    } catch (error) {
      console.error("GSI fetch failed", error);
    }
  }

  public static teardown(): void {
    window.clearInterval(this.interval);
  }
}

export default GSIService;
