import{g as v,a as h}from"./api-SBpX3dnG.js";import{g as y}from"./dom-NB7M50He.js";function b(){const e=document.getElementById("year");e&&(e.textContent=String(new Date().getFullYear()))}function o(e){if(e==null)return"";const a=document.createElement("div");return a.textContent=e,a.innerHTML}async function x(){b();const e=document.getElementById("products-grid"),a=document.getElementById("products-empty"),s=document.getElementById("footer-text"),d=y("category_id"),i=y("tag"),n={};d&&(n.category_id=d),i&&(n.tag=i);try{const[r,l]=await Promise.all([v().catch(()=>({})),h(n).catch(()=>({data:[]}))]);if(s&&r.footer_text&&(s.textContent=r.footer_text.replace(/{{year}}/gi,new Date().getFullYear().toString())),!e||!a)return;const g=Array.isArray(l.data)?l.data:[];if(!g.length){e.innerHTML="",a.style.display="block";return}a.style.display="none",e.innerHTML=g.map(t=>{const c=t.media&&t.media[0],f=typeof t.price=="number"?`€ ${t.price.toFixed(2)}`:t.price||"",u=Array.isArray(t.tags)?t.tags:[],m=u.length?`<div class="product-card-tags">${u.map($=>`<span class="product-card-tag">${o($.name)}</span>`).join("")}</div>`:"",p=t.label?`<span class="product-card-label">${o(t.label)}</span>`:"";return`
          <a href="./prodotto.html?slug=${encodeURIComponent(t.slug)}" class="product-card">
            <div class="product-card-image">
              ${c&&c.url?`<img src="${c.url}" alt="${o(c.alt||t.name)}" loading="lazy" />`:'<div class="product-card-placeholder"></div>'}
              ${m||p?`<div class="product-card-badges">${m}${p}</div>`:""}
            </div>
            <div class="product-card-body">
              <h3 class="product-card-title">${o(t.name)}</h3>
              <p class="product-card-desc">${t.short_description||""}</p>
              <span class="product-card-price">${f}</span>
            </div>
          </a>
        `}).join("")}catch(r){console.error("Errore caricando i prodotti",r),e&&a&&(e.innerHTML="",a.style.display="block")}}x();
