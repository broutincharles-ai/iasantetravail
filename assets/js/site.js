const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isEN = document.documentElement.lang.toLowerCase().startsWith('en');
const nav = document.querySelector('.nav');
const menuButton = document.querySelector('.nav-menu-btn');

/* Plausible est chargé uniquement sur les deux pages d’accueil.
   La fonction de file d’attente permet d’enregistrer la page vue
   même si le script externe n’est pas encore entièrement chargé. */
function initHomepageAnalytics(){
 const page=document.body.dataset.page;
 if(page!=='accueil' && page!=='en-home')return;
 const scriptUrl='https://plausible.io/js/pa-7YQqLhsPMI0TxmcCTe7d6.js';
 if(document.querySelector(`script[src="${scriptUrl}"]`))return;

 window.plausible=window.plausible||function(){
  (window.plausible.q=window.plausible.q||[]).push(arguments);
 };
 window.plausible.init=window.plausible.init||function(options){
  window.plausible.o=options||{};
 };
 window.plausible.init();

 const analyticsScript=document.createElement('script');
 analyticsScript.async=true;
 analyticsScript.src=scriptUrl;
 analyticsScript.dataset.analytics='plausible';
 document.head.appendChild(analyticsScript);
}
initHomepageAnalytics();

/* Ordre éditorial commun à toutes les pages :
   Comprendre → Usages → Risques → Évaluer → Droit
   Understand → Uses → Risks → Assess → Law */
function reorderSiteNavigation(){
 const orderedPaths=isEN
  ? ['/en/understand','/en/uses-and-field','/en/risks-prevention','/en/evaluate','/en/legal-governance']
  : ['/comprendre','/usages-terrain','/risques-prevention','/evaluer','/droit-gouvernance'];
 const routeIndex=href=>{
  try{
   const path=new URL(href,document.baseURI).pathname.replace(/\/+$/,'');
   return orderedPaths.indexOf(path);
  }catch{return -1}
 };

 document.querySelectorAll('.nav-links').forEach(container=>{
  const resourceMenu=container.querySelector(':scope > details');
  [...container.querySelectorAll(':scope > a')]
   .map(link=>({link,index:routeIndex(link.getAttribute('href'))}))
   .filter(item=>item.index>=0)
   .sort((a,b)=>a.index-b.index)
   .forEach(({link})=>container.insertBefore(link,resourceMenu||null));
 });

 document.querySelectorAll('footer ul').forEach(list=>{
  const items=[...list.querySelectorAll(':scope > li')];
  const routes=items
   .map(item=>({item,index:routeIndex(item.querySelector(':scope > a')?.getAttribute('href'))}))
   .filter(entry=>entry.index>=0);
  if(routes.length<4)return;
  routes.sort((a,b)=>a.index-b.index).forEach(({item})=>list.appendChild(item));
 });
}
reorderSiteNavigation();

/* Corrige la navigation séquentielle de la page Risques après
   le déplacement d’Évaluer après Risques dans le parcours. */
function fixRiskCycleNavigation(){
 const page=document.body.dataset.page;
 if(page!=='risques' && page!=='en-risks')return;

 const cycle=document.querySelector('.cycle-nav');
 if(!cycle)return;

 const root=document.body.dataset.root||'';
 const leftArrow='<svg aria-hidden="true" fill="none" height="18" viewBox="0 0 16 16" width="18"><path d="M14 8H3M7 3.5 2.5 8 7 12.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg>';
 const rightArrow='<svg aria-hidden="true" fill="none" height="18" viewBox="0 0 16 16" width="18"><path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path></svg>';

 if(isEN){
  cycle.innerHTML=`
   <a class="cycle-card glass" href="${root}en/uses-and-field/">
    ${leftArrow}
    <div>
     <div class="lbl">Previous — Uses &amp; field evidence</div>
     <div class="ttl">Return to workplace uses and field evidence</div>
    </div>
   </a>
   <a class="cycle-card glass next" href="${root}en/evaluate/">
    <div>
     <div class="lbl">Next — Assess</div>
     <div class="ttl">Evaluate before and after deployment</div>
    </div>
    ${rightArrow}
   </a>`;
 }else{
  cycle.innerHTML=`
   <a class="cycle-card glass" href="${root}usages-terrain/">
    ${leftArrow}
    <div>
     <div class="lbl">Précédent — Usages &amp; terrain</div>
     <div class="ttl">Revenir aux usages et aux retours de terrain</div>
    </div>
   </a>
   <a class="cycle-card glass next" href="${root}evaluer/">
    <div>
     <div class="lbl">Suivant — Évaluer</div>
     <div class="ttl">Évaluer avant et après le déploiement</div>
    </div>
    ${rightArrow}
   </a>`;
 }
}
fixRiskCycleNavigation();


