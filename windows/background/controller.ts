import { Features } from "../../src/events/features";

const CS2_ID = 10798;
const REQUIRED_FEATURES = [
  "match_info", "live_data", "kill", "death", "assist", "round_start", "round_end"
];

function registerFeatures() {
  overwolf.games.events.setRequiredFeatures(REQUIRED_FEATURES, res => {
    if (!res.success) {
      console.warn("GEP registration failed", res.error);
    }
  });
}

overwolf.games.onGameInfoUpdated.addListener(info => {
  if (info && info.gameChanged && info.gameInfo.classId === CS2_ID) {
    registerFeatures();
  }
});

// relay events to overlay
overwolf.games.events.onNewEvents.addListener(e => {
  Features.handle(e.events); // domain logic → broadcast
});
