export function enableInputTracking(): void {
  const body = document.body;
  if (!body || body.dataset.inputTracking === "true") return;

  body.dataset.inputTracking = "true";

  const markPointer = (): void => {
    body.dataset.input = "pointer";
  };

  const markKeyboard = (event: KeyboardEvent): void => {
    if (event.key === "Tab" || event.key.startsWith("Arrow")) {
      body.dataset.input = "keyboard";
    }
  };

  document.addEventListener("pointerdown", markPointer, { passive: true });
  document.addEventListener("keydown", markKeyboard);
}
