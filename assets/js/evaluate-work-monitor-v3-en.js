(function () {
  "use strict";

  const STORAGE_KEY = "iast-ai-work-monitor-en-v1";
  const LEGACY_STORAGE_KEY = "iast-evaluation-t0-en-v1";
  const SCHEMA = "iast-ai-work-monitor";
  const LEGACY_SCHEMA = "iast-evaluation-t0";
  const VERSION = "2.2";
  const PHASES = new Set(["T0", "T1", "TN"]);
  const ANSWER_VALUES = ["0", "1", "2", "3", "4", "NE", "NA"];
  const ANSWER_LABELS = {
    "0": "Not at all true",
    "1": "Somewhat true",
    "2": "Moderately true",
    "3": "Mostly true",
    "4": "Completely true",
    NE: "Insufficient information",
    NA: "Not applicable"
  };
  const NUMERIC_ANSWERS = [
    ["0", "Not at all true"],
    ["1", "Somewhat true"],
    ["2", "Moderately true"],
    ["3", "Mostly true"],
    ["4", "Completely true"]
  ];
  const FOLLOWUP_ANSWER_LABELS = {
    "0": "No observed facts",
    "1": "Isolated occurrence",
    "2": "Occasional occurrences",
    "3": "Repeated occurrences",
    "4": "Frequent or structural occurrences",
    NE: "Insufficient information",
    NA: "Not applicable"
  };
  const FOLLOWUP_NUMERIC_ANSWERS = [
    ["0", "No observed facts"],
    ["1", "Isolated occurrence"],
    ["2", "Occasional occurrences"],
    ["3", "Repeated occurrences"],
    ["4", "Frequent or structural occurrences"]
  ];
  const CONTEXT_CHOICES = {
    sector: new Set(["Health, social care or prevention", "Industry, logistics or construction", "Services, consulting or support functions", "Government or public service", "Retail, hospitality or customer relations", "Education, research or training", "Other sector"]),
    size: new Set(["1 to 10 workers", "11 to 49", "50 to 249", "250 to 999", "1,000 or more"]),
    stage: new Set(["Scoping or solution selection", "Pilot in preparation", "Pilot recently started", "Pilot completed", "Deployment under way", "Deployment stabilised", "Use suspended"]),
    population: new Set(["1 to 10 people", "11 to 50", "51 to 250", "More than 250"]),
    nature: new Set(["Voluntary", "Recommended", "Expected", "Mandatory", "Not defined"])
  };
  const USE_CHOICES = new Set(["Generative assistant", "Work organisation", "HR decisions", "Monitoring or control", "Health or safety", "Physical system"]);
  const DECISION_OPTIONS = {
    T0: [
      ["Continue the assessment", "Further checks are still required."],
      ["Correct before the pilot", "Conditions must change."],
      ["Limit or suspend", "The current scope is not retained."],
      ["Decision deferred", "Information is insufficient."]
    ],
    T1: [
      ["Continue under conditions", "The pilot continues with explicit safeguards."],
      ["Correct before expansion", "The organisation or tool must change before expansion."],
      ["Limit or suspend", "Observed facts justify reducing or stopping use."],
      ["Decision deferred", "Further observations are needed."]
    ],
    TN: [
      ["Maintain under conditions", "Use continues with planned follow-up."],
      ["Correct the organisation", "The work, resources or rules must change."],
      ["Limit or suspend", "The scope must be reduced or use stopped."],
      ["Review later", "The decision is deferred to a future assessment."]
    ]
  };
  const DECISION_CHOICES = new Set(Object.values(DECISION_OPTIONS).flat().map(([value]) => value));
  const ACTION_STATUSES = new Set(["Not started", "In progress", "Completed", "Abandoned"]);

  const FOLLOWUP_TEXT = {
    G01: "Users had to process more cases, requests or outputs without a corresponding increase in time or resources.",
    G03: "Time spent prompting, checking results, correcting errors and documenting use encroached on scheduled breaks or working hours.",
    G04: "AI errors or AI-influenced decisions exposed workers to complaints, challenges or difficult human situations.",
    G06: "The fear or occurrence of an AI error affecting a service user, patient, client or colleague caused significant tension for workers.",
    G07: "AI procedures, scores or recommendations led workers to set aside their professional judgement.",
    G09: "Workers refrained from correcting, reporting, rejecting or suspending an AI recommendation for fear of an explicit or implicit penalty.",
    G11: "During an AI-related incident or error, unclear responsibilities between the user, management, support functions and provider delayed or prevented an effective response.",
    G12: "AI use made workers’ expertise, reasoning or review work less visible or less recognised.",
    G13: "Speed or productivity objectives associated with AI led to reduced quality, safety or time needed to do the work properly.",
    G14: "Workers were encouraged to follow an AI output that conflicted with professional standards, ethical judgement or the interests of the person concerned.",
    G16: "AI-related changes to tasks, roles or organisation were announced in an uncertain, changing or contradictory way.",
    G18: "AI-generated scores, indicators or analyses influenced a performance appraisal or employment decision using criteria that were not sufficiently explicit or predictable.",
    AI01: "Users lacked sufficient information about the system’s data, rules, criteria or limitations to interpret its outputs correctly in their work.",
    AI03: "A person affected by an AI output could not obtain prompt, traceable human review with genuine authority to change the decision.",
    AI04: "Prompting, reviewing, correcting or documenting outputs created additional workload that had not been planned in the organisation.",
    AI05: "Users reported that detecting plausible errors, bias or omissions required mental vigilance that was difficult to sustain over time.",
    AI07: "Automation reduced opportunities to practise the reasoning, actions or decisions that are essential to the occupation.",
    AI09: "AI unavailability or error prevented the work from being performed correctly and safely because no reliable fallback was in place."
  };

  const DIMENSIONS = [
    {
      id: "intensity",
      label: "Work intensity and working time",
      short: "Intensity and time",
      description: "Pace, objectives and the time actually available to review and correct.",
      action: "Measure review time and verify that objectives, deadlines and resources remain compatible.",
      questions: [
        { id: "G01", text: "Deployment could lead workers to process more cases, requests or outputs without a corresponding increase in time or resources." },
        { id: "G03", text: "The time needed to prompt, check results, correct errors and document use could encroach on scheduled breaks or working hours." }
      ]
    },
    {
      id: "emotion",
      label: "Emotional demands",
      short: "Emotional demands",
      description: "Human consequences of errors, challenges and sensitive situations.",
      action: "Identify difficult human situations that the tool may create or concentrate, and provide support.",
      questions: [
        { id: "G04", text: "AI errors or AI-influenced decisions could expose workers to more complaints, challenges or difficult human situations." },
        { id: "G06", text: "The possibility of an AI error affecting a service user, patient, client or colleague could become a major source of tension." }
      ]
    },
    {
      id: "autonomy",
      label: "Autonomy and decision-making",
      short: "Autonomy and decision-making",
      description: "Room for manoeuvre, professional judgement and the right to depart from the system.",
      action: "Formalise room for manoeuvre, the right to depart from an output and suspension conditions.",
      questions: [
        { id: "G07", text: "AI procedures, scores or recommendations could impose a way of working at the expense of professional judgement." },
        { id: "G09", text: "Correcting, reporting, rejecting or suspending an AI recommendation could result in an explicit or implicit penalty." }
      ]
    },
    {
      id: "relations",
      label: "Social relations and recognition",
      short: "Relations and recognition",
      description: "Responsibilities, cooperation and visibility of the necessary human work.",
      action: "Clarify responsibilities and make human reasoning, review and correction work visible.",
      questions: [
        { id: "G11", text: "If an AI-related error occurs, responsibilities between the user, management, support functions and provider could remain insufficiently clear." },
        { id: "G12", text: "AI-generated outputs could reduce recognition of workers’ expertise, reasoning or review work." }
      ]
    },
    {
      id: "values",
      label: "Value conflicts",
      short: "Value conflicts",
      description: "Work quality, safety and the ability to follow professional standards.",
      action: "Define quality and safety requirements that take priority over speed or productivity gains.",
      questions: [
        { id: "G13", text: "Expected gains in speed or productivity could take priority over quality, safety or the time needed to do the work properly." },
        { id: "G14", text: "Workers could be encouraged to follow an AI output that conflicts with professional standards, ethical judgement or the interests of the person concerned." }
      ]
    },
    {
      id: "insecurity",
      label: "Job insecurity",
      short: "Job insecurity",
      description: "Predictability of change and influence on employment or performance appraisal.",
      action: "Explain expected changes to tasks and jobs, and the criteria used in HR decisions.",
      questions: [
        { id: "G16", text: "AI-related changes to tasks, roles or organisation could be announced in an uncertain, changing or contradictory way." },
        { id: "G18", text: "AI-generated scores, indicators or analyses could influence performance appraisals or employment decisions using criteria that are difficult to predict." }
      ]
    },
    {
      id: "opacity",
      label: "Opacity and contestability",
      short: "Opacity and contestability",
      description: "Understanding outputs and access to human review with effective authority.",
      action: "Document system limitations and guarantee prompt, traceable human review with real authority.",
      questions: [
        { id: "AI01", text: "Users might not sufficiently understand which data, rules or criteria the system uses to produce recommendations or outputs." },
        { id: "AI03", text: "A person affected by an AI output might not have access to prompt, traceable human review with genuine authority to change the decision." }
      ]
    },
    {
      id: "supervision",
      label: "Cognitive supervision workload",
      short: "Supervision workload",
      description: "Mental effort required to prompt, review, correct and document.",
      action: "Test the time and effort required to detect plausible errors, bias and omissions.",
      questions: [
        { id: "AI04", text: "Prompting, reviewing, correcting and documenting outputs could create a substantial workload." },
        { id: "AI05", text: "Detecting plausible errors, bias or omissions in AI outputs could require sustained mental vigilance." }
      ]
    },
    {
      id: "skills",
      label: "Skill erosion",
      short: "Skill erosion",
      description: "Retention of know-how, learning and the ability to work without the tool.",
      action: "Preserve independent practice, learning tasks and the ability to work when the system is unavailable.",
      questions: [
        { id: "AI07", text: "Automation could reduce opportunities to practise the reasoning, actions or decisions that are essential to the occupation." },
        { id: "AI09", text: "The project could create such dependence that work could no longer be performed correctly and safely when the AI is unavailable or wrong." }
      ]
    }
  ];

  const ALL_QUESTIONS = DIMENSIONS.flatMap((dimension, dimensionIndex) =>
    dimension.questions.map((question) => ({ ...question, dimension, dimensionIndex }))
  );

  const app = document.querySelector("[data-assessment-app]");
  if (!app) return;

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  const elements = {
    views: $$("[data-view]", app),
    stageItems: $$(".assessment-stages li", app),
    dimensionRail: $(".dimension-rail", app),
    dimensionRailList: $("#dimensionRailList"),
    railAnswered: $("#railAnswered"),
    draftStatus: $(".draft-status", app),
    draftTitle: $("#draftStatusTitle"),
    draftDetail: $("#draftStatusDetail"),
    clearDraft: $("#clearDraftButton"),
    exportDraft: $("#exportDraftButton"),
    workspaceEyebrow: $("#workspaceEyebrow"),
    workspaceTitle: $("#workspaceTitle"),
    workspaceProgress: $("#workspaceProgress"),
    progressText: $("#progressText"),
    progressPercent: $("#progressPercent"),
    progressFill: $("#progressFill"),
    progressBar: $(".progress-track", app),
    start: $("#startButton"),
    startLabel: $("#startButtonLabel"),
    phaseChoices: $$("input[name='assessmentPhase']", app),
    resume: $("#resumeButton"),
    importButton: $("#importButton"),
    importInput: $("#importInput"),
    followupImportButton: $("#followupImportButton"),
    followupImportInput: $("#followupImportInput"),
    assessmentRailPhase: $("#assessmentRailPhase"),
    contextForm: $("#contextForm"),
    contextError: $("#contextError"),
    contextChangeWarning: $("#contextChangeWarning"),
    confirmContextChange: $("#confirmContextChange"),
    contextBack: $("#contextBack"),
    usageField: $("#usageField"),
    followupContextFields: $("#followupContextFields"),
    dimensionIndex: $("#dimensionIndex"),
    dimensionTitle: $("#dimensionTitle"),
    dimensionDescription: $("#dimensionDescription"),
    questionCards: $("#questionCards"),
    dimensionNote: $("#dimensionNote"),
    questionError: $("#questionError"),
    questionScaleHelp: $("#questionScaleHelp"),
    previousDimension: $("#previousDimension"),
    nextDimension: $("#nextDimension"),
    openReviewEarly: $("#openReviewEarly"),
    reviewSummary: $("#reviewSummary"),
    reviewStats: $("#reviewStats"),
    reviewList: $("#reviewList"),
    reviewError: $("#reviewError"),
    reviewBack: $("#reviewBack"),
    generateResults: $("#generateResults"),
    resultReference: $("#resultReference"),
    resultDate: $("#resultDate"),
    resultViewTitle: $("#resultViewTitle"),
    resultViewDescription: $("#resultViewDescription"),
    resultOrientation: $("#resultOrientation"),
    resultContext: $("#resultContext"),
    dimensionRadar: $("#dimensionRadar"),
    radarDescription: $("#radarDescription"),
    radarCoverage: $("#radarCoverage"),
    radarAccessibleBody: $("#radarAccessibleBody"),
    radarAxisKey: $("#radarAxisKey"),
    dimensionResults: $("#dimensionResults"),
    unknownSignals: $("#unknownSignals"),
    notApplicableSignals: $("#notApplicableSignals"),
    decisionRationale: $("#decisionRationale"),
    actionPlanAlert: $("#actionPlanAlert"),
    acknowledgeActionPlan: $("#acknowledgeActionPlan"),
    actionPlanBody: $("#actionPlanBody"),
    addActionRow: $("#addActionRow"),
    fullResponseList: $("#fullResponseList"),
    longitudinalSection: $("#longitudinalSection"),
    longitudinalTimeline: $("#longitudinalTimeline"),
    createNextFollowup: $("#createNextFollowup"),
    downloadHtml: $("#downloadHtml"),
    downloadJson: $("#downloadJson"),
    printResults: $("#printResults"),
    editAnswers: $("#editAnswers"),
    restart: $("#restartButton"),
    resetDialog: $("#resetDialog"),
    resetDialogTitle: $("#reset-dialog-title"),
    resetDialogText: $("#resetDialogText"),
    confirmReset: $("#confirmReset")
  };

  function localDateValue(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function createState(phase) {
    const selected = PHASES.has(phase) ? phase : "T0";
    return {
      schema: SCHEMA,
      version: VERSION,
      phase: selected,
      sequence: selected === "T0" ? 0 : selected === "T1" ? 1 : 2,
      view: "intro",
      currentDimension: 0,
      context: {
        sector: "",
        size: "",
        stage: "",
        population: "",
        assessmentDate: localDateValue(new Date()),
        nature: "",
        task: "",
        uses: [],
        projectCode: makeProjectCode(),
        systemVersion: "",
        periodStart: "",
        periodEnd: "",
        changesSincePrevious: "",
        participants: ""
      },
      answers: {},
      notes: {},
      decision: { status: "", rationale: "" },
      actionPlan: [],
      actionPlanInitialised: false,
      actionPlanCustomised: false,
      actionPlanNeedsReview: false,
      contextBaseline: null,
      timeline: [],
      reference: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  let state = createState();
  let savedDraft = readDraft();
  let saveTimer = 0;
  let resetMode = "clear";
  let pendingImportState = null;
  let pendingFollowupState = null;
  let selectedPhase = "T0";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function makeProjectCode() {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `PROJECT-${suffix}`;
  }

  function phaseLabel(targetState) {
    const target = targetState || state;
    if (target.phase === "T0") return "T0";
    if (target.phase === "T1") return "T1";
    return Number(target.sequence) >= 2 ? `T${target.sequence}` : "Periodic follow-up";
  }

  function phaseLongLabel(targetState) {
    const target = targetState || state;
    if (target.phase === "T0") return "T0 · Assumptions before the pilot";
    if (target.phase === "T1") return "T1 · Facts observed during the pilot";
    return `${phaseLabel(target)} · Post-deployment follow-up`;
  }

  function isFollowup(targetState) {
    return (targetState || state).phase !== "T0";
  }

  function answerLabelsFor(targetState) {
    return isFollowup(targetState) ? FOLLOWUP_ANSWER_LABELS : ANSWER_LABELS;
  }

  function numericAnswersFor(targetState) {
    return isFollowup(targetState) ? FOLLOWUP_NUMERIC_ANSWERS : NUMERIC_ANSWERS;
  }

  function questionText(question, targetState) {
    return isFollowup(targetState) ? FOLLOWUP_TEXT[question.id] : question.text;
  }

  function readDraft() {
    for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY]) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        return normaliseImportedState(parsed.data || parsed.state || parsed);
      } catch (error) {
        /* Continue with the next compatible local format. */
      }
    }
    return null;
  }

  function normaliseContext(source, phase) {
    const result = createState(phase).context;
    if (!source || typeof source !== "object") return result;
    Object.keys(result).forEach((key) => {
      if (key === "uses") {
        result.uses = Array.isArray(source.uses)
          ? [...new Set(source.uses.filter((value) => typeof value === "string" && USE_CHOICES.has(value)))].slice(0, USE_CHOICES.size)
          : [];
        return;
      }
      if (typeof source[key] !== "string") return;
      const limit = ["task", "changesSincePrevious", "participants"].includes(key) ? 1000 : 180;
      const value = source[key].slice(0, limit);
      result[key] = CONTEXT_CHOICES[key] ? (CONTEXT_CHOICES[key].has(value) ? value : "") : value;
    });
    if (!result.projectCode.trim()) result.projectCode = makeProjectCode();
    return result;
  }

  function normaliseAnswers(source) {
    const answers = {};
    if (!source || typeof source !== "object") return answers;
    ALL_QUESTIONS.forEach((question) => {
      const answer = String(source[question.id] == null ? "" : source[question.id]);
      if (ANSWER_VALUES.includes(answer)) answers[question.id] = answer;
    });
    return answers;
  }

  function normaliseActionPlan(source) {
    if (!Array.isArray(source)) return [];
    return source.slice(0, 30).map((row) => ({
      id: row && typeof row.id === "string" ? row.id.slice(0, 120) : makeId("action"),
      measure: row && typeof row.measure === "string" ? row.measure.slice(0, 1000) : "",
      owner: row && typeof row.owner === "string" ? row.owner.slice(0, 200) : "",
      due: row && typeof row.due === "string" && isCalendarDate(row.due) ? row.due : "",
      status: row && ACTION_STATUSES.has(row.status) ? row.status : "Not started",
      evidence: row && typeof row.evidence === "string" ? row.evidence.slice(0, 1000) : ""
    }));
  }

  function normaliseSnapshot(candidate) {
    if (!candidate || typeof candidate !== "object") return null;
    const phase = PHASES.has(candidate.phase) ? candidate.phase : "T0";
    const sequence = Number.isInteger(Number(candidate.sequence)) ? Math.max(0, Math.min(99, Number(candidate.sequence))) : phase === "T0" ? 0 : phase === "T1" ? 1 : 2;
    return {
      phase,
      sequence,
      reference: typeof candidate.reference === "string" ? candidate.reference.slice(0, 40) : "",
      context: normaliseContext(candidate.context, phase),
      answers: normaliseAnswers(candidate.answers),
      notes: DIMENSIONS.reduce((notes, dimension) => {
        if (candidate.notes && typeof candidate.notes[dimension.id] === "string") notes[dimension.id] = candidate.notes[dimension.id].slice(0, 1000);
        return notes;
      }, {}),
      decision: {
        status: candidate.decision && DECISION_CHOICES.has(candidate.decision.status) ? candidate.decision.status : "",
        rationale: candidate.decision && typeof candidate.decision.rationale === "string" ? candidate.decision.rationale.slice(0, 1000) : ""
      },
      actionPlan: normaliseActionPlan(candidate.actionPlan),
      actionPlanNeedsReview: candidate.actionPlanNeedsReview === true,
      createdAt: typeof candidate.createdAt === "string" ? candidate.createdAt : "",
      updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : ""
    };
  }

  function normaliseImportedState(candidate) {
    if (!candidate || typeof candidate !== "object") throw new Error("Invalid draft format.");
    if (candidate.schema !== SCHEMA && candidate.schema !== LEGACY_SCHEMA) throw new Error("This file does not belong to the assessment tool.");
    const phase = candidate.schema === LEGACY_SCHEMA ? "T0" : PHASES.has(candidate.phase) ? candidate.phase : "T0";
    const next = createState(phase);
    next.sequence = Number.isInteger(Number(candidate.sequence)) ? Math.max(0, Math.min(99, Number(candidate.sequence))) : next.sequence;
    next.context = normaliseContext(candidate.context, phase);
    next.answers = normaliseAnswers(candidate.answers);
    if (candidate.notes && typeof candidate.notes === "object") {
      DIMENSIONS.forEach((dimension) => {
        if (typeof candidate.notes[dimension.id] === "string") next.notes[dimension.id] = candidate.notes[dimension.id].slice(0, 1000);
      });
    }
    if (candidate.contextBaseline && typeof candidate.contextBaseline === "object") next.contextBaseline = normaliseContext(candidate.contextBaseline, phase);
    if (candidate.decision && typeof candidate.decision === "object") {
      next.decision.status = DECISION_CHOICES.has(candidate.decision.status) ? candidate.decision.status : "";
      next.decision.rationale = typeof candidate.decision.rationale === "string" ? candidate.decision.rationale.slice(0, 1000) : "";
    }
    next.actionPlan = normaliseActionPlan(candidate.actionPlan);
    next.actionPlanInitialised = candidate.actionPlanInitialised === true || next.actionPlan.length > 0;
    next.actionPlanCustomised = candidate.actionPlanCustomised === true;
    next.actionPlanNeedsReview = candidate.actionPlanNeedsReview === true;

    const importedDimension = Number(candidate.currentDimension);
    next.currentDimension = Number.isInteger(importedDimension)
      ? Math.max(0, Math.min(DIMENSIONS.length - 1, importedDimension))
      : 0;
    next.reference = typeof candidate.reference === "string" ? candidate.reference.slice(0, 40) : "";
    next.timeline = Array.isArray(candidate.timeline)
      ? candidate.timeline.slice(-20).map(normaliseSnapshot).filter(Boolean)
      : [];
    next.createdAt = typeof candidate.createdAt === "string" ? candidate.createdAt : next.createdAt;
    next.updatedAt = typeof candidate.updatedAt === "string" ? candidate.updatedAt : next.updatedAt;
    next.view = ["context", "questions", "review", "results"].includes(candidate.view) ? candidate.view : "context";
    if (!next.contextBaseline && contextIsComplete(next.context, next.phase) && countAnswered(next) > 0) {
      next.contextBaseline = cloneContext(next.context);
    }

    if (next.view === "results" && countAnswered(next) !== ALL_QUESTIONS.length) next.view = "review";
    if ((next.view === "questions" || next.view === "review" || next.view === "results") && !contextIsComplete(next.context, next.phase)) next.view = "context";
    return next;
  }

  function makeId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return `${prefix}-${window.crypto.randomUUID().slice(0, 8)}`;
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function makeReference() {
    const date = (state.context.assessmentDate || localDateValue(new Date())).replace(/-/g, "");
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${phaseLabel(state).replace(/\s+/g, "-").toUpperCase()}-${date}-${suffix}`;
  }

  function countAnswered(targetState) {
    return ALL_QUESTIONS.filter((question) => ANSWER_VALUES.includes(targetState.answers[question.id])).length;
  }

  function isCalendarDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    return localDateValue(parsed) === value;
  }

  function isValidAssessmentDate(value) {
    return isCalendarDate(value) && value <= localDateValue(new Date());
  }

  function contextIsComplete(context, phase) {
    const selected = PHASES.has(phase) ? phase : state.phase;
    const commonComplete = Boolean(
      context &&
      CONTEXT_CHOICES.sector.has(context.sector) && CONTEXT_CHOICES.size.has(context.size) &&
      CONTEXT_CHOICES.stage.has(context.stage) && CONTEXT_CHOICES.population.has(context.population) &&
      isValidAssessmentDate(context.assessmentDate) && CONTEXT_CHOICES.nature.has(context.nature) &&
      typeof context.task === "string" && context.task.trim().length >= 12 &&
      context.task.trim().length <= 600 && Array.isArray(context.uses) && context.uses.length &&
      context.uses.every((value) => USE_CHOICES.has(value)) &&
      typeof context.projectCode === "string" && context.projectCode.trim().length >= 4
    );
    if (!commonComplete || selected === "T0") return commonComplete;
    return Boolean(
      typeof context.systemVersion === "string" && context.systemVersion.trim().length >= 2 &&
      isValidAssessmentDate(context.periodStart) && isValidAssessmentDate(context.periodEnd) &&
      context.periodStart <= context.periodEnd && context.periodEnd <= context.assessmentDate &&
      typeof context.participants === "string" && context.participants.trim().length >= 4
    );
  }

  function persistState(immediate) {
    window.clearTimeout(saveTimer);
    const write = () => {
      state.updatedAt = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ schema: SCHEMA, version: VERSION, data: state }));
        savedDraft = normaliseImportedState(state);
        renderDraftStatus(true);
      } catch (error) {
        elements.draftStatus.classList.remove("is-saved");
        elements.draftTitle.textContent = "Storage unavailable";
        elements.draftDetail.textContent = "Export the draft to keep it.";
        elements.exportDraft.hidden = false;
      }
    };
    if (immediate) write();
    else saveTimer = window.setTimeout(write, 220);
  }

  function renderDraftStatus(hasDraft) {
    const available = Boolean(hasDraft || savedDraft);
    elements.resume.hidden = !available;
    elements.clearDraft.hidden = !available;
    elements.exportDraft.hidden = !available && state.view === "intro";
    elements.draftStatus.classList.toggle("is-saved", available);
    if (!available) {
      elements.draftTitle.textContent = "No draft";
      elements.draftDetail.textContent = "Nothing is transmitted.";
      return;
    }
    const date = (savedDraft && savedDraft.updatedAt) || state.updatedAt;
    elements.draftTitle.textContent = "Draft saved";
    const parsedDate = date ? new Date(date) : null;
    elements.draftDetail.textContent = parsedDate && !Number.isNaN(parsedDate.getTime())
      ? `On this device · ${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(parsedDate)}`
      : "On this device only.";
  }

  function renderPhaseSelector() {
    elements.phaseChoices.forEach((choice) => {
      const active = choice.value === selectedPhase;
      choice.checked = active;
    });
    const labels = {
      T0: "Start T0",
      T1: "Start pilot follow-up",
      TN: "Start periodic follow-up"
    };
    if (elements.startLabel) elements.startLabel.textContent = labels[selectedPhase];
    else if (elements.start) elements.start.innerHTML = `${labels[selectedPhase]} <span>→</span>`;
  }

  function renderDecisionOptions() {
    const container = $(".decision-options", app);
    if (!container) return;
    const options = DECISION_OPTIONS[state.phase] || DECISION_OPTIONS.T0;
    container.innerHTML = `<legend>Direction chosen at this stage</legend>${options.map(([value, help]) => `<label><input type="radio" name="decision" value="${escapeHtml(value)}" ${state.decision.status === value ? "checked" : ""}><span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(help)}</small></span></label>`).join("")}`;
  }

  function updatePhaseUi(phase) {
    const selected = PHASES.has(phase) ? phase : "T0";
    app.dataset.phase = selected.toLowerCase();
    const followup = selected !== "T0";
    if (elements.followupContextFields) {
      elements.followupContextFields.hidden = !followup;
      $$('input, textarea, select', elements.followupContextFields).forEach((field) => { field.disabled = !followup; });
    }
    if (elements.assessmentRailPhase) elements.assessmentRailPhase.textContent = phaseLongLabel({ phase: selected, sequence: state.sequence });
    if (elements.questionScaleHelp) {
      elements.questionScaleHelp.innerHTML = followup
        ? "<strong>How often were these facts observed during the defined period?</strong><span>0 = no observed facts · 4 = frequent or structural occurrences. Use NE when information is missing, without estimating.</span>"
        : "<strong>To what extent does each statement describe the planned project?</strong><span>0 = not at all true · 4 = completely true. Use NE when information is missing rather than estimating.</span>";
    }
    if (elements.resultViewTitle) elements.resultViewTitle.textContent = followup ? "Facts to discuss and follow-up actions." : "Discussion priorities before the pilot.";
    if (elements.resultViewDescription) elements.resultViewDescription.textContent = followup
      ? "This profile describes facts reported for a defined period. It does not measure a risk level and must not be used to assess individual workers."
      : "This profile describes the answers entered. It does not measure a risk level and is not authorisation to deploy.";
  }

  function syncContextForm() {
    updatePhaseUi(state.phase);
    Object.keys(state.context).forEach((key) => {
      if (key === "uses") return;
      const field = elements.contextForm.elements.namedItem(key);
      if (field) field.value = state.context[key] || "";
    });
    $$("input[name='uses']", elements.contextForm).forEach((input) => {
      input.checked = state.context.uses.includes(input.value);
    });
    ["assessmentDate", "periodStart", "periodEnd"].forEach((id) => {
      const field = $(`#${id}`);
      if (field) field.max = localDateValue(new Date());
    });
  }

  function collectContext() {
    const data = new FormData(elements.contextForm);
    const value = (name) => {
      const field = elements.contextForm.elements.namedItem(name);
      return String(field ? field.value : data.get(name) || "");
    };
    state.context = {
      sector: value("sector"),
      size: value("size"),
      stage: value("stage"),
      population: value("population"),
      assessmentDate: value("assessmentDate"),
      nature: value("nature"),
      task: value("task").trim(),
      uses: data.getAll("uses").map(String),
      projectCode: value("projectCode").trim(),
      systemVersion: value("systemVersion").trim(),
      periodStart: value("periodStart"),
      periodEnd: value("periodEnd"),
      changesSincePrevious: value("changesSincePrevious").trim(),
      participants: value("participants").trim()
    };
  }

  function cloneContext(context) {
    return { ...context, uses: Array.isArray(context.uses) ? [...context.uses] : [] };
  }

  function contextSignature(context) {
    if (!context) return "";
    return JSON.stringify(Object.keys(createState(state.phase).context).reduce((signature, key) => {
      signature[key] = key === "uses"
        ? (Array.isArray(context.uses) ? [...context.uses].sort() : [])
        : String(context[key] || "").trim();
      return signature;
    }, {}));
  }

  function contextHasChanged() {
    return Boolean(state.contextBaseline && contextSignature(state.contextBaseline) !== contextSignature(state.context));
  }

  function updateContextChangeWarning() {
    const visible = contextHasChanged() && countAnswered(state) > 0;
    elements.contextChangeWarning.hidden = !visible;
    if (!visible) elements.confirmContextChange.checked = false;
    return visible;
  }

  function resetDependentData() {
    state.answers = {};
    state.notes = {};
    state.currentDimension = 0;
    state.decision = { status: "", rationale: "" };
    state.actionPlan = [];
    state.actionPlanInitialised = false;
    state.actionPlanCustomised = false;
    state.actionPlanNeedsReview = false;
    state.reference = "";
  }

  function validateContext() {
    collectContext();
    elements.contextError.textContent = "";
    elements.usageField.classList.remove("has-error");
    elements.usageField.removeAttribute("aria-invalid");
    const requiredFields = ["projectCode", "sector", "size", "stage", "population", "assessmentDate", "nature", "task"]
      .concat(isFollowup() ? ["systemVersion", "periodStart", "periodEnd", "participants"] : []);
    const invalid = requiredFields.map((name) => elements.contextForm.elements.namedItem(name)).find((field) => !field.checkValidity());
    if (invalid) {
      elements.contextError.textContent = invalid.id === "assessmentDate" && invalid.validity.rangeOverflow
        ? "The assessment date cannot be in the future."
        : invalid.id === "task" && invalid.value.trim().length < 12
          ? "Describe the task using at least 12 characters."
          : "Complete this field before continuing.";
      invalid.focus();
      return false;
    }
    if (state.context.task.trim().length < 12) {
      elements.contextError.textContent = "Describe the task using at least 12 meaningful characters.";
      $("#task").focus();
      return false;
    }
    if (state.context.projectCode.trim().length < 4) {
      elements.contextError.textContent = "Enter a project code of at least 4 characters, without any person’s name.";
      const field = elements.contextForm.elements.namedItem("projectCode");
      if (field) field.focus();
      return false;
    }
    if (!state.context.uses.length) {
      elements.contextError.textContent = "Select at least one intended AI function.";
      elements.usageField.classList.add("has-error");
      elements.usageField.setAttribute("aria-invalid", "true");
      const firstUsage = $("input[name='uses']", elements.usageField);
      if (firstUsage) firstUsage.focus();
      return false;
    }
    if (state.context.assessmentDate > localDateValue(new Date())) {
      elements.contextError.textContent = "The assessment date cannot be in the future.";
      $("#assessmentDate").focus();
      return false;
    }
    if (isFollowup()) {
      if (state.context.systemVersion.trim().length < 2) {
        elements.contextError.textContent = "Enter the system or version actually observed.";
        const field = elements.contextForm.elements.namedItem("systemVersion");
        if (field) field.focus();
        return false;
      }
      if (!isValidAssessmentDate(state.context.periodStart) || !isValidAssessmentDate(state.context.periodEnd)) {
        elements.contextError.textContent = "Enter a valid observation period that is not in the future.";
        const field = elements.contextForm.elements.namedItem("periodStart");
        if (field) field.focus();
        return false;
      }
      if (state.context.periodStart > state.context.periodEnd) {
        elements.contextError.textContent = "The start of the period must precede its end.";
        const field = elements.contextForm.elements.namedItem("periodStart");
        if (field) field.focus();
        return false;
      }
      if (state.context.periodEnd > state.context.assessmentDate) {
        elements.contextError.textContent = "The assessment date must be on or after the end of the observed period.";
        const field = elements.contextForm.elements.namedItem("assessmentDate");
        if (field) field.focus();
        return false;
      }
      if (state.context.participants.trim().length < 4) {
        elements.contextError.textContent = "Enter the roles represented in the assessment, without names.";
        const field = elements.contextForm.elements.namedItem("participants");
        if (field) field.focus();
        return false;
      }
    }
    if (updateContextChangeWarning() && !elements.confirmContextChange.checked) {
      elements.contextError.textContent = "Confirm the reset caused by the scope change before continuing.";
      elements.confirmContextChange.focus();
      return false;
    }
    if (contextHasChanged() && countAnswered(state) > 0) resetDependentData();
    state.contextBaseline = cloneContext(state.context);
    elements.contextChangeWarning.hidden = true;
    elements.confirmContextChange.checked = false;
    return true;
  }

  function stageForView(view) {
    return { context: 0, questions: 1, review: 2, results: 3 }[view];
  }

  function updateStageNavigation(view) {
    const current = stageForView(view);
    const answered = countAnswered(state);
    const contextReady = contextIsComplete(state.context);
    const contextDirty = contextHasChanged() && answered > 0;
    elements.stageItems.forEach((item, index) => {
      const button = $("button", item);
      const enabled = index === 0 || (!contextDirty && ((index === 1 && contextReady) || (index === 2 && answered > 0) || (index === 3 && answered === ALL_QUESTIONS.length)));
      button.disabled = !enabled;
      item.classList.toggle("is-current", index === current);
      const complete = (index === 0 && contextReady) || (index === 1 && answered === ALL_QUESTIONS.length) || (index === 2 && view === "results");
      item.classList.toggle("is-complete", complete);
      if (index === current) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
  }

  function updateWorkspaceStatus(view) {
    const campaign = phaseLabel(state);
    const labels = {
      intro: ["Choose an assessment", "Prepare a useful assessment"],
      context: [`${campaign} · Step 1 of 4`, "Frame the use case"],
      questions: [`${campaign} · Step 2 of 4 · Dimension ${state.currentDimension + 1} out of 9`, DIMENSIONS[state.currentDimension].label],
      review: [`${campaign} · Step 3 of 4`, "Review all 18 answers"],
      results: [`${campaign} · Step 4 of 4`, "Document the decision and actions"]
    };
    elements.workspaceEyebrow.textContent = labels[view][0];
    elements.workspaceTitle.textContent = labels[view][1];
    elements.workspaceProgress.hidden = view === "intro" || view === "context";
    updateProgress();
  }

  function showView(view, options) {
    const opts = options || {};
    state.view = view;
    elements.views.forEach((section) => {
      const active = section.dataset.view === view;
      section.hidden = !active;
      section.classList.toggle("is-active", active);
      section.setAttribute("aria-hidden", String(!active));
    });
    elements.dimensionRail.hidden = view !== "questions";
    updateStageNavigation(view);
    updateWorkspaceStatus(view);
    if (view !== "intro" && opts.save !== false) persistState();

    if (opts.focus !== false) {
      window.requestAnimationFrame(() => {
        const activeView = elements.views.find((section) => section.dataset.view === view);
        const focusTarget = activeView && $("h3[tabindex='-1']", activeView);
        if (focusTarget) focusTarget.focus({ preventScroll: true });
        const workspaceTop = app.getBoundingClientRect().top;
        if (workspaceTop < 0 || workspaceTop > window.innerHeight * 0.55) {
          app.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        }
      });
    }
  }

  function updateProgress() {
    const answered = countAnswered(state);
    const percent = Math.round((answered / ALL_QUESTIONS.length) * 100);
    elements.railAnswered.textContent = `${answered} / ${ALL_QUESTIONS.length}`;
    elements.progressText.textContent = `${answered} answer${answered === 1 ? "" : "s"} out of ${ALL_QUESTIONS.length}`;
    elements.progressPercent.textContent = `${percent} %`;
    elements.progressFill.style.width = `${percent}%`;
    elements.progressBar.setAttribute("aria-valuenow", String(answered));
    renderDimensionRail();
  }

  function renderDimensionRail() {
    elements.dimensionRailList.innerHTML = DIMENSIONS.map((dimension, index) => {
      const values = dimension.questions.map((question) => state.answers[question.id]);
      const complete = values.every((value) => ANSWER_VALUES.includes(value));
      const gap = values.some((value) => value === "NE");
      return `<li class="${index === state.currentDimension ? "is-current " : ""}${complete ? "is-complete " : ""}${gap ? "has-gap" : ""}"><button type="button" data-dimension="${index}" ${index === state.currentDimension ? 'aria-current="step" ' : ""}aria-label="Dimension ${index + 1} : ${escapeHtml(dimension.label)}${complete ? ", complete" : ", to complete"}"><span>${String(index + 1).padStart(2, "0")}</span><span>${escapeHtml(dimension.short)}</span><i aria-hidden="true"></i></button></li>`;
    }).join("");
  }

  function responseChip(value, code, targetState) {
    const target = targetState || state;
    const actual = ANSWER_VALUES.includes(value) ? value : "—";
    const classes = [];
    if (actual === "3" || actual === "4") classes.push("is-high");
    if (actual === "NE" || actual === "NA" || actual === "—") classes.push("is-gap");
    const label = actual === "—" ? "No answer" : answerLabelsFor(target)[actual];
    const attention = actual === "3" || actual === "4" ? ' title="Individual point requiring attention"' : "";
    return `<span class="response-chip${classes.length ? ` ${classes.join(" ")}` : ""}"${attention}>${code ? `${escapeHtml(code)} · ` : ""}${escapeHtml(actual)} · ${escapeHtml(label)}</span>`;
  }

  function renderQuestionCards() {
    const dimension = DIMENSIONS[state.currentDimension];
    elements.dimensionIndex.textContent = `Dimension ${state.currentDimension + 1} of ${DIMENSIONS.length}`;
    elements.dimensionTitle.textContent = dimension.label;
    elements.dimensionDescription.textContent = dimension.description;
    elements.dimensionNote.value = state.notes[dimension.id] || "";
    elements.questionError.textContent = "";
    elements.previousDimension.textContent = state.currentDimension === 0 ? "← Scoping" : "← Previous dimension";
    elements.nextDimension.innerHTML = state.currentDimension === DIMENSIONS.length - 1 ? "Review answers <span>→</span>" : "Next dimension <span>→</span>";

    const answerLabels = answerLabelsFor(state);
    elements.questionCards.innerHTML = dimension.questions.map((question) => {
      const selected = state.answers[question.id];
      const numeric = numericAnswersFor(state).map(([value, label]) => `<label><input type="radio" name="answer-${question.id}" value="${value}" ${selected === value ? "checked" : ""}><b>${value}</b><span>${label}</span></label>`).join("");
      const qualitative = ["NE", "NA"].map((value) => `<label><input type="radio" name="answer-${question.id}" value="${value}" ${selected === value ? "checked" : ""}><b>${value}</b><span>${answerLabels[value]}</span></label>`).join("");
      return `<article class="question-card" data-question="${question.id}"><div class="question-card-head"><span class="question-card-code">${question.id}</span><h4 id="question-${question.id}">${escapeHtml(questionText(question, state))}</h4></div><fieldset class="answer-set" aria-labelledby="question-${question.id}" aria-describedby="questionError"><legend>Answer to question ${question.id}</legend><div class="numeric-scale">${numeric}</div><div class="qualitative-scale">${qualitative}</div></fieldset></article>`;
    }).join("");
    updateProgress();
  }

  function dimensionIsComplete(index) {
    return DIMENSIONS[index].questions.every((question) => ANSWER_VALUES.includes(state.answers[question.id]));
  }

  function firstIncompleteDimension() {
    return DIMENSIONS.findIndex((dimension) => dimension.questions.some((question) => !ANSWER_VALUES.includes(state.answers[question.id])));
  }

  function renderReview() {
    const answered = countAnswered(state);
    const scoreModel = radarModel(state);
    const insufficient = ALL_QUESTIONS.filter((question) => state.answers[question.id] === "NE").length;
    const notApplicable = ALL_QUESTIONS.filter((question) => state.answers[question.id] === "NA").length;
    elements.reviewSummary.textContent = answered === ALL_QUESTIONS.length
      ? "All 18 answers are saved. Check their consistency before producing the report."
      : `${ALL_QUESTIONS.length - answered} answer${ALL_QUESTIONS.length - answered === 1 ? "" : "s"} still to complete before producing the report.`;
    elements.reviewStats.innerHTML = [
      [answered, answered === 1 ? "answer saved out of 18" : "answers saved out of 18"],
      [scoreModel.scoredAxes, scoreModel.scoredAxes === 1 ? "axis score available out of 9" : "axis scores available out of 9"],
      [insufficient, "answers with insufficient information"],
      [notApplicable, notApplicable === 1 ? "non-applicable situation" : "non-applicable situations"]
    ].map(([value, label]) => `<div class="review-stat"><b>${value}</b><span>${label}</span></div>`).join("");

    elements.reviewList.innerHTML = DIMENSIONS.map((dimension, index) => {
      const complete = dimensionIsComplete(index);
      const chips = dimension.questions.map((question) => responseChip(state.answers[question.id], question.id)).join("");
      const note = state.notes[dimension.id] ? `Note: ${escapeHtml(state.notes[dimension.id])}` : "No observation added.";
      return `<article class="review-card${complete ? "" : " is-incomplete"}"><div class="review-card-head"><span>${String(index + 1).padStart(2, "0")} · ${complete ? "COMPLETE" : "TO COMPLETE"}</span><button type="button" data-edit-dimension="${index}">Edit</button></div><strong>${escapeHtml(dimension.label)}</strong><div class="review-values">${chips}</div><small>${note}</small></article>`;
    }).join("");
    elements.reviewError.textContent = "";
    elements.generateResults.disabled = answered !== ALL_QUESTIONS.length;
    updateProgress();
  }

  function formatAssessmentDate(value) {
    if (!value) return "Not provided";
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return value;
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(parts[0], parts[1] - 1, parts[2]));
  }

  function dimensionSummary(dimension, targetState) {
    const target = targetState || state;
    const values = dimension.questions.map((question) => target.answers[question.id]);
    return {
      ...axisScore(dimension, target),
      insufficient: values.filter((value) => value === "NE").length,
      notApplicable: values.filter((value) => value === "NA").length
    };
  }

  function resultOrientation() {
    const model = radarModel(state);
    const scored = model.axes.filter((axis) => axis.value !== null).sort((left, right) => right.value - left.value);
    const unavailable = DIMENSIONS.length - model.scoredAxes;
    const missingSuffix = unavailable
      ? ` ${unavailable} axis score${unavailable === 1 ? " remains" : "s remain"} uncalculated and must be documented separately.`
      : "";
    if (!scored.length) return {
      title: "No axis score can be calculated yet.",
      text: "Complete missing information or review non-applicable situations. No numeric substitution is made."
    };
    const topValue = scored[0].value;
    const topAxes = scored.filter((axis) => axis.value === topValue);
    const names = topAxes.map((axis) => `“${axis.dimension.label}”`).join(topAxes.length > 2 ? ", " : " and ");
    return {
      title: `${topAxes.length > 1 ? "The most marked axes are" : "The most marked axis is"} ${names} (${formatAxisScore(topValue)} / 4).`,
      text: `This indicator summarises two answers per axis. It helps prioritise discussion with the people concerned without producing a diagnosis or automatic decision.${missingSuffix}`
    };
  }

  function makeSuggestedActions() {
    const summaries = DIMENSIONS.map((dimension) => dimensionSummary(dimension));
    const incomplete = summaries.filter((summary) => summary.status === "insufficient");
    const highest = summaries.filter((summary) => summary.value !== null && summary.value > 0).sort((left, right) => right.value - left.value).slice(0, 3);
    const selected = [...new Map([...incomplete, ...highest].map((summary) => [summary.dimension.id, summary.dimension])).values()];
    const source = selected.length ? selected : [{ action: "Compare this profile with observation of real work and the views of the people directly concerned." }];
    return source.map((dimension) => ({ id: makeId("action"), measure: dimension.action, owner: "", due: "", status: "Not started", evidence: "" }));
  }

  function actionPlanIsUntouched() {
    const suggestions = new Set(DIMENSIONS.map((dimension) => dimension.action));
    suggestions.add("Compare this profile with observation of real work and the views of the people directly concerned.");
    return state.actionPlan.length > 0 && state.actionPlan.every((row) => suggestions.has(row.measure) && !row.owner && !row.due && !row.evidence);
  }

  function numericRadarValue(value) {
    return /^(0|1|2|3|4)$/.test(String(value)) ? Number(value) : null;
  }

  function formatAxisScore(value) {
    return value === null || !Number.isFinite(value)
      ? "—"
      : new Intl.NumberFormat("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  }

  function axisScore(dimension, targetState) {
    const target = targetState || state;
    const labels = answerLabelsFor(target);
    const items = dimension.questions.map((question) => {
      const raw = target.answers[question.id];
      return { question, raw, value: numericRadarValue(raw), label: labels[raw] || "No answer" };
    });
    const calculable = items.every((item) => item.value !== null);
    const status = calculable
      ? "complete"
      : items.some((item) => item.raw === "NE")
        ? "insufficient"
        : items.some((item) => item.raw === "NA")
          ? "not-applicable"
          : "unanswered";
    const statusLabel = {
      complete: "Score calculated",
      insufficient: "Insufficient information",
      "not-applicable": "Not applicable",
      unanswered: "To complete"
    }[status];
    return {
      dimension,
      items,
      value: calculable ? (items[0].value + items[1].value) / 2 : null,
      status,
      statusLabel
    };
  }

  function radarPoint(index, value, radius) {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2 / DIMENSIONS.length);
    const distance = (radius || 190) * value / 4;
    return {
      x: 340 + Math.cos(angle) * distance,
      y: 285 + Math.sin(angle) * distance,
      angle
    };
  }

  function radarModel(targetState) {
    const target = targetState || state;
    const axes = DIMENSIONS.map((dimension) => axisScore(dimension, target));
    return {
      axes,
      scoredAxes: axes.filter((axis) => axis.value !== null).length,
      insufficientAxes: axes.filter((axis) => axis.status === "insufficient").length,
      notApplicableAxes: axes.filter((axis) => axis.status === "not-applicable").length,
      unansweredAxes: axes.filter((axis) => axis.status === "unanswered").length
    };
  }

  function buildRadarSvgContent(targetState) {
    const target = targetState || state;
    const model = radarModel(target);
    const rings = [1, 2, 3, 4].map((level) => {
      const points = DIMENSIONS.map((dimension, index) => {
        const point = radarPoint(index, level);
        return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
      }).join(" ");
      return `<polygon class="radar-ring radar-ring-${level}" points="${points}"></polygon>`;
    }).join("");
    const spokes = DIMENSIONS.map((dimension, index) => {
      const end = radarPoint(index, 4);
      const label = radarPoint(index, 5.05);
      return `<line class="radar-spoke" x1="340" y1="285" x2="${end.x.toFixed(1)}" y2="${end.y.toFixed(1)}"></line><text class="radar-axis-number" x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${String(index + 1).padStart(2, "0")}</text>`;
    }).join("");
    const scale = [0, 1, 2, 3, 4].map((level) => {
      const point = radarPoint(0, level);
      return `<text class="radar-scale-label" x="347" y="${point.y.toFixed(1)}">${level}</text>`;
    }).join("");
    const completeProfile = model.axes.every((axis) => axis.value !== null);
    const profilePoints = completeProfile
      ? model.axes.map((axis, index) => {
          const point = radarPoint(index, axis.value);
          return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
        }).join(" ")
      : "";
    const shape = completeProfile ? `<polygon class="radar-axis-score-shape" points="${profilePoints}"></polygon>` : "";
    const lines = model.axes.slice(0, -1).map((axis, index) => {
      const next = model.axes[index + 1];
      if (axis.value === null || next.value === null) return "";
      const firstPoint = radarPoint(index, axis.value);
      const secondPoint = radarPoint(index + 1, next.value);
      return `<line class="radar-axis-score-line" x1="${firstPoint.x.toFixed(1)}" y1="${firstPoint.y.toFixed(1)}" x2="${secondPoint.x.toFixed(1)}" y2="${secondPoint.y.toFixed(1)}"></line>`;
    }).join("");
    const closing = completeProfile
      ? (() => {
          const firstPoint = radarPoint(0, model.axes[0].value);
          const lastPoint = radarPoint(DIMENSIONS.length - 1, model.axes[model.axes.length - 1].value);
          return `<line class="radar-axis-score-line" x1="${lastPoint.x.toFixed(1)}" y1="${lastPoint.y.toFixed(1)}" x2="${firstPoint.x.toFixed(1)}" y2="${firstPoint.y.toFixed(1)}"></line>`;
        })()
      : "";
    const markers = model.axes.map((axis, index) => {
      if (axis.value === null) {
        const badge = radarPoint(index, 4.48);
        const symbol = axis.status === "not-applicable" ? "×" : "?";
        return `<g class="radar-status"><circle cx="${badge.x.toFixed(1)}" cy="${badge.y.toFixed(1)}" r="11"></circle><text x="${badge.x.toFixed(1)}" y="${badge.y.toFixed(1)}" text-anchor="middle" dominant-baseline="central">${symbol}</text><title>${escapeHtml(`${axis.dimension.label} — uncalculated score — ${axis.statusLabel}`)}</title></g>`;
      }
      const point = radarPoint(index, axis.value);
      const sources = axis.items.map((item) => `${item.question.id} = ${item.raw}`).join(" and ");
      const title = escapeHtml(`${axis.dimension.label} — ${formatAxisScore(axis.value)} out of 4 — mean of ${sources}`);
      return `<circle class="radar-axis-score-point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="6"><title>${title}</title></circle>`;
    }).join("");
    const empty = model.scoredAxes === 0 ? '<text class="radar-empty" x="340" y="285" text-anchor="middle"><tspan x="340">No calculable axis score.</tspan><tspan x="340" dy="21">View answer details.</tspan></text>' : "";
    return `<g class="radar-grid">${rings}${spokes}${scale}</g><g class="radar-axis-score">${shape}${lines}${closing}${markers}</g>${empty}`;
  }

  function radarCoverageText(model) {
    const parts = [`${model.scoredAxes} axis score${model.scoredAxes === 1 ? "" : "s"} available out of 9`];
    if (model.insufficientAxes) parts.push(`${model.insufficientAxes} axis score${model.insufficientAxes === 1 ? "" : "s"} to document`);
    if (model.notApplicableAxes) parts.push(`${model.notApplicableAxes} axis score${model.notApplicableAxes === 1 ? "" : "s"} uncalculated because of NA`);
    if (model.unansweredAxes) parts.push(`${model.unansweredAxes} incomplete axis score${model.unansweredAxes === 1 ? "" : "s"}`);
    return parts.join(" · ");
  }

  function renderRadar(targetState) {
    if (!elements.dimensionRadar) return;
    const target = targetState || state;
    const model = radarModel(target);
    const description = `${phaseLongLabel(target)}. ${radarCoverageText(model)}. Each score is the mean of the axis’s two numeric answers, out of 4.`;
    elements.dimensionRadar.innerHTML = `<title>Summary scores for the nine axes</title><desc id="radarDescription">${escapeHtml(description)}</desc>${buildRadarSvgContent(target)}`;
    elements.dimensionRadar.setAttribute("aria-labelledby", "radarTitle radarDescription");
    if (!$("#radarTitle", elements.dimensionRadar)) {
      const title = $("title", elements.dimensionRadar);
      if (title) title.id = "radarTitle";
    }
    if (elements.radarCoverage) elements.radarCoverage.textContent = radarCoverageText(model);
    if (elements.radarAccessibleBody) {
      elements.radarAccessibleBody.innerHTML = model.axes.map((axis, index) => {
        const score = axis.value === null ? `Uncalculated · ${axis.statusLabel}` : `${formatAxisScore(axis.value)} / 4`;
        const responses = axis.items.map((item) => `${item.question.id} · ${item.raw || "—"} · ${item.label}`).join(" — ");
        return `<tr><th scope="row"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(axis.dimension.label)}</th><td><strong>${escapeHtml(score)}</strong></td><td>${escapeHtml(responses)}</td></tr>`;
      }).join("");
    }
    if (elements.radarAxisKey) elements.radarAxisKey.innerHTML = DIMENSIONS.map((dimension, index) => `<li><b>${String(index + 1).padStart(2, "0")}</b>${escapeHtml(dimension.short)}</li>`).join("");
  }

  function snapshotState(targetState) {
    const target = targetState || state;
    return normaliseSnapshot({
      phase: target.phase,
      sequence: target.sequence,
      reference: target.reference,
      context: target.context,
      answers: target.answers,
      notes: target.notes,
      decision: target.decision,
      actionPlan: target.actionPlan,
      actionPlanNeedsReview: target.actionPlanNeedsReview === true,
      createdAt: target.createdAt,
      updatedAt: target.updatedAt
    });
  }

  function passageStats(target) {
    const values = Object.values(target.answers || {});
    const scoreModel = radarModel(target);
    const scores = scoreModel.axes.map((axis) => axis.value).filter((value) => value !== null);
    const actions = Array.isArray(target.actionPlan) ? target.actionPlan.filter((row) => row.measure) : [];
    const openActions = actions.filter((row) => row.status !== "Completed" && row.status !== "Abandoned");
    return {
      answered: values.filter((value) => ANSWER_VALUES.includes(value)).length,
      calculableAxes: scoreModel.scoredAxes,
      unavailableAxes: DIMENSIONS.length - scoreModel.scoredAxes,
      highestAxisScore: scores.length ? Math.max(...scores) : null,
      insufficient: values.filter((value) => value === "NE").length,
      actions: actions.length,
      openActions: openActions.length,
      overdue: openActions.filter((row) => row.due && row.due < localDateValue(new Date())).length,
      decisionDocumented: Boolean(target.decision && target.decision.status),
      actionPlanNeedsReview: target.actionPlanNeedsReview === true
    };
  }

  function timelineAxisScore(dimension, target) {
    const score = axisScore(dimension, target);
    if (score.value === null) {
      return `<span class="timeline-axis-score is-unavailable" title="${escapeHtml(score.statusLabel)}">Uncalculated<small>${escapeHtml(score.statusLabel)}</small></span>`;
    }
    const sources = score.items.map((item) => `${item.question.id} : ${item.raw}`).join(" · ");
    return `<span class="timeline-axis-score" title="${escapeHtml(`Mean of ${sources}`)}"><b>${formatAxisScore(score.value)}</b><small>/ 4</small></span>`;
  }

  function renderLongitudinal() {
    if (!elements.longitudinalSection || !elements.longitudinalTimeline) return;
    const passages = [...state.timeline, snapshotState(state)].filter(Boolean);
    const visible = isFollowup() || passages.length > 1;
    elements.longitudinalSection.hidden = !visible;
    if (!visible) return;
    const cards = passages.map((passage, index) => {
      const stats = passageStats(passage);
      const current = index === passages.length - 1;
      const change = passage.context && passage.context.changesSincePrevious;
      const quality = `${stats.decisionDocumented ? "Decision documented" : "Decision to document"}${stats.actionPlanNeedsReview ? " · plan to review" : ""}`;
      const scoreSummary = `${stats.calculableAxes}/9 axis score${stats.calculableAxes === 1 ? "" : "s"}${stats.highestAxisScore !== null ? ` · highest score ${formatAxisScore(stats.highestAxisScore)} / 4` : ""}`;
      return `<article class="timeline-card${current ? " is-current" : ""}"><div><span>${escapeHtml(phaseLabel(passage))}</span><b>${current ? "Current assessment" : "Saved assessment"}</b></div><strong>${escapeHtml(formatAssessmentDate(passage.context && passage.context.assessmentDate))}</strong><p>${stats.answered}/18 answers · ${scoreSummary}</p><small>${stats.openActions} open action${stats.openActions === 1 ? "" : "s"}${stats.overdue ? ` · ${stats.overdue} overdue` : ""} · ${quality}${change ? ` · ${escapeHtml(change)}` : ""}</small></article>`;
    }).join("");
    const previous = passages.length > 1 ? passages[passages.length - 2] : null;
    let comparison = '<p class="timeline-empty">This follow-up was opened without an imported earlier assessment: it is a current reference point, not a before/after comparison.</p>';
    if (previous) {
      const methodNote = previous.phase === "T0"
        ? "T0 describes assumptions and this follow-up describes observed facts: they are read side by side, never causally."
        : "Both assessments use the same observed-facts grid: differences remain descriptive and must be related to changes in context.";
      const rows = DIMENSIONS.map((dimension, index) => `<tr><th scope="row"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(dimension.short)}</th><td>${timelineAxisScore(dimension, previous)}</td><td>${timelineAxisScore(dimension, state)}</td></tr>`).join("");
      comparison = `<p class="timeline-method">${escapeHtml(methodNote)}</p><div class="timeline-comparison-wrap"><table class="timeline-comparison"><thead><tr><th>Dimension</th><th>${escapeHtml(phaseLabel(previous))} · ${escapeHtml(formatAssessmentDate(previous.context.assessmentDate))}</th><th>${escapeHtml(phaseLabel(state))} · ${escapeHtml(formatAssessmentDate(state.context.assessmentDate))}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    elements.longitudinalTimeline.innerHTML = `<div class="timeline-cards">${cards}</div>${comparison}`;
  }

  function renderResults() {
    if (!state.reference) state.reference = makeReference();
    if (!state.actionPlanInitialised) {
      state.actionPlan = makeSuggestedActions();
      state.actionPlanInitialised = true;
      state.actionPlanCustomised = false;
      state.actionPlanNeedsReview = false;
    }
    const orientation = resultOrientation();
    updatePhaseUi(state.phase);
    elements.resultReference.textContent = state.reference;
    elements.resultDate.textContent = formatAssessmentDate(state.context.assessmentDate);
    elements.resultOrientation.innerHTML = `<strong>${escapeHtml(orientation.title)}</strong><p>${escapeHtml(orientation.text)}</p>`;

    const contextRows = [
      ["Assessment", phaseLongLabel(state), ""],
      ["Project code", state.context.projectCode, ""],
      ["Sector", state.context.sector, ""],
      ["Organisation size", state.context.size, ""],
      ["Stage", state.context.stage, ""],
      ["Population", state.context.population, ""],
      ["Date", formatAssessmentDate(state.context.assessmentDate), ""],
      ["How mandatory", state.context.nature, ""],
      ["Intended functions", state.context.uses.join(" · "), "is-wide"],
      ["Task or process", state.context.task, "is-wide"]
    ];
    if (isFollowup()) contextRows.push(
      ["System / version", state.context.systemVersion, ""],
      ["Observed period", `${formatAssessmentDate(state.context.periodStart)} — ${formatAssessmentDate(state.context.periodEnd)}`, ""],
      ["Assessment participants", state.context.participants, "is-wide"],
      ["Changes since the previous assessment", state.context.changesSincePrevious || "No change provided", "is-wide"]
    );
    elements.resultContext.innerHTML = contextRows.map(([label, value, className]) => `<div class="context-result-item ${className}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "Not provided")}</strong></div>`).join("");

    renderRadar(state);

    elements.dimensionResults.innerHTML = DIMENSIONS.map((dimension, index) => {
      const summary = dimensionSummary(dimension);
      const score = summary.value === null
        ? `<span class="axis-score-value is-unavailable">Uncalculated<small>${escapeHtml(summary.statusLabel)}</small></span>`
        : `<span class="axis-score-value"><b>${formatAxisScore(summary.value)}</b><small>/ 4</small></span>`;
      return `<div class="dimension-result-row"><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(dimension.label)}</strong><div class="dimension-result-summary">${score}</div><div class="dimension-response-pair">${dimension.questions.map((question) => responseChip(state.answers[question.id], question.id)).join("")}</div></div>`;
    }).join("");

    const insufficient = ALL_QUESTIONS.filter((question) => state.answers[question.id] === "NE");
    elements.unknownSignals.innerHTML = insufficient.length
      ? insufficient.map((question) => `<article class="signal-item"><b>${question.id} · NE</b><div><strong>${escapeHtml(question.dimension.label)}</strong><p>${escapeHtml(questionText(question, state))}</p></div></article>`).join("")
      : '<p class="empty-signal">No insufficient information was reported.</p>';

    const notApplicable = ALL_QUESTIONS.filter((question) => state.answers[question.id] === "NA");
    elements.notApplicableSignals.innerHTML = notApplicable.length
      ? notApplicable.map((question) => `<article class="signal-item"><b>${question.id} · NA</b><div><strong>${escapeHtml(question.dimension.label)}</strong><p>${escapeHtml(questionText(question, state))}</p></div></article>`).join("")
      : '<p class="empty-signal">No situation was reported as non-applicable.</p>';

    renderDecisionOptions();
    if (elements.createNextFollowup) {
      const nextSequence = state.phase === "T0" ? 1 : Math.max(2, Number(state.sequence || 1) + 1);
      elements.createNextFollowup.firstChild.textContent = `Create follow-up T${nextSequence} `;
      elements.createNextFollowup.setAttribute("aria-label", `Create follow-up assessment T${nextSequence} from this assessment`);
    }
    elements.decisionRationale.value = state.decision.rationale || "";
    elements.actionPlanAlert.hidden = !state.actionPlanNeedsReview;
    renderActionPlan();
    elements.fullResponseList.innerHTML = ALL_QUESTIONS.map((question) => `<article class="full-response-item"><span>${question.id}</span><p>${escapeHtml(questionText(question, state))}</p><strong>${escapeHtml(state.answers[question.id])} · ${escapeHtml(answerLabelsFor(state)[state.answers[question.id]])}</strong></article>`).join("");
    renderLongitudinal();
    persistState(true);
  }

  function renderActionPlan() {
    elements.actionPlanBody.innerHTML = state.actionPlan.map((row, index) => `<tr data-action-id="${escapeHtml(row.id)}"><td class="action-cell-measure" data-label="Measure"><textarea data-action-index="${index}" data-action-field="measure" aria-label="Measure to take, action ${index + 1}" maxlength="1000">${escapeHtml(row.measure)}</textarea></td><td class="action-cell-owner" data-label="Owner"><input data-action-index="${index}" data-action-field="owner" aria-label="Owner, action ${index + 1}" maxlength="200" value="${escapeHtml(row.owner)}"><span class="print-field-value">${escapeHtml(row.owner || "To assign")}</span></td><td class="action-cell-date" data-label="Due date"><input data-action-index="${index}" data-action-field="due" aria-label="Due date, action ${index + 1}" type="date" value="${escapeHtml(row.due)}"><span class="print-field-value">${escapeHtml(row.due ? formatAssessmentDate(row.due) : "To set")}</span></td><td class="action-cell-status" data-label="Status"><select data-action-index="${index}" data-action-field="status" aria-label="Status, action ${index + 1}">${Array.from(ACTION_STATUSES).map((status) => `<option ${row.status === status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select><span class="print-field-value">${escapeHtml(row.status || "Not started")}</span></td><td data-label="Evidence / review"><textarea data-action-index="${index}" data-action-field="evidence" aria-label="Evidence or review criterion, action ${index + 1}" maxlength="1000">${escapeHtml(row.evidence)}</textarea></td><td class="action-cell-remove" data-label="Action"><button type="button" data-remove-action="${index}" aria-label="Remove action ${index + 1}">Remove</button></td></tr>`).join("");
  }

  function updateAnswer(event) {
    const input = event.target.closest("input[type='radio'][name^='answer-']");
    if (!input) return;
    const id = input.name.replace("answer-", "");
    const previous = state.answers[id];
    state.answers[id] = input.value;
    if (previous !== input.value && state.actionPlanInitialised) {
      if (!state.actionPlanCustomised && actionPlanIsUntouched()) {
        state.actionPlan = [];
        state.actionPlanInitialised = false;
      } else {
        state.actionPlanNeedsReview = true;
      }
    }
    const card = input.closest(".question-card");
    if (card) {
      card.classList.remove("has-error");
      const answerSet = $(".answer-set", card);
      if (answerSet) answerSet.removeAttribute("aria-invalid");
    }
    elements.questionError.textContent = "";
    updateProgress();
    updateStageNavigation(state.view);
    persistState();
  }

  function openDimension(index) {
    state.currentDimension = Math.max(0, Math.min(DIMENSIONS.length - 1, Number(index) || 0));
    renderQuestionCards();
    showView("questions");
  }

  function goNextDimension() {
    if (!dimensionIsComplete(state.currentDimension)) {
      const dimension = DIMENSIONS[state.currentDimension];
      const missing = dimension.questions.find((question) => !ANSWER_VALUES.includes(state.answers[question.id]));
      const card = $(`[data-question='${missing.id}']`, elements.questionCards);
      if (card) {
        card.classList.add("has-error");
        const answerSet = $(".answer-set", card);
        if (answerSet) answerSet.setAttribute("aria-invalid", "true");
      }
      elements.questionError.textContent = "Answer both statements. If information is missing, choose “Insufficient information”.";
      const firstAnswer = card && $("input[type='radio']", card);
      if (firstAnswer) firstAnswer.focus();
      return;
    }
    state.notes[DIMENSIONS[state.currentDimension].id] = elements.dimensionNote.value.trim();
    persistState(true);
    if (state.currentDimension < DIMENSIONS.length - 1) openDimension(state.currentDimension + 1);
    else {
      renderReview();
      showView("review");
    }
  }

  function goPreviousDimension() {
    state.notes[DIMENSIONS[state.currentDimension].id] = elements.dimensionNote.value.trim();
    persistState(true);
    if (state.currentDimension === 0) showView("context");
    else openDimension(state.currentDimension - 1);
  }

  function openReview() {
    state.notes[DIMENSIONS[state.currentDimension].id] = elements.dimensionNote.value.trim();
    renderReview();
    showView("review");
  }

  function generateResultView() {
    if (countAnswered(state) !== ALL_QUESTIONS.length) {
      const index = firstIncompleteDimension();
      elements.reviewError.textContent = "Complete all 18 answers before producing the report.";
      elements.reviewError.focus();
      if (index >= 0) {
        const button = $(`[data-edit-dimension='${index}']`, elements.reviewList);
        if (button) button.focus();
      }
      return;
    }
    renderResults();
    showView("results");
  }

  function stageButtonClick(event) {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    const stage = button.closest("li").dataset.stage;
    if (stage === "context" && state.view === "intro") {
      if (savedDraft) openResetDialog("new");
      else resetEvaluation("context", selectedPhase);
      return;
    }
    if (stage !== "context" && state.view === "context") {
      if (!validateContext()) return;
      if (!state.reference) state.reference = makeReference();
      persistState(true);
    }
    if (stage === "context") showView("context");
    if (stage === "questions") openDimension(state.currentDimension);
    if (stage === "review") { renderReview(); showView("review"); }
    if (stage === "results") { renderResults(); showView("results"); }
  }

  function resetEvaluation(nextView, phase) {
    window.clearTimeout(saveTimer);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) { /* Local storage may be unavailable. */ }
    state = createState(PHASES.has(phase) ? phase : selectedPhase);
    selectedPhase = state.phase;
    savedDraft = null;
    elements.contextForm.reset();
    syncContextForm();
    $$("input[name='decision']", app).forEach((input) => { input.checked = false; });
    elements.decisionRationale.value = "";
    elements.actionPlanBody.innerHTML = "";
    elements.questionCards.innerHTML = "";
    elements.contextChangeWarning.hidden = true;
    elements.confirmContextChange.checked = false;
    elements.actionPlanAlert.hidden = true;
    renderDraftStatus(false);
    renderPhaseSelector();
    updatePhaseUi(state.phase);
    updateProgress();
    if (nextView === "context") {
      persistState(true);
      showView("context");
    } else {
      showView("intro", { save: false });
    }
  }

  function openResetDialog(mode) {
    resetMode = mode;
    const startsNew = mode === "new";
    const importsDraft = mode === "import";
    const createsFollowup = mode === "followup";
    const followupWarnings = createsFollowup && pendingFollowupState
      ? [
          pendingFollowupState.decision && pendingFollowupState.decision.status ? "" : "The decision for this assessment has not yet been documented.",
          pendingFollowupState.actionPlanNeedsReview ? "Its action plan still needs review." : ""
        ].filter(Boolean).join(" ")
      : "";
    elements.resetDialogTitle.textContent = createsFollowup ? "Create follow-up from this assessment?" : importsDraft ? "Import this draft?" : startsNew ? "Start a new assessment?" : "Delete this assessment?";
    elements.resetDialogText.textContent = createsFollowup
      ? `The draft on this device will be replaced by a new follow-up assessment. The current assessment will remain in the project timeline. ${followupWarnings}`.trim()
      : importsDraft
      ? "The draft saved on this device will be replaced by the selected file. Export it first if you want to keep it."
      : startsNew
        ? "The existing draft will be replaced. Export it first if you want to keep it."
        : "The context, all 18 answers, notes, decision and action plan will be deleted from this device.";
    elements.confirmReset.textContent = createsFollowup ? "Create follow-up" : importsDraft ? "Import and replace" : startsNew ? "Replace draft" : "Delete permanently";
    if (typeof elements.resetDialog.showModal === "function") elements.resetDialog.showModal();
    else if (window.confirm(elements.resetDialogText.textContent)) {
      if (importsDraft && pendingImportState) applyImportedState(pendingImportState);
      else if (mode === "followup" && pendingFollowupState) applyFollowupFromState(pendingFollowupState);
      else resetEvaluation(startsNew ? "context" : "intro", selectedPhase);
    }
  }

  function applyImportedState(importedState) {
    state = normaliseImportedState(importedState);
    selectedPhase = state.phase;
    savedDraft = state;
    pendingImportState = null;
    syncContextForm();
    persistState(true);
    restoreCurrentView();
  }

  function createFollowupState(previousState) {
    const previous = normaliseImportedState(previousState);
    if (countAnswered(previous) !== ALL_QUESTIONS.length || !contextIsComplete(previous.context, previous.phase)) {
      throw new Error("The previous assessment must contain valid context and all 18 answers before follow-up can be created.");
    }
    const nextPhase = previous.phase === "T0" ? "T1" : "TN";
    const next = createState(nextPhase);
    next.sequence = previous.phase === "T0" ? 1 : Math.max(2, Number(previous.sequence || 1) + 1);
    const today = localDateValue(new Date());
    next.context = {
      ...next.context,
      sector: previous.context.sector,
      size: previous.context.size,
      stage: previous.phase === "T0" ? "Pilot recently started" : "Deployment stabilised",
      population: previous.context.population,
      assessmentDate: today,
      nature: previous.context.nature,
      task: previous.context.task,
      uses: [...previous.context.uses],
      projectCode: previous.context.projectCode || makeProjectCode(),
      systemVersion: previous.context.systemVersion || "",
      periodStart: previous.context.assessmentDate || today,
      periodEnd: today,
      changesSincePrevious: "",
      participants: ""
    };
    const previousAssessments = Array.isArray(previous.timeline) ? previous.timeline.map(normaliseSnapshot).filter(Boolean) : [];
    const previousSnapshot = snapshotState(previous);
    next.timeline = [...previousAssessments, previousSnapshot]
      .filter((item, index, list) => item && list.findIndex((candidate) => candidate.reference && candidate.reference === item.reference) === index)
      .slice(-20);
    if (previous.actionPlan.length) {
      next.actionPlan = previous.actionPlan.map((row) => ({ ...row, id: makeId("action") }));
      next.actionPlanInitialised = true;
      next.actionPlanCustomised = true;
      next.actionPlanNeedsReview = true;
    }
    next.view = "context";
    return next;
  }

  function applyFollowupFromState(previousState) {
    state = createFollowupState(previousState);
    selectedPhase = state.phase;
    savedDraft = state;
    pendingFollowupState = null;
    syncContextForm();
    persistState(true);
    showView("context", { save: false });
  }

  function downloadFile(filename, type, content) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function exportedPayload(source) {
    const target = source || state;
    const scoreModel = radarModel(target);
    const exportedData = JSON.parse(JSON.stringify(target));
    exportedData.updatedAt = new Date().toISOString();
    return {
      schema: SCHEMA,
      version: VERSION,
      exportedAt: new Date().toISOString(),
      method: {
        language: "en-GB",
        instrument: isFollowup(target) ? "Short observed-facts follow-up grid" : "Short exploratory T0 grid",
        phase: phaseLabel(target),
        questions: 18,
        dimensions: 9,
        axisScores: true,
        axisScoreRange: [0, 4],
        axisScoreMethod: "mean_of_two_numeric_answers",
        numericAnswersRequiredPerAxis: 2,
        totalScore: false,
        missingValuesImputed: false
      },
      results: {
        axes: scoreModel.axes.map((axis, index) => ({
          index: index + 1,
          id: axis.dimension.id,
          label: axis.dimension.label,
          score: axis.value,
          status: axis.status,
          responses: Object.fromEntries(axis.items.map((item) => [item.question.id, item.raw || null]))
        }))
      },
      data: exportedData
    };
  }

  function buildReportHtmlV2() {
    const orientation = resultOrientation();
    const labels = answerLabelsFor(state);
    const model = radarModel(state);
    const followup = isFollowup();
    const contextRows = [
      ["Assessment", phaseLongLabel(state)], ["Local reference", state.reference], ["Project code", state.context.projectCode],
      ["Date", formatAssessmentDate(state.context.assessmentDate)], ["Sector", state.context.sector],
      ["Organisation size", state.context.size], ["Stage", state.context.stage], ["Population", state.context.population],
      ["How mandatory", state.context.nature], ["Intended functions", state.context.uses.join(" · ")],
      ["Task or process", state.context.task]
    ];
    if (followup) contextRows.push(
      ["System / version", state.context.systemVersion],
      ["Observed period", `${formatAssessmentDate(state.context.periodStart)} — ${formatAssessmentDate(state.context.periodEnd)}`],
      ["Assessment participants", state.context.participants],
      ["Changes since the previous assessment", state.context.changesSincePrevious || "No change provided"]
    );
    const responseRows = ALL_QUESTIONS.map((question) => `<tr><td>${escapeHtml(question.id)}</td><td>${escapeHtml(question.dimension.label)}</td><td>${escapeHtml(questionText(question, state))}</td><td>${escapeHtml(state.answers[question.id])} · ${escapeHtml(labels[state.answers[question.id]])}</td></tr>`).join("");
    const noteRows = DIMENSIONS.filter((dimension) => state.notes[dimension.id]).map((dimension) => `<li><strong>${escapeHtml(dimension.label)} :</strong> ${escapeHtml(state.notes[dimension.id])}</li>`).join("") || "<li>No note added.</li>";
    const actionRows = state.actionPlan.length
      ? state.actionPlan.map((row) => `<tr><td>${escapeHtml(row.measure || "To specify")}</td><td>${escapeHtml(row.owner || "To assign")}</td><td>${escapeHtml(row.due ? formatAssessmentDate(row.due) : "To set")}</td><td>${escapeHtml(row.status || "Not started")}</td><td>${escapeHtml(row.evidence || "To specify")}</td></tr>`).join("")
      : '<tr><td colspan="5">No action recorded.</td></tr>';
    const actionWarning = state.actionPlanNeedsReview ? '<p class="notice"><strong>Plan to review:</strong> this plan was carried over from an earlier assessment or prepared before the most recent answer change. It must not be considered validated.</p>' : "";
    const radarAxisKey = model.axes.map((axis, index) => {
      const score = axis.value === null ? `Uncalculated · ${axis.statusLabel}` : `${formatAxisScore(axis.value)} / 4`;
      return `<li><b>${String(index + 1).padStart(2, "0")}</b><span>${escapeHtml(axis.dimension.label)}</span><strong>${escapeHtml(score)}</strong></li>`;
    }).join("");
    const historyRows = [...state.timeline, snapshotState(state)].map((passage) => {
      const stats = passageStats(passage);
      const quality = `${stats.decisionDocumented ? "Decision documented" : "Decision to document"}${stats.actionPlanNeedsReview ? " · plan to review" : ""}`;
      return `<tr><td>${escapeHtml(phaseLabel(passage))}</td><td>${escapeHtml(formatAssessmentDate(passage.context.assessmentDate))}</td><td>${stats.answered}/18</td><td>${stats.calculableAxes}/9</td><td>${stats.unavailableAxes}</td><td>${stats.highestAxisScore === null ? "—" : `${formatAxisScore(stats.highestAxisScore)} / 4`}</td><td>${stats.actions}</td><td>${escapeHtml(quality)}</td></tr>`;
    }).join("");
    const generated = new Intl.DateTimeFormat("en-GB", { dateStyle: "long", timeStyle: "short" }).format(new Date());
    const reportTitle = followup ? `Follow-up report · ${phaseLabel(state)}` : "Pre-pilot assessment report";
    const methodCopy = followup
      ? "Answers describe the frequency of facts observed during a defined period. Each axis score is the mean of its two numeric answers."
      : "Answers describe assumptions before the pilot. Each axis score is the mean of its two numeric answers.";
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(reportTitle)} · ${escapeHtml(state.reference)}</title><style>
body{max-width:1120px;margin:0 auto;padding:48px 28px;color:#171a18;background:#f7f2e9;font:15px/1.55 Arial,sans-serif}h1,h2{font-family:Georgia,serif;font-weight:500}h1{font-size:46px;line-height:1.05}h2{margin-top:40px;padding-top:18px;border-top:2px solid #963723;font-size:27px}.meta{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #b9b4aa}.meta div{padding:13px;border-right:1px solid #ccc;border-bottom:1px solid #ccc}.meta span{display:block;color:#676b65;font-size:10px;text-transform:uppercase}.meta strong{display:block;margin-top:6px}.orientation,.notice{margin:26px 0;padding:19px;background:#eee6da}.orientation{border-left:4px solid #963723}.radar-layout{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.8fr);gap:30px;align-items:center}.radar{display:block;width:100%;max-width:620px;height:auto}.radar-ring,.radar-spoke{fill:none;stroke:#c9c2b7;stroke-width:1}.radar-ring-4{stroke:#8c8b84}.radar-axis-number,.radar-scale-label{fill:#63665f;font:12px monospace}.radar-axis-score-shape{fill:rgba(150,55,35,.14);stroke:#963723;stroke-width:2.5}.radar-axis-score-line{fill:none;stroke:#963723;stroke-width:3}.radar-axis-score-point{fill:#fffdf8;stroke:#963723;stroke-width:2.5}.radar-status circle{fill:#f7f2e9;stroke:#963723}.radar-status text{fill:#171a18;font:bold 12px monospace}.radar-empty{fill:#676b65;font:13px Arial}.legend{margin:12px 0 18px;padding:10px 0 10px 36px;position:relative;color:#676b65}.legend:before{content:"";position:absolute;left:0;top:20px;width:25px;border-top:3px solid #963723}.axis-key{display:grid;grid-template-columns:1fr;gap:7px;padding:0;list-style:none;font-size:11px}.axis-key li{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:8px;padding-bottom:6px;border-bottom:1px solid #d4cec4}.axis-key b{color:#963723;font-family:monospace}.axis-key strong{font-size:10px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:9px;border:1px solid #bbb;text-align:left;vertical-align:top}th{background:#eee6da}footer{margin-top:46px;padding-top:17px;border-top:1px solid #aaa;color:#676b65;font-size:11px}@media(max-width:720px){body{padding:24px 16px}h1{font-size:34px}.meta,.radar-layout{grid-template-columns:1fr}table{display:block;overflow:auto}}@media print{body{background:#fff;padding:0}.radar-layout,h2,table{break-inside:avoid}}
    </style></head><body><p>AI &amp; Occupational Health · ${escapeHtml(phaseLongLabel(state))}</p><h1>${escapeHtml(reportTitle)}</h1><p>Generated on ${escapeHtml(generated)}. ${escapeHtml(methodCopy)} The nine scores remain separate; NE, NA and missing answers are never converted to numbers.</p><div class="orientation"><strong>${escapeHtml(orientation.title)}</strong><p>${escapeHtml(orientation.text)}</p></div><div class="meta">${contextRows.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "Not provided")}</strong></div>`).join("")}</div><h2>Summary scores for the nine axes</h2><div class="radar-layout"><svg class="radar" viewBox="0 0 680 620" role="img" aria-label="Radar chart of the nine axis scores out of four">${buildRadarSvgContent(state)}</svg><div><p><strong>${escapeHtml(radarCoverageText(model))}</strong></p><div class="legend">Axis summary score</div><p>Farther from the centre indicates a more marked axis. Each point is the mean of the axis’s two numeric answers; it is neither a diagnosis nor a decision.</p><ol class="axis-key">${radarAxisKey}</ol></div></div><h2>Decision documented by the group</h2><p><strong>Direction:</strong> ${escapeHtml(state.decision.status || "Not provided")}</p><p><strong>Reasons and reservations:</strong> ${escapeHtml(state.decision.rationale || "Not provided")}</p><h2>Action plan</h2>${actionWarning}<table><thead><tr><th>Measure</th><th>Owner</th><th>Due date</th><th>Status</th><th>Evidence or review criterion</th></tr></thead><tbody>${actionRows}</tbody></table>${followup || state.timeline.length ? `<h2>Project timeline</h2><table><thead><tr><th>Assessment</th><th>Date</th><th>Answers</th><th>Calculated axes</th><th>Uncalculated axes</th><th>Highest score</th><th>Actions</th><th>Assessment status</th></tr></thead><tbody>${historyRows}</tbody></table><p class="notice">${state.timeline.length && state.timeline[state.timeline.length - 1].phase === "T0" ? "T0 describes assumptions and T1 observed facts: this side-by-side presentation does not demonstrate a causal effect." : "Changes remain descriptive and must be interpreted using changes in context and real work."}</p>` : ""}<h2>Details of all 18 answers</h2><table><thead><tr><th>Code</th><th>Dimension</th><th>Statement</th><th>Answer</th></tr></thead><tbody>${responseRows}</tbody></table><h2>Observations by dimension</h2><ul>${noteRows}</ul><div class="notice"><strong>Limitations.</strong> This exploratory grid is neither a diagnosis, proof of compliance nor a complete regulatory risk assessment. It must be completed collectively and compared with observation of real work.</div><footer>Version ${VERSION} · Nine axis scores · no total score · no imputation.</footer></body></html>`;
  }

  function preparePrintFields() {
    $$('textarea', elements.views.find((section) => section.dataset.view === 'results')).forEach((field) => {
      if (!field.hasAttribute("data-screen-height")) field.dataset.screenHeight = field.style.height || "";
      field.style.height = `${Math.max(field.scrollHeight + 4, 44)}px`;
    });
  }

  function restorePrintFields() {
    $$('textarea[data-screen-height]', elements.views.find((section) => section.dataset.view === 'results')).forEach((field) => {
      field.style.height = field.dataset.screenHeight;
      delete field.dataset.screenHeight;
    });
  }

  function handleImport(file, mode) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      window.alert("This file is too large to be a draft for this assessment.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const importedState = normaliseImportedState(parsed.data || parsed.state || parsed);
        if (mode === "followup") {
          if (countAnswered(importedState) !== ALL_QUESTIONS.length || !contextIsComplete(importedState.context, importedState.phase)) {
            throw new Error("The previous file must contain valid context and all 18 answers.");
          }
          if (savedDraft) {
            pendingFollowupState = importedState;
            openResetDialog("followup");
          } else {
            applyFollowupFromState(importedState);
          }
        } else if (savedDraft) {
          pendingImportState = importedState;
          openResetDialog("import");
        } else {
          applyImportedState(importedState);
        }
      } catch (error) {
        window.alert(error.message || "The draft could not be imported.");
      } finally {
        if (elements.importInput) elements.importInput.value = "";
        if (elements.followupImportInput) elements.followupImportInput.value = "";
      }
    };
    reader.onerror = () => window.alert("The file could not be read.");
    reader.readAsText(file);
  }

  function restoreCurrentView() {
    syncContextForm();
    const view = state.view;
    if (view === "context") updateContextChangeWarning();
    if (view === "questions") renderQuestionCards();
    if (view === "review") renderReview();
    if (view === "results") renderResults();
    showView(view, { save: false });
  }

  elements.start.addEventListener("click", () => {
    if (savedDraft) openResetDialog("new");
    else resetEvaluation("context", selectedPhase);
  });
  elements.resume.addEventListener("click", () => {
    if (!savedDraft) return;
    state = normaliseImportedState(savedDraft);
    selectedPhase = state.phase;
    restoreCurrentView();
  });
  elements.importButton.addEventListener("click", () => elements.importInput.click());
  elements.importInput.addEventListener("change", () => handleImport(elements.importInput.files[0], "draft"));
  if (elements.followupImportButton && elements.followupImportInput) {
    elements.followupImportButton.addEventListener("click", () => elements.followupImportInput.click());
    elements.followupImportInput.addEventListener("change", () => handleImport(elements.followupImportInput.files[0], "followup"));
  }
  elements.contextBack.addEventListener("click", () => showView("intro", { save: false }));
  elements.contextForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateContext()) return;
    if (!state.reference) state.reference = makeReference();
    persistState(true);
    openDimension(state.currentDimension);
  });
  const handleContextMutation = () => {
    collectContext();
    if (state.context.uses.length) {
      elements.usageField.classList.remove("has-error");
      elements.usageField.removeAttribute("aria-invalid");
    }
    updateContextChangeWarning();
    updateStageNavigation("context");
    persistState();
  };
  elements.contextForm.addEventListener("input", handleContextMutation);
  elements.contextForm.addEventListener("change", handleContextMutation);
  elements.questionCards.addEventListener("change", updateAnswer);
  elements.dimensionNote.addEventListener("input", () => {
    state.notes[DIMENSIONS[state.currentDimension].id] = elements.dimensionNote.value;
    persistState();
  });
  elements.previousDimension.addEventListener("click", goPreviousDimension);
  elements.nextDimension.addEventListener("click", goNextDimension);
  elements.openReviewEarly.addEventListener("click", openReview);
  elements.dimensionRailList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-dimension]");
    if (button) openDimension(button.dataset.dimension);
  });
  elements.reviewList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-dimension]");
    if (button) openDimension(button.dataset.editDimension);
  });
  elements.reviewBack.addEventListener("click", () => openDimension(state.currentDimension));
  elements.generateResults.addEventListener("click", generateResultView);
  $(".assessment-stages", app).addEventListener("click", stageButtonClick);
  app.addEventListener("change", (event) => {
    if (event.target.matches("input[name='assessmentPhase']")) {
      selectedPhase = PHASES.has(event.target.value) ? event.target.value : "T0";
      renderPhaseSelector();
      return;
    }
    if (event.target.matches("input[name='decision']")) {
      state.decision.status = event.target.value;
      persistState();
    }
  });
  elements.decisionRationale.addEventListener("input", () => {
    state.decision.rationale = elements.decisionRationale.value;
    persistState();
  });
  elements.acknowledgeActionPlan.addEventListener("click", () => {
    state.actionPlanNeedsReview = false;
    elements.actionPlanAlert.hidden = true;
    persistState(true);
    const nextFocus = $("textarea", elements.actionPlanBody) || elements.addActionRow;
    nextFocus.focus();
  });
  elements.actionPlanBody.addEventListener("input", (event) => {
    const field = event.target.dataset.actionField;
    const index = Number(event.target.dataset.actionIndex);
    if (!field || !state.actionPlan[index]) return;
    state.actionPlan[index][field] = event.target.value;
    const printValue = $(".print-field-value", event.target.parentElement);
    if (printValue) printValue.textContent = field === "due"
      ? (event.target.value ? formatAssessmentDate(event.target.value) : "To set")
      : (event.target.value || "To assign");
    state.actionPlanCustomised = true;
    persistState();
  });
  elements.actionPlanBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-action]");
    if (!button) return;
    const index = Number(button.dataset.removeAction);
    if (!state.actionPlan[index]) return;
    state.actionPlan.splice(index, 1);
    state.actionPlanInitialised = true;
    state.actionPlanCustomised = true;
    renderActionPlan();
    persistState(true);
    elements.addActionRow.focus();
  });
  elements.addActionRow.addEventListener("click", () => {
    state.actionPlan.push({ id: makeId("action"), measure: "", owner: "", due: "", status: "Not started", evidence: "" });
    state.actionPlanInitialised = true;
    state.actionPlanCustomised = true;
    renderActionPlan();
    persistState(true);
    const row = elements.actionPlanBody.lastElementChild;
    if (row) $("textarea", row).focus();
  });
  elements.downloadHtml.addEventListener("click", () => downloadFile(`report-${state.reference || `evaluation-${phaseLabel(state).toLowerCase()}`}.html`, "text/html;charset=utf-8", buildReportHtmlV2()));
  const exportJsonDraft = () => {
    const source = state.view === "intro" && savedDraft ? savedDraft : state;
    downloadFile(`assessment-file-${source.reference || `evaluation-${phaseLabel(source).toLowerCase()}`}.json`, "application/json;charset=utf-8", JSON.stringify(exportedPayload(source), null, 2));
  };
  elements.downloadJson.addEventListener("click", exportJsonDraft);
  elements.exportDraft.addEventListener("click", exportJsonDraft);
  elements.printResults.addEventListener("click", () => {
    preparePrintFields();
    window.print();
  });
  if (elements.createNextFollowup) elements.createNextFollowup.addEventListener("click", () => {
    pendingFollowupState = normaliseImportedState(state);
    openResetDialog("followup");
  });
  window.addEventListener("beforeprint", preparePrintFields);
  window.addEventListener("afterprint", restorePrintFields);
  elements.editAnswers.addEventListener("click", () => openDimension(state.currentDimension));
  [elements.restart, elements.clearDraft].forEach((button) => button.addEventListener("click", () => openResetDialog("clear")));
  elements.confirmReset.addEventListener("click", () => {
    if (resetMode === "import" && pendingImportState) applyImportedState(pendingImportState);
    else if (resetMode === "followup" && pendingFollowupState) applyFollowupFromState(pendingFollowupState);
    else resetEvaluation(resetMode === "new" ? "context" : "intro", selectedPhase);
  });
  elements.resetDialog.addEventListener("close", () => {
    if (resetMode === "import" && elements.resetDialog.returnValue !== "confirm") pendingImportState = null;
    if (resetMode === "followup" && elements.resetDialog.returnValue !== "confirm") pendingFollowupState = null;
  });

  $$('[data-phase-link]').forEach((link) => link.addEventListener("click", () => {
    selectedPhase = PHASES.has(link.dataset.phaseLink) ? link.dataset.phaseLink : "T1";
    renderPhaseSelector();
  }));

  renderDimensionRail();
  renderDraftStatus(Boolean(savedDraft));
  renderPhaseSelector();
  updatePhaseUi(state.phase);
  syncContextForm();
  updateStageNavigation("intro");
  updateWorkspaceStatus("intro");
})();
