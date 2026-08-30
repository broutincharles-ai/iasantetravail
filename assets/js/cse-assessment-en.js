(() => {
  "use strict";
  const answers = new Map();
  let autonomy = null;
  let workImpact = null;
  const outcomes = {
    green: ["Sufficient information", "The file allows the CSE to deliberate on a structured basis."],
    yellow: ["Additional information required", "Some answers are still missing to understand the system and its effects."],
    orange: ["In-depth assessment recommended", "The autonomy level or number of partial answers calls for closer examination."],
    red: ["Insufficient safeguards", "Essential elements concerning control, incidents or suspension have not been established."]
  };
  const byId = id => document.getElementById(id);
  const elements = {
    card: byId("dossierCard"), answered: byId("answeredCount"), progress: byId("answerProgress"), autonomy: byId("autonomyPill"),
    title: byId("outcomeTitle"), text: byId("outcomeText"), documented: byId("documentedCount"), partial: byId("partialCount"),
    missing: byId("missingCount"), recommendation: byId("spstRecommendation"), summaryTitle: byId("summary-title"),
    summaryText: byId("summaryText"), summarySpst: byId("summarySpst")
  };
  const setPressed = (buttons, selected) => buttons.forEach(button => button.setAttribute("aria-pressed", String(button === selected)));
  const render = () => {
    const values = [...answers.values()];
    const documented = values.filter(value => value === "documented").length;
    const partial = values.filter(value => value === "partial").length;
    const missing = values.filter(value => value === "missing").length;
    const criticalGap = [7, 8, 9].some(index => answers.get(index) === "missing");
    let tone = "yellow";
    if ((missing >= 5 || criticalGap) && values.length >= 5) tone = "red";
    else if ((autonomy !== null && autonomy >= 3) || partial >= 4) tone = "orange";
    else if (documented === 10 && autonomy !== null) tone = "green";
    const recommendSpst = workImpact === "identified" || workImpact === "uncertain" || (autonomy !== null && autonomy >= 3);
    const [title, copy] = outcomes[tone];
    elements.answered.textContent = String(values.length);
    elements.progress.style.width = `${values.length * 10}%`;
    elements.autonomy.textContent = autonomy === null ? "Autonomy ?" : `Autonomy A${autonomy}`;
    elements.title.textContent = elements.summaryTitle.textContent = title;
    elements.text.textContent = elements.summaryText.textContent = copy;
    elements.documented.textContent = String(documented);
    elements.partial.textContent = String(partial);
    elements.missing.textContent = String(missing);
    elements.recommendation.hidden = elements.summarySpst.hidden = !recommendSpst;
    elements.card.className = `dossier-card tone-${tone}`;
  };
  document.querySelectorAll(".question-card").forEach(card => {
    const index = Number(card.dataset.question);
    const buttons = [...card.querySelectorAll("[data-answer]")];
    setPressed(buttons, null);
    buttons.forEach(button => button.addEventListener("click", () => {
      answers.set(index, button.dataset.answer);
      setPressed(buttons, button);
      card.classList.remove("is-documented", "is-partial", "is-missing");
      card.classList.add(`is-${button.dataset.answer}`);
      render();
    }));
  });
  const autonomyButtons = [...document.querySelectorAll("[data-autonomy]")];
  const impactButtons = [...document.querySelectorAll("[data-impact]")];
  setPressed(autonomyButtons, null); setPressed(impactButtons, null);
  autonomyButtons.forEach(button => button.addEventListener("click", () => { autonomy = Number(button.dataset.autonomy); setPressed(autonomyButtons, button); render(); }));
  impactButtons.forEach(button => button.addEventListener("click", () => { workImpact = button.dataset.impact; setPressed(impactButtons, button); render(); }));
  render();
})();
