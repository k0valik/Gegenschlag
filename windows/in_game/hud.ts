import { bus } from "../../src/events/features.js";

const hud = document.getElementById("hud");
let kills = 0, deaths = 0;

bus.on("kill", k => { kills = k; render(); });
bus.on("death", d => { deaths = d; render(); });

function render() {
  hud.innerText = `K ${kills} / D ${deaths}`;
}

// hotkey toggle
overwolf.settings.hotkeys.onPressed.addListener(hk => {
  if (hk.name === "toggle_overlay") toggle();
});

function toggle() {
  overwolf.windows.getCurrentWindow(win => {
    if (win.window_state_ex === "hidden") {
      overwolf.windows.restore(win.window.id);
    } else {
      overwolf.windows.hide(win.window.id);
    }
  });
}