/* Export PDF A4 fiable pour les quatre questionnaires Évaluer / Assess.
   Le rapport est reconstruit dans un document dédié de 210 mm afin
   d’éviter les contenus décalés ou coupés et d’y intégrer le radar. */
function initAssessmentPdfExport(){
 const hasPdfButtons=document.querySelector('#printReport,#archivePdf');
 const report=document.getElementById('generatedReport');
 if(!hasPdfButtons||!report)return;

 const HTML2PDF_URL='https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';

 const loadHtml2Pdf=()=>{
  if(typeof window.html2pdf==='function')return Promise.resolve(window.html2pdf);
  if(window.__assessmentPdfLibrary)return window.__assessmentPdfLibrary;

  window.__assessmentPdfLibrary=new Promise((resolve,reject)=>{
   const existing=document.querySelector('script[data-assessment-pdf-library]');
   if(existing){
    existing.addEventListener('load',()=>resolve(window.html2pdf),{once:true});
    existing.addEventListener('error',()=>reject(new Error('Unable to load PDF library')),{once:true});
    return;
   }

   const script=document.createElement('script');
   script.src=HTML2PDF_URL;
   script.async=true;
   script.dataset.assessmentPdfLibrary='true';
   script.onload=()=>typeof window.html2pdf==='function'
    ? resolve(window.html2pdf)
    : reject(new Error('PDF library unavailable after loading'));
   script.onerror=()=>reject(new Error('Unable to load PDF library'));
   document.head.appendChild(script);
  });

  return window.__assessmentPdfLibrary;
 };

 const escapePdfText=value=>String(value||'')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-zA-Z0-9_-]+/g,'-')
  .replace(/^-+|-+$/g,'')
  .toLowerCase();

 const pdfFilename=()=>{
  const path=location.pathname.toLowerCase();
  const followup=path.includes('suivi')||path.includes('follow-up');
  const english=document.documentElement.lang.toLowerCase().startsWith('en');
  const date=document.getElementById(followup?'followupDate':'assessmentDate')?.value
   ||new Date().toISOString().slice(0,10);
  const code=escapePdfText(document.getElementById('projectCode')?.value);
  const suffix=code?`-${code}`:'';

  if(english)return `${followup?'workplace-ai-follow-up':'workplace-ai-assessment'}${suffix}-${date}.pdf`;
  return `${followup?'suivi-impact-ia':'rapport-impact-ia'}${suffix}-${date}.pdf`;
 };

 const pdfCss=`
  @page{size:A4;margin:0}
  html,body{width:210mm;margin:0;padding:0;background:#fff;color:#17140f}
  *{box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased}
  h1,h2,h3{max-width:100%;margin-top:0;overflow-wrap:anywhere;word-break:normal;font-family:Georgia,"Times New Roman",serif}
  p,li,span,strong,b,small{overflow-wrap:anywhere}
  .pdf-page{width:210mm;min-height:297mm;margin:0;padding:10mm 12mm 12mm;background:#fff}
  .generated-report,.report{width:100%!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:#fff!important;overflow:visible!important;transform:none!important}

  /* Couverture française */
  .report-cover{padding:0 0 7mm;border-bottom:1px solid #ddd5c8}
  .report-brandline{display:flex;align-items:center;gap:3mm;margin:0 0 7mm;color:#3d5b52;font-size:7.5pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  .report-brandmark{width:5mm;height:5mm;border-radius:50%;background:#c05f2b}
  .report-type{margin-left:auto;padding:1.5mm 3mm;border:1px solid #ddd5c8;border-radius:99px;color:#625e56;background:#fff}
  .report-cover-grid{display:grid;grid-template-columns:minmax(0,1fr) 48mm;gap:8mm;align-items:end}
  .report-eyebrow{margin:0 0 2mm;color:#c05f2b;font-size:7.5pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  .report-cover h1{margin:0 0 3mm;font-size:25pt!important;line-height:1.06!important;letter-spacing:-.02em!important}
  .report-subtitle{margin:0;color:#625e56;font-size:9.5pt;line-height:1.45}
  .report-id-card{padding:4mm;border:1px solid #ddd5c8;border-radius:4mm;background:#f8f4ed;color:#625e56;font-size:8pt;line-height:1.45}
  .report-id-card strong{display:block;margin-bottom:1.5mm;color:#17140f;font-size:9pt}

  /* Couverture anglaise */
  .cover{padding:0 0 7mm;border-bottom:1px solid #ddd5c8}
  .brand{display:flex;align-items:center;gap:3mm;margin:0 0 7mm;color:#3d5b52;font-size:7.5pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  .mark{width:5mm;height:5mm;border-radius:50%;background:#c05f2b}
  .eyebrow{margin:0 0 2mm;color:#c05f2b;font-size:7.5pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  .cover h1{margin:0 0 3mm;font-size:25pt!important;line-height:1.06!important;letter-spacing:-.02em!important}
  .subtitle{max-width:none;margin:0;color:#625e56;font-size:9.5pt;line-height:1.45}
  .meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2mm;margin-top:5mm}
  .meta div{padding:3mm;border:1px solid #ddd5c8;border-radius:3mm;background:#fff;font-size:8pt}
  .meta strong{display:block;margin-bottom:1mm;color:#625e56;font-size:6.8pt;text-transform:uppercase;letter-spacing:.06em}

  /* Section radar intégrée au PDF */
  .pdf-radar-section{margin:7mm 0 0;padding:6mm;border:1px solid #ddd5c8;border-radius:4mm;background:#fff;break-inside:avoid;page-break-inside:avoid}
  .pdf-radar-kicker{margin:0 0 1.5mm;color:#c05f2b;font-size:7pt;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  .pdf-radar-section h2{margin:0 0 2mm;font-size:17pt;line-height:1.1}
  .pdf-radar-note{margin:0 0 4mm;color:#625e56;font-size:8.5pt;line-height:1.4}
  .pdf-radar-image{display:block;width:145mm;max-width:100%;height:auto;margin:0 auto 4mm}
  .pdf-radar-section .dimension-table{display:grid!important;gap:1.5mm;margin-top:3mm}
  .pdf-radar-section .dimension-row{display:grid;grid-template-columns:minmax(0,1fr) 65mm 12mm;gap:3mm;align-items:center;padding:2mm 2.5mm;border:1px solid #ece6dc;border-radius:2.5mm;background:#fff;font-size:8pt}
  .pdf-radar-section .dimension-row .bar{display:block;height:2mm;border-radius:99px;background:#eee9e1;overflow:hidden}
  .pdf-radar-section .dimension-row .bar i{display:block;height:100%;border-radius:inherit}
  .pdf-radar-section .dimension-row strong{text-align:right;font-family:Georgia,"Times New Roman",serif;font-size:10pt}

  /* Sections françaises */
  .report-section{margin-top:7mm}
  .report-section-heading{display:flex;align-items:flex-start;gap:3mm;margin-bottom:3mm;break-after:avoid;page-break-after:avoid}
  .report-section-number{display:flex;align-items:center;justify-content:center;flex:0 0 8mm;width:8mm;height:8mm;border-radius:50%;background:#17140f;color:#fff;font-size:7pt;font-weight:700}
  .report-section-heading h2{margin:.5mm 0 0;font-size:16.5pt;line-height:1.08}
  .report-section-heading p{margin:0 0 1mm;color:#c05f2b;font-size:7pt;font-weight:700;letter-spacing:.07em;text-transform:uppercase}
  .report-section>p,.report-section li{color:#625e56;font-size:8.5pt;line-height:1.45}
  .report-section ul,.report-section ol{padding-left:5mm}
  .report-summary-grid{display:grid;grid-template-columns:43mm minmax(0,1fr);gap:3mm}
  .report-score-card{position:relative;display:flex;flex-direction:column;justify-content:space-between;min-height:42mm;padding:5mm;border-radius:4mm;background:#17140f;color:#fff;overflow:hidden}
  .report-score-card>span{font-size:7pt;text-transform:uppercase;letter-spacing:.07em;color:rgba(255,255,255,.68)}
  .report-score-card strong{font-family:Georgia,"Times New Roman",serif;font-size:30pt;line-height:1}
  .report-score-card strong small{font-family:Arial,Helvetica,sans-serif;font-size:8pt;color:rgba(255,255,255,.6)}
  .report-score-card b{font-size:8.5pt}
  .report-decision-card{padding:5mm;border:1px solid #ddd5c8;border-radius:4mm;background:#fff}
  .report-decision-card>strong{display:block;margin-bottom:2mm;font-size:10pt}
  .report-decision-card p{margin:0;color:#625e56;font-size:8.5pt;line-height:1.45}
  .report-critical-list,.report-callout{margin-top:3mm;padding:3.5mm 4mm;border-radius:3mm;background:#fff3f1;break-inside:avoid}
  .report-context-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2mm}
  .report-context-item,.timeline-meta div{padding:3mm;border:1px solid #ddd5c8;border-radius:3mm;background:#fff;break-inside:avoid}
  .report-context-item strong,.timeline-meta strong{display:block;margin-bottom:1mm;color:#625e56;font-size:6.5pt;text-transform:uppercase;letter-spacing:.06em}
  .report-context-item span,.timeline-meta span{font-size:8pt;font-weight:700}
  .timeline-meta{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2mm;margin-bottom:3mm}
  .report-score-list{display:grid;gap:2mm}
  .report-score-row{padding:3mm;border:1px solid #ddd5c8;border-radius:3mm;background:#fff;break-inside:avoid}
  .report-score-head{display:flex;justify-content:space-between;gap:3mm;margin-bottom:1.5mm}
  .report-score-head strong{font-size:8pt}
  .report-score-head span{font-family:Georgia,"Times New Roman",serif;font-size:10pt}
  .report-score-bar{height:2mm;border-radius:99px;background:#eee9e1;overflow:hidden}
  .report-score-bar i{display:block;height:100%}
  .report-priority-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2mm;margin:0 0 4mm;padding:0;list-style:none}
  .report-priority-list li{padding:3mm;border:1px solid #ddd5c8;border-radius:3mm;background:#fff;break-inside:avoid}
  .report-actions-title{margin:4mm 0 2mm;font-family:Arial,Helvetica,sans-serif;font-size:7pt;text-transform:uppercase;letter-spacing:.07em}
  .action-timeline{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2mm}
  .action-column{padding:3.5mm;border:1px solid #ddd5c8;border-radius:3mm;background:#fff;break-inside:avoid}
  .action-column h3{margin:0 0 2mm;font-size:11pt}
  .action-column li{font-size:7.5pt}
  .report-role-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2mm}
  .report-role-card{padding:3mm;border:1px solid #ddd5c8;border-radius:3mm;background:#fff;break-inside:avoid}
  .report-role-card strong{font-size:8pt}
  .report-role-card p{margin:1mm 0 0;color:#625e56;font-size:7.5pt;line-height:1.4}
  .report-check-list{display:grid;gap:2mm;margin:0;padding:0;list-style:none}
  .report-check-list li{padding:3mm;border:1px solid #ddd5c8;border-radius:3mm;background:#fff;break-inside:avoid}
  .report-legal{margin-top:7mm;padding:4mm;border-top:1px solid #ddd5c8;border-radius:3mm;background:#f8f5ef;color:#625e56;font-size:7.2pt;line-height:1.4}

  /* Sections anglaises */
  .section{margin-top:7mm}
  .section h2{margin:0 0 3mm;font-size:16.5pt;line-height:1.08}
  .section p,.section li{color:#625e56;font-size:8.5pt;line-height:1.45}
  .summary{display:grid;grid-template-columns:43mm minmax(0,1fr);gap:3mm}
  .score{display:flex;flex-direction:column;justify-content:space-between;min-height:42mm;padding:5mm;border-radius:4mm;background:#17140f;color:#fff}
  .score strong{font-family:Georgia,"Times New Roman",serif;font-size:30pt;line-height:1}
  .decision{padding:5mm;border:1px solid #ddd5c8;border-radius:4mm;background:#fff}
  .critical{margin-top:3mm;padding:3.5mm 4mm;border-left:1.5mm solid #8f2530;background:#fff3f1;break-inside:avoid}
  .context{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2mm}
  .context div{padding:3mm;border:1px solid #ddd5c8;border-radius:3mm;background:#fff;break-inside:avoid}
  .context strong{display:block;margin-bottom:1mm;color:#625e56;font-size:6.5pt;text-transform:uppercase;letter-spacing:.06em}
  .scores{display:grid;gap:2mm}
  .score-row{padding:3mm;border:1px solid #ddd5c8;border-radius:3mm;background:#fff;break-inside:avoid}
  .score-head{display:flex;justify-content:space-between;gap:3mm;margin-bottom:1.5mm}
  .score-head strong{font-size:8pt}
  .score-head span{font-family:Georgia,"Times New Roman",serif;font-size:10pt}
  .bar{height:2mm;border-radius:99px;background:#eee9e1;overflow:hidden}
  .bar i{display:block;height:100%}
  .actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2mm}
  .action{padding:3.5mm;border:1px solid #ddd5c8;border-radius:3mm;background:#fff;break-inside:avoid}
  .action h3{margin:0 0 2mm;font-size:11pt}
  .action li{font-size:7.5pt}
  .limits{margin-top:7mm;padding:4mm;border-top:1px solid #ddd5c8;border-radius:3mm;background:#f8f5ef;color:#625e56;font-size:7.2pt;line-height:1.4}

  .report-cover,.cover,.pdf-radar-section,.report-summary-grid,.summary,.report-context-item,.context div,.report-score-row,.score-row,.action-column,.action,.report-role-card,.report-callout,.report-critical-list,.critical,.report-check-list li,.report-legal,.limits{break-inside:avoid;page-break-inside:avoid}
 `;

 const sanitiseSvg=svg=>{
  const copy=svg.cloneNode(true);
  copy.setAttribute('xmlns','http://www.w3.org/2000/svg');
  copy.setAttribute('width','100%');
  copy.setAttribute('height','auto');
  copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
  copy.querySelectorAll('[aria-labelledby],[aria-describedby]').forEach(node=>{
   node.removeAttribute('aria-labelledby');
   node.removeAttribute('aria-describedby');
  });
  return copy;
 };

 const svgDataUrl=svg=>{
  const xml=new XMLSerializer().serializeToString(sanitiseSvg(svg));
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
 };

 const buildPdfFrame=()=>{
  const clone=report.cloneNode(true);
  clone.removeAttribute('id');

  const radarSvg=document.querySelector('#radarWrap svg');
  const dimensionTable=document.getElementById('dimensionTable');
  if(radarSvg){
   const section=document.createElement('section');
   section.className='pdf-radar-section';

   const kicker=document.createElement('p');
   kicker.className='pdf-radar-kicker';
   kicker.textContent=isEN?'Risk profile':'Profil de vigilance';

   const title=document.createElement('h2');
   title.textContent=isEN
    ? 'Nine-dimension radar profile'
    : 'Cartographie radar des neuf dimensions';

   const note=document.createElement('p');
   note.className='pdf-radar-note';
   note.textContent=isEN
    ? 'A larger surface indicates a higher estimated level of risk or insufficient safeguards.'
    : 'Une surface plus étendue indique un niveau de vigilance plus élevé ou des garde-fous insuffisants.';

   const image=document.createElement('img');
   image.className='pdf-radar-image';
   image.alt=isEN?'Radar chart of the nine assessment dimensions':'Graphique radar des neuf dimensions évaluées';
   image.src=svgDataUrl(radarSvg);

   section.append(kicker,title,note,image);

   if(dimensionTable?.innerHTML.trim()){
    const values=dimensionTable.cloneNode(true);
    values.removeAttribute('id');
    values.hidden=false;
    values.removeAttribute('hidden');
    section.appendChild(values);
   }

   const target=clone.querySelector('.report')||clone;
   const cover=target.querySelector('.report-cover,.cover');
   if(cover)cover.insertAdjacentElement('afterend',section);
   else target.prepend(section);
  }

  const iframe=document.createElement('iframe');
  iframe.title=isEN?'PDF generation document':'Document de génération PDF';
  iframe.style.cssText='position:fixed;left:-12000px;top:0;width:210mm;height:297mm;border:0;background:#fff;pointer-events:none;';
  document.body.appendChild(iframe);

  const doc=iframe.contentDocument;
  doc.open();
  doc.write(`<!doctype html><html lang="${isEN?'en':'fr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${pdfCss}</style></head><body><main class="pdf-page">${clone.outerHTML}</main></body></html>`);
  doc.close();

  return {iframe,doc,root:doc.querySelector('.pdf-page')};
 };

 const waitForAssets=async doc=>{
  if(doc.fonts?.ready){
   try{await doc.fonts.ready}catch{}
  }
  const images=[...doc.images];
  await Promise.all(images.map(image=>image.complete
   ? Promise.resolve()
   : new Promise(resolve=>{
      image.addEventListener('load',resolve,{once:true});
      image.addEventListener('error',resolve,{once:true});
     })
  ));
  await new Promise(resolve=>setTimeout(resolve,120));
 };

 const fallbackPrint=({iframe,doc})=>{
  const cleanup=()=>setTimeout(()=>iframe.remove(),500);
  iframe.contentWindow.addEventListener('afterprint',cleanup,{once:true});
  doc.title=pdfFilename().replace(/\.pdf$/i,'');
  iframe.contentWindow.focus();
  iframe.contentWindow.print();
  setTimeout(cleanup,30000);
 };

 const generatePdf=async button=>{
  if(!report.innerHTML.trim()){
   alert(isEN
    ? 'Complete the questionnaire before generating the PDF.'
    : 'Terminez le questionnaire avant de générer le PDF.');
   return;
  }

  const originalText=button.textContent;
  button.disabled=true;
  button.setAttribute('aria-busy','true');
  button.textContent=isEN?'Generating PDF…':'Génération du PDF…';

  const frame=buildPdfFrame();

  try{
   await waitForAssets(frame.doc);
   const html2pdf=await loadHtml2Pdf();

   await html2pdf()
    .set({
     margin:0,
     filename:pdfFilename(),
     image:{type:'jpeg',quality:.98},
     html2canvas:{
      scale:2,
      useCORS:true,
      allowTaint:false,
      backgroundColor:'#ffffff',
      logging:false,
      scrollX:0,
      scrollY:0,
      windowWidth:Math.max(frame.root.scrollWidth,794),
      width:frame.root.scrollWidth
     },
     jsPDF:{
      unit:'mm',
      format:'a4',
      orientation:'portrait',
      compress:true
     },
     pagebreak:{
      mode:['css','legacy'],
      avoid:[
       '.report-cover','.cover','.pdf-radar-section',
       '.report-summary-grid','.summary',
       '.report-context-item','.context div',
       '.report-score-row','.score-row',
       '.action-column','.action',
       '.report-role-card','.report-callout',
       '.report-critical-list','.critical',
       '.report-check-list li'
      ]
     }
    })
    .from(frame.root)
    .save();

   frame.iframe.remove();
  }catch(error){
   console.error('Direct PDF generation failed; opening the print fallback.',error);
   fallbackPrint(frame);
  }finally{
   button.disabled=false;
   button.removeAttribute('aria-busy');
   button.textContent=originalText;
  }
 };

 document.addEventListener('click',event=>{
  const button=event.target.closest('#printReport,#archivePdf');
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  generatePdf(button);
 },true);
}
initAssessmentPdfExport();

