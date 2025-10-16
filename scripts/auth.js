// auth.js - local authentication stored in localStorage
// Default users (change or create new with signup)
const DEFAULT_USERS = [
  {username: 'super1', password: 'sup123', role: 'supervisor', name: 'Supervisor One'},
  {username: 'admin1', password: 'admin123', role: 'admin', name: 'Executive One'}
];

function getUsers(){
  const raw = localStorage.getItem('ehs_users');
  if(!raw) { localStorage.setItem('ehs_users', JSON.stringify(DEFAULT_USERS)); return DEFAULT_USERS; }
  try { return JSON.parse(raw); } catch(e){ localStorage.setItem('ehs_users', JSON.stringify(DEFAULT_USERS)); return DEFAULT_USERS; }
}

function saveUsers(users){ localStorage.setItem('ehs_users', JSON.stringify(users)); }

document.addEventListener('DOMContentLoaded', ()=>{
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const msg = document.getElementById('msg');

  if(loginBtn){
    loginBtn.addEventListener('click', ()=>{
      const u = document.getElementById('username').value.trim();
      const p = document.getElementById('password').value;
      if(!u || !p){ msg.textContent = 'Enter username & password'; return; }
      const users = getUsers();
      const found = users.find(x=>x.username===u && x.password===p);
      if(!found){ msg.textContent = 'Invalid credentials'; return; }
      // save session
      localStorage.setItem('ehs_session', JSON.stringify({username: found.username, role: found.role, name: found.name}));
      // redirect
      if(found.role === 'admin') window.location.href = 'admin.html';
      else window.location.href = 'supervisor.html';
    });
  }

  if(signupBtn){
    signupBtn.addEventListener('click', ()=>{
      const u = document.getElementById('username').value.trim();
      const p = document.getElementById('password').value;
      if(!u || !p){ msg.textContent = 'Enter username & password to create account'; return; }
      const users = getUsers();
      if(users.find(x=>x.username===u)){ msg.textContent = 'Username exists'; return; }
      const newUser = {username: u, password: p, role: 'supervisor', name: u};
      users.push(newUser); saveUsers(users);
      localStorage.setItem('ehs_session', JSON.stringify({username: u, role: 'supervisor', name: u}));
      msg.textContent = 'Account created and signed in';
      setTimeout(()=> window.location.href = 'supervisor.html', 800);
    });
  }

  // If already logged in and on login page, redirect
  const sessRaw = localStorage.getItem('ehs_session');
  if(sessRaw && (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/'))){
    const sess = JSON.parse(sessRaw);
    if(sess.role === 'admin') window.location.href = 'admin.html'; else window.location.href = 'supervisor.html';
  }

  // On other pages, display user info and protect routes
  const userInfoEl = document.getElementById('userInfo');
  if(userInfoEl){
    const session = localStorage.getItem('ehs_session');
    if(!session){ window.location.href = 'index.html'; return; }
    const s = JSON.parse(session);
    userInfoEl.textContent = s.name + ' (' + s.username + ')';
    // add a logout button
    const outBtn = document.createElement('button'); outBtn.textContent = 'Sign out'; outBtn.className='btn secondary'; outBtn.style.marginLeft='12px';
    outBtn.addEventListener('click', ()=>{ localStorage.removeItem('ehs_session'); window.location.href = 'index.html'; });
    userInfoEl.appendChild(outBtn);
  }
});
