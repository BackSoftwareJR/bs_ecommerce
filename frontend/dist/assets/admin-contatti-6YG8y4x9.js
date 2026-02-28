import{d as r,u as i,v as l}from"./api-CLZultR4.js";import{e as c}from"./admin-auth-B7eemFN8.js";function s(a){if(a==null)return"";const e=document.createElement("div");return e.textContent=a,e.innerHTML}async function u(){await c();const a=document.getElementById("logout-btn");a&&a.addEventListener("click",async n=>{n.preventDefault();try{await r()}catch{}window.location.href="admin-login.html"});const e=document.getElementById("inquiries-list");if(e)try{const n=await i({per_page:50}),d=Array.isArray(n.data)?n.data:[];if(!d.length){e.innerHTML='<p class="empty-state">Nessuna richiesta.</p>';return}e.innerHTML=`
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Prodotto</th>
              <th>Messaggio</th>
              <th>Stato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${d.map(t=>`
              <tr>
                <td>${new Date(t.created_at).toLocaleDateString("it-IT")}</td>
                <td>${s(t.name)}</td>
                <td><a href="mailto:${s(t.email)}">${s(t.email)}</a></td>
                <td>${t.product?s(t.product.name):"—"}</td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">${s((t.message||"").slice(0,80))}…</td>
                <td><span class="badge badge-${t.status==="new"?"success":"muted"}">${t.status}</span></td>
                <td>
                  <select class="input input-small inquiry-status" data-id="${t.id}">
                    <option value="new" ${t.status==="new"?"selected":""}>new</option>
                    <option value="read" ${t.status==="read"?"selected":""}>read</option>
                    <option value="closed" ${t.status==="closed"?"selected":""}>closed</option>
                  </select>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `,e.querySelectorAll(".inquiry-status").forEach(t=>{t.addEventListener("change",async()=>{const o=parseInt(t.dataset.id,10);try{await l(o,{status:t.value})}catch{}})})}catch{e.innerHTML='<p class="empty-state">Errore caricamento.</p>'}}u();
