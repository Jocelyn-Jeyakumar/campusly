// ==================================
// CAMPUSLY - PLACEMENT PRO (load AFTER modules.js)
// Topic tests, company match, interview prep, readiness score
// ==================================

const raw = {
  Quant: [
    ["A shirt costs ₹800 after a 20% discount. Original price?", ["₹900", "₹1000", "₹960", "₹1200"], "₹1000"],
    ["Two numbers are in ratio 3:5 and sum to 64. The larger is?", ["24", "40", "32", "38"], "40"],
    ["Simple interest on ₹2000 at 10% for 3 years?", ["₹400", "₹500", "₹600", "₹700"], "₹600"],
    ["A does a job in 10 days, B in 15 days. Together?", ["5 days", "6 days", "8 days", "12.5 days"], "6 days"],
    ["Average of the first 5 natural numbers?", ["2", "3", "3.5", "5"], "3"],
    ["Distance 150 km at 60 km/h. Time taken?", ["2 h", "2.5 h", "3 h", "2.25 h"], "2.5 h"]
  ],
  Logical: [
    ["Series: 3, 6, 11, 18, 27, ?", ["36", "38", "40", "42"], "38"],
    ["All cats are animals. Some animals are pets. Which must be true?", ["All cats are pets", "Some cats are pets", "Cats are animals", "No pet is a cat"], "Cats are animals"],
    ["If CODE = DPEF, then LOVE = ?", ["MPWF", "MPXF", "KNUD", "LPWF"], "MPWF"],
    ["Ravi is taller than Sam. Sam is taller than Tom. Who is shortest?", ["Ravi", "Sam", "Tom", "Cannot say"], "Tom"],
    ["Odd one out: 8, 27, 64, 100", ["8", "27", "64", "100"], "100"],
    ["Today is Wednesday. What day is it after 10 days?", ["Friday", "Saturday", "Thursday", "Sunday"], "Saturday"]
  ],
  Verbal: [
    ["Synonym of ABUNDANT", ["Scarce", "Plentiful", "Rare", "Tiny"], "Plentiful"],
    ["Antonym of EXPAND", ["Grow", "Stretch", "Shrink", "Widen"], "Shrink"],
    ["She ___ to college every day.", ["go", "goes", "going", "gone"], "goes"],
    ["Correct spelling?", ["Accomodate", "Acommodate", "Accommodate", "Acomodate"], "Accommodate"],
    ["He is good ___ maths.", ["at", "in", "on", "with"], "at"],
    ["One word: a person who speaks many languages", ["Polyglot", "Pedant", "Novice", "Orator"], "Polyglot"]
  ],
  DSA: [
    ["Time to access an array element by index?", ["O(1)", "O(n)", "O(log n)", "O(n²)"], "O(1)"],
    ["Which structure follows LIFO?", ["Queue", "Stack", "Heap", "Graph"], "Stack"],
    ["Worst-case time of bubble sort?", ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], "O(n²)"],
    ["Search in a balanced BST takes?", ["O(1)", "O(log n)", "O(n)", "O(n²)"], "O(log n)"],
    ["BFS uses which structure?", ["Stack", "Queue", "Heap", "Tree"], "Queue"],
    ["Average lookup in a hash table?", ["O(1)", "O(n)", "O(log n)", "O(n log n)"], "O(1)"]
  ],
  DBMS: [
    ["Which key uniquely identifies each row?", ["Primary key", "Foreign key", "Composite index", "View"], "Primary key"],
    ["Which command removes the table itself?", ["DELETE", "TRUNCATE", "DROP", "UPDATE"], "DROP"],
    ["The 'I' in ACID stands for?", ["Integrity", "Isolation", "Indexing", "Identity"], "Isolation"],
    ["Which JOIN returns only matching rows of both tables?", ["LEFT", "RIGHT", "INNER", "FULL"], "INNER"],
    ["Normalization mainly reduces?", ["Speed", "Redundancy", "Tables", "Security"], "Redundancy"],
    ["Which clause filters grouped results?", ["WHERE", "HAVING", "ORDER BY", "LIMIT"], "HAVING"]
  ],
  OOP: [
    ["Bundling data and methods into one unit is?", ["Inheritance", "Polymorphism", "Encapsulation", "Compilation"], "Encapsulation"],
    ["A class acquiring properties of another class is?", ["Abstraction", "Inheritance", "Overloading", "Casting"], "Inheritance"],
    ["Same method name, different parameters, same class?", ["Overriding", "Overloading", "Inheritance", "Abstraction"], "Overloading"],
    ["Which Java keyword prevents inheritance?", ["static", "final", "const", "abstract"], "final"],
    ["An object is an instance of a?", ["Method", "Class", "Package", "Variable"], "Class"],
    ["Runtime polymorphism is achieved by?", ["Overloading", "Overriding", "Constructors", "Variables"], "Overriding"]
  ]
};

