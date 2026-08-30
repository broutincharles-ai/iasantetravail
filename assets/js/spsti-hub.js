(() => {
  "use strict";

  const projectsFr = {
    documentation: {
      type: "Tous métiers · documentation",
      title: "Assistant documentaire interne",
      description: "Retrouver un protocole ou une fiche de risque dans une base contrôlée, avec les sources affichées dans la réponse.",
      value: 4, complexity: 2, data: 2, error: 2,
      status: "Tester en priorité",
      verdict: "Bon candidat à un pilote limité sur une base contrôlée, avec citation des sources et vérification humaine."
    },
    callbot: {
      type: "Relation adhérents · accueil",
      title: "Callbot pour demandes simples",
      description: "Répondre aux questions courantes, orienter et transférer les demandes qui sortent du scénario prévu.",
      value: 4, complexity: 3, data: 3, error: 3,
      status: "Pilote encadré",
      verdict: "Tester sur un périmètre non médical, avec transfert humain, journal des erreurs et suivi des abandons."
    },
    formation: {
      type: "Fonction support · formation",
      title: "Administration des formations",
      description: "Préparer les préinscriptions, modifications et échanges administratifs autour des sessions de sensibilisation.",
      value: 4, complexity: 2, data: 2, error: 2,
      status: "Tester en priorité",
      verdict: "Candidat crédible si les exceptions restent visibles et si le temps complet, corrections incluses, est mesuré."
    },
    relecture: {
      type: "Pratique médicale · second lecteur",
      title: "Relecture de préconisations",
      description: "Repérer des défauts de formulation dans un texte déjà rédigé, sans produire la décision ni la signer.",
      value: 5, complexity: 3, data: 4, error: 4,
      status: "Évaluation formelle",
      verdict: "Usage prometteur mais sensible : minimisation, environnement autorisé, référence professionnelle et validation médicale obligatoires."
    },
    synthese: {
      type: "Pratique médicale · synthèse",
      title: "Synthèse d’informations médicales",
      description: "Préparer une synthèse d’éléments cliniques ou professionnels susceptibles d’éclairer une consultation.",
      value: 4, complexity: 4, data: 5, error: 5,
      status: "Vigilance forte",
      verdict: "Ne pas lancer comme expérimentation informelle. L’analyse des données, de la sécurité, de la finalité et de l’intégration clinique est indispensable."
    },
    scoring: {
      type: "Décision individuelle · priorisation",
      title: "Scoring individuel automatique",
      description: "Attribuer un score à une personne pour prioriser un suivi, une action ou une décision professionnelle.",
      value: 2, complexity: 5, data: 5, error: 5,
      status: "À écarter en l’état",
      verdict: "Risque disproportionné au regard de la valeur décrite. Revenir au besoin et rechercher une solution moins intrusive et non individuelle."
    }
  };

  const projectsEn = {
    documentation: {
      type: "All professions · documentation",
      title: "Internal documentation assistant",
      description: "Find a protocol or risk sheet in a controlled knowledge base, with sources displayed in the answer.",
      value: 4, complexity: 2, data: 2, error: 2,
      status: "Priority candidate",
      verdict: "A good candidate for a limited pilot on a controlled knowledge base, with source citations and human verification."
    },
    callbot: {
      type: "Member relations · reception",
      title: "Callbot for routine enquiries",
      description: "Answer routine questions, direct callers and transfer requests that fall outside the defined scenario.",
      value: 4, complexity: 3, data: 3, error: 3,
      status: "Supervised pilot",
      verdict: "Test within a non-medical scope, with human escalation, an error log and monitoring of abandoned calls."
    },
    formation: {
      type: "Support function · training",
      title: "Training administration",
      description: "Prepare pre-registrations, changes and administrative communications concerning awareness sessions.",
      value: 4, complexity: 2, data: 2, error: 2,
      status: "Priority candidate",
      verdict: "A credible candidate if exceptions remain visible and end-to-end time, including corrections, is measured."
    },
    relecture: {
      type: "Medical practice · second reader",
      title: "Review of medical recommendations",
      description: "Identify drafting defects in an existing text without producing the decision or signing it.",
      value: 5, complexity: 3, data: 4, error: 4,
      status: "Formal assessment",
      verdict: "A promising but sensitive use: data minimisation, an authorised environment, a professional reference and medical validation are required."
    },
    synthese: {
      type: "Medical practice · synthesis",
      title: "Synthesis of medical information",
      description: "Prepare a synthesis of clinical or occupational information that may inform a consultation.",
      value: 4, complexity: 4, data: 5, error: 5,
      status: "High vigilance",
      verdict: "Do not launch as an informal experiment. Analysis of the data, security, purpose and clinical integration is essential."
    },
    scoring: {
      type: "Individual decision · prioritisation",
      title: "Automated individual scoring",
      description: "Assign a score to a person to prioritise follow-up, an intervention or an occupational decision.",
      value: 2, complexity: 5, data: 5, error: 5,
      status: "Reject as currently framed",
      verdict: "The risk is disproportionate to the stated value. Return to the need and seek a less intrusive, non-individual solution."
    }
  };

  const projects = document.documentElement.lang.toLowerCase().startsWith("en") ? projectsEn : projectsFr;

  const tabs = [...document.querySelectorAll(".project-tab")];
  const matrix = document.querySelector(".matrix-lab");

  if (tabs.length && matrix) {
    const fields = {
      type: document.getElementById("projectType"),
      title: document.getElementById("projectTitle"),
      description: document.getElementById("projectDescription"),
      status: document.getElementById("matrixStatus"),
      verdict: document.getElementById("verdictText"),
      valueScore: document.getElementById("valueScore"),
      complexityScore: document.getElementById("complexityScore"),
      dataScore: document.getElementById("dataScore"),
      errorScore: document.getElementById("errorScore"),
      valueBar: document.getElementById("valueBar"),
      complexityBar: document.getElementById("complexityBar"),
      dataBar: document.getElementById("dataBar"),
      errorBar: document.getElementById("errorBar"),
      dot: document.getElementById("matrixDot")
    };

    const selectProject = key => {
      const project = projects[key];
      if (!project) return;
      const risk = (project.complexity + project.data + project.error) / 3;

      fields.type.textContent = project.type;
      fields.title.textContent = project.title;
      fields.description.textContent = project.description;
      fields.status.textContent = project.status;
      fields.verdict.textContent = project.verdict;

      ["value", "complexity", "data", "error"].forEach(metric => {
        fields[`${metric}Score`].textContent = project[metric];
        fields[`${metric}Bar`].style.width = `${project[metric] * 20}%`;
      });

      fields.dot.style.left = `${8 + risk * 17}%`;
      fields.dot.style.bottom = `${project.value * 17}%`;
      tabs.forEach(tab => {
        const active = tab.dataset.project === key;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectProject(tab.dataset.project));
      tab.addEventListener("keydown", event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const offset = event.key === 'ArrowRight' ? 1 : -1;
        const next = tabs[(index + offset + tabs.length) % tabs.length];
        selectProject(next.dataset.project);
        next.focus();
      });
    });
  }

  const filters = [...document.querySelectorAll(".filter")];
  const usageRows = [...document.querySelectorAll(".usage-table tbody tr")];

  filters.forEach(button => button.addEventListener("click", () => {
    const selected = button.dataset.filter;
    filters.forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    usageRows.forEach(row => {
      row.hidden = selected !== "all" && !row.dataset.tags.split(" ").includes(selected);
    });
  }));

  filters.forEach(button => button.setAttribute("aria-pressed", String(button.classList.contains("active"))));
})();
