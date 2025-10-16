// supervisor.js - local submissions using localStorage
document.addEventListener('DOMContentLoaded', ()=>{
  const session = JSON.parse(localStorage.getItem('ehs_session') || 'null');
  if(!session) { window.location.href = 'index.html'; return; }
  document.getElementById('userInfo').textContent = session.name + ' ('+session.username+')';
  document.getElementById('supName').value = session.name;

  const dateInput = document.getElementById('dateInput');
  dateInput.value = new Date().toISOString().slice(0,10);
  setupGrid();
  document.getElementById('addSubmission').addEventListener('click', saveSubmission);
  document.getElementById('generatePpt').addEventListener('click', generatePPTForDate);
  loadMySubs();
});

const activities = ['Restroom Cleaning','Cafeteria Cleaning','Pantry Cleaning','Passage Cleaning','Reception Cleaning','Workstation Cleaning','Meeting Room Cleaning','Critical Room Cleaning'];
const photoSlots = [];

function setupGrid(){
  const grid = document.getElementById('photoGrid'); grid.innerHTML = '';
  photoSlots.length = 0;
  for(let i=0;i<9;i++){
    const box = document.createElement('div'); box.className='photo-box';
    const head = document.createElement('div'); head.textContent = 'Photo ' + (i+1);
    const thumb = document.createElement('div'); thumb.className='photo-thumb'; thumb.textContent='No photo';
    const desc = document.createElement('input'); desc.placeholder='Short description (optional)';
    const input = document.createElement('input'); input.type='file'; input.accept='image/*';
    input.addEventListener('change', async (e)=> {
      const f = e.target.files[0]; if(!f) return;
      thumb.textContent='Processing...';
      const b64 = await resizeImage(f, 1600);
      photoSlots[i].data = b64;
      thumb.innerHTML=''; const im = document.createElement('img'); im.src = b64; thumb.appendChild(im);
    });
    box.appendChild(head); box.appendChild(thumb); box.appendChild(desc); box.appendChild(input);
    grid.appendChild(box);
    photoSlots.push({desc, input, thumb, data:null});
  }
}

function resizeImage(file, maxSize=1600){
  return new Promise((resolve,reject)=>{
    const fr = new FileReader();
    fr.onload = ()=> {
      const img = new Image();
      img.onload = ()=> {
        let w=img.width, h=img.height;
        if(w>h && w>maxSize){ h=Math.round(h*maxSize/w); w=maxSize; }
        else if(h>w && h>maxSize){ w=Math.round(w*maxSize/h); h=maxSize; }
        else if(w>maxSize){ w=maxSize; h=Math.round(h*maxSize/w); }
        const c=document.createElement('canvas'); c.width=w; c.height=h;
        const ctx=c.getContext('2d'); ctx.drawImage(img,0,0,w,h);
        const data = c.toDataURL('image/jpeg',0.85);
        resolve(data);
      };
      img.onerror = reject; img.src = fr.result;
    };
    fr.onerror = reject; fr.readAsDataURL(file);
  });
}

function getSubmissions(){ try{ return JSON.parse(localStorage.getItem('ehs_submissions')||'[]'); }catch(e){ return []; } }
function saveSubmissions(a){ localStorage.setItem('ehs_submissions', JSON.stringify(a)); }

async function saveSubmission(){
  const activity = document.getElementById('activitySelect').value;
  const date = document.getElementById('dateInput').value;
  const supName = document.getElementById('supName').value || 'Unknown';
  const notes = document.getElementById('notes').value || '';
  const missing = photoSlots.some(s=>!s.data);
  if(missing){ alert('Please attach all 9 photos before saving.'); return; }
  const record = {id:'sub_'+Date.now().toString(36), activity, date, supName, notes, photos: photoSlots.map(s=>({desc: s.desc.value||'', data: s.data})), createdAt:new Date().toISOString()};
  const all = getSubmissions(); all.push(record); saveSubmissions(all);
  document.getElementById('status').textContent = 'Saved locally.';
  // reset grid
  setupGrid(); loadMySubs();
}

function loadMySubs(){
  const all = getSubmissions().slice().reverse();
  const list = document.getElementById('mySubs'); list.innerHTML = '';
  all.slice(0,20).forEach(r=>{
    const el = document.createElement('div'); el.className='sub-card';
    el.innerHTML = `<div style="flex:1"><strong>${r.activity}</strong><div class="small muted">${r.date} • ${r.supName}</div></div>
      <div style="display:flex;gap:8px">${r.photos.slice(0,3).map(p=>`<div style="width:64px;height:48px;overflow:hidden;border-radius:6px"><img src="${p.data}" style="width:100%;height:100%;object-fit:cover"></div>`).join('')}</div>`;
    list.appendChild(el);
  });
}

// Generate PPT for all submissions matching selected date
async function generatePPTForDate(){
  const date = document.getElementById('dateInput').value;
  if(!date){ alert('Choose a date'); return; }
  const all = getSubmissions().filter(s=>s.date===date);
  if(!all.length){ alert('No submissions for this date'); return; }
  // group by activity (one slide per activity). If multiple submissions same activity, merge photos (take first 9)
  const byAct = {};
  all.forEach(s=>{
    const k = s.activity;
    if(!byAct[k]) byAct[k] = {activity:k, supName: s.supName, notes: s.notes || '', steps: []};
    s.photos.forEach(p=> byAct[k].steps.push({desc: p.desc, imgData: p.data}));
  });
  const records = Object.values(byAct).map(a => ({...a, steps: a.steps.slice(0,9)}));
  await generateMultiSlidePPT(records, `EHS_${date}.pptx`);
}
