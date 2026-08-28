(() => {
  "use strict";

  const answers = new Map();
  let autonomy = null;
  let workImpact = null;

  const outcomes = {
    green: ["Informations suffisantes", "Le dossier permet au CSE d’engager la délibération sur une base structurée."],
    yellow: ["Informations complémentaires nécessaires", "Des réponses manquent encore pour comprendre le système et ses effets."],
    orange: ["Évaluation approfondie recommandée", "Le niveau d’autonomie ou le nombre de réponses partielles appelle un examen renforcé."],
    red: ["Garanties insuffisantes", "Des éléments essentiels au contrôle, aux incidents ou à la suspension ne sont pas établis."]
  };

  const elements = {
    card: document.getElementById("dossierCard"),
    answered: document.getElementById("answeredCount"),
    progress: document.getElementById("answerProgress"),
    autonomy: document.getElementById("autonomyPill"),
    title: document.getElementById("outcomeTitle"),
    text: document.getElementById("outcomeText"),
    documented: document.getElementById("documentedCount"),
    partial: document.getElementById("partialCount"),
    missing: document.getElementById("missingCount"),
    recommendation: document.getElementById("spstRecommendation"),
    summaryTitle: document.getElementById("summary-title"),
    summaryText: document.getElementById("summaryText"),
    summarySpst: document.getElementById("summarySpst")
  };

  const setPressed = (buttons, selected) => buttons.forEach(button => {
    button.setAttribute("aria-pressed", String(button === selected));
  });

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
    const [title, text] = outcomes[tone];

    elements.answered.textContent = String(values.length);
    elements.progress.style.width = `${values.length * 10}%`;
    elements.autonomy.textContent = autonomy === null ? "Autonomie ?" : `Autonomie A${autonomy}`;
    elements.title.textContent = title;
    elements.text.textContent = text;
    elements.summaryTitle.textContent = title;
    elements.summaryText.textContent = text;
    elements.documented.textContent = String(documented);
    elements.partial.textContent = String(partial);
    elements.missing.textContent = String(missing);
    elements.recommendation.hidden = !recommendSpst;
    elements.summarySpst.hidden = !recommendSpst;
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
  setPressed(autonomyButtons, null);
  autonomyButtons.forEach(button => button.addEventListener("click", () => {
    autonomy = Number(button.dataset.autonomy);
    setPressed(autonomyButtons, button);
    render();
  }));

  const impactButtons = [...document.querySelectorAll("[data-impact]")];
  setPressed(impactButtons, null);
  impactButtons.forEach(button => button.addEventListener("click", () => {
    workImpact = button.dataset.impact;
    setPressed(impactButtons, button);
    render();
  }));

  document.getElementById("printAssessment")?.addEventListener("click", () => window.print());
  document.getElementById("resetAssessment")?.addEventListener("click", () => {
    answers.clear();
    autonomy = null;
    workImpact = null;
    document.querySelectorAll(".question-card").forEach(card => card.classList.remove("is-documented", "is-partial", "is-missing"));
    setPressed([...document.querySelectorAll("[data-answer]")], null);
    setPressed(autonomyButtons, null);
    setPressed(impactButtons, null);
    render();
  });

  render();
})();
