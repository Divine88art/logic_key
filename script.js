/* ---- Configuration par défaut & utilitaires ---- */
var DEF_S = {
 elec: ["Électrotechnique", "⚡", "#F5B301", "#3a2a00", "pulse"],
 philo: ["Philosophie", "🦉", "#7C5CBF", "#fff", "bob"],
 est: ["EST", "🔬", "#2E9E5B", "#fff", "bob"],
 ang: ["Anglais", "🗣️", "#D64550", "#fff", "wig"],
 dess: ["Dessin technique", "📐", "#1AA6B7", "#00262b", "wig"],
 phy: ["Physique", "🧲", "#3B6FE0", "#fff", "wig"],
 leg: ["Législation et CGE", "⚖️", "#B5651D", "#fff", "bob"],
 tp: ["TP / MEL", "🔧", "#E8590C", "#fff", "wig"],
 math: ["Mathématiques générales", "➗", "#4C4CCF", "#fff", "pulse"],
 fr: ["Français", "📖", "#D6478B", "#fff", "bob"],
 tech: ["Technologie générale", "⚙️", "#5B7083", "#fff", "spin"],
 eps: ["EPS", "🏃", "#7CB518", "#1c2e00", "bob"],
 free: ["Temps libre", "🌤️", "#8892a6", "#fff", "bob"]
};

var DEF_B = [
 [1, "elec", 8, 13], [1, "free", 14, 17], [1, "philo", 17, 19],
 [2, "est", 7, 11], [2, "ang", 11, 13], [2, "dess", 15, 19],
 [3, "phy", 7, 11], [3, "leg", 11, 13], [3, "tp", 14, 18],
 [4, "math", 8, 12], [4, "tp", 13, 19],
 [5, "fr", 8, 12], [5, "tech", 14, 17], [5, "eps", 17, 19]
];

var DN = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
var S, B, T0 = 7, T1 = 19, hk = "", ed = -1;

function $(i) { return document.getElementById(i); }

function reportAppError(message) {
 var msg = "L’application a rencontré un problème au chargement : " + String(message || "erreur inconnue") + ". Les données enregistrées ne sont pas effacées ; recharge la page ou signale ce message.";
 var el = $("reminderStatus");
 if (el) el.textContent = msg;
 var hero = $("hero");
 if (hero && !hero.innerHTML) {
  hero.innerHTML = "<div class='hero' style='background:var(--card);color:var(--tx)'><div class='big'>⚠️</div><div class='grow'><h2>Erreur de chargement</h2><p>" + esc(msg) + "</p></div></div>";
 }
}

window.addEventListener("error", function (ev) {
 reportAppError(ev && ev.message ? ev.message : "Erreur JavaScript");
});
window.addEventListener("unhandledrejection", function (ev) {
 var reason = ev && ev.reason;
 reportAppError(reason && reason.message ? reason.message : reason || "Opération asynchrone impossible");
});

function clone(o) { return JSON.parse(JSON.stringify(o)); }
function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;"); }
function fh(x) { var H = Math.floor(x), M = Math.round((x - H) * 60); return H + "h" + (M ? (M < 10 ? "0" : "") + M : ""); }
function dur(x) {
 var m = Math.round(x * 60), j = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), n = m % 60;
 return ((j ? j + " j " : "") + (h ? h + " h " : "") + (n && !j ? n + " min" : "")).trim() || "1 min";
}
function pad(n) { return (n < 10 ? "0" : "") + n; }
function t2s(x) { var h = Math.floor(x), m = Math.round((x - h) * 60); return pad(h) + ":" + pad(m); }
function s2t(v) { var p = String(v).split(":"); return (+p[0]) + (+p[1]) / 60; }
function fgOf(c) {
 var r = parseInt(c.substr(1, 2), 16), g = parseInt(c.substr(3, 2), 16), b = parseInt(c.substr(5, 2), 16);
 return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62 ? "#1d2330" : "#fff";
}

/* ---- Emploi du temps ---- */
function load() {
 S = clone(DEF_S);
 B = clone(DEF_B);
 try {
  var raw = localStorage.getItem("edt-data"), j = raw ? JSON.parse(raw) : null;
  if (j && j.S && typeof j.S === "object" && !Array.isArray(j.S)) {
   var nextS = {};
   Object.keys(j.S).forEach(function (k) {
    var v = j.S[k];
    if (Array.isArray(v) && typeof v[0] === "string" && typeof v[1] === "string" && /^#[0-9a-f]{6}$/i.test(v[2] || "") && typeof v[3] === "string") {
     nextS[k] = [v[0], v[1], v[2], v[3], typeof v[4] === "string" ? v[4] : "bob"];
    }
   });
   if (Object.keys(nextS).length) S = nextS;
  }
  if (j && Array.isArray(j.B)) {
   B = j.B.filter(function (b) {
    return Array.isArray(b) && b.length >= 4 && Number.isInteger(Number(b[0])) && Number(b[0]) >= 1 && Number(b[0]) <= 5 && S[b[1]] && Number.isFinite(Number(b[2])) && Number.isFinite(Number(b[3])) && Number(b[2]) >= 0 && Number(b[3]) <= 24 && Number(b[3]) > Number(b[2]);
   }).map(function (b) { return [Number(b[0]), b[1], Number(b[2]), Number(b[3])]; });
  }
 } catch (e) {
  S = clone(DEF_S);
  B = clone(DEF_B);
 }
}

function save() {
 try { localStorage.setItem("edt-data", JSON.stringify({ S: S, B: B })); } catch (e) {}
}

var td = new Date().getDay(), sel = (td >= 1 && td <= 5) ? td : 1, tl = $("tl"), tb = $("tabs"), lg = $("l"), H = $("hero");
var mobileQuery = window.matchMedia("(max-width: 720px)");

