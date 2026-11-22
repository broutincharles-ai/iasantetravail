"""Build metadata-only sharing images with the site's fonts and colours (requires Pillow)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT = Path(__file__).resolve().parents[1]
SCALE = 2
FONT = ROOT / 'assets/fonts'
def font(name, size): return ImageFont.truetype(str(FONT / name), size * SCALE)
# Site card, shared by every page without a card of its own: the name and the tagline of the site header.
site = {
 'site-fr': ('IA & Santé au Travail', 'Initiative indépendante de sécurité de l’IA'),
 'site-en': ('AI & Occupational Health', 'Independent AI safety initiative'),
}
cards = {
 'inrs-fr': ('IA & Santé au Travail', 'PUBLICATIONS · ÉTUDE INRS', ['IA et préconisations', 'médicales'], 'Méthode, résultats et limites · Juin 2026'),
 'inrs-en': ('AI & Occupational Health', 'PUBLICATIONS · INRS STUDY', ['AI and medical', 'recommendations'], 'Methods, findings and limitations · June 2026'),
 'llm-fr': ('IA & Santé au Travail', 'PUBLICATIONS · REVUE GÉNÉRALE', ['LLM et risques', 'psychosociaux au travail'], 'Cadre d’analyse et prévention · Août 2025'),
 'llm-en': ('AI & Occupational Health', 'PUBLICATIONS · NARRATIVE REVIEW', ['LLMs and psychosocial', 'risks at work'], 'Analytical framework and prevention · August 2025'),
 'preprint-fr': ('IA & Santé au Travail', 'PUBLICATIONS · PREPRINT', ['Santé au travail et', 'sécurité de l’IA frontière'], '39 témoignages, grille Gollac, 10 incidents · Octobre 2026'),
 'preprint-en': ('AI & Occupational Health', 'PUBLICATIONS · PREPRINT', ['Occupational health and', 'frontier AI safety'], '39 testimonies, Gollac framework, 10 incidents · October 2026'),
}
output = ROOT / 'assets/images/social'
output.mkdir(parents=True, exist_ok=True)
# Site logo (favicon artwork cropped to its disc, faint drop shadow removed).
disc = Image.open(ROOT / 'assets/images/favicon-512.png').convert('RGBA')
disc.putalpha(disc.getchannel('A').point(lambda a: a if a > 24 else 0))
disc = disc.crop(disc.getchannel('A').getbbox())
def logo(size): return disc.resize((size*SCALE,size*SCALE),Image.Resampling.LANCZOS)

# Site card: the logo, the name and the tagline, stacked and centred. The name is set with a tight
# letter-spacing, as in the header, at the largest size that leaves 80 px on each side (the
# English name is longer than the French one).
def spaced(value, face, spacing=-0.012):
 """Pen position of each character, and the total width, with kerning and letter-spacing (in em)."""
 pens, x = [], 0
 for i in range(len(value)):
  pens.append(x); x += face.getlength(value[i:i+2]) - face.getlength(value[i+1:i+2]) + spacing*face.size
 return pens, x - spacing*face.size
for name, (brand, tagline) in site.items():
 im = Image.new('RGB', (1200*SCALE,630*SCALE), '#f3efe6'); d=ImageDraw.Draw(im)
 size = 100
 while spaced(brand, font('newsreader-500.ttf',size))[1] > 1040*SCALE: size -= 2
 title, line, mark = font('newsreader-500.ttf',size), font('instrument-sans-400.ttf',42), logo(150)
 pens, width = spaced(brand, title)
 # Heights of the inked text, so that the three elements sit in the middle of the image: 40 px
 # between the logo and the name, 32 px between the baseline of the name and the tagline.
 top, base, (_,line_top,_,line_bottom) = title.getbbox(brand)[1], title.getmetrics()[0], line.getbbox(tagline)
 y = (630*SCALE - (150+40+32)*SCALE - (base-top) - (line_bottom-line_top)) // 2
 im.paste(mark,((1200-150)*SCALE//2,y),mark); y += (150+40)*SCALE - top
 for char, pen in zip(brand, pens): d.text(((1200*SCALE-width)/2+pen,y),char,font=title,fill='#171a18')
 y += base + 32*SCALE - line_top
 d.text((600*SCALE,y),tagline,font=line,fill='#3f443f',anchor='ma')
 im.resize((1200,630),Image.Resampling.LANCZOS).save(output/(name+'.png'),optimize=True)

# Publication cards: the logo left of the brand name, then a label, a title and a subtitle.
small = logo(48)
for name, (brand, label, lines, subtitle) in cards.items():
 im = Image.new('RGB', (1200*SCALE,630*SCALE), '#f3efe6'); d=ImageDraw.Draw(im)
 def text(x,y,value,size=24,color='#171a18',family='instrument-sans-500.ttf'):
  d.text((x*SCALE,y*SCALE),value,font=font(family,size),fill=color)
 im.paste(small,(64*SCALE,54*SCALE),small)
 text(128,65,brand,32,family='newsreader-500.ttf')
 d.line((64*SCALE,140*SCALE,1136*SCALE,140*SCALE),fill='#c4bfb5',width=SCALE)
 text(64,179,label,17,'#87301f')
 for i,line in enumerate(lines):text(62,230+i*77,line,60)
 text(64,416,subtitle,24,'#5b615b',family='instrument-sans-400.ttf')
 d.line((64*SCALE,525*SCALE,1136*SCALE,525*SCALE),fill='#c4bfb5',width=SCALE)
 text(64,550,'Dr Charles Broutin',21)
 text(860,550,'iasantetravail.com',21,'#87301f')
 im.resize((1200,630),Image.Resampling.LANCZOS).save(output/(name+'.png'),optimize=True)
print(f'Built {len(site) + len(cards)} social cards.')
