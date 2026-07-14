(() => {
  "use strict";

  const cfg = window.AI_OH_ASSESSMENT_CONFIG;
  if (!cfg) {
    console.error("Assessment configuration is missing.");
    return;
  }

  const state = { context: null, answers: {}, currentIndex: 0, result: null };
  const qs = selector => document.querySelector(selector);
  const qsa = selector => [...document.querySelectorAll(selector)];
  const byId = id => document.getElementById(id);

  const els = {
    heroStart: byId("heroStart"),
    introStep: byId("introStep"),
    contextStep: byId("contextStep"),
    questionStep: byId("questionStep"),
    resultsStep: byId("resultsStep"),
    beginContext: byId("beginContext"),
    backIntro: byId("backIntro"),
    contextForm: byId("contextStep"),
    contextError: byId("contextError"),
    progressLabel: byId("progressLabel"),
    adaptiveLabel: byId("adaptiveLabel"),
    progressBar: byId("progressBar"),
    questionShell: byId("questionShell"),
    prevQuestion: byId("prevQuestion"),
    nextQuestion: byId("nextQuestion"),
    resultSummary: byId("resultSummary"),
    scoreOrbit: byId("scoreOrbit"),
    overallScore: byId("overallScore"),
    overallLevel: byId("overallLevel"),
    criticalAlerts: byId("criticalAlerts"),
    uncertaintySummary: byId("uncertaintySummary"),
    radarWrap: byId("radarWrap"),
    dimensionTable: byId("dimensionTable"),
    toggleChartTable: byId("toggleChartTable"),
    topPriorities: byId("topPriorities"),
    generatedReport: byId("generatedReport"),
    downloadHtml: byId("downloadHtml"),
    downloadJson: byId("downloadJson"),
    printReport: byId("printReport"),
    archivePdf: byId("archivePdf"),
    restartAssessment: byId("restartAssessment"),
    historyList: byId("historyList"),
    generateCode: byId("generateCode")
  };

  const reportCss = `
  :root{--ink:#17140f;--muted:#625e56;--line:#ddd5c8;--paper:#fffdf9;--warm:#f5ede0;--green:#3d5b52;--orange:#c05f2b}
  *{box-sizing:border-box}body{margin:0;background:#f0ece5;color:var(--ink);font:15px/1.55 Arial,sans-serif}.report{width:min(920px,calc(100% - 30px));margin:24px auto;padding:42px;background:var(--paper);border:1px solid var(--line);border-radius:20px}.brand{display:flex;gap:9px;align-items:center;margin-bottom:25px;color:var(--green);font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.mark{width:17px;height:17px;border-radius:50%;background:var(--orange)}h1,h2,h3{font-family:Georgia,serif;font-weight:500}.cover{padding-bottom:22px;border-bottom:1px solid var(--line)}.eyebrow{margin:0;color:var(--orange);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}.cover h1{margin:7px 0 10px;font-size:44px;line-height:1.04}.subtitle{max-width:760px;color:var(--muted)}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:20px}.meta div,.score-row,.action,.context div{padding:11px 12px;border:1px solid var(--line);border-radius:11px;background:#fff}.meta strong,.context strong{display:block;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.08em}.section{margin-top:28px}.section h2{margin:0 0 14px;font-size:28px}.summary{display:grid;grid-template-columns:190px 1fr;gap:12px}.score{display:flex;flex-direction:column;justify-content:space-between;min-height:150px;padding:18px;border-radius:16px;background:var(--ink);color:#fff}.score strong{font-size:52px;line-height:1}.decision{padding:18px;border:1px solid var(--line);border-radius:16px;background:#fff}.decision strong{font-size:17px}.critical{margin-top:12px;padding:13px 15px;border-left:4px solid #8f2530;background:#fff3f1}.context{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.scores{display:grid;gap:8px}.score-head{display:flex;justify-content:space-between;gap:12px}.bar{height:6px;margin-top:7px;border-radius:999px;background:#eee9e1;overflow:hidden}.bar i{display:block;height:100%}.actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.action h3{margin:0 0 8px;font-size:18px}.action li{margin-bottom:4px;color:var(--muted);font-size:12px}.limits{margin-top:28px;padding:15px;border-top:1px solid var(--line);background:#f8f5ef;color:var(--muted);font-size:11px}.history{margin-top:12px;color:var(--muted);font-size:12px}
  @media(max-width:720px){.report{padding:22px}.summary,.context,.actions,.meta{grid-template-columns:1fr}.cover h1{font-size:34px}}
  @media print{@page{size:A4;margin:12mm}body{background:#fff}.report{width:auto;margin:0;padding:0;border:0}.section,.score-row,.action,.context div{break-inside:avoid}}
  `;

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[char]));
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function createId() {
    return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  }

  function activateStep(step) {
    qsa(".step").forEach(el => el.classList.remove("active"));
    step.classList.add("active");
    const current = step.dataset.step || "intro";
    const card = qs(".assessment-card");
    if (card) {
      card.dataset.currentStep = current;
      qsa("[data-rail-step]").forEach(item => {
        const order = ["intro","context","questions","results"];
        item.classList.toggle("is-current", item.dataset.railStep === current);
        item.classList.toggle("is-done", order.indexOf(item.dataset.railStep) < order.indexOf(current));
      });
      window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 88, behavior: "smooth" });
    }
  }

  function selectedUses() {
    return qsa('input[name="useType"]:checked').map(el => el.value);
  }

  function selectData(id) {
    const el = byId(id);
    return { value: el?.value || "", label: el?.selectedOptions?.[0]?.textContent?.trim() || "" };
  }

  function collectContext() {
    if (cfg.mode === "followup") {
      return {
        projectCode: byId("projectCode").value.trim().toUpperCase(),
        baselineDate: byId("baselineDate").value,
        followupDate: byId("followupDate").value,
        followupNumber: selectData("followupNumber"),
        sector: selectData("sector"),
        orgSize: selectData("orgSize"),
        population: selectData("population"),
        projectStage: selectData("projectStage"),
        systemChange: selectData("systemChange"),
        useTypes: selectedUses()
      };
    }
    return {
      sector: selectData("sector"),
      orgSize: selectData("orgSize"),
      projectStage: selectData("projectStage"),
      population: selectData("population"),
      assessmentDate: byId("assessmentDate").value,
      useTypes: selectedUses()
    };
  }

  function validateContext(context) {
    const future = new Date().toISOString().slice(0,10);
    if (cfg.mode === "followup") {
      if (!/^[A-Z0-9-]{4,16}$/.test(context.projectCode)) return "Enter an anonymous project code using 4–16 letters, numbers or hyphens.";
      if (!context.baselineDate || !context.followupDate || !context.followupNumber.value || !context.sector.value || !context.orgSize.value || !context.population.value || !context.projectStage.value || !context.systemChange.value) return "Complete all dated follow-up and context fields.";
      if (context.baselineDate > context.followupDate) return "The baseline date cannot be later than the follow-up date.";
      if (context.followupDate > future) return "The follow-up date cannot be in the future.";
    } else {
      if (!context.sector.value || !context.orgSize.value || !context.projectStage.value || !context.population.value || !context.assessmentDate) return "Complete all context fields and the assessment date.";
      if (context.assessmentDate > future) return "The assessment date cannot be in the future.";
    }
    if (!context.useTypes.length) return "Select at least one AI use.";
    return "";
  }

  function renderQuestion() {
    const question = cfg.questions[state.currentIndex];
    const options = [...cfg.scales[question.scale]];
    if (cfg.allowNotAssessed) options.push({ label:"Not assessed / insufficient evidence", score:null, na:true });
    const saved = state.answers[question.id];
    const dim = cfg.dimensions[question.dimension];
    const progress = ((state.currentIndex + 1) / cfg.questions.length) * 100;

    els.progressLabel.textContent = `Question ${state.currentIndex + 1} of ${cfg.questions.length}`;
    els.adaptiveLabel.textContent = `${cfg.questions.length} questions · ${Object.keys(cfg.dimensions).length} dimensions`;
    els.progressBar.style.width = `${progress}%`;

    els.questionShell.innerHTML = `
      <div class="question-meta"><span>${escapeHtml(question.category)}</span><span>${escapeHtml(dim.label)}</span></div>
      <h3 class="question-title" id="questionTitle">${escapeHtml(question.title)}</h3>
      <p class="question-help">${escapeHtml(question.help)}</p>
      <fieldset class="answer-list" aria-labelledby="questionTitle">
        <legend class="visually-hidden">Choose an answer</legend>
        ${options.map((option,index) => `
          <label class="answer-option">
            <input type="radio" name="answer" value="${option.na ? "na" : option.score}" data-index="${index}" ${saved && saved.index === index ? "checked" : ""}>
            <span>${escapeHtml(option.label)}</span>
          </label>`).join("")}
      </fieldset>`;

    els.prevQuestion.disabled = state.currentIndex === 0;
    els.nextQuestion.disabled = !saved;
    els.nextQuestion.textContent = state.currentIndex === cfg.questions.length - 1 ? "View results" : "Next";

    qsa('input[name="answer"]').forEach(input => input.addEventListener("change", () => {
      const index = Number(input.dataset.index);
      const option = options[index];
      state.answers[question.id] = { score: option.na ? null : Number(option.score), label: option.label, index };
      els.nextQuestion.disabled = false;
    }));
  }

  function getLevel(score) {
    return cfg.levels.find(level => score <= level.max) || cfg.levels[cfg.levels.length - 1];
  }

  function computeResult() {
    const sums = {};
    Object.keys(cfg.dimensions).forEach(key => sums[key] = { value:0, count:0 });
    const criticalFlags = [];
    let notAssessed = 0;

    cfg.questions.forEach(question => {
      const answer = state.answers[question.id];
      if (!answer || answer.score == null) {
        if (answer?.score == null) notAssessed += 1;
        return;
      }
      sums[question.dimension].value += answer.score;
      sums[question.dimension].count += 1;
      if (question.criticalAt != null && answer.score >= question.criticalAt) criticalFlags.push(question.criticalMessage);
    });

    const a = state.answers;
    if ((a.Q14?.score ?? 0) >= 4 && ["hr","health","management","monitoring"].some(use => state.context.useTypes.includes(use))) {
      criticalFlags.push("No effective human review for a use that may influence an important decision.");
    }
    if ((a.Q15?.score ?? 0) >= 3 && (a.Q16?.score ?? 0) >= 3) {
      criticalFlags.push("Substantial checking workload combined with sustained cognitive vigilance.");
    }
    if ((a.Q17?.score ?? 0) >= 3 && (a.Q18?.score ?? 0) >= 4) {
      criticalFlags.push("High risk of skill erosion and operational dependency.");
    }

    const dimensionScores = {};
    Object.entries(sums).forEach(([key,sum]) => {
      dimensionScores[key] = sum.count ? Math.round((sum.value / (sum.count * 4)) * 100) : 0;
    });
    const values = Object.values(dimensionScores);
    const overall = Math.round(values.reduce((sum,value) => sum + value, 0) / values.length);
    const baseLevel = getLevel(overall);
    let level = baseLevel;
    if (criticalFlags.length >= 3) level = cfg.levels[4];
    else if (criticalFlags.length && cfg.levels.indexOf(baseLevel) < 3) level = cfg.levels[3];

    const date = cfg.mode === "followup" ? state.context.followupDate : state.context.assessmentDate;
    return {
      id:createId(),
      completedAt:new Date().toISOString(),
      assessmentDate:date,
      context:state.context,
      answers:state.answers,
      overall,
      dimensions:dimensionScores,
      criticalFlags:unique(criticalFlags),
      notAssessed,
      level
    };
  }

  function radarSvg(scores) {
    const keys = Object.keys(cfg.dimensions);
    const size = 560, cx = 280, cy = 270, radius = 180, labelRadius = 228;
    const point = (angle,r) => [cx + Math.cos(angle)*r, cy + Math.sin(angle)*r];
    const polygon = r => keys.map((_,i) => point(-Math.PI/2 + i*Math.PI*2/keys.length,r).join(",")).join(" ");
    const grid = [.2,.4,.6,.8,1].map(frac => `<polygon class="radar-grid" points="${polygon(radius*frac)}"></polygon>`).join("");
    const axes = keys.map((_,i) => {
      const [x,y] = point(-Math.PI/2 + i*Math.PI*2/keys.length,radius);
      return `<line class="radar-axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"></line>`;
    }).join("");
    const area = keys.map((key,i) => point(-Math.PI/2 + i*Math.PI*2/keys.length,radius*(scores[key]/100)).join(",")).join(" ");
    const dots = keys.map((key,i) => {
      const [x,y] = point(-Math.PI/2 + i*Math.PI*2/keys.length,radius*(scores[key]/100));
      return `<circle class="radar-point" cx="${x}" cy="${y}" r="4"><title>${escapeHtml(cfg.dimensions[key].label)}: ${scores[key]}/100</title></circle>`;
    }).join("");
    const labels = keys.map((key,i) => {
      const angle = -Math.PI/2 + i*Math.PI*2/keys.length;
      const [x,y] = point(angle,labelRadius);
      const anchor = Math.cos(angle) > .25 ? "start" : Math.cos(angle) < -.25 ? "end" : "middle";
      const lines = cfg.dimensions[key].short;
      return `<text class="radar-label" x="${x}" y="${y - ((lines.length-1)*7)}" text-anchor="${anchor}">${lines.map((line,index) => `<tspan x="${x}" dy="${index ? 14 : 0}">${escapeHtml(line)}</tspan>`).join("")}<tspan x="${x}" dy="14" opacity=".58">${scores[key]}/100</tspan></text>`;
    }).join("");
    return `<svg viewBox="0 0 ${size} 540" role="img" aria-labelledby="radarTitle radarDesc"><title id="radarTitle">Risk profile by dimension</title><desc id="radarDesc">A larger surface indicates a higher estimated level of risk.</desc>${grid}${axes}<polygon class="radar-area" points="${area}"></polygon>${dots}${labels}</svg>`;
  }

  function dimensionTable(scores) {
    return Object.entries(scores).map(([key,score]) => `
      <div class="dimension-row"><span>${escapeHtml(cfg.dimensions[key].label)}</span><span class="bar"><i style="width:${score}%;background:${getLevel(score).color}"></i></span><strong>${score}</strong></div>
    `).join("");
  }

  function formatDate(value) {
    if (!value) return "Not provided";
    return new Intl.DateTimeFormat("en-GB",{dateStyle:"long"}).format(new Date(`${value}T12:00:00`));
  }

  function contextItems(context) {
    const uses = context.useTypes.map(value => cfg.useLabels[value] || value).join(", ");
    if (cfg.mode === "followup") {
      return [
        ["Anonymous project code",context.projectCode],["Baseline date",formatDate(context.baselineDate)],["Follow-up date",formatDate(context.followupDate)],
        ["Follow-up number",context.followupNumber.label],["Sector",context.sector.label],["Organisation size",context.orgSize.label],
        ["Population",context.population.label],["Deployment status",context.projectStage.label],["Change since last review",context.systemChange.label],["AI uses",uses]
      ];
    }
    return [
      ["Sector",context.sector.label],["Organisation size",context.orgSize.label],["Project stage",context.projectStage.label],
      ["Population affected",context.population.label],["Assessment date",formatDate(context.assessmentDate)],["AI uses",uses]
    ];
  }

  function buildReport(result) {
    const sorted = Object.entries(result.dimensions).sort((a,b) => b[1]-a[1]);
    const topKeys = sorted.slice(0,4).map(([key]) => key);
    const decisionTitle = result.criticalFlags.length ? "Do not proceed without corrective action" :
      result.overall >= 65 ? "Redesign before extending deployment" : "Proceed only with documented safeguards";
    const context = contextItems(result.context);
    const dateText = formatDate(result.assessmentDate);

    return `
      <article class="report">
        <header class="cover">
          <div class="brand"><span class="mark"></span><span>AI &amp; Occupational Health</span><span style="margin-left:auto">${escapeHtml(cfg.reportType)}</span></div>
          <p class="eyebrow">Exploratory decision-support report</p>
          <h1>${escapeHtml(cfg.reportTitle)}</h1>
          <p class="subtitle">${escapeHtml(cfg.reportIntro)}</p>
          <div class="meta"><div><strong>Reference</strong>${escapeHtml(result.id.slice(0,8).toUpperCase())}</div><div><strong>Assessment date</strong>${dateText}</div><div><strong>Generated</strong>${new Intl.DateTimeFormat("en-GB",{dateStyle:"long",timeStyle:"short"}).format(new Date(result.completedAt))}</div></div>
        </header>

        <section class="section">
          <h2>Decision summary</h2>
          <div class="summary">
            <div class="score" style="border-top:5px solid ${escapeHtml(result.level.color)}"><span>Overall score</span><strong>${result.overall}<small style="font-size:13px">/100</small></strong><b>${escapeHtml(result.level.label)}</b></div>
            <div class="decision"><strong>${decisionTitle}</strong><p>${escapeHtml(result.level.summary)}</p>${result.notAssessed ? `<p><strong>${result.notAssessed}</strong> question(s) were not assessed; interpret the profile with additional caution.</p>` : ""}</div>
          </div>
          ${result.criticalFlags.length ? `<div class="critical"><strong>Critical signals</strong><ul>${result.criticalFlags.map(flag => `<li>${escapeHtml(flag)}</li>`).join("")}</ul></div>` : ""}
        </section>

        <section class="section">
          <h2>Declared context</h2>
          <div class="context">${context.map(([label,value]) => `<div><strong>${escapeHtml(label)}</strong>${escapeHtml(value)}</div>`).join("")}</div>
        </section>

        <section class="section">
          <h2>Nine-dimension profile</h2>
          <div class="scores">${Object.entries(result.dimensions).map(([key,score]) => `<div class="score-row"><div class="score-head"><strong>${escapeHtml(cfg.dimensions[key].label)}</strong><span>${score}/100</span></div><div class="bar"><i style="width:${score}%;background:${getLevel(score).color}"></i></div></div>`).join("")}</div>
        </section>

        <section class="section">
          <h2>Priority prevention actions</h2>
          <div class="actions">
            <div class="action"><h3>Before proceeding</h3><ul>${topKeys.map(key => `<li>${escapeHtml(cfg.actions[key].immediate)}</li>`).join("")}</ul></div>
            <div class="action"><h3>During the pilot or correction phase</h3><ul>${topKeys.map(key => `<li>${escapeHtml(cfg.actions[key].pilot)}</li>`).join("")}</ul></div>
            <div class="action"><h3>During follow-up</h3><ul>${topKeys.map(key => `<li>${escapeHtml(cfg.actions[key].follow)}</li>`).join("")}</ul></div>
          </div>
        </section>

        <section class="section">
          <h2>Minimum collective-prevention conditions</h2>
          <ul>
            <li>Document the purpose, owner, affected populations, data, prohibited uses and human appeal route.</li>
            <li>Retain pilot results, observed errors, corrective decisions and stop criteria.</li>
            <li>Provide competent human oversight, incident reporting and a fallback arrangement.</li>
            <li>Update the assessment when the system, provider, data or organisation changes.</li>
            <li>Review applicable legal, medical, ergonomic, security and data-protection requirements separately.</li>
          </ul>
        </section>

        ${cfg.mode === "followup" ? `<p class="history">Use the same anonymous project code for future reviews to compare reports without identifying the organisation.</p>` : ""}
        <footer class="limits"><strong>Status and limitations.</strong> ${escapeHtml(cfg.methodLimit)}</footer>
      </article>`;
  }

  function standaloneHtml(report) {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(cfg.reportTitle)}</title><style>${reportCss}</style></head><body>${report}</body></html>`;
  }

  function renderPriorities(scores) {
    const top = Object.entries(scores).sort((a,b) => b[1]-a[1]).slice(0,4);
    els.topPriorities.innerHTML = top.map(([key,score]) => `
      <div class="priority-item"><div class="row"><strong>${escapeHtml(cfg.dimensions[key].label)}</strong><b>${score}</b></div><p>${escapeHtml(cfg.dimensions[key].description)}</p><div class="priority-meter"><i style="width:${score}%;background:${getLevel(score).color}"></i></div></div>
    `).join("");
  }

  function saveResult(result) {
    try {
      const records = JSON.parse(localStorage.getItem(cfg.storageKey) || "[]");
      records.push({ id:result.id, date:result.assessmentDate, overall:result.overall, level:result.level.label, projectCode:result.context.projectCode || "" });
      localStorage.setItem(cfg.storageKey, JSON.stringify(records.slice(-50)));
    } catch (error) {
      console.warn("Local history is unavailable.", error);
    }
  }

  function renderHistory() {
    if (!els.historyList || cfg.mode !== "followup") return;
    try {
      const code = state.context?.projectCode || "";
      const records = JSON.parse(localStorage.getItem(cfg.storageKey) || "[]").filter(item => item.projectCode === code).reverse();
      els.historyList.innerHTML = records.length
        ? records.map(item => `<div class="history-item"><strong>${escapeHtml(formatDate(item.date))}</strong><span>${item.overall}/100 · ${escapeHtml(item.level)}</span></div>`).join("")
        : '<p class="microcopy">No previous follow-up is stored locally for this anonymous code.</p>';
    } catch {
      els.historyList.innerHTML = '<p class="microcopy">Local history is unavailable in this browser.</p>';
    }
  }

  function renderResults(result) {
    state.result = result;
    saveResult(result);
    els.overallScore.textContent = result.overall;
    els.overallLevel.textContent = result.level.label;
    els.resultSummary.textContent = result.criticalFlags.length
      ? `${result.level.summary} ${result.criticalFlags.length} critical signal${result.criticalFlags.length > 1 ? "s" : ""} require specific corrective action.`
      : result.level.summary;
    els.scoreOrbit.style.setProperty("--score", result.overall);
    els.scoreOrbit.style.setProperty("--score-color", result.level.color);

    if (els.uncertaintySummary) {
      els.uncertaintySummary.textContent = result.notAssessed
        ? `${result.notAssessed} question(s) were not assessed. The score reflects only documented observations.`
        : "All questions were assessed.";
    }

    if (result.criticalFlags.length) {
      els.criticalAlerts.hidden = false;
      els.criticalAlerts.innerHTML = `<h3>Critical signals requiring action</h3><ul>${result.criticalFlags.map(flag => `<li>${escapeHtml(flag)}</li>`).join("")}</ul>`;
    } else {
      els.criticalAlerts.hidden = true;
      els.criticalAlerts.innerHTML = "";
    }

    els.radarWrap.innerHTML = radarSvg(result.dimensions);
    els.dimensionTable.innerHTML = dimensionTable(result.dimensions);
    renderPriorities(result.dimensions);
    els.generatedReport.innerHTML = buildReport(result);
    renderHistory();
    activateStep(els.resultsStep);
  }

  function download(filename, content, type) {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function filenameBase() {
    const code = state.result?.context?.projectCode ? `-${state.result.context.projectCode}` : "";
    return `workplace-ai-${cfg.mode === "followup" ? "follow-up" : "assessment"}${code}-${state.result?.assessmentDate || new Date().toISOString().slice(0,10)}`;
  }

  function openPrint() {
    if (!state.result) return;
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) {
      alert("The print window was blocked. Allow pop-ups for this site and try again.");
      return;
    }
    popup.document.write(standaloneHtml(buildReport(state.result)));
    popup.document.close();
    popup.addEventListener("load", () => {
      popup.focus();
      popup.print();
    });
  }

  function reset() {
    state.context = null;
    state.answers = {};
    state.currentIndex = 0;
    state.result = null;
    els.contextForm.reset();
    setDefaultDates();
    activateStep(els.introStep);
  }

  function setDefaultDates() {
    const today = new Date().toISOString().slice(0,10);
    if (byId("assessmentDate")) byId("assessmentDate").value = today;
    if (byId("followupDate")) byId("followupDate").value = today;
  }

  els.heroStart?.addEventListener("click", () => {
    qs("#evaluation")?.scrollIntoView({behavior:"smooth",block:"start"});
  });
  els.beginContext?.addEventListener("click", () => activateStep(els.contextStep));
  els.backIntro?.addEventListener("click", () => activateStep(els.introStep));

  els.contextForm?.addEventListener("submit", event => {
    event.preventDefault();
    const context = collectContext();
    const error = validateContext(context);
    els.contextError.textContent = error;
    if (error) return;
    state.context = context;
    state.currentIndex = 0;
    state.answers = {};
    activateStep(els.questionStep);
    renderQuestion();
  });

  els.prevQuestion?.addEventListener("click", () => {
    if (state.currentIndex > 0) {
      state.currentIndex -= 1;
      renderQuestion();
    }
  });

  els.nextQuestion?.addEventListener("click", () => {
    if (!state.answers[cfg.questions[state.currentIndex].id]) return;
    if (state.currentIndex < cfg.questions.length - 1) {
      state.currentIndex += 1;
      renderQuestion();
    } else {
      renderResults(computeResult());
    }
  });

  els.toggleChartTable?.addEventListener("click", () => {
    const hidden = els.dimensionTable.hidden;
    els.dimensionTable.hidden = !hidden;
    els.radarWrap.hidden = hidden;
    els.toggleChartTable.textContent = hidden ? "View chart" : "View values";
    els.toggleChartTable.setAttribute("aria-expanded", String(hidden));
  });

  els.downloadJson?.addEventListener("click", () => {
    if (state.result) download(`${filenameBase()}.json`, JSON.stringify(state.result,null,2), "application/json");
  });
  els.downloadHtml?.addEventListener("click", () => {
    if (state.result) download(`${filenameBase()}.html`, standaloneHtml(buildReport(state.result)), "text/html");
  });
  els.printReport?.addEventListener("click", openPrint);
  els.archivePdf?.addEventListener("click", openPrint);
  els.restartAssessment?.addEventListener("click", reset);

  els.generateCode?.addEventListener("click", () => {
    byId("projectCode").value = `AI-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  });

  setDefaultDates();
})();
