// ==================================
// CAMPUSLY - MODULES (load AFTER script.js)
// Study Buddy, Placement, Planner, Analytics
// ==================================

const ld = (t, d) => { try { return JSON.parse(localStorage.getItem(storageKey(t))) ?? d; } catch { return d; } };
const sv = (t, v) => localStorage.setItem(storageKey(t), JSON.stringify(v));
const mk = (tag, text, cls) => { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; };
const shuffle = a => [...a].sort(() => Math.random() - 0.5);
const today = () => new Date().toISOString().slice(0, 10);
const getCgpa = () => marks.length ? marks.reduce((s, m) => s + m.sgpa, 0) / marks.length : 0;

// ---------- reusable quiz runner ----------
function runQuiz(box, qs, done) {
  let i = 0, s = 0;
  (function next() {
    box.innerHTML = "";
    if (i >= qs.length) {
      const p = Math.round(s / qs.length * 100);
      box.append(mk("h3", "Score: " + s + "/" + qs.length + " (" + p + "%)"));
      done(p);
      return;
    }
    const q = qs[i];
    box.append(mk("h3", (i + 1) + ". " + q.q));
    q.o.forEach(o => {
      const b = mk("button", o, "option");
      b.onclick = () => {
        if (o === q.a) s++;
        box.querySelectorAll("button").forEach(x => { x.disabled = true; if (x.textContent === q.a) x.style.background = "#c8f0d0"; });
        setTimeout(() => { i++; next(); }, 900);
      };
      box.append(b);
    });
  })();
}

// ---------- bar chart helper ----------
function bars(el, items, max) {
  el.innerHTML = "";
  if (!items.length) { el.textContent = "No data yet."; return; }
  items.forEach(it => {
    const r = mk("div", "", "bar-row");
    const track = mk("div", "", "bar-track");
    const fill = mk("div", "", "bar-fill");
    fill.style.width = Math.min(100, it.v / max * 100) + "%";
    track.append(fill);
    r.append(mk("span", it.l), track, mk("b", it.v.toFixed(1)));
    el.append(r);
  });
}

// ---------- STUDY BUDDY ----------
function parseCards() {
  const topic = $("buddyTopic").value.trim() || "General";
  return $("buddyNotes").value.split("\n").map(l => l.trim()).filter(Boolean).map(l => {
    let m = l.split(":");
    if (m.length < 2) m = l.split(/ is /i);
    return m.length >= 2 ? { topic, q: m[0].trim(), a: m.slice(1).join(":").trim() } : null;
  }).filter(Boolean);
}

function showCards() {
  const out = $("buddyOut");
  const cards = parseCards();
  out.innerHTML = "";
  if (!cards.length) { out.append(mk("p", "Write notes like  term: definition  (one per line).")); return; }
  cards.forEach(c => {
    const d = mk("div", "🃏 " + c.q + "  (tap to flip)", "card flash");
    let open = false;
    d.onclick = () => { open = !open; d.textContent = open ? "✅ " + c.a : "🃏 " + c.q + "  (tap to flip)"; };
    out.append(d);
  });
}

function showSchedule() {
  const out = $("buddyOut");
  const topic = $("buddyTopic").value.trim() || "your topic";
  out.innerHTML = "";
  out.append(mk("h3", "🔁 Revision plan for " + topic));
  [1, 3, 7, 14, 30].forEach(n => {
    const d = new Date(); d.setDate(d.getDate() + n);
    out.append(mk("div", "Day " + n + ": " + d.toDateString(), "card"));
  });
}

function buddyQuiz() {
  const cards = parseCards();
  const out = $("buddyOut");
  if (cards.length < 4) { out.textContent = "Add at least 4 'term: definition' lines first."; return; }
  const qs = shuffle(cards).slice(0, 5).map(c => ({
    q: "What is " + c.q + "?",
    a: c.a,
    o: shuffle([c.a, ...shuffle(cards.filter(x => x !== c)).slice(0, 3).map(x => x.a)])
  }));
  runQuiz(out, qs, p => {
    const log = ld("quizlog", []);
    log.push({ topic: cards[0].topic, p });
    sv("quizlog", log);
    refresh();
  });
}

function weakSubjects() {
  const by = {};
  ld("quizlog", []).forEach(r => (by[r.topic] = by[r.topic] || []).push(r.p));
  return Object.entries(by).map(([l, a]) => ({ l, v: a.reduce((x, y) => x + y, 0) / a.length }));
}

// ---------- PLACEMENT ----------
const companies = [
  { n: "TCS", c: 6, b: 0 }, { n: "Infosys", c: 6.5, b: 0 }, { n: "Wipro", c: 6, b: 1 },
  { n: "Accenture", c: 6.5, b: 0 }, { n: "Google", c: 8, b: 0 }
]; // sample criteria: edit with real ones

const aptBank = [
  { q: "A train 100m long passes a pole in 10s. Its speed?", o: ["5 m/s", "10 m/s", "20 m/s", "100 m/s"], a: "10 m/s" },
  { q: "What is 15% of 200?", o: ["20", "25", "30", "35"], a: "30" },
  { q: "Next number: 2, 6, 12, 20, ?", o: ["28", "30", "32", "26"], a: "30" },
  { q: "If A is 2x B and B is 30, A = ?", o: ["15", "45", "60", "90"], a: "60" },
  { q: "Average of 10, 20, 30?", o: ["15", "20", "25", "30"], a: "20" }
];

