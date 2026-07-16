const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isEN = document.documentElement.lang.toLowerCase().startsWith('en');
const nav = document.querySelector('.nav');
const menuButton = document.querySelector('.nav-menu-btn');

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

/* ============================================================
   SUBSTACK — intégration globale
   ============================================================ */
const SUBSTACK_URL='https://substack.com/@charlesbroutin';

function loadSubstackStyles(){
 if(document.querySelector('link[data-substack-styles]'))return;
 const root=document.body.dataset.root||'';
 const stylesheet=document.createElement('link');
 stylesheet.rel='stylesheet';
 stylesheet.href=`${root}assets/css/substack.css?v=1.0`;
 stylesheet.dataset.substackStyles='true';
 document.head.appendChild(stylesheet);
}

function createSubstackLink({label,source,className}){
 const link=document.createElement('a');
 link.className=className;
 link.href=SUBSTACK_URL;
 link.target='_blank';
 link.rel='noopener noreferrer';
 link.dataset.substackSource=source;
 link.setAttribute('aria-label',`${label} — Substack`);
 link.innerHTML=`<span>${label}</span><span aria-hidden="true">↗</span>`;
 return link;
}

function addSubstackAboutSection(){
 const page=document.body.dataset.page;
 if(page!=='apropos' && page!=='en-about')return;
 if(document.getElementById('newsletter-substack'))return;

 const publications=document.getElementById('publications');
 if(!publications)return;

 const section=document.createElement('section');
 section.id='newsletter-substack';
 section.className='about-section substack-about-section';

 if(isEN){
  section.innerHTML=`
   <div class="wrap">
    <article class="substack-about-card glass reveal">
     <div class="substack-about-copy">
      <span class="kicker">Personal newsletter</span>
      <h2>Long-form analysis on AI and occupational health</h2>
      <p>I publish longer pieces than on LinkedIn, covering recent technological developments, artificial intelligence at work and their implications for occupational health.</p>
      <div class="substack-about-topics" aria-label="Newsletter topics">
       <span>Technology developments</span>
       <span>AI at work</span>
       <span>Occupational health</span>
      </div>
     </div>
     <div class="substack-about-action">
      <span class="substack-wordmark">Substack</span>
      <p>Receive new articles directly by email.</p>
     </div>
    </article>
   </div>`;
 }else{
  section.innerHTML=`
   <div class="wrap">
    <article class="substack-about-card glass reveal">
     <div class="substack-about-copy">
      <span class="kicker">Newsletter personnelle</span>
      <h2>Des analyses approfondies sur l’IA et la santé au travail</h2>
      <p>Je publie sur Substack des articles plus longs que sur LinkedIn, consacrés aux évolutions technologiques récentes, à l’intelligence artificielle au travail et à leurs implications pour la santé au travail.</p>
      <div class="substack-about-topics" aria-label="Thèmes de la newsletter">
       <span>Évolutions technologiques</span>
       <span>IA au travail</span>
       <span>Santé au travail</span>
      </div>
     </div>
     <div class="substack-about-action">
      <span class="substack-wordmark">Substack</span>
      <p>Recevez les nouveaux articles directement par e-mail.</p>
     </div>
    </article>
   </div>`;
 }

 const action=section.querySelector('.substack-about-action');
 action?.appendChild(createSubstackLink({
  label:isEN?'Subscribe to the newsletter':'S’abonner à la newsletter',
  source:isEN?'about-en':'about-fr',
  className:'substack-main-cta'
 }));

 publications.before(section);
 section.querySelectorAll('.reveal').forEach(el=>revealObserver?revealObserver.observe(el):el.classList.add('in'));

 const heroActions=document.querySelector('.hero-actions');
 if(heroActions && !heroActions.querySelector('[data-substack-source]')){
  heroActions.appendChild(createSubstackLink({
   label:isEN?'Read the newsletter':'Lire la newsletter',
   source:isEN?'about-hero-en':'about-hero-fr',
   className:'btn btn-glassy glass glass--dark substack-hero-cta'
  }));
 }
}

function addSubstackToBylines(){
 let bylines=[...document.querySelectorAll('.author-byline')];

 if(!bylines.length){
  const main=document.querySelector('main');
  if(!main)return;

  const generated=document.createElement('section');
  generated.className='author-byline author-byline--generated';
  generated.setAttribute('aria-label',isEN?'Content author':'Auteur du contenu');
  generated.innerHTML=`
   <div class="wrap">
    <p>${isEN
     ? 'Written by <a href="'+(document.body.dataset.root||'')+'en/about/"><strong>Dr Charles Broutin</strong></a>, occupational physician and AI representative for the French Society of Occupational Health.'
     : 'Rédigé par le <a href="'+(document.body.dataset.root||'')+'a-propos/"><strong>Dr Charles Broutin</strong></a>, médecin du travail, référent IA de la SFST.'}
    </p>
   </div>`;
  main.appendChild(generated);
  bylines=[generated];
 }

 bylines.forEach((byline,index)=>{
  const wrap=byline.querySelector('.wrap')||byline;
  if(wrap.querySelector('.substack-byline'))return;

  const text=wrap.querySelector(':scope > p')||wrap.querySelector('p');
  const row=document.createElement('div');
  row.className='author-newsletter-row';

  if(text){
   text.before(row);
   row.appendChild(text);
  }else{
   wrap.appendChild(row);
  }

  row.appendChild(createSubstackLink({
   label:isEN?'Subscribe to the newsletter':'S’abonner à la newsletter',
   source:`byline-${isEN?'en':'fr'}-${index+1}`,
   className:'substack-byline'
  }));
 });
}

