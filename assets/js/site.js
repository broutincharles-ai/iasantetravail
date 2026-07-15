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
 const report=document.getElementById('generatedReport');
 if(!document.querySelector('#printReport,#archivePdf')||!report)return;

 const JSPDF_URL='https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
 const language=document.documentElement.lang.toLowerCase().startsWith('en')?'en':'fr';
 const followup=/suivi|follow-up/i.test(location.pathname);

 const copy=language==='en'
  ? {
     generating:'Generating PDF…',
     incomplete:'Complete the questionnaire before generating the PDF.',
     brand:'AI & Occupational Health',
     reportType:followup?'Post-deployment follow-up':'Pre-deployment assessment',
     decision:'Decision summary',
     context:'Declared context',
     profile:'Nine-dimension profile',
     profileNote:'A larger surface indicates a higher level of risk or insufficient safeguards.',
     dimensions:'Dimension scores',
     actions:'Priority prevention actions',
     conditions:'Minimum collective-prevention conditions',
     limitations:'Status and limitations',
     assessmentDate:'Assessment date',
     generated:'Generated',
     page:'Page'
    }
  : {
     generating:'Génération du PDF…',
     incomplete:'Terminez le questionnaire avant de générer le PDF.',
     brand:'IA & Santé au Travail',
     reportType:followup?'Suivi après déploiement':'Évaluation avant déploiement',
     decision:'Synthèse décisionnelle',
     context:'Contexte déclaré',
     profile:'Profil radar des neuf dimensions',
     profileNote:'Une surface plus étendue indique un niveau de vigilance plus élevé ou des garde-fous insuffisants.',
     dimensions:'Scores par dimension',
     actions:'Actions de prévention prioritaires',
     conditions:'Conditions minimales de prévention collective',
     limitations:'Statut et limites',
     assessmentDate:"Date de l'évaluation",
     generated:'Généré le',
     page:'Page'
    };

 const loadJsPdf=()=>{
  if(window.jspdf?.jsPDF)return Promise.resolve(window.jspdf.jsPDF);
  if(window.__assessmentJsPdf)return window.__assessmentJsPdf;

  window.__assessmentJsPdf=new Promise((resolve,reject)=>{
   const existing=document.querySelector('script[data-assessment-jspdf]');
   if(existing){
    existing.addEventListener('load',()=>resolve(window.jspdf?.jsPDF),{once:true});
    existing.addEventListener('error',()=>reject(new Error('Unable to load jsPDF')),{once:true});
    return;
   }
   const script=document.createElement('script');
   script.src=JSPDF_URL;
   script.async=true;
   script.dataset.assessmentJspdf='true';
   script.onload=()=>window.jspdf?.jsPDF
    ? resolve(window.jspdf.jsPDF)
    : reject(new Error('jsPDF unavailable after loading'));
   script.onerror=()=>reject(new Error('Unable to load jsPDF'));
   document.head.appendChild(script);
  });
  return window.__assessmentJsPdf;
 };

 const normalise=value=>String(value??'')
  .replace(/\u00a0/g,' ')
  .replace(/[“”]/g,'"')
  .replace(/[‘’]/g,"'")
  .replace(/[–—]/g,'-')
  .replace(/…/g,'...')
  .replace(/\s+/g,' ')
  .trim();

 const slug=value=>normalise(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-zA-Z0-9_-]+/g,'-')
  .replace(/^-+|-+$/g,'')
  .toLowerCase();

 const readLabelValue=node=>{
  const labelNode=node.querySelector('strong,b,dt');
  const label=normalise(labelNode?.textContent);
  const clone=node.cloneNode(true);
  clone.querySelector('strong,b,dt')?.remove();
  const value=normalise(clone.textContent);
  return label&&value?[label,value]:null;
 };

 const findSection=pattern=>[...report.querySelectorAll('section')]
  .find(section=>pattern.test(normalise(section.querySelector('h2,h3')?.textContent)));

 const contextEntries=()=>{
  const section=findSection(/context|contexte/i);
  if(!section)return [];
  const nodes=[...section.querySelectorAll('.context > div,.report-context-item,.timeline-meta > div')];
  return nodes.map(readLabelValue).filter(Boolean);
 };

 const dimensionEntries=()=>{
  const rows=[...document.querySelectorAll('#dimensionTable .dimension-row')];
  if(rows.length){
   return rows.map(row=>{
    const label=normalise(row.querySelector('span')?.textContent);
    const score=Number(normalise(row.querySelector('strong')?.textContent).replace(/[^0-9.-]/g,''));
    return {label,score:Number.isFinite(score)?score:0};
   }).filter(item=>item.label);
  }

  return [...report.querySelectorAll('.score-row,.report-score-row')].map(row=>{
   const label=normalise(row.querySelector('.score-head strong,.report-score-head strong,strong')?.textContent);
   const score=Number(normalise(row.querySelector('.score-head span,.report-score-head span')?.textContent).replace(/[^0-9.-]/g,''));
   return {label,score:Number.isFinite(score)?score:0};
  }).filter(item=>item.label);
 };

 const actionGroups=()=>{
  const section=findSection(/priority|priorit|plan d.?action|actions de prevention/i);
  if(!section)return [];
  const cards=[...section.querySelectorAll('.action,.action-column')];
  if(cards.length){
   return cards.map(card=>({
    title:normalise(card.querySelector('h3,strong')?.textContent),
    items:[...card.querySelectorAll('li')].map(li=>normalise(li.textContent)).filter(Boolean)
   })).filter(group=>group.title||group.items.length);
  }
  const items=[...section.querySelectorAll('li')].map(li=>normalise(li.textContent)).filter(Boolean);
  return items.length?[{title:copy.actions,items}]:[];
 };

 const minimumConditions=()=>{
  const section=[...report.querySelectorAll('section')].find(candidate=>{
   const heading=normalise(candidate.querySelector('h2,h3')?.textContent);
   return /minimum|conditions minimales|collective-prevention|prevention collective/i.test(heading);
  });
  return section?[...section.querySelectorAll('li')].map(li=>normalise(li.textContent)).filter(Boolean):[];
 };

 const filename=()=>{
  const date=document.getElementById(followup?'followupDate':'assessmentDate')?.value
   ||new Date().toISOString().slice(0,10);
  const code=slug(document.getElementById('projectCode')?.value);
  const suffix=code?`-${code}`:'';
  if(language==='en')return `${followup?'workplace-ai-follow-up':'workplace-ai-assessment'}${suffix}-${date}.pdf`;
  return `${followup?'suivi-impact-ia':'rapport-impact-ia'}${suffix}-${date}.pdf`;
 };

 const collectData=()=>{
  const title=normalise(report.querySelector('h1')?.textContent)
   ||normalise(document.querySelector('.intro-copy h1')?.textContent)
   ||copy.reportType;
  const subtitle=normalise(report.querySelector('.subtitle,.report-subtitle')?.textContent);
  const decisionTitle=normalise(report.querySelector('.decision > strong,.report-decision-card > strong')?.textContent);
  const score=normalise(document.getElementById('overallScore')?.textContent)||'0';
  const level=normalise(document.getElementById('overallLevel')?.textContent);
  const summary=normalise(document.getElementById('resultSummary')?.textContent)
   ||normalise(report.querySelector('.decision p,.report-decision-card p')?.textContent);
  const critical=[...document.querySelectorAll('#criticalAlerts li')]
   .map(li=>normalise(li.textContent)).filter(Boolean);
  const dateValue=document.getElementById(followup?'followupDate':'assessmentDate')?.value;
  const assessmentDate=dateValue
   ? new Intl.DateTimeFormat(language==='en'?'en-GB':'fr-FR',{dateStyle:'long'}).format(new Date(`${dateValue}T12:00:00`))
   : '';
  const limitations=normalise(report.querySelector('.limits,.report-legal')?.textContent);
  return {
   title,subtitle,decisionTitle,score,level,summary,critical,assessmentDate,limitations,
   context:contextEntries(),
   dimensions:dimensionEntries(),
   actions:actionGroups(),
   conditions:minimumConditions()
  };
 };

 const createPdf=async()=>{
  const JsPDF=await loadJsPdf();
  const data=collectData();
  const doc=new JsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});

  const PAGE_W=210;
  const PAGE_H=297;
  const M=16;
  const CONTENT_W=PAGE_W-(M*2);
  const TOP=18;
  const BOTTOM=18;
  const palette={
   ink:[24,20,15],
   muted:[96,89,78],
   line:[221,213,200],
   paper:[255,253,249],
   warm:[248,244,237],
   terra:[192,95,43],
   terraLight:[249,232,222],
   green:[61,91,82],
   lavender:[228,224,247],
   danger:[143,37,48],
   dangerLight:[255,242,241],
   white:[255,255,255]
  };

  let y=TOP;

  const setText=(font='helvetica',style='normal',size=10,color=palette.ink)=>{
   doc.setFont(font,style);
   doc.setFontSize(size);
   doc.setTextColor(...color);
  };

  const split=(text,width)=>doc.splitTextToSize(normalise(text),width);

  const textBlock=(text,x,width,opts={})=>{
   const {font='helvetica',style='normal',size=9.5,color=palette.ink,lineHeight=1.3,align='left'}=opts;
   setText(font,style,size,color);
   const lines=split(text,width);
   doc.text(lines,x,y,{baseline:'top',lineHeightFactor:lineHeight,align});
   y+=lines.length*size*0.3528*lineHeight;
   return lines.length;
  };

  const ensureSpace=height=>{
   if(y+height>PAGE_H-BOTTOM){
    doc.addPage();
    y=TOP;
   }
  };

  const sectionHeading=title=>{
   ensureSpace(15);
   setText('times','bold',18,palette.ink);
   doc.text(normalise(title),M,y,{baseline:'top'});
   y+=8;
   doc.setDrawColor(...palette.terra);
   doc.setLineWidth(1.1);
   doc.line(M,y,M+CONTENT_W,y);
   y+=7;
  };

  const bulletList=(items,x,width,opts={})=>{
   const size=opts.size||9;
   const color=opts.color||palette.muted;
   items.forEach(item=>{
    const lines=split(item,width-7);
    const height=Math.max(6,lines.length*size*0.3528*1.3);
    ensureSpace(height+2);
    doc.setFillColor(...palette.terra);
    doc.circle(x+1.2,y+2.5,1.05,'F');
    setText('helvetica','normal',size,color);
    doc.text(lines,x+5,y,{baseline:'top',lineHeightFactor:1.3});
    y+=height+2;
   });
  };

  const roundedCard=(x,top,width,height,fill=palette.white,stroke=palette.line,radius=3)=>{
   doc.setFillColor(...fill);
   doc.setDrawColor(...stroke);
   doc.setLineWidth(.35);
   doc.roundedRect(x,top,width,height,radius,radius,'FD');
  };

  const labelValueCard=(x,top,width,label,value)=>{
   const labelLines=split(label,width-8);
   const valueLines=split(value,width-8);
   const height=8+(labelLines.length*2.6)+(valueLines.length*3.5);
   roundedCard(x,top,width,height,palette.white,palette.line,2.5);
   setText('helvetica','bold',7,palette.muted);
   doc.text(labelLines,x+4,top+4,{baseline:'top',lineHeightFactor:1.1});
   setText('helvetica','bold',9,palette.ink);
   doc.text(valueLines,x+4,top+8+(labelLines.length*2.3),{baseline:'top',lineHeightFactor:1.2});
   return height;
  };

  const drawRadar=(items,centerX,centerY,radius)=>{
   const n=items.length;
   if(!n)return;
   const point=(index,factor)=>{
    const angle=-Math.PI/2+(index*2*Math.PI/n);
    return {x:centerX+Math.cos(angle)*radius*factor,y:centerY+Math.sin(angle)*radius*factor,angle};
   };

   doc.setLineWidth(.25);
   for(let ring=1;ring<=5;ring++){
    const factor=ring/5;
    doc.setDrawColor(...palette.line);
    for(let i=0;i<n;i++){
     const a=point(i,factor);
     const b=point((i+1)%n,factor);
     doc.line(a.x,a.y,b.x,b.y);
    }
   }

   for(let i=0;i<n;i++){
    const edge=point(i,1);
    doc.setDrawColor(232,226,216);
    doc.line(centerX,centerY,edge.x,edge.y);
   }

   const dataPoints=items.map((item,index)=>point(index,Math.max(0,Math.min(100,item.score))/100));
   if(dataPoints.length>=3){
    const vectors=[];
    for(let i=1;i<dataPoints.length;i++){
     vectors.push([dataPoints[i].x-dataPoints[i-1].x,dataPoints[i].y-dataPoints[i-1].y]);
    }
    doc.setFillColor(244,205,181);
    doc.setDrawColor(...palette.terra);
    doc.setLineWidth(.8);
    doc.lines(vectors,dataPoints[0].x,dataPoints[0].y,[1,1],'FD',true);
    dataPoints.forEach(pointValue=>{
     doc.setFillColor(...palette.terra);
     doc.setDrawColor(...palette.white);
     doc.circle(pointValue.x,pointValue.y,1.25,'FD');
    });
   }

   items.forEach((item,index)=>{
    const labelPoint=point(index,1.24);
    const cos=Math.cos(labelPoint.angle);
    const align=cos>.25?'left':cos<-.25?'right':'center';
    const width=32;
    const labelLines=split(item.label,width);
    setText('helvetica','normal',7.2,palette.ink);
    doc.text(labelLines,labelPoint.x,labelPoint.y-(labelLines.length-1)*2.3,{align,baseline:'middle',lineHeightFactor:1.05});
    setText('helvetica','bold',7.2,palette.terra);
    doc.text(`${Math.round(item.score)}/100`,labelPoint.x,labelPoint.y+(labelLines.length*2.4),{align,baseline:'middle'});
   });
  };

  const drawDimensionGrid=(items)=>{
   const columns=2;
   const gap=5;
   const cardW=(CONTENT_W-gap)/columns;
   const rowH=12;
   items.forEach((item,index)=>{
    const column=index%columns;
    const row=Math.floor(index/columns);
    const x=M+column*(cardW+gap);
    const top=y+row*(rowH+3);
    roundedCard(x,top,cardW,rowH,palette.white,palette.line,2.2);
    setText('helvetica','bold',7.6,palette.ink);
    const labelLines=split(item.label,cardW-26);
    doc.text(labelLines,x+4,top+3.2,{baseline:'top',lineHeightFactor:1.05});
    setText('times','bold',11,palette.terra);
    doc.text(`${Math.round(item.score)}`,x+cardW-4,top+3.6,{align:'right',baseline:'top'});
    const barX=x+4;
    const barY=top+9.2;
    const barW=cardW-8;
    doc.setFillColor(238,233,225);
    doc.roundedRect(barX,barY,barW,1.6,.8,.8,'F');
    doc.setFillColor(...palette.terra);
    doc.roundedRect(barX,barY,barW*Math.max(0,Math.min(100,item.score))/100,1.6,.8,.8,'F');
   });
   const rows=Math.ceil(items.length/columns);
   y+=rows*(rowH+3);
  };

  /* Page 1 — cover and decision */
  doc.setFillColor(...palette.paper);
  doc.rect(0,0,PAGE_W,PAGE_H,'F');

  doc.setFillColor(...palette.terra);
  doc.circle(M+2.5,y+2.5,2.5,'F');
  setText('helvetica','bold',8,palette.green);
  doc.text(copy.brand.toUpperCase(),M+8,y+3.8);
  setText('helvetica','bold',7,palette.muted);
  doc.text(copy.reportType.toUpperCase(),M+CONTENT_W,y+3.8,{align:'right'});
  y+=13;

  setText('times','bold',27,palette.ink);
  const titleLines=split(data.title,CONTENT_W);
  doc.text(titleLines,M,y,{baseline:'top',lineHeightFactor:1.02});
  y+=titleLines.length*27*0.3528*1.02+3;

  if(data.subtitle){
   textBlock(data.subtitle,M,CONTENT_W,{size:9.5,color:palette.muted,lineHeight:1.35});
   y+=4;
  }

  const generatedDate=new Intl.DateTimeFormat(language==='en'?'en-GB':'fr-FR',{
   dateStyle:'long',timeStyle:'short'
  }).format(new Date());
  const metaTop=y;
  const metaGap=4;
  const metaW=(CONTENT_W-metaGap)/2;
  const leftMeta=data.assessmentDate||'-';
  labelValueCard(M,metaTop,metaW,copy.assessmentDate,leftMeta);
  labelValueCard(M+metaW+metaGap,metaTop,metaW,copy.generated,generatedDate);
  y=metaTop+21;

  sectionHeading(copy.decision);

  const scoreCardW=50;
  const decisionGap=5;
  const decisionW=CONTENT_W-scoreCardW-decisionGap;
  const decisionTop=y;
  const decisionBody=[data.decisionTitle,data.summary].filter(Boolean);
  const decisionLines=decisionBody.flatMap((item,index)=>split(item,decisionW-10));
  const criticalLines=data.critical.flatMap(item=>split(item,decisionW-13));
  const decisionH=Math.max(45,20+(decisionLines.length*4)+(criticalLines.length*4.3)+(data.critical.length?8:0));

  doc.setFillColor(...palette.ink);
  doc.roundedRect(M,decisionTop,scoreCardW,decisionH,4,4,'F');
  doc.setFillColor(...palette.terra);
  doc.rect(M,decisionTop,scoreCardW,2.2,'F');
  setText('helvetica','normal',7.5,[220,215,207]);
  doc.text(language==='en'?'OVERALL SCORE':'SCORE GLOBAL',M+5,decisionTop+8);
  setText('times','bold',31,palette.white);
  doc.text(data.score,M+5,decisionTop+20);
  setText('helvetica','normal',8,[220,215,207]);
  doc.text('/100',M+5+doc.getTextWidth(data.score)+1,decisionTop+20);
  setText('helvetica','bold',10,palette.white);
  doc.text(split(data.level,scoreCardW-10),M+5,decisionTop+31,{baseline:'top',lineHeightFactor:1.1});

  roundedCard(M+scoreCardW+decisionGap,decisionTop,decisionW,decisionH,palette.white,palette.line,4);
  let innerY=decisionTop+6;
  if(data.decisionTitle){
   setText('helvetica','bold',11,palette.ink);
   const lines=split(data.decisionTitle,decisionW-10);
   doc.text(lines,M+scoreCardW+decisionGap+5,innerY,{baseline:'top',lineHeightFactor:1.15});
   innerY+=lines.length*4.5+3;
  }
  if(data.summary){
   setText('helvetica','normal',9,palette.muted);
   const lines=split(data.summary,decisionW-10);
   doc.text(lines,M+scoreCardW+decisionGap+5,innerY,{baseline:'top',lineHeightFactor:1.25});
   innerY+=lines.length*4+3;
  }
  if(data.critical.length){
   setText('helvetica','bold',8.5,palette.danger);
   doc.text(language==='en'?'Critical signals':'Signaux critiques',M+scoreCardW+decisionGap+5,innerY);
   innerY+=4;
   data.critical.forEach(item=>{
    const lines=split(item,decisionW-15);
    doc.setFillColor(...palette.danger);
    doc.circle(M+scoreCardW+decisionGap+7,innerY+1.4,.8,'F');
    setText('helvetica','normal',8.2,palette.ink);
    doc.text(lines,M+scoreCardW+decisionGap+10,innerY,{baseline:'top',lineHeightFactor:1.2});
    innerY+=lines.length*3.8+2;
   });
  }
  y=decisionTop+decisionH+8;

  if(data.context.length){
   sectionHeading(copy.context);
   const gap=4;
   const cardW=(CONTENT_W-gap)/2;
   for(let index=0;index<data.context.length;index+=2){
    const left=data.context[index];
    const right=data.context[index+1];
    const leftLabelLines=split(left[0],cardW-8);
    const leftValueLines=split(left[1],cardW-8);
    const leftH=8+leftLabelLines.length*2.6+leftValueLines.length*3.5;
    let rightH=0;
    if(right){
     rightH=8+split(right[0],cardW-8).length*2.6+split(right[1],cardW-8).length*3.5;
    }
    const rowH=Math.max(leftH,rightH,15);
    ensureSpace(rowH+4);
    labelValueCard(M,y,cardW,left[0],left[1]);
    if(right)labelValueCard(M+cardW+gap,y,cardW,right[0],right[1]);
    y+=rowH+4;
   }
  }

  /* Page 2 — native radar and scores */
  doc.addPage();
  y=TOP;
  sectionHeading(copy.profile);
  textBlock(copy.profileNote,M,CONTENT_W,{size:8.7,color:palette.muted,lineHeight:1.3});
  y+=2;

  const radarCenterX=PAGE_W/2;
  const radarCenterY=y+58;
  drawRadar(data.dimensions,radarCenterX,radarCenterY,47);
  y=radarCenterY+62;

  ensureSpace(15);
  setText('times','bold',14,palette.ink);
  doc.text(copy.dimensions,M,y,{baseline:'top'});
  y+=8;
  drawDimensionGrid(data.dimensions);

  /* Page 3 — action plan and safeguards */
  doc.addPage();
  y=TOP;
  sectionHeading(copy.actions);

  if(data.actions.length){
   data.actions.forEach((group,index)=>{
    const estimated=15+group.items.reduce((sum,item)=>sum+split(item,CONTENT_W-16).length*3.6,0);
    ensureSpace(estimated+5);
    const top=y;
    const titleLines=split(group.title||copy.actions,CONTENT_W-16);
    const itemLines=group.items.reduce((sum,item)=>sum+split(item,CONTENT_W-18).length,0);
    const height=13+(titleLines.length*4)+(itemLines*3.7)+(group.items.length*3);
    roundedCard(M,top,CONTENT_W,height,index===0?palette.terraLight:palette.warm,palette.line,4);
    doc.setFillColor(...(index===0?palette.terra:palette.green));
    doc.roundedRect(M,top,3,height,1.5,1.5,'F');
    setText('times','bold',13,palette.ink);
    doc.text(titleLines,M+8,top+5,{baseline:'top',lineHeightFactor:1.1});
    y=top+8+titleLines.length*4;
    group.items.forEach(item=>{
     const lines=split(item,CONTENT_W-20);
     doc.setFillColor(...palette.terra);
     doc.circle(M+10,y+1.4,.8,'F');
     setText('helvetica','normal',8.6,palette.muted);
     doc.text(lines,M+14,y,{baseline:'top',lineHeightFactor:1.25});
     y+=lines.length*3.8+2.5;
    });
    y=top+height+5;
   });
  }else{
   textBlock(language==='en'
    ? 'No priority action section was available in the generated report.'
    : "Aucune section d'actions prioritaires n'était disponible dans le rapport généré.",
    M,CONTENT_W,{size:9,color:palette.muted});
  }

  if(data.conditions.length){
   sectionHeading(copy.conditions);
   bulletList(data.conditions,M,CONTENT_W,{size:8.8});
  }

  if(data.limitations){
   ensureSpace(25);
   const lines=split(data.limitations,CONTENT_W-12);
   const height=11+lines.length*3.6;
   roundedCard(M,y,CONTENT_W,height,palette.warm,palette.line,3);
   setText('helvetica','bold',8,palette.terra);
   doc.text(copy.limitations.toUpperCase(),M+6,y+5);
   setText('helvetica','normal',7.8,palette.muted);
   doc.text(lines,M+6,y+10,{baseline:'top',lineHeightFactor:1.25});
   y+=height+5;
  }

  /* Footer on every page */
  const totalPages=doc.getNumberOfPages();
  for(let pageNumber=1;pageNumber<=totalPages;pageNumber++){
   doc.setPage(pageNumber);
   doc.setDrawColor(...palette.line);
   doc.setLineWidth(.3);
   doc.line(M,PAGE_H-12,M+CONTENT_W,PAGE_H-12);
   setText('helvetica','normal',7,palette.muted);
   doc.text(copy.brand,M,PAGE_H-7.5);
   doc.text(`${copy.page} ${pageNumber} / ${totalPages}`,M+CONTENT_W,PAGE_H-7.5,{align:'right'});
  }

  doc.save(filename());
 };

 const generate=async button=>{
  if(!report.innerHTML.trim()){
   alert(copy.incomplete);
   return;
  }

  const original=button.textContent;
  button.disabled=true;
  button.setAttribute('aria-busy','true');
  button.textContent=copy.generating;

  try{
   await createPdf();
  }catch(error){
   console.error('PDF generation failed.',error);
   alert(language==='en'
    ? 'The PDF could not be generated. Please reload the page and try again.'
    : "Le PDF n'a pas pu être généré. Rechargez la page puis réessayez.");
  }finally{
   button.disabled=false;
   button.removeAttribute('aria-busy');
   button.textContent=original;
  }
 };

 document.addEventListener('click',event=>{
  const button=event.target.closest('#printReport,#archivePdf');
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  generate(button);
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
