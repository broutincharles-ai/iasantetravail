#!/usr/bin/env python3
"""Build the figures of /comprendre/ and inject them between marker comments.

Each figure is written between
    <!-- fig:<name>:start -->  and  <!-- fig:<name>:end -->
in comprendre/index.html. Re-run after changing a dataset below:

    python3 scripts/build-comprendre-figures.py

Charts are static inline SVG / HTML (readable without JavaScript); the small
script /assets/js/understand-figures.js only adds hover and focus tooltips
on elements that carry a data-tip attribute.
"""
from __future__ import annotations

import math
import re
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "comprendre" / "index.html"

MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
SUP = str.maketrans("0123456789-", "⁰¹²³⁴⁵⁶⁷⁸⁹⁻")


def fr(x: float, digits: int = 1) -> str:
    s = f"{x:.{digits}f}".replace(".", ",")
    return s


def month_label(ym: str) -> str:
    y, m = ym.split("-")
    return f"{MONTHS[int(m) - 1]} {y}"


def decimal_year(ym: str) -> float:
    y, m = ym.split("-")
    return int(y) + (int(m) - 0.5) / 12


def sci(v: float) -> str:
    e = int(math.floor(math.log10(v)))
    m = v / 10 ** e
    return f"{fr(m)} × 10{str(e).translate(SUP)}"


