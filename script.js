/* ============================================================================
   My EDT — Fichier JS unique fusionné
   Ordre : [1] Core (ancien script(1).js) → [2] Modules métier (ancien script.js)
           → [3] Initialisation finale
   ============================================================================ */

/* ============================================================================
   PARTIE 1 — CORE / FONDATIONS
   (anciennement script(1).js)
   ============================================================================ */

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

var LIFE_PRESETS = [
 { id: "sport", name: "Sport / Entraînement", icon: "🏃", color: "#10B981", anim: "pulse" },
 { id: "lecture", name: "Lecture", icon: "📖", color: "#3B82F6", anim: "bob" },
 { id: "medit", name: "Méditation / Calme", icon: "🧘", color: "#8B5CF6", anim: "bob" },
 { id: "projets", name: "Projets perso", icon: "💻", color: "#06B6D4", anim: "pulse" },
 { id: "revisions", name: "Révisions libres", icon: "📚", color: "#F59E0B", anim: "wig" },
 { id: "marche", name: "Marche 30 min", icon: "🚶", color: "#22C55E", anim: "bob" },
 { id: "hydrat", name: "Hydratation 2 L", icon: "💧", color: "#0EA5E9", anim: "bob" },
 { id: "menage", name: "Rangement / Tâches", icon: "🧹", color: "#64748B", anim: "wig" },
 { id: "musique", name: "Musique / Art", icon: "🎸", color: "#EC4899", anim: "wig" },
 { id: "cuisine", name: "Cuisine / Repas", icon: "🥗", color: "#84CC16", anim: "bob" },
 { id: "detente", name: "Détente / Loisirs", icon: "🎮", color: "#6366F1", anim: "bob" },
 { id: "sommeil", name: "Routine soir", icon: "😴", color: "#475569", anim: "bob" }
];

var DN_SCHOOL = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
var DN_LIFE = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

var META_KEY = "edt-meta-v1", LIFE_KEY = "edt-life-data";
var meta = { universe: "school", schoolTitle: "Terminale F3", lifeTitle: "Libre & Habitudes" };
var S, B, lifeData = { S: {}, B: [], habits: [], logs: {} };
var T0 = 7, T1 = 19, hk = "", ed = -1, currentView = "schedule";

function $(i) { return document.getElementById(i); }

function reportAppError(message) {
 var msg = "L’application a rencontré un problème : " + String(message || "erreur inconnue") + ". Les données enregistrées ne sont pas effacées.";
 var el = $("reminderStatus");
 if (el) el.textContent = msg;
 var st = $("islandStatus");
 if (st) st.textContent = "Erreur de chargement";
 var hero = $("hero");
 if (hero && !hero.innerHTML) {
  hero.innerHTML = "<div class='hero' style='background:var(--card);color:var(--tx)'><div class='big'>⚠️</div><div class='grow'><h2>Erreur de chargement</h2><p>" + esc(msg) + "</p></div></div>";
 }
}

window.addEventListener("error", function (ev) { reportAppError(ev && ev.message ? ev.message : "Erreur JavaScript"); });
window.addEventListener("unhandledrejection", function (ev) { var r = ev && ev.reason; reportAppError(r && r.message ? r.message : r || "Erreur asynchrone"); });

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
function todayNum() { var d = new Date().getDay(); return d === 0 ? 7 : d; }
function dateKey(dateObj) {
 var d = dateObj || new Date();
 return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

/* ---- Helpers d'univers actif ---- */
function isLife() { return meta.universe === "life"; }
function activeDays() { return isLife() ? DN_LIFE : DN_SCHOOL; }
function activeS() { return isLife() ? lifeData.S : S; }
function activeB() { return isLife() ? lifeData.B : B; }
function activeTitle() { return isLife() ? meta.lifeTitle : meta.schoolTitle; }
function saveActive() { if (isLife()) saveLifeData(); else save(); }

function loadMeta() {
 meta = { universe: "school", schoolTitle: "Terminale F3", lifeTitle: "Libre & Habitudes" };
 try {
  var raw = localStorage.getItem(META_KEY), j = raw ? JSON.parse(raw) : null;
  if (j && typeof j === "object") {
   if (j.universe === "school" || j.universe === "life") meta.universe = j.universe;
   if (typeof j.schoolTitle === "string" && j.schoolTitle.trim()) meta.schoolTitle = j.schoolTitle.trim();
   if (typeof j.lifeTitle === "string" && j.lifeTitle.trim()) meta.lifeTitle = j.lifeTitle.trim();
  }
 } catch (e) {}
}
function saveMeta() {
 try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) {}
}

function validateSubjectMap(obj) {
 var next = {};
 if (!obj || typeof obj !== "object" || Array.isArray(obj)) return next;
 Object.keys(obj).forEach(function (k) {
  var v = obj[k];
  if (Array.isArray(v) && typeof v[0] === "string" && typeof v[1] === "string" && /^#[0-9a-f]{6}$/i.test(v[2] || "") && typeof v[3] === "string") {
   next[k] = [v[0], v[1], v[2], v[3], typeof v[4] === "string" ? v[4] : "bob"];
  }
 });
 return next;
}

function validateBlockList(arr, subjectMap, maxDay) {
 if (!Array.isArray(arr)) return [];
 return arr.filter(function (b) {
  return Array.isArray(b) && b.length >= 4 && Number.isInteger(Number(b[0])) && Number(b[0]) >= 1 && Number(b[0]) <= maxDay && subjectMap[b[1]] && Number.isFinite(Number(b[2])) && Number.isFinite(Number(b[3])) && Number(b[2]) >= 0 && Number(b[3]) <= 24 && Number(b[3]) > Number(b[2]);
 }).map(function (b) { return [Number(b[0]), b[1], Number(b[2]), Number(b[3])]; });
}

function load() {
 S = clone(DEF_S);
 B = clone(DEF_B);
 try {
  var raw = localStorage.getItem("edt-data"), j = raw ? JSON.parse(raw) : null;
  if (j) {
   var nextS = validateSubjectMap(j.S);
   if (Object.keys(nextS).length) S = nextS;
   if (Array.isArray(j.B)) B = validateBlockList(j.B, S, 6);
  }
 } catch (e) {
  S = clone(DEF_S);
  B = clone(DEF_B);
 }
}
function save() {
 try { localStorage.setItem("edt-data", JSON.stringify({ S: S, B: B })); } catch (e) {}
}