const bank = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v.map(([q, o, a]) => ({ q, o, a }))]));
const cats = Object.keys(bank);

const iqBank2 = [
  { c: "HR", q: "Tell me about yourself.", h: "Education → skills → one project → goal. Keep it under 90 seconds." },
  { c: "HR", q: "What are your strengths and weaknesses?", h: "Pick a real weakness and show how you are improving it." },
  { c: "HR", q: "Why should we hire you?", h: "Match 2 of your skills to the role, with one example." },
  { c: "HR", q: "Where do you see yourself in 5 years?", h: "Show learning and growth that fits the company." },
  { c: "HR", q: "Describe a challenge you overcame.", h: "Use STAR: Situation, Task, Action, Result." },
  { c: "Technical", q: "Array vs linked list?", h: "Access O(1) vs O(n); insert/delete cost; memory layout." },
  { c: "Technical", q: "Explain the four pillars of OOP.", h: "Encapsulation, abstraction, inheritance, polymorphism, each with an example." },
  { c: "Technical", q: "What is normalization?", h: "Reducing redundancy: 1NF, 2NF, 3NF with a small table example." },
  { c: "Technical", q: "Process vs thread?", h: "Separate memory vs shared memory; creation cost; communication." },
  { c: "Technical", q: "Explain your best project.", h: "Problem, your role, tech used, result, what you would improve." },
  { c: "Technical", q: "What happens when you type a URL in the browser?", h: "DNS → TCP/TLS → HTTP request → server → render." },
  { c: "Technical", q: "Primary key vs unique key?", h: "Primary: one per table, no NULL. Unique: many allowed, may allow one NULL." }
];

// Sample data. Edit with your college's real criteria!
const companies2 = [
  { n: "TCS", c: 6, b: 0, r: "Aptitude → Technical → HR", f: ["Quant", "Logical", "Verbal", "OOP"] },
  { n: "Infosys", c: 6.5, b: 0, r: "Online test → Technical → HR", f: ["Quant", "Logical", "Verbal", "DBMS"] },
  { n: "Wipro", c: 6, b: 1, r: "Aptitude → Coding → HR", f: ["Quant", "Verbal", "OOP"] },
  { n: "Accenture", c: 6.5, b: 0, r: "Cognitive test → Technical → HR", f: ["Logical", "Verbal", "DSA"] },
  { n: "Product Startup", c: 7.5, b: 0, r: "Coding → Technical x2 → HR", f: ["DSA", "DBMS", "OOP", "Logical"] }
];

// ---------- helpers ----------
function catAvg(c) {
  const a = ld("tests", []).filter(x => x.c === c).slice(-5).map(x => x.p);
  return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
}

// New readiness: CGPA 30, aptitude 25, technical 25, mocks 20
placeScore = function () {
  const grp = cs => cs.reduce((s, c) => s + catAvg(c), 0) / cs.length;
  const mocks = ld("mocks", []);
  const mAvg = mocks.length ? mocks.reduce((s, m) => s + m.s, 0) / mocks.length : 0;
  return Math.round(
    getCgpa() / 10 * 30 +
    grp(["Quant", "Logical", "Verbal"]) * 0.25 +
    grp(["DSA", "DBMS", "OOP"]) * 0.25 +
    Math.min(mocks.length, 5) / 5 * mAvg / 10 * 20
  );
};

// ---------- tests ----------
function startTest() {
  const cat = $("testCat").value, n = Number($("testCount").value);
  const pool = cat === "Mixed" ? shuffle(Object.values(bank).flat()) : shuffle(bank[cat]);
  const qs = pool.slice(0, n).map(q => ({ ...q, o: shuffle(q.o) }));
  runQuiz($("testBox"), qs, p => {
    const t = ld("tests", []);
    t.push({ c: cat, p, d: today() });
    sv("tests", t);
    refresh();
  });
}

