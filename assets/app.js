/* ==========================================================================
   MathCloud JAMB Platform — shared utilities
   Used by index.html, student.html, admin.html
   ========================================================================== */

/* ---------------- Brand constants ---------------- */
const BRAND = {
  name: "MathCloud Tutorial",
  owner: "Marshall Jacob",
  email: "marshall12340@gmail.com",
  phone: "+2349129225442",
  whatsapp: "+2348102341648"
};

/* ---------------- Modal system (all alerts/confirms) ---------------- */
let __modalResolver = null;
function mcModal({icon="info", title="", message="", html="", actions=null, wide=false, dismissible=true} = {}){
  return new Promise(resolve=>{
    __modalResolver = resolve;
    const backdrop = document.getElementById("mc-modal-backdrop");
    const box = document.getElementById("mc-modal-box");
    box.classList.toggle("wide", !!wide);
    const iconMap = {info:"ℹ",success:"✓",error:"✕",warn:"⚠"};
    box.innerHTML = `
      ${dismissible ? `<button class="modal-close-x" data-close>&times;</button>` : ``}
      ${icon ? `<div class="modal-icon ${icon}">${iconMap[icon]||"ℹ"}</div>` : ``}
      ${title ? `<h2>${title}</h2>` : ``}
      ${message ? `<p>${message}</p>` : ``}
      ${html || ""}
      <div class="modal-actions" id="mc-modal-actions"></div>
    `;
    const actWrap = document.getElementById("mc-modal-actions");
    const btns = actions || [{label:"OK", value:true, style:"primary"}];
    btns.forEach(a=>{
      const b = document.createElement("button");
      b.className = "btn " + (a.style === "primary" ? "btn-primary" : a.style === "danger" ? "btn-danger" : "btn-ghost");
      b.textContent = a.label;
      b.onclick = ()=>{ closeMcModal(); resolve(a.value); };
      actWrap.appendChild(b);
    });
    if (dismissible){
      box.querySelector("[data-close]")?.addEventListener("click", ()=>{ closeMcModal(); resolve(null); });
    }
    backdrop.classList.add("show");
  });
}
function closeMcModal(){
  document.getElementById("mc-modal-backdrop").classList.remove("show");
}
function mcAlert(message, opts={}){
  return mcModal({icon: opts.icon || "info", title: opts.title || "Notice", message, actions:[{label:opts.okLabel||"OK", value:true, style:"primary"}]});
}
function mcConfirm(message, opts={}){
  return mcModal({
    icon: opts.icon || "warn", title: opts.title || "Please confirm", message,
    actions:[
      {label: opts.cancelLabel || "Cancel", value:false, style:"ghost"},
      {label: opts.okLabel || "Confirm", value:true, style: opts.danger ? "danger" : "primary"}
    ]
  });
}
function mcContactModal(reason){
  return mcModal({
    icon:"warn",
    title:"Account locked to another device",
    message: reason || "This student account is already active on a different device. For security, MathCloud Tutorial accounts can only be used on one device at a time.",
    wide:true,
    html: `
      <div style="margin-top:14px">
        <div class="contact-row"><div class="ic">✉</div><div><div style="font-weight:600">${BRAND.email}</div><div class="muted" style="font-size:12.5px">Email MathCloud Tutorial</div></div></div>
        <div class="contact-row"><div class="ic">☎</div><div><div style="font-weight:600">${BRAND.phone}</div><div class="muted" style="font-size:12.5px">Call the office</div></div></div>
        <div class="contact-row"><div class="ic">💬</div><div><div style="font-weight:600">${BRAND.whatsapp}</div><div class="muted" style="font-size:12.5px">WhatsApp for fastest response</div></div></div>
      </div>`,
    actions:[
      {label:"Email us", value:"email", style:"ghost"},
      {label:"WhatsApp us", value:"wa", style:"primary"}
    ]
  }).then(v=>{
    if (v === "email") window.location.href = `mailto:${BRAND.email}?subject=Device%20unlock%20request`;
    if (v === "wa") window.open(`https://wa.me/${BRAND.whatsapp.replace(/[^\d]/g,"")}?text=${encodeURIComponent("Hello MathCloud Tutorial, I need my account unlocked to log in on a new device.")}`, "_blank");
  });
}

