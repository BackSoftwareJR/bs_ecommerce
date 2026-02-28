import{g as E,c as w,s as x,t as _}from"./api-JfdcZMFN.js";import{g as A}from"./dom-NB7M50He.js";function B(){const t=document.getElementById("year");t&&(t.textContent=String(new Date().getFullYear()))}function C(t){if(!t||typeof t!="string")return null;const a=t.trim(),n=a.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);if(n)return`https://www.youtube.com/embed/${n[1]}`;const s=a.match(/vimeo\.com\/(?:video\/)?(\d+)/);return s?`https://player.vimeo.com/video/${s[1]}`:null}function L(t){return!Array.isArray(t)||!t.length?"":`
    <div class="product-detail-tags">
      ${t.map(a=>`<span class="product-detail-tag">${i(a.name)}</span>`).join("")}
    </div>
  `}function k(t){return!Array.isArray(t)||!t.length?"":`
    <div class="product-detail-attributes">
      <h3 class="product-detail-attributes-title">Caratteristiche</h3>
      <ul class="product-detail-attributes-list">
        ${t.map(a=>`
          <li><strong>${i(a.label)}</strong>${a.value?` — ${i(a.value)}`:""}</li>
        `).join("")}
      </ul>
    </div>
  `}function i(t){if(t==null)return"";const a=document.createElement("div");return a.textContent=t,a.innerHTML}function I(t){return`
    <form id="product-contact-form" class="admin-form product-contact-form">
      <div class="form-group">
        <label for="pc-name">Nome</label>
        <input id="pc-name" name="name" class="input" required />
      </div>
      <div class="form-group">
        <label for="pc-email">Email</label>
        <input id="pc-email" name="email" type="email" class="input" required />
      </div>
      <div class="form-group">
        <label for="pc-message">Messaggio</label>
        <textarea id="pc-message" name="message" rows="4" class="input" required>Buongiorno, vorrei maggiori informazioni su: ${i(t.name)}.</textarea>
      </div>
      <button type="submit" class="btn btn-primary" id="pc-submit">Richiedi informazioni</button>
      <p class="product-contact-feedback" id="pc-feedback" style="display:none;"></p>
    </form>
  `}async function P(){B();const t=A("slug"),a=document.getElementById("product-detail"),n=document.getElementById("footer-text");if(!(!t||!a))try{const[s,g]=await Promise.all([E().catch(()=>({})),w(t)]);n&&s.footer_text&&(n.textContent=s.footer_text.replace(/{{year}}/gi,new Date().getFullYear().toString()));const e=g.data||g,m=Array.isArray(e.media)?e.media:[],l=m[0],b=e.tags||[],y=e.attributes||[],v=C(e.video_url),h=typeof e.price=="number"?`€ ${e.price.toFixed(2)}`:e.price||"";a.innerHTML=`
      <div class="product-detail-gallery">
        ${l&&l.url?`<img src="${l.url}" alt="${i(l.alt||e.name)}" class="product-detail-main-image" />`:'<div class="product-detail-placeholder"></div>'}
        ${m.length>1?`<div class="product-detail-thumbs">
              ${m.map((r,c)=>`<img src="${r.url}" alt="${i(r.alt||e.name)}" class="product-detail-thumb ${c===0?"active":""}" data-index="${c}" />`).join("")}
            </div>`:""}
      </div>
      <div class="product-detail-info">
        ${L(b)}
        ${e.label?`<span class="product-detail-label">${i(e.label)}</span>`:""}
        <h1 class="product-detail-title">${i(e.name)}</h1>
        <p class="product-detail-price">
          <span class="current">${h}</span>
          ${e.compare_at_price?`<span class="compare">€ ${Number(e.compare_at_price).toFixed(2)}</span>`:""}
        </p>
        ${e.short_description?`<p class="product-detail-short">${i(e.short_description)}</p>`:""}
        ${k(y)}
        ${v?`
          <div class="product-detail-video">
            <h3 class="product-detail-video-title">Video</h3>
            <div class="product-detail-video-wrap">
              <iframe src="${v}" title="Video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
          </div>
        `:""}
        <div class="product-detail-body">
          ${e.description||""}
        </div>
        <hr class="product-detail-hr" />
        <h2 class="section-title product-detail-form-title">Richiedi informazioni</h2>
        ${I(e)}
      </div>
    `;const p=a.querySelectorAll(".product-detail-thumb"),f=a.querySelector(".product-detail-main-image");f&&p.length&&p.forEach((r,c)=>{r.addEventListener("click",()=>{p.forEach($=>$.classList.remove("active")),r.classList.add("active"),f.src=r.src,f.alt=r.alt})});const d=document.getElementById("product-contact-form"),o=document.getElementById("pc-feedback"),u=document.getElementById("pc-submit");d&&o&&d.addEventListener("submit",async r=>{r.preventDefault(),o.style.display="block",o.textContent="Invio in corso...",o.className="product-contact-feedback",u&&(u.disabled=!0);try{const c=new FormData(d);await x({product_slug:e.slug,name:c.get("name")||"",email:c.get("email")||"",message:c.get("message")||""}),o.textContent="Richiesta inviata. Verrai ricontattato al più presto.",o.classList.add("success"),d.reset()}catch{o.textContent="Errore nell'invio. Riprova più tardi.",o.classList.add("error")}u&&(u.disabled=!1)}),_(t).catch(()=>{})}catch(s){console.error("Errore caricando il prodotto",s),a&&(a.innerHTML='<p class="empty-state">Prodotto non trovato.</p>')}}P();