function closeMenu(){ if(!nav||!menuButton)return; nav.classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false'); }
menuButton?.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',open?'true':'false');});
document.querySelectorAll('#navLinks a').forEach(a=>a.addEventListener('click',closeMenu));
window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();document.getElementById('siteSearch')?.close();}});
window.addEventListener('resize',()=>{if(innerWidth>1240)closeMenu();});

const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');revealObserver.unobserve(e.target);}}),{threshold:.08}) : null;
document.querySelectorAll('.reveal').forEach(el=>revealObserver?revealObserver.observe(el):el.classList.add('in'));
setTimeout(()=>document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in')),250);

const back=document.getElementById('backToTop');
window.addEventListener('scroll',()=>back?.classList.toggle('show',scrollY>700),{passive:true});
back?.addEventListener('click',()=>scrollTo({top:0,behavior:reduced?'auto':'smooth'}));

function initCarousel(){
 const carousel=document.getElementById('artCarousel'); if(!carousel)return;
 const slides=[...carousel.querySelectorAll('.art-slide')], shell=carousel.closest('.art-carousel-shell');
 const prev=shell?.querySelector('.art-prev'),next=shell?.querySelector('.art-next'),dots=[...(shell?.querySelectorAll('.art-dot')||[])];
 const counter=shell?.querySelector('.art-counter'),title=shell?.querySelector('.art-current-title'),meta=shell?.querySelector('.art-current-meta'); let active=0,raf=0;
 const paint=i=>{active=Math.max(0,Math.min(i,slides.length-1));dots.forEach((d,n)=>d.setAttribute('aria-current',n===active?'true':'false'));if(counter)counter.textContent=`${active+1} / ${slides.length}`;if(title)title.textContent=slides[active]?.dataset.artTitle||'';if(meta)meta.textContent=slides[active]?.dataset.artMeta||'';if(prev)prev.disabled=active===0;if(next)next.disabled=active===slides.length-1;};
 const nearest=()=>slides.reduce((best,s,i)=>Math.abs(s.offsetLeft-carousel.scrollLeft)<best.d?{i,d:Math.abs(s.offsetLeft-carousel.scrollLeft)}:best,{i:0,d:Infinity}).i;
 const go=i=>{i=Math.max(0,Math.min(i,slides.length-1));carousel.scrollTo({left:slides[i].offsetLeft,behavior:reduced?'auto':'smooth'});paint(i)};
 carousel.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>paint(nearest()))},{passive:true});
 carousel.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(active+1)}if(e.key==='ArrowLeft'){e.preventDefault();go(active-1)}if(e.key==='Home'){e.preventDefault();go(0)}if(e.key==='End'){e.preventDefault();go(slides.length-1)}});
 prev?.addEventListener('click',()=>go(active-1));next?.addEventListener('click',()=>go(active+1));dots.forEach((d,i)=>d.addEventListener('click',()=>go(i)));paint(0);
}
initCarousel();

