import{d as l,f as m}from"./api-SBpX3dnG.js";import{e as u}from"./admin-auth-BOMko-Yg.js";function r(e){if(e==null)return"";const n=document.createElement("div");return n.textContent=e,n.innerHTML}async function h(){await u();const e=document.getElementById("products-table-wrap"),n=document.getElementById("logout-btn");if(n&&n.addEventListener("click",async a=>{a.preventDefault();try{await l()}catch{}window.location.href="admin-login.html"}),!!e)try{const a=await m({per_page:100}),o=Array.isArray(a.data)?a.data:[];if(!o.length){e.innerHTML='<p class="empty-state">Nessun prodotto. <a href="./admin-prodotto.html">Aggiungi il primo</a>.</p>';return}e.innerHTML=`
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Prezzo</th>
              <th>Tag / Etichetta</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${o.map(t=>{const i=typeof t.price=="number"?`€ ${t.price.toFixed(2)}`:t.price||"",d=(t.tags||[]).map(c=>c.name).join(", "),s=t.label?`[${t.label}]`:"";return`
                <tr>
                  <td>${r(t.name)}</td>
                  <td>${i}</td>
                  <td>${r(d||s||"—")}</td>
                  <td>
                    <span class="badge ${t.is_active?"badge-success":"badge-muted"}">${t.is_active?"Attivo":"Nascosto"}</span>
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
    `}catch(a){console.error(a),e.innerHTML='<p class="empty-state">Errore nel caricamento.</p>'}}h();
