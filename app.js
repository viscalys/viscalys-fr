/* ============================================================
   VISCALYS — Script commun
   - Sélecteur de langue FR/EN (persistant)
   - Header au défilement, menu mobile, animations reveal
   - Bandeau cookies RGPD
   - Chatbot « L'Expert Viscalys » (mode démo + prêt pour l'IA)
   Pour brancher l'IA : définir window.VISCALYS_CHAT_API = "https://votre-backend/api/chat";
   ============================================================ */

/* ⚙️ CONFIG — Quand le backend IA est déployé, colle son URL ci-dessous.
   Exemple : "https://viscalys-chatbot.onrender.com/api/chat"
   Tant que c'est vide, le chatbot fonctionne en mode démo (base de connaissances). */
window.VISCALYS_CHAT_API = "https://viscalys-chatbot.onrender.com/api/chat";

(function(){
  const isEn = () => document.body.classList.contains('en');

  /* ---------- Langue ---------- */
  if(!window.__origHTML) window.__origHTML = new WeakMap();
  window.setLang = function(l){
    document.body.classList.toggle('en', l==='en');
    document.documentElement.lang = l;
    document.querySelectorAll('[data-fr]').forEach(function(el){
      if(!window.__origHTML.has(el)) window.__origHTML.set(el, el.innerHTML);
      var en = el.getAttribute('data-en');
      el.innerHTML = (l==='en' && en!=null) ? en : window.__origHTML.get(el);
    });
    document.querySelectorAll('.lang button').forEach(b=>b.classList.remove('active'));
    const btn = document.querySelector('.lang button[data-l="'+l+'"]'); if(btn) btn.classList.add('active');
    try{ localStorage.setItem('viscalys_lang', l); }catch(e){}
  };

  document.addEventListener('DOMContentLoaded', function(){
    try{ if(localStorage.getItem('viscalys_lang')==='en') window.setLang('en'); }catch(e){}

    // Header scrolled
    const hdr = document.querySelector('header');
    if(hdr) addEventListener('scroll', ()=>hdr.classList.toggle('scrolled', scrollY>40));

    // Menu mobile
    const burger = document.querySelector('.burger'), menu = document.getElementById('menu');
    if(burger && menu){ burger.addEventListener('click', ()=>menu.classList.toggle('open'));
      menu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>menu.classList.remove('open'))); }

    // Reveal
    const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }),{threshold:.12});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

    // Année footer
    document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

    injectWidgetStyles();
    initCookies();
    initChat();
  });

  /* ---------- Styles widgets (auto-injectés, idempotent) ---------- */
  function injectWidgetStyles(){
    if(document.getElementById('viscalys-widget-css')) return;
    const css = `
    .chat-fab{position:fixed;right:24px;bottom:24px;z-index:200;background:#C8A75E;color:#fff;border:none;border-radius:40px;padding:14px 22px;font-family:"Inter",system-ui,sans-serif;font-size:13px;font-weight:600;letter-spacing:.5px;cursor:pointer;box-shadow:0 14px 30px rgba(11,11,11,.25);display:flex;align-items:center;gap:8px;transition:.3s}
    .chat-fab:hover{transform:translateY(-3px)}
    .chat-panel{position:fixed;right:24px;bottom:24px;z-index:201;width:380px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 48px);background:#FBF9F5;border:1px solid rgba(200,167,94,.3);border-radius:16px;box-shadow:0 30px 70px rgba(11,11,11,.35);display:none;flex-direction:column;overflow:hidden;font-family:"Inter",system-ui,sans-serif}
    .chat-panel.open{display:flex}
    .chat-head{background:#0B0B0B;color:#FBF9F5;padding:16px 18px;display:flex;align-items:center;gap:12px}
    .chat-head .av{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,#e0c894,#C8A75E);color:#0B0B0B;display:flex;align-items:center;justify-content:center;font-family:"Playfair Display",serif;font-weight:700}
    .chat-head b{font-family:"Playfair Display",serif;font-size:16px}.chat-head small{display:block;color:#C8A75E;font-size:11px}
    .chat-head .x{margin-left:auto;background:none;border:none;color:#FBF9F5;font-size:20px;cursor:pointer;opacity:.7}
    .chat-body{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px}
    .msg{max-width:85%;padding:11px 14px;border-radius:12px;font-size:14px;line-height:1.55}
    .msg.bot{background:#fff;border:1px solid rgba(11,11,11,.12);align-self:flex-start}
    .msg.me{background:#C8A75E;color:#fff;align-self:flex-end}
    .chat-sugg{display:flex;flex-wrap:wrap;gap:7px;padding:0 18px 10px}
    .chat-sugg button{font-size:12px;border:1px solid rgba(200,167,94,.3);background:#fff;color:#0B0B0B;border-radius:20px;padding:6px 12px;cursor:pointer}
    .chat-sugg button:hover{border-color:#C8A75E}
    .chat-in{display:flex;gap:8px;padding:14px;border-top:1px solid rgba(11,11,11,.12);background:#fff}
    .chat-in input{flex:1;border:1px solid rgba(11,11,11,.12);border-radius:10px;padding:11px 12px;font-family:"Inter",sans-serif;font-size:14px;outline:none}
    .chat-in input:focus{border-color:#C8A75E}
    .chat-in button{background:#C8A75E;color:#fff;border:none;border-radius:10px;padding:0 16px;cursor:pointer;font-weight:600}
    .chat-note{font-size:10.5px;color:#7A7A7A;text-align:center;padding:0 14px 10px}
    .cookie{position:fixed;left:18px;right:18px;bottom:18px;z-index:190;background:#0B0B0B;color:#FBF9F5;border:1px solid rgba(200,167,94,.3);border-radius:14px;padding:18px 22px;display:none;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;box-shadow:0 20px 50px rgba(0,0,0,.35);font-family:"Inter",sans-serif}
    .cookie.show{display:flex}.cookie p{font-size:13.5px;color:rgba(251,249,245,.85);max-width:680px}
    .cookie .cbtns{display:flex;gap:10px}
    .cookie button{font-size:12px;letter-spacing:1px;text-transform:uppercase;padding:11px 20px;border-radius:8px;cursor:pointer;border:1px solid #C8A75E}
    .cookie .acc{background:#C8A75E;color:#fff;border:none}.cookie .ref{background:transparent;color:#FBF9F5}`;
    const s=document.createElement('style'); s.id='viscalys-widget-css'; s.textContent=css; document.head.appendChild(s);
  }

  /* ---------- Cookies ---------- */
  function initCookies(){
    let ok=false; try{ ok=localStorage.getItem('viscalys_cookies'); }catch(e){}
    if(ok) return;
    const fr = "Nous utilisons des cookies pour améliorer votre navigation. Vous pouvez accepter ou refuser — votre choix est respecté.";
    const en = "We use cookies to improve your experience. You can accept or decline — your choice is respected.";
    const bar = document.createElement('div'); bar.className='cookie show';
    bar.innerHTML = '<p>'+(isEn()?en:fr)+'</p><div class="cbtns"><button class="ref">'+(isEn()?'Decline':'Refuser')+'</button><button class="acc">'+(isEn()?'Accept':'Accepter')+'</button></div>';
    document.body.appendChild(bar);
    const close=(v)=>{ try{ localStorage.setItem('viscalys_cookies',v); }catch(e){} bar.remove(); };
    bar.querySelector('.acc').onclick=()=>close('accepted');
    bar.querySelector('.ref').onclick=()=>close('declined');
  }

  /* ---------- Chatbot ---------- */
  // Persona (utilisé par le backend IA quand il sera branché) :
  const PERSONA = "Tu es l'Expert Viscalys, spécialiste reconnu du savoir-faire artisanal et industriel français. "
    + "Tu réponds avec précision, élégance et pédagogie à toute question sur l'artisanat, les matières, les régions, "
    + "les labels (Origine France Garantie, EPV, AOC, IGP) et l'industrie française. Tu valorises le premium français "
    + "et orientes, quand c'est pertinent, vers un partenariat avec Viscalys (contact@viscalys.fr). "
    + "Jamais de promesse produit inexistante. Réponds dans la langue de l'utilisateur (FR/EN).";

  const KB=[
    {k:['afrique','africain','african'], fr:"Pour le marché africain, plusieurs catégories françaises ont un fort potentiel : cosmétiques et soins, agroalimentaire premium, matériaux et équipements pour le bâtiment, art de la table et décoration. La clé : un partenaire/distributeur local de confiance, une offre adaptée et des prix pensés pour une classe moyenne en forte croissance. Viscalys vous accompagne sur ce déploiement.", en:"For the African market, several French categories have strong potential: cosmetics and care, premium food products, building materials and equipment, tableware and décor. The key: a trusted local partner/distributor, an adapted offer and pricing designed for a fast-growing middle class. Viscalys supports you on this rollout."},
    {k:['conquér','conquer','stratég','strateg','comment vendre','se lancer','marché','marche','advice','how to','réussir','reussir'], fr:"Pour conquérir un nouveau marché : 1) étudier la demande et la concurrence locale ; 2) choisir un partenaire ou distributeur de confiance sur place ; 3) adapter l'offre (formats, prix, langue, normes) ; 4) sécuriser la logistique et les certifications ; 5) avancer par étapes avec un partenaire qui connaît l'export. C'est précisément le rôle de Viscalys.", en:"To win a new market: 1) study local demand and competition; 2) choose a trusted local partner or distributor; 3) adapt the offer (formats, price, language, standards); 4) secure logistics and certifications; 5) move step by step with an export-savvy partner. That's exactly Viscalys's role."},
    {k:['recherch','populaire','best','meilleures ventes','sought','top produit','most','plus vendus','demande','exportes'], fr:"À l'international, les produits français les plus recherchés sont : parfums et cosmétiques, vins et spiritueux, maroquinerie et luxe, art de la table (porcelaine, cristal), mode et gastronomie fine. Viscalys vous aide à sourcer ces catégories premium.", en:"Internationally, the most sought-after French products are: perfumes and cosmetics, wines and spirits, leather goods and luxury, tableware (porcelain, crystal), fashion and fine gastronomy. Viscalys helps you source these premium categories."},
    {k:['maison','renom','lvmh','hermès','hermes','chanel','kering','grande marque','famous','brands','marques connues'], fr:"La France compte de grands groupes (LVMH, Kering, L'Oréal, Hermès, Chanel) et des maisons d'excellence artisanale : Baccarat (cristal), Bernardaud et Haviland (porcelaine de Limoges), Christofle (orfèvrerie), Laguiole et Thiers (coutellerie). Viscalys travaille surtout avec des PME et artisans premium — plus accessibles, tout aussi exigeants.", en:"France has major groups (LVMH, Kering, L'Oréal, Hermès, Chanel) and houses of artisanal excellence: Baccarat (crystal), Bernardaud and Haviland (Limoges porcelain), Christofle (silverware), Laguiole and Thiers (cutlery). Viscalys works mainly with premium SMEs and artisans — more accessible, just as demanding."},
    {k:['parfum','grasse','senteur','fragrance','perfume'], fr:"La France est le berceau de la parfumerie, autour de Grasse depuis le XVIIᵉ siècle : culture des fleurs (rose, jasmin), extraction et art de la composition. Un savoir-faire premium très demandé à l'export, que Viscalys peut sourcer pour vos marchés.", en:"France is the cradle of perfumery, around Grasse since the 17th century: flower growing, extraction and the art of composition. A premium, export-favourite craft Viscalys can source for your markets."},
    {k:['porcelaine','limoges','cristal','baccarat','table','tableware','vaisselle'], fr:"L'art de la table français rayonne : porcelaine de Limoges (Bernardaud, Haviland), cristal de Baccarat, orfèvrerie (Christofle), coutellerie de Thiers et Laguiole. Des pièces d'exception pour une clientèle premium à l'export.", en:"French tableware shines: Limoges porcelain (Bernardaud, Haviland), Baccarat crystal, silverware (Christofle), Thiers and Laguiole cutlery. Exceptional pieces for a premium export clientele."},
    {k:['cuir','maroquinerie','mode','leather','fashion','production'], fr:"La maroquinerie française est une référence mondiale et un secteur en forte croissance, parmi les premiers exportateurs : cuirs nobles, gestes précis, finitions irréprochables. Viscalys relie ces artisans à des acheteurs internationaux exigeants.", en:"French leather goods are a global benchmark and a fast-growing sector, among the top exporters: noble leathers, precise gestures, flawless finishing. Viscalys connects these artisans with discerning international buyers."},
    {k:['cosmétique','cosmetique','bien-être','bien-etre','soin','cosmetic','wellbeing'], fr:"La cosmétique française premium s'appuie sur la Cosmetic Valley et la Provence : ingrédients naturels, formulations exigeantes, forte image à l'international — l'une des catégories les plus exportées.", en:"French premium cosmetics rely on the Cosmetic Valley and Provence: natural ingredients, demanding formulations, a strong international image — one of the most exported categories."},
    {k:['vin','gastro','fromage','wine','food','spiritueux','champagne'], fr:"Vins, spiritueux, fromages et épicerie fine portent la signature française dans le monde. Terroirs d'exception, AOC et traçabilité : des arguments forts face aux produits standardisés.", en:"Wines, spirits, cheeses and fine foods carry the French signature worldwide. Exceptional terroirs, AOC and traceability: strong arguments against standardised products."},
    {k:['industrie','énergie','energie','bâtiment','batiment','norme','industry','building','btp','matériaux','materiaux'], fr:"Au-delà de l'artisanat, la France excelle en industrie de précision, énergie, matériaux et bâtiment : normes CE, qualité et durabilité. Des atouts solides à l'export, notamment vers les marchés en développement. Viscalys agit comme agent et intermédiaire sur ces secteurs.", en:"Beyond crafts, France excels in precision industry, energy, materials and building: CE standards, quality and durability. Strong export assets, notably toward developing markets. Viscalys acts as agent and intermediary in these sectors."},
    {k:['label','certification','origine','made in france','traçabilité','tracabilite','epv','aoc','igp','pourquoi français','pourquoi francais'], fr:"Le « made in France » premium, c'est qualité, durabilité, traçabilité et image forte — l'opposé du jetable à bas coût. Des repères le garantissent : « Origine France Garantie », « Entreprise du Patrimoine Vivant » (EPV), IGP, AOC. De précieux gages pour rassurer un acheteur étranger.", en:"Premium “made in France” means quality, durability, traceability and a strong image — the opposite of low-cost disposability. Marks guarantee it: “Origine France Garantie”, “Entreprise du Patrimoine Vivant” (EPV), PGI, AOC. Valuable reassurance for a foreign buyer."},
    {k:['partenaire','distributeur','acheter','fournisseur','partner','buy','supplier','export','collaborer','travailler avec'], fr:"Que vous soyez acheteur international ou fournisseur français, Viscalys vous accompagne : sourcing, représentation et déploiement. Écrivez-nous à contact@viscalys.fr.", en:"Whether you are an international buyer or a French supplier, Viscalys supports you: sourcing, representation and deployment. Write to us at contact@viscalys.fr."}
  ];
  function localAnswer(q){
    const t=q.toLowerCase(), en=isEn();
    const hit=KB.find(e=>e.k.some(w=>t.includes(w)));
    if(hit) return en?hit.en:hit.fr;
    return en ? "Great question. The full AI version answers any query on French craftsmanship and industry. Meanwhile, name a field (perfumery, tableware, leather, cosmetics, industry…) or write to contact@viscalys.fr."
              : "Excellente question. La version IA complète répond à toute demande sur l'artisanat et l'industrie française. En attendant, citez un domaine (parfumerie, art de la table, cuir, cosmétique, industrie…) ou écrivez à contact@viscalys.fr.";
  }
  async function getAnswer(q){
    if(window.VISCALYS_CHAT_API){
      try{
        const en=isEn();
        const r=await fetch(window.VISCALYS_CHAT_API,{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({ system:PERSONA + (en?' IMPORTANT: reply ONLY in English.':' IMPORTANT : réponds UNIQUEMENT en français.'), message:(en?'Reply in English. ':'Réponds en français. ')+q, lang:en?'en':'fr' })});
        const d=await r.json(); if(d && (d.reply||d.message)) return d.reply||d.message;
      }catch(e){ /* repli local */ }
    }
    return localAnswer(q);
  }

  function initChat(){
    const fab=document.createElement('button'); fab.className='chat-fab'; fab.id='vfab';
    fab.innerHTML='✦ <span data-fr="Demandez à l\'expert" data-en="Ask the expert">Demandez à l\'expert</span>';
    const panel=document.createElement('div'); panel.className='chat-panel'; panel.id='vpanel';
    panel.innerHTML=
      '<div class="chat-head"><div class="av">V</div><div><b data-fr="L\'Expert Viscalys" data-en="The Viscalys Expert">L\'Expert Viscalys</b>'
      +'<small data-fr="Savoir-faire & industrie française" data-en="French savoir-faire & industry">Savoir-faire & industrie française</small></div>'
      +'<button class="x" id="vx">×</button></div>'
      +'<div class="chat-body" id="vbody"></div><div class="chat-sugg" id="vsugg"></div>'
      +'<div class="chat-in"><input id="vinput" type="text" placeholder="'+(isEn()?'Your question…':'Votre question…')+'"><button id="vsend">→</button></div>'
      +'<div class="chat-note" data-fr="Expert IA Viscalys — savoir-faire et industrie française." data-en="Viscalys AI expert — French savoir-faire and industry.">Expert IA Viscalys — savoir-faire et industrie française.</div>';
    document.body.appendChild(fab); document.body.appendChild(panel);

    const body=panel.querySelector('#vbody'), input=panel.querySelector('#vinput'), sugg=panel.querySelector('#vsugg');
    const SUGG_FR=["La parfumerie de Grasse","Labels Made in France","Devenir distributeur","L'art de la table"];
    const SUGG_EN=["Perfumery in Grasse","Made in France labels","Become a distributor","French tableware"];
    function push(txt,who){ const d=document.createElement('div'); d.className='msg '+who; d.textContent=txt; body.appendChild(d); body.scrollTop=body.scrollHeight; }
    function renderSugg(){ const s=isEn()?SUGG_EN:SUGG_FR; sugg.innerHTML=''; s.forEach(x=>{ const b=document.createElement('button'); b.textContent=x; b.onclick=()=>{ input.value=x; send(); }; sugg.appendChild(b); }); }
    let greeted=false;
    function open(){ panel.classList.add('open'); fab.style.display='none';
      if(!greeted){ push(isEn()?"Bonjour 👋 I'm the Viscalys Expert. Ask me anything about French savoir-faire.":"Bonjour 👋 Je suis l'Expert Viscalys. Posez-moi toute question sur le savoir-faire français.",'bot'); greeted=true; }
      renderSugg(); input.focus(); }
    function close(){ panel.classList.remove('open'); fab.style.display='flex'; }
    async function send(){ const q=input.value.trim(); if(!q)return; push(q,'me'); input.value='';
      const a=await getAnswer(q); push(a,'bot'); }
    fab.onclick=open; panel.querySelector('#vx').onclick=close; panel.querySelector('#vsend').onclick=send;
    input.addEventListener('keydown',e=>{ if(e.key==='Enter') send(); });
    window.viscalysOpenChat=open;
    // Retraduit le widget fraîchement injecté selon la langue courante
    if(window.setLang) window.setLang(document.body.classList.contains('en')?'en':'fr');
  }
})();