function loadLifeData() {
 lifeData = { S: {}, B: [], habits: [], logs: {} };
 try {
  var raw = localStorage.getItem(LIFE_KEY), j = raw ? JSON.parse(raw) : null;
  if (j && typeof j === "object") {
   lifeData.S = validateSubjectMap(j.S);
   lifeData.B = validateBlockList(j.B, lifeData.S, 7);
   lifeData.habits = Array.isArray(j.habits) ? j.habits.filter(function (h) {
    return h && typeof h.id === "string" && typeof h.name === "string" && h.name.trim();
   }).map(function (h) {
    return {
     id: h.id,
     name: h.name.trim(),
     icon: typeof h.icon === "string" && h.icon.trim() ? h.icon.trim() : "🌿",
     color: /^#[0-9a-f]{6}$/i.test(h.color || "") ? h.color : "#10B981"
    };
   }) : [];
   lifeData.logs = (j.logs && typeof j.logs === "object" && !Array.isArray(j.logs)) ? j.logs : {};
  }
 } catch (e) {
  lifeData = { S: {}, B: [], habits: [], logs: {} };
 }
}
function saveLifeData() {
 try { localStorage.setItem(LIFE_KEY, JSON.stringify(lifeData)); return true; }
 catch (e) { alert("Impossible d'enregistrer les données personnelles sur cet appareil."); return false; }
}

/* ---- Capsule Dynamic Island & Bascule Glitch ---- */
var isIslandExpanded = false, isSwitchingUniverse = false;

function lifeBlockKey(b) { return b[0] + "|" + b[1] + "|" + b[2] + "|" + b[3]; }
function isLifeBlockDone(dateStr, b) {
 var dayLog = lifeData.logs[dateStr];
 return !!(dayLog && dayLog.blocks && dayLog.blocks[lifeBlockKey(b)]);
}
function toggleLifeBlockDone(dateStr, b) {
 if (!lifeData.logs[dateStr]) lifeData.logs[dateStr] = { blocks: {}, habits: {} };
 if (!lifeData.logs[dateStr].blocks) lifeData.logs[dateStr].blocks = {};
 var key = lifeBlockKey(b);
 if (lifeData.logs[dateStr].blocks[key]) delete lifeData.logs[dateStr].blocks[key];
 else lifeData.logs[dateStr].blocks[key] = true;
 saveLifeData();
}
function isLifeHabitDone(dateStr, habitId) {
 var dayLog = lifeData.logs[dateStr];
 return !!(dayLog && dayLog.habits && dayLog.habits[habitId]);
}
function toggleLifeHabitDone(dateStr, habitId) {
 if (!lifeData.logs[dateStr]) lifeData.logs[dateStr] = { blocks: {}, habits: {} };
 if (!lifeData.logs[dateStr].habits) lifeData.logs[dateStr].habits = {};
 if (lifeData.logs[dateStr].habits[habitId]) delete lifeData.logs[dateStr].habits[habitId];
 else lifeData.logs[dateStr].habits[habitId] = true;
 saveLifeData();
}

function todayLifeProgress() {
 var dKey = dateKey(), tDay = todayNum();
 var todayBlocks = lifeData.B.filter(function (b) { return b[0] === tDay && lifeData.S[b[1]]; });
 var doneBlocks = todayBlocks.filter(function (b) { return isLifeBlockDone(dKey, b); }).length;
 var doneHabits = lifeData.habits.filter(function (h) { return isLifeHabitDone(dKey, h.id); }).length;
 return { done: doneBlocks + doneHabits, total: todayBlocks.length + lifeData.habits.length, blocks: todayBlocks };
}

function getSlotStatus(subjectMap, blockList, dayNames) {
 var Q = blockList.filter(function (b) { return subjectMap[b[1]]; });
 if (!Q.length) return { cur: null, nx: null, best: 0, empty: true };
 var n = new Date(), d = todayNum(), t = n.getHours() + n.getMinutes() / 60, cur = null, nx = null, best = 1e9;
 Q.forEach(function (b) { if (b[0] === d && b[2] <= t && t < b[3]) cur = b; });
 if (!cur) {
  Q.forEach(function (b) {
   var x = ((b[0] - d + 7) % 7) * 24 + b[2] - t;
   if (x < 0) x += 168;
   if (x < best) { best = x; nx = b; }
  });
 }
 return { cur: cur, nx: nx, best: best, empty: false, dayNames: dayNames };
}

function renderIsland() {
 var curS = activeS(), curB = activeB(), days = activeDays();
 var status = getSlotStatus(curS, curB, days);
 var n = new Date(), t = n.getHours() + n.getMinutes() / 60, d = todayNum();

 $("islandUni").textContent = isLife() ? "🌿" : "🎓";
 $("islandTitle").textContent = activeTitle();

 if (status.empty) {
  $("islandStatus").textContent = isLife() ? "Planning vierge · appui long = Scolaire" : "Aucun créneau · appui long = Libre";
  $("islandSlotLabel").textContent = "PLANNING";
  $("islandSlotName").textContent = "Aucun créneau";
  $("islandSlotTime").textContent = isLife() ? "Clique sur la grille ou + pour planifier" : "Clique sur un jour pour ajouter un cours";
 } else if (status.cur) {
  var cs = curS[status.cur[1]];
  $("islandStatus").textContent = "En cours : " + cs[0] + " · reste " + dur(status.cur[3] - t);
  $("islandSlotLabel").textContent = "EN COURS";
  $("islandSlotName").textContent = cs[1] + " " + cs[0];
  $("islandSlotTime").textContent = "Fin à " + fh(status.cur[3]) + " (encore " + dur(status.cur[3] - t) + ")";
 } else {
  var ns = curS[status.nx[1]];
  var dayPrefix = (status.best >= 24 || status.nx[0] !== d) ? (days[status.nx[0] - 1] + " ") : "";
  $("islandStatus").textContent = "À suivre : " + ns[0] + " · dans " + dur(status.best);
  $("islandSlotLabel").textContent = "À SUIVRE";
  $("islandSlotName").textContent = ns[1] + " " + ns[0];
  $("islandSlotTime").textContent = dayPrefix + fh(status.nx[2]) + " – " + fh(status.nx[3]);
 }

 var totalHours = curB.reduce(function (a, b) { return a + (b[3] - b[2]); }, 0);
 var alertEl = $("islandAlert");

 if (!isLife()) {
  var pendingHw = homework.filter(function (x) { return x.status !== "done"; });
  var overdueHw = pendingHw.filter(homeworkIsOverdue);
  if (overdueHw.length) { alertEl.hidden = false; alertEl.textContent = overdueHw.length + " retard"; }
  else if (pendingHw.length) { alertEl.hidden = false; alertEl.textContent = pendingHw.length + " devoir" + (pendingHw.length > 1 ? "s" : ""); }
  else alertEl.hidden = true;

  $("islandWeekLabel").textContent = "SEMAINE SCOLAIRE";
  $("islandWeekMain").textContent = Math.round(totalHours * 10) / 10 + " h · " + curB.length + " créneaux";
  $("islandWeekSub").textContent = overdueHw.length
   ? overdueHw.length + " devoir(s) en retard !"
   : pendingHw.length ? pendingHw.length + " devoir(s) à faire" : "Tous les devoirs sont à jour";
 } else {
  var prog = todayLifeProgress();
  if (prog.total > 0) { alertEl.hidden = false; alertEl.textContent = prog.done + "/" + prog.total; }
  else alertEl.hidden = true;

  $("islandWeekLabel").textContent = "SEMAINE LIBRE (7J)";
  $("islandWeekMain").textContent = prog.total ? (prog.done + "/" + prog.total + " faits aujourd’hui") : (Math.round(totalHours * 10) / 10 + " h planifiées");
  $("islandWeekSub").textContent = lifeData.habits.length + " habitude(s) · " + curB.length + " créneau(x)";
 }
}

