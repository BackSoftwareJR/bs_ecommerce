import{d as o,w as i}from"./api-SBpX3dnG.js";import{e as d}from"./admin-auth-BOMko-Yg.js";function s(e){if(e==null)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}async function c(){await d();const e=document.getElementById("logout-btn");e&&e.addEventListener("click",async a=>{a.preventDefault();try{await o()}catch{}window.location.href="admin-login.html"});const t=document.getElementById("stats-views");if(t)try{const a=await i({days:30,limit:20}),n=Array.isArray(a.data)?a.data:[];if(!n.length){t.innerHTML='<p class="empty-state">Nessun dato di visualizzazione.</p>';return}t.innerHTML=`
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Prodotto</th><th>Viste (30 gg)</th><th></th></tr>
          </thead>
          <tbody>
            ${n.map(r=>`
              <tr>
                <td>${s(r.product_name)}</td>
                <td>${r.views}</td>
                <td><a href="./prodotto.html?slug=${encodeURIComponent(r.product_slug||"")}" target="_blank">Vetrina</a></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `}catch{t.innerHTML='<p class="empty-state">Errore caricamento.</p>'}}c();