/* ---------------- Toasts (small non-blocking confirmations) ---------------- */
function mcToast(message, type=""){
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap){ wrap = document.createElement("div"); wrap.className="toast-wrap"; document.body.appendChild(wrap); }
  const t = document.createElement("div");
  t.className = "toast " + type;
  t.textContent = message;
  wrap.appendChild(t);
  setTimeout(()=>{ t.style.opacity="0"; t.style.transition="opacity .3s"; setTimeout(()=>t.remove(), 300); }, 3200);
}

/* ---------------- Password hashing (SHA-256, client side) ----------------
   NOTE: Because Firebase Authentication is deliberately not used, there is
   no server to keep a secret salt/pepper. This hashes passwords before they
   are written to the Realtime Database so a casual glance at the DB (or the
   admin console) never shows a plaintext password — but it is NOT a
   substitute for real auth. See README for the full security note.
------------------------------------------------------------------------- */
async function mcHash(text){
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

/* ---------------- Device identity / one-device lock ---------------- */
function mcDeviceId(){
  let id = localStorage.getItem("mc_device_id");
  if (!id){
    id = (crypto.randomUUID ? crypto.randomUUID() : ("dev-" + Date.now() + "-" + Math.random().toString(16).slice(2)));
    localStorage.setItem("mc_device_id", id);
  }
  return id;
}
function mcDeviceInfo(){
  const ua = navigator.userAgent;
  let name = "Unknown device";
  if (/android/i.test(ua)) name = "Android device";
  else if (/iphone|ipad|ipod/i.test(ua)) name = "iOS device";
  else if (/windows/i.test(ua)) name = "Windows PC";
  else if (/mac/i.test(ua)) name = "Mac";
  else if (/linux/i.test(ua)) name = "Linux PC";
  return { name, ua, platform: navigator.platform || "", lastSeen: Date.now() };
}

/* ---------------- Greeting by device date/time ---------------- */
function mcGreeting(firstName=""){
  const h = new Date().getHours();
  let g = "Good evening";
  if (h < 12) g = "Good morning";
  else if (h < 17) g = "Good afternoon";
  return firstName ? `${g}, ${firstName}` : g;
}
function mcDateStamp(){
  return new Date().toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"long", day:"numeric" });
}

