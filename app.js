const $=s=>document.querySelector(s),bw=$('#bw');
let S=JSON.parse(localStorage.getItem('fm')||'null')||{us:D.us,pend:[],ord:D.ord,stk:D.stk},me=JSON.parse(sessionStorage.getItem('me')||'null'),cur;
const save=()=>localStorage.setItem('fm',JSON.stringify(S)),
H=async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,'0')).join(''),
R={gerente:'Gerente',tecnico:'Técnico',inventario:'Inventario',atencion:'Atención',cliente:'Cliente'},
M={gerente:['Panel','Órdenes','Inventario','Equipo'],tecnico:['Mis órdenes'],inventario:['Inventario'],atencion:['Órdenes','Nueva orden','Solicitar técnico'],cliente:['Mi orden']},
E={Ingresado:'En Proceso','En Proceso':'Terminado',Terminado:'Entregado'},
tg=e=>`<span class="tag ${{Entregado:'m',Terminado:'l','En Proceso':'p'}[e]||'s'}">${e}</span>`,vc=o=>o.est!='Entregado'&&o.fp<D.corte;
async function L(e){e.preventDefault();const u=S.us.find(x=>x.u==$('#u').value.trim().toLowerCase());
 if(u&&u.h==await H($('#pw').value)){me=u;sessionStorage.setItem('me',JSON.stringify(u));boot()}else $('#er').textContent='Usuario o contraseña incorrectos.';return false}
function boot(){$('#login').hidden=!!me;$('#app').hidden=!me;$('#bb').hidden=!me;if(!me)return;$('#rl').textContent=R[me.r];$('#nm').textContent=me.n;
 $('#nv').innerHTML=M[me.r].map(v=>`<button onclick="go('${v}')">${v}</button>`).join('');go(M[me.r][0])}
