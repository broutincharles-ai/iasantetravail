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


/* Génération directe des rapports PDF pour Évaluer / Assess.
   Le gestionnaire est installé en phase de capture afin de remplacer
   les anciennes fonctions qui ouvraient uniquement la boîte d’impression. */
function initAssessmentPdfExport(){
 const pdfButtons=[...document.querySelectorAll('#printReport,#archivePdf')];
 const report=document.getElementById('generatedReport');
 if(!pdfButtons.length||!report)return;

 const loadHtml2Pdf=()=>{
  if(typeof window.html2pdf==='function')return Promise.resolve(window.html2pdf);
  if(window.__html2pdfLoading)return window.__html2pdfLoading;

  window.__html2pdfLoading=new Promise((resolve,reject)=>{
   const existing=document.querySelector('script[data-html2pdf]');
   if(existing){
    existing.addEventListener('load',()=>resolve(window.html2pdf),{once:true});
    existing.addEventListener('error',reject,{once:true});
    return;
   }

   const script=document.createElement('script');
   script.src='https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js';
   script.async=true;
   script.dataset.html2pdf='true';
   script.onload=()=>typeof window.html2pdf==='function'
    ? resolve(window.html2pdf)
    : reject(new Error('html2pdf unavailable after loading'));
   script.onerror=()=>reject(new Error('Unable to load html2pdf'));
   document.head.appendChild(script);
  });

  return window.__html2pdfLoading;
 };

 const reportFilename=()=>{
  const today=new Date().toISOString().slice(0,10);
  const path=location.pathname.toLowerCase();
  const followup=path.includes('suivi')||path.includes('follow-up');
  const english=document.documentElement.lang.toLowerCase().startsWith('en');
  if(english)return `${followup?'workplace-ai-follow-up':'workplace-ai-assessment'}-${today}.pdf`;
  return `${followup?'suivi-impact-ia':'rapport-impact-ia'}-${today}.pdf`;
 };

 const fallbackPrint=()=>{
  const title=document.title;
  document.title=reportFilename().replace(/\.pdf$/i,'');
  const restore=()=>{document.title=title;window.removeEventListener('afterprint',restore)};
  window.addEventListener('afterprint',restore);
  window.print();
  setTimeout(restore,1800);
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

  const exportShell=document.createElement('div');
  exportShell.className='pdf-export-shell';
  exportShell.style.cssText='position:fixed;left:-10000px;top:0;width:794px;background:#fff;padding:0;z-index:-1;';
  const clone=report.cloneNode(true);
  clone.removeAttribute('id');
  clone.style.width='794px';
  clone.style.maxWidth='794px';
  clone.style.margin='0';
  clone.style.boxShadow='none';
  clone.style.borderRadius='0';
  exportShell.appendChild(clone);
  document.body.appendChild(exportShell);

  try{
   const html2pdf=await loadHtml2Pdf();
   await document.fonts?.ready;
   await html2pdf()
    .set({
     margin:[8,8,10,8],
     filename:reportFilename(),
     image:{type:'jpeg',quality:.98},
     html2canvas:{
      scale:2,
      useCORS:true,
      backgroundColor:'#ffffff',
      logging:false,
      scrollX:0,
      scrollY:0,
      windowWidth:794
     },
     jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
     pagebreak:{mode:['css','legacy'],avoid:['.report-section-heading','.report-score-row','.action-column','.report-role-card','.report-callout']}
    })
    .from(clone)
    .save();
  }catch(error){
   console.error('Direct PDF generation failed; using print fallback.',error);
   fallbackPrint();
  }finally{
   exportShell.remove();
   button.disabled=false;
   button.removeAttribute('aria-busy');
   button.textContent=originalText;
  }
 };

 pdfButtons.forEach(button=>{
  button.addEventListener('click',event=>{
   event.preventDefault();
   event.stopImmediatePropagation();
   generatePdf(button);
  },true);
 });
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