/* ==========================================================================
   Admin identity — Realtime Database only, no Firebase Auth
   ---------------------------------------------------------------------------
   Admin login now works the same way student login always has, PLUS a
   session token. The one thing RTDB rules can do that a plain client-side
   hash compare can't: a rule can compare "hash of what you just typed"
   against the stored hash on the SERVER side, without that stored hash
   ever being readable by any client (see database.rules.json — admins/
   and adminSessions/ are both .read:false). So the admin password hash
   is never exposed, unlike the student password hash.
   What this can't do, because there's no server: rate-limit guesses. The
   admin password's strength is the only thing stopping repeated attempts,
   so use a long random passphrase for the admin account, not a memorable
   word+numbers combo.
   ========================================================================== */
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h — re-login after this
function mcDbKey(str){
  return String(str||"").trim().toLowerCase()
    .replace(/\./g, ",").replace(/#/g, "%23").replace(/\$/g, "%24")
    .replace(/\[/g, "%5B").replace(/\]/g, "%5D").replace(/\//g, "%2F");
}
function mcRandomToken(){
  if (crypto.getRandomValues){
    const arr = new Uint8Array(24);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b=>b.toString(16).padStart(2,"0")).join("");
  }
  return "tok-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}
const mcAdmin = {
  session(){
    try{ const s = JSON.parse(sessionStorage.getItem("mc_admin_session")||"null");
      return (s && s.expiresAt > Date.now()) ? s : null;
    }catch(e){ return null; }
  },
  isLoggedIn(){ return !!this.session(); },
  meta(){
    const s = this.session();
    if (!s) throw new Error("SESSION_EXPIRED");
    return { _writerId: s.adminId, _writerToken: s.token };
  },
  async login(email, password){
    email = email.trim().toLowerCase();
    const idSnap = await db.ref("settings/adminIndex/" + mcDbKey(email)).once("value");
    if (!idSnap.exists()) throw new Error("NOT_FOUND");
    const adminId = idSnap.val();
    const attemptHash = await mcHash(password);
    const token = mcRandomToken();
    const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
    try{
      // The rule for this write only succeeds if attemptHash matches the
      // stored (unreadable) passwordHash — a wrong password gets rejected
      // by the database itself, not just by client-side logic.
      await db.ref("adminSessions/" + adminId).set({ attemptHash, token, expiresAt, deviceInfo: mcDeviceInfo() });
    }catch(err){
      throw new Error("BAD_PASSWORD");
    }
    const infoSnap = await db.ref("settings/adminInfo").once("value");
    const info = infoSnap.val() || {};
    const session = { adminId, token, expiresAt, name: info.name || "Admin", email: info.email || email };
    sessionStorage.setItem("mc_admin_session", JSON.stringify(session));
    return session;
  },
  async loginFirebase(email, uid){
    email = String(email||'').trim().toLowerCase();
    const allowed = await db.ref("settings/adminUsers/" + uid).once("value");
    if (allowed.val() !== true) throw new Error("FIREBASE_ADMIN_NOT_AUTHORIZED");
    const idSnap = await db.ref("settings/adminIndex/" + mcDbKey(email)).once("value");
    if (!idSnap.exists()) throw new Error("ADMIN_PROFILE_NOT_FOUND");
    const adminId = idSnap.val();
    const token = mcRandomToken(), expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
    await db.ref("adminSessions/" + adminId).set({ token, expiresAt, deviceInfo: mcDeviceInfo() });
    const infoSnap = await db.ref("settings/adminInfo").once("value");
    const info = infoSnap.val() || {};
    const session = { adminId, token, expiresAt, name: info.name || "Admin", email: info.email || email, authUid: uid, provider: "firebase" };
    sessionStorage.setItem("mc_admin_session", JSON.stringify(session));
    return session;
  },
  async loginGoogle(email, uid){
    email = String(email||'').trim().toLowerCase();
    const allowed = await db.ref("settings/adminUsers/" + uid).once("value");
    if (allowed.val() !== true) throw new Error("GOOGLE_ADMIN_NOT_AUTHORIZED");
    const idSnap = await db.ref("settings/adminIndex/" + mcDbKey(email)).once("value");
    if (!idSnap.exists()) throw new Error("ADMIN_PROFILE_NOT_FOUND");
    const adminId = idSnap.val();
    const token = mcRandomToken(), expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
    await db.ref("adminSessions/" + adminId).set({ token, expiresAt, deviceInfo: mcDeviceInfo() });
    const infoSnap = await db.ref("settings/adminInfo").once("value");
    const info = infoSnap.val() || {};
    const session = { adminId, token, expiresAt, name: info.name || "Admin", email: info.email || email, authUid: uid, provider: "google.com" };
    sessionStorage.setItem("mc_admin_session", JSON.stringify(session));
    return session;
  },
  logout(){ sessionStorage.removeItem("mc_admin_session"); },
  /* Update/create at a path whose OWN rule expects _writerId/_writerToken directly on it
     (students/{id}, subjects/{id}, questions/{sid}/{tid}/{qid}, settings/plans/{id}, etc). */
  write(path, data){ return db.ref(path).update({ ...data, ...this.meta() }); },
  /* Create a brand-new child under a path whose rule lives on the NEW child itself. */
  async push(parentPath, data){
    const key = db.ref().push().key;
    await db.ref(parentPath + "/" + key).set({ ...data, ...this.meta() });
    return key;
  },
  /* Edit something NESTED under an admin-gated parent (e.g. a topic inside a subject) —
     relPatch keys are relative to ancestorPath, e.g. {'topics/abc123/name': 'New name'}.
     A relPatch value of null deletes that nested key. Single call, no two-step needed,
     because the ancestor node itself still exists after the write. */
  writeNested(ancestorPath, relPatch){ return db.ref(ancestorPath).update({ ...relPatch, ...this.meta() }); },
  /* Remove an ENTIRE admin-gated node (not a nested child of one). RTDB rules can't see
     "who's deleting" on a delete (there's no data left to check), so this is two calls:
     first flag it deleted (a normal, token-checked update), then remove it — the rule
     allows the physical removal only once that flag is already set. */
  async remove(path){
    await this.write(path, { _deleted: true });
    return db.ref(path).remove();
  }
};

/* ---------------- Session helpers (sessionStorage — session-scoped) ---------------- */
const mcSession = {
  setStudent(id){ sessionStorage.setItem("mc_student_id", id); },
  getStudent(){ return sessionStorage.getItem("mc_student_id"); },
  setAdmin(id){ sessionStorage.setItem("mc_admin_id", id); },
  getAdmin(){ return sessionStorage.getItem("mc_admin_id"); },
  getStudentSession(){
    try{
      const s=JSON.parse(sessionStorage.getItem("mc_student_session")||"null");
      return (s && s.expiresAt>Date.now()) ? s : null;
    }catch(e){ return null; }
  },
  clear(){
    sessionStorage.removeItem("mc_student_id");
    sessionStorage.removeItem("mc_admin_id");
    sessionStorage.removeItem("mc_student_session");
  }
};

/* ---------------- Online / offline handling ---------------- */
function mcInitConnectivity(){
  const banner = document.getElementById("mc-offline-banner");
  function update(){
    const online = navigator.onLine;
    if (banner) banner.classList.toggle("show", !online);
    if (!online && !location.pathname.endsWith("offline.html")){
      // keep user on page but flag it clearly; full redirect only if nav attempted
    }
  }
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}

/* ---------------- Firebase Realtime DB connection watcher ---------------- */
function mcInitConnectionWatcher(){
  if (typeof db === "undefined") return;
  const el = document.getElementById("mc-conn-status");
  db.ref(".info/connected").on("value", snap=>{
    const connected = snap.val() === true;
    if (el){
      el.textContent = connected ? "" : "Reconnecting to MathCloud servers…";
      el.classList.toggle("show", !connected);
    }
  });
}

/* ---------------- Injected shared chrome (modal root + offline banner) ---------------- */
function mcMountChrome(){
  if (!document.getElementById("mc-modal-backdrop")){
    const d = document.createElement("div");
    d.id = "mc-modal-backdrop";
    d.className = "modal-backdrop";
    d.innerHTML = `<div class="modal-box" id="mc-modal-box"></div>`;
    d.addEventListener("click", e=>{ if (e.target === d){ closeMcModal(); if(__modalResolver) __modalResolver(null); } });
    document.body.appendChild(d);
  }
  if (!document.getElementById("mc-offline-banner")){
    const b = document.createElement("div");
    b.id = "mc-offline-banner";
    b.className = "offline-banner";
    b.textContent = "You're offline — reconnect to keep using MathCloud Tutorial.";
    document.body.appendChild(b);
  }
  if (!document.getElementById("mc-conn-status")){
    const c = document.createElement("div");
    c.id = "mc-conn-status";
    c.className = "offline-banner";
    c.style.background = "var(--amber)";
    c.style.color = "#1a1200";
    document.body.appendChild(c);
  }
  mcInitConnectivity();
}
document.addEventListener("DOMContentLoaded", mcMountChrome);

/* ---------------- Shuffle helper (Fisher–Yates, for UCAT-style randomised order) ---------------- */
function mcShuffle(arr){
  const a = arr.slice();
  for (let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

/* ---------------- Sidebar toggle (mobile) ---------------- */
function mcToggleSidebar(){
  document.querySelector(".sidebar")?.classList.toggle("open");
  document.querySelector(".sidebar-scrim")?.classList.toggle("show");
}

/* ---------------- Subscription helpers ---------------- */
const MC_PAYMENT = {
  provider: "Flutterwave",
  paymentLink: "https://flutterwave.com/pay/7n1wlo69qnrs",
  currency: "NGN",
  whatsapp: "2348102341648"
};

/* MathCloud subscription pricing: 1 month is the ₦5,000 base price.
   Every longer plan is discounted from the ₦5,000 × months total. */
const MC_DEFAULT_PLANS = {
  m1:  { label:"1 Month",  months:1,  price:5000,  discount:0 },
  m2:  { label:"2 Months", months:2,  price:9500,  discount:5 },
  m3:  { label:"3 Months", months:3,  price:13500, discount:10 },
  m4:  { label:"4 Months", months:4,  price:18000, discount:10 },
  m5:  { label:"5 Months", months:5,  price:21250, discount:15 },
  m6:  { label:"6 Months", months:6,  price:24000, discount:20 },
  m7:  { label:"7 Months", months:7,  price:28000, discount:20 },
  m8:  { label:"8 Months", months:8,  price:30000, discount:25 },
  m9:  { label:"9 Months", months:9,  price:31500, discount:30 },
  m10: { label:"10 Months",months:10, price:35000, discount:30 },
  m11: { label:"11 Months",months:11, price:35750, discount:35 },
  m12: { label:"12 Months",months:12, price:36000, discount:40 }
};
function mcDefaultPlans(){ return JSON.parse(JSON.stringify(MC_DEFAULT_PLANS)); }
function mcSubscriptionActive(student){
  return !!(student && student.subscription && student.subscription.endAt && student.subscription.endAt > Date.now());
}
function mcSubscriptionMsRemaining(student){
  if (!mcSubscriptionActive(student)) return 0;
  return student.subscription.endAt - Date.now();
}
function mcFormatDuration(ms){
  if (ms <= 0) return "Expired";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${mins}m remaining`;
  return `${mins}m remaining`;
}
function mcPaywallCard(onSubscribe){
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <div class="modal-icon warn" style="margin-bottom:10px">🔒</div>
    <h2>Subscription required</h2>
    <p>Your MathCloud Tutorial subscription has ended, so notes and questions are locked. Renew to keep studying.</p>
    <button class="btn btn-primary" id="paywallBtn">Subscribe / Renew</button>
  `;
  div.querySelector("#paywallBtn").onclick = onSubscribe;
  return div;
}

/* ---------------- Question option normalisation ---------------- */
function mcEscape(value){return String(value??"").replace(/[&<>\"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));}
function mcGetQuestionOptions(q){
  const out=[]; const add=(key,text)=>{if(text===undefined||text===null||String(text).trim()==="")return; key=String(key).trim().toUpperCase(); if(!out.some(o=>o.key===key))out.push({key,text:String(text)});};
  ["A","B","C","D","E","F"].forEach(k=>add(k,q["option"+k]));
  if(Array.isArray(q.options))q.options.forEach((o,i)=>{if(typeof o==="string")add(String.fromCharCode(65+i),o);else if(o)add(o.key||o.label||String.fromCharCode(65+i),o.text??o.value??o.option);});
  if(q.options&&typeof q.options==="object"&&!Array.isArray(q.options))Object.entries(q.options).forEach(([k,v])=>add(k,v&&typeof v==="object"?(v.text??v.value??v.option):v));
  return out;
}
function mcNormalizeCorrect(correct,opts){
  const raw=String(correct??"").trim();
  if(!raw)return opts[0]?.key||"A";
  const u=raw.toUpperCase();
  const exact=opts.find(o=>o.key===u);
  if(exact)return exact.key;
  const text=opts.find(o=>o.text.trim().toLowerCase()===raw.toLowerCase());
  return text?text.key:u;
}

/* ---------------- Text-to-speech: Nigerian English + Hausa/Igbo/Yoruba ---------------- */
let __mcUtterance=null,__mcVoicesPromise=null,__mcSpeechLanguage=localStorage.getItem("mcSpeechLanguage")||"en-NG";
const __mcLangNames={"en-NG":"Nigerian English","en-GB":"British English","en-US":"American English","ha-NG":"Hausa","ig-NG":"Igbo","yo-NG":"Yorùbá"};
function mcVoicesReady(){if(!(window.speechSynthesis))return Promise.resolve([]);const v=speechSynthesis.getVoices();if(v.length)return Promise.resolve(v);if(__mcVoicesPromise)return __mcVoicesPromise;__mcVoicesPromise=new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;resolve(speechSynthesis.getVoices());};speechSynthesis.addEventListener("voiceschanged",finish,{once:true});setTimeout(finish,1800);});return __mcVoicesPromise;}
function mcLangScore(v,target){const l=(v.lang||"").toLowerCase(),n=(v.name||"").toLowerCase(),t=target.toLowerCase(),b=t.split("-")[0];let s=0;if(l===t)s+=100;if(l.startsWith(b+"-"))s+=70;if(l===b)s+=65;if(target==="en-NG"&&/en-(ng|gb|za|ke)/i.test(l))s+=35;if(target==="en-NG"&&/nigeria|africa|african/i.test(n))s+=50;if(!v.localService)s+=12;if(/natural|neural|online|premium|enhanced|wavenet|studio/i.test(n))s+=30;if(/google|microsoft/i.test(n))s+=8;if(/compact|espeak|robotic/i.test(n))s-=20;return s;}
function mcPickVoice(voices,target){const list=voices||speechSynthesis.getVoices();if(!list.length)return null;return list.slice().sort((a,b)=>mcLangScore(b,target)-mcLangScore(a,target))[0];}
function mcSetSpeechLanguage(lang){__mcSpeechLanguage=lang||"en-NG";localStorage.setItem("mcSpeechLanguage",__mcSpeechLanguage);mcUpdateVoiceStatus();}
async function mcUpdateVoiceStatus(){const el=document.getElementById("voiceStatus");if(!el||!window.speechSynthesis)return;const v=mcPickVoice(await mcVoicesReady(),__mcSpeechLanguage);el.textContent=v?`${__mcLangNames[__mcSpeechLanguage]}: ${v.name}`:`${__mcLangNames[__mcSpeechLanguage]}: browser fallback`;}
function mcSpeakQuestion(index,btn){const q=window.__mcActiveQuizQuestions?.[index];if(!q)return;mcSpeak([q.question,...(q.opts||[]).map(o=>`${o.key}. ${o.text}`)].join(". "),btn);}
async function mcSpeak(text,btnEl){if(!window.speechSynthesis){mcToast("Read-aloud isn't supported on this browser.");return;}if(speechSynthesis.speaking){speechSynthesis.cancel();if(btnEl)btnEl.textContent="🔊 Read aloud";return;}const clean=String(text||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();if(!clean)return;if(btnEl)btnEl.textContent="⏳ Loading voice…";const voices=await mcVoicesReady(),v=mcPickVoice(voices,__mcSpeechLanguage),u=new SpeechSynthesisUtterance(clean);if(v)u.voice=v;u.lang=v?.lang||__mcSpeechLanguage;u.rate=__mcSpeechLanguage.startsWith("en")?.94:.88;u.pitch=1;u.volume=1;u.onend=()=>{if(btnEl)btnEl.textContent="🔊 Read aloud";};u.onerror=()=>{if(btnEl)btnEl.textContent="🔊 Read aloud";};__mcUtterance=u;if(btnEl)btnEl.textContent="⏹ Stop reading";speechSynthesis.cancel();speechSynthesis.speak(u);}

/* ---------------- MathJax typesetting helper ---------------- */
function mcTypeset(el){
  if (window.MathJax && MathJax.typesetPromise){
    MathJax.typesetPromise(el ? [el] : undefined).catch(()=>{});
  }
}

document.addEventListener("DOMContentLoaded",()=>{const sel=document.getElementById("voiceLanguage");if(sel)sel.value=__mcSpeechLanguage;mcUpdateVoiceStatus();});
