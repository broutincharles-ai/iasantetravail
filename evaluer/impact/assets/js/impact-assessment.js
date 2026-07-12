(() => {
  "use strict";

  const CONFIG = window.IAHT_CONFIG || {};
  const STORAGE_KEY = "iaht_assessments_v1";
  const CONTACT_EMAIL = (CONFIG.contactEmail || "santetravailia@gmail.com").trim();
  const MAX_LOCAL_RECORDS = 50;

  const REPORT_EXPORT_CSS = `
:root{--report-ink:#17140F;--report-muted:#625E56;--report-line:#DDD5C8;--report-paper:#FFFDF9;--report-warm:#F5EDE0;--report-green:#3D5B52;--report-orange:#C05F2B}
*{box-sizing:border-box}html{background:#F0ECE5}body{margin:0;font-family:"Instrument Sans",Arial,sans-serif;color:var(--report-ink);background:#F0ECE5;line-height:1.5;-webkit-font-smoothing:antialiased}.generated-report{width:min(920px,calc(100% - 32px));margin:28px auto;padding:44px;border:1px solid var(--report-line);border-radius:22px;background:var(--report-paper);box-shadow:0 25px 70px -45px rgba(23,20,15,.45)}h1,h2,h3{font-family:"Fraunces",Georgia,serif;font-weight:520}.report-cover{padding-bottom:24px;border-bottom:1px solid var(--report-line)}.report-brandline{display:flex;align-items:center;gap:10px;margin-bottom:28px;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--report-green)}.report-brandmark{width:18px;height:18px;border-radius:50%;background:var(--report-orange)}.report-type{margin-left:auto;padding:6px 10px;border:1px solid var(--report-line);border-radius:999px;color:var(--report-muted);letter-spacing:.07em;background:#fff}.report-cover-grid{display:grid;grid-template-columns:minmax(0,1fr) 210px;gap:34px;align-items:end}.report-eyebrow{margin:0 0 8px;font-size:11px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;color:var(--report-orange)}.report-cover h1{max-width:720px;margin:0 0 12px;font-size:50px;line-height:1.02;letter-spacing:-.035em}.report-subtitle{max-width:720px;margin:0;font-size:14px;line-height:1.55;color:var(--report-muted)}.report-id-card{padding:16px;border:1px solid var(--report-line);border-radius:16px;background:linear-gradient(145deg,#fff,var(--report-warm));font-size:11px;line-height:1.55;color:var(--report-muted)}.report-id-card strong{display:block;margin-bottom:5px;font-size:13px;color:var(--report-ink)}.report-section{margin-top:28px}.report-section-heading{display:flex;align-items:flex-start;gap:12px;margin-bottom:15px}.report-section-number{width:32px;min-width:32px;height:32px;padding:0;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:0 0 32px;background:var(--report-ink);color:#fff;font-size:10px;font-weight:850;line-height:1;text-align:center;font-variant-numeric:tabular-nums;overflow:hidden}.report-section-heading h2{margin:1px 0 0;font-size:28px;line-height:1.08}.report-section-heading p{margin:0 0 3px;font-size:10px;font-weight:850;letter-spacing:.11em;text-transform:uppercase;color:var(--report-orange)}.report-section>p,.report-section li{font-size:12.5px;line-height:1.55;color:var(--report-muted)}.report-section ul,.report-section ol{padding-left:19px}.report-summary-grid{display:grid;grid-template-columns:190px minmax(0,1fr);gap:12px}.report-score-card{--report-accent:var(--report-orange);display:flex;flex-direction:column;justify-content:space-between;min-height:164px;padding:18px;border-radius:17px;background:var(--report-ink);color:#fff;overflow:hidden;position:relative}.report-score-card::after{content:"";position:absolute;width:110px;height:110px;border-radius:50%;right:-34px;top:-42px;background:var(--report-accent);opacity:.28}.report-score-card>span{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.64)}.report-score-card strong{position:relative;z-index:1;font-family:"Fraunces",Georgia,serif;font-size:54px;line-height:.95}.report-score-card strong small{font-family:"Instrument Sans",Arial,sans-serif;font-size:12px;color:rgba(255,255,255,.55)}.report-score-card b{position:relative;z-index:1;font-size:12px}.report-decision-card{padding:18px 20px;border:1px solid var(--report-line);border-radius:17px;background:#fff}.report-decision-card>strong{display:block;margin-bottom:7px;font-size:16px}.report-decision-card p{margin:0;font-size:12.5px;line-height:1.58;color:var(--report-muted)}.report-decision-card.warning{border-color:rgba(143,37,48,.35);background:#FFF7F5}.report-critical-list{margin-top:12px;padding:13px 15px;border-left:4px solid #8F2530;border-radius:0 12px 12px 0;background:#FFF3F1}.report-critical-list strong{display:block;margin-bottom:4px;font-size:11px;color:#8F2530;text-transform:uppercase;letter-spacing:.08em}.report-critical-list ul{margin:0}.report-context-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.report-context-item{padding:11px 12px;border:1px solid var(--report-line);border-radius:12px;background:#fff}.report-context-item strong{display:block;margin-bottom:3px;font-size:9.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--report-muted)}.report-context-item span{display:block;font-size:12px;font-weight:720;line-height:1.35}.report-profile-note{margin-bottom:14px}.report-score-list{display:grid;gap:8px}.report-score-row{padding:10px 12px;border:1px solid var(--report-line);border-radius:12px;background:#fff}.report-score-head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:7px}.report-score-head strong{font-size:11.5px}.report-score-head span{font-family:"Fraunces",Georgia,serif;font-size:16px;color:var(--score-color,var(--report-orange))}.report-score-bar{height:6px;border-radius:999px;background:#EEE9E1;overflow:hidden}.report-score-bar i{display:block;height:100%;border-radius:inherit;background:var(--score-color,var(--report-orange))}.report-priority-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 14px;padding:0;counter-reset:priority;list-style:none}.report-priority-list li{position:relative;padding:12px 12px 12px 42px;border:1px solid var(--report-line);border-radius:12px;background:#fff}.report-priority-list li::before{counter-increment:priority;content:counter(priority);position:absolute;left:12px;top:12px;width:22px;height:22px;padding:0;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--report-warm);font-size:10px;font-weight:850;line-height:1;text-align:center;font-variant-numeric:tabular-nums;color:var(--report-orange)}.report-priority-list strong{display:block;margin-bottom:3px;color:var(--report-ink)}.report-actions-title{margin:15px 0 8px;font-family:"Instrument Sans",Arial,sans-serif;font-size:10.5px;font-weight:850;letter-spacing:.09em;text-transform:uppercase;color:var(--report-muted)}.report-keep-together{break-inside:avoid;page-break-inside:avoid}.action-timeline{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.action-column{padding:14px;border:1px solid var(--report-line);border-radius:13px;background:#fff}.action-column:nth-child(1){border-top:4px solid #8F2530}.action-column:nth-child(2){border-top:4px solid var(--report-orange)}.action-column:nth-child(3){border-top:4px solid var(--report-green)}.action-column h3{margin:0 0 8px;font-size:18px;line-height:1.08}.action-column ul{margin:0;padding-left:17px}.action-column li{margin-bottom:4px;font-size:11px;line-height:1.45}.report-role-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.report-role-card{padding:12px;border:1px solid var(--report-line);border-radius:12px;background:#fff}.report-role-card strong{display:block;margin-bottom:4px;font-size:11.5px}.report-role-card p{margin:0;font-size:11px;line-height:1.48;color:var(--report-muted)}.report-callout{padding:13px 15px;border-radius:12px;margin-top:13px;background:#F0F5F2;border:1px solid #D2E0D8;font-size:12px}.report-callout.warning{background:#FFF2EC;border-color:#EBC3AE}.report-callout p{margin:3px 0 0;font-size:11.5px;line-height:1.5;color:var(--report-muted)}.report-check-list{display:grid;gap:6px;margin:0;padding:0;list-style:none}.report-check-list li{position:relative;padding:9px 11px 9px 35px;border:1px solid var(--report-line);border-radius:11px;background:#fff}.report-check-list li::before{content:"";position:absolute;left:11px;top:50%;width:17px;height:17px;border-radius:50%;background:#E4EEE8;transform:translateY(-50%)}.report-check-list li::after{content:"";position:absolute;left:17px;top:50%;width:4px;height:7px;border:solid var(--report-green);border-width:0 1.7px 1.7px 0;transform:translateY(-64%) rotate(45deg);transform-origin:center}.report-contribution{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:14px}.report-contact-card{padding:13px;border-radius:12px;background:var(--report-ink);color:#fff;font-size:11px;line-height:1.45;overflow-wrap:anywhere}.report-contact-card span{display:block;margin-bottom:4px;font-size:9px;letter-spacing:.09em;text-transform:uppercase;color:rgba(255,255,255,.55)}.report-legal{margin-top:28px;padding:15px 17px;border-top:1px solid var(--report-line);background:#F8F5EF;border-radius:12px;color:var(--report-muted);font-size:10.5px;line-height:1.52}.report-legal strong{color:var(--report-ink)}.timeline-meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0 0 10px}.timeline-meta div{border:1px solid var(--report-line);border-radius:12px;padding:11px;background:#fff}.timeline-meta strong{display:block;margin-bottom:3px;font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--report-muted)}.timeline-meta span{font-size:11.5px;font-weight:750}
@media(max-width:760px){.generated-report{width:calc(100% - 18px);margin:9px auto;padding:20px}.report-cover-grid,.report-summary-grid,.report-contribution{grid-template-columns:1fr}.report-context-grid,.report-priority-list,.report-role-grid,.action-timeline{grid-template-columns:1fr}.report-type{display:none}.report-cover h1{font-size:34px}}
@media print{@page{size:A4;margin:12mm 13mm 14mm}html,body{background:#fff!important}body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.generated-report{width:auto;margin:0;padding:0;border:0;border-radius:0;box-shadow:none}.report-cover,.report-summary-grid,.report-context-item,.report-score-row,.report-priority-list li,.action-column,.report-role-card,.report-callout,.report-check-list li,.report-contact-card,.report-legal,.timeline-meta div{break-inside:avoid;page-break-inside:avoid}.report-section{break-inside:auto}.report-section.report-keep-together{break-inside:avoid!important;page-break-inside:avoid!important}.report-section-heading{break-after:avoid;page-break-after:avoid}p,li,h1,h2,h3{orphans:3;widows:3}}
`;

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
      appVersion: CONFIG.appVersion || "0.7.3",
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
    const decisionTitle = result.criticalFlags.length ? "Ne pas généraliser en l’état" : "Poursuivre sous conditions";
    const decisionText = result.criticalFlags.length
      ? "Les signaux critiques doivent être levés, documentés et réévalués avant toute extension du projet."
      : "Les mesures prioritaires doivent être intégrées au cadrage, au pilote et au suivi du déploiement.";

    return `
      <header class="report-cover">
        <div class="report-brandline"><span class="report-brandmark" aria-hidden="true"></span><span>IA & Santé au Travail</span><span class="report-type">Évaluation initiale</span></div>
        <div class="report-cover-grid">
          <div>
            <p class="report-eyebrow">Rapport d’aide à la décision</p>
            <h1>Évaluation d’impact d’un projet d’IA sur le travail</h1>
            <p class="report-subtitle">Outil empirique élaboré par le Dr Charles Broutin à partir des six facteurs du cadre Gollac, recontextualisés pour analyser les transformations du travail liées à l’intelligence artificielle et les risques psychosociaux susceptibles d’en résulter pour les salariés.</p>
          </div>
          <div class="report-id-card"><strong>Référence ${escapeHtml(result.id.slice(0, 8).toUpperCase())}</strong>Date de l’évaluation<br>${formatDateFr(result.context.assessmentDate)}<br><br>Rapport généré<br>${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(new Date(result.completedAt))}<br><br>Version ${escapeHtml(result.appVersion)}</div>
        </div>
      </header>

      <section class="report-section">
        <div class="report-section-heading"><span class="report-section-number">01</span><div><p>Lecture immédiate</p><h2>Synthèse décisionnelle</h2></div></div>
        <div class="report-summary-grid">
          <div class="report-score-card" style="--report-accent:${escapeHtml(result.levelColor)}"><span>Score global</span><strong>${result.overall}<small>/100</small></strong><b>${escapeHtml(result.levelLabel)}</b></div>
          <div class="report-decision-card ${result.criticalFlags.length ? "warning" : ""}"><strong>${decisionTitle}</strong><p>${escapeHtml(result.levelSummary)} ${decisionText}</p></div>
        </div>
        ${result.criticalFlags.length ? `<div class="report-critical-list"><strong>Signaux critiques</strong><ul>${result.criticalFlags.map(flag => `<li>${escapeHtml(flag)}</li>`).join("")}</ul></div>` : ""}
      </section>

      <section class="report-section">
        <div class="report-section-heading"><span class="report-section-number">02</span><div><p>Périmètre analysé</p><h2>Contexte déclaré</h2></div></div>
        <div class="report-context-grid">
          <div class="report-context-item"><strong>Secteur</strong><span>${escapeHtml(contextLabels.sector)}</span></div>
          <div class="report-context-item"><strong>Taille</strong><span>${escapeHtml(contextLabels.orgSize)}</span></div>
          <div class="report-context-item"><strong>Stade</strong><span>${escapeHtml(contextLabels.projectStage)}</span></div>
          <div class="report-context-item"><strong>Population exposée</strong><span>${escapeHtml(contextLabels.population)}</span></div>
          <div class="report-context-item"><strong>Date</strong><span>${formatDateFr(result.context.assessmentDate)}</span></div>
          <div class="report-context-item"><strong>Usages</strong><span>${contextLabels.useTypes.map(escapeHtml).join(", ")}</span></div>
        </div>
      </section>

      <section class="report-section">
        <div class="report-section-heading"><span class="report-section-number">03</span><div><p>Neuf dimensions</p><h2>Profil des facteurs de risque</h2></div></div>
        <p class="report-profile-note">Un score élevé indique davantage de facteurs de risque déclarés ou moins de garde-fous. Il ne mesure pas un état de santé individuel.</p>
        <div class="report-score-list">${Object.entries(result.dimensions).map(([key, score]) => `<div class="report-score-row" style="--score-color:${getLevel(score).color}"><div class="report-score-head"><strong>${escapeHtml(dimensions[key].label)}</strong><span>${score}/100</span></div><div class="report-score-bar"><i style="width:${score}%"></i></div></div>`).join("")}</div>
      </section>

      <section class="report-section">
        <div class="report-section-heading"><span class="report-section-number">04</span><div><p>Actions prioritaires</p><h2>Plan de prévention</h2></div></div>
        <ol class="report-priority-list">${top.map(([key, score]) => `<li><strong>${escapeHtml(dimensions[key].label)} - ${score}/100</strong>${escapeHtml(dimensions[key].description)}</li>`).join("")}</ol>
        <h3 class="report-actions-title">Mesures par échéance</h3><div class="action-timeline">
          <div class="action-column"><h3>Avant de poursuivre</h3><ul>${priorityKeys.map(key => `<li>${escapeHtml(actionLibrary[key].immediate)}</li>`).join("")}</ul></div>
          <div class="action-column"><h3>Pendant le pilote</h3><ul>${priorityKeys.map(key => `<li>${escapeHtml(actionLibrary[key].short)}</li>`).join("")}</ul></div>
          <div class="action-column"><h3>Après déploiement</h3><ul>${priorityKeys.map(key => `<li>${escapeHtml(actionLibrary[key].follow)}</li>`).join("")}</ul></div>
        </div>
      </section>

      <section class="report-section">
        <div class="report-section-heading"><span class="report-section-number">05</span><div><p>Prévention collective</p><h2>Implication de la santé au travail</h2></div></div>
        ${involvement}
      </section>

      <section class="report-section report-keep-together">
        <div class="report-section-heading"><span class="report-section-number">06</span><div><p>Socle commun</p><h2>Conditions minimales de prévention</h2></div></div>
        <ul class="report-check-list">
          <li>Documenter la finalité, le responsable, les populations concernées, les données utilisées et les usages interdits.</li>
          <li>Conserver les résultats du pilote, les erreurs observées, les décisions de correction et les critères d’arrêt.</li>
          <li>Prévoir un recours humain effectif, une procédure d’incident et une solution de repli.</li>
          <li>Mettre à jour l’évaluation des risques lorsque le système, son fournisseur, ses données ou l’organisation changent.</li>
          <li>Vérifier séparément les obligations juridiques applicables au cas concret.</li>
        </ul>
      </section>

      <footer class="report-legal"><strong>Statut et limites.</strong> Cet outil empirique reprend les six facteurs de risques psychosociaux du rapport Gollac, recontextualisés pour analyser les transformations du travail liées à l’intelligence artificielle et les risques psychosociaux susceptibles d’en résulter pour les salariés. Il les complète par trois axes propres aux usages de l’IA : opacité et contestabilité, charge cognitive de supervision et érosion des compétences. Cette adaptation n’a pas elle-même fait l’objet d’une validation psychométrique ou prédictive. Le rapport est produit automatiquement à partir de réponses déclaratives. Il ne constitue ni un diagnostic, ni une certification, ni une preuve de conformité et ne remplace pas l’observation du travail, la consultation des travailleurs et de leurs représentants, ni les évaluations réglementaire, médicale, ergonomique, technique, de sécurité ou de protection des données adaptées au projet.</footer>
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
      ${highDims.length ? `<p>Dimensions à instruire prioritairement : ${highDims.map(escapeHtml).join(", ")}.</p>` : ""}
      <div class="report-role-grid">
        <div class="report-role-card"><strong>Médecin du travail</strong><p>Conseil sur les effets possibles de la transformation, les populations vulnérables, les signaux de santé et les conditions de suivi.</p></div>
        <div class="report-role-card"><strong>Équipe pluridisciplinaire / IPRP / ergonomie</strong><p>Analyse de l’activité réelle, des interfaces, des marges de manœuvre, de la charge et des scénarios d’incident.</p></div>
        <div class="report-role-card"><strong>Employeur et prévention</strong><p>Intégration dans l’évaluation des risques, choix des mesures collectives et formalisation des critères d’arrêt.</p></div>
        <div class="report-role-card"><strong>CSE et représentants des travailleurs</strong><p>Discussion des transformations technologiques, organisationnelles et des modalités de contrôle.</p></div>
      </div>
      <div class="report-callout"><strong>Moment optimal</strong><p>Avant le choix définitif de la solution et avant que les objectifs, workflows, données et modalités de surveillance soient figés.</p></div>
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

  function buildReportDocument(title, content) {
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"><style>${REPORT_EXPORT_CSS}</style></head><body><main class="generated-report">${content}</main></body></html>`;
  }

  function downloadReportHtml() {
    if (!state.result) return;
    const title = "Rapport d’évaluation d’impact IA & travail";
    const html = buildReportDocument(title, els.generatedReport.innerHTML);
    downloadBlob(html, `rapport-impact-ia-${safeDate(state.result.context.assessmentDate)}-${state.result.id.slice(0, 8)}.html`, "text/html;charset=utf-8");
  }

  function downloadResultJson() {
    if (!state.result) return;
    const exportData = {
      schema: "iaht-impact-assessment-gollac-ia-0.7",
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
    const filename = `rapport-impact-ia-${safeDate(state.result.context.assessmentDate)}-${state.result.id.slice(0, 8)}`;
    const popup = window.open("", "_blank", "width=980,height=820");
    if (!popup) {
      const previousTitle = document.title;
      document.title = filename;
      const restore = () => { document.title = previousTitle; window.removeEventListener("afterprint", restore); };
      window.addEventListener("afterprint", restore);
      window.print();
      setTimeout(restore, 1500);
      return;
    }
    popup.opener = null;
    popup.document.open();
    popup.document.write(buildReportDocument(filename, els.generatedReport.innerHTML));
    popup.document.close();
    const launch = () => { popup.focus(); popup.print(); };
    popup.addEventListener("afterprint", () => popup.close(), { once: true });
    if (popup.document.fonts?.ready) popup.document.fonts.ready.then(() => setTimeout(launch, 180));
    else setTimeout(launch, 450);
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
