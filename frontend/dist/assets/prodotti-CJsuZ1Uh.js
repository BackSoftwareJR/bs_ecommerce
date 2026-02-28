import{b as p,a as u}from"./api-CsNKvVOi.js";function y(){const e=document.getElementById("year");e&&(e.textContent=String(new Date().getFullYear()))}function s(e){if(e==null)return"";const a=document.createElement("div");return a.textContent=e,a.innerHTML}let g=[],i=null;function l(){const e=document.getElementById("category-nav");if(!e)return;let a=`<div class="catalog-cat-group">
    <div class="catalog-cat-head ${i?"":"active"}" data-action="all">
      Tutti i prodotti
    </div>
  </div>`;g.forEach(t=>{const o=Array.isArray(t.children)?t.children.filter(r=>r.is_active):[],n=i&&String(i.id)===String(t.id),c=o.some(r=>i&&String(i.id)===String(r.id)),d=n||c;o.length>0?a+=`<div class="catalog-cat-group">
        <div class="catalog-cat-head ${d?"open":""} ${n?"active":""}"
             data-cat-id="${t.id}" data-cat-name="${s(t.name)}" data-has-children="1">
          <span>${s(t.name)}</span>
          <span class="catalog-cat-icon">${d?"−":"+"}</span>
        </div>
        <div class="catalog-cat-children ${d?"open":""}">
          ${o.map(r=>`
            <button class="catalog-cat-child ${i&&String(i.id)===String(r.id)?"active":""}"
                    data-cat-id="${r.id}" data-cat-name="${s(r.name)}">
              ${s(r.name)}
            </button>`).join("")}
        </div>
      </div>`:a+=`<div class="catalog-cat-group">
        <div class="catalog-cat-head ${n?"active":""}"
             data-cat-id="${t.id}" data-cat-name="${s(t.name)}">
          ${s(t.name)}
        </div>
      </div>`}),e.innerHTML=a,e.querySelectorAll(".catalog-cat-head").forEach(t=>{t.addEventListener("click",()=>{if(t.dataset.action==="all"){i=null,l(),m();return}if(t.dataset.hasChildren==="1"){t.classList.toggle("open");const n=t.nextElementSibling;n&&n.classList.toggle("open");const c=t.querySelector(".catalog-cat-icon");c&&(c.textContent=t.classList.contains("open")?"−":"+")}else i={id:t.dataset.catId,name:t.dataset.catName},l(),m()})}),e.querySelectorAll(".catalog-cat-child").forEach(t=>{t.addEventListener("click",()=>{i={id:t.dataset.catId,name:t.dataset.catName},l(),m()})})}function h(e){const a=document.getElementById("products-grid"),t=document.getElementById("products-empty"),o=document.getElementById("catalog-count"),n=document.getElementById("catalog-title");if(!(!a||!t)){if(n&&(n.textContent=i?i.name:"Tutti i prodotti"),o&&(o.textContent=e.length?`(${e.length})`:""),!e.length){a.innerHTML="",t.style.display="block";return}t.style.display="none",a.innerHTML=e.map(c=>{const d=c.media&&c.media[0],r=c.model_name?`<p class="hw-pcard-model">${s(c.model_name)}</p>`:"";return`
        <a href="./prodotto.html?slug=${encodeURIComponent(c.slug)}" class="hw-pcard">
          <div class="hw-pcard-img">
            ${d&&d.url?`<img src="${d.url}" alt="${s(d.alt||c.name)}" loading="lazy" />`:'<div class="hw-pcard-placeholder"></div>'}
          </div>
          <div class="hw-pcard-body">
            <h3 class="hw-pcard-name">${s(c.name)}</h3>
            ${r}
            <span class="hw-pcard-link">Scopri di più</span>
          </div>
        </a>`}).join("")}}async function m(){const e=document.getElementById("products-grid");e&&(e.innerHTML='<p class="catalog-loading">Caricamento...</p>');try{const a={};i&&(a.category_id=i.id);const t=await u(a);h(Array.isArray(t.data)?t.data:[])}catch{const a=document.getElementById("products-empty");e&&(e.innerHTML=""),a&&(a.style.display="block")}}async function f(){y();const a=new URLSearchParams(window.location.search).get("category_id");try{const[t,o]=await Promise.all([p().catch(()=>({data:[]})),u(a?{category_id:a}:{}).catch(()=>({data:[]}))]);if(g=Array.isArray(t.data)?t.data.filter(n=>n.is_active):[],a)t:for(const n of g){if(String(n.id)===a){i={id:a,name:n.name};break}const c=Array.isArray(n.children)?n.children:[];for(const d of c)if(String(d.id)===a){i={id:a,name:d.name};break t}}l(),h(Array.isArray(o.data)?o.data:[])}catch(t){console.error("Errore inizializzazione prodotti",t)}}f();
