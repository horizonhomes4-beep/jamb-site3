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

/* ---------------- Modal system ---------------- */
let __modalResolver = null;

function ensureMcModalUI() {
  if (document.getElementById("mc-modal-backdrop")) return;

  const style = document.createElement("style");
  style.id = "mc-modal-runtime-style";
  style.textContent = `
    #mc-modal-backdrop{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(3,7,18,.72);backdrop-filter:blur(14px)}
    #mc-modal-backdrop.show{display:flex;animation:mcFade .18s ease}
    #mc-modal-box{width:min(560px,100%);max-height:min(86vh,760px);overflow:auto;background:linear-gradient(145deg,#111c35,#17284b);border:1px solid rgba(125,170,255,.25);border-radius:24px;padding:24px;box-shadow:0 30px 90px rgba(0,0,0,.55);position:relative;color:#eef5ff}
    #mc-modal-box.wide{width:min(820px,100%)}
    #mc-modal-box h2{margin:0 0 10px;font-size:22px}
    #mc-modal-box p{line-height:1.65;color:#c3d0e5}
    .modal-close-x{position:absolute;right:14px;top:12px;width:38px;height:38px;border:0;border-radius:12px;background:#ffffff10;color:#fff;font-size:24px;cursor:pointer}
    .modal-icon{width:48px;height:48px;border-radius:15px;display:grid;place-items:center;font-size:22px;margin-bottom:14px;background:#ffffff12}
    .modal-icon.success{background:#22c55e18;color:#6ee7a7}.modal-icon.error{background:#ef444418;color:#ff8c9b}.modal-icon.warn{background:#f59e0b18;color:#ffd27a}.modal-icon.info{background:#60a5fa18;color:#9bc7ff}
    .modal-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:20px}
    .modal-actions .btn{min-width:110px}
    #mc-modal-box input,#mc-modal-box select,#mc-modal-box textarea{width:100%}
    @keyframes mcFade{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:scale(1)}}
  `;
  document.head.appendChild(style);

  const backdrop=document.createElement("div");
  backdrop.id="mc-modal-backdrop";
  backdrop.innerHTML='<div id="mc-modal-box" role="dialog" aria-modal="true" aria-live="polite"></div>';
  backdrop.addEventListener("click",e=>{
    if(e.target===backdrop) closeMcModal();
  });
  document.body.appendChild(backdrop);
}

function mcModal({
  icon = "info",
  title = "",
  message = "",
  html = "",
  actions = null,
  wide = false,
  dismissible = true
} = {}) {
  return new Promise(resolve => {
    ensureMcModalUI();
    __modalResolver = resolve;

    const backdrop = document.getElementById("mc-modal-backdrop");
    const box = document.getElementById("mc-modal-box");

    if (!backdrop || !box) {
      resolve(true);
      return;
    }

    box.classList.toggle("wide", !!wide);

    const iconMap = {
      info: "ℹ",
      success: "✓",
      error: "✕",
      warn: "⚠"
    };

    box.innerHTML = `
      ${
        dismissible
          ? `<button class="modal-close-x" data-close>&times;</button>`
          : ""
      }

      ${
        icon
          ? `<div class="modal-icon ${icon}">${iconMap[icon] || "ℹ"}</div>`
          : ""
      }

      ${title ? `<h2>${title}</h2>` : ""}
      ${message ? `<p>${message}</p>` : ""}
      ${html || ""}

      <div class="modal-actions" id="mc-modal-actions"></div>
    `;

    const actWrap = document.getElementById("mc-modal-actions");

    const btns =
      actions || [
        {
          label: "OK",
          value: true,
          style: "primary"
        }
      ];

    btns.forEach(a => {
      const b = document.createElement("button");

      b.className =
        "btn " +
        (
          a.style === "primary"
            ? "btn-primary"
            : a.style === "danger"
              ? "btn-danger"
              : "btn-ghost"
        );

      b.textContent = a.label;

      b.onclick = () => {
        closeMcModal();
        resolve(a.value);
      };

      actWrap.appendChild(b);
    });

    if (dismissible) {
      box
        .querySelector("[data-close]")
        ?.addEventListener("click", () => {
          closeMcModal();
          resolve(null);
        });
    }

    backdrop.classList.add("show");
  });
}

