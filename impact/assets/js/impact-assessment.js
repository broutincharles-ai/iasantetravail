(() => {
  "use strict";

  const CONFIG = window.IAHT_CONFIG || {};
  const STORAGE_KEY = "iaht_assessments_v1";
  const CONTACT_EMAIL = (CONFIG.contactEmail || "santetravailia@gmail.com").trim();
  const MAX_LOCAL_RECORDS = 50;

  const dimensions = {
    intensity: { label: "Intensité & temps de travail", short: ["Intensité", "& temps"], weight: 1, description: "Charge, rythme, délais, interruptions et débordements liés au projet." },
    emotional: { label: "Exigences émotionnelles", short: ["Exigences", "émotionnelles"], weight: 1, description: "Situations difficiles, régulation émotionnelle et exposition aux conséquences des erreurs." },
    autonomy: { label: "Autonomie", short: ["Autonomie"], weight: 1, description: "Marges de manœuvre, possibilité de corriger, de déroger ou d’interrompre l’usage." },
    social: { label: "Rapports sociaux", short: ["Rapports", "sociaux"], weight: 1, description: "Coopération, soutien, participation et répartition des responsabilités." },
    values: { label: "Conflits de valeurs", short: ["Conflits", "de valeurs"], weight: 1, description: "Qualité empêchée, éthique professionnelle et sens du travail." },
    insecurity: { label: "Insécurité de la situation de travail", short: ["Insécurité", "du travail"], weight: 1, description: "Incertitude sur les rôles, l’emploi, l’organisation et les trajectoires professionnelles." },
    opacity: { label: "Opacité & contestabilité", short: ["Opacité &", "contestation"], weight: 1, description: "Compréhension des sorties, traçabilité, recours humain et possibilité de discuter une recommandation." },
    supervision: { label: "Charge cognitive de supervision", short: ["Charge de", "supervision"], weight: 1, description: "Vigilance, vérification, correction et responsabilité liées au contrôle des productions de l’IA." },
    skills: { label: "Érosion des compétences", short: ["Érosion des", "compétences"], weight: 1, description: "Perte de pratique, dépendance à l’outil et réduction des possibilités d’apprentissage." }
  };

  const scales = {
    frequency: [
      { label: "Pas du tout", score: 0 },
      { label: "Rarement", score: 1 },
      { label: "Parfois", score: 2 },
      { label: "Souvent", score: 3 },
      { label: "Systématiquement", score: 4 }
    ],
    impact: [
      { label: "Aucun impact", score: 0 },
      { label: "Impact faible", score: 1 },
      { label: "Impact modéré", score: 2 },
      { label: "Impact important", score: 3 },
      { label: "Impact très important", score: 4 }
    ],
    control: [
      { label: "Oui, totalement", score: 0 },
      { label: "En grande partie", score: 1 },
      { label: "Partiellement", score: 2 },
      { label: "Très peu", score: 3 },
      { label: "Pas du tout", score: 4 }
    ],
    clarity: [
      { label: "Très clair et formalisé", score: 0 },
      { label: "Plutôt clair", score: 1 },
      { label: "Inégal ou incomplet", score: 2 },
      { label: "Peu clair", score: 3 },
      { label: "Opaque ou non défini", score: 4 }
    ]
  };

  const coreQuestions = [
    { id: "Q01", dims: { intensity: 1 }, scale: "impact", category: "Gollac 1 · Intensité", title: "Le projet risque-t-il d’augmenter le volume de travail attendu ou d’accélérer les cadences ?", help: "Tenez compte des objectifs relevés après les gains de temps annoncés et du temps réel nécessaire pour terminer le travail." },
    { id: "Q02", dims: { intensity: 1 }, scale: "frequency", category: "Gollac 1 · Intensité", title: "L’IA créera-t-elle davantage d’interruptions, d’alertes, de priorités changeantes ou de débordements horaires ?", help: "Incluez les sollicitations en temps réel et les corrections réalisées dans l’urgence." },

    { id: "Q03", dims: { emotional: 1 }, scale: "impact", category: "Gollac 2 · Exigences émotionnelles", title: "Le système exposera-t-il davantage les travailleurs à des situations humaines difficiles ou conflictuelles ?", help: "Par exemple : contestation d’une décision, réclamation, détresse, agressivité ou réparation d’une erreur produite par l’IA." },
    { id: "Q04", dims: { emotional: 1 }, scale: "impact", category: "Gollac 2 · Exigences émotionnelles", title: "L’outil imposera-t-il des scripts, tonalités ou réponses standardisées difficiles à concilier avec la relation humaine ?", help: "Évaluez le risque de devoir afficher ou contenir des émotions de façon artificielle." },

    { id: "Q05", dims: { autonomy: 1 }, scale: "control", category: "Gollac 3 · Autonomie", title: "Les travailleurs pourront-ils corriger, ignorer ou interrompre une recommandation sans être pénalisés ?", help: "La reprise en main doit être réelle dans les délais et objectifs habituels.", critical: score => score >= 4 ? "Absence de reprise en main effective ou pénalisation des dérogations." : null },
    { id: "Q06", dims: { autonomy: 1 }, scale: "impact", category: "Gollac 3 · Autonomie", title: "Dans quelle mesure le système réduira-t-il la liberté de choisir la méthode, l’ordre ou le rythme du travail ?", help: "Pensez aux workflows imposés, scores, recommandations permanentes ou attributions automatiques." },

    { id: "Q07", dims: { social: 1 }, scale: "control", category: "Gollac 4 · Rapports sociaux", title: "Les travailleurs concernés et leurs représentants sont-ils réellement associés à la définition et aux essais de l’usage ?", help: "La participation doit pouvoir modifier le projet, pas seulement informer une fois la décision prise." },
    { id: "Q08", dims: { social: 1 }, scale: "clarity", category: "Gollac 4 · Rapports sociaux", title: "Le soutien, la formation et la répartition des responsabilités en cas de difficulté sont-ils clairement organisés ?", help: "Évitez qu’un utilisateur supporte seul une erreur issue d’un système qu’il ne maîtrise pas." },

    { id: "Q09", dims: { values: 1 }, scale: "impact", category: "Gollac 5 · Conflits de valeurs", title: "L’IA risque-t-elle de privilégier la vitesse ou la quantité au détriment de la qualité du travail ?", help: "Incluez la qualité relationnelle, la précision, la sécurité et le temps nécessaire pour bien faire." },
    { id: "Q10", dims: { values: 1 }, scale: "impact", category: "Gollac 5 · Conflits de valeurs", title: "Le projet peut-il placer les travailleurs en conflit avec leur éthique, leurs règles professionnelles ou le sens de leur métier ?", help: "Pensez aux recommandations injustes, à la standardisation excessive et aux décisions difficiles à assumer." },

    { id: "Q11", dims: { insecurity: 1 }, scale: "clarity", category: "Gollac 6 · Insécurité", title: "Les effets attendus sur les rôles, les emplois et l’organisation sont-ils expliqués de façon crédible et stable ?", help: "Une communication uniquement promotionnelle ou changeante entretient l’incertitude." },
    { id: "Q12", dims: { insecurity: 1 }, scale: "impact", category: "Gollac 6 · Insécurité", title: "Le projet risque-t-il de créer une incertitude durable sur l’avenir professionnel ou les critères d’évaluation ?", help: "Incluez les réorganisations, suppressions de tâches, changements de rôle et comparaisons automatisées." },

    { id: "Q13", dims: { opacity: 1 }, scale: "clarity", category: "Axe IA 1 · Opacité", title: "Les utilisateurs comprendront-ils suffisamment les critères, limites et incertitudes des recommandations produites ?", help: "Une explication utile doit permettre d’identifier une erreur et d’argumenter une contestation." },
    { id: "Q14", dims: { opacity: 1 }, scale: "control", category: "Axe IA 1 · Contestabilité", title: "Une personne affectée par une sortie de l’IA disposera-t-elle d’un recours humain rapide et capable de modifier la décision ?", help: "Le recours ne doit pas se réduire à une boîte de contact sans délai ni pouvoir d’action.", critical: score => score >= 4 ? "Absence de recours humain effectif pour contester une sortie de l’IA." : null },

    { id: "Q15", dims: { supervision: 1 }, scale: "impact", category: "Axe IA 2 · Supervision", title: "Quelle charge de vérification, de correction et de justification des productions de l’IA est anticipée ?", help: "Intégrez les erreurs plausibles, les omissions, le nettoyage des données et les reprises manuelles." },
    { id: "Q16", dims: { supervision: 1 }, scale: "impact", category: "Axe IA 2 · Supervision", title: "Le contrôle de l’IA exigera-t-il une vigilance cognitive soutenue difficilement compatible avec le temps disponible ?", help: "Pensez à la fatigue attentionnelle, au biais d’automatisation et à la responsabilité de détecter une erreur rare.", critical: score => score >= 4 ? "Charge de supervision cognitive très importante sans temps ou moyens suffisants." : null },

    { id: "Q17", dims: { skills: 1 }, scale: "impact", category: "Axe IA 3 · Compétences", title: "Le système risque-t-il de réduire la pratique, l’apprentissage ou la transmission des compétences du métier ?", help: "Incluez les tâches retirées aux débutants, la perte de raisonnement et la raréfaction des situations formatrices." },
    { id: "Q18", dims: { skills: 1 }, scale: "control", category: "Axe IA 3 · Compétences", title: "Le projet prévoit-il de maintenir la capacité à travailler de façon compétente lorsque l’outil est absent ou erroné ?", help: "Évaluez les exercices sans l’outil, la formation continue et la conservation des savoir-faire.", critical: score => score >= 4 ? "Dépendance complète à l’outil sans dispositif de maintien des compétences." : null }
  ];

  const actionLibrary = {
    intensity: {
      immediate: "Ne pas augmenter les objectifs sur la seule base du gain de temps théorique de l’IA.",
      short: "Mesurer charge réelle, interruptions, temps de correction et débordements pendant le pilote.",
      follow: "Ajuster objectifs, ressources, délais et règles de disponibilité à partir du travail observé."
    },
    emotional: {
      immediate: "Identifier les situations humaines difficiles déplacées vers les travailleurs par le système.",
      short: "Prévoir soutien, espaces de discussion et possibilité de sortir des scripts automatiques.",
      follow: "Suivre fatigue émotionnelle, conflits et qualité de la relation avec les usagers."
    },
    autonomy: {
      immediate: "Rendre la correction, la dérogation et l’arrêt possibles sans pénalisation.",
      short: "Tester la reprise en main dans les conditions réelles de délai et de performance.",
      follow: "Auditer l’écart entre autonomie annoncée et autonomie réellement exercée."
    },
    social: {
      immediate: "Clarifier qui décide, qui assiste, qui traite l’incident et qui assume la décision finale.",
      short: "Associer les travailleurs et leurs représentants aux essais et aux corrections.",
      follow: "Suivre coopération, isolement, conflits de responsabilité et qualité du soutien."
    },
    values: {
      immediate: "Définir les critères de qualité qui ne peuvent pas être sacrifiés à la productivité.",
      short: "Documenter les situations où une recommandation doit pouvoir être refusée.",
      follow: "Organiser des discussions régulières sur la qualité empêchée, l’éthique et le sens du travail."
    },
    insecurity: {
      immediate: "Expliquer les effets attendus sur les rôles, l’emploi et l’organisation sans promesse excessive.",
      short: "Mettre en place un accompagnement des transformations et des trajectoires professionnelles.",
      follow: "Suivre l’évolution réelle des tâches, des rôles et du sentiment d’insécurité."
    },
    opacity: {
      immediate: "Suspendre les usages à fort impact qui ne peuvent être expliqués ou contestés efficacement.",
      short: "Formaliser les limites connues, la traçabilité et la procédure de recours humain.",
      follow: "Analyser les contestations, les décisions modifiées et les situations incompréhensibles."
    },
    supervision: {
      immediate: "Allouer explicitement du temps et des moyens à la vérification des sorties.",
      short: "Tester la charge attentionnelle, les erreurs rares et le biais d’automatisation en situation réelle.",
      follow: "Suivre le temps de correction, la fatigue cognitive et les erreurs non détectées."
    },
    skills: {
      immediate: "Identifier les compétences menacées par l’automatisation et préserver les tâches formatrices.",
      short: "Prévoir apprentissage, exercices sans l’outil et transmission des savoir-faire.",
      follow: "Réévaluer la dépendance au système et la capacité à travailler en mode dégradé."
    }
  };

  const levelDefs = [
    { max: 24, key: "favorable", label: "Maîtrise favorable", color: "#547B67", summary: "Les garde-fous paraissent globalement structurés, sous réserve de vérifier leur fonctionnement dans le travail réel." },
    { max: 44, key: "watch", label: "Vigilance", color: "#9D7C38", summary: "Plusieurs points doivent être consolidés avant une généralisation du projet." },
    { max: 64, key: "significant", label: "Risque significatif", color: "#C27331", summary: "Le projet présente des tensions susceptibles d’affecter les conditions de travail ou la prévention sans mesures correctrices." },
    { max: 79, key: "high", label: "Risque élevé", color: "#B84B2D", summary: "Des modifications substantielles sont nécessaires avant de poursuivre ou d’étendre le déploiement." },
    { max: 100, key: "critical", label: "Risque critique", color: "#8F2530", summary: "Le projet comporte des conditions incompatibles avec un déploiement maîtrisé tant qu’elles ne sont pas corrigées." }
  ];

  const state = {
    context: null,
    questions: [],
    answers: {},
    currentIndex: 0,
    result: null
  };

  const els = {
    heroStart: document.getElementById("heroStart"),
    introStep: document.getElementById("introStep"),
    contextStep: document.getElementById("contextStep"),
    questionStep: document.getElementById("questionStep"),
    resultsStep: document.getElementById("resultsStep"),
    beginContext: document.getElementById("beginContext"),
    backIntro: document.getElementById("backIntro"),
    contextError: document.getElementById("contextError"),
    progressLabel: document.getElementById("progressLabel"),
    adaptiveLabel: document.getElementById("adaptiveLabel"),
    progressBar: document.getElementById("progressBar"),
    questionShell: document.getElementById("questionShell"),
    prevQuestion: document.getElementById("prevQuestion"),
    nextQuestion: document.getElementById("nextQuestion"),
    resultSummary: document.getElementById("resultSummary"),
    scoreOrbit: document.getElementById("scoreOrbit"),
    overallScore: document.getElementById("overallScore"),
    overallLevel: document.getElementById("overallLevel"),
    criticalAlerts: document.getElementById("criticalAlerts"),
    radarWrap: document.getElementById("radarWrap"),
    dimensionTable: document.getElementById("dimensionTable"),
    topPriorities: document.getElementById("topPriorities"),
    generatedReport: document.getElementById("generatedReport"),
    localAggregate: document.getElementById("localAggregate"),
    aggregateConsent: document.getElementById("aggregateConsent"),
    contributeStats: document.getElementById("contributeStats"),
    contributionMessage: document.getElementById("contributionMessage"),
    aggregateStatus: document.getElementById("aggregateStatus"),
    globalAggregate: document.getElementById("globalAggregate")
  };

  function activateStep(stepEl) {
    document.querySelectorAll(".step").forEach(el => el.classList.remove("active"));
    stepEl.classList.add("active");
    const current = stepEl.dataset.step || "intro";
    const card = document.querySelector(".assessment-card");
    if (card) card.dataset.currentStep = current;
    document.querySelectorAll("[data-rail-step]").forEach(item => {
      item.classList.toggle("is-current", item.dataset.railStep === current);
      item.classList.toggle("is-done", ["intro","context","questions","results"].indexOf(item.dataset.railStep) < ["intro","context","questions","results"].indexOf(current));
    });
    const cardTop = card.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: cardTop, behavior: "smooth" });
  }

  function buildQuestionSet() {
    return [...coreQuestions];
  }

  function selectedUseTypes() {
    return [...document.querySelectorAll('input[name="useType"]:checked')].map(el => el.value);
  }

  function collectContext() {
    return {
      sector: document.getElementById("sector").value,
      orgSize: document.getElementById("orgSize").value,
      projectStage: document.getElementById("projectStage").value,
      population: document.getElementById("population").value,
      assessmentDate: document.getElementById("assessmentDate").value,
      useTypes: selectedUseTypes()
    };
  }

  function validateContext(context) {
    if (!context.sector || !context.orgSize || !context.projectStage || !context.population || !context.assessmentDate) {
      return "Complétez les catégories de contexte et la date de l’évaluation.";
    }
    if (context.assessmentDate > new Date().toISOString().slice(0, 10)) {
      return "La date de l’évaluation ne peut pas être située dans le futur.";
    }
    if (!context.useTypes.length) {
      return "Sélectionnez au moins un usage de l’IA.";
    }
    return "";
  }

  function renderQuestion() {
    const q = state.questions[state.currentIndex];
    const options = q.options || scales[q.scale];
    const saved = state.answers[q.id];
    const labels = Object.keys(q.dims).map(key => dimensions[key].label);
    const progress = ((state.currentIndex + 1) / state.questions.length) * 100;

    els.progressLabel.textContent = `Question ${state.currentIndex + 1} sur ${state.questions.length}`;
    els.adaptiveLabel.textContent = "18 questions · 9 axes";
    els.progressBar.style.width = `${progress}%`;

    els.questionShell.innerHTML = `
      <div class="question-meta">
        <span>${escapeHtml(q.category)}</span>
        ${q.conditional ? '<span class="conditional">Adaptée à votre usage</span>' : ""}
        ${labels.slice(0, 2).map(label => `<span>${escapeHtml(label)}</span>`).join("")}
      </div>
      <h3 class="question-title" id="questionTitle">${escapeHtml(q.title)}</h3>
      <p class="question-help">${escapeHtml(q.help)}</p>
      <fieldset class="answer-list" aria-labelledby="questionTitle">
        <legend class="visually-hidden">Choisissez une réponse</legend>
        ${options.map((option, index) => `
          <label class="answer-option">
            <input type="radio" name="answer" value="${option.score}" data-index="${index}" ${saved && Number(saved.score) === Number(option.score) ? "checked" : ""}>
            <span>${escapeHtml(option.label)}</span>
          </label>
        `).join("")}
      </fieldset>
    `;

    els.prevQuestion.disabled = state.currentIndex === 0;
    els.nextQuestion.disabled = saved == null;
    els.nextQuestion.textContent = state.currentIndex === state.questions.length - 1 ? "Voir les résultats" : "Suivante";

    els.questionShell.querySelectorAll('input[name="answer"]').forEach(input => {
      input.addEventListener("change", () => {
        const optionIndex = Number(input.dataset.index);
        const option = options[optionIndex];
        state.answers[q.id] = { score: Number(option.score), label: option.label };
        els.nextQuestion.disabled = false;
      });
    });

    const checked = els.questionShell.querySelector('input[name="answer"]:checked');
    if (checked) checked.focus({ preventScroll: true });
    else els.questionShell.querySelector('input[name="answer"]')?.focus({ preventScroll: true });
  }

  function computeResult() {
    const sums = {};
    Object.keys(dimensions).forEach(key => sums[key] = { value: 0, max: 0 });
    const criticalFlags = [];

    state.questions.forEach(q => {
      const answer = state.answers[q.id];
      if (!answer) return;
      Object.entries(q.dims).forEach(([dim, weight]) => {
        sums[dim].value += answer.score * weight;
        sums[dim].max += 4 * weight;
      });
      if (typeof q.critical === "function") {
        const flag = q.critical(answer.score);
        if (flag) criticalFlags.push(flag);
      }
    });

    // Règles transversales centrées sur les trois axes propres à l’IA.
    if ((state.answers.Q14?.score ?? 0) >= 4 && ["rh", "health", "management"].some(type => state.context.useTypes.includes(type))) {
      criticalFlags.push("Absence de recours humain effectif pour un usage susceptible d’affecter une décision importante.");
    }
    if ((state.answers.Q15?.score ?? 0) >= 3 && (state.answers.Q16?.score ?? 0) >= 3) {
      criticalFlags.push("Charge importante de vérification associée à une vigilance cognitive soutenue.");
    }
    if ((state.answers.Q17?.score ?? 0) >= 3 && (state.answers.Q18?.score ?? 0) >= 4) {
      criticalFlags.push("Risque élevé d’érosion des compétences et de dépendance opérationnelle à l’outil.");
    }

    const dimensionScores = {};
    Object.entries(sums).forEach(([key, sum]) => {
      dimensionScores[key] = sum.max ? Math.round((sum.value / sum.max) * 100) : 0;
    });

    const weighted = Object.entries(dimensionScores).reduce((acc, [key, score]) => {
      acc.value += score * dimensions[key].weight;
      acc.weight += dimensions[key].weight;
      return acc;
    }, { value: 0, weight: 0 });
    const overall = Math.round(weighted.value / weighted.weight);
    const baseLevel = getLevel(overall);
    let effectiveLevel = baseLevel;
    if (criticalFlags.length >= 3) effectiveLevel = levelDefs[4];
    else if (criticalFlags.length && levelDefs.indexOf(baseLevel) < 3) effectiveLevel = levelDefs[3];

    return {
      id: createId(),
      completedAt: new Date().toISOString(),
      month: (state.context.assessmentDate || new Date().toISOString().slice(0, 10)).slice(0, 7),
      appVersion: CONFIG.appVersion || "0.6.0",
      context: { ...state.context },
      overall,
      baseLevel: baseLevel.key,
      effectiveLevel: effectiveLevel.key,
      levelLabel: effectiveLevel.label,
      levelColor: effectiveLevel.color,
      levelSummary: effectiveLevel.summary,
      dimensions: dimensionScores,
      criticalFlags: unique(criticalFlags),
      answers: { ...state.answers }
    };
  }

  function getLevel(score) {
    return levelDefs.find(level => score <= level.max) || levelDefs[levelDefs.length - 1];
  }

  function renderResults(result) {
    state.result = result;
    saveLocalResult(result);

    els.overallScore.textContent = result.overall;
    els.overallLevel.textContent = result.levelLabel;
    els.resultSummary.textContent = result.criticalFlags.length
      ? `${result.levelSummary} ${result.criticalFlags.length} signal${result.criticalFlags.length > 1 ? "aux" : ""} critique${result.criticalFlags.length > 1 ? "s" : ""} impose${result.criticalFlags.length > 1 ? "nt" : ""} une instruction spécifique avant toute poursuite.`
      : result.levelSummary;
    els.scoreOrbit.style.setProperty("--score", result.overall);
    els.scoreOrbit.style.setProperty("--score-color", result.levelColor);

    if (result.criticalFlags.length) {
      els.criticalAlerts.hidden = false;
      els.criticalAlerts.innerHTML = `<h3>Signaux critiques à traiter avant toute généralisation</h3><ul>${result.criticalFlags.map(flag => `<li>${escapeHtml(flag)}</li>`).join("")}</ul>`;
    } else {
      els.criticalAlerts.hidden = true;
      els.criticalAlerts.innerHTML = "";
    }

    els.radarWrap.innerHTML = buildRadarSvg(result.dimensions);
    els.dimensionTable.innerHTML = buildDimensionTable(result.dimensions);
    renderPriorities(result.dimensions);
    els.generatedReport.innerHTML = buildReport(result);
    renderLocalAggregate(result);
    setupContributionState();
    activateStep(els.resultsStep);
  }

  function buildRadarSvg(scores) {
    const keys = Object.keys(dimensions);
    const size = 560;
    const cx = 280;
    const cy = 270;
    const radius = 185;
    const labelRadius = 232;
    const point = (angle, r) => [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
    const polygon = (r) => keys.map((_, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI * 2 / keys.length);
      return point(angle, r).join(",");
    }).join(" ");

    const grid = [0.2, 0.4, 0.6, 0.8, 1].map(frac => `<polygon class="radar-grid" points="${polygon(radius * frac)}"></polygon>`).join("");
    const axes = keys.map((_, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI * 2 / keys.length);
      const [x, y] = point(angle, radius);
      return `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"></line>`;
    }).join("");
    const areaPoints = keys.map((key, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI * 2 / keys.length);
      return point(angle, radius * (scores[key] / 100)).join(",");
    }).join(" ");
    const points = keys.map((key, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI * 2 / keys.length);
      const [x, y] = point(angle, radius * (scores[key] / 100));
      return `<circle class="radar-point" cx="${x}" cy="${y}" r="4"><title>${escapeHtml(dimensions[key].label)} : ${scores[key]}/100</title></circle>`;
    }).join("");
    const labels = keys.map((key, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI * 2 / keys.length);
      const [x, y] = point(angle, labelRadius);
      const anchor = Math.cos(angle) > .25 ? "start" : Math.cos(angle) < -.25 ? "end" : "middle";
      const lines = dimensions[key].short;
      const firstY = y - ((lines.length - 1) * 7);
      return `<text class="radar-label" x="${x}" y="${firstY}" text-anchor="${anchor}">${lines.map((line, idx) => `<tspan x="${x}" dy="${idx ? 14 : 0}">${escapeHtml(line)}</tspan>`).join("")}<tspan x="${x}" dy="14" opacity=".58">${scores[key]}/100</tspan></text>`;
    }).join("");

    return `<svg viewBox="0 0 ${size} 540" role="img" aria-labelledby="radarTitle radarDesc">
      <title id="radarTitle">Profil des risques par dimension</title>
      <desc id="radarDesc">Plus la surface s’étend vers l’extérieur, plus le niveau de risque estimé est élevé.</desc>
      ${grid}${axes}<polygon class="radar-area" points="${areaPoints}"></polygon>${points}${labels}
    </svg>`;
  }

  function buildDimensionTable(scores) {
    return Object.entries(scores).map(([key, score]) => `
      <div class="dimension-row">
        <span>${escapeHtml(dimensions[key].label)}</span>
        <span class="bar"><i style="width:${score}%;background:${getLevel(score).color}"></i></span>
        <strong>${score}</strong>
      </div>
    `).join("");
  }

  function renderPriorities(scores) {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 4);
    els.topPriorities.innerHTML = sorted.map(([key, score]) => `
      <div class="priority-item">
        <div class="row"><strong>${escapeHtml(dimensions[key].label)}</strong><b>${score}</b></div>
        <p>${escapeHtml(dimensions[key].description)}</p>
        <div class="priority-meter"><i style="width:${score}%;background:${getLevel(score).color}"></i></div>
      </div>
    `).join("");
  }

  function buildReport(result) {
    const sorted = Object.entries(result.dimensions).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 4);
    const priorityKeys = unique([
      ...top.map(([key]) => key),
      ...(result.criticalFlags.length ? ["opacity", "supervision", "skills"] : [])
    ]).slice(0, 6);
    const contextLabels = formatContext(result.context);
    const involvement = buildOccupationalHealthGuidance(result);

    return `
      <header class="report-cover">
        <div>
          <span class="mini-kicker">IA & Santé au Travail</span>
          <h1>Rapport d’évaluation d’impact IA & travail</h1>
          <p>Outil empirique élaboré par le Dr Charles Broutin à partir des six facteurs du cadre Gollac, orientés vers l’intelligence artificielle et la santé au travail.</p>
        </div>
        <div class="report-meta">
          <strong>Référence ${escapeHtml(result.id.slice(0, 8).toUpperCase())}</strong><br>
          Date de l’évaluation : ${formatDateFr(result.context.assessmentDate)}<br>
          Rapport généré : ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(result.completedAt))}<br>
          Version ${escapeHtml(result.appVersion)}
        </div>
      </header>

      <section class="report-section">
        <h2>1. Synthèse décisionnelle</h2>
        <p>Le projet obtient un score global de <strong>${result.overall}/100</strong>, correspondant au niveau <strong>${escapeHtml(result.levelLabel)}</strong>. ${escapeHtml(result.levelSummary)}</p>
        <div class="report-callout ${result.criticalFlags.length ? "warning" : ""}">
          <strong>${result.criticalFlags.length ? "Décision suggérée : ne pas généraliser en l’état." : "Décision suggérée : poursuivre sous conditions."}</strong>
          <p>${result.criticalFlags.length ? "Les signaux critiques doivent être levés et documentés avant toute extension du projet." : "Les mesures prioritaires ci-dessous doivent être intégrées au cadrage, au pilote et au suivi."}</p>
        </div>
        ${result.criticalFlags.length ? `<h3>Signaux critiques</h3><ul>${result.criticalFlags.map(flag => `<li>${escapeHtml(flag)}</li>`).join("")}</ul>` : ""}
      </section>

      <section class="report-section">
        <h2>2. Contexte déclaré</h2>
        <ul>
          <li><strong>Secteur :</strong> ${escapeHtml(contextLabels.sector)}</li>
          <li><strong>Taille :</strong> ${escapeHtml(contextLabels.orgSize)}</li>
          <li><strong>Stade :</strong> ${escapeHtml(contextLabels.projectStage)}</li>
          <li><strong>Population exposée :</strong> ${escapeHtml(contextLabels.population)}</li>
          <li><strong>Date de l’évaluation :</strong> ${formatDateFr(result.context.assessmentDate)}</li>
          <li><strong>Usages :</strong> ${contextLabels.useTypes.map(escapeHtml).join(", ")}</li>
        </ul>
      </section>

      <section class="report-section">
        <h2>3. Profil par dimension</h2>
        <p>Un score élevé indique que les réponses décrivent davantage de facteurs de risque ou moins de garde-fous. Il ne mesure pas un état de santé individuel.</p>
        <div class="report-score-grid">
          ${Object.entries(result.dimensions).map(([key, score]) => `<div><strong>${escapeHtml(dimensions[key].label)}</strong><span style="color:${getLevel(score).color}">${score}</span></div>`).join("")}
        </div>
      </section>

      <section class="report-section">
        <h2>4. Priorités de prévention</h2>
        <ol>
          ${top.map(([key, score]) => `<li><strong>${escapeHtml(dimensions[key].label)} — ${score}/100.</strong> ${escapeHtml(dimensions[key].description)}</li>`).join("")}
        </ol>
        <div class="action-timeline">
          <div class="action-column"><h3>Avant de poursuivre</h3><ul>${priorityKeys.map(key => `<li>${escapeHtml(actionLibrary[key].immediate)}</li>`).join("")}</ul></div>
          <div class="action-column"><h3>Pendant le pilote</h3><ul>${priorityKeys.map(key => `<li>${escapeHtml(actionLibrary[key].short)}</li>`).join("")}</ul></div>
          <div class="action-column"><h3>Après déploiement</h3><ul>${priorityKeys.map(key => `<li>${escapeHtml(actionLibrary[key].follow)}</li>`).join("")}</ul></div>
        </div>
      </section>

      <section class="report-section">
        <h2>5. Implication de la santé au travail</h2>
        ${involvement}
      </section>

      <section class="report-section">
        <h2>6. Conditions minimales de prévention</h2>
        <ul>
          <li>Documenter la finalité, le responsable, les populations concernées, les données utilisées et les usages interdits.</li>
          <li>Conserver les résultats du pilote, les erreurs observées, les décisions de correction et les critères d’arrêt.</li>
          <li>Prévoir un recours humain effectif, une procédure d’incident et une solution de repli.</li>
          <li>Mettre à jour l’évaluation des risques lorsque le système, son fournisseur, ses données ou l’organisation changent.</li>
          <li>Vérifier séparément les obligations juridiques applicables au cas concret.</li>
        </ul>
      </section>

      <section class="report-section">
        <h2>7. Contribution volontaire et anonyme</h2>
        <p>Après vérification de l’absence de toute donnée permettant d’identifier une entreprise, une personne ou un fournisseur, ce rapport peut être transmis volontairement à <strong>${escapeHtml(CONTACT_EMAIL)}</strong> afin de contribuer à faire émerger des tendances et à améliorer la démarche.</p>
        <p>Aucun envoi n’est automatique. La décision de transmettre le document et son anonymisation relèvent entièrement de son détenteur.</p>
      </section>

      <section class="report-section">
        <p class="report-disclaimer"><strong>Statut et limites.</strong> Cet outil empirique est construit à partir du cadre de lecture reconnu des six facteurs de risques psychosociaux du rapport Gollac, complété par trois axes propres aux usages de l’IA : opacité et contestabilité, charge cognitive de supervision et érosion des compétences. Cette adaptation n’a pas elle-même fait l’objet d’une validation psychométrique ou prédictive. Le rapport est produit automatiquement à partir de réponses déclaratives. Il ne constitue ni un diagnostic, ni une certification, ni une preuve de conformité et ne remplace pas l’observation du travail, la consultation des travailleurs et de leurs représentants, ni les évaluations réglementaire, médicale, ergonomique, technique, de sécurité ou de protection des données adaptées au projet.</p>
      </section>
    `;
  }

  function buildOccupationalHealthGuidance(result) {
    const highDims = Object.entries(result.dimensions).filter(([, score]) => score >= 45).map(([key]) => dimensions[key].label);
    const urgent = result.criticalFlags.length || result.overall >= 65;
    const contextTrigger = ["management", "rh", "monitoring", "health", "physical"].some(type => result.context.useTypes.includes(type));
    const wording = urgent
      ? "L’association du service de prévention et de santé au travail doit intervenir avant toute poursuite ou extension du déploiement."
      : result.overall >= 45 || contextTrigger
        ? "Une association en amont du service de prévention et de santé au travail est fortement recommandée avant la généralisation."
        : "Une revue préventive avec le service de prévention et de santé au travail reste pertinente pour vérifier les conditions réelles du pilote.";

    return `
      <p><strong>${escapeHtml(wording)}</strong></p>
      ${highDims.length ? `<p>Les dimensions appelant une instruction prioritaire sont : ${highDims.map(escapeHtml).join(", ")}.</p>` : ""}
      <ul>
        <li><strong>Médecin du travail :</strong> conseil sur les effets possibles de la transformation, les populations vulnérables, les signaux de santé et les conditions de suivi.</li>
        <li><strong>Équipe pluridisciplinaire / IPRP / ergonomie :</strong> analyse de l’activité réelle, des interfaces, des marges de manœuvre, de la charge et des scénarios d’incident.</li>
        <li><strong>Employeur et prévention :</strong> intégration dans l’évaluation des risques, choix des mesures collectives et formalisation des critères d’arrêt.</li>
        <li><strong>CSE et représentants des travailleurs :</strong> discussion des transformations technologiques, organisationnelles et des modalités de contrôle.</li>
      </ul>
      <div class="report-callout"><strong>Moment optimal :</strong><p>avant le choix définitif de la solution et avant que les objectifs, workflows, données et modalités de surveillance soient figés.</p></div>
    `;
  }

  function saveLocalResult(result) {
    const records = getLocalRecords();
    const summary = summaryPayload(result);
    const filtered = records.filter(item => item.id !== summary.id);
    filtered.push(summary);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(-MAX_LOCAL_RECORDS)));
    } catch (error) {
      console.warn("Historique local indisponible dans ce navigateur.", error);
    }
  }

  function getLocalRecords() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function renderLocalAggregate(current) {
    const records = getLocalRecords();
    const avg = records.length ? Math.round(records.reduce((sum, item) => sum + item.overall, 0) / records.length) : current.overall;
    const highCount = records.filter(item => item.overall >= 65 || (item.criticalCount || 0) > 0).length;
    const percentile = records.length > 1
      ? Math.round((records.filter(item => item.overall <= current.overall).length / records.length) * 100)
      : 100;
    const dimTotals = {};
    records.forEach(item => Object.entries(item.dimensions || {}).forEach(([key, value]) => dimTotals[key] = (dimTotals[key] || 0) + value));
    const dominant = Object.entries(dimTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || Object.entries(current.dimensions).sort((a, b) => b[1] - a[1])[0][0];

    els.localAggregate.innerHTML = `
      <div class="aggregate-stat"><strong>${records.length}</strong><span>évaluation${records.length > 1 ? "s" : ""} conservée${records.length > 1 ? "s" : ""} dans ce navigateur</span></div>
      <div class="aggregate-stat"><strong>${avg}</strong><span>score moyen local sur 100</span></div>
      <div class="aggregate-stat"><strong>${records.length > 1 ? percentile + "e" : "—"}</strong><span>percentile de risque de ce projet dans l’historique local</span></div>
      <div class="aggregate-stat"><strong>${highCount}</strong><span>projet${highCount > 1 ? "s" : ""} à risque élevé ou avec signal critique · priorité dominante : ${escapeHtml(dimensions[dominant].label)}</span></div>
    `;
  }

  function setupContributionState() {
    const endpoint = (CONFIG.aggregateEndpoint || "").trim();
    els.aggregateConsent.checked = false;
    els.contributeStats.disabled = true;
    if (endpoint) {
      els.contributionMessage.textContent = "L’envoi ne sera effectué qu’après votre consentement explicite.";
      els.aggregateStatus.textContent = "Collecte collective disponible";
      loadGlobalStats(endpoint);
    } else {
      els.contributionMessage.textContent = "La collecte collective n’est pas encore configurée. Les statistiques ci-dessus restent uniquement dans ce navigateur.";
      els.aggregateStatus.textContent = "Données locales uniquement";
      els.globalAggregate.hidden = true;
    }
  }

  async function contributeStats() {
    const endpoint = (CONFIG.aggregateEndpoint || "").trim();
    if (!endpoint || !state.result || !els.aggregateConsent.checked) return;
    els.contributeStats.disabled = true;
    els.contributeStats.textContent = "Envoi…";
    try {
      const payload = summaryPayload(state.result);
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      els.contributionMessage.textContent = "Contribution envoyée. Merci d’aider à construire un référentiel collectif.";
      els.contributeStats.textContent = "Contribution envoyée";
      els.aggregateConsent.disabled = true;
    } catch (error) {
      console.error(error);
      els.contributionMessage.textContent = "L’envoi n’a pas abouti. Aucune donnée n’a été supprimée de votre navigateur.";
      els.contributeStats.textContent = "Réessayer";
      els.contributeStats.disabled = false;
    }
  }

  function loadGlobalStats(endpoint) {
    const callback = `iahtStats_${Date.now()}`;
    const script = document.createElement("script");
    const cleanup = () => {
      delete window[callback];
      script.remove();
    };
    window[callback] = data => {
      try {
        if (data && data.ok && data.stats) renderGlobalAggregate(data.stats);
      } finally {
        cleanup();
      }
    };
    script.onerror = cleanup;
    script.src = `${endpoint}${endpoint.includes("?") ? "&" : "?"}action=stats&callback=${encodeURIComponent(callback)}`;
    document.head.appendChild(script);
    setTimeout(cleanup, 12000);
  }

  function renderGlobalAggregate(stats) {
    els.globalAggregate.hidden = false;
    els.globalAggregate.innerHTML = `
      <h4>Référentiel collectif disponible</h4>
      <div class="aggregate-grid">
        <div class="aggregate-stat"><strong>${Number(stats.n || 0)}</strong><span>évaluations agrégées</span></div>
        <div class="aggregate-stat"><strong>${Math.round(Number(stats.averageOverall || 0))}</strong><span>score global moyen</span></div>
        <div class="aggregate-stat"><strong>${Math.round(Number(stats.criticalRate || 0))}%</strong><span>avec au moins un signal critique</span></div>
        <div class="aggregate-stat"><strong>${escapeHtml(stats.topDimensionLabel || "—")}</strong><span>dimension moyenne la plus élevée</span></div>
      </div>
    `;
    els.aggregateStatus.textContent = `${Number(stats.n || 0)} contributions collectives`;
  }

  function summaryPayload(result) {
    return {
      id: result.id,
      month: result.month,
      appVersion: result.appVersion,
      sector: result.context.sector,
      orgSize: result.context.orgSize,
      projectStage: result.context.projectStage,
      population: result.context.population,
      useTypes: [...result.context.useTypes],
      overall: result.overall,
      level: result.effectiveLevel,
      criticalCount: result.criticalFlags.length,
      dimensions: { ...result.dimensions }
    };
  }

  function downloadReportHtml() {
    if (!state.result) return;
    const title = "Rapport d’évaluation d’impact IA & travail";
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>
      body{font-family:Arial,sans-serif;color:#17140F;line-height:1.55;max-width:980px;margin:40px auto;padding:0 24px;background:#F8F4EC}h1,h2,h3{font-family:Georgia,serif}h1{font-size:42px}h2{margin-top:30px}.report-cover{display:grid;grid-template-columns:1fr auto;gap:24px;border-bottom:1px solid #ccc;padding-bottom:20px}.report-meta{text-align:right;font-size:12px}.report-section{background:#fff;padding:24px;margin:12px 0;border-radius:16px}.report-score-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.report-score-grid div,.action-column{border:1px solid #ddd;border-radius:10px;padding:12px}.report-score-grid span{display:block;font-size:24px}.action-timeline{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.report-callout{padding:14px;background:#eef3ef;border-left:4px solid #3D5B52;margin-top:12px}.warning{background:#fff0e8;border-color:#C05F2B}.mini-kicker{text-transform:uppercase;letter-spacing:.12em;font-size:11px;color:#A84E1F}.report-disclaimer{font-size:12px;color:#666}@media(max-width:700px){.report-score-grid{grid-template-columns:repeat(2,1fr)}.action-timeline,.report-cover{grid-template-columns:1fr}.report-meta{text-align:left}}@media print{body{background:#fff;margin:0}.report-section{break-inside:avoid}}
    </style></head><body>${els.generatedReport.innerHTML}</body></html>`;
    downloadBlob(html, `rapport-impact-ia-${safeDate(state.result.context.assessmentDate)}-${state.result.id.slice(0, 8)}.html`, "text/html;charset=utf-8");
  }

  function downloadResultJson() {
    if (!state.result) return;
    const exportData = {
      schema: "iaht-impact-assessment-gollac-ia-0.6",
      generatedAt: new Date().toISOString(),
      result: state.result,
      note: "Outil empirique fondé sur les six facteurs du cadre Gollac et trois axes propres à l’IA. Cette adaptation n’est pas un questionnaire psychométrique validé et ne constitue ni un diagnostic, ni une certification, ni une preuve de conformité."
    };
    downloadBlob(JSON.stringify(exportData, null, 2), `impact-ia-${safeDate(state.result.context.assessmentDate)}-${state.result.id.slice(0, 8)}.json`, "application/json;charset=utf-8");
  }

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function restart() {
    state.context = null;
    state.questions = [];
    state.answers = {};
    state.currentIndex = 0;
    state.result = null;
    els.contextStep.reset();
    const dateInput = document.getElementById("assessmentDate");
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
    els.contextError.textContent = "";
    activateStep(els.introStep);
  }

  function formatContext(context) {
    const map = {
      sector: {
        sante: "Santé, médico-social ou prévention",
        industrie: "Industrie, logistique ou construction",
        services: "Services, conseil ou fonctions support",
        public: "Administration ou service public",
        commerce: "Commerce, hôtellerie ou relation client",
        education: "Éducation, recherche ou formation",
        autre: "Autre secteur"
      },
      orgSize: { "1-10": "1 à 10 travailleurs", "11-49": "11 à 49", "50-249": "50 à 249", "250-999": "250 à 999", "1000+": "1 000 ou plus" },
      projectStage: { idee: "Cadrage ou choix de solution", pilot: "Pilote limité", rollout: "Déploiement en cours", deployed: "Déjà généralisé" },
      population: { "1-10": "1 à 10 personnes", "11-50": "11 à 50", "51-250": "51 à 250", "251+": "Plus de 250" },
      useTypes: {
        genai: "Assistant génératif",
        management: "Organisation du travail",
        rh: "Décisions RH",
        monitoring: "Suivi ou contrôle",
        health: "Santé ou sécurité",
        physical: "Système physique"
      }
    };
    return {
      sector: map.sector[context.sector] || context.sector,
      orgSize: map.orgSize[context.orgSize] || context.orgSize,
      projectStage: map.projectStage[context.projectStage] || context.projectStage,
      population: map.population[context.population] || context.population,
      useTypes: context.useTypes.map(type => map.useTypes[type] || type)
    };
  }

  function formatDateFr(value) {
    if (!value) return "—";
    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
  }

  function safeDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value || "") ? value : new Date().toISOString().slice(0, 10);
  }

  function printPdf() {
    if (!state.result) return;
    const previousTitle = document.title;
    document.title = `rapport-impact-ia-${safeDate(state.result.context.assessmentDate)}-${state.result.id.slice(0, 8)}`;
    const restore = () => { document.title = previousTitle; window.removeEventListener("afterprint", restore); };
    window.addEventListener("afterprint", restore);
    window.print();
    setTimeout(restore, 1500);
  }

  function createId() {
    if (crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return `iaht-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function unique(items) {
    return [...new Set(items)];
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  }

  document.querySelector('[data-rail-step="intro"]')?.classList.add("is-current");

  const assessmentDateInput = document.getElementById("assessmentDate");
  if (assessmentDateInput && !assessmentDateInput.value) assessmentDateInput.value = new Date().toISOString().slice(0, 10);

  // Events
  els.heroStart.addEventListener("click", () => {
    document.getElementById("evaluation").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => els.beginContext.focus(), 500);
  });
  els.beginContext.addEventListener("click", () => activateStep(els.contextStep));
  els.backIntro.addEventListener("click", () => activateStep(els.introStep));

  els.contextStep.addEventListener("submit", event => {
    event.preventDefault();
    const context = collectContext();
    const error = validateContext(context);
    if (error) {
      els.contextError.textContent = error;
      return;
    }
    els.contextError.textContent = "";
    state.context = context;
    state.questions = buildQuestionSet(context.useTypes);
    state.answers = {};
    state.currentIndex = 0;
    activateStep(els.questionStep);
    renderQuestion();
  });

  els.prevQuestion.addEventListener("click", () => {
    if (state.currentIndex > 0) {
      state.currentIndex -= 1;
      renderQuestion();
    }
  });

  els.nextQuestion.addEventListener("click", () => {
    const current = state.questions[state.currentIndex];
    if (!state.answers[current.id]) return;
    if (state.currentIndex < state.questions.length - 1) {
      state.currentIndex += 1;
      renderQuestion();
    } else {
      const result = computeResult();
      renderResults(result);
    }
  });

  document.getElementById("toggleChartTable").addEventListener("click", event => {
    const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
    event.currentTarget.setAttribute("aria-expanded", String(!expanded));
    event.currentTarget.textContent = expanded ? "Voir les valeurs" : "Masquer les valeurs";
    els.dimensionTable.hidden = expanded;
  });

  document.getElementById("downloadHtml").addEventListener("click", downloadReportHtml);
  document.getElementById("downloadJson").addEventListener("click", downloadResultJson);
  document.getElementById("printReport").addEventListener("click", printPdf);
  document.getElementById("archivePdf")?.addEventListener("click", printPdf);
  document.getElementById("restartAssessment").addEventListener("click", restart);
  els.aggregateConsent.addEventListener("change", () => {
    els.contributeStats.disabled = !(els.aggregateConsent.checked && (CONFIG.aggregateEndpoint || "").trim());
  });
  els.contributeStats.addEventListener("click", contributeStats);

  // Initial state.
  setupContributionState();
})();
