export function renderHistory(tbody, history) {
  tbody.innerHTML = "";

  if (history.length === 0) {
    const row = document.createElement("tr");
    row.className = "empty-row";
    row.innerHTML = '<td colspan="4">尚未開始猜測</td>';
    tbody.append(row);
    return;
  }

  history.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.round}</td>
      <td>${item.guess}</td>
      <td class="${item.isCorrect ? "win-text" : ""}">${item.feedback}</td>
      <td>${item.score ?? ""}</td>
    `;
    tbody.append(row);
  });
}