function setIslandExpanded(open) {
 isIslandExpanded = !!open;
 $("island").setAttribute("aria-expanded", isIslandExpanded ? "true" : "false");
 $("islandExpanded").hidden = !isIslandExpanded;
}

function applyUniverse(target) {
 meta.universe = target === "life" ? "life" : "school";
 saveMeta();
 document.documentElement.dataset.universe = meta.universe;
 document.title = "My EDT · " + activeTitle();
 var themeMeta = document.querySelector('meta[name="theme-color"]');
 if (themeMeta) themeMeta.setAttribute("content", isLife() ? "#10B981" : "#F5B301");

 [].forEach.call(document.querySelectorAll(".appnav button[data-uni]"), function (btn) {
  btn.hidden = btn.dataset.uni !== meta.universe;
 });

 var t = todayNum(), maxD = activeDays().length;
 sel = (t >= 1 && t <= maxD) ? t : 1;

 setIslandExpanded(false);
 showAppView("schedule");
 render();
 if (isLife()) { renderLifeHabits(); renderLifeStats(); }
}

function triggerUniverseSwitch() {
 if (isSwitchingUniverse) return;
 isSwitchingUniverse = true;
 var target = isLife() ? "school" : "life";
 $("glitchBadge").textContent = target === "life" ? "🌿" : "🎓";
 $("glitchTitle").textContent = target === "life" ? meta.lifeTitle.toUpperCase() : meta.schoolTitle.toUpperCase();

 if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
  applyUniverse(target);
  isSwitchingUniverse = false;
  return;
 }

 var ov = $("glitchOverlay");
 ov.hidden = false;
 ov.classList.remove("active");
 void ov.offsetWidth;
 ov.classList.add("active");

 setTimeout(function () { applyUniverse(target); }, 220);
 setTimeout(function () {
  ov.classList.remove("active");
  ov.hidden = true;
  isSwitchingUniverse = false;
 }, 540);
}

(function setupIslandControls() {
 var island = $("island"), holdTimer = null, startX = 0, startY = 0, longPressed = false, ignoreClickUntil = 0;

 function clearHold() {
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  island.classList.remove("pressing");
 }

 island.addEventListener("pointerdown", function (e) {
  if (e.button && e.button !== 0) return;
  if (e.target.closest("#islandEditTitle")) return;
  clearHold();
  longPressed = false;
  startX = e.clientX;
  startY = e.clientY;
  island.classList.add("pressing");
  holdTimer = setTimeout(function () {
   holdTimer = null;
   longPressed = true;
   ignoreClickUntil = Date.now() + 400;
   island.classList.remove("pressing");
   triggerUniverseSwitch();
  }, 550);
 });

 island.addEventListener("pointermove", function (e) {
  if (!holdTimer) return;
  if (Math.hypot(e.clientX - startX, e.clientY - startY) > 12) clearHold();
 });
 island.addEventListener("pointerup", clearHold);
 island.addEventListener("pointercancel", clearHold);
 island.addEventListener("pointerleave", clearHold);
 island.addEventListener("contextmenu", function (e) {
  if (holdTimer || longPressed || Date.now() < ignoreClickUntil) e.preventDefault();
 });

 island.addEventListener("click", function (e) {
  if (e.target.closest("#islandEditTitle")) return;
  if (longPressed || Date.now() < ignoreClickUntil) {
   longPressed = false;
   e.preventDefault();
   return;
  }
  setIslandExpanded(!isIslandExpanded);
 });

 island.addEventListener("keydown", function (e) {
  if (e.target.closest("#islandEditTitle")) return;
  if (e.key === "Enter" || e.key === " ") {
   e.preventDefault();
   setIslandExpanded(!isIslandExpanded);
  }
 });

 $("islandEditTitle").onclick = function (e) {
  e.stopPropagation();
  $("titleSchoolInput").value = meta.schoolTitle;
  $("titleLifeInput").value = meta.lifeTitle;
  $("dTitle").showModal();
 };
 $("titleCancel").onclick = function () { $("dTitle").close(); };
 $("titleForm").onsubmit = function (e) {
  e.preventDefault();
  var sc = $("titleSchoolInput").value.trim(), lf = $("titleLifeInput").value.trim();
  if (sc) meta.schoolTitle = sc;
  if (lf) meta.lifeTitle = lf;
  saveMeta();
  document.title = "My EDT · " + activeTitle();
  $("dTitle").close();
  renderIsland();
 };
})();

/* ---- Rendu grille (6 jours Scolaire / 7 jours Libre) ---- */
var td = todayNum(), sel = (td >= 1 && td <= 6) ? td : 1, tl = $("tl"), tb = $("tabs"), lg = $("l"), H = $("hero");
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