def duration(minutes: float) -> str:
    if minutes < 1:
        return f"{round(minutes * 60)} s"
    if minutes < 60:
        return f"{round(minutes)} min"
    h = int(minutes // 60)
    mm = round(minutes - h * 60)
    if mm == 60:
        h, mm = h + 1, 0
    return f"{h} h {mm:02d}"


def a(s: str) -> str:
    return escape(s, quote=True)


NUMS: dict[str, int] = {}


def figure(fid: str, num: int, kind: str, title: str, body: str, note: str, extra: str = "", scroll: bool = False) -> str:
    body_html = (f'<div class="fig-scroll">{body}</div>'
                 '<p class="fig-swipe" aria-hidden="true">← Faites glisser pour voir tout le graphique →</p>') if scroll else body
    return (
        f'<figure class="fig" id="{fid}">\n'
        f'        <div class="fig-head"><span>Figure {NUMS.get(fid, num)} · {kind}</span><h3>{title}</h3></div>\n'
        f"        {body_html}\n"
        f"        <figcaption>{note}</figcaption>{extra}\n"
        f"      </figure>"
    )


# ---------------------------------------------------------------------------
# Figure 1 — next-token probabilities (illustrative)
# ---------------------------------------------------------------------------
TOKENS = [("dos", 38, True), ("bas", 14, False), ("poignet", 11, False), ("genou", 9, False), ("cou", 8, False), ("autres jetons", 20, False)]


def fig_token() -> str:
    rows = []
    for label, p, chosen in TOKENS:
        cls = "tok-row is-chosen" if chosen else "tok-row"
        rows.append(
            f'<div class="{cls}"><span class="tok-label">{a(label)}</span>'
            f'<span class="tok-track"><i style="width:{p / 40 * 100:.1f}%"></i></span>'
            f'<span class="tok-value">{p} %</span></div>'
        )
    body = (
        '<div class="tok">'
        '<p class="tok-context"><small>Texte déjà présent dans le contexte</small>'
        '« Le salarié décrit des douleurs persistantes au niveau du <b aria-hidden="true">▯</b> »</p>'
        '<div class="tok-bars" role="img" aria-label="Probabilités du jeton suivant : dos 38 %, bas 14 %, poignet 11 %, genou 9 %, cou 8 %, autres jetons 20 %.">'
        + "".join(rows)
        + "</div>"
        '<div class="tok-steps">'
        '<div><small>Température basse</small><p>« dos » est choisi presque à chaque fois : réponses stables, parfois répétitives.</p></div>'
        '<div><small>Température élevée</small><p>« bas » ou « poignet » sortent plus souvent : plus de variété, plus d’écarts.</p></div>'
        '<div><small>Puis on recommence</small><p>« …au niveau du <b>dos</b> » → « , » → « aggravées » → « par »… chaque jeton ajouté relance le calcul.</p></div>'
        "</div></div>"
    )
    note = ("Exemple illustratif : les probabilités sont fictives. Un jeton n’est pas toujours un mot entier "
            "(« bas » peut amorcer « bas du dos »). Le modèle choisit ce qui est probable dans ce contexte, "
            "pas ce qui est vrai pour ce salarié.")
    return figure("fig-jeton", 1, "Exemple illustratif", "À chaque pas, chaque suite possible reçoit une probabilité.", body, note)


# ---------------------------------------------------------------------------
# Figure 2 — training compute of landmark models (Epoch AI)
# ---------------------------------------------------------------------------
COMPUTE = [
    # name, date, FLOP, estimated?, label position (dx, dy, anchor)
    ("AlexNet", "2012-09", 4.7e17, False, (10, 4, "start")),
    ("Transformer", "2017-06", 7.4e18, False, (10, 4, "start")),
    ("GPT-2", "2019-02", 1.92e21, True, (-10, 4, "end")),
    ("GPT-3", "2020-05", 3.14e23, False, (-10, 4, "end")),
    ("PaLM", "2022-04", 2.53e24, False, (-10, 4, "end")),
    ("GPT-4", "2023-03", 2.1e25, True, (-10, 4, "end")),
    ("Llama 3.1 405B", "2024-07", 3.8e25, False, (0, 22, "middle")),
    ("GPT-4.5", "2025-02", 3.8e26, True, (-10, 4, "end")),
    ("Grok 4", "2025-07", 5.0e26, True, (10, 16, "start")),
    ("GPT-6 Astra", "2026-09", 1.0e27, True, (-10, -8, "end")),
]


def fig_compute() -> str:
    W, H = 740, 380
    L, R, T, B = 64, 712, 34, 330
    x0, x1 = 2011.5, 2027.0
    y0, y1 = 17, 28

    def X(t):
        return L + (t - x0) / (x1 - x0) * (R - L)

    def Y(v):
        return B - (math.log10(v) - y0) / (y1 - y0) * (B - T)

    out = [f'<svg class="fig-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Nuage de points, échelle logarithmique : le calcul d’entraînement passe de 4,7 × 10¹⁷ FLOP pour AlexNet en 2012 à environ 10²⁷ FLOP pour GPT-6 Astra en 2026, soit plus de deux milliards de fois plus.">']
    for e in range(y0, y1 + 1, 2):  # 17, 19, … 27
        y = Y(10 ** e)
        out.append(f'<line class="fx-grid" x1="{L}" x2="{R}" y1="{y:.1f}" y2="{y:.1f}"/>')
        out.append(f'<text class="fx-tick" x="{L - 8}" y="{y + 4:.1f}" text-anchor="end">10{str(e).translate(SUP)}</text>')
    for yr in range(2012, 2028, 2):
        out.append(f'<text class="fx-tick" x="{X(yr):.1f}" y="{B + 20}" text-anchor="middle">{yr}</text>')
    out.append(f'<line class="fx-axis" x1="{L}" x2="{R}" y1="{B}" y2="{B}"/>')
    out.append(f'<text class="fx-title" x="{L - 50}" y="16">FLOP d’entraînement · échelle logarithmique, chaque ligne = × 100</text>')
    # headline annotation
    out.append(f'<text class="fx-note-strong" x="{L + 14}" y="{T + 22}">× 2 milliards de calcul en 14 ans</text>')
    out.append(f'<text class="fx-note" x="{L + 14}" y="{T + 40}">entre AlexNet (2012) et GPT-6 Astra (2026)</text>')
    for name, d, v, est, (dx, dy, anchor) in COMPUTE:
        x, y = X(decimal_year(d)), Y(v)
        tip = f"{name} · {month_label(d)} · {sci(v)} FLOP" + (" (estimation Epoch AI)" if est else "")
        dot = "fx-dot is-estimate" if est else "fx-dot"
        out.append(
            f'<g class="fx-point" tabindex="0" data-tip="{a(tip)}"><circle class="fx-hit" cx="{x:.1f}" cy="{y:.1f}" r="12"/>'
            f'<circle class="{dot}" cx="{x:.1f}" cy="{y:.1f}" r="5"/></g>'
        )
        out.append(f'<text class="fx-label" x="{x + dx:.1f}" y="{y + dy:.1f}" text-anchor="{anchor}">{a(name)}</text>')
    # legend
    lx, ly = R - 250, B - 16
    out.append(f'<circle class="fx-dot" cx="{lx}" cy="{ly}" r="5"/><text class="fx-legend" x="{lx + 10}" y="{ly + 4}">valeur publiée</text>')
    out.append(f'<circle class="fx-dot is-estimate" cx="{lx + 110}" cy="{ly}" r="5"/><text class="fx-legend" x="{lx + 120}" y="{ly + 4}">estimation Epoch AI</text>')
    out.append("</svg>")

    rows = "".join(
        f"<tr><td>{a(n)}</td><td>{month_label(d)}</td><td>{sci(v)}</td><td>{'Estimation' if est else 'Publiée'}</td></tr>"
        for n, d, v, est, _ in COMPUTE
    )
    table = ('\n        <details class="fig-data"><summary>Voir les données</summary><table><thead><tr><th>Modèle</th><th>Date</th>'
             f'<th>Calcul (FLOP)</th><th>Statut</th></tr></thead><tbody>{rows}</tbody></table></details>')
    note = ('Source : <a href="https://epoch.ai/data/ai-models" target="_blank" rel="noreferrer">Epoch AI, base « AI Models »</a>, '
            "mise à jour le 26 septembre 2026. Les fournisseurs ne publient plus le calcul de leurs modèles phares : "
            "les valeurs récentes sont des estimations (GPT-6 Astra : au moins 100 000 puces GB200 selon Epoch). "
            "Aucune estimation n’est encore publiée pour Claude Opus 5.5, Fable 5.1 ou Gemini 3.x. "
            "Un FLOP est une opération de calcul élémentaire.")
    return figure("fig-calcul", 2, "Données", "Le calcul consacré à l’entraînement a été multiplié par plus de deux milliards en quatorze ans.", "".join(out), note, table, scroll=True)


# ---------------------------------------------------------------------------
# Figure 3 — from model to system (diagram)
# ---------------------------------------------------------------------------
def box(x, y, w, h, cls="dg-box"):
    return f'<rect class="{cls}" x="{x}" y="{y}" width="{w}" height="{h}"/>'


def txt(x, y, s, cls="dg-text", anchor="start"):
    return f'<text class="{cls}" x="{x}" y="{y}" text-anchor="{anchor}">{a(s)}</text>'


def fig_system() -> str:
    W, H = 800, 440
    o = [f'<svg class="fig-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Schéma : votre demande entre dans une fenêtre de contexte qui contient aussi la consigne système, les documents, les extraits retrouvés et les résultats d’outils. Le modèle lit tout ce contexte, répond ou appelle des outils dont les résultats reviennent dans le contexte, formant une boucle d’agent. Un document piégé peut y glisser une consigne cachée.">']
    o.append('<defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
             '<path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker>'
             '<marker id="dg-arrow-risk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
             '<path class="dg-risk-fill" d="M0,0 L10,5 L0,10 z"/></marker></defs>')
    # user
    o.append(box(20, 176, 124, 64))
    o.append(txt(82, 203, "Vous", "dg-strong", "middle"))
    o.append(txt(82, 222, "question, fichiers", "dg-small", "middle"))
    # injected document
    o.append(box(20, 60, 124, 72, "dg-box is-risk"))
    o.append(txt(82, 86, "Page web, courriel", "dg-strong-risk", "middle"))
    o.append(txt(82, 104, "ou PDF piégé", "dg-strong-risk", "middle"))
    o.append(txt(82, 122, "consigne cachée", "dg-small", "middle"))
    # context container
    o.append(box(200, 60, 330, 200, "dg-frame"))
    o.append(txt(216, 84, "Fenêtre de contexte", "dg-strong"))
    o.append(txt(216, 102, "tout ce que le modèle « voit »", "dg-small"))
    chips = [("Consigne système", 216, 118), ("Conversation", 371, 118), ("Documents fournis", 216, 162),
             ("Extraits retrouvés", 371, 162), ("Résultats d’outils", 216, 206), ("Mémoire (parfois)", 371, 206)]
    for label, x, y in chips:
        o.append(box(x, y, 143, 34, "dg-chip"))
        o.append(txt(x + 71.5, y + 21, label, "dg-text", "middle"))
    # model
    o.append(box(200, 320, 330, 64, "dg-box is-key"))
    o.append(txt(365, 347, "Modèle de langage", "dg-strong", "middle"))
    o.append(txt(365, 366, "prédit la suite, jeton par jeton", "dg-small", "middle"))
    # knowledge base
    o.append(box(610, 16, 170, 44))
    o.append(txt(695, 43, "Base documentaire", "dg-strong", "middle"))
    # tools
    o.append(txt(695, 94, "Outils", "dg-strong", "middle"))
    for i, label in enumerate(["Recherche web", "Exécution de code", "Messagerie, agenda", "Logiciels métier"]):
        y = 104 + i * 42
        o.append(box(610, y, 170, 34))
        o.append(txt(695, y + 21, label, "dg-text", "middle"))
    # arrows
    o.append('<path class="dg-line" d="M144,208 H198" marker-end="url(#dg-arrow)"/>')
    o.append(txt(171, 200, "demande", "dg-edge", "middle"))
    o.append('<path class="dg-line is-risk" d="M144,96 H198" marker-end="url(#dg-arrow-risk)"/>')
    o.append('<path class="dg-line" d="M365,262 V318" marker-end="url(#dg-arrow)"/>')
    o.append(txt(375, 294, "relu en entier à chaque jeton", "dg-edge"))
    o.append('<path class="dg-line" d="M200,366 H82 V242" marker-end="url(#dg-arrow)"/>')
    o.append(txt(92, 358, "réponse", "dg-edge"))
    o.append('<path class="dg-line" d="M610,38 H470 V58" marker-end="url(#dg-arrow)"/>')
    o.append(txt(540, 30, "extraits (RAG)", "dg-edge", "middle"))
    o.append('<path class="dg-line" d="M530,352 H695 V272" marker-end="url(#dg-arrow)"/>')
    o.append(txt(546, 344, "appelle un outil", "dg-edge"))
    o.append('<rect class="dg-gate" x="642" y="344" width="16" height="16" transform="rotate(45 650 352)"/>')
    o.append(txt(650, 384, "validation humaine ?", "dg-edge", "middle"))
    o.append('<path class="dg-line" d="M610,238 H532" marker-end="url(#dg-arrow)"/>')
    o.append(txt(571, 230, "résultat", "dg-edge", "middle"))
    o.append(txt(684, 296, "↻ boucle d’agent", "dg-strong", "end"))
    o.append(txt(684, 314, "agir, observer, recommencer", "dg-small", "end"))
    o.append("</svg>")
    note = ("Le modèle ne connaît que ce qui entre dans sa fenêtre de contexte. Chaque flèche est un point de contrôle possible : "
            "qui écrit la consigne système, quels documents sont retrouvés, quels outils peuvent agir et avec quelle validation. "
            "Le trait rouge montre l’injection de consignes : un contenu lu par l’outil peut être pris pour un ordre.")
    return figure("fig-systeme", 3, "Schéma", "Ce qui se passe entre votre question et la réponse.", "".join(o), note, scroll=True)


# ---------------------------------------------------------------------------
# Figure 4 — jagged frontier (schematic + study figures)
# ---------------------------------------------------------------------------
def fig_frontier() -> str:
    W, H = 720, 310
    L, R, T, B = 56, 590, 44, 262
    th = 132
    ys = [78, 70, 100, 176, 86, 64, 122, 204, 96, 66, 152, 108, 214, 92, 170]
    xs = [L + 14 + i * (R - L - 28) / (len(ys) - 1) for i in range(len(ys))]
    ex0, ex1 = 64, 240
    o = [f'<svg class="fig-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Schéma : on imagine que la performance de l’IA baisse régulièrement avec la difficulté perçue par un humain. En réalité, la courbe est en dents de scie : certaines tâches complexes sont réussies, certaines tâches simples échouent.">']
    o.append(f'<line class="fx-axis" x1="{L}" x2="{R}" y1="{B}" y2="{B}"/><line class="fx-axis" x1="{L}" x2="{L}" y1="{T - 10}" y2="{B}"/>')
    o.append(f'<line class="fx-threshold" x1="{L}" x2="{R}" y1="{th}" y2="{th}"/>')
    o.append(f'<line class="fx-expect" x1="{L + 14}" y1="{ex0}" x2="{R - 14}" y2="{ex1}"/>')
    pts = " ".join(f"{x:.1f},{y}" for x, y in zip(xs, ys))
    o.append(f'<polyline class="fx-jag" points="{pts}"/>')
    for x, y in zip(xs, ys):
        cls = "fx-dot" if y < th else "fx-dot is-out"
        o.append(f'<circle class="{cls}" cx="{x:.1f}" cy="{y}" r="4.5"/>')
    # direct labels at the line ends, in the right margin
    o.append(txt(R + 10, ys[-1] + 4, "ce que l’on observe", "fx-label"))
    o.append(txt(R + 10, ex1 + 4, "ce que l’on imagine", "fx-note-muted"))
    o.append(txt(R + 10, th - 3, "niveau de fiabilité", "fx-note"))
    o.append(txt(R + 10, th + 12, "exigé par la tâche", "fx-note"))
    o.append(txt(xs[3], ys[3] + 22, "tâche simple manquée", "fx-note", "middle"))
    o.append(txt(xs[9], ys[9] - 14, "tâche complexe réussie", "fx-note", "middle"))
    o.append(txt(L, B + 24, "Tâches, de la plus simple à la plus difficile pour un humain →", "fx-tick"))
    o.append(f'<text class="fx-tick" transform="translate({L - 16} {B}) rotate(-90)">Performance de l’IA →</text>')
    o.append("</svg>")
    tiles = (
        '<div class="fig-tiles" aria-label="Résultats de l’étude auprès de 758 consultants">'
        '<div class="fig-tile-group"><small>Tâches dans la frontière</small><div class="fig-tile-row">'
        '<div class="fig-tile"><strong>+12 %</strong><span>de tâches menées à terme</span></div>'
        '<div class="fig-tile"><strong>+25 %</strong><span>de rapidité</span></div>'
        '<div class="fig-tile"><strong>+40 %</strong><span>de qualité jugée, au moins</span></div>'
        "</div></div>"
        '<div class="fig-tile-group is-out"><small>Tâche hors frontière</small><div class="fig-tile-row">'
        '<div class="fig-tile"><strong>−19 pts</strong><span>de réponses justes</span></div>'
        "</div></div></div>"
    )
    note = ('Partie haute : schéma illustratif. Partie basse : résultats de l’essai de '
            '<a href="https://www.hbs.edu/faculty/Pages/item.aspx?num=64700" target="_blank" rel="noreferrer">Dell’Acqua et al. (Harvard Business School, BCG)</a> '
            "auprès de 758 consultants, comparés à un groupe sans IA : points rouges, tâches réussies au niveau exigé ; points gris, tâches "
            "où l’IA reste en dessous. Sur la tâche hors frontière, les consultants aidés par l’IA donnaient moins souvent la bonne réponse.")
    swipe = '<p class="fig-swipe" aria-hidden="true">← Faites glisser pour voir tout le schéma →</p>'
    body = f'<div class="fig-scroll">{"".join(o)}</div>{swipe}{tiles}'
    return figure("fig-frontiere", 4, "Schéma et données", "Une frontière en dents de scie : la difficulté pour l’humain ne prédit pas l’échec de la machine.", body, note)


# ---------------------------------------------------------------------------
# Figure 5 — METR 50 % time horizon
# ---------------------------------------------------------------------------
METR = [
    # name, release, p50 (min), ci low, ci high, label (dx, dy, anchor) or None
    ("GPT-2", "2019-02", 0.05, 0.01, 0.14, (10, 4, "start")),
    ("GPT-3", "2020-05", 0.14, 0.09, 0.22, (10, 4, "start")),
    ("GPT-3.5", "2022-03", 0.60, 0.26, 1.12, (10, 4, "start")),
    ("GPT-4", "2023-03", 3.99, 1.93, 7.99, (-10, -6, "end")),
    ("GPT-4 (nov.)", "2023-11", 4.04, 1.87, 8.44, None),
    ("GPT-4o", "2024-05", 6.99, 4.00, 12.91, None),
    ("Claude 3.5 Sonnet (juin)", "2024-06", 11.40, 5.49, 22.38, None),
    ("o1-preview", "2024-09", 20.33, 11.72, 33.38, None),
    ("Claude 3.5 Sonnet (oct.)", "2024-10", 20.52, 10.14, 40.82, None),
    ("o1", "2024-12", 38.83, 21.16, 64.95, (10, 12, "start")),
    ("Claude 3.7 Sonnet", "2025-02", 60.39, 33.01, 104.23, None),
    ("o3", "2025-04", 119.73, 74.62, 190.94, None),
    ("GPT-5", "2025-08", 203.01, 112.64, 405.55, (10, 14, "start")),
    ("Gemini 3 Pro", "2025-11", 224.33, 139.57, 379.24, None),
    ("Claude Opus 4.5", "2025-11", 292.99, 161.72, 623.70, None),
    ("GPT-5.2", "2025-12", 352.25, 198.07, 815.18, None),
    ("Claude Opus 4.6", "2026-02", 718.81, 316.69, 3633.79, (-12, 4, "end")),
    ("Claude Mythos Preview", "2026-04", 1044.78, 508.88, 3304.26, (-10, -8, "end")),
]

# Measured by METR but not state of the art, shown in grey (blog post, not on the chart page)
METR_OTHER = [
    ("GPT-5.6 Sol", "2026-06", 678.0, 300.0, 2400.0, (10, 4, "start"),
     "mesure très incertaine : triche fréquente détectée ; non retenu comme modèle de pointe"),
]


def fig_metr() -> str:
    W, H = 760, 400
    L, R, T, B = 64, 736, 30, 344
    x0, x1 = 2018.8, 2027.2
    ly0, ly1 = math.log10(0.01), math.log10(3000)

    def X(t):
        return L + (t - x0) / (x1 - x0) * (R - L)

    def Y(v):
        return B - (math.log10(v) - ly0) / (ly1 - ly0) * (B - T)

    o = [f'<svg class="fig-svg" viewBox="0 0 {W} {H}" role="img" aria-label="Courbe, échelle logarithmique : durée des tâches qu’un agent réussit une fois sur deux, de 3 secondes pour GPT-2 en 2019 à environ 12 heures pour Claude Opus 4.6 en février 2026. Au-delà de 16 heures, les mesures sont peu fiables.">']
    zone = Y(960)
    o.append(f'<rect class="fx-zone" x="{L}" y="{T}" width="{R - L}" height="{zone - T:.1f}"/>')
    o.append(txt(L + 10, T + 16, "au-delà de 16 h : mesures peu fiables", "fx-note-muted"))
    for v, lab in [(1 / 60, "1 s"), (1, "1 min"), (10, "10 min"), (60, "1 h"), (480, "8 h")]:
        y = Y(v)
        o.append(f'<line class="fx-grid" x1="{L}" x2="{R}" y1="{y:.1f}" y2="{y:.1f}"/>')
        o.append(f'<text class="fx-tick" x="{L - 8}" y="{y + 4:.1f}" text-anchor="end">{lab}</text>')
    o.append(txt(L + 10, Y(480) - 7, "8 h : une journée de travail", "fx-note-muted"))
    for yr in range(2019, 2027):
        o.append(f'<text class="fx-tick" x="{X(yr):.1f}" y="{B + 20}" text-anchor="middle">{yr}</text>')
    o.append(f'<line class="fx-axis" x1="{L}" x2="{R}" y1="{B}" y2="{B}"/>')
    o.append(f'<text class="fx-title" x="{L - 50}" y="16">Durée de la tâche pour un expert humain · échelle logarithmique</text>')
    reliable = [m for m in METR if m[2] < 960]
    pts = " ".join(f"{X(decimal_year(d)):.1f},{Y(v):.1f}" for _, d, v, *_ in reliable)
    o.append(f'<polyline class="fx-line" points="{pts}"/>')
    last = reliable[-1]
    m = METR[-1]
    o.append(f'<line class="fx-line is-soft" x1="{X(decimal_year(last[1])):.1f}" y1="{Y(last[2]):.1f}" x2="{X(decimal_year(m[1])):.1f}" y2="{Y(m[2]):.1f}"/>')
    for name, d, v, lo, hi, lab in METR:
        x, y = X(decimal_year(d)), Y(v)
        unreliable = v >= 960
        tip = f"{name} · {month_label(d)} · {duration(v)} (IC 95 % : {duration(lo)} – {duration(hi)})"
        if unreliable:
            tip += " · au-delà de la zone fiable"
        dot = "fx-dot is-estimate" if unreliable else "fx-dot"
        o.append(f'<g class="fx-point" tabindex="0" data-tip="{a(tip)}"><circle class="fx-hit" cx="{x:.1f}" cy="{y:.1f}" r="11"/>'
                 f'<circle class="{dot}" cx="{x:.1f}" cy="{y:.1f}" r="4.5"/></g>')
        if lab:
            dx, dy, anchor = lab
            o.append(f'<text class="fx-label" x="{x + dx:.1f}" y="{y + dy:.1f}" text-anchor="{anchor}">{a(name)} · {duration(v)}</text>')
    for name, d, v, lo, hi, (dx, dy, anchor), caveat in METR_OTHER:
        x, y = X(decimal_year(d)), Y(v)
        tip = f"{name} · {month_label(d)} · ≈ {duration(v)} (IC 95 % : {duration(lo)} – {duration(hi)}) · {caveat}"
        o.append(f'<g class="fx-point" tabindex="0" data-tip="{a(tip)}"><circle class="fx-hit" cx="{x:.1f}" cy="{y:.1f}" r="11"/>'
                 f'<circle class="fx-dot is-out" cx="{x:.1f}" cy="{y:.1f}" r="4.5"/></g>')
        o.append(f'<text class="fx-note" x="{x + dx:.1f}" y="{y + dy:.1f}" text-anchor="{anchor}">{a(name)}</text>')
    o.append(f'<text class="fx-note-strong" x="{X(2019.2):.1f}" y="{Y(60) - 22:.1f}">Doublement tous les 7 mois environ</text>')
    o.append(f'<text class="fx-note" x="{X(2019.2):.1f}" y="{Y(60) - 5:.1f}">de 2019 à 2025, et tous les 3 mois environ depuis 2024</text>')
    o.append("</svg>")
    rows = "".join(
        f"<tr><td>{a(n)}</td><td>{month_label(d)}</td><td>{duration(v)}</td><td>{duration(lo)} – {duration(hi)}</td></tr>"
        for n, d, v, lo, hi, _ in METR
    ) + "".join(
        f"<tr><td>{a(n)} (hors modèles de pointe)</td><td>{month_label(d)}</td><td>≈ {duration(v)}</td><td>{duration(lo)} – {duration(hi)}</td></tr>"
        for n, d, v, lo, hi, _, _c in METR_OTHER
    )
    table = ('\n        <details class="fig-data"><summary>Voir les données</summary><table><thead><tr><th>Modèle</th><th>Sortie</th>'
             f'<th>Horizon à 50 %</th><th>IC 95 %</th></tr></thead><tbody>{rows}</tbody></table></details>')
    note = ('Source : <a href="https://metr.org/time-horizons/" target="_blank" rel="noreferrer">METR, Time Horizon 1.1</a>, données de mai 2026 '
            "(modèles de pointe à leur sortie), complétées par le rapport de METR sur GPT-5.6 Sol (juin 2026, point gris). "
            "Lecture : GPT-5 réussit une fois sur deux des tâches qui demandent environ 3 h 20 à un expert. "
            "Au 27 septembre 2026, METR n’a publié aucune mesure pour Claude Opus 5.5, Fable 5.1 ou GPT-6 Astra : "
            "les modèles les plus avancés dépassent déjà ce que ses tâches permettent de mesurer. "
            "Tâches surtout de programmation ; intervalles de confiance larges.")
    return figure("fig-horizon", 5, "Données", "Les tâches qu’un agent mène seul sont passées de quelques secondes à plusieurs heures.", "".join(o), note, table, scroll=True)


# ---------------------------------------------------------------------------
# Figure 6 — METR developer RCT: expected vs measured
# ---------------------------------------------------------------------------
UPLIFT = [
    ("Économistes, prévision", 39, False),
    ("Experts en apprentissage automatique, prévision", 38, False),
    ("Développeurs, avant l’étude", 24, False),
    ("Développeurs, après l’étude (ressenti)", 20, False),
    ("Mesure réelle", -19, True),
]


def fig_uplift() -> str:
    rows = []
    for label, v, measured in UPLIFT:
        cls = "div-row is-key" if measured else "div-row"
        side = "pos" if v > 0 else "neg"
        width = abs(v) / 40 * 100
        sign = "+" if v > 0 else "−"
        bar = f'<i style="width:{width:.1f}%"></i>'
        neg_bar = bar if side == "neg" else ""
        pos_bar = bar if side == "pos" else ""
        rows.append(
            f'<div class="{cls}"><span class="div-label">{a(label)}</span>'
            f'<span class="div-track"><span class="div-half neg">{neg_bar}</span>'
            f'<span class="div-half pos">{pos_bar}</span></span>'
            f'<span class="div-value">{sign}{abs(v)} %</span></div>'
        )
    axis = ('<div class="div-axis" aria-hidden="true"><span></span><span class="div-axis-scale"><em>plus lent</em><em>0</em><em>plus rapide</em></span><span></span></div>')
    body = ('<div class="div-chart" role="img" aria-label="Gain de temps attendu avec l’IA : économistes +39 %, experts en apprentissage automatique +38 %, développeurs avant l’étude +24 %, développeurs après l’étude +20 %. Mesure réelle : 19 % plus lents.">'
            + "".join(rows) + axis + "</div>")
    note = ('Source : <a href="https://arxiv.org/abs/2507.09089" target="_blank" rel="noreferrer">Becker, Rush, Barnes et al., METR, 2025</a>. '
            "Essai randomisé : 16 développeurs expérimentés, 246 tâches réelles sur leurs propres projets, début 2025. "
            "Une nouvelle mesure fin 2025 suggère plutôt une accélération, jugée peu probante par METR.")
    return figure("fig-ressenti", 6, "Données", "Gain de temps attendu avec l’IA, puis mesuré.", body, note)


# ---------------------------------------------------------------------------
# Figure 7 — Levels of AGI matrix (Morris et al.)
# ---------------------------------------------------------------------------
LEVELS = [
    ("0 · Sans IA", "", "Calculatrice, compilateur", "Travail humain assisté par une plateforme (Mechanical Turk)", False),
    ("1 · Émergent", "au niveau d’un humain non qualifié, ou un peu mieux", "Systèmes à règles simples", "ChatGPT, Bard, Llama 2, Gemini", True),
    ("2 · Compétent", "au moins la médiane des adultes qualifiés", "Assistants vocaux, détecteurs de contenus toxiques", "Pas encore atteint", False),
    ("3 · Expert", "au moins 90 % des adultes qualifiés", "Correcteurs de style, générateurs d’images", "Pas encore atteint", False),
    ("4 · Virtuose", "au moins 99 % des adultes qualifiés", "Deep Blue (échecs), AlphaGo", "Pas encore atteint", False),
    ("5 · Surhumain", "mieux que tous les humains", "AlphaFold, AlphaZero, Stockfish", "Superintelligence : pas encore atteinte", False),
]


def fig_levels() -> str:
    rows = []
    for lvl, desc, narrow, general, current in LEVELS:
        g_cls = "lv-cell is-current" if current else ("lv-cell is-empty" if general.startswith(("Pas", "Super")) else "lv-cell")
        d = f"<small>{a(desc)}</small>" if desc else ""
        rows.append(
            f'<div class="lv-row"><div class="lv-level"><strong>{a(lvl)}</strong>{d}</div>'
            f'<div class="lv-cell"><small class="lv-mobile">IA spécialisée</small>{a(narrow)}</div>'
            f'<div class="{g_cls}"><small class="lv-mobile">IA générale</small>{a(general)}</div></div>'
        )
    body = ('<div class="lv"><div class="lv-row lv-head"><div>Niveau de performance</div><div>IA spécialisée · une tâche</div><div>IA générale · nombreuses tâches</div></div>'
            + "".join(rows) + "</div>")
    note = ('Source : <a href="https://arxiv.org/abs/2311.02462" target="_blank" rel="noreferrer">Morris et al., Google DeepMind, « Levels of AGI », 2023</a>, '
            "exemples des auteurs à cette date. Les modèles plus récents n’ont pas été reclassés officiellement ; les auteurs notent déjà "
            "que les meilleurs modèles atteignent le niveau « compétent » sur certaines tâches, comme la rédaction courte ou le code simple.")
    return figure("fig-niveaux", 7, "Grille de lecture", "Les niveaux d’AGI : croiser la performance et l’étendue des tâches.", body, note)


# ---------------------------------------------------------------------------
# Figure 8 — CHC profile, GPT-4 vs GPT-5 (Hendrycks, Bengio et al.)
# ---------------------------------------------------------------------------
CHC = [
    ("Connaissances générales", 8, 9),
    ("Lecture et écriture", 6, 10),
    ("Mathématiques", 4, 10),
    ("Raisonnement sur un problème nouveau", 0, 7),
    ("Mémoire de travail", 2, 4),
    ("Stockage en mémoire à long terme", 0, 0),
    ("Rappel de la mémoire à long terme", 4, 4),
    ("Traitement visuel", 0, 4),
    ("Traitement auditif", 0, 6),
    ("Vitesse", 3, 3),
]


def fig_chc() -> str:
    rows = []
    for label, g4, g5 in CHC:
        lo, hi = min(g4, g5), max(g4, g5)
        val = f"{g4} → {g5}" if g4 != g5 else f"{g4} (inchangé)"
        rows.append(
            f'<div class="db-row" tabindex="0" data-tip="{a(label)} · GPT-4 : {g4} / 10 · GPT-5 : {g5} / 10">'
            f'<span class="db-label">{a(label)}</span><span class="db-track">'
            f'<i class="db-span" style="left:{lo * 10}%;width:{(hi - lo) * 10}%"></i>'
            f'<b class="db-dot is-a" style="left:{g4 * 10}%"></b><b class="db-dot is-b" style="left:{g5 * 10}%"></b></span>'
            f'<span class="db-value">{val}</span></div>'
        )
    legend = ('<div class="fig-legend"><span><b class="db-dot is-a"></b>GPT-4 · 27 %</span><span><b class="db-dot is-b"></b>GPT-5 · 57 %</span>'
              '<span class="fig-legend-note">chaque aptitude est notée sur 10 ; 100 % = adulte instruit</span></div>')
    scale = '<div class="db-scale" aria-hidden="true"><span></span><span class="db-scale-ticks"><em>0</em><em>5</em><em>10</em></span><span></span></div>'
    body = (legend + '<div class="db" role="img" aria-label="Scores sur dix aptitudes, GPT-4 puis GPT-5 : connaissances 8 puis 9, lecture et écriture 6 puis 10, mathématiques 4 puis 10, raisonnement 0 puis 7, mémoire de travail 2 puis 4, stockage à long terme 0 et 0, rappel à long terme 4 et 4, visuel 0 puis 4, auditif 0 puis 6, vitesse 3 et 3.">'
            + "".join(rows) + scale + "</div>")
    note = ('Source : <a href="https://www.agidefinition.ai/" target="_blank" rel="noreferrer">Hendrycks, Bengio et al., « A Definition of AGI », 2025</a>, '
            "tableau 1, fondé sur le modèle CHC des aptitudes cognitives humaines. Le stockage en mémoire à long terme reste à zéro : "
            "le modèle n’apprend rien durablement d’une conversation à l’autre, sauf mémoire externe ajoutée par l’outil. "
            "Au 27 septembre 2026, aucun modèle plus récent n’a été évalué avec cette grille.")
    return figure("fig-profil", 8, "Données", "Un profil irrégulier : très fort en connaissances, nul en mémoire durable.", body, note)


# ---------------------------------------------------------------------------
# Training pipeline (diagram, HTML so it can stack on phones)
# ---------------------------------------------------------------------------
TRAINING = [
    ("01", "Pré-entraîner",
     "Textes du web, livres, code : des milliers de milliards de jetons",
     "Prédire le jeton suivant, comparer avec la vraie suite, corriger les paramètres. Des milliards de fois.",
     "Modèle de base", "Complète du texte sans suivre de consignes. Savoir figé à une date de coupure.", True),
    ("02", "Ajuster",
     "Dialogues exemplaires rédigés ou validés par des personnes",
     "Imiter ces réponses modèles : suivre une consigne, un ton, un format.",
     "Assistant", "Répond aux demandes, refuse certaines d’entre elles.", False),
    ("03", "Renforcer",
     "Réponses comparées par des personnes, ou par une IA guidée par des principes écrits",
     "Un modèle de récompense note chaque réponse ; l’assistant s’ajuste pour être mieux noté.",
     "Assistant aligné", "Plus utile et plus prudent, mais ce qui plaît peut l’emporter sur ce qui est exact.", False),
    ("04", "Raisonner",
     "Problèmes à solution vérifiable : mathématiques, code, tests automatiques",
     "Essayer de nombreuses pistes, vérifier le résultat, renforcer les raisonnements qui aboutissent.",
     "Modèle de raisonnement", "Calcule plus longtemps avant de répondre, en étapes intermédiaires.", False),
    ("05", "Évaluer, déployer",
     "Tests de capacités et de risques, équipes chargées d’attaquer le modèle",
     "Mesurer, ajouter des protections, décider de la mise sur le marché.",
     "Modèle déployé", "Mis à jour et surveillé : chaque version est un objet daté.", False),
]

LOOP_SVG = (
    '<svg class="tr-loop" viewBox="0 0 200 92" role="img" aria-label="Boucle d’apprentissage : prédire, comparer, corriger.">'
    '<defs><marker id="tr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">'
    '<path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>'
    '<rect class="dg-chip" x="4" y="8" width="72" height="26" rx="2"/><text class="dg-text" x="40" y="25" text-anchor="middle">prédire</text>'
    '<rect class="dg-chip" x="124" y="8" width="72" height="26" rx="2"/><text class="dg-text" x="160" y="25" text-anchor="middle">comparer</text>'
    '<rect class="dg-chip" x="64" y="58" width="72" height="26" rx="2"/><text class="dg-text" x="100" y="75" text-anchor="middle">corriger</text>'
    '<path class="dg-line" d="M78,21 H122" marker-end="url(#tr-arrow)"/>'
    '<path class="dg-line" d="M160,36 V71 H138" marker-end="url(#tr-arrow)"/>'
    '<path class="dg-line" d="M62,71 H40 V36" marker-end="url(#tr-arrow)"/>'
    '</svg>'
)


def fig_training() -> str:
    stages = []
    for num, name, rec, does, out_name, out_desc, key in TRAINING:
        loop = LOOP_SVG if num == "01" else ""
        stages.append(
            f'<li class="tr-stage{" is-key" if key else ""}">'
            f'<p class="tr-step"><b>{num}</b>{a(name)}</p>'
            f'<div class="tr-in"><small class="tr-lane-m">Reçoit</small>{a(rec)}</div>'
            f'<div class="tr-do"><small class="tr-lane-m">Fait</small>{a(does)}{loop}</div>'
            f'<div class="tr-out"><small class="tr-lane-m">Obtient</small><strong>{a(out_name)}</strong>{a(out_desc)}</div>'
            "</li>"
        )
    body = (
        '<div class="tr">'
        '<div class="tr-lanes" aria-hidden="true"><span></span><span>Ce qu’il reçoit</span><span>Ce qu’il fait</span><span>Ce qui en sort</span></div>'
        '<ol class="tr-stages">' + "".join(stages) + "</ol>"
        '<div class="tr-scale"><div class="tr-scale-a"><small>Ordre de grandeur</small>Llama 3.1 405B (Meta, 2024) : '
        '15 600 milliards de jetons, 31 millions d’heures de calcul sur processeurs graphiques, jusqu’à 16 000 puces en parallèle.</div>'
        '<div class="tr-scale-b"><small>Étapes 02 à 05</small>Beaucoup moins de données, mais plus coûteuses : chaque exemple est rédigé, '
        'comparé ou vérifié. La part du calcul consacrée au renforcement augmente depuis l’arrivée des modèles de raisonnement.</div></div>'
        '<p class="tr-return">↺ Les défauts repérés en test ou après le déploiement alimentent l’entraînement de la version suivante.</p>'
        "</div>"
    )
    note = ('Schéma simplifié : l’ordre et le poids des étapes varient d’un laboratoire à l’autre, et certaines sont répétées. '
            'Sources : <a href="https://arxiv.org/abs/2203.02155" target="_blank" rel="noreferrer">Ouyang et al., 2022</a> (ajustement et renforcement par retours humains) ; '
            '<a href="https://arxiv.org/abs/2212.08073" target="_blank" rel="noreferrer">Bai et al., 2022</a> (retours d’une IA guidée par des principes) ; '
            '<a href="https://arxiv.org/abs/2407.21783" target="_blank" rel="noreferrer">Meta, « The Llama 3 Herd of Models », 2024</a> (ordres de grandeur).')
    return figure("fig-entrainement", 0, "Schéma", "De la masse de textes au modèle déployé : cinq étapes.", body, note)


# ---------------------------------------------------------------------------
# Two indicators that jumped within a year (GDPval, ARC-AGI-3)
# ---------------------------------------------------------------------------
GDPVAL = [  # win-or-tie rate vs experts, reported by OpenAI
    ("Claude Opus 4.1", "2025-09", 47.6, True),
    ("GPT-5.2 Thinking", "2025-12", 70.9, True),
    ("GPT-5.4", "2026-03", 83.0, True),
    ("GPT-5.5", "2026-04", 84.9, True),
]
ARC3 = [  # verified by ARC Prize, standard harness
    ("Meilleur système au lancement", "2026-03", 0.51, True),
    ("GPT-5.6", "2026-07", 7.8, False),
    ("Claude Opus 5", "2026-07", 30.2, True),
    ("Gemini 3.8 Flash", "2026-09", 10.4, False),
    ("GPT-6 Astra", "2026-09", 62.7, True),
]


def _panel(title, sub, data, ref_value, ref_label, label_names, aria):
    W, H = 380, 262
    L, R, T, B = 40, 364, 50, 222
    x0, x1 = 2025.6, 2026.85

    def X(t):
        return L + (t - x0) / (x1 - x0) * (R - L)

    def Y(v):
        return B - v / 100 * (B - T)

    o = [f'<svg class="fig-svg" viewBox="0 0 {W} {H}" role="img" aria-label="{a(aria)}">']
    o.append(txt(0, 16, title, "dg-strong"))
    o.append(txt(0, 34, sub, "dg-small"))
    for v in (0, 25, 50, 75, 100):
        y = Y(v)
        o.append(f'<line class="fx-grid" x1="{L}" x2="{R}" y1="{y:.1f}" y2="{y:.1f}"/>')
        o.append(f'<text class="fx-tick" x="{L - 6}" y="{y + 4:.1f}" text-anchor="end">{v} %</text>')
    ry = Y(ref_value)
    o.append(f'<line class="fx-threshold" x1="{L}" x2="{R}" y1="{ry:.1f}" y2="{ry:.1f}"/>')
    o.append(txt(R, ry - 5, ref_label, "fx-note-muted", "end"))
    for yr, lab in ((2025.7, "sept. 2025"), (2026.2, "mars 2026"), (2026.7, "sept. 2026")):
        o.append(f'<text class="fx-tick" x="{X(yr):.1f}" y="{B + 18}" text-anchor="middle">{lab}</text>')
    o.append(f'<line class="fx-axis" x1="{L}" x2="{R}" y1="{B}" y2="{B}"/>')
    rec = [(X(decimal_year(d)), Y(v)) for _, d, v, r in data if r]
    o.append('<polyline class="fx-line" points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in rec) + '"/>')
    for name, d, v, record in data:
        x, y = X(decimal_year(d)), Y(v)
        tip = f"{name} · {month_label(d)} · {fr(v)} %"
        o.append(f'<g class="fx-point" tabindex="0" data-tip="{a(tip)}"><circle class="fx-hit" cx="{x:.1f}" cy="{y:.1f}" r="11"/>'
                 f'<circle class="{"fx-dot" if record else "fx-dot is-out"}" cx="{x:.1f}" cy="{y:.1f}" r="4.5"/></g>')
        if name in label_names:
            dx, dy, anchor, *custom = label_names[name]
            text = custom[0] if custom else f"{name} · {fr(v)} %"
            o.append(f'<text class="fx-label" x="{x + dx:.1f}" y="{y + dy:.1f}" text-anchor="{anchor}">{a(text)}</text>')
    o.append("</svg>")
    return "".join(o)


def fig_jumps() -> str:
    g = _panel("GDPval · tâches professionnelles", "livrable jugé équivalent ou meilleur que celui d’un expert",
               GDPVAL, 50, "parité avec l’expert",
               {"Claude Opus 4.1": (8, 16, "start"), "GPT-5.2 Thinking": (8, 18, "start"), "GPT-5.5": (-4, -12, "end")},
               "GDPval, taux de livrables jugés au moins équivalents à ceux d’experts : 47,6 % en septembre 2025, 70,9 % en décembre 2025, 83 % en mars 2026, 84,9 % en avril 2026.")
    r = _panel("ARC-AGI-3 · adaptation à l’inédit", "niveaux résolus, protocole standard (humains : 100 %)",
               ARC3, 100, "humains",
               {"Meilleur système au lancement": (-9, 4, "end", "au lancement · 0,5 %"), "Claude Opus 5": (-8, -8, "end"), "GPT-6 Astra": (-8, -10, "end")},
               "ARC-AGI-3, meilleur score vérifié : 0,51 % au lancement en mars 2026, 30,2 % pour Claude Opus 5 en juillet, 62,7 % pour GPT-6 Astra en septembre 2026.")
    body = f'<div class="fig-pair"><div>{g}</div><div>{r}</div></div>'
    note = ('Sources : GDPval, chiffres publiés par <a href="https://openai.com/index/introducing-gpt-5-5/" target="_blank" rel="noreferrer">OpenAI</a>, '
            "concepteur du test (septembre 2025 à avril 2026) ; aucun chiffre comparable n’a été publié pour GPT-6 Astra ni Claude Opus 5.5. "
            '<a href="https://arcprize.org/results" target="_blank" rel="noreferrer">ARC-AGI-3, scores vérifiés par ARC Prize</a>, septembre 2026 ; '
            "avec un dispositif qui conserve son raisonnement entre les coups, GPT-6 Astra atteint environ 99 % : le score dépend du protocole. "
            "Trait rouge : meilleur score à date ; points gris : autres modèles.")
    return figure("fig-bonds", 0, "Données", "Deux tests réputés difficiles, franchis en quelques mois.", body, note)


# ---------------------------------------------------------------------------
# Who leads? It depends on the test (dated snapshot)
# ---------------------------------------------------------------------------
LEADERS = [
    ("Indice de capacités (ECI)", "Epoch AI · agrège plusieurs dizaines de tests", "https://epoch.ai/benchmarks/eci", [
        ("GPT-6 Astra", "166,6"), ("Claude Fable 5.1", "165,0"), ("Claude Fable 5", "163,6"), ("Claude Opus 5", "162,7"), ("GPT-5.5 Pro", "162,5")],
     "Claude Opus 5.5 pas encore classé"),
    ("Tâches professionnelles (GDPval-AA)", "Artificial Analysis · score Elo, comparaisons par paires", "https://artificialanalysis.ai/evaluations/gdpval-aa", [
        ("Claude Opus 5.5", "1 846"), ("Claude Fable 5.1", "1 735"), ("Claude Opus 5", "1 708"), ("Grok 4.7", "1 695"), ("GPT-6 Astra", "1 542 · 7ᵉ")],
     ""),
    ("Raisonnement abstrait (ARC-AGI-2)", "ARC Prize · scores vérifiés", "https://arcprize.org/results", [
        ("GPT-6 Astra", "95,0 %"), ("Claude Opus 5.5", "93,3 %"), ("GPT-5.6", "92,5 %")],
     ""),
]
ENTITY = {"GPT-6 Astra": "is-a", "Claude Opus 5.5": "is-b"}


def fig_leaders() -> str:
    cols = []
    for title, sub, url, rows, missing in LEADERS:
        items = []
        for i, (name, score) in enumerate(rows, 1):
            cls = ENTITY.get(name, "")
            rank = "…" if "7ᵉ" in score else str(i)
            score = score.replace(" · 7ᵉ", "")
            items.append(f'<li class="{cls}"><span class="ld-rank">{rank}</span><b class="ld-dot"></b>'
                         f'<span class="ld-name">{a(name)}</span><span class="ld-score">{score}</span></li>')
        miss = f'<p class="ld-missing">{a(missing)}</p>' if missing else ""
        cols.append(f'<div class="ld-col"><h4><a href="{url}" target="_blank" rel="noreferrer">{a(title)} ↗</a></h4>'
                    f'<p class="ld-sub">{a(sub)}</p><ol>{"".join(items)}</ol>{miss}</div>')
    legend = ('<div class="fig-legend"><span><b class="db-dot is-a"></b>GPT-6 Astra (OpenAI, 3 sept. 2026)</span>'
              '<span><b class="db-dot is-b"></b>Claude Opus 5.5 (Anthropic, 22 sept. 2026)</span></div>')
    body = legend + '<div class="ld">' + "".join(cols) + "</div>"
    note = ("Instantané au 27 septembre 2026, vite dépassé : suivez les liens pour les résultats du jour. "
            "Les écarts entre les premiers sont souvent inférieurs à l’incertitude de la mesure. "
            "Aucun de ces tests ne dit quel modèle convient à votre usage : cela se vérifie sur vos propres tâches.")
    return figure("fig-classement", 0, "Instantané daté", "Qui est en tête ? Cela dépend du test.", body, note)

FIGURES = {
    "entrainement": fig_training,
    "bonds": fig_jumps,
    "classement": fig_leaders,
    "jeton": fig_token,
    "calcul": fig_compute,
    "systeme": fig_system,
    "frontiere": fig_frontier,
    "horizon": fig_metr,
    "ressenti": fig_uplift,
    "niveaux": fig_levels,
    "profil": fig_chc,
}


def main() -> None:
    html = PAGE.read_text(encoding="utf-8")
    order = sorted(FIGURES, key=lambda n: html.index(f"<!-- fig:{n}:start -->"))
    for i, name in enumerate(order, 1):
        NUMS[f"fig-{name}"] = i
    for name, build in FIGURES.items():
        pattern = re.compile(rf"(<!-- fig:{name}:start -->)(.*?)(<!-- fig:{name}:end -->)", re.S)
        if not pattern.search(html):
            raise SystemExit(f"missing markers for figure '{name}'")
        html = pattern.sub(lambda m: f"{m.group(1)}\n      {build()}\n      {m.group(3)}", html)
    PAGE.write_text(html, encoding="utf-8")
    print(f"{len(FIGURES)} figures written to {PAGE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
