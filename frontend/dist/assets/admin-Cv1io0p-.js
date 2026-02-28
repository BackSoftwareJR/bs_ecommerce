import{d as h,e as u,f as g,h as v}from"./api-CLZultR4.js";import{e as b}from"./admin-auth-B7eemFN8.js";async function y(){await b();const a=document.getElementById("cards"),s=document.getElementById("latest-products"),r=document.getElementById("latest-pages"),l=document.getElementById("logout-btn");if(l&&l.addEventListener("click",async e=>{e.preventDefault();try{await h(),window.location.href="admin-login.html"}catch{window.location.href="admin-login.html"}}),!(!a||!s||!r))try{const[e,i,m]=await Promise.all([u().catch(()=>({data:{}})),g({per_page:20}).catch(()=>({data:[]})),v().catch(()=>({data:[]}))]),d=e.data||e||{},n=Array.isArray(i.data)?i.data:[],c=Array.isArray(m.data)?m.data:[];a.innerHTML=`
      <div class="admin-cards">
        <div class="admin-card">
          <span class="admin-card-label">Prodotti attivi</span>
          <span class="admin-card-value">${d.products_count??n.length}</span>
        </div>
        <div class="admin-card">
          <span class="admin-card-label">Pagine</span>
          <span class="admin-card-value">${d.pages_count??c.length}</span>
        </div>
        <div class="admin-card">
          <span class="admin-card-label">Richieste nuove</span>
          <span class="admin-card-value">${d.inquiries_new_count??0}</span>
        </div>
        <div class="admin-card">
          <span class="admin-card-label">Viste (30 gg)</span>
          <span class="admin-card-value">${d.product_views_last_30_days??0}</span>
        </div>
      </div>
    `,s.innerHTML=`
      <h2 class="admin-title" id="prodotti">Prodotti</h2>
      ${n.length?`<div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Prezzo</th>
                    <th>Stato</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${n.slice(0,10).map(t=>{const p=typeof t.price=="number"?`€ ${t.price.toFixed(2)}`:t.price||"";return`
                        <tr>
                          <td>${o(t.name)}</td>
                          <td>${p}</td>
                          <td>
                            <span class="badge ${t.is_active?"badge-success":"badge-muted"}">
                              ${t.is_active?"Attivo":"Nascosto"}
                            </span>
                          </td>
                          <td>
                            <a href="./admin-prodotto.html?id=${t.id}">Modifica</a>
                            &middot;
                            <a href="./prodotto.html?slug=${encodeURIComponent(t.slug)}" target="_blank">Vetrina</a>
                          </td>
                        </tr>
                      `}).join("")}
                </tbody>
              </table>
            </div>
            <p style="margin-top:12px;"><a href="./admin-prodotti.html">Vedi tutti i prodotti →</a></p>`:'<p class="empty-state">Nessun prodotto. <a href="./admin-prodotto.html">Aggiungi il primo</a>.</p>'}
    `,r.innerHTML=`
      <h2 class="admin-title" id="pagine">Pagine</h2>
      ${c.length?`<div class="admin-table-wrap">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Titolo</th>
                    <th>Slug</th>
                    <th>Stato</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${c.slice(0,10).map(t=>`
                      <tr>
                        <td>${o(t.title)}</td>
                        <td><code>${o(t.slug)}</code></td>
                        <td>
                          <span class="badge ${t.is_active?"badge-success":"badge-muted"}">
                            ${t.is_active?"Attiva":"Nascosta"}
                          </span>
                        </td>
                        <td>
                          <a href="./pagina.html?slug=${encodeURIComponent(t.slug)}" target="_blank">Vetrina</a>
                        </td>
                      </tr>
                    `).join("")}
                </tbody>
              </table>
            </div>
            <p style="margin-top:12px;"><a href="./admin-pagine.html">Gestisci pagine →</a></p>`:'<p class="empty-state">Nessuna pagina.</p>'}
    `}catch(e){console.error("Errore caricando la dashboard admin",e),a&&(a.innerHTML='<p class="empty-state">Impossibile caricare i dati.</p>')}}function o(a){if(a==null)return"";const s=document.createElement("div");return s.textContent=a,s.innerHTML}y();