function addSubstackToFooter(){
 document.querySelectorAll('footer ul').forEach(list=>{
  if(list.querySelector(`a[href="${SUBSTACK_URL}"]`))return;
  const linkedIn=list.querySelector('a[href*="linkedin.com/in/charles-broutin"]');
  if(!linkedIn)return;

  const item=document.createElement('li');
  const link=createSubstackLink({
   label:isEN?'Subscribe to the newsletter':'S’abonner à la newsletter',
   source:isEN?'footer-en':'footer-fr',
   className:'substack-footer-link'
  });
  item.appendChild(link);

  const linkedInItem=linkedIn.closest('li');
  linkedInItem?.after(item);
 });
}

function enrichAuthorStructuredData(){
 document.querySelectorAll('script[type="application/ld+json"]').forEach(script=>{
  try{
   const data=JSON.parse(script.textContent);
   let changed=false;

   const visit=value=>{
    if(Array.isArray(value)){
     value.forEach(visit);
     return;
    }
    if(!value || typeof value!=='object')return;

    const types=Array.isArray(value['@type'])?value['@type']:[value['@type']];
    if(types.includes('Person') && value.name==='Dr Charles Broutin'){
     const sameAs=Array.isArray(value.sameAs)?value.sameAs:value.sameAs?[value.sameAs]:[];
     if(!sameAs.includes(SUBSTACK_URL)){
      value.sameAs=[...sameAs,SUBSTACK_URL];
      changed=true;
     }
    }
    Object.values(value).forEach(visit);
   };

   visit(data);
   if(changed)script.textContent=JSON.stringify(data);
  }catch{
   // Un bloc JSON-LD invalide ne doit pas empêcher le reste du site de fonctionner.
  }
 });
}

function initSubstackIntegration(){
 loadSubstackStyles();
 addSubstackAboutSection();
 addSubstackToBylines();
 addSubstackToFooter();
 enrichAuthorStructuredData();

 document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-substack-source]');
  if(!link || typeof window.plausible!=='function')return;
  window.plausible('Substack CTA',{
   props:{
    source:link.dataset.substackSource||'unknown',
    language:isEN?'en':'fr'
   }
  });
 });
}
initSubstackIntegration();

// Recherche locale : aucun contenu de recherche n'est envoyé à un tiers.
const dialog=document.getElementById('siteSearch'),openSearch=document.querySelector('.search-open'),closeSearch=document.querySelector('.search-close'),input=document.getElementById('searchInput'),results=document.getElementById('searchResults');
openSearch?.addEventListener('click',()=>{dialog?.showModal();setTimeout(()=>input?.focus(),30)});closeSearch?.addEventListener('click',()=>dialog?.close());
function norm(s){return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function renderSearch(q){if(!results)return;const query=norm(q).trim();if(query.length<2){results.innerHTML=`<p class="search-empty">${isEN?'Enter at least two characters.':'Saisissez au moins deux caractères.'}</p>`;return;}const terms=query.split(/\s+/);const items=(window.SEARCH_INDEX||[]).map(x=>{const hay=norm(`${x.title} ${x.description} ${x.keywords}`);return {...x,score:terms.reduce((s,t)=>s+(hay.includes(t)?1:0),0)}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,12);results.innerHTML=items.length?items.map(x=>`<a class="search-result" href="${document.body.dataset.root||''}${x.url}"><strong>${x.title}</strong><span>${x.description}</span></a>`).join(''):`<p class="search-empty">${isEN?'No results. Try a broader term.':'Aucun résultat. Essayez un terme plus général.'}</p>`;}
input?.addEventListener('input',e=>renderSearch(e.target.value));

// Préserve les anciens liens par fragment vers les nouvelles URL.
if(document.body.dataset.page==='accueil' && location.hash){const m={comprendre:'comprendre/',pratique:'usages-terrain/',terrain:'usages-terrain/#retours-terrain',evaluer:'evaluer/',modeles:'ressources/modeles/',risques:'risques-prevention/',legislation:'droit-gouvernance/',apropos:'a-propos/',mentions:'mentions-legales/',confidentialite:'confidentialite/'};const raw=decodeURIComponent(location.hash.slice(1));const owner=Object.keys(m).find(k=>raw===k||raw.startsWith(k+'-'));if(owner){const target=m[owner]+(raw!==owner&&!m[owner].includes('#')?'#'+raw:'');location.replace(target);}}
