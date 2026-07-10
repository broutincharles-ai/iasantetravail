
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isEN = document.documentElement.lang.toLowerCase().startsWith('en');
const nav = document.querySelector('.nav');
const menuButton = document.querySelector('.nav-menu-btn');
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

// Inscription : endpoint de double opt-in configurable, avec repli temporaire explicite vers la messagerie.
const newsletter=document.getElementById('newsletterForm');
newsletter?.addEventListener('submit',async e=>{
 e.preventDefault();const status=document.getElementById('newsletterStatus');const fd=new FormData(newsletter);const email=(fd.get('email')||'').toString().trim();
 if(fd.get('website'))return;if(!email||!newsletter.checkValidity()){newsletter.reportValidity();return;}
 const endpoint=window.NEWSLETTER_ENDPOINT||'';status.classList.remove('ok');status.textContent=isEN?'Processing your request…':'Traitement de votre demande…';
 if(endpoint){try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,consent:true,locale:fd.get('locale')||'fr',source:location.href})});if(!r.ok)throw new Error('bad response');status.textContent=isEN?'Check your inbox to confirm your subscription.':'Vérifiez votre messagerie pour confirmer votre inscription.';status.classList.add('ok');newsletter.reset();return;}catch(err){status.textContent=isEN?'The subscription service is temporarily unavailable. Please try again later.':'Le service d’inscription est momentanément indisponible. Vous pouvez réessayer plus tard.';return;}}
 const subject=encodeURIComponent(isEN?'Subscription to AI & Occupational Health updates':'Inscription aux actualités IA & Santé au Travail');const body=encodeURIComponent(isEN?`Hello,\n\nI would like to receive updates about new resources published on the AI & Occupational Health website and the forthcoming newsletter.\n\nEmail address: ${email}\n\nI consent to this address being used solely for this purpose and understand that I may withdraw my consent at any time.\n\nKind regards,`:`Bonjour,\n\nJe souhaite être informé(e) des nouvelles ressources publiées sur le site IA & Santé au Travail et recevoir la future newsletter.\n\nAdresse à inscrire : ${email}\n\nJ’accepte que cette adresse soit utilisée à cette seule fin et pourrai retirer mon consentement à tout moment.\n\nCordialement,`);status.textContent=isEN?'Your email app will open to complete this temporary subscription request.':'Votre messagerie va s’ouvrir pour finaliser la demande temporaire.';location.href=`mailto:santetravailia@gmail.com?subject=${subject}&body=${body}`;
});