function nextClassInfo(subjectId, blockList) {
 var now = new Date(), today = todayNum(), minutes = now.getHours() * 60 + now.getMinutes(), best = null;
 blockList.forEach(function (b) {
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
 if (!info) return isLife() ? "Aucun créneau programmé" : "Aucun cours programmé";
 if (info.ongoing) return (isLife() ? "En cours" : "Cours en cours") + " · fin à " + fh(info.b[3]);
 var m = info.delta, days = Math.floor(m / 1440), hours = Math.floor(m % 1440 / 60), mins = m % 60, parts = [];
 if (days) parts.push(days + " j");
 if (hours) parts.push(hours + " h");
 if (!days && mins) parts.push(mins + " min");
 return (isLife() ? "Prochaine séance dans " : "Prochain cours dans ") + (parts.join(" ") || "moins d’une minute");
}

function homeworkCounts() {
 var counts = {};
 homework.forEach(function (x) {
  if (x.status !== "done" && x.subjectId) counts[x.subjectId] = (counts[x.subjectId] || 0) + 1;
 });
 return counts;
}

function render() {
 var curS = activeS(), curB = activeB(), days = activeDays(), numDays = days.length;
 td = todayNum();
 if (sel < 1 || sel > numDays) sel = 1;

 T0 = 7; T1 = 19;
 curB.forEach(function (b) { T0 = Math.min(T0, Math.floor(b[2])); T1 = Math.max(T1, Math.ceil(b[3])); });
 tl.style.setProperty("--rows", T1 - T0);
 tl.classList.toggle("cols-6", numDays === 6);
 tl.classList.toggle("cols-7", numDays === 7);

 var h = "<div class='dh'></div>";
 days.forEach(function (n, i) { h += "<div class='dh" + (td == i + 1 ? " today" : "") + (sel == i + 1 ? " on" : "") + "' data-d='" + (i + 1) + "'>" + n + "</div>"; });
 h += "<div class='gut'>";
 for (var i = T0; i < T1; i++) h += "<div class='hl'>" + i + "h</div>";
 h += "</div>";
 for (var d = 1; d <= numDays; d++) h += "<div class='col" + (td == d ? " today" : "") + (sel == d ? " on" : "") + "' data-d='" + d + "'></div>";
 tl.innerHTML = h;

 var k = 0, counts = homeworkCounts(), tKey = dateKey();
 curB.forEach(function (b, i) {
  var s = curS[b[1]]; if (!s) return;
  var e = document.createElement("div");
  e.className = "b" + (b[1] == "free" ? " free" : "");
  e.style.cssText = "--c:" + s[2] + ";--f:" + s[3] + ";top:calc(" + (b[2] - T0) + "*var(--h) + 2px);height:calc(" + (b[3] - b[2]) + "*var(--h) - 4px);animation-delay:" + (k++ * 0.06) + "s";
  var info = nextClassInfo(b[1], curB);

  if (!isLife()) {
   var count = counts[b[1]] || 0;
   e.innerHTML = "<span class='ic " + s[4] + "'>" + esc(s[1]) + "</span><div class='t'><b>" + esc(s[0]) + "</b><span>" + fh(b[2]) + " – " + fh(b[3]) + "</span><span class='subbadge " + (count ? "" : "none") + "'>" + (count ? count + " devoir" + (count > 1 ? "s" : "") + " à faire" : "Aucun devoir") + "</span><span class='next-subject'>" + esc(countdownText(info)) + "</span></div>";
  } else {
   var isTodayBlock = b[0] === td;
   var doneToday = isTodayBlock && isLifeBlockDone(tKey, b);
   e.innerHTML = "<span class='ic " + s[4] + "'>" + esc(s[1]) + "</span><div class='t'><b>" + esc(s[0]) + "</b><span>" + fh(b[2]) + " – " + fh(b[3]) + "</span>" + (isTodayBlock ? "<button type='button' class='life-done-btn" + (doneToday ? " checked" : "") + "'>" + (doneToday ? "✅ Fait aujourd’hui" : "○ Marquer fait") + "</button>" : "<span class='next-subject'>" + esc(countdownText(info)) + "</span>") + "</div>";
   if (isTodayBlock) {
    e.querySelector(".life-done-btn").onclick = function (ev) {
     ev.stopPropagation();
     toggleLifeBlockDone(tKey, b);
     render();
     renderLifeHabits();
     renderLifeStats();
     renderIsland();
    };
   }
  }

  e.querySelector(".ic").onclick = function (ev) { ev.stopPropagation(); burst(ev.clientX, ev.clientY, s[1]); };
  e.onclick = function (ev) { ev.stopPropagation(); openB(i); };
  var targetCol = tl.querySelector(".col[data-d='" + b[0] + "']");
  if (targetCol) targetCol.appendChild(e);
 });

 [].forEach.call(tl.querySelectorAll(".col[data-d]"), function (col) {
  var dayNum = +col.dataset.d;
  if (!col.children.length && (isLife() || dayNum === 6)) {
   var hint = document.createElement("div");
   hint.className = "col-empty-hint";
   hint.textContent = dayNum === 6 && !isLife()
    ? "➕ Cliquer pour ajouter un cours / TD"
    : "➕ Cliquer pour planifier";
   col.appendChild(hint);
  }
  col.onclick = function (ev) {
   if (ev.target.closest(".b")) return;
   var rect = col.getBoundingClientRect();
   var relY = Math.max(0, ev.clientY - rect.top);
   var rowPx = rect.height / Math.max(1, T1 - T0);
   var clickedHour = Math.min(T1 - 1, Math.max(T0, Math.floor(T0 + relY / rowPx)));
   openB(-1, dayNum, clickedHour);
  };
 });

 tb.innerHTML = "";
 tb.setAttribute("role", "tablist");
 tb.setAttribute("aria-label", "Choisir le jour à afficher");
 days.forEach(function (n, i) {
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
 Object.keys(curS).forEach(function (q) {
  if (q == "free") return;
  var s = curS[q], c = document.createElement("span");
  c.className = "chip";
  c.style.cssText = "background:" + s[2] + ";color:" + s[3];
  c.textContent = s[1] + " " + s[0];
  lg.appendChild(c);
 });
 hk = "";
 tick();
}

function tick() {
 var curS = activeS(), curB = activeB(), days = activeDays();
 var status = getSlotStatus(curS, curB, days);
 if (status.empty) {
  H.innerHTML = isLife()
   ? "<div class='hero' style='background:var(--card);color:var(--tx)'><div class='big'>🌿</div><div class='grow'><div class='lab'>LIBRE &amp; HABITUDES</div><h2>Planning 7 jours vierge</h2><p>Clique sur un jour de la grille, sur ➕ ou va dans « Habitudes &amp; Suivi » pour choisir tes activités.</p></div></div>"
   : "<div class='hero' style='background:var(--card);color:var(--tx)'><div class='big'>📅</div><div class='grow'><div class='lab'>EMPLOI DU TEMPS</div><h2>Aucun cours programmé</h2><p>Ajoute un cours avec le bouton ➕ ou en cliquant sur la grille.</p></div></div>";
  hk = "";
  renderIsland();
  return;
 }

 var n = new Date(), d = todayNum(), t = n.getHours() + n.getMinutes() / 60;
 var cur = status.cur, nx = status.nx, best = status.best;
 var b = cur || nx, s = curS[b[1]], key = (isLife() ? "L" : "S") + (cur ? "c" : "n") + b.join();
 if (key != hk) {
  hk = key;
  H.innerHTML = "<div class='hero' style='background:linear-gradient(135deg," + s[2] + "," + s[2] + "cc);color:" + s[3] + "'><div class='big'>" + esc(s[1]) + "</div><div class='grow'><div class='lab'>" + (cur ? "<span class='dot'></span>EN COURS" : "À SUIVRE") + "</div><h2>" + esc(s[0]) + "</h2><p id='pt'></p>" + (cur ? "<div class='pb'><div id='pf'></div></div>" : "") + "</div></div>";
 }
 var p = $("pt");
 if (cur) {
  p.textContent = "Encore " + dur(b[3] - t) + " · fin à " + fh(b[3]);
  $("pf").style.width = ((t - b[2]) / (b[3] - b[2]) * 100) + "%";
 } else {
  p.textContent = "Dans " + dur(best) + " · " + (best >= 24 || b[0] != d ? days[b[0] - 1] + " " : "") + fh(b[2]) + " – " + fh(b[3]);
 }
 var o = document.querySelector(".now"); if (o) o.remove();
 var c = tl.querySelector(".col.today");
 if (c && t >= T0 && t < T1) {
  o = document.createElement("div");
  o.className = "now";
  o.style.top = "calc(" + (t - T0) + "*var(--h))";
  c.appendChild(o);
 }
 renderIsland();
}

/* ---- Univers 2 : Habitudes, panoplie & bilan semaine ---- */
var lifeHabitEditId = null;

function ensureLifePresetCategory(preset) {
 if (!lifeData.S[preset.id]) {
  lifeData.S[preset.id] = [preset.name, preset.icon, preset.color, fgOf(preset.color), preset.anim || "bob"];
  saveLifeData();
 }
 return preset.id;
}

function addLifeHabitFromPreset(preset) {
 var exists = lifeData.habits.some(function (h) { return h.name.toLocaleLowerCase() === preset.name.toLocaleLowerCase(); });
 if (exists) {
  alert("« " + preset.name + " » est déjà dans tes habitudes quotidiennes.");
  return;
 }
 lifeData.habits.push({
  id: "hab-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
  name: preset.name,
  icon: preset.icon,
  color: preset.color
 });
 saveLifeData();
 renderLifeHabits();
 renderLifeStats();
 renderIsland();
}

function computeHabitStreak(habitId) {
 var streak = 0, d = new Date();
 if (!isLifeHabitDone(dateKey(d), habitId)) d.setDate(d.getDate() - 1);
 for (var i = 0; i < 365; i++) {
  if (isLifeHabitDone(dateKey(d), habitId)) {
   streak++;
   d.setDate(d.getDate() - 1);
  } else break;
 }
 return streak;
}

function openLifeHabitModal(habitId) {
 var h = habitId ? lifeData.habits.find(function (x) { return x.id === habitId; }) : null;
 lifeHabitEditId = h ? h.id : null;
 $("lifeHabitDialogTitle").textContent = h ? "✏️ Modifier l’habitude" : "＋ Habitude quotidienne";
 $("lifeHabitIcon").value = h ? h.icon : "🌿";
 $("lifeHabitName").value = h ? h.name : "";
 $("lifeHabitColor").value = h ? h.color : "#10B981";
 $("lifeHabitError").textContent = "";
 $("lifeHabitDelete").style.display = h ? "" : "none";
 $("dLifeHabit").showModal();
}

function renderLifeHabits() {
 var dKey = dateKey(), tDay = todayNum();

 var todayBlocks = lifeData.B.filter(function (b) { return b[0] === tDay && lifeData.S[b[1]]; }).sort(function (a, b) { return a[2] - b[2]; });
 var blocksBox = $("lifeTodayBlocks");
 if (!todayBlocks.length) {
  blocksBox.innerHTML = "<div class='hwempty'>Aucune activité planifiée pour aujourd’hui (" + DN_LIFE[tDay - 1] + "). Ajoute un créneau depuis le planning 7j ou la panoplie ci-dessous.</div>";
 } else {
  blocksBox.innerHTML = "";
  todayBlocks.forEach(function (b) {
   var s = lifeData.S[b[1]], done = isLifeBlockDone(dKey, b);
   var card = document.createElement("article");
   card.className = "hwcard";
   var chk = document.createElement("input");
   chk.type = "checkbox";
   chk.className = "hwcheck";
   chk.checked = done;
   chk.onchange = function () {
    toggleLifeBlockDone(dKey, b);
    renderLifeHabits();
    renderLifeStats();
    render();
   };
   var main = document.createElement("div");
   main.innerHTML = "<div class='hwtitle'" + (done ? " style='text-decoration:line-through'" : "") + ">" + esc(s[1] + " " + s[0]) + "</div><div class='hwmeta'><span>🕒 " + fh(b[2]) + " – " + fh(b[3]) + " (" + dur(b[3] - b[2]) + ")</span><span class='hwtag " + (done ? "done" : "pending") + "'>" + (done ? "Accompli" : "À faire") + "</span></div>";
   card.appendChild(chk);
   card.appendChild(main);
   blocksBox.appendChild(card);
  });
 }

 var habitsBox = $("lifeHabitsList");
 if (!lifeData.habits.length) {
  habitsBox.innerHTML = "<div class='hwempty'>Aucune habitude quotidienne configurée. Crée-en une ou pioche dans la panoplie ci-dessous !</div>";
 } else {
  habitsBox.innerHTML = "";
  lifeData.habits.forEach(function (h) {
   var done = isLifeHabitDone(dKey, h.id), streak = computeHabitStreak(h.id);
   var card = document.createElement("article");
   card.className = "hwcard";
   var chk = document.createElement("input");
   chk.type = "checkbox";
   chk.className = "hwcheck";
   chk.checked = done;
   chk.onchange = function () {
    toggleLifeHabitDone(dKey, h.id);
    renderLifeHabits();
    renderLifeStats();
    renderIsland();
   };
   var main = document.createElement("div");
   main.innerHTML = "<div class='hwtitle'" + (done ? " style='text-decoration:line-through'" : "") + ">" + esc(h.icon + " " + h.name) + "</div><div class='hwmeta'><span class='streak-pill'>🔥 " + streak + " j de suite</span><span class='hwtag " + (done ? "done" : "pending") + "'>" + (done ? "Fait aujourd’hui" : "À faire") + "</span></div>";
   var acts = document.createElement("div");
   acts.className = "hwacts";
   var edBtn = document.createElement("button");
   edBtn.type = "button";
   edBtn.textContent = "✏️";
   edBtn.setAttribute("aria-label", "Modifier " + h.name);
   edBtn.onclick = function () { openLifeHabitModal(h.id); };
   acts.appendChild(edBtn);
   card.appendChild(chk);
   card.appendChild(main);
   card.appendChild(acts);
   habitsBox.appendChild(card);
  });
 }

 var grid = $("lifePresetGrid");
 grid.innerHTML = "";
 LIFE_PRESETS.forEach(function (preset) {
  var card = document.createElement("div");
  card.className = "life-preset-card";
  card.innerHTML = "<div class='life-preset-top'><span class='life-preset-ic' style='background:" + preset.color + ";color:" + fgOf(preset.color) + "'>" + esc(preset.icon) + "</span><strong>" + esc(preset.name) + "</strong></div><div class='life-preset-actions'><button type='button' data-add-plan>＋ Planning 7j</button><button type='button' data-add-hab>＋ Habitude</button></div>";
  card.querySelector("[data-add-plan]").onclick = function () {
   var catId = ensureLifePresetCategory(preset);
   render();
   openB(-1, todayNum(), 18, catId);
  };
  card.querySelector("[data-add-hab]").onclick = function () {
   addLifeHabitFromPreset(preset);
  };
  grid.appendChild(card);
 });
}

function currentWeekDates() {
 var now = new Date(), mondayOffset = todayNum() - 1, res = [];
 for (var i = 0; i < 7; i++) {
  var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset + i);
  res.push({ day: i + 1, label: DN_LIFE[i].slice(0, 3), key: dateKey(d) });
 }
 return res;
}

function renderLifeStats() {
 var week = currentWeekDates(), prog = todayLifeProgress();
 var totalWeekExpected = 0, totalWeekDone = 0, barsHtml = "";

 week.forEach(function (w) {
  var dayBlocks = lifeData.B.filter(function (b) { return b[0] === w.day && lifeData.S[b[1]]; });
  var doneBlocks = dayBlocks.filter(function (b) { return isLifeBlockDone(w.key, b); }).length;
  var doneHabits = lifeData.habits.filter(function (h) { return isLifeHabitDone(w.key, h.id); }).length;
  var expected = dayBlocks.length + lifeData.habits.length;
  var done = doneBlocks + doneHabits;
  totalWeekExpected += expected;
  totalWeekDone += done;
  var pct = expected ? Math.round((done / expected) * 100) : 0;
  barsHtml += "<div class='life-day-bar'><div class='life-bar-track'><div class='life-bar-fill' style='height:" + pct + "%'></div></div><strong>" + w.label + "</strong><span>" + done + "/" + expected + "</span></div>";
 });

 var weekPct = totalWeekExpected ? Math.round((totalWeekDone / totalWeekExpected) * 100) : 0;
 var plannedHours = lifeData.B.reduce(function (a, b) { return a + (b[3] - b[2]); }, 0);

 $("lifeStatsSummary").innerHTML =
  "<div class='grade-stat'><strong>" + (prog.total ? prog.done + "/" + prog.total : "0") + "</strong><span>Accompli aujourd’hui</span></div>" +
  "<div class='grade-stat'><strong>" + weekPct + "%</strong><span>Régularité semaine (" + totalWeekDone + "/" + totalWeekExpected + ")</span></div>" +
  "<div class='grade-stat'><strong>" + (Math.round(plannedHours * 10) / 10) + " h</strong><span>Temps planifié (7 jours)</span></div>";

 $("lifeWeekBars").innerHTML = barsHtml;

 var breakdownHtml = "";
 Object.keys(lifeData.S).forEach(function (catId) {
  var s = lifeData.S[catId];
  var blocks = lifeData.B.filter(function (b) { return b[1] === catId; });
  var hrs = blocks.reduce(function (a, b) { return a + (b[3] - b[2]); }, 0);
  breakdownHtml += "<div class='grade-row'><div><strong>" + esc(s[1] + " " + s[0]) + "</strong><small>" + blocks.length + " créneau(x) dans la semaine</small></div><strong>" + (Math.round(hrs * 10) / 10) + " h/sem</strong><span></span></div>";
 });
 lifeData.habits.forEach(function (h) {
  var doneDays = week.filter(function (w) { return isLifeHabitDone(w.key, h.id); }).length;
  breakdownHtml += "<div class='grade-row'><div><strong>" + esc(h.icon + " " + h.name) + "</strong><small>Habitude quotidienne · 🔥 " + computeHabitStreak(h.id) + " j de série</small></div><strong>" + doneDays + "/7 j</strong><span></span></div>";
 });
 $("lifeBreakdown").innerHTML = breakdownHtml || "<div class='grade-empty'>Ajoute des activités ou des habitudes pour voir ton bilan détaillé.</div>";
}

$("lifeHabitAdd").onclick = function () { openLifeHabitModal(null); };
$("lifeActivityAdd").onclick = function () { openB(-1, todayNum(), 18); };
$("lifeHabitCancel").onclick = function () { $("dLifeHabit").close(); };
$("lifeHabitDelete").onclick = function () {
 if (!lifeHabitEditId) return;
 var h = lifeData.habits.find(function (x) { return x.id === lifeHabitEditId; });
 if (h && confirm("Supprimer l’habitude « " + h.name + " » ?")) {
  lifeData.habits = lifeData.habits.filter(function (x) { return x.id !== lifeHabitEditId; });
  saveLifeData();
  $("dLifeHabit").close();
  renderLifeHabits();
  renderLifeStats();
  renderIsland();
 }
};
$("lifeHabitForm").onsubmit = function (e) {
 e.preventDefault();
 var name = $("lifeHabitName").value.trim(), icon = $("lifeHabitIcon").value.trim() || "🌿", color = $("lifeHabitColor").value;
 if (!name) { $("lifeHabitError").textContent = "Donne un nom à cette habitude."; return; }
 if (lifeHabitEditId) {
  var h = lifeData.habits.find(function (x) { return x.id === lifeHabitEditId; });
  if (h) { h.name = name; h.icon = icon; h.color = color; }
 } else {
  lifeData.habits.push({ id: "hab-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: name, icon: icon, color: color });
 }
 saveLifeData();
 $("dLifeHabit").close();
 renderLifeHabits();
 renderLifeStats();
 renderIsland();
};

/* ============================================================================
   PARTIE 2 — MODULES MÉTIER
   (anciennement script.js)
   ============================================================================ */

/* ---- Devoirs à faire & rappels locaux (Univers Scolaire) ---- */
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

/* ---- Éditeur de créneaux (partagé Univers 1 & Univers 2 sans conflit) ---- */
function openB(i, presetDay, presetStart, presetCatId) {
 var curS = activeS(), curB = activeB(), days = activeDays();
 var keys = Object.keys(curS);
 if (!keys.length) {
  alert("Ajoute d’abord au moins une activité dans 🎨 (ou choisis-en une depuis « Habitudes & Suivi »).");
  $("mat").click();
  return;
 }

 $("bsLab").textContent = isLife() ? "Activité" : "Matière";
 $("bs").innerHTML = keys.map(function (k) { return "<option value='" + esc(k) + "'>" + esc(curS[k][1]) + " " + esc(curS[k][0]) + "</option>"; }).join("");
 $("bd").innerHTML = days.map(function (n, j) { return "<option value='" + (j + 1) + "'>" + n + "</option>"; }).join("");

 ed = i;
 var dDay = (presetDay >= 1 && presetDay <= days.length) ? presetDay : sel;
 var dStart = Number.isFinite(presetStart) ? presetStart : 8;
 var dEnd = Math.min(23.5, dStart + 2);
 var dCat = (presetCatId && curS[presetCatId]) ? presetCatId : keys[0];
 var b = i >= 0 ? curB[i] : [dDay, dCat, dStart, dEnd];

 $("bt").textContent = i >= 0
  ? (isLife() ? "✏️ Modifier l’activité" : "✏️ Modifier le cours")
  : (isLife() ? "➕ Ajouter une activité" : "➕ Ajouter un cours");
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
$("bdl").onclick = function () {
 activeB().splice(ed, 1);
 saveActive();
 $("dB").close();
 render();
 if (isLife()) { renderLifeHabits(); renderLifeStats(); }
};
$("bsv").onclick = function () {
 var curS = activeS(), curB = activeB();
 var d = +$("bd").value, s = s2t($("b1").value), e = s2t($("b2").value), k = $("bs").value;
 if (isNaN(s) || isNaN(e)) { $("be").textContent = "Choisis une heure de début et de fin."; return; }
 if (e <= s) { $("be").textContent = "La fin doit être après le début."; return; }
 var o = curB.filter(function (b, j) { return j != ed && b[0] == d && s < b[3] && e > b[2]; })[0];
 if (o) { $("be").textContent = "Ce créneau chevauche : " + curS[o[1]][0] + " (" + fh(o[2]) + " – " + fh(o[3]) + ")"; return; }
 var nb = [d, k, s, e];
 if (ed >= 0) curB[ed] = nb; else curB.push(nb);
 saveActive();
 sel = d;
 $("dB").close();
 render();
 if (isLife()) { renderLifeHabits(); renderLifeStats(); }
};

/* ---- Éditeur de matières / activités (partagé Univers 1 & Univers 2) ---- */
var PAL = ["#10B981", "#06B6D4", "#3B82F6", "#8B5CF6", "#F59E0B", "#EC4899", "#E76F51", "#16A085"];
function row(k, s) {
 return "<div class='mr' data-k='" + esc(k) + "'><input class='me' maxlength='4' value=\"" + esc(s[1]) + "\"><input class='mn' placeholder='Nom' value=\"" + esc(s[0]) + "\"><input class='mc' type='color' value='" + esc(s[2]) + "'><button type='button' class='mx' title='Supprimer'>🗑️</button></div>";
}

$("mat").onclick = function () {
 var curS = activeS();
 $("mt").textContent = isLife() ? "🎨 Mes activités (7j)" : "🎨 Mes matières";
 $("ms").textContent = isLife()
  ? "Ajoute ou personnalise les catégories de ton planning 7 jours."
  : "Change le nom, l'emoji ou la couleur, ajoute-en de nouvelles.";
 $("ml").innerHTML = Object.keys(curS).filter(function (k) { return k != "free"; }).map(function (k) { return row(k, curS[k]); }).join("");
 $("dM").showModal();
};

$("madd").onclick = function () {
 var d = document.createElement("div");
 d.innerHTML = row("", ["", isLife() ? "🌿" : "📚", PAL[Math.floor(Math.random() * PAL.length)]]);
 $("ml").appendChild(d.firstChild);
 $("ml").scrollTop = 9999;
};

$("ml").onclick = function (e) {
 if (!e.target.classList.contains("mx")) return;
 var r = e.target.parentNode, k = r.dataset.k;
 if (k) {
  var curS = activeS(), curB = activeB();
  var n = curB.filter(function (b) { return b[1] == k; }).length;
  if (n && !confirm("Cette catégorie a " + n + " créneau(x) dans ta semaine. La supprimer supprimera aussi ces créneaux. Continuer ?")) return;
  delete curS[k];
  if (isLife()) lifeData.B = lifeData.B.filter(function (b) { return b[1] != k; });
  else B = B.filter(function (b) { return b[1] != k; });
 }
 r.remove();
};

$("mok").onclick = function () {
 var curS = activeS();
 [].forEach.call($("ml").children, function (r) {
  var k = r.dataset.k, n = r.querySelector(".mn").value.trim(), e = r.querySelector(".me").value.trim() || (isLife() ? "🌿" : "📚"), c = r.querySelector(".mc").value;
  if (!n) return;
  if (k) {
   var s = curS[k];
   if (!s) return;
   if (s[2] != c) { s[2] = c; s[3] = fgOf(c); }
   s[0] = n;
   s[1] = e;
  } else {
   curS["s" + Date.now() + Math.floor(Math.random() * 999)] = [n, e, c, fgOf(c), "bob"];
  }
 });
 saveActive();
 $("dM").close();
 render();
 if (!isLife()) {
  refreshHomeworkSubjectFilter();
  renderHomework();
  syncGradeSubjects();
  renderGrades();
  if (!$("gradeCoefficients").hidden) renderCoefficients();
  renderRecommendations();
 } else {
  renderLifeHabits();
  renderLifeStats();
 }
};

$("mrs").onclick = function () {
 var msg = isLife()
  ? "Vider complètement l’univers Libre & Habitudes (planning 7j, habitudes et historique) ?"
  : "Remettre l'emploi du temps scolaire d'origine ? Tes modifications de créneaux/matières seront perdues.";
 if (!confirm(msg)) return;
 if (isLife()) {
  try { localStorage.removeItem(LIFE_KEY); } catch (e) {}
  loadLifeData();
  $("dM").close();
  render();
  renderLifeHabits();
  renderLifeStats();
 } else {
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

/* ---- Suivi des notes semestriel & Recommandations (Univers Scolaire) ---- */
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
function normalizeGradeType(t) { return (t === "devoir1" || t === "devoir2" || t === "interro") ? t : "interro"; }
function normalizeSemester(s) { return Number(s) === 2 ? 2 : 1; }

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

 var seenDevoir = {};
 grades = grades.map(function (g) {
  if (g.type === "devoir1" || g.type === "devoir2") {
   var key = g.semester + "|" + g.subjectId + "|" + g.type;
   if (seenDevoir[key]) {
    var alt = g.type === "devoir1" ? "devoir2" : "devoir1";
    var altKey = g.semester + "|" + g.subjectId + "|" + alt;
    migrated = true;
    if (!seenDevoir[altKey]) { seenDevoir[altKey] = true; return Object.assign({}, g, { type: alt }); }
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
  subjectId: subjectId, coef: coef, interros: interros, moyInterros: moyInterros,
  d1: d1, d2: d2, hasAny: hasAny, missing: missing, complete: complete, average: average, weighted: weighted
 };
}

function computeSemesterSummary(semester) {
 var sem = normalizeSemester(semester);
 var activeSubjects = GRADE_SUBJECTS.filter(function (s) { return s.active; });
 var rows = activeSubjects.map(function (s) { return Object.assign({ name: s.name }, computeSubjectStats(s.id, sem)); });
 var startedIncomplete = rows.filter(function (r) { return r.hasAny && !r.complete; });
 var completeRows = rows.filter(function (r) { return r.complete; });
 var status = "empty", generalAverage = null, totalWeighted = 0, totalCoef = 0;

 if (startedIncomplete.length > 0) status = "waiting";
 else if (completeRows.length > 0) {
  completeRows.forEach(function (r) { if (r.coef > 0) { totalWeighted += r.weighted; totalCoef += r.coef; } });
  if (totalCoef > 0) { generalAverage = totalWeighted / totalCoef; status = "ok"; }
  else status = "waiting";
 }
 return {
  semester: sem, rows: rows, activeCount: activeSubjects.length, completeCount: completeRows.length,
  startedIncomplete: startedIncomplete, totalWeighted: totalWeighted, totalCoef: totalCoef, generalAverage: generalAverage, status: status
 };
}

function gradeTypeLabel(type) { return type === "devoir1" ? "Devoir 1" : type === "devoir2" ? "Devoir 2" : "Interrogation"; }

function renderGrades() {
 syncGradeSubjects();
 $("gradeSemester").value = String(activeSemester);
 $("recSemester").value = String(activeSemester);
 var summary = computeSemesterSummary(activeSemester);
 var semGrades = grades.filter(function (g) { return normalizeSemester(g.semester) === activeSemester; });
 var interroCount = semGrades.filter(function (g) { return g.type === "interro"; }).length;
 var devoirCount = semGrades.filter(function (g) { return g.type === "devoir1" || g.type === "devoir2"; }).length;

 var avgDisplay = summary.status === "ok" ? fmtGrade(summary.generalAverage) : summary.status === "waiting" ? "En attente" : "—";
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
    rank: earlyWarn ? 0 : 2, coef: st.coef,
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
   cards.push({ rank: 0, coef: st.coef, title: "🔴 Renforcer " + st.name + " (" + fmtGrade(st.average) + " · coef. " + st.coef + ")", body: detail });
  } else if (st.average < 12) {
   cards.push({ rank: 1, coef: st.coef, title: "🟠 Consolider " + st.name + " (" + fmtGrade(st.average) + " · coef. " + st.coef + ")", body: "Moy. interros : " + fmtGrade(st.moyInterros) + " · Devoirs : " + fmtGrade(st.d1) + " et " + fmtGrade(st.d2) + ". Tu peux facilement passer au-dessus de 12/20 en corrigeant les erreurs de tes devoirs." });
  } else if (st.average >= 15) {
   cards.push({ rank: 3, coef: st.coef, title: "🟢 Entretenir " + st.name + " (" + fmtGrade(st.average) + " · coef. " + st.coef + ")", body: "Très bon équilibre entre interrogations (" + fmtGrade(st.moyInterros) + ") et devoirs (" + fmtGrade(st.d1) + " / " + fmtGrade(st.d2) + "). Ce fort résultat rapporte " + fmtPoints(st.weighted) + " points pondérés." });
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
 if (cards.length) html += cards.map(function (x) { return '<article class="rec-card"><strong>' + esc(x.title) + '</strong><p>' + esc(x.body) + '</p></article>'; }).join("");
 else if (summary.status === "ok") html += "<div class='grade-empty'>Toutes tes matières complètes du Semestre " + activeSemester + " sont entre 12/20 et 15/20. Continue ainsi ! ✨</div>";
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
 if (editingGrade && (editingGrade.type === "devoir1" || editingGrade.type === "devoir2")) slotSel.value = editingGrade.type;
 else if (!taken1) slotSel.value = "devoir1";
 else if (!taken2) slotSel.value = "devoir2";
 else slotSel.value = "devoir1";
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
 if (isDevoir) updateDevoirSlotOptions(gradeSelect.value, editGrade);
 $("gradeDialog").showModal();
}

/* ---- Navigation multi-univers ---- */
function showAppView(view) {
 currentView = view;
 var views = {
  schedule: "scheduleView",
  homework: "homeworkView",
  grades: "gradesView",
  recommend: "recommendView",
  lifeHabits: "lifeHabitsView",
  lifeStats: "lifeStatsView"
 };
 Object.keys(views).forEach(function (k) {
  var el = $(views[k]);
  if (el) el.hidden = k !== view;
 });

 var navMap = {
  navSchedule: view === "schedule",
  navHomework: view === "homework",
  navGrades: view === "grades",
  navRecs: view === "recommend",
  navLifeSchedule: view === "schedule",
  navLifeHabits: view === "lifeHabits",
  navLifeStats: view === "lifeStats"
 };
 Object.keys(navMap).forEach(function (id) {
  var btn = $(id);
  if (btn) btn.setAttribute("aria-pressed", navMap[id] ? "true" : "false");
 });

 if (view === "homework") { refreshHomeworkSubjectFilter(); renderHomework(); }
 if (view === "grades") renderGrades();
 if (view === "recommend") renderRecommendations();
 if (view === "lifeHabits") renderLifeHabits();
 if (view === "lifeStats") renderLifeStats();
}

$("navSchedule").onclick = function () { showAppView("schedule"); };
$("navHomework").onclick = function () { showAppView("homework"); };
$("navGrades").onclick = function () { showAppView("grades"); };
$("navRecs").onclick = function () { showAppView("recommend"); };
$("navLifeSchedule").onclick = function () { showAppView("schedule"); };
$("navLifeHabits").onclick = function () { showAppView("lifeHabits"); };
$("navLifeStats").onclick = function () { showAppView("lifeStats"); };

$("gradeSemester").onchange = function () { activeSemester = normalizeSemester(this.value); renderGrades(); renderRecommendations(); };
$("recSemester").onchange = function () { activeSemester = normalizeSemester(this.value); renderGrades(); renderRecommendations(); };
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
  if (existingDevoirs.length >= 2) { $("gradeError").textContent = "Maximum 2 devoirs par matière et par semestre atteint. Modifie ou supprime un devoir existant."; return; }
  if (existingDevoirs.some(function (g) { return g.type === type; })) { $("gradeError").textContent = gradeTypeLabel(type) + " est déjà saisi pour cette matière ce semestre."; return; }
 }
 var item = {
  id: old ? old.id : ("gr-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)),
  semester: old ? normalizeSemester(old.semester) : activeSemester,
  subjectId: sub, type: type, value: v, title: title, date: date
 };
 if (old) grades[grades.indexOf(old)] = item; else grades.push(item);
 if (saveGrades()) { $("gradeDialog").close(); gradeEditId = null; renderGrades(); renderRecommendations(); }
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
  if (confirm("Supprimer cette note ?")) { grades = grades.filter(function (x) { return x.id !== id; }); saveGrades(); renderGrades(); renderRecommendations(); }
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
  if (!Number.isFinite(n) || n < 0 || n > 20) { alert("Chaque coefficient doit être compris entre 0 et 20."); return; }
  next[inputs[i].dataset.coef] = n;
 }
 try { localStorage.setItem(COEF_KEY, JSON.stringify(next)); gradeCoefficients = next; renderGrades(); renderRecommendations(); alert("Coefficients enregistrés."); }
 catch (e) { alert("Impossible d'enregistrer les coefficients."); }
};

/* ============================================================================
   PARTIE 3 — INITIALISATION FINALE
   ============================================================================ */
try { loadMeta(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { load(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { loadLifeData(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { loadHomework(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { loadGrades(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { refreshHomeworkSubjectFilter(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { applyUniverse(meta.universe); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { renderHomework(); } catch (e) { reportAppError(e && e.message ? e.message : e); }
try { setDisplayMode(mobileQuery); } catch (e) { reportAppError(e && e.message ? e.message : e); }
setInterval(function () { try { tick(); } catch (e) { reportAppError(e && e.message ? e.message : e); } }, 30000);
registerAppServiceWorker().then(function () { startReminderChecks(); });
window.addEventListener("online", function () { registerAppServiceWorker().then(function () { updateReminderUI(); checkHomeworkReminders(); }); });