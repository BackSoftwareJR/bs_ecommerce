import{d as r,h as o}from"./api-BXrcMaAh.js";import{e as d}from"./admin-auth-Cq3QAKBC.js";function s(a){if(a==null)return"";const t=document.createElement("div");return t.textContent=a,t.innerHTML}async function c(){await d();const a=document.getElementById("logout-btn");a&&a.addEventListener("click",async e=>{e.preventDefault();try{await r()}catch{}window.location.href="admin-login.html"});const t=document.getElementById("pages-list");if(t)try{const e=await o(),i=Array.isArray(e.data)?e.data:[];if(!i.length){t.innerHTML='<p class="empty-state">Nessuna pagina. La gestione crea/modifica sarà disponibile in una prossima versione.</p>';return}t.innerHTML=`
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr><th>Titolo</th><th>Slug</th><th>Stato</th><th></th></tr>
          </thead>
          <tbody>
            ${i.map(n=>`
              <tr>
                <td>${s(n.title)}</td>
                <td><code>${s(n.slug)}</code></td>
                <td><span class="badge ${n.is_active?"badge-success":"badge-muted"}">${n.is_active?"Attiva":"Nascosta"}</span></td>
                <td><a href="./pagina.html?slug=${encodeURIComponent(n.slug)}" target="_blank">Apri</a></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `}catch{t.innerHTML='<p class="empty-state">Errore caricamento.</p>'}}c();