function closeMcModal() {
  const backdrop = document.getElementById("mc-modal-backdrop");

  if (backdrop) {
    backdrop.classList.remove("show");
  }
}

function mcAlert(message, opts = {}) {
  return mcModal({
    icon: opts.icon || "info",
    title: opts.title || "Notice",
    message,
    actions: [
      {
        label: opts.okLabel || "OK",
        value: true,
        style: "primary"
      }
    ]
  });
}

function mcConfirm(message, opts = {}) {
  return mcModal({
    icon: opts.icon || "warn",
    title: opts.title || "Please confirm",
    message,

    actions: [
      {
        label: opts.cancelLabel || "Cancel",
        value: false,
        style: "ghost"
      },
      {
        label: opts.okLabel || "Confirm",
        value: true,
        style: opts.danger ? "danger" : "primary"
      }
    ]
  });
}

function mcContactModal(reason) {
  return mcModal({
    icon: "warn",

    title: "Account locked to another device",

    message:
      reason ||
      "This student account is already active on a different device. For security, MathCloud Tutorial accounts can only be used on one device at a time.",

    wide: true,

    html: `
      <div style="margin-top:14px">

        <div class="contact-row">
          <div class="ic">✉</div>
          <div>
            <div style="font-weight:600">${BRAND.email}</div>
            <div class="muted" style="font-size:12.5px">
              Email MathCloud Tutorial
            </div>
          </div>
        </div>

        <div class="contact-row">
          <div class="ic">☎</div>
          <div>
            <div style="font-weight:600">${BRAND.phone}</div>
            <div class="muted" style="font-size:12.5px">
              Call the office
            </div>
          </div>
        </div>

        <div class="contact-row">
          <div class="ic">💬</div>
          <div>
            <div style="font-weight:600">${BRAND.whatsapp}</div>
            <div class="muted" style="font-size:12.5px">
              WhatsApp for fastest response
            </div>
          </div>
        </div>

      </div>
    `,

    actions: [
      {
        label: "Email us",
        value: "email",
        style: "ghost"
      },
      {
        label: "WhatsApp us",
        value: "wa",
        style: "primary"
      }
    ]
  }).then(v => {
    if (v === "email") {
      window.location.href =
        `mailto:${BRAND.email}?subject=Device%20unlock%20request`;
    }

    if (v === "wa") {
      window.open(
        `https://wa.me/${BRAND.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
          "Hello MathCloud Tutorial, I need my account unlocked to log in on a new device."
        )}`,
        "_blank"
      );
    }
  });
}

function mcMaskReference(value) {
  const v = String(value || "").trim();
  if (!v) return "—";
  if (v.length <= 6) return "••••••";
  return `${v.slice(0,3)}••••${v.slice(-3)}`;
}

/* ---------------- Toasts ---------------- */

function mcToast(message, type = "") {
  let wrap = document.querySelector(".toast-wrap");

  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }

  const t = document.createElement("div");

  t.className = "toast " + type;
  t.textContent = message;

  wrap.appendChild(t);

  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transition = "opacity .3s";

    setTimeout(() => {
      t.remove();
    }, 300);
  }, 3200);
}

/* ---------------- Password hashing ---------------- */

