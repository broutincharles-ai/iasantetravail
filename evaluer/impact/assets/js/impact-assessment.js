(() => {
  "use strict";

  const CONFIG = window.IAHT_CONFIG || {};
  const STORAGE_KEY = "iaht_assessments_v1";
  const CONTACT_EMAIL = (CONFIG.contactEmail || "santetravailia@gmail.com").trim();
  const MAX_LOCAL_RECORDS = 50;

  const dimensions = {
    intensity: { label: "Intensité & temps", short: ["Intensité", "& temps"], weight: 1.1, description: "Charge, accélération, délais et travail de correction." },
    emotional: { label: "Exigences émotionnelles", short: ["Exigences", "émotionnelles"], weight: 0.8, description: "Exposition émotionnelle, conflits et régulation des affects." },
    autonomy: { label: "Autonomie", short: ["Autonomie"], weight: 1.1, description: "Marges de manœuvre, reprise en main et capacité de contestation." },
    social: { label: "Rapports sociaux", short: ["Rapports", "sociaux"], weight: 0.9, description: "Soutien, coopération, responsabilité et qualité du dialogue." },
    values: { label: "Conflits de valeurs", short: ["Conflits", "de valeurs"], weight: 0.9, description: "Qualité empêchée, éthique et sens du travail." },
    insecurity: { label: "Insécurité", short: ["Insécurité"], weight: 0.9, description: "Évolution de l’emploi, des compétences et dépendance au système." },
    governance: { label: "Gouvernance algorithmique", short: ["Gouvernance", "algorithmique"], weight: 1.15, description: "Finalité, explicabilité, recours et responsabilité décisionnelle." },
    privacy: { label: "Données & surveillance", short: ["Données", "& surveillance"], weight: 1.15, description: "Minimisation, confidentialité et granularité du suivi." },
    reliability: { label: "Fiabilité & sécurité", short: ["Fiabilité", "& sécurité"], weight: 1.2, description: "Validation, erreurs, biais d’automatisation et solutions de repli." },
    deployment: { label: "Déploiement préventif", short: ["Déploiement", "préventif"], weight: 1.0, description: "Participation, pilote, formation et suivi des effets." }
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
    ],
    validation: [
      { label: "Validé de façon robuste", score: 0 },
      { label: "Validé sur un échantillon", score: 1 },
      { label: "Tests partiels", score: 2 },
      { label: "Démonstration seulement", score: 3 },
      { label: "Aucune validation", score: 4 }
    ]
  };

  const coreQuestions = [
    {
      id: "Q01", dims: { intensity: 1.2 }, scale: "impact", category: "Gollac · Intensité",
      title: "Le système devrait-il augmenter le volume de travail attendu ou accélérer les cadences ?",
      help: "Pensez aux objectifs relevés après un gain de productivité, aux délais raccourcis et à la multiplication des tâches."
    },
    {
      id: "Q02", dims: { intensity: 1 }, scale: "frequency", category: "Gollac · Intensité",
      title: "L’IA créera-t-elle des sollicitations en temps réel, des priorités changeantes ou des délais plus serrés ?",
      help: "Incluez les alertes, recommandations permanentes, files de tâches dynamiques et réaffectations automatiques."
    },
    {
      id: "Q03", dims: { intensity: .8 }, scale: "impact", category: "Gollac · Temps de travail",
      title: "Le projet risque-t-il d’étendre la disponibilité attendue au-delà des horaires habituels ?",
      help: "Par exemple : demandes nocturnes, réponse immédiate, continuité numérique ou frontière plus floue entre travail et repos."
    },
    {
      id: "Q04", dims: { intensity: 1.1, reliability: .35 }, scale: "impact", category: "Travail invisible",
      title: "Quelle charge de vérification, correction ou reprise des productions de l’IA est anticipée ?",
      help: "Une automatisation peut déplacer le travail vers la détection d’erreurs, la justification ou le nettoyage des données."
    },
    {
      id: "Q05", dims: { emotional: 1 }, scale: "impact", category: "Gollac · Exigences émotionnelles",
      title: "Le système exposera-t-il davantage les travailleurs à des situations humaines difficiles ou conflictuelles ?",
      help: "Exemples : annonces sensibles, réclamations, détresse, agressivité, contestation d’une décision ou réparation d’une erreur."
    },
    {
      id: "Q06", dims: { emotional: .9, values: .25 }, scale: "impact", category: "Gollac · Exigences émotionnelles",
      title: "L’IA imposera-t-elle une manière de communiquer ou d’exprimer ses émotions qui peut être vécue comme artificielle ?",
      help: "Pensez aux scripts, scores de tonalité, injonctions à sourire, à rassurer ou à suivre une réponse standardisée."
    },
    {
      id: "Q07", dims: { autonomy: 1.25, governance: .45 }, scale: "control", category: "Gollac · Autonomie",
      title: "Les travailleurs pourront-ils ignorer, corriger ou interrompre une recommandation de l’IA sans être pénalisés ?",
      help: "La reprise en main doit être réelle, praticable et compatible avec les objectifs de performance."
    },
    {
      id: "Q08", dims: { autonomy: 1 }, scale: "impact", category: "Gollac · Autonomie",
      title: "Dans quelle mesure l’outil réduira-t-il la liberté de choisir la méthode, l’ordre ou le rythme du travail ?",
      help: "Évaluez la prescription implicite ou explicite créée par les scores, recommandations et workflows."
    },
    {
      id: "Q09", dims: { autonomy: .5, governance: 1 }, scale: "clarity", category: "Compréhension",
      title: "Les utilisateurs comprendront-ils les critères principaux qui produisent les recommandations ou décisions ?",
      help: "Une explication utile doit permettre de détecter une erreur et d’argumenter une contestation, pas seulement décrire le produit."
    },
    {
      id: "Q10", dims: { deployment: 1.15, social: .5 }, scale: "control", category: "Participation",
      title: "Les travailleurs concernés et leurs représentants ont-ils été associés à la définition de l’usage ?",
      help: "Cela inclut l’analyse des besoins, les tests, les critères de réussite, les risques et les conditions d’arrêt."
    },
    {
      id: "Q11", dims: { social: 1, deployment: .5 }, scale: "control", category: "Soutien & formation",
      title: "Une formation pratique, du temps d’apprentissage et un support humain sont-ils réellement prévus ?",
      help: "La formation doit couvrir les limites, les erreurs probables, la protection des données et les situations où ne pas utiliser l’outil."
    },
    {
      id: "Q12", dims: { social: .8, governance: .8 }, scale: "clarity", category: "Responsabilités",
      title: "La responsabilité en cas d’erreur, de contestation ou d’incident est-elle clairement répartie ?",
      help: "Évitez qu’un travailleur supporte seul la responsabilité d’une décision fortement orientée par un système qu’il ne maîtrise pas."
    },
    {
      id: "Q13", dims: { values: 1.1, intensity: .25 }, scale: "impact", category: "Gollac · Conflits de valeurs",
      title: "L’IA risque-t-elle de privilégier la vitesse ou la quantité au détriment de la qualité du travail ?",
      help: "Incluez la qualité relationnelle, la sécurité, la précision, la personnalisation et le temps nécessaire pour bien faire."
    },
    {
      id: "Q14", dims: { values: 1.15, emotional: .2 }, scale: "impact", category: "Éthique professionnelle",
      title: "Le projet peut-il placer les travailleurs en conflit avec leurs règles professionnelles, leur éthique ou le sens de leur métier ?",
      help: "Par exemple : recommandation injuste, standardisation excessive, refus de service, déshumanisation ou décision difficile à assumer."
    },
    {
      id: "Q15", dims: { insecurity: 1.15, social: .25 }, scale: "clarity", category: "Gollac · Insécurité",
      title: "Les effets du projet sur les emplois, les rôles et les parcours professionnels sont-ils expliqués de façon crédible ?",
      help: "Une communication uniquement promotionnelle ou changeante augmente l’incertitude et les rumeurs."
    },
    {
      id: "Q16", dims: { insecurity: 1, autonomy: .25 }, scale: "impact", category: "Compétences",
      title: "Le système risque-t-il d’appauvrir les compétences ou de créer une dépendance difficilement réversible ?",
      help: "Pensez à la perte de pratique, à l’oubli des procédures, à la réduction de l’apprentissage et à l’incapacité de fonctionner sans l’outil."
    },
    {
      id: "Q17", dims: { governance: 1, deployment: .35 }, scale: "clarity", category: "Gouvernance IA",
      title: "La finalité, les usages autorisés, les usages interdits et les limites du système sont-ils formalisés ?",
      help: "Le cadrage doit empêcher l’extension progressive de l’usage vers des fonctions non évaluées."
    },
    {
      id: "Q18", dims: { governance: 1.2, autonomy: .3 }, scale: "control", category: "Recours humain",
      title: "Une personne affectée par le système dispose-t-elle d’un recours humain rapide et effectif ?",
      help: "Le recours doit pouvoir modifier la décision et ne pas se réduire à une boîte de contact sans délai ni pouvoir d’action."
    },
    {
      id: "Q19", dims: { deployment: 1 }, scale: "control", category: "Expérimentation",
      title: "Un pilote limité, réversible et comparé à la situation antérieure est-il prévu avant généralisation ?",
      help: "Le pilote doit tester la charge, la qualité, la sécurité, les contournements, les inégalités et l’acceptabilité."
    },
    {
      id: "Q20", dims: { deployment: 1.15, social: .2 }, scale: "control", category: "Suivi des effets",
      title: "Le déploiement fera-t-il l’objet d’un suivi de la charge de travail, des incidents, de la qualité du travail et des usages réels ?",
      help: "Le suivi de la seule productivité ne permet pas d’identifier les difficultés d’usage, les contournements, les erreurs ou une dégradation du travail réel."
    },
    {
      id: "Q21", dims: { privacy: 1.15, governance: .2 }, scale: "control", category: "Minimisation des données",
      title: "Le projet limite-t-il les données collectées au strict nécessaire, avec des durées et accès définis ?",
      help: "Incluez les prompts, journaux, métadonnées, enregistrements, historiques et données produites par inférence."
    },
    {
      id: "Q22", dims: { privacy: 1.2, autonomy: .25 }, scale: "impact", category: "Surveillance",
      title: "Quel niveau de suivi individualisé de l’activité ou du comportement le système introduit-il ?",
      help: "Évaluez la fréquence, la granularité, la possibilité de croiser les données et l’usage des résultats pour comparer des personnes."
    },
    {
      id: "Q23", dims: { privacy: 1, governance: .25 }, scale: "clarity", category: "Fournisseur & réutilisation",
      title: "Les transferts, sous-traitants, réutilisations et conditions d’entraînement sur les données sont-ils maîtrisés ?",
      help: "La confidentialité contractuelle ne suffit pas si les flux techniques, les accès et les paramètres ne sont pas connus."
    },
    {
      id: "Q24", dims: { reliability: 1.2 }, scale: "validation", category: "Validation située",
      title: "Le système a-t-il été évalué sur des cas représentatifs du métier, de la population et du contexte local ?",
      help: "Une performance générale ou une démonstration du fournisseur ne remplace pas une validation sur les cas d’usage réels."
    },
    {
      id: "Q25", dims: { reliability: 1.2, governance: .3 }, scale: "impact", category: "Conséquences des erreurs",
      title: "Quelle serait la gravité d’une erreur non détectée ou d’une confiance excessive dans la sortie de l’IA ?",
      help: "Tenez compte des conséquences humaines, professionnelles, juridiques, financières, sanitaires et de sécurité."
    },
    {
      id: "Q26", dims: { reliability: 1.05, deployment: .4 }, scale: "control", category: "Continuité & repli",
      title: "Une procédure de repli testée permet-elle de travailler en sécurité si l’IA est indisponible ou incohérente ?",
      help: "Incluez l’arrêt du système, le retour à une procédure manuelle, la récupération des données et la gestion des incidents."
    }
  ];

  const conditionalQuestions = [
    {
      id: "C01", use: "management", dims: { intensity: .9, autonomy: 1.1, governance: .35 }, category: "Question ciblée · Organisation", conditional: true,
      title: "Comment l’IA influencera-t-elle l’attribution des tâches et le rythme quotidien ?",
      help: "Choisissez le niveau le plus proche de l’usage réellement prévu.",
      options: [
        { label: "Information non prescriptive, sans effet sur le rythme", score: 0 },
        { label: "Suggestion ajustable avec marge de manœuvre", score: 1 },
        { label: "Priorisation généralement suivie mais contestable", score: 2 },
        { label: "Attribution automatique avec objectifs dynamiques", score: 3 },
        { label: "Pilotage continu du rythme avec faible possibilité de dérogation", score: 4 }
      ]
    },
    {
      id: "C02", use: "rh", dims: { governance: 1.3, insecurity: 1, social: .35 }, category: "Question ciblée · Emploi", conditional: true,
      title: "Quel rôle l’IA jouera-t-elle dans une décision concernant l’emploi ou la carrière ?",
      help: "Recrutement, évaluation, rémunération, promotion, mobilité, sanction ou rupture.",
      options: [
        { label: "Aucune décision individuelle ; analyse globale uniquement", score: 0 },
        { label: "Aide documentaire, décision humaine indépendante", score: 1 },
        { label: "Recommandation expliquée, systématiquement réexaminée", score: 2 },
        { label: "Recommandation suivie par défaut avec contrôle limité", score: 3 },
        { label: "Décision entièrement ou quasi entièrement automatisée", score: 4 }
      ],
      critical: score => score >= 3 ? "Décision relative à l’emploi fortement déterminée par l’IA avec contrôle humain insuffisant." : null
    },
    {
      id: "C03", use: "monitoring", dims: { privacy: 1.4, autonomy: .65, emotional: .45 }, category: "Question ciblée · Surveillance", conditional: true,
      title: "Quel type de suivi individuel ou d’inférence le système réalisera-t-il ?",
      help: "Retenez la fonction la plus intrusive, même si elle n’est activée que pour une partie des travailleurs.",
      options: [
        { label: "Aucun suivi individuel ; données agrégées et minimisées", score: 0 },
        { label: "Données individuelles ponctuelles, finalité limitée", score: 1 },
        { label: "Suivi régulier avec information et garanties de recours", score: 2 },
        { label: "Surveillance individuelle continue ou comparaison permanente", score: 3 },
        { label: "Inférence d’émotions, d’intentions ou d’état psychologique", score: 4 }
      ],
      critical: score => score === 4
        ? "Inférence d’émotions, d’intentions ou d’état psychologique dans le contexte de travail."
        : score === 3 ? "Surveillance individuelle continue ou comparaison permanente des travailleurs." : null
    },
    {
      id: "C04", use: "health", dims: { reliability: 1.3, privacy: 1.25, governance: .7 }, category: "Question ciblée · Santé", conditional: true,
      title: "Comment l’IA traitera-t-elle les données ou décisions liées à la santé et à la sécurité ?",
      help: "Incluez les données médicales, signaux de santé, aptitudes, risques, alertes et recommandations de prise en charge.",
      options: [
        { label: "Aucune donnée de santé ni décision individuelle", score: 0 },
        { label: "Données agrégées ou anonymisées à visée de prévention", score: 1 },
        { label: "Aide professionnelle validée, sécurisée et supervisée", score: 2 },
        { label: "Données sensibles dans un outil insuffisamment validé ou maîtrisé", score: 3 },
        { label: "Décision automatisée sur la santé, la sécurité ou l’aptitude", score: 4 }
      ],
      critical: score => score === 4
        ? "Décision automatisée susceptible d’affecter la santé, la sécurité ou l’aptitude d’une personne."
        : score === 3 ? "Traitement de données sensibles dans un environnement insuffisamment validé ou maîtrisé." : null
    },
    {
      id: "C05", use: "physical", dims: { reliability: 1.5, deployment: .55 }, category: "Question ciblée · Système physique", conditional: true,
      title: "Quel niveau de contrôle l’IA exercera-t-elle sur une machine, un véhicule ou un procédé dangereux ?",
      help: "Prenez en compte l’exposition réelle, le temps de réaction et la capacité d’arrêt en sécurité.",
      options: [
        { label: "Aucun contrôle physique ; information seulement", score: 0 },
        { label: "Fonction auxiliaire à faible conséquence", score: 1 },
        { label: "Contrôle partiel avec protections indépendantes", score: 2 },
        { label: "Contrôle important avec reprise humaine possible", score: 3 },
        { label: "Contrôle d’une situation dangereuse sans fail-safe indépendant", score: 4 }
      ],
      critical: score => score === 4 ? "Contrôle d’un système physique dangereux sans dispositif de sécurité indépendant et testé." : null
    },
    {
      id: "C06", use: "genai", dims: { reliability: 1.1, privacy: .65, intensity: .35 }, category: "Question ciblée · IA générative", conditional: true,
      title: "Comment les productions générées seront-elles vérifiées avant d’être utilisées ?",
      help: "Incluez les textes, synthèses, codes, recommandations, traductions et recherches documentaires.",
      options: [
        { label: "Vérification systématique, sources contrôlées, aucune donnée sensible", score: 0 },
        { label: "Relecture structurée sur tous les usages importants", score: 1 },
        { label: "Contrôle variable selon les équipes et les délais", score: 2 },
        { label: "Usage fréquent avec relecture minimale", score: 3 },
        { label: "Sorties à fort impact non vérifiées ou données confidentielles exposées", score: 4 }
      ],
      critical: score => score === 4 ? "Production générative à fort impact utilisée sans vérification suffisante ou exposition de données confidentielles." : null
    }
  ];

  const actionLibrary = {
    intensity: {
      immediate: "Geler toute hausse d’objectifs fondée uniquement sur le gain de temps théorique de l’IA.",
      short: "Mesurer charge réelle, temps de correction, interruptions et débordement horaire pendant le pilote.",
      follow: "Réviser objectifs, effectifs, délais et droit à la déconnexion à partir des données de terrain."
    },
    emotional: {
      immediate: "Identifier les situations émotionnellement difficiles déplacées vers les travailleurs par le système.",
      short: "Prévoir soutien managérial, espaces de discussion et possibilité de sortir des scripts automatiques.",
      follow: "Suivre conflits, incivilités, fatigue émotionnelle et qualité de la relation avec les usagers."
    },
    autonomy: {
      immediate: "Garantir un bouton d’arrêt, une dérogation et une possibilité de correction sans sanction implicite.",
      short: "Tester avec les utilisateurs si la reprise en main est réellement compatible avec les objectifs et délais.",
      follow: "Auditer les écarts entre autonomie affichée et pratiques réelles de management."
    },
    social: {
      immediate: "Nommer les responsables du système, du support, de l’incident et de la décision finale.",
      short: "Former les équipes et organiser des retours d’expérience collectifs incluant les difficultés d’usage.",
      follow: "Suivre coopération, conflits de responsabilité, isolement et qualité du soutien."
    },
    values: {
      immediate: "Définir les critères de qualité qui ne peuvent pas être sacrifiés à la productivité.",
      short: "Documenter les situations où un professionnel doit pouvoir refuser une recommandation contraire à son métier.",
      follow: "Organiser des discussions régulières sur la qualité empêchée, l’éthique et le sens du travail."
    },
    insecurity: {
      immediate: "Expliquer de façon transparente les effets attendus sur les rôles, les emplois et les compétences.",
      short: "Établir un plan de maintien et de développement des compétences, y compris sans l’outil.",
      follow: "Suivre mobilité, départs, dépendance technologique et évolution réelle des tâches."
    },
    governance: {
      immediate: "Suspendre toute décision à fort impact dépourvue de supervision, d’explication et de recours effectif.",
      short: "Formaliser finalité, périmètre, responsables, usages interdits, journalisation et procédure de contestation.",
      follow: "Réexaminer périodiquement les usages réels, dérives de finalité et décisions renversées après recours."
    },
    privacy: {
      immediate: "Supprimer les données non indispensables et interdire les données sensibles dans les outils non validés.",
      short: "Cartographier flux, accès, conservation, sous-traitants, réutilisation et mesures de sécurité.",
      follow: "Auditer la proportionnalité du suivi, les accès et les usages secondaires des données."
    },
    reliability: {
      immediate: "Limiter l’usage aux situations dont les conséquences d’erreur sont maîtrisables et réversibles.",
      short: "Valider le système sur des cas locaux, documenter les erreurs et tester la procédure de repli.",
      follow: "Surveiller dérive, taux d’erreur, faux positifs, faux négatifs, incidents et confiance excessive."
    },
    deployment: {
      immediate: "Rendre le pilote réversible et définir à l’avance des critères d’arrêt.",
      short: "Associer utilisateurs, représentants, prévention, sécurité, DPO et fonctions métier à l’évaluation.",
      follow: "Intégrer les résultats au DUERP et réévaluer après chaque évolution importante du système ou de l’organisation."
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

  function buildQuestionSet(useTypes) {
    const conditional = conditionalQuestions.filter(q => useTypes.includes(q.use));
    return [...coreQuestions, ...conditional];
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
    const conditionalCount = state.questions.filter(item => item.conditional).length;
    els.adaptiveLabel.textContent = conditionalCount ? `26 questions de base + ${conditionalCount} ciblée${conditionalCount > 1 ? "s" : ""}` : "26 questions de base";
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

    // Cross-question critical rules.
    if ((state.answers.Q18?.score ?? 0) >= 4 && ((state.answers.Q25?.score ?? 0) >= 3 || state.context.useTypes.includes("rh") || state.context.useTypes.includes("health"))) {
      criticalFlags.push("Absence de recours humain effectif pour un usage susceptible d’avoir des conséquences importantes.");
    }
    if ((state.answers.Q21?.score ?? 0) >= 4 && (state.context.useTypes.includes("health") || state.context.useTypes.includes("monitoring"))) {
      criticalFlags.push("Collecte de données insuffisamment minimisée dans un usage sensible ou de surveillance.");
    }
    if ((state.answers.Q26?.score ?? 0) >= 4 && ((state.answers.Q25?.score ?? 0) >= 3 || state.context.useTypes.includes("physical"))) {
      criticalFlags.push("Absence de procédure de repli alors que les conséquences d’une défaillance peuvent être importantes.");
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
      appVersion: CONFIG.appVersion || "0.4.0",
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
      ...(result.criticalFlags.length ? ["governance", "reliability", "deployment"] : [])
    ]).slice(0, 6);
    const contextLabels = formatContext(result.context);
    const involvement = buildOccupationalHealthGuidance(result);

    return `
      <header class="report-cover">
        <div>
          <span class="mini-kicker">IA & Santé au Travail</span>
          <h1>Rapport d’évaluation d’impact IA & travail</h1>
          <p>Questionnaire empirique et exploratoire conçu par le Dr Charles Broutin.</p>
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
        <h2>6. Gouvernance et traçabilité minimales</h2>
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
        <p class="report-disclaimer"><strong>Statut et limites.</strong> Ce questionnaire, conçu par le Dr Charles Broutin, repose sur une construction empirique et experte et n’a pas fait l’objet d’une validation scientifique, psychométrique ou prédictive. Le rapport est produit automatiquement à partir de réponses déclaratives. Il ne constitue ni un diagnostic, ni une certification, ni une preuve de conformité et ne remplace pas l’observation du travail, la consultation des travailleurs et de leurs représentants, ni les évaluations réglementaire, médicale, ergonomique, technique, de sécurité ou de protection des données adaptées au projet.</p>
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
      schema: "iaht-impact-assessment-0.3",
      generatedAt: new Date().toISOString(),
      result: state.result,
      note: "Questionnaire empirique et exploratoire conçu par le Dr Charles Broutin, sans validation scientifique, psychométrique ou prédictive. Les réponses et scores ne constituent ni un diagnostic, ni une certification, ni un avis médical ou juridique, ni une preuve de conformité."
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