const iqBank = [
  "Tell me about yourself.", "Difference between an array and a linked list?",
  "Explain OOP's four pillars.", "What is normalization in DBMS?",
  "Explain a project you built.", "Stack vs queue: real-life examples?",
  "What is a primary key?", "Why should we hire you?"
];

function placeScore() {
  const apt = ld("apt", []);
  const best = apt.length ? Math.max(...apt) : 0;
  const mocks = Math.min(ld("mocks", []).length, 5);
  return Math.round(getCgpa() / 10 * 40 + best * 0.3 + mocks / 5 * 30);
}

function showCompanies() {
  const box = $("companyList");
  box.innerHTML = "";
  companies.forEach(c => {
    const ok = getCgpa() >= c.c && !!marks.length;
    box.append(mk("div", (ok ? "✅ " : "❌ ") + c.n + " (min CGPA " + c.c + ", max backlogs " + c.b + ")", "task"));
  });
}

function showMocks() {
  const box = $("mockList");
  box.innerHTML = "";
  ld("mocks", []).forEach(m => box.append(mk("div", m.d + " | " + m.c + " | " + m.s + "/10", "task")));
}

// ---------- PLANNER ----------
function showAssignments() {
  const list = ld("asg", []).sort((a, b) => a.date.localeCompare(b.date));
  const box = $("asgList"), dl = $("deadlines");
  box.innerHTML = ""; dl.innerHTML = "";
  list.forEach(a => {
    const left = Math.ceil((new Date(a.date) - new Date(today())) / 864e5);
    const label = a.name + " | " + a.date + (a.done ? " (done)" : left < 0 ? " (overdue!)" : " (" + left + "d left)");
    const row = mk("div", "", "task" + (a.done ? " done" : ""));
    const done = mk("button", a.done ? "Undo" : "Done");
    done.onclick = () => { a.done = !a.done; sv("asg", list); refresh(); };
    const del = mk("button", "Delete");
    del.onclick = () => { sv("asg", list.filter(x => x !== a)); refresh(); };
    row.append(mk("span", label), done, del);
    box.append(row);
  });
  const up = list.filter(a => !a.done).slice(0, 3);
  if (!up.length) dl.textContent = "Nothing due 🎉";
  up.forEach(a => dl.append(mk("div", "📌 " + a.name + " - " + a.date, "task")));
}

let pomoLeft = 1500, pomoTimer = null;
function drawPomo() {
  $("pomoTime").textContent = String(Math.floor(pomoLeft / 60)).padStart(2, "0") + ":" + String(pomoLeft % 60).padStart(2, "0");
  const p = ld("pomo", { d: today(), n: 0 });
  $("pomoCount").textContent = "Sessions today: " + (p.d === today() ? p.n : 0);
}

// ---------- REFRESH + BIND ----------
function refresh() {
  showAssignments(); showCompanies(); showMocks(); drawPomo();
  const score = placeScore();
  $("placeScore").textContent = score + "%";
  readiness = score;
  updateDashboard();
  const w = weakSubjects();
  $("weakList").textContent = "";
  const weak = w.filter(x => x.v < 60);
  $("weakList").textContent = weak.length ? "⚠️ Revise: " + weak.map(x => x.l).join(", ") : (w.length ? "No weak subjects 💪" : "None yet");
  bars($("chartSgpa"), marks.map(m => ({ l: "Sem " + m.semester, v: m.sgpa })), 10);
  bars($("chartQuiz"), w.map(x => ({ l: x.l, v: x.v / 10 })), 10);
}

function bind() {
  $("makeCards").onclick = showCards;
  $("makeSchedule").onclick = showSchedule;
  $("startBuddyQuiz").onclick = buddyQuiz;

  $("startApt").onclick = () => runQuiz($("aptBox"), shuffle(aptBank), p => {
    const a = ld("apt", []); a.push(p); sv("apt", a); refresh();
  });
  $("nextIq").onclick = () => { $("iq").textContent = iqBank[Math.floor(Math.random() * iqBank.length)]; };

  $("mockForm").onsubmit = e => {
    e.preventDefault();
    const m = ld("mocks", []);
    m.push({ c: $("mockCompany").value.trim(), s: Number($("mockScore").value), d: today() });
    sv("mocks", m); e.target.reset(); refresh();
  };

  $("asgForm").onsubmit = e => {
    e.preventDefault();
    const a = ld("asg", []);
    a.push({ name: $("asgName").value.trim(), date: $("asgDate").value, done: false });
    sv("asg", a); e.target.reset(); refresh();
  };

  $("pomoStart").onclick = () => {
    if (pomoTimer) return;
    pomoTimer = setInterval(() => {
      pomoLeft--;
      if (pomoLeft <= 0) {
        clearInterval(pomoTimer); pomoTimer = null; pomoLeft = 1500;
        const p = ld("pomo", { d: today(), n: 0 });
        sv("pomo", { d: today(), n: (p.d === today() ? p.n : 0) + 1 });
        alert("Pomodoro done! Take a 5 min break ☕");
      }
      drawPomo();
    }, 1000);
  };
  $("pomoReset").onclick = () => { clearInterval(pomoTimer); pomoTimer = null; pomoLeft = 1500; drawPomo(); };
}

// ---------- HOOK INTO LOGIN ----------
let modulesReady = false;
const _openDashboard = openDashboard;
openDashboard = function (user) {
  _openDashboard(user);
  if (!modulesReady) { bind(); modulesReady = true; }
  refresh();
};
if (currentUser) { bind(); modulesReady = true; refresh(); }
