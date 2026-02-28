import{b,a as L}from"./api-CwRZMsSl.js";let h=[],p=[],o=null,u="",E=null;function C(){const a=document.getElementById("year");a&&(a.textContent=String(new Date().getFullYear()))}function l(a){if(a==null)return"";const t=document.createElement("div");return t.textContent=a,t.innerHTML}function _(a){return a?a.replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim():""}function v(a){return String(a||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}function S(a,t){if(!t||!a)return l(a);const n=l(a),e=l(t.trim()).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return e?n.replace(new RegExp(`(${e})`,"gi"),'<mark class="sh">$1</mark>'):n}function A(){let a=h;o&&(a=a.filter(n=>String(n.category_id)===String(o.id)));const t=v(u.trim());if(t){const n=t.split(/\s+/).filter(Boolean);a=a.filter(e=>{var c;const r=v([e.name,e.model_name,e.short_description,_(e.description),(c=e.category)==null?void 0:c.name,...(e.tags||[]).map(i=>i.name)].join(" "));return n.every(i=>r.includes(i))}),a=a.slice().sort((e,r)=>{const c=v(e.name).startsWith(t)?0:1,i=v(r.name).startsWith(t)?0:1;return c-i})}return a}function g(){const a=document.getElementById("products-grid"),t=document.getElementById("products-empty"),n=document.getElementById("catalog-count"),e=document.getElementById("catalog-title");if(!a||!t)return;const r=A(),c=u.trim();if(e&&(c?e.textContent=`Risultati per "${c}"`:o?e.textContent=o.name:e.textContent="Tutti i prodotti"),n&&(n.textContent=r.length?`(${r.length})`:""),!r.length){a.innerHTML="",t.innerHTML=c?`Nessun risultato per <strong>"${l(c)}"</strong>. Prova con altri termini.`:"Nessun prodotto disponibile al momento.",t.style.display="block";return}t.style.display="none",a.innerHTML=r.map(i=>{const s=Array.isArray(i.media)?i.media[0]:null,f=c?S(i.name,c):l(i.name),d=i.model_name?`<p class="hw-pcard-model">${c?S(i.model_name,c):l(i.model_name)}</p>`:"";return`
        <a href="./prodotto.html?slug=${encodeURIComponent(i.slug)}" class="hw-pcard">
          <div class="hw-pcard-img">
            ${s!=null&&s.url?`<img src="${s.url}" alt="${l(s.alt||i.name)}" loading="lazy" />`:'<div class="hw-pcard-placeholder"></div>'}
          </div>
          <div class="hw-pcard-body">
            <h3 class="hw-pcard-name">${f}</h3>
            ${d}
            <span class="hw-pcard-link">Scopri di più</span>
          </div>
        </a>`}).join("")}function y(){const a=document.getElementById("category-nav");if(!a)return;const t={};h.forEach(e=>{e.category_id&&(t[e.category_id]=(t[e.category_id]||0)+1)});let n=`<div class="catalog-cat-group">
    <div class="catalog-cat-head ${o?"":"active"}" data-action="all">
      Tutti i prodotti
      <span class="catalog-cat-badge">${h.length}</span>
    </div>
  </div>`;p.forEach(e=>{const r=Array.isArray(e.children)?e.children.filter(d=>d.is_active):[],c=o&&String(o.id)===String(e.id),i=r.some(d=>o&&String(o.id)===String(d.id)),s=c||i,f=t[e.id]||0;if(r.length>0){const d=r.map(m=>{const $=t[m.id]||0;return`<button class="catalog-cat-child ${o&&String(o.id)===String(m.id)?"active":""}"
                        data-cat-id="${m.id}" data-cat-name="${l(m.name)}">
                  ${l(m.name)}
                  ${$?`<span class="catalog-cat-badge">${$}</span>`:""}
                </button>`}).join("");n+=`<div class="catalog-cat-group">
        <div class="catalog-cat-head ${s?"open":""} ${c?"active":""}"
             data-cat-id="${e.id}" data-cat-name="${l(e.name)}" data-has-children="1">
          <span>${l(e.name)}</span>
          <span class="catalog-cat-icon">${s?"−":"+"}</span>
        </div>
        <div class="catalog-cat-children ${s?"open":""}">${d}</div>
      </div>`}else n+=`<div class="catalog-cat-group">
        <div class="catalog-cat-head ${c?"active":""}"
             data-cat-id="${e.id}" data-cat-name="${l(e.name)}">
          ${l(e.name)}
          ${f?`<span class="catalog-cat-badge">${f}</span>`:""}
        </div>
      </div>`}),a.innerHTML=n,I(a)}function I(a){a.querySelectorAll(".catalog-cat-head").forEach(t=>{t.addEventListener("click",()=>{if(t.dataset.action==="all"){o=null,y(),g();return}if(t.dataset.hasChildren==="1"){t.classList.toggle("open");const n=t.nextElementSibling;n&&n.classList.toggle("open");const e=t.querySelector(".catalog-cat-icon");e&&(e.textContent=t.classList.contains("open")?"−":"+")}else o={id:t.dataset.catId,name:t.dataset.catName},y(),g()})}),a.querySelectorAll(".catalog-cat-child").forEach(t=>{t.addEventListener("click",()=>{o={id:t.dataset.catId,name:t.dataset.catName},y(),g()})})}function w(){const a=document.getElementById("catalog-search"),t=document.getElementById("catalog-search-clear"),n=document.getElementById("catalog-search-wrap");a&&(a.addEventListener("input",()=>{const e=a.value;u=e,t&&t.classList.toggle("visible",e.length>0),n&&n.classList.toggle("has-value",e.length>0),clearTimeout(E),E=setTimeout(()=>{g()},150)}),t==null||t.addEventListener("click",()=>{a.value="",u="",t.classList.remove("visible"),n==null||n.classList.remove("has-value"),a.focus(),g()}),a.addEventListener("keydown",e=>{e.key==="Escape"&&(a.value="",u="",t==null||t.classList.remove("visible"),n==null||n.classList.remove("has-value"),g())}))}async function k(){C();const t=new URLSearchParams(window.location.search).get("category_id");try{const[n,e]=await Promise.all([b().catch(()=>({data:[]})),L({per_page:500}).catch(()=>({data:[]}))]);p=Array.isArray(n.data)?n.data.filter(i=>i.is_active):[],h=Array.isArray(e.data)?e.data:[];const r={},c=i=>i.forEach(s=>{r[s.id]=s,s.children&&c(s.children)});if(c(p),h.forEach(i=>{i.category_id&&(i.category=r[i.category_id]||null)}),t)t:for(const i of p){if(String(i.id)===t){o={id:t,name:i.name};break}for(const s of i.children||[])if(String(s.id)===t){o={id:t,name:s.name};break t}}w(),y(),g()}catch(n){console.error("Errore init prodotti",n)}}k();
