export function renderModeSelector(container, modes, selectedMode, onSelect) {
  container.innerHTML = "";

  modes.forEach((mode) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mode-tab";
    button.setAttribute("aria-pressed", String(mode.id === selectedMode));
    button.textContent = `${mode.label}：${mode.title}`;
    button.addEventListener("click", () => onSelect(mode.id));
    container.append(button);
  });
}
