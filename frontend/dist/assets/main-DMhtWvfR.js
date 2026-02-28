import{g as l,a as u}from"./api-SBpX3dnG.js";function m(){const t=document.getElementById("year");t&&(t.textContent=String(new Date().getFullYear()))}async function g(){m();try{const[t,a]=await Promise.all([l().catch(()=>({})),u({featured:1,per_page:8}).catch(()=>({data:[]}))]),c=document.getElementById("hero-title"),n=document.getElementById("hero-subtitle"),i=document.getElementById("footer-text"),o=document.getElementById("featured-products");if(c&&t.hero_title&&(c.textContent=t.hero_title),n&&t.hero_subtitle&&(n.textContent=t.hero_subtitle),i&&t.footer_text&&(i.textContent=t.footer_text.replace(/{{year}}/gi,new Date().getFullYear().toString())),!o)return;const d=Array.isArray(a.data)?a.data:[];if(!d.length){o.innerHTML="";return}o.innerHTML=d.map(e=>{const r=e.media&&e.media[0],s=typeof e.price=="number"?`€ ${e.price.toFixed(2)}`:e.price||"";return`
          <a href="./prodotto.html?slug=${encodeURIComponent(e.slug)}" class="product-card">
            <div class="product-card-image">
              ${r&&r.url?`<img src="${r.url}" alt="${(r.alt||e.name).replace(/"/g,"&quot;")}" loading="lazy" />`:'<div class="product-card-placeholder"></div>'}
            </div>
            <div class="product-card-body">
              <h3 class="product-card-title">${e.name}</h3>
              <p class="product-card-desc">${e.short_description||""}</p>
              <span class="product-card-price">${s}</span>
            </div>
          </a>
        `}).join("")}catch(t){console.error("Errore caricando la home",t)}}g();