function setDisplayMode(e) {
 var mobile = e.matches;
 document.documentElement.classList.toggle("mobile", mobile);
 document.body.dataset.display = mobile ? "mobile" : "desktop";
 tb.setAttribute("aria-hidden", mobile ? "false" : "true");
 if (mobile) {
  var active = tb.querySelector(".on");
  if (active) requestAnimationFrame(function () { active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" }); });
 }
}
if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", setDisplayMode);
else mobileQuery.addListener(setDisplayMode);

function burst(x, y, em) {
 for (var i = 0; i < 9; i++) {
  var s = document.createElement("span"), a = Math.random() * 6.28, r = 50 + Math.random() * 70;
  s.className = "burst";
  s.textContent = em;
  s.style.cssText = "left:" + x + "px;top:" + y + "px;--dx:" + Math.cos(a) * r + "px;--dy:" + (Math.sin(a) * r - 30) + "px;--r:" + (Math.random() * 360 - 180) + "deg";
  document.body.appendChild(s);
  setTimeout(function (el) { return function () { el.remove(); }; }(s), 950);
 }
}

function weekdayIndex() { var d = new Date().getDay(); return d === 0 ? 7 : d; }

function nextClassInfo(subjectId) {
 var now = new Date(), today = weekdayIndex(), minutes = now.getHours() * 60 + now.getMinutes(), best = null;
 B.forEach(function (b) {
  if (b[1] !== subjectId) return;
  var offset = (b[0] - today + 7) % 7, start = b[2] * 60, end = b[3] * 60;
  if (offset === 0 && end <= minutes) return;
  var ongoing = offset === 0 && start <= minutes && minutes < end;
  var delta = ongoing ? 0 : offset * 1440 + start - minutes;
  if (delta < 0) delta += 7 * 1440;
  if (!best || delta < best.delta) best = { delta: delta, b: b, ongoing: ongoing };
 });
 return best;
}

function countdownText(info) {
 if (!info) return "Aucun cours programmé";
 if (info.ongoing) return "Cours en cours · fin à " + fh(info.b[3]);
 var m = info.delta, days = Math.floor(m / 1440), hours = Math.floor(m % 1440 / 60), mins = m % 60, parts = [];
 if (days) parts.push(days + " j");
 if (hours) parts.push(hours + " h");
 if (!days && mins) parts.push(mins + " min");
 return "Prochain cours dans " + (parts.join(" ") || "moins d’une minute");
}

function homeworkCounts() {
 var counts = {};
 homework.forEach(function (x) {
  if (x.status !== "done" && x.subjectId) counts[x.subjectId] = (counts[x.subjectId] || 0) + 1;
 });
 return counts;
}

function render() {
 T0 = 7; T1 = 19;
 B.forEach(function (b) { T0 = Math.min(T0, Math.floor(b[2])); T1 = Math.max(T1, Math.ceil(b[3])); });
 tl.style.setProperty("--rows", T1 - T0);
 var h = "<div class='dh'></div>";
 DN.forEach(function (n, i) { h += "<div class='dh" + (td == i + 1 ? " today" : "") + (sel == i + 1 ? " on" : "") + "' data-d='" + (i + 1) + "'>" + n + "</div>"; });
 h += "<div class='gut'>";
 for (var i = T0; i < T1; i++) h += "<div class='hl'>" + i + "h</div>";
 h += "</div>";
 for (var d = 1; d <= 5; d++) h += "<div class='col" + (td == d ? " today" : "") + (sel == d ? " on" : "") + "' data-d='" + d + "'></div>";
 tl.innerHTML = h;

 var k = 0, counts = homeworkCounts();
 B.forEach(function (b, i) {
  var s = S[b[1]]; if (!s) return;
  var e = document.createElement("div");
  e.className = "b" + (b[1] == "free" ? " free" : "");
  e.style.cssText = "--c:" + s[2] + ";--f:" + s[3] + ";top:calc(" + (b[2] - T0) + "*var(--h) + 2px);height:calc(" + (b[3] - b[2]) + "*var(--h) - 4px);animation-delay:" + (k++ * 0.07) + "s";
  var count = counts[b[1]] || 0, info = nextClassInfo(b[1]);
  e.innerHTML = "<span class='ic " + s[4] + "'>" + esc(s[1]) + "</span><div class='t'><b>" + esc(s[0]) + "</b><span>" + fh(b[2]) + " – " + fh(b[3]) + "</span><span class='subbadge " + (count ? "" : "none") + "'>" + (count ? count + " devoir" + (count > 1 ? "s" : "") + " à faire" : "Aucun devoir") + "</span><span class='next-subject'>" + esc(countdownText(info)) + "</span></div>";
  e.querySelector(".ic").onclick = function (ev) { ev.stopPropagation(); burst(ev.clientX, ev.clientY, s[1]); };
  e.onclick = function () { openB(i); };
  tl.querySelector(".col[data-d='" + b[0] + "']").appendChild(e);
 });

 tb.innerHTML = "";
 tb.setAttribute("role", "tablist");
 tb.setAttribute("aria-label", "Choisir le jour à afficher");
 DN.forEach(function (n, i) {
  var x = document.createElement("button");
  x.textContent = n.slice(0, 3);
  x.className = sel == i + 1 ? "on" : "";
  x.setAttribute("role", "tab");
  x.setAttribute("aria-label", n);
  x.setAttribute("aria-selected", sel == i + 1 ? "true" : "false");
  x.onclick = function () {
   sel = i + 1;
   [].forEach.call(tb.children, function (y, j) { var on = j == i; y.className = on ? "on" : ""; y.setAttribute("aria-selected", on ? "true" : "false"); });
   [].forEach.call(tl.querySelectorAll(".dh[data-d],.col"), function (y) { y.classList[y.dataset.d == sel ? "add" : "remove"]("on"); });
   if (mobileQuery.matches) x.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };
  tb.appendChild(x);
 });

 lg.innerHTML = "";
 Object.keys(S).forEach(function (q) {
  if (q == "free") return;
  var s = S[q], c = document.createElement("span");
  c.className = "chip";
  c.style.cssText = "background:" + s[2] + ";color:" + s[3];
  c.textContent = s[1] + " " + s[0];
  lg.appendChild(c);
 });
 hk = "";
 tick();
}

function tick() {
 var Q = B.filter(function (b) { return S[b[1]]; });
 if (!Q.length) {
  H.innerHTML = "<div class='hero' style='background:var(--card);color:var(--tx)'><div class='big'>📅</div><div class='grow'><div class='lab'>EMPLOI DU TEMPS</div><h2>Aucun cours programmé</h2><p>Ajoute un cours avec le bouton ➕ pour commencer.</p></div></div>";
  hk = "";
  return;
 }
 var n = new Date(), d = n.getDay(), t = n.getHours() + n.getMinutes() / 60, cur = null, nx = null, best = 1e9;
 Q.forEach(function (b) { if (b[0] == d && b[2] <= t && t < b[3]) cur = b; });
 if (!cur) Q.forEach(function (b) { var x = ((b[0] - d + 7) % 7) * 24 + b[2] - t; if (x < 0) x += 168; if (x < best) { best = x; nx = b; } });
 var b = cur || nx, s = S[b[1]], key = (cur ? "c" : "n") + b.join();
 if (key != hk) {
  hk = key;
  H.innerHTML = "<div class='hero' style='background:linear-gradient(135deg," + s[2] + "," + s[2] + "cc);color:" + s[3] + "'><div class='big'>" + esc(s[1]) + "</div><div class='grow'><div class='lab'>" + (cur ? "<span class='dot'></span>EN COURS" : "À SUIVRE") + "</div><h2>" + esc(s[0]) + "</h2><p id='pt'></p>" + (cur ? "<div class='pb'><div id='pf'></div></div>" : "") + "</div></div>";
 }
 var p = $("pt");
 if (cur) {
  p.textContent = "Encore " + dur(b[3] - t) + " · fin à " + fh(b[3]);
  $("pf").style.width = ((t - b[2]) / (b[3] - b[2]) * 100) + "%";
 } else {
  p.textContent = "Dans " + dur(best) + " · " + (best >= 24 || b[0] != d ? DN[b[0] - 1] + " " : "") + fh(b[2]) + " – " + fh(b[3]);
 }
 var o = document.querySelector(".now"); if (o) o.remove();
 var c = tl.querySelector(".col.today");
 if (c && t >= T0 && t < T1) {
  o = document.createElement("div");
  o.className = "now";
  o.style.top = "calc(" + (t - T0) + "*var(--h))";
  c.appendChild(o);
 }
}

/* ---- Devoirs à faire & rappels locaux ---- */
var HOMEWORK_KEY = "edt-homework-v1", homework = [], homeworkEditId = null, homeworkFilter = "upcoming";
var REMINDER_SETTINGS_KEY = "edt-homework-reminders-v1", REMINDER_SENT_KEY = "edt-homework-reminders-sent-v1";
var reminderTimer = null, swRegistration = null, swState = "checking", swError = "";

function readReminderSettings() { try { return JSON.parse(localStorage.getItem(REMINDER_SETTINGS_KEY) || "{}"); } catch (e) { return {}; } }
function saveReminderSettings(value) { try { localStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(value)); return true; } catch (e) { return false; } }
function readSentReminders() { try { var a = JSON.parse(localStorage.getItem(REMINDER_SENT_KEY) || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
function reminderStatus(message) { var el = $("reminderStatus"); if (el) el.textContent = message; }

function reminderApiProblem() {
 if (!window.isSecureContext) return "Les notifications nécessitent HTTPS (ou localhost).";
 if (!("Notification" in window)) return "Ce navigateur ne prend pas en charge les notifications.";
 if (!("serviceWorker" in navigator)) return "Le service worker n’est pas disponible dans ce navigateur.";
 return "";
}

function updateReminderUI() {
 var unsupported = reminderApiProblem();
 var settings = readReminderSettings();
 var permission = ("Notification" in window) ? Notification.permission : "unsupported";
 var enabled = settings.enabled === true && permission === "granted";
 var enable = $("reminderEnable"), test = $("reminderTest");
 if (!enable || !test) return;
 enable.disabled = !!unsupported || (permission === "denied");
 test.disabled = !!unsupported || !enabled || swState !== "ready";
 if (unsupported) reminderStatus(unsupported);
 else if (permission === "denied") reminderStatus("Notifications bloquées par le navigateur. Autorise-les dans les réglages du site, puis recharge l’application.");
 else if (swState === "checking") reminderStatus("Préparation du service de notifications… Tu peux déjà consulter tes devoirs.");
 else if (swState === "failed") reminderStatus("Service de notifications indisponible : " + (swError || "vérifie le déploiement du fichier sw.js") + ". Les devoirs restent utilisables.");
 else if (enabled) reminderStatus("Rappels activés sur cet appareil. Les échéances sont vérifiées pendant l’utilisation de l’application.");
 else if (permission === "granted") reminderStatus("Autorisation accordée, mais les rappels ne sont pas activés.");
 else reminderStatus("Rappels désactivés. Active-les pour demander l’autorisation du navigateur.");
 enable.textContent = enabled ? "Rappels activés" : "Activer les rappels";
}

function getReminderRegistration() {
 if (swRegistration) return Promise.resolve(swRegistration);
 if (!window.isSecureContext || !("serviceWorker" in navigator)) return Promise.reject(new Error("Service worker indisponible"));
 return navigator.serviceWorker.getRegistration("./").then(function (reg) {
  if (!reg) throw new Error("Service worker non enregistré");
  swRegistration = reg;
  return reg;
 });
}

function showLocalReminder(title, body, tag) {
 return getReminderRegistration().then(function (reg) {
  if (!reg || !reg.showNotification) throw new Error("Notifications du service worker indisponibles");
  return reg.showNotification(title, { body: body, icon: "./icons/icon-192.png", badge: "./icons/icon-192.png", tag: tag, renotify: false, data: { url: "./" } });
 });
}

function registerAppServiceWorker() {
 if (!window.isSecureContext || !("serviceWorker" in navigator)) {
  swState = "failed";
  swError = "Service worker indisponible hors HTTPS/localhost";
  updateReminderUI();
  return Promise.resolve(null);
 }
 swState = "checking";
 updateReminderUI();
 var timeoutId;
 var attempt = Promise.resolve().then(function () { return navigator.serviceWorker.register("./sw.js"); });
 var timeout = new Promise(function (resolve, reject) { timeoutId = setTimeout(function () { reject(new Error("délai de préparation dépassé")); }, 10000); });
 return Promise.race([attempt, timeout]).then(function (reg) {
  clearTimeout(timeoutId);
  swRegistration = reg;
  swState = "ready";
  swError = "";
  updateReminderUI();
  return reg;
 }).catch(function (err) {
  clearTimeout(timeoutId);
  swState = "failed";
  swError = err && err.message ? err.message : "enregistrement refusé";
  updateReminderUI();
  return null;
 });
}

function enableHomeworkReminders() {
 var unsupported = reminderApiProblem();
 if (unsupported) { reminderStatus(unsupported); return; }
 if (Notification.permission === "denied") { updateReminderUI(); return; }
 try {
  Notification.requestPermission().then(function (permission) {
   if (permission !== "granted") {
    reminderStatus("Autorisation non accordée : aucun rappel ne sera envoyé.");
    updateReminderUI();
    return;
   }
   var settings = readReminderSettings();
   settings.enabled = true;
   if (!saveReminderSettings(settings)) {
    reminderStatus("Impossible d’enregistrer ce réglage sur l’appareil.");
    return;
   }
   updateReminderUI();
   showLocalReminder("Rappels activés", "Les échéances seront vérifiées pendant l’utilisation de l’application.", "homework-reminders-enabled").catch(function () {
    reminderStatus("Autorisation accordée, mais la notification de confirmation n’a pas pu être affichée. Réessaie le test après le chargement du service.");
   });
   checkHomeworkReminders();
  }).catch(function () {
   reminderStatus("Le navigateur n’a pas pu demander l’autorisation. Réessaie depuis les réglages du site.");
  });
 } catch (e) {
  reminderStatus("Impossible de demander l’autorisation dans ce navigateur.");
 }
}

function testHomeworkReminder() {
 if (reminderApiProblem()) { updateReminderUI(); return; }
 if (Notification.permission !== "granted") { reminderStatus("Active d’abord les notifications."); return; }
 showLocalReminder("Notification test", "Si tu vois ce message, les notifications fonctionnent sur cet appareil.", "homework-reminder-test-" + Date.now()).then(function () {
  reminderStatus("Notification test envoyée. Vérifie les notifications de ton appareil.");
 }).catch(function () {
  reminderStatus("Échec de la notification test. Vérifie les réglages du navigateur et le service worker.");
 });
}

function checkHomeworkReminders() {
 var settings = readReminderSettings();
 if (!settings.enabled || !("Notification" in window) || Notification.permission !== "granted" || swState !== "ready") return;
 var now = new Date(), sent = readSentReminders(), sentSet = {};
 sent.forEach(function (id) { sentSet[id] = true; });
 var newlySent = [];
 homework.forEach(function (x) {
  if (!x || x.status === "done" || !x.dueDate) return;
  var deadline = localDateTime(x.dueDate, x.dueTime);
  if (!deadline || isNaN(deadline.getTime()) || deadline <= now) return;
  var parts = x.dueDate.split("-").map(Number);
  var dueMorning = new Date(parts[0], parts[1] - 1, parts[2], 7, 0, 0, 0);
  var dayBefore = new Date(parts[0], parts[1] - 1, parts[2] - 1, 18, 0, 0, 0);
  var reminders = [
   { kind: "veille", at: dayBefore, body: "Échéance demain : " },
   { kind: "jour", at: dueMorning, body: "Échéance aujourd’hui : " }
  ];
  reminders.forEach(function (r) {
   var id = x.id + "|" + x.dueDate + "|" + r.kind;
   if (sentSet[id] || now < r.at || now >= deadline) return;
   if (r.kind === "veille" && now >= dueMorning) return;
   sentSet[id] = true;
   newlySent.push({
    id: id,
    title: "Devoir à rendre",
    body: r.body + x.title + " — " + subjectLabel(x.subjectId) + " (" + niceDate(x.dueDate) + (x.dueTime ? " à " + x.dueTime : "") + ")"
   });
  });
 });
 if (!newlySent.length) return;
 var queue = Promise.resolve();
 newlySent.forEach(function (item) {
  queue = queue.then(function () {
   return showLocalReminder(item.title, item.body, item.id).then(function () { sent.push(item.id); }).catch(function () { delete sentSet[item.id]; });
  });
 });
 queue.then(function () {
  sent = sent.filter(function (id) { return !!sentSet[id]; });
  if (sent.length > 500) sent = sent.slice(sent.length - 500);
  try { localStorage.setItem(REMINDER_SENT_KEY, JSON.stringify(sent)); } catch (e) {}
 });
}

function startReminderChecks() {
 if (reminderTimer) clearInterval(reminderTimer);
 checkHomeworkReminders();
 reminderTimer = setInterval(checkHomeworkReminders, 60000);
 document.addEventListener("visibilitychange", function () { if (!document.hidden) checkHomeworkReminders(); });
 window.addEventListener("pageshow", checkHomeworkReminders);
 updateReminderUI();
}

function saveHomework() {
 try { localStorage.setItem(HOMEWORK_KEY, JSON.stringify(homework)); return true; }
 catch (e) { alert("Impossible de sauvegarder les devoirs sur cet appareil. Vérifie l'espace de stockage du navigateur."); return false; }
}

function loadHomework() {
 try {
  var raw = localStorage.getItem(HOMEWORK_KEY);
  if (!raw) { homework = []; return; }
  var parsed = JSON.parse(raw);
  homework = Array.isArray(parsed) ? parsed.filter(function (x) { return x && typeof x.id === "string" && typeof x.title === "string"; }) : [];
 } catch (e) {
  homework = [];
 }
}

function localDateTime(date, time) {
 if (!date) return null;
 var p = date.split("-").map(Number);
 if (p.length !== 3 || !p[0] || !p[1] || !p[2]) return null;
 var q = (time || "23:59").split(":").map(Number);
 return new Date(p[0], p[1] - 1, p[2], q[0] || 0, q[1] || 0, 0, 0);
}

function homeworkIsOverdue(x) {
 if (x.status === "done") return false;
 var d = localDateTime(x.dueDate, x.dueTime);
 return !!(d && d < new Date());
}

function subjectLabel(id) { return S[id] ? S[id][1] + " " + S[id][0] : "Matière indisponible"; }
function niceDate(date) { if (!date) return "Sans date"; var p = date.split("-"); return p.length !== 3 ? date : p[2] + "/" + p[1] + "/" + p[0]; }

/* Photos des devoirs (IndexedDB) */
var PHOTO_DB = "edt-homework-photos-v1", PHOTO_STORE = "photos", pendingPhotoData = null, photoLoadToken = 0;

function openPhotoDB() {
 return new Promise(function (resolve, reject) {
  if (!window.indexedDB) { reject(new Error("IndexedDB indisponible")); return; }
  var req = indexedDB.open(PHOTO_DB, 1);
  req.onupgradeneeded = function () {
   var db = req.result;
   if (!db.objectStoreNames.contains(PHOTO_STORE)) db.createObjectStore(PHOTO_STORE);
  };
  req.onsuccess = function () { resolve(req.result); };
  req.onerror = function () { reject(req.error || new Error("Ouverture IndexedDB impossible")); };
 });
}

function photoDBAction(mode, id, value) {
 return openPhotoDB().then(function (db) {
  return new Promise(function (resolve, reject) {
   var tx = db.transaction(PHOTO_STORE, mode === "get" ? "readonly" : "readwrite");
   var store = tx.objectStore(PHOTO_STORE);
   var req = mode === "put" ? store.put(value, id) : mode === "delete" ? store.delete(id) : store.get(id);
   req.onsuccess = function () { resolve(req.result); };
   req.onerror = function () { reject(req.error || new Error("Erreur photo")); };
   tx.oncomplete = function () { db.close(); };
   tx.onerror = function () { db.close(); reject(tx.error || new Error("Transaction photo impossible")); };
  });
 });
}

function compressPhoto(file) {
 return new Promise(function (resolve, reject) {
  if (!file) { resolve(null); return; }
  if (!file.type || file.type.indexOf("image/") !== 0) { reject(new Error("Choisis un fichier image.")); return; }
  if (file.size > 8 * 1024 * 1024) { reject(new Error("Image trop volumineuse (maximum 8 Mo avant compression).")); return; }
  var reader = new FileReader();
  reader.onerror = function () { reject(new Error("Lecture de l’image impossible.")); };
  reader.onload = function () {
   var img = new Image();
   img.onerror = function () { reject(new Error("Image illisible.")); };
   img.onload = function () {
    var max = 1400, scale = Math.min(1, max / Math.max(img.width, img.height));
    var canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    var ctx = canvas.getContext("2d");
    if (!ctx) { reject(new Error("Compression d’image indisponible.")); return; }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL("image/jpeg", 0.78));
   };
   img.src = reader.result;
  };
  reader.readAsDataURL(file);
 });
}

function setupPhotoPreview(data) {
 var img = $("hwPhotoPreview");
 img.src = data || "";
 img.style.display = data ? "block" : "none";
}

function openHomework(id) {
 var keys = Object.keys(S).filter(function (k) { return k !== "free"; });
 if (!keys.length) { alert("Ajoute d'abord une matière dans la gestion des matières."); return; }
 homeworkEditId = id || null;
 pendingPhotoData = null;
 var token = ++photoLoadToken;
 $("hwPhoto").value = "";
 setupPhotoPreview(null);
 $("hwPhotoRemove").style.display = "none";
 var x = id ? homework.find(function (y) { return y.id === id; }) : null;
 $("hwSubject").innerHTML = keys.map(function (k) { return '<option value="' + esc(k) + '">' + esc(S[k][1] + " " + S[k][0]) + "</option>"; }).join("");
 $("hwDialogTitle").textContent = x ? "✏️ Modifier le devoir" : "＋ Ajouter un devoir";
 $("hwSubject").value = x && S[x.subjectId] ? x.subjectId : keys[0];
 $("hwTitle").value = x ? x.title : "";
 var now = new Date();
 $("hwDate").value = x ? x.dueDate : now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
 $("hwTime").value = x ? (x.dueTime || "") : "";
 $("hwPriority").value = x ? x.priority || "medium" : "medium";
 $("hwNotes").value = x ? x.notes || "" : "";
 $("hwError").textContent = "";
 $("hwDelete").style.display = x ? "" : "none";
 $("dH").showModal();
 if (x) {
  photoDBAction("get", x.id).then(function (data) {
   if (token !== photoLoadToken) return;
   if (data) {
    pendingPhotoData = data;
    setupPhotoPreview(data);
    $("hwPhotoRemove").style.display = "";
   }
  }).catch(function () {});
 }
}

function refreshHomeworkSubjectFilter() {
 var f = $("hwSubjectFilter");
 if (!f) return;
 var current = f.value;
 f.innerHTML = '<option value="">Toutes les matières</option>';
 Object.keys(S).forEach(function (id) {
  if (id === "free") return;
  var o = document.createElement("option");
  o.value = id;
  o.textContent = subjectLabel(id);
  f.appendChild(o);
 });
 if (Array.prototype.some.call(f.options, function (o) { return o.value === current; })) f.value = current;
}

function renderHomework() {
 var pending = homework.filter(function (x) { return x.status !== "done"; });
 var overdue = pending.filter(homeworkIsOverdue);
 $("hwStats").innerHTML = "<div class='hwstat'><strong>" + pending.length + "</strong><span>À terminer</span></div><div class='hwstat'><strong>" + overdue.length + "</strong><span>En retard</span></div><div class='hwstat'><strong>" + homework.filter(function (x) { return x.status === "done"; }).length + "</strong><span>Terminés</span></div>";

 var searchText = (($("hwSearch") && $("hwSearch").value) || "").trim().toLocaleLowerCase();
 var subjectFilter = ($("hwSubjectFilter") && $("hwSubjectFilter").value) || "";
 var list = homework.filter(function (x) {
  var statusOk = homeworkFilter === "done" ? x.status === "done" : homeworkFilter === "overdue" ? homeworkIsOverdue(x) : homeworkFilter === "upcoming" ? x.status !== "done" && !homeworkIsOverdue(x) : true;
  var subjectOk = !subjectFilter || x.subjectId === subjectFilter;
  var hay = [x.title, x.notes, subjectLabel(x.subjectId)].join(" ").toLocaleLowerCase();
  return statusOk && subjectOk && (!searchText || hay.indexOf(searchText) !== -1);
 });
 list.sort(function (a, b) {
  if (a.status !== b.status) return a.status === "done" ? 1 : -1;
  return (localDateTime(a.dueDate, a.dueTime) || new Date(8640000000000000)) - (localDateTime(b.dueDate, b.dueTime) || new Date(8640000000000000));
 });

 $("hwList").innerHTML = "";
 if (!list.length) {
  var msg = (searchText || subjectFilter)
   ? "Aucun devoir ne correspond à ta recherche ou à ce filtre."
   : homeworkFilter === "overdue"
    ? "Aucun devoir en retard. Bien joué ! 🎉"
    : homeworkFilter === "done"
     ? "Aucun devoir terminé pour le moment."
     : homeworkFilter === "upcoming"
      ? "Tout est à jour ! Ajoute un devoir quand tu en reçois un. ✨"
      : "Aucun devoir enregistré pour le moment.";
  $("hwList").innerHTML = "<div class='hwempty'><div style='font-size:2rem'>📝</div><p>" + msg + "</p></div>";
  return;
 }

 list.forEach(function (x) {
  var over = homeworkIsOverdue(x), done = x.status === "done", card = document.createElement("article");
  card.className = "hwcard";
  var check = document.createElement("input");
  check.type = "checkbox";
  check.className = "hwcheck";
  check.checked = done;
  check.setAttribute("aria-label", (done ? "Marquer comme à faire : " : "Marquer comme terminé : ") + x.title);
  check.onchange = function () { x.status = check.checked ? "done" : "pending"; saveHomework(); renderHomework(); render(); };

  var main = document.createElement("div");
  var title = document.createElement("div");
  title.className = "hwtitle";
  title.textContent = x.title;
  if (done) title.style.textDecoration = "line-through";

  var meta = document.createElement("div");
  meta.className = "hwmeta";
  var subj = document.createElement("span");
  subj.textContent = subjectLabel(x.subjectId);
  meta.appendChild(subj);
  var due = document.createElement("span");
  due.textContent = "📅 " + niceDate(x.dueDate) + (x.dueTime ? " · " + x.dueTime : "");
  meta.appendChild(due);

  var tags = document.createElement("div");
  tags.className = "hwmeta";
  var pr = document.createElement("span");
  pr.className = "hwtag " + (x.priority || "medium");
  pr.textContent = { high: "Priorité haute", medium: "Priorité normale", low: "Priorité basse" }[x.priority] || "Priorité normale";
  tags.appendChild(pr);
  var st = document.createElement("span");
  st.className = "hwtag " + (done ? "done" : over ? "overdue" : "");
  st.textContent = done ? "Terminé" : over ? "En retard" : "À faire";
  tags.appendChild(st);

  main.appendChild(title);
  main.appendChild(meta);
  main.appendChild(tags);
  if (x.notes) {
   var note = document.createElement("div");
   note.className = "hwdesc";
   note.textContent = x.notes;
   main.appendChild(note);
  }
  photoDBAction("get", x.id).then(function (data) {
   if (data && card.isConnected) {
    var im = document.createElement("img");
    im.className = "hwphoto";
    im.src = data;
    im.alt = "Photo de l’exercice : " + x.title;
    im.onclick = function () {
     var w = window.open();
     if (w) {
      w.document.title = "Photo du devoir";
      var big = w.document.createElement("img");
      big.src = data;
      big.style.maxWidth = "100%";
      big.style.height = "auto";
      w.document.body.appendChild(big);
     }
    };
    main.appendChild(im);
   }
  }).catch(function () {});

  var acts = document.createElement("div");
  acts.className = "hwacts";
  var edit = document.createElement("button");
  edit.type = "button";
  edit.textContent = "✏️";
  edit.title = "Modifier le devoir";
  edit.setAttribute("aria-label", "Modifier " + x.title);
  edit.onclick = function () { openHomework(x.id); };
  acts.appendChild(edit);

  card.appendChild(check);
  card.appendChild(main);
  card.appendChild(acts);
  $("hwList").appendChild(card);
 });
}

$("hwAdd").onclick = function () { openHomework(null); };
$("hwCancel").onclick = function () { $("dH").close(); };
$("hwFilters").onclick = function (e) {
 var b = e.target.closest("button[data-filter]");
 if (!b) return;
 homeworkFilter = b.dataset.filter;
 [].forEach.call($("hwFilters").querySelectorAll("button"), function (x) { x.classList.toggle("on", x === b); });
 renderHomework();
};
$("hwSearch").oninput = renderHomework;
$("hwSubjectFilter").onchange = renderHomework;
$("reminderEnable").onclick = enableHomeworkReminders;
$("reminderTest").onclick = testHomeworkReminder;

$("hwPhoto").onchange = function () {
 var file = this.files && this.files[0];
 if (!file) return;
 $("hwError").textContent = "Compression de la photo…";
 compressPhoto(file).then(function (data) {
  pendingPhotoData = data;
  setupPhotoPreview(data);
  $("hwPhotoRemove").style.display = "";
  $("hwError").textContent = "";
 }).catch(function (err) {
  pendingPhotoData = null;
  setupPhotoPreview(null);
  $("hwError").textContent = err.message || "Impossible de traiter la photo.";
  $("hwPhoto").value = "";
 });
};
$("hwPhotoRemove").onclick = function () {
 pendingPhotoData = "";
 $("hwPhoto").value = "";
 setupPhotoPreview(null);
 this.style.display = "none";
};
$("hwForm").onsubmit = function (e) {
 e.preventDefault();
 var title = $("hwTitle").value.trim(), date = $("hwDate").value, time = $("hwTime").value, subjectId = $("hwSubject").value;
 if (!title) { $("hwError").textContent = "Donne un titre au devoir."; return; }
 if (!date) { $("hwError").textContent = "Choisis une date limite."; return; }
 if (!localDateTime(date, time)) { $("hwError").textContent = "La date ou l'heure n'est pas valide."; return; }
 var old = homeworkEditId ? homework.find(function (x) { return x.id === homeworkEditId; }) : null;
 var item = {
  id: old ? old.id : ("hw-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8)),
  subjectId: subjectId,
  title: title,
  dueDate: date,
  dueTime: time,
  priority: $("hwPriority").value,
  status: old ? old.status : "pending",
  notes: $("hwNotes").value.trim(),
  createdAt: old ? old.createdAt : new Date().toISOString(),
  updatedAt: new Date().toISOString()
 };
 var saveBtn = $("hwSave");
 saveBtn.disabled = true;
 saveBtn.textContent = "Enregistrement…";
 var photoJob = pendingPhotoData === null
  ? Promise.resolve("keep")
  : pendingPhotoData === ""
   ? photoDBAction("delete", item.id).then(function () { return null; })
   : photoDBAction("put", item.id, pendingPhotoData).then(function () { return true; });
 photoJob.then(function () {
  if (old) homework[homework.indexOf(old)] = item;
  else homework.push(item);
  if (saveHomework()) {
   $("dH").close();
   homeworkFilter = "all";
   [].forEach.call($("hwFilters").querySelectorAll("button"), function (b) { b.classList.toggle("on", b.dataset.filter === "all"); });
   render();
   showAppView("homework");
  } else if (!old) {
   homework = homework.filter(function (y) { return y.id !== item.id; });
  }
 }).catch(function () {
  $("hwError").textContent = "Impossible de sauvegarder la photo sur cet appareil. Essaie une image plus petite.";
 }).finally(function () {
  saveBtn.disabled = false;
  saveBtn.textContent = "Enregistrer";
 });
};
$("hwDelete").onclick = function () {
 var x = homework.find(function (y) { return y.id === homeworkEditId; });
 if (!x) return;
 if (confirm("Supprimer le devoir « " + x.title + " » ?")) {
  homework = homework.filter(function (y) { return y.id !== homeworkEditId; });
  photoDBAction("delete", homeworkEditId).catch(function () {});
  if (saveHomework()) { $("dH").close(); renderHomework(); render(); }
 }
};

/* ---- Éditeur de cours ---- */
function openB(i) {
 $("bs").innerHTML = Object.keys(S).map(function (k) { return "<option value='" + esc(k) + "'>" + esc(S[k][1]) + " " + esc(S[k][0]) + "</option>"; }).join("");
 $("bd").innerHTML = DN.map(function (n, j) { return "<option value='" + (j + 1) + "'>" + n + "</option>"; }).join("");
 ed = i;
 var b = i >= 0 ? B[i] : [sel, Object.keys(S)[0], 8, 10];
 $("bt").textContent = i >= 0 ? "✏️ Modifier le cours" : "➕ Ajouter un cours";
 $("bs").value = b[1];
 $("bd").value = b[0];
 $("b1").value = t2s(b[2]);
 $("b2").value = t2s(b[3]);
 $("be").textContent = "";
 $("bdl").style.display = i >= 0 ? "" : "none";
 $("dB").showModal();
}
$("add").onclick = function () { openB(-1); };
$("bcx").onclick = function () { $("dB").close(); };
$("bdl").onclick = function () { B.splice(ed, 1); save(); $("dB").close(); render(); };
$("bsv").onclick = function () {
 var d = +$("bd").value, s = s2t($("b1").value), e = s2t($("b2").value), k = $("bs").value;
 if (isNaN(s) || isNaN(e)) { $("be").textContent = "Choisis une heure de début et de fin."; return; }
 if (e <= s) { $("be").textContent = "La fin doit être après le début."; return; }
 var o = B.filter(function (b, j) { return j != ed && b[0] == d && s < b[3] && e > b[2]; })[0];
 if (o) { $("be").textContent = "Ce créneau chevauche : " + S[o[1]][0] + " (" + fh(o[2]) + " – " + fh(o[3]) + ")"; return; }
 var nb = [d, k, s, e];
 if (ed >= 0) B[ed] = nb; else B.push(nb);
 save();
 sel = d;
 $("dB").close();
 render();
};

/* ---- Éditeur de matières ---- */
var PAL = ["#E76F51", "#2A9D8F", "#8E44AD", "#F4A261", "#3498DB", "#E91E63", "#16A085", "#F39C12"];
function row(k, s) {
 return "<div class='mr' data-k='" + esc(k) + "'><input class='me' maxlength='4' value=\"" + esc(s[1]) + "\"><input class='mn' placeholder='Nom' value=\"" + esc(s[0]) + "\"><input class='mc' type='color' value='" + esc(s[2]) + "'><button type='button' class='mx' title='Supprimer'>🗑️</button></div>";
}
$("mat").onclick = function () {
 $("ml").innerHTML = Object.keys(S).filter(function (k) { return k != "free"; }).map(function (k) { return row(k, S[k]); }).join("");
 $("dM").showModal();
};
$("madd").onclick = function () {
 var d = document.createElement("div");
 d.innerHTML = row("", ["", "📚", PAL[Math.floor(Math.random() * PAL.length)]]);
 $("ml").appendChild(d.firstChild);
 $("ml").scrollTop = 9999;
};
$("ml").onclick = function (e) {
 if (!e.target.classList.contains("mx")) return;
 var r = e.target.parentNode, k = r.dataset.k;
 if (k) {
  var n = B.filter(function (b) { return b[1] == k; }).length;
  if (n && !confirm("Cette matière a " + n + " cours dans ta semaine. La supprimer supprimera aussi ces cours. Continuer ?")) return;
  delete S[k];
  B = B.filter(function (b) { return b[1] != k; });
 }
 r.remove();
};
$("mok").onclick = function () {
 [].forEach.call($("ml").children, function (r) {
  var k = r.dataset.k, n = r.querySelector(".mn").value.trim(), e = r.querySelector(".me").value.trim() || "📚", c = r.querySelector(".mc").value;
  if (!n) return;
  if (k) {
   var s = S[k];
   if (!s) return;
   if (s[2] != c) { s[2] = c; s[3] = fgOf(c); }
   s[0] = n;
   s[1] = e;
  } else {
   S["s" + Date.now() + Math.floor(Math.random() * 999)] = [n, e, c, fgOf(c), "bob"];
  }
 });
 save();
 refreshHomeworkSubjectFilter();
 $("dM").close();
 render();
 renderHomework();
 syncGradeSubjects();
 renderGrades();
 if (!$("gradeCoefficients").hidden) renderCoefficients();
 renderRecommendations();
};
$("mrs").onclick = function () {
 if (confirm("Remettre l'emploi du temps d'origine ? Tes modifications seront perdues.")) {
  try { localStorage.removeItem("edt-data"); } catch (e) {}
  load();
  refreshHomeworkSubjectFilter();
  $("dM").close();
  render();
  renderHomework();
  syncGradeSubjects();
  renderGrades();
  if (!$("gradeCoefficients").hidden) renderCoefficients();
  renderRecommendations();
 }
};

$("prt").onclick = function () { window.print(); };
$("th").onclick = function () {
 var r = document.documentElement, dk = r.dataset.theme ? r.dataset.theme == "dark" : matchMedia("(prefers-color-scheme:dark)").matches;
 r.dataset.theme = dk ? "light" : "dark";
 try { localStorage.setItem("edt-th", r.dataset.theme); } catch (e) {}
};
try { var sv = localStorage.getItem("edt-th"); if (sv) document.documentElement.dataset.theme = sv; } catch (e) {}

/* ---- Suivi des notes semestriel & Recommandations ---- */
/* Règle :
   - Interrogations : illimitées -> MoyInterros
   - Devoirs : strictement 2 max par semestre (devoir1, devoir2)
   - Si Devoir 1, Devoir 2 ou toute interrogation manque : moyenne de la matière EN ATTENTE,
     et la moyenne générale du semestre est également mise EN ATTENTE dès qu'une matière commencée est incomplète.
   - Moyenne matière = (MoyInterros + Devoir 1 + Devoir 2) / 3
   - Moyenne coefficiée = Moyenne matière * Coefficient
   - Moyenne générale du semestre = Somme(Moyenne coefficiée) / Somme(Coefficients)
*/
var GRADE_SUBJECTS = [];
var GRADE_DEFAULT_COEFFICIENTS = { elec: 4, est: 2, tech: 2, tp: 5, math: 4, fr: 3, ang: 2, phy: 4, eps: 2, dess: 4, philo: 1, leg: 1 };
var GRADE_LEGACY_NAMES = {
 electro: "Électrotechnique", est: "EST", techno: "Technologie générale",
 mesure: "Manipulation, mesure et essai", tp: "TP", maths: "Mathématiques générales",
 francais: "Français", anglais: "Anglais", pct: "PCT", eps: "EPS",
 conduite: "Conduite", dessin: "Dessin technique", philo: "Philosophie", legicge: "Législation et CGE"
};
var GRADE_ID_MIGRATION = {
 electro: "elec", est: "est", techno: "tech", mesure: "tp", tp: "tp",
 maths: "math", francais: "fr", anglais: "ang", pct: "phy", eps: "eps",
 dessin: "dess", philo: "philo", legicge: "leg"
};
var GRADE_KEY = "edt-grades-v1", COEF_KEY = "edt-grade-coefficients-v1";
var grades = [], gradeEditId = null, gradeCoefficients = {}, activeSemester = 1, activeGradeMode = "interro";

function normalizeSubjectName(name) {
 return String(name || "").normalize
  ? String(name || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
  : String(name || "").toLocaleLowerCase().trim();
}
function resolveGradeSubjectId(id) {
 if (S[id] && id !== "free") return id;
 var mapped = GRADE_ID_MIGRATION[id];
 if (mapped && S[mapped]) return mapped;
 var wanted = normalizeSubjectName(GRADE_LEGACY_NAMES[id] || id);
 var found = Object.keys(S).filter(function (k) { return k !== "free" && normalizeSubjectName(S[k][0]) === wanted; })[0];
 return found || id;
}
function syncGradeSubjects() {
 var seen = {};
 GRADE_SUBJECTS = [];
 Object.keys(S).forEach(function (id) {
  if (id === "free") return;
  seen[id] = true;
  GRADE_SUBJECTS.push({ id: id, name: S[id][0], coef: GRADE_DEFAULT_COEFFICIENTS[id] !== undefined ? GRADE_DEFAULT_COEFFICIENTS[id] : 1, active: true });
 });
 var legacyIds = [];
 grades.forEach(function (g) { if (!seen[g.subjectId] && legacyIds.indexOf(g.subjectId) < 0) legacyIds.push(g.subjectId); });
 legacyIds.forEach(function (id) { GRADE_SUBJECTS.push({ id: id, name: GRADE_LEGACY_NAMES[id] || "Ancienne matière", coef: 1, active: false }); });
}
function normalizeGradeType(t) {
 return (t === "devoir1" || t === "devoir2" || t === "interro") ? t : "interro";
}
function normalizeSemester(s) {
 return Number(s) === 2 ? 2 : 1;
}
function loadGrades() {
 var migrated = false;
 try {
  var a = JSON.parse(localStorage.getItem(GRADE_KEY) || "[]");
  grades = Array.isArray(a) ? a.filter(function (x) {
   return x && typeof x.id === "string" && typeof x.subjectId === "string" && Number.isFinite(Number(x.value)) && Number(x.value) >= 0 && Number(x.value) <= 20;
  }).map(function (x) {
   var mapped = resolveGradeSubjectId(x.subjectId);
   var type = normalizeGradeType(x.type);
   var sem = normalizeSemester(x.semester);
   if (mapped !== x.subjectId || type !== x.type || sem !== x.semester) migrated = true;
   return Object.assign({}, x, { subjectId: mapped, type: type, semester: sem, value: Number(x.value) });
  }) : [];
 } catch (e) { grades = []; }

 /* Assure au plus 1 Devoir 1 et 1 Devoir 2 par matière et par semestre */
 var seenDevoir = {};
 grades = grades.map(function (g) {
  if (g.type === "devoir1" || g.type === "devoir2") {
   var key = g.semester + "|" + g.subjectId + "|" + g.type;
   if (seenDevoir[key]) {
    var alt = g.type === "devoir1" ? "devoir2" : "devoir1";
    var altKey = g.semester + "|" + g.subjectId + "|" + alt;
    migrated = true;
    if (!seenDevoir[altKey]) {
     seenDevoir[altKey] = true;
     return Object.assign({}, g, { type: alt });
    }
    return Object.assign({}, g, { type: "interro" });
   }
   seenDevoir[key] = true;
  }
  return g;
 });

 try {
  var c = JSON.parse(localStorage.getItem(COEF_KEY) || "{}");
  gradeCoefficients = c && typeof c === "object" && !Array.isArray(c) ? c : {};
 } catch (e) { gradeCoefficients = {}; }
 var migratedCoefs = {};
 Object.keys(gradeCoefficients).forEach(function (id) {
  var mapped = resolveGradeSubjectId(id);
  if (mapped !== id) { if (migratedCoefs[mapped] === undefined) migratedCoefs[mapped] = gradeCoefficients[id]; migrated = true; }
  else migratedCoefs[id] = gradeCoefficients[id];
 });
 gradeCoefficients = migratedCoefs;
 syncGradeSubjects();
 if (migrated) {
  try {
   localStorage.setItem(GRADE_KEY, JSON.stringify(grades));
   localStorage.setItem(COEF_KEY, JSON.stringify(gradeCoefficients));
  } catch (e) {}
 }
}
function saveGrades() {
 try { localStorage.setItem(GRADE_KEY, JSON.stringify(grades)); return true; }
 catch (e) { alert("Impossible d'enregistrer les notes sur cet appareil."); return false; }
}
function subjectName(id) {
 var s = GRADE_SUBJECTS.find(function (x) { return x.id === id; });
 if (s) return s.name;
 if (S[id]) return S[id][0];
 return GRADE_LEGACY_NAMES[id] || "Matière inconnue";
}
function coefficient(id) {
 var s = GRADE_SUBJECTS.find(function (x) { return x.id === id; });
 var n = Number(gradeCoefficients[id] !== undefined ? gradeCoefficients[id] : (s ? s.coef : 1));
 return Number.isFinite(n) && n >= 0 && n <= 20 ? n : (s ? s.coef : 1);
}
function fmtGrade(n) { return n === null || n === undefined ? "—" : Number(n).toFixed(2).replace(".", ",") + "/20"; }
function fmtPoints(n) { return n === null || n === undefined ? "—" : Number(n).toFixed(2).replace(".", ","); }

function computeSubjectStats(subjectId, semester) {
 var sem = normalizeSemester(semester);
 var list = grades.filter(function (g) { return g.subjectId === subjectId && normalizeSemester(g.semester) === sem; });
 var interros = list.filter(function (g) { return g.type === "interro"; });
 var d1Item = list.find(function (g) { return g.type === "devoir1"; }) || null;
 var d2Item = list.find(function (g) { return g.type === "devoir2"; }) || null;
 var moyInterros = interros.length ? interros.reduce(function (a, x) { return a + Number(x.value); }, 0) / interros.length : null;
 var d1 = d1Item ? Number(d1Item.value) : null;
 var d2 = d2Item ? Number(d2Item.value) : null;
 var hasAny = interros.length > 0 || d1 !== null || d2 !== null;
 var missing = [];
 if (!interros.length) missing.push("Interrogation(s)");
 if (d1 === null) missing.push("Devoir 1");
 if (d2 === null) missing.push("Devoir 2");
 var complete = missing.length === 0;
 var coef = coefficient(subjectId);
 var average = complete ? (moyInterros + d1 + d2) / 3 : null;
 var weighted = complete ? average * coef : null;
 return {
  subjectId: subjectId,
  coef: coef,
  interros: interros,
  moyInterros: moyInterros,
  d1: d1,
  d2: d2,
  hasAny: hasAny,
  missing: missing,
  complete: complete,
  average: average,
  weighted: weighted
 };
}

function computeSemesterSummary(semester) {
 var sem = normalizeSemester(semester);
 var activeSubjects = GRADE_SUBJECTS.filter(function (s) { return s.active; });
 var rows = activeSubjects.map(function (s) { return Object.assign({ name: s.name }, computeSubjectStats(s.id, sem)); });
 var startedIncomplete = rows.filter(function (r) { return r.hasAny && !r.complete; });
 var completeRows = rows.filter(function (r) { return r.complete; });
 var missingDevoirRows = rows.filter(function (r) { return r.hasAny && (r.d1 === null || r.d2 === null); });

 var status = "empty";
 var generalAverage = null;
 var totalWeighted = 0;
 var totalCoef = 0;

 if (startedIncomplete.length > 0) {
  status = "waiting";
 } else if (completeRows.length > 0) {
  completeRows.forEach(function (r) {
   if (r.coef > 0) {
    totalWeighted += r.weighted;
    totalCoef += r.coef;
   }
  });
  if (totalCoef > 0) {
   generalAverage = totalWeighted / totalCoef;
   status = "ok";
  } else {
   status = "waiting";
  }
 }

 return {
  semester: sem,
  rows: rows,
  activeCount: activeSubjects.length,
  completeCount: completeRows.length,
  startedIncomplete: startedIncomplete,
  missingDevoirRows: missingDevoirRows,
  totalWeighted: totalWeighted,
  totalCoef: totalCoef,
  generalAverage: generalAverage,
  status: status
 };
}

function gradeTypeLabel(type) {
 if (type === "devoir1") return "Devoir 1";
 if (type === "devoir2") return "Devoir 2";
 return "Interrogation";
}

function renderGrades() {
 syncGradeSubjects();
 $("gradeSemester").value = String(activeSemester);
 $("recSemester").value = String(activeSemester);

 var summary = computeSemesterSummary(activeSemester);
 var semGrades = grades.filter(function (g) { return normalizeSemester(g.semester) === activeSemester; });
 var interroCount = semGrades.filter(function (g) { return g.type === "interro"; }).length;
 var devoirCount = semGrades.filter(function (g) { return g.type === "devoir1" || g.type === "devoir2"; }).length;

 var avgDisplay = summary.status === "ok"
  ? fmtGrade(summary.generalAverage)
  : summary.status === "waiting"
   ? "En attente"
   : "—";

 var avgSub = summary.status === "ok"
  ? (summary.completeCount === summary.activeCount
   ? "Officielle · " + fmtPoints(summary.totalWeighted) + " pts / " + summary.totalCoef + " coef."
   : "Provisoire (" + summary.completeCount + "/" + summary.activeCount + " matières) · " + fmtPoints(summary.totalWeighted) + " / " + summary.totalCoef + " coef.")
  : summary.status === "waiting"
   ? "En attente : " + summary.startedIncomplete.length + " matière(s) incomplète(s)"
   : "Saisis tes interrogations et tes 2 devoirs";

 $("gradeSummary").innerHTML =
  "<div class='grade-stat'><strong>" + avgDisplay + "</strong><span>Moyenne générale · Semestre " + activeSemester + " (" + avgSub + ")</span></div>" +
  "<div class='grade-stat'><strong>" + summary.completeCount + "/" + summary.activeCount + "</strong><span>Matières complètes (Interros + 2 devoirs)</span></div>" +
  "<div class='grade-stat'><strong>" + semGrades.length + "</strong><span>Notes saisies (" + interroCount + " interros · " + devoirCount + " devoirs)</span></div>";

 var rowsHtml = GRADE_SUBJECTS.map(function (s) {
  var st = computeSubjectStats(s.id, activeSemester);
  var interroCell = st.moyInterros !== null ? fmtGrade(st.moyInterros) + " <small>(" + st.interros.length + ")</small>" : "— <small>(0)</small>";
  var d1Cell = st.d1 !== null ? fmtGrade(st.d1) : "<span class='grade-badge wait'>Manquant</span>";
  var d2Cell = st.d2 !== null ? fmtGrade(st.d2) : "<span class='grade-badge wait'>Manquant</span>";
  var moyCell, coefCell;
  if (st.complete) {
   var cls = st.average < 10 ? "low" : "ok";
   moyCell = "<span class='grade-badge " + cls + "'>" + fmtGrade(st.average) + "</span>";
   coefCell = "<strong>" + fmtPoints(st.weighted) + "</strong>";
  } else if (st.hasAny) {
   moyCell = "<span class='grade-badge wait' title='Manque : " + esc(st.missing.join(", ")) + "'>En attente</span>";
   coefCell = "<span class='grade-badge wait'>En attente</span>";
  } else {
   moyCell = "—";
   coefCell = "—";
  }
  return "<tr><td>" + esc(s.name) + (s.active ? "" : " <small>(ancienne matière)</small>") + "</td><td>" + (s.active ? st.coef : "—") + "</td><td>" + interroCell + "</td><td>" + d1Cell + "</td><td>" + d2Cell + "</td><td>" + moyCell + "</td><td>" + coefCell + "</td></tr>";
 }).join("");

 $("gradeAverages").innerHTML = "<div style='overflow-x:auto'><table class='grade-table'><thead><tr><th>Matière</th><th>Coef.</th><th>Moy. Interros</th><th>Devoir 1</th><th>Devoir 2</th><th>Moy. matière</th><th>Moy. coeff.</th></tr></thead><tbody>" + rowsHtml + "</tbody></table></div>";

 var list = semGrades.slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
 $("gradeList").innerHTML = list.length ? list.map(function (g) {
  var badgeCls = g.type === "interro" ? "interro" : "devoir";
  return "<div class='grade-row'><div><strong>" + esc(g.title) + "</strong> <span class='grade-badge " + badgeCls + "'>" + esc(gradeTypeLabel(g.type)) + "</span><small>" + esc(subjectName(g.subjectId)) + " · " + esc(g.date || "") + "</small></div><strong>" + Number(g.value).toLocaleString("fr-FR") + "/20</strong><span><button type='button' data-edit-grade='" + esc(g.id) + "' aria-label='Modifier'>✏️</button> <button type='button' data-delete-grade='" + esc(g.id) + "' aria-label='Supprimer'>🗑️</button></span></div>";
 }).join("") : "<div class='grade-empty'>Aucune note pour le Semestre " + activeSemester + ". Ajoute une interrogation ou un devoir.</div>";

 $("gradeSubject").innerHTML = GRADE_SUBJECTS.filter(function (s) { return s.active; }).map(function (s) {
  return '<option value="' + esc(s.id) + '">' + esc(s.name) + "</option>";
 }).join("");
}

function renderCoefficients() {
 $("gradeCoefficientList").innerHTML = "<div style='overflow-x:auto'><table class='grade-table'><thead><tr><th>Matière de l’emploi du temps</th><th>Coefficient</th></tr></thead><tbody>" + GRADE_SUBJECTS.filter(function (s) { return s.active; }).map(function (s) {
  return '<tr><td>' + esc(s.name) + '</td><td><input type="number" min="0" max="20" step="0.5" data-coef="' + esc(s.id) + '" value="' + coefficient(s.id) + '" aria-label="Coefficient ' + esc(s.name) + '"></td></tr>';
 }).join("") + "</tbody></table></div>";
}

function renderRecommendations() {
 $("recSemester").value = String(activeSemester);
 var summary = computeSemesterSummary(activeSemester);
 var cards = [];

 summary.rows.forEach(function (st) {
  if (!st.hasAny) return;
  if (!st.complete) {
   var partialNotes = [];
   if (st.moyInterros !== null) partialNotes.push("Moy. interros : " + fmtGrade(st.moyInterros));
   if (st.d1 !== null) partialNotes.push("Devoir 1 : " + fmtGrade(st.d1));
   if (st.d2 !== null) partialNotes.push("Devoir 2 : " + fmtGrade(st.d2));
   var earlyWarn = ((st.moyInterros !== null && st.moyInterros < 10) || (st.d1 !== null && st.d1 < 10) || (st.d2 !== null && st.d2 < 10));
   cards.push({
    rank: earlyWarn ? 0 : 2,
    coef: st.coef,
    title: (earlyWarn ? "⚠️ Vigilance précoce en " : "⏳ En attente en ") + st.name + " (coef. " + st.coef + ")",
    body: "Moyenne en attente — manque : " + st.missing.join(", ") + ". Notes actuelles : " + partialNotes.join(" · ") + "." + (earlyWarn ? " Tes premières notes sont sous 10/20 : révise dès maintenant avant le prochain devoir !" : " Complète les évaluations manquantes pour calculer la moyenne officielle.")
   });
   return;
  }

  var moyDevoirs = (st.d1 + st.d2) / 2;
  if (st.average < 10) {
   var detail = st.moyInterros >= 11 && moyDevoirs < 10
    ? "Tes interros (" + fmtGrade(st.moyInterros) + ") sont correctes mais tes devoirs (" + fmtGrade(moyDevoirs) + ") font chuter la moyenne : entraîne-toi sur des sujets complets en temps limité."
    : st.moyInterros < 10 && moyDevoirs >= 10
     ? "Tes devoirs (" + fmtGrade(moyDevoirs) + ") tiennent la route, mais ta moyenne d'interros (" + fmtGrade(st.moyInterros) + ") te pénalise : relis tes cours plus régulièrement après chaque séance."
     : "Moy. interros : " + fmtGrade(st.moyInterros) + ", Devoir 1 : " + fmtGrade(st.d1) + ", Devoir 2 : " + fmtGrade(st.d2) + ". Reprends les bases et fais des exercices ciblés chaque semaine.";
   cards.push({
    rank: 0,
    coef: st.coef,
    title: "🔴 Renforcer " + st.name + " (" + fmtGrade(st.average) + " · coef. " + st.coef + ")",
    body: detail
   });
  } else if (st.average < 12) {
   cards.push({
    rank: 1,
    coef: st.coef,
    title: "🟠 Consolider " + st.name + " (" + fmtGrade(st.average) + " · coef. " + st.coef + ")",
    body: "Moy. interros : " + fmtGrade(st.moyInterros) + " · Devoirs : " + fmtGrade(st.d1) + " et " + fmtGrade(st.d2) + ". Tu peux facilement passer au-dessus de 12/20 en corrigeant les erreurs de tes devoirs."
   });
  } else if (st.average >= 15) {
   cards.push({
    rank: 3,
    coef: st.coef,
    title: "🟢 Entretenir " + st.name + " (" + fmtGrade(st.average) + " · coef. " + st.coef + ")",
    body: "Très bon équilibre entre interrogations (" + fmtGrade(st.moyInterros) + ") et devoirs (" + fmtGrade(st.d1) + " / " + fmtGrade(st.d2) + "). Ce fort résultat rapporte " + fmtPoints(st.weighted) + " points pondérés."
   });
  }
 });

 cards.sort(function (a, b) { return a.rank - b.rank || b.coef - a.coef; });

 var bilanText;
 if (summary.status === "empty") {
  bilanText = "Aucune note enregistrée pour le Semestre " + activeSemester + ". Ajoute tes interrogations et tes deux devoirs pour obtenir un bilan personnalisé.";
 } else if (summary.status === "waiting") {
  var waitingNames = summary.startedIncomplete.map(function (r) { return r.name + " (manque " + r.missing.join(", ") + ")"; }).join(" ; ");
  bilanText = "La moyenne générale du Semestre " + activeSemester + " est <strong>en attente</strong> pour ne pas fausser tes résultats. Matières incomplètes : " + esc(waitingNames) + ".";
 } else {
  bilanText = "Ta moyenne générale pondérée du Semestre " + activeSemester + " est de <strong>" + fmtGrade(summary.generalAverage) + "</strong> (" + fmtPoints(summary.totalWeighted) + " points sur " + summary.totalCoef + " coefficients, " + summary.completeCount + "/" + summary.activeCount + " matières complètes).";
 }

 var html = "<div class='grade-panel'><h3>Ton bilan · Semestre " + activeSemester + "</h3><p>" + bilanText + "</p></div>";
 if (cards.length) {
  html += cards.map(function (x) { return '<article class="rec-card"><strong>' + esc(x.title) + '</strong><p>' + esc(x.body) + '</p></article>'; }).join("");
 } else if (summary.status === "ok") {
  html += "<div class='grade-empty'>Toutes tes matières complètes du Semestre " + activeSemester + " sont entre 12/20 et 15/20. Continue ainsi ! ✨</div>";
 }
 $("recommendations").innerHTML = html;
}

function updateDevoirSlotOptions(subjectId, editingGrade) {
 var slotSel = $("gradeSlot");
 if (!slotSel) return;
 var sem = activeSemester;
 var taken1 = grades.some(function (g) { return g.subjectId === subjectId && normalizeSemester(g.semester) === sem && g.type === "devoir1" && (!editingGrade || g.id !== editingGrade.id); });
 var taken2 = grades.some(function (g) { return g.subjectId === subjectId && normalizeSemester(g.semester) === sem && g.type === "devoir2" && (!editingGrade || g.id !== editingGrade.id); });

 slotSel.options[0].textContent = taken1 ? "Devoir 1 (déjà saisi)" : "Devoir 1";
 slotSel.options[0].disabled = taken1;
 slotSel.options[1].textContent = taken2 ? "Devoir 2 (déjà saisi)" : "Devoir 2";
 slotSel.options[1].disabled = taken2;

 if (editingGrade && (editingGrade.type === "devoir1" || editingGrade.type === "devoir2")) {
  slotSel.value = editingGrade.type;
 } else if (!taken1) {
  slotSel.value = "devoir1";
 } else if (!taken2) {
  slotSel.value = "devoir2";
 } else {
  slotSel.value = "devoir1";
 }
}

function openGradeModal(mode, editGrade) {
 renderGrades();
 gradeEditId = editGrade ? editGrade.id : null;
 activeGradeMode = editGrade ? (editGrade.type === "interro" ? "interro" : "devoir") : mode;
 $("gradeForm").reset();
 var now = new Date();
 $("gradeDate").value = editGrade ? (editGrade.date || "") : now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
 $("gradeError").textContent = "";

 var gradeSelect = $("gradeSubject");
 if (editGrade && !Array.prototype.some.call(gradeSelect.options, function (o) { return o.value === editGrade.subjectId; })) {
  var archivedOption = document.createElement("option");
  archivedOption.value = editGrade.subjectId;
  archivedOption.textContent = subjectName(editGrade.subjectId) + " (ancienne matière)";
  gradeSelect.appendChild(archivedOption);
 }
 if (editGrade) gradeSelect.value = editGrade.subjectId;

 var isDevoir = activeGradeMode === "devoir";
 $("gradeSlotWrap").hidden = !isDevoir;
 $("gradeTitle").placeholder = isDevoir ? "Ex. : Devoir surveillé" : "Ex. : Interrogation écrite";
 if (editGrade) {
  $("gradeValue").value = editGrade.value;
  $("gradeTitle").value = editGrade.title;
  $("gradeDialogTitle").textContent = isDevoir ? "✏️ Modifier un devoir (Sem. " + activeSemester + ")" : "✏️ Modifier une interrogation (Sem. " + activeSemester + ")";
 } else {
  $("gradeDialogTitle").textContent = isDevoir ? "＋ Ajouter un devoir (Sem. " + activeSemester + ")" : "＋ Ajouter une note d'interrogation (Sem. " + activeSemester + ")";
 }

 if (isDevoir) {
  updateDevoirSlotOptions(gradeSelect.value, editGrade);
 }
 $("gradeDialog").showModal();
}

function showAppView(view) {
 var hw = view === "homework", gr = view === "grades", rc = view === "recommend";
 $("scheduleView").hidden = hw || gr || rc;
 $("homeworkView").hidden = !hw;
 $("gradesView").hidden = !gr;
 $("recommendView").hidden = !rc;
 [["navSchedule", !hw && !gr && !rc], ["navHomework", hw], ["navGrades", gr], ["navRecs", rc]].forEach(function (x) {
  $(x[0]).setAttribute("aria-pressed", x[1] ? "true" : "false");
 });
 if (hw) { refreshHomeworkSubjectFilter(); renderHomework(); }
 if (gr) renderGrades();
 if (rc) renderRecommendations();
}

$("navSchedule").onclick = function () { showAppView("schedule"); };
$("navHomework").onclick = function () { showAppView("homework"); };
$("navGrades").onclick = function () { showAppView("grades"); };
$("navRecs").onclick = function () { showAppView("recommend"); };

$("gradeSemester").onchange = function () {
 activeSemester = normalizeSemester(this.value);
 renderGrades();
 renderRecommendations();
};
$("recSemester").onchange = function () {
 activeSemester = normalizeSemester(this.value);
 renderGrades();
 renderRecommendations();
};

$("gradeAddInterro").onclick = function () { openGradeModal("interro", null); };
$("gradeAddDevoir").onclick = function () { openGradeModal("devoir", null); };
$("gradeSubject").onchange = function () {
 if (activeGradeMode === "devoir") {
  var old = gradeEditId ? grades.find(function (x) { return x.id === gradeEditId; }) : null;
  updateDevoirSlotOptions(this.value, old);
 }
};
$("gradeCancel").onclick = function () { $("gradeDialog").close(); };

$("gradeForm").onsubmit = function (e) {
 e.preventDefault();
 var rawVal = $("gradeValue").value.trim(), v = Number(rawVal), sub = $("gradeSubject").value, title = $("gradeTitle").value.trim(), date = $("gradeDate").value;
 if (!title) { $("gradeError").textContent = "Indique l’intitulé de l’évaluation."; return; }
 if (rawVal === "" || !Number.isFinite(v) || v < 0 || v > 20) { $("gradeError").textContent = "La note doit être comprise entre 0 et 20."; return; }

 var old = gradeEditId ? grades.find(function (x) { return x.id === gradeEditId; }) : null;
 var type = activeGradeMode === "devoir" ? $("gradeSlot").value : "interro";

 if (type === "devoir1" || type === "devoir2") {
  var existingDevoirs = grades.filter(function (g) {
   return g.subjectId === sub && normalizeSemester(g.semester) === activeSemester && (g.type === "devoir1" || g.type === "devoir2") && (!old || g.id !== old.id);
  });
  if (existingDevoirs.length >= 2) {
   $("gradeError").textContent = "Maximum 2 devoirs par matière et par semestre atteint. Modifie ou supprime un devoir existant.";
   return;
  }
  var slotConflict = existingDevoirs.some(function (g) { return g.type === type; });
  if (slotConflict) {
   $("gradeError").textContent = gradeTypeLabel(type) + " est déjà saisi pour cette matière ce semestre.";
   return;
  }
 }

 var item = {
  id: old ? old.id : ("gr-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
  semester: old ? normalizeSemester(old.semester) : activeSemester,
  subjectId: sub,
  type: type,
  value: v,
  title: title,
  date: date
 };
 if (old) grades[grades.indexOf(old)] = item;
 else grades.push(item);

 if (saveGrades()) {
  $("gradeDialog").close();
  gradeEditId = null;
  renderGrades();
  renderRecommendations();
 }
};

$("gradeList").onclick = function (e) {
 var edit = e.target.closest("[data-edit-grade]"), del = e.target.closest("[data-delete-grade]");
 if (edit) {
  var g = grades.find(function (x) { return x.id === edit.dataset.editGrade; });
  if (!g) return;
  openGradeModal(g.type === "interro" ? "interro" : "devoir", g);
 }
 if (del) {
  var id = del.dataset.deleteGrade;
  if (confirm("Supprimer cette note ?")) {
   grades = grades.filter(function (x) { return x.id !== id; });
   saveGrades();
   renderGrades();
   renderRecommendations();
  }
 }
};

$("gradeSubjectsToggle").onclick = function () {
 $("gradeCoefficients").hidden = !$("gradeCoefficients").hidden;
 if (!$("gradeCoefficients").hidden) renderCoefficients();
};

$("gradeCoeffSave").onclick = function () {
 var inputs = $("gradeCoefficientList").querySelectorAll("[data-coef]"), next = {};
 for (var i = 0; i < inputs.length; i++) {
  var n = Number(inputs[i].value);
  if (!Number.isFinite(n) || n < 0 || n > 20) {
   alert("Chaque coefficient doit être compris entre 0 et 20.");
   return;
  }
  next[inputs[i].dataset.coef] = n;
 }
 try {
  localStorage.setItem(COEF_KEY, JSON.stringify(next));
  gradeCoefficients = next;
  renderGrades();
  renderRecommendations();
  alert("Coefficients enregistrés.");
 } catch (e) {
  alert("Impossible d'enregistrer les coefficients.");
 }
};

/* ---- Initialisation ---- */
try { load(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { loadHomework(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { loadGrades(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { refreshHomeworkSubjectFilter(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { render(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { renderHomework(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { setDisplayMode(mobileQuery); } catch (e) { reportAppError(e && e.message ? e.message : e); }
setInterval(function () { try { tick(); } catch (e) { reportAppError(e && e.message ? e.message : e); } }, 30000);
registerAppServiceWorker().then(function () { startReminderChecks(); });
window.addEventListener("online", function () { registerAppServiceWorker().then(function () { updateReminderUI(); checkHomeworkReminders(); }); });