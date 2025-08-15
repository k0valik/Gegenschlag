import EventEmitter from "mitt";

export const bus = new EventEmitter();

export const Features = {
  handle(events: any[]) {
    events.forEach(ev => {
      switch (ev.name) {
        case "kill":
          bus.emit("kill", parseInt(ev.data, 10));
          break;
        case "death":
          bus.emit("death", parseInt(ev.data, 10));
          break;
        // ...other cases
      }
    });
  }
};
