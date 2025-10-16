// admin.js - view submissions from localStorage and download PPT
document.addEventListener('DOMContentLoaded', ()=>{
  const session = JSON.parse(localStorage.getItem('ehs_session')||'null');
  if(!session || session.role!=='admin'){ window.location.href='index.html'; return; }
  document.getElementById('userInfo').textContent = session.name + ' ('+session.username+')';
  document.getElementById('loadBtn').addEventListener('click', loadForDate);
  document.getElementById('downloadPptBtn').addEventListener('click', downloadPPTForDate);
});

function getSubmissions(){ try{ return JSON.parse(localStorage.getItem('ehs_submissions')||'[]'); }catch(e){ return []; } }

function loadForDate(){
  const date = document.getElementById('dateFilter').value;
  const activity = document.getElementById('activityFilter').value;
  if(!date){ alert('Choose a date'); return; }
  const all = getSubmissions().filter(s=>s.date===date);
  const filtered = activity === 'all' ? all : all.filter(s=>s.activity===activity);
  renderList(filtered);
  document.getElementById('admStatus').textContent = `Found ${filtered.length} submissions`;
}

function renderList(list){
  const container = document.getElementById('list'); container.innerHTML = '';
  if(!list.length){ container.innerHTML = '<div class="small muted">No submissions</div>'; return; }
  list.forEach(r=>{
    const card = document.createElement('div'); card.className='sub-card';
    card.innerHTML = `<div style="flex:1"><strong>${r.activity}</strong><div class="small muted">${r.date} • ${r.supName}</div></div>
      <div style="display:flex;gap:8px">${r.photos.slice(0,6).map(p=>`<div style="width:64px;height:48px;overflow:hidden;border-radius:6px"><img src="${p.data}" style="width:100%;height:100%;object-fit:cover"></div>`).join('')}</div>
      <div style="margin-left:auto;display:flex;gap:8px"><button class="btn secondary" onclick='viewRecord("${r.id}")'>View</button></div>`;
    container.appendChild(card);
  });
}

function viewRecord(id){
  const all = getSubmissions(); const r = all.find(x=>x.id===id);
  if(!r) return alert('Not found');
  let txt = `${r.activity} — ${r.supName}\nDate: ${r.date}\nNotes: ${r.notes || '-'}\nPhotos:\n`;
  r.photos.forEach((p,i)=> txt += `${i+1}. ${p.desc || 'photo'}\n`);
  alert(txt);
}

async function downloadPPTForDate(){
  const date = document.getElementById('dateFilter').value;
  if(!date){ alert('Choose a date'); return; }
  const all = getSubmissions().filter(s=>s.date===date);
  if(!all.length){ alert('No submissions for this date'); return; }
  const byAct = {};
  all.forEach(s=>{
    const k = s.activity;
    if(!byAct[k]) byAct[k] = {activity:k, supName: s.supName, notes: s.notes || '', steps: []};
    s.photos.forEach(p => byAct[k].steps.push({desc:p.desc, imgData: p.data}));
  });
  const records = Object.values(byAct).map(a => ({...a, steps: a.steps.slice(0,9)}));
  await generateMultiSlidePPT(records, `EHS_${date}.pptx`);
}
