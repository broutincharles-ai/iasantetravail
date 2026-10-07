"""Build metadata-only sharing images with the site's fonts and colours (requires Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[1]
SCALE = 2
FONT = ROOT / 'assets/fonts'
def font(name, size): return ImageFont.truetype(str(FONT / name), size * SCALE)
cards = {
 'site-fr': ('IA & Santé au Travail', 'PUBLICATION INDÉPENDANTE', ['Comprendre l’IA.', 'Préserver la santé au travail.'], 'Repères, recherche et prévention'),
 'site-en': ('AI & Occupational Health', 'INDEPENDENT PUBLICATION', ['Understanding AI.', 'Protecting health at work.'], 'Evidence, research and prevention'),
 'inrs-fr': ('IA & Santé au Travail', 'PUBLICATIONS · ÉTUDE INRS', ['IA et préconisations', 'médicales'], 'Méthode, résultats et limites · Juin 2026'),
 'inrs-en': ('AI & Occupational Health', 'PUBLICATIONS · INRS STUDY', ['AI and medical', 'recommendations'], 'Methods, findings and limitations · June 2026'),
 'llm-fr': ('IA & Santé au Travail', 'PUBLICATIONS · REVUE GÉNÉRALE', ['LLM et risques', 'psychosociaux au travail'], 'Cadre d’analyse et prévention · Août 2025'),
 'llm-en': ('AI & Occupational Health', 'PUBLICATIONS · NARRATIVE REVIEW', ['LLMs and psychosocial', 'risks at work'], 'Analytical framework and prevention · August 2025'),
 'preprint-fr': ('IA & Santé au Travail', 'PUBLICATIONS · PREPRINT', ['Santé au travail et', 'sécurité de l’IA frontière'], '39 témoignages, grille Gollac, 10 incidents · Octobre 2026'),
 'preprint-en': ('AI & Occupational Health', 'PUBLICATIONS · PREPRINT', ['Occupational health and', 'frontier AI safety'], '39 testimonies, Gollac framework, 10 incidents · October 2026'),
}
output = ROOT / 'assets/images/social'
output.mkdir(parents=True, exist_ok=True)
# Site logo (favicon artwork cropped to its disc, faint drop shadow removed), left of the brand name.
logo = Image.open(ROOT / 'assets/images/favicon-512.png').convert('RGBA')
logo.putalpha(logo.getchannel('A').point(lambda a: a if a > 24 else 0))
logo = logo.crop(logo.getchannel('A').getbbox()).resize((48*SCALE,48*SCALE),Image.Resampling.LANCZOS)
for name, (brand, label, lines, subtitle) in cards.items():
 im = Image.new('RGB', (1200*SCALE,630*SCALE), '#f3efe6'); d=ImageDraw.Draw(im)
 def text(x,y,value,size=24,color='#171a18',family='instrument-sans-500.ttf'):
  d.text((x*SCALE,y*SCALE),value,font=font(family,size),fill=color)
 im.paste(logo,(64*SCALE,54*SCALE),logo)
 text(128,65,brand,32,family='newsreader-500.ttf')
 d.line((64*SCALE,140*SCALE,1136*SCALE,140*SCALE),fill='#c4bfb5',width=SCALE)
 text(64,179,label,17,'#87301f')
 for i,line in enumerate(lines):text(62,230+i*77,line,60)
 text(64,416,subtitle,24,'#5b615b',family='instrument-sans-400.ttf')
 d.line((64*SCALE,525*SCALE,1136*SCALE,525*SCALE),fill='#c4bfb5',width=SCALE)
 text(64,550,'Dr Charles Broutin',21)
 text(860,550,'iasantetravail.com',21,'#87301f')
 im.resize((1200,630),Image.Resampling.LANCZOS).save(output/(name+'.png'),optimize=True)
print(f'Built {len(cards)} social cards.')
