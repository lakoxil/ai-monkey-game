let activeTimer = null;

export function streamText(element, text, onDone) {
  if (activeTimer) window.clearInterval(activeTimer);

  element.textContent = "";
  let index = 0;
  activeTimer = window.setInterval(() => {
    element.textContent += text[index] ?? "";
    index += 1;

    if (index >= text.length) {
      window.clearInterval(activeTimer);
      activeTimer = null;
      onDone?.();
    }
  }, 24);
}
