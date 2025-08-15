export async function open(name: string): Promise<void> {
  return new Promise(res => {
    overwolf.windows.obtainDeclaredWindow(name, w => {
      overwolf.windows.restore(w.window.id, () => res());
    });
  });
}

export async function bringToFront(name: string): Promise<void> {
    return new Promise(res => {
        overwolf.windows.bringToFront(name, true, () => res());
    });
}