async function mcHash(text) {
  const enc = new TextEncoder().encode(text);

  const buf = await crypto.subtle.digest(
    "SHA-256",
    enc
  );

  return Array
    .from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ---------------- Device identity ---------------- */

function mcDeviceId() {
  let id = localStorage.getItem("mc_device_id");

  if (!id) {
    id =
      crypto.randomUUID
        ? crypto.randomUUID()
        : (
            "dev-" +
            Date.now() +
            "-" +
            Math.random().toString(16).slice(2)
          );

    localStorage.setItem("mc_device_id", id);
  }

  return id;
}

function mcDeviceInfo() {
  const ua = navigator.userAgent;

  let name = "Unknown device";

  if (/android/i.test(ua)) {
    name = "Android device";
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    name = "iOS device";
  } else if (/windows/i.test(ua)) {
    name = "Windows PC";
  } else if (/mac/i.test(ua)) {
    name = "Mac";
  } else if (/linux/i.test(ua)) {
    name = "Linux PC";
  }

  return {
    name,
    ua,
    platform: navigator.platform || "",
    lastSeen: Date.now()
  };
}

/* ---------------- Greeting ---------------- */

function mcGreeting(firstName = "") {
  const h = new Date().getHours();

  let g = "Good evening";

  if (h < 12) {
    g = "Good morning";
  } else if (h < 17) {
    g = "Good afternoon";
  }

  return firstName
    ? `${g}, ${firstName}`
    : g;
}

function mcDateStamp() {
  return new Date().toLocaleDateString(
    undefined,
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }
  );
}

/* ==========================================================================
   ADMIN DATABASE KEY
   ========================================================================== */