function go(v){cur=v;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.textContent==v));$('#ti').textContent=v;$('#vw').innerHTML=V[v]()}
function tbl(a,f){return`<div class="tw"><table><tr><th>#<th>Cliente<th>Equipo<th>Estado<th>Técnico<th>Prometida${f?'<th>':''}</tr>`+a.map(o=>`<tr><td>${o.id}<td>${o.cl}<td>${o.eq}<td>${tg(o.est)}<td>${o.tec||'—'}<td class="${vc(o)?'sal':''}">${o.fp}${f?'<td>'+f(o):''}`).join('')+'</table></div>'}
const adv=id=>{const o=S.ord.find(x=>x.id==id);o.est=E[o.est];save();go(cur)},
dec=(i,ok)=>{const p=S.pend.splice(i,1)[0];if(ok)S.us.push({u:p.u,n:p.n,f:p.n.split(' ')[0],r:'tecnico',h:p.h});save();go(cur)},
rep=i=>{S.stk[i][1]+=5;save();go(cur)};
const V={
Panel:()=>{const v=S.ord.filter(vc).length,b=S.stk.filter(s=>s[1]<s[2]).length;return`<div class="cards"><div class="c"><span class="lbl">Órdenes</span><b>${D.k.n}</b><small>jul–set</small></div><div class="c"><span class="lbl">Entregas tardías</span><b class="sal">20,0 %</b><small>36 de 180</small></div><div class="c"><span class="lbl">Detenidas</span><b>8,3 %</b><small>15 por falta de repuesto</small></div><div class="c"><span class="lbl">Vencidas ahora</span><b class="sal">${v}</b><small>corte ${D.corte}</small></div></div>
<div class="c"><span class="lbl">Qué revisar primero</span><div class="row" onclick="go('Órdenes')"><span>01 · Órdenes vencidas (${v})</span>→</div><div class="row" onclick="go('Inventario')"><span>02 · Repuestos por agotarse (${b})</span>→</div><div class="row" onclick="go('Equipo')"><span>03 · Solicitudes de técnico (${S.pend.length})</span>→</div></div>`},
'Órdenes':()=>tbl(S.ord,me.r=='atencion'?o=>o.est=='Terminado'?`<button class="btn" onclick="adv(${o.id})">Entregar</button>`:'':0),
'Mis órdenes':()=>tbl(S.ord.filter(o=>o.tec==me.f),o=>E[o.est]&&o.est!='Terminado'?`<button class="btn" onclick="adv(${o.id})">Pasar a ${E[o.est]}</button>`:''),
Inventario:()=>`<div class="tw"><table><tr><th>Repuesto<th>Stock<th>Mínimo<th><th>${me.r=='inventario'?'<th>':''}</tr>`+S.stk.map((s,i)=>{const lo=s[1]<s[2];return`<tr><td>${s[0]}<td class="${lo?'sal':''}">${s[1]}<td>${s[2]}<td><span class="bar ${lo?'lo':''}"><i style="width:${Math.min(100,100*s[1]/s[2])}%"></i></span>${me.r=='inventario'?`<td><button class="btn g" onclick="rep(${i})">+5</button>`:''}`}).join('')+'</table></div>',
'Nueva orden':()=>`<form class="c" onsubmit="return NO(event)" style="max-width:460px"><label class="lbl">Cliente</label><input id="a1" required><label class="lbl">Equipo (marca y modelo)</label><input id="a2" required><label class="lbl">Falla reportada</label><textarea id="a3" required></textarea><label class="lbl">Técnico</label><select id="a4">${S.us.filter(x=>x.r=='tecnico').map(x=>`<option>${x.f}`).join('')}</select><button class="btn">Registrar orden</button></form>`,
'Solicitar técnico':()=>`<form class="c" onsubmit="return ST(event)" style="max-width:460px"><p class="lbl">El gerente debe aprobar la solicitud</p><label class="lbl">Nombre completo</label><input id="a1" required><label class="lbl">Usuario</label><input id="a2" required><label class="lbl">Contraseña inicial</label><input id="a3" type="password" minlength="6" required><button class="btn">Enviar solicitud</button></form><div class="c"><span class="lbl">Pendientes</span>${S.pend.map(p=>`<div class="row">${p.n} · ${p.u}<span class="tag s">Esperando al gerente</span></div>`).join('')||'<p>Sin solicitudes.</p>'}</div>`,
Equipo:()=>`<div class="c"><span class="lbl">Solicitudes de técnico</span>${S.pend.map((p,i)=>`<div class="row" style="cursor:default"><span>${p.n} · ${p.u} · pidió ${p.by}</span><span><button class="btn" onclick="dec(${i},1)">Aprobar</button> <button class="btn r" onclick="dec(${i},0)">Rechazar</button></span></div>`).join('')||'<p>No hay solicitudes pendientes.</p>'}</div><div class="c"><span class="lbl">Personal con acceso</span>${S.us.map(x=>`<div class="row" style="cursor:default">${x.n}<span class="tag p">${R[x.r]}</span></div>`).join('')}</div>`,
'Mi orden':()=>{const a=S.ord.filter(o=>o.cl==me.cl);return a.map(o=>`<div class="c"><span class="lbl">Orden #${o.id}</span><h3>${o.eq}</h3><div class="steps">${['Ingresado','En Proceso','Terminado','Entregado'].map((s,i,A)=>`<div class="${i<=A.indexOf(o.est)?'on':''}">${s}</div>`).join('')}</div><small>Fecha prometida: ${o.fp} · Técnico: ${o.tec||'por asignar'}</small></div>`).join('')||'<p>No tienes órdenes registradas.</p>'}};
function NO(e){e.preventDefault();const id=Math.max(...S.ord.map(o=>o.id))+1,d=new Date(D.corte);d.setDate(d.getDate()+3);S.ord.push({id,cl:$('#a1').value,eq:$('#a2').value,est:'Ingresado',tec:$('#a4').value,fp:d.toISOString().slice(0,10)});save();go('Órdenes');return false}
async function ST(e){e.preventDefault();S.pend.push({n:$('#a1').value,u:$('#a2').value.toLowerCase(),h:await H($('#a3').value),by:me.n});save();go(cur);return false}
const nz=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function bot(q){q=nz(q);const m=q.match(/\d{3}/);
 if(m){const o=S.ord.find(x=>x.id==m[0]);return!o||(me.r=='cliente'&&o.cl!=me.cl)?'No encuentro esa orden en tu cuenta.':`Orden ${o.id}: ${o.est}, técnico ${o.tec||'por asignar'}, fecha prometida ${o.fp}.`}
 if(/stock|repuesto|inventario/.test(q)){if(me.r=='cliente')return'El inventario es interno. Atención puede confirmarte si hay repuesto para tu equipo.';const l=S.stk.filter(s=>s[1]<s[2]);return l.length?'Bajo el mínimo: '+l.map(s=>`${s[0]} (${s[1]} de ${s[2]})`).join(', ')+'.':'Todo el stock está sobre el mínimo.'}
 if(/precio|costo|cuanto|servicio/.test(q))return'Precios base: '+D.svc.map(s=>`${s[0]} S/ ${s[1]}`).join('; ')+'. El total depende del repuesto.';
 if(/tard|retras|cumpl/.test(q))return me.r=='cliente'?'Ese dato es interno.':'Entregas tardías: 20,0 % (36 de 180). Meta: 10 % o menos.';
 if(/tecnico|agregar|nuevo/.test(q))return'Atención solicita al técnico y el gerente lo aprueba en la sección Equipo.';
 return'Puedo ayudarte con: estado de una orden (escribe su número), stock de repuestos, precios de servicios y entregas tardías.'}
function Q(e){e.preventDefault();const i=$('#bi'),m=$('#bm');m.innerHTML+=`<p class="u"></p><p>${bot(i.value)}</p>`;m.children[m.children.length-2].textContent=i.value;i.value='';m.scrollTop=1e9;return false}
boot()