// ---------- companies ----------
showCompanies = function () {
  if ($("myBacklogs").value === "") $("myBacklogs").value = ld("backlogs", 0);
  const bk = Number($("myBacklogs").value) || 0;
  const cg = getCgpa();
  const box = $("companyList");
  box.innerHTML = "";

  companies2.forEach(c => {
    const gap = c.c - cg;
    const ok = marks.length && gap <= 0 && bk <= c.b;
    const prep = Math.round(c.f.reduce((s, k) => s + catAvg(k), 0) / c.f.length);
    const need = [gap > 0 ? "Need +" + gap.toFixed(2) + " CGPA" : "", bk > c.b ? "Clear backlogs to " + c.b : ""].filter(Boolean).join(" · ");
    const d = mk("div", "", "card");
    d.append(
      mk("h3", (ok ? "✅ " : "❌ ") + c.n),
      mk("p", "Min CGPA " + c.c + " | Max backlogs " + c.b),
      mk("p", "Rounds: " + c.r),
      mk("p", !marks.length ? "Add your marks to check eligibility." : ok ? "You meet the criteria 🎉" : need),
      mk("p", "Prep match: " + prep + "% (focus: " + c.f.join(", ") + ")")
    );
    box.append(d);
  });

  bars($("catChart"), cats.map(c => ({ l: c, v: catAvg(c) / 10 })).filter(x => x.v > 0), 10);
  const rev = ld("iqRevise", []);
  $("reviseList").textContent = rev.length ? "📌 " + rev.join(" | ") : "Nothing marked yet.";
};

// ---------- interview prep ----------
let iqCur = null;
function nextQuestion() {
  const cat = $("iqCat").value;
  const pool = iqBank2.filter(x => cat === "All" || x.c === cat);
  iqCur = pool[Math.floor(Math.random() * pool.length)];
  $("iqText").textContent = iqCur.q;
  $("iqHint").textContent = "";
}

// ---------- setup UI (runs once) ----------
(function setup() {
  const apt = $("aptBox").parentElement, iq = $("iq").parentElement, comp = $("companyList").parentElement;

  comp.insertAdjacentHTML("afterbegin", '<input id="myBacklogs" type="number" min="0" placeholder="My active backlogs">');

  apt.innerHTML = '<h3>🧪 Topic Tests</h3><span id="startApt" hidden></span>' +
    '<select id="testCat">' + cats.map(c => "<option>" + c + "</option>").join("") + "<option>Mixed</option></select>" +
    '<select id="testCount"><option value="3">3 questions</option><option value="5" selected>5 questions</option><option value="6">6 questions</option></select>' +
    '<button id="startTest">Start Test</button><div id="testBox"></div>';

  iq.innerHTML = '<h3>🎤 Interview Questions</h3><span id="iq" hidden></span><span id="nextIq" hidden></span>' +
    '<select id="iqCat"><option>All</option><option>HR</option><option>Technical</option></select>' +
    '<p id="iqText">Tap "New question" 👇</p><p id="iqHint"></p>' +
    '<button id="newIq">New question</button><button id="hintIq">Show hint</button><button id="reviseIq">Revise later</button>';

  $("placement").insertAdjacentHTML("beforeend",
    '<div class="card"><h3>Test scores by category (out of 10)</h3><div id="catChart"></div></div>' +
    '<div class="card"><h3>Questions to revise</h3><p id="reviseList"></p></div>');

  $("startTest").onclick = startTest;
  $("newIq").onclick = nextQuestion;
  $("hintIq").onclick = () => { if (iqCur) $("iqHint").textContent = "💡 " + iqCur.h; };
  $("reviseIq").onclick = () => {
    if (!iqCur) return;
    const r = ld("iqRevise", []);
    if (!r.includes(iqCur.q)) r.push(iqCur.q);
    sv("iqRevise", r);
    refresh();
  };
  $("myBacklogs").oninput = () => { sv("backlogs", Number($("myBacklogs").value) || 0); showCompanies(); };

  if (currentUser) refresh();
})();
