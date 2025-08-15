import EconomyCalculatorService from './economyCalculatorService';

class GameEventsService {
  public static init(): void {
    overwolf.games.events.onNewEvents.addListener(this.handleEvents);
  }

  private static handleEvents(events: any): void {
    const roundData = EconomyCalculatorService.processGED(events);
    // Send to overlay
    overwolf.windows.sendMessage('overlay', { event: 'update-economy', data: roundData }, () => {});
  }
}

export default GameEventsService;