// Recherche locale : aucun contenu de recherche n'est envoyé à un tiers.
const dialog=document.getElementById('siteSearch'),openSearch=document.querySelector('.search-open'),closeSearch=document.querySelector('.search-close'),input=document.getElementById('searchInput'),results=document.getElementById('searchResults');
openSearch?.addEventListener('click',()=>{dialog?.showModal();setTimeout(()=>input?.focus(),30)});closeSearch?.addEventListener('click',()=>dialog?.close());
function norm(s){return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function renderSearch(q){if(!results)return;const query=norm(q).trim();if(query.length<2){results.innerHTML=`<p class="search-empty">${isEN?'Enter at least two characters.':'Saisissez au moins deux caractères.'}</p>`;return;}const terms=query.split(/\s+/);const items=(window.SEARCH_INDEX||[]).map(x=>{const hay=norm(`${x.title} ${x.description} ${x.keywords}`);return {...x,score:terms.reduce((s,t)=>s+(hay.includes(t)?1:0),0)}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,12);results.innerHTML=items.length?items.map(x=>`<a class="search-result" href="${document.body.dataset.root||''}${x.url}"><strong>${x.title}</strong><span>${x.description}</span></a>`).join(''):`<p class="search-empty">${isEN?'No results. Try a broader term.':'Aucun résultat. Essayez un terme plus général.'}</p>`;}
input?.addEventListener('input',e=>renderSearch(e.target.value));

// Préserve les anciens liens par fragment vers les nouvelles URL.
if(document.body.dataset.page==='accueil' && location.hash){const m={comprendre:'comprendre/',pratique:'usages-terrain/',terrain:'usages-terrain/#retours-terrain',evaluer:'evaluer/',modeles:'ressources/modeles/',risques:'risques-prevention/',legislation:'droit-gouvernance/',apropos:'a-propos/',mentions:'mentions-legales/',confidentialite:'confidentialite/'};const raw=decodeURIComponent(location.hash.slice(1));const owner=Object.keys(m).find(k=>raw===k||raw.startsWith(k+'-'));if(owner){const target=m[owner]+(raw!==owner&&!m[owner].includes('#')?'#'+raw:'');location.replace(target);}}