function mcDbKey(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/\./g, ",")
    .replace(/#/g, "%23")
    .replace(/\$/g, "%24")
    .replace(/\[/g, "%5B")
    .replace(/\]/g, "%5D")
    .replace(/\//g, "%2F");
}

/*
 * IMPORTANT:
 * Explicitly expose mcDbKey globally.
 *
 * admin-login.html and other inline scripts may execute in a different
 * JavaScript scope depending on how the browser loads the page.
 *
 * window.mcDbKey guarantees that the function is available globally.
 */
window.mcDbKey = mcDbKey;


/* ---------------- Shared platform helpers ---------------- */

// Default JAMB subscription catalogue. Firebase settings/plans can override these.
function mcDefaultPlans(){
  return {
    "jamb-1y":{
      label:"JAMB Annual Access",
      months:12,
      price:2500,
      discount:0,
      discountPercent:0,
      currency:"NGN",
      description:"Full MathCloud JAMB learning access for one year."
    }
  };
}

// Payment settings are intentionally empty until an administrator supplies the
// real Flutterwave link in Firebase settings/payment. This prevents a fake URL.
const MC_PAYMENT={paymentLink:'https://flutterwave.com/pay/7n1wlo69qnrs'};

const mcSession={
  getStudent(){
    try{return sessionStorage.getItem('mc_jamb_student_id')||localStorage.getItem('mc_jamb_student_id')||null;}catch(e){return null;}
  },
  getStudentSession(){
    try{return JSON.parse(sessionStorage.getItem('mc_jamb_student_session')||'null');}catch(e){return null;}
  },
  setStudent(id,session=null){
    if(id){
      sessionStorage.setItem('mc_jamb_student_id',id);
      localStorage.setItem('mc_jamb_student_id',id);
    }
    if(session){
      sessionStorage.setItem('mc_jamb_student_session',JSON.stringify(session));
      localStorage.setItem('mc_jamb_student_session',JSON.stringify(session));
    }
  },
  clear(){
    sessionStorage.removeItem('mc_jamb_student_id');
    sessionStorage.removeItem('mc_jamb_student_session');
    localStorage.removeItem('mc_jamb_student_id');
    localStorage.removeItem('mc_jamb_student_session');
  }
};

/* ---------------- Lightweight offline cache ---------------- */
function mcCacheKey(key){ return "mc_jamb_cache:"+key; }
function mcCacheSet(key,value){
  try{ localStorage.setItem(mcCacheKey(key), JSON.stringify({savedAt:Date.now(),value})); }catch(e){}
}
function mcCacheGet(key,maxAgeMs=7*24*60*60*1000){
  try{
    const raw=localStorage.getItem(mcCacheKey(key)); if(!raw)return null;
    const parsed=JSON.parse(raw);
    if(!parsed || Date.now()-Number(parsed.savedAt||0)>maxAgeMs)return null;
    return parsed.value;
  }catch(e){return null;}
}
function mcIsOffline(){ return navigator.onLine===false; }

function mcEscape(v){
  return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function mcShuffle(arr){
  const a=Array.isArray(arr)?arr.slice():[];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}
function mcFormatDuration(ms){
  ms=Math.max(0,Number(ms)||0);
  const total=Math.floor(ms/1000),d=Math.floor(total/86400),h=Math.floor(total%86400/3600),m=Math.floor(total%3600/60),s=total%60;
  return d?`${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function mcSubscriptionMsRemaining(student){
  const end=Number(student?.subscription?.endAt||0); return Math.max(0,end-Date.now());
}
function mcSubscriptionActive(student){
  const sub=student?.subscription||{};
  return (sub.status==='active' || sub.status==='approved') && Number(sub.endAt||0)>Date.now();
}
function mcSubscriptionLabel(student){
  const sub=student?.subscription||{};
  if(mcSubscriptionActive(student)) return 'Active';
  if(sub.status==='pending') return 'Pending';
  if(Number(sub.endAt||0)>0 && Number(sub.endAt||0)<=Date.now()) return 'Expired';
  return 'Not subscribed';
}
function mcRenderCountdown(elOrId,endAt,active=true){
  const el=typeof elOrId==='string'?document.getElementById(elOrId):elOrId;
  if(!el)return;
  const tick=()=>{
    const ms=Math.max(0,Number(endAt||0)-Date.now());
    el.textContent=active&&ms>0?mcFormatDuration(ms):'00:00:00';
    el.classList.toggle('expired',!(active&&ms>0));
  };
  tick(); return setInterval(tick,1000);
}
function mcWhatsAppUrl(message='Hello MathCloud Tutorial, I need faster subscription activation.'){
  return `https://wa.me/${BRAND.whatsapp.replace(/[^\d]/g,'')}?text=${encodeURIComponent(message)}`;
}
function mcPaywallCard(openFn){
  const wrap=document.createElement('div'); wrap.className='card';
  wrap.innerHTML='<div style="text-align:center;padding:28px"><div style="font-size:38px">🔒</div><h2>Subscription required</h2><p class="muted">Subscribe and wait for payment approval to unlock JAMB notes, practice and mock examinations.</p><button class="btn btn-primary" type="button">View subscription plans</button></div>';
  wrap.querySelector('button').onclick=()=>openFn?.(); return wrap;
}
function mcGetQuestionOptions(q){
  // The MathCloud/JAMB seeder stores the four choices as optionA..optionD.
  // Older question-bank records may use options/choices instead, so support
  // both formats. Returning an empty array for optionA..D records was the
  // reason valid seeded questions were being filtered out of every test.
  const raw=q?.options ?? q?.choices ?? null;
  if(Array.isArray(raw)) return raw
    .map((x,i)=>typeof x==='object'
      ? {key:String(x.key||String.fromCharCode(65+i)).toUpperCase(),text:String(x.text??x.value??x.option??'')}
      : {key:String.fromCharCode(65+i),text:String(x??'')})
    .filter(o=>o.text.trim()!=='');
  if(raw && typeof raw==='object') return Object.entries(raw)
    .map(([key,text])=>({key:String(key).replace(/^option/i,'').toUpperCase(),text:String(text??'')}))
    .filter(o=>o.text.trim()!=='')
    .sort((a,b)=>a.key.localeCompare(b.key));

  const legacy=[
    ['A',q?.optionA ?? q?.optiona],
    ['B',q?.optionB ?? q?.optionb],
    ['C',q?.optionC ?? q?.optionc],
    ['D',q?.optionD ?? q?.optiond]
  ];
  return legacy.filter(([,text])=>String(text??'').trim()!=='')
    .map(([key,text])=>({key,text:String(text)}));
}
function mcNormalizeCorrect(value,opts){
  if(value==null)return '';
  const v=String(value).trim();
  const upper=v.toUpperCase();
  if(opts.some(o=>o.key===upper))return upper;
  const idx=Number(v); if(Number.isInteger(idx)&&idx>=0&&idx<opts.length)return opts[idx].key;
  const found=opts.find(o=>o.text.trim().toLowerCase()===v.toLowerCase()); return found?.key||upper;
}
function mcTypeset(el){
  try{if(window.MathJax?.typesetPromise&&el)return window.MathJax.typesetPromise([el]).catch(()=>{});}catch(e){}
}
function mcInitConnectionWatcher(){
  const update=()=>{document.querySelectorAll('[data-connection-badge],#onlineBadge').forEach(el=>{el.textContent=navigator.onLine?'Online':'Offline';el.className='badge '+(navigator.onLine?'ok':'bad');});};
  window.addEventListener('online',update);window.addEventListener('offline',update);update();
}
function mcToggleSidebar(){
  document.querySelector('.sidebar')?.classList.toggle('open');
  document.querySelector('.sidebar-scrim')?.classList.toggle('show');
}
let mcSpeechLanguage=localStorage.getItem('mc_speech_language')||'en-NG';
function mcSetSpeechLanguage(lang){mcSpeechLanguage=lang||'en-NG';localStorage.setItem('mc_speech_language',mcSpeechLanguage);}
function mcSpeak(text,button){
  if(!('speechSynthesis' in window))return mcAlert('Read aloud is not supported by this browser.',{icon:'warn',title:'Read aloud unavailable'});
  window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(String(text||'')); u.lang=mcSpeechLanguage;
  if(button){button.disabled=true;u.onend=()=>button.disabled=false;u.onerror=()=>button.disabled=false;}
  window.speechSynthesis.speak(u);
}
function mcSpeakQuestion(index,button){
  const text=document.getElementById('qTextEl')?.innerText||''; mcSpeak(text,button);
}

// Google helpers shared by landing, admin login and student portal.
function mcGooglePopup(){
  const provider=new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({prompt:'select_account'});
  return auth.signInWithPopup(provider);
}
function mcGoogleRedirect(){
  const provider=new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({prompt:'select_account'});
  return auth.signInWithRedirect(provider);
}
function mcGoogleNeedsRedirect(e){
  return ['auth/popup-blocked','auth/operation-not-supported-in-this-environment','auth/cancelled-popup-request'].includes(e?.code||'');
}
function firebaseAuthHelp(e){
  const c=e?.code||'';
  if(c==='auth/configuration-not-found'||c==='auth/operation-not-allowed')return 'Firebase Authentication is not fully enabled. Enable Email/Password and Google in Firebase Console → Authentication → Sign-in method.';
  if(c==='auth/invalid-api-key')return 'The MathCloud Firebase API key is invalid. Check assets/firebase-config.js.';
  if(c==='auth/unauthorized-domain')return 'This website domain is not authorized for Google sign-in. Add it under Firebase Authentication → Settings → Authorized domains.';
  if(c==='auth/popup-blocked')return 'Google sign-in popup was blocked. Allow pop-ups for MathCloud and try again.';
  if(c==='auth/email-already-in-use')return 'An account already exists with this email address.';
  if(c==='auth/invalid-email')return 'Please enter a valid email address.';
  if(c==='auth/wrong-password'||c==='auth/invalid-credential')return 'The email or password is incorrect.';
  return e?.message||'Authentication failed.';
}

/* ---------------- Admin session ---------------- */

const ADMIN_SESSION_TTL_MS =
  12 * 60 * 60 * 1000;

function mcRandomToken() {
  if (crypto.getRandomValues) {
    const arr = new Uint8Array(24);

    crypto.getRandomValues(arr);

    return Array
      .from(arr)
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }

  return (
    "tok-" +
    Date.now() +
    "-" +
    Math.random().toString(16).slice(2)
  );
}

/* ==========================================================================
   ADMIN OBJECT
   ========================================================================== */

const mcAdmin = {

  session() {
    try {
      const s = JSON.parse(
        sessionStorage.getItem("mc_admin_session") ||
        "null"
      );

      return (
        s &&
        s.expiresAt > Date.now()
      )
        ? s
        : null;

    } catch (e) {
      return null;
    }
  },

  isLoggedIn() {
    return !!this.session();
  },

  meta() {
    const s = this.session();

    if (!s) {
      throw new Error("SESSION_EXPIRED");
    }

    return {
      _writerId: s.adminId,
      _writerToken: s.token
    };
  },

  async login(email, password) {

    email = String(email || "")
      .trim()
      .toLowerCase();

    const idSnap =
      await db
        .ref(
          "settings/adminIndex/" +
          mcDbKey(email)
        )
        .once("value");

    if (!idSnap.exists()) {
      throw new Error("NOT_FOUND");
    }

    const adminId = idSnap.val();

    const attemptHash =
      await mcHash(password);

    const token =
      mcRandomToken();

    const expiresAt =
      Date.now() +
      ADMIN_SESSION_TTL_MS;

    try {

      await db
        .ref("adminSessions/" + adminId)
        .set({
          attemptHash,
          token,
          expiresAt,
          deviceInfo: mcDeviceInfo()
        });

    } catch (err) {

      throw new Error("BAD_PASSWORD");
    }

    const infoSnap =
      await db
        .ref("settings/adminInfo")
        .once("value");

    const info =
      infoSnap.val() || {};

    const session = {
      adminId,
      token,
      expiresAt,
      name: info.name || "Admin",
      email: info.email || email
    };

    sessionStorage.setItem(
      "mc_admin_session",
      JSON.stringify(session)
    );

    return session;
  },

  /* ---------------------------------------------------------
     Firebase Auth login
     --------------------------------------------------------- */

  async loginFirebase(email, uid) {

    email = String(email || "")
      .trim()
      .toLowerCase();

    const allowed =
      await db
        .ref("settings/adminUsers/" + uid)
        .once("value");

    if (allowed.val() !== true) {
      throw new Error(
        "FIREBASE_ADMIN_NOT_AUTHORIZED"
      );
    }

    const idSnap =
      await db
        .ref(
          "settings/adminIndex/" +
          mcDbKey(email)
        )
        .once("value");

    if (!idSnap.exists()) {
      throw new Error(
        "ADMIN_PROFILE_NOT_FOUND"
      );
    }

    const adminId =
      idSnap.val();

    const token =
      mcRandomToken();

    const expiresAt =
      Date.now() +
      ADMIN_SESSION_TTL_MS;

    await db
      .ref("adminSessions/" + adminId)
      .set({
        token,
        expiresAt,
        deviceInfo: mcDeviceInfo()
      });

    const infoSnap =
      await db
        .ref("settings/adminInfo")
        .once("value");

    const info =
      infoSnap.val() || {};

    const session = {
      adminId,
      token,
      expiresAt,
      name: info.name || "Admin",
      email: info.email || email,
      authUid: uid,
      provider: "firebase"
    };

    sessionStorage.setItem(
      "mc_admin_session",
      JSON.stringify(session)
    );

    return session;
  },

  /* ---------------------------------------------------------
     Google Admin login
     --------------------------------------------------------- */

  async loginGoogle(email, uid) {

    email = String(email || "")
      .trim()
      .toLowerCase();

    const allowed =
      await db
        .ref("settings/adminUsers/" + uid)
        .once("value");

    if (allowed.val() !== true) {
      throw new Error(
        "GOOGLE_ADMIN_NOT_AUTHORIZED"
      );
    }

    const idSnap =
      await db
        .ref(
          "settings/adminIndex/" +
          mcDbKey(email)
        )
        .once("value");

    if (!idSnap.exists()) {
      throw new Error(
        "ADMIN_PROFILE_NOT_FOUND"
      );
    }

    const adminId =
      idSnap.val();

    const token =
      mcRandomToken();

    const expiresAt =
      Date.now() +
      ADMIN_SESSION_TTL_MS;

    await db
      .ref("adminSessions/" + adminId)
      .set({
        token,
        expiresAt,
        deviceInfo: mcDeviceInfo()
      });

    const infoSnap =
      await db
        .ref("settings/adminInfo")
        .once("value");

    const info =
      infoSnap.val() || {};

    const session = {
      adminId,
      token,
      expiresAt,
      name: info.name || "Admin",
      email: info.email || email,
      authUid: uid,
      provider: "google.com"
    };

    sessionStorage.setItem(
      "mc_admin_session",
      JSON.stringify(session)
    );

    return session;
  },

  logout() {
    sessionStorage.removeItem(
      "mc_admin_session"
    );
  },

  /* ---------------------------------------------------------
     Write existing admin-controlled node
     --------------------------------------------------------- */

  write(path, data) {

    return db
      .ref(path)
      .update({
        ...data,
        ...this.meta()
      });
  },

  /* ---------------------------------------------------------
     Push a new admin-controlled child
     --------------------------------------------------------- */

  async push(parentPath, data) {

    const key =
      db.ref().push().key;

    await db
      .ref(
        parentPath + "/" + key
      )
      .set({
        ...data,
        ...this.meta()
      });

    return key;
  },

  /* ---------------------------------------------------------
     Nested admin write
     --------------------------------------------------------- */

  writeNested(
    ancestorPath,
    relPatch
  ) {

    return db
      .ref(ancestorPath)
      .update({
        ...relPatch,
        ...this.meta()
      });
  },

  /* ---------------------------------------------------------
     Remove admin-controlled node
     --------------------------------------------------------- */

  async remove(path) {

    await this.write(
      path,
      {
        _deleted: true
      }
    );

    return db
      .ref(path)
      .remove();
  }
};

/*
 * Explicit global exports.
 *
 * This makes the shared utilities available to normal scripts
 * and inline scripts regardless of browser scope.
 */

window.BRAND = BRAND;
window.mcDefaultPlans = mcDefaultPlans;
window.MC_PAYMENT = MC_PAYMENT;
window.mcSession = mcSession;
window.mcEscape = mcEscape;
window.mcShuffle = mcShuffle;
window.mcFormatDuration = mcFormatDuration;
window.mcSubscriptionMsRemaining = mcSubscriptionMsRemaining;
window.mcSubscriptionActive = mcSubscriptionActive;
window.mcPaywallCard = mcPaywallCard;
window.mcGetQuestionOptions = mcGetQuestionOptions;
window.mcNormalizeCorrect = mcNormalizeCorrect;
window.mcTypeset = mcTypeset;
window.mcInitConnectionWatcher = mcInitConnectionWatcher;
window.mcToggleSidebar = mcToggleSidebar;
window.mcSetSpeechLanguage = mcSetSpeechLanguage;
window.mcSpeak = mcSpeak;
window.mcSpeakQuestion = mcSpeakQuestion;
window.mcGooglePopup = mcGooglePopup;
window.mcGoogleRedirect = mcGoogleRedirect;
window.mcGoogleNeedsRedirect = mcGoogleNeedsRedirect;
window.firebaseAuthHelp = firebaseAuthHelp;

window.mcModal = mcModal;
window.closeMcModal = closeMcModal;
window.mcAlert = mcAlert;
window.mcConfirm = mcConfirm;
window.mcContactModal = mcContactModal;
window.mcToast = mcToast;
window.mcHash = mcHash;
window.mcDeviceId = mcDeviceId;
window.mcDeviceInfo = mcDeviceInfo;
window.mcGreeting = mcGreeting;
window.mcDateStamp = mcDateStamp;
window.mcRandomToken = mcRandomToken;
window.mcAdmin = mcAdmin;
window.ADMIN_SESSION_TTL_MS =
  ADMIN_SESSION_TTL_MS;