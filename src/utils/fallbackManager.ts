import GSIService from '../services/gsiService';
import ConsoleLogService from '../services/consoleLogService';

class FallbackManager {
  public static setup(): void {
    overwolf.games.events.getInfo(info => {
      if (info && info.res && info.res.supportedFeatures && !info.res.supportedFeatures.includes('live_game_data')) {
        GSIService.init();
        ConsoleLogService.init();
      }
    });
  }
}

export default FallbackManager;
