// ==================================
// CAMPUSLY 2.1 - MAIN JAVASCRIPT
// ==================================

let currentUser = null;
let isRegistering = false;
let tasks = [];
let marks = [];
let readiness = 0;

const $ = id => document.getElementById(id);

// ---------- STORAGE ----------
function getData(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function storageKey(type) {
  return "campusly_" + currentUser.email + "_" + type;
}

// Hash passwords so they are not saved as plain text.
// (Still demo-level security. Real apps need a backend.)
async function hashPassword(pw) {
  if (window.crypto && crypto.subtle) {
    const data = new TextEncoder().encode(pw);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback for previews that are not secure (https) pages
  let h = 5381;
  for (const c of pw) h = ((h << 5) + h + c.charCodeAt(0)) | 0;
  return "f" + h;
}

// Show any silent error on screen instead of failing quietly
window.addEventListener("unhandledrejection", e => {
  $("authMessage").textContent = "Error: " + (e.reason && e.reason.message || e.reason);
});

// ---------- AUTH ----------
function setMode(register) {
  isRegistering = register;
  $("registerFields").hidden = !register;
  $("authTitle").textContent = register ? "Create Your Account" : "Welcome Back!";
  $("authButton").textContent = register ? "Register" : "Login";
  $("switchText").innerHTML = register
    ? 'Already registered? <span id="switchAuth">Login</span>'
    : 'New student? <span id="switchAuth">Create Account</span>';
}

// One listener on the parent, so it still works after innerHTML changes
$("switchText").addEventListener("click", e => {
  if (e.target.id === "switchAuth") {
    setMode(!isRegistering);
    $("authMessage").textContent = "";
  }
});

$("authForm").addEventListener("submit", async e => {
  e.preventDefault();
  const msg = $("authMessage");
  const email = $("email").value.trim().toLowerCase();
  const password = $("password").value;
  const users = getData("campuslyUsers");

  if (isRegistering) {
    const name = $("studentName").value.trim();
    const department = $("department").value.trim();
    const year = $("year").value;

    if (!name || !department || !year) {
      msg.textContent = "Please complete all fields!";
      return;
    }
    if (password.length < 6) {
      msg.textContent = "Password must have at least 6 characters.";
      return;
    }
    if (users.some(u => u.email === email)) {
      msg.textContent = "Account already exists. Please login.";
      return;
    }

    users.push({ name, department, year, email, password: await hashPassword(password) });
    localStorage.setItem("campuslyUsers", JSON.stringify(users));
    setMode(false);
    msg.textContent = "Registration successful! Please login.";
    return;
  }

  const hashed = await hashPassword(password);
  const user = users.find(u => u.email === email && u.password === hashed);

  if (!user) {
    msg.textContent = "Invalid email or password!";
    return;
  }
  openDashboard(user);
});

// ---------- DASHBOARD ----------
function openDashboard(user) {
  currentUser = user;
  // Only remember the email, never the password
  localStorage.setItem("campuslyCurrentUser", user.email);

  tasks = getData(storageKey("tasks"));
  marks = getData(storageKey("marks"));
  readiness = Number(localStorage.getItem(storageKey("readiness"))) || 0;

  $("authScreen").hidden = true;
  $("appShell").hidden = false;
  $("welcome").textContent = "Welcome back, " + user.name + "! 👋";
  $("studentInfo").textContent = user.department + " | " + user.year;

  showPage("dashboard");
  displayTasks();
  displayMarks();
  updateDashboard();
}

$("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("campuslyCurrentUser");
  location.reload();
});

// ---------- NAVIGATION ----------
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  $(id).classList.add("active");
  document.querySelectorAll(".navigation button").forEach(b =>
    b.classList.toggle("active", b.dataset.page === id)
  );
}

document.querySelectorAll(".navigation button").forEach(b =>
  b.addEventListener("click", () => showPage(b.dataset.page))
);

// ---------- TASKS ----------
$("taskForm").addEventListener("submit", e => {
  e.preventDefault();
  const input = $("taskInput");
  if (!input.value.trim()) return;
  tasks.push({ name: input.value.trim(), done: false });
  input.value = "";
  saveTasks();
});

function saveTasks() {
  localStorage.setItem(storageKey("tasks"), JSON.stringify(tasks));
  displayTasks();
  updateDashboard();
}

function displayTasks() {
  const list = $("taskList");
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = "task" + (task.done ? " done" : "");

    const span = document.createElement("span");
    span.textContent = task.name;

    const complete = document.createElement("button");
    complete.textContent = task.done ? "Undo" : "Complete";
    complete.onclick = () => {
      tasks[index].done = !tasks[index].done;
      saveTasks();
    };

    const remove = document.createElement("button");
    remove.textContent = "Delete";
    remove.onclick = () => {
      tasks.splice(index, 1);
      saveTasks();
    };

    div.append(span, complete, remove);
    list.appendChild(div);
  });
}

// ---------- MARKS ----------
$("marksForm").addEventListener("submit", e => {
  e.preventDefault();
  const semester = Number($("semester").value);
  const sgpa = Number($("sgpa").value);

  if (semester < 1 || semester > 12 || sgpa < 0 || sgpa > 10) {
    alert("Enter valid marks!");
    return;
  }

  marks = marks.filter(m => m.semester !== semester);
  marks.push({ semester, sgpa });
  marks.sort((a, b) => a.semester - b.semester);
  localStorage.setItem(storageKey("marks"), JSON.stringify(marks));

  displayMarks();
  updateDashboard();
  e.target.reset();
});

function displayMarks() {
  const list = $("marksList");
  list.innerHTML = "<h3>Semester Records</h3>";

  marks.forEach(m => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = "Semester " + m.semester + " : SGPA " + m.sgpa.toFixed(2);
    list.appendChild(div);
  });
}

// ---------- ELIGIBILITY ----------
$("checkEligibilityBtn").addEventListener("click", () => {
  const cgpaVal = $("eligCGPA").value;
  const backVal = $("backlogs").value;
  const cgpa = Number(cgpaVal);
  const backlogs = Number(backVal);
  const result = $("eligResult");

  if (cgpaVal === "" || backVal === "" || cgpa < 0 || cgpa > 10 ||
      !Number.isInteger(backlogs) || backlogs < 0) {
    result.textContent = "Please enter valid details.";
    result.style.color = "";
    return;
  }

  if (cgpa >= 7 && backlogs === 0) {
    result.textContent = "🎉 Eligible under demo criteria!";
    result.style.color = "green";
  } else {
    result.textContent = "⚠️ Not eligible under demo criteria.";
    result.style.color = "red";
  }
});

// ---------- QUIZ ----------
const questions = [
  { q: "Which language is primarily used for OOP?", options: ["HTML", "Java", "CSS", "SQL"], answer: "Java" },
  { q: "What is binary search complexity?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: "O(log n)" },
  { q: "Which data structure follows FIFO?", options: ["Stack", "Tree", "Queue", "Graph"], answer: "Queue" },
  { q: "Which keyword creates an object in Java?", options: ["class", "new", "static", "void"], answer: "new" },
  { q: "Which operator represents logical AND in C++?", options: ["||", "!", "&&", "&"], answer: "&&" }
];

let current = 0;
let score = 0;
let answered = false;

$("startQuizBtn").addEventListener("click", () => {
  current = 0;
  score = 0;
  $("startQuizBtn").hidden = true;
  $("quizResult").textContent = "";
  loadQuestion();
});

function loadQuestion() {
  answered = false;
  const q = questions[current];
  $("question").textContent = (current + 1) + ". " + q.q;

  const options = $("options");
  options.innerHTML = "";

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = option;
    btn.addEventListener("click", () => checkAnswer(option));
    options.appendChild(btn);
  });

  $("nextQuestionBtn").hidden = true;
}

function checkAnswer(option) {
  if (answered) return;
  answered = true;

  const correct = questions[current].answer;
  if (option === correct) {
    score++;
    $("quizResult").textContent = "✅ Correct answer!";
  } else {
    $("quizResult").textContent = "❌ Correct answer: " + correct;
  }

  document.querySelectorAll(".option").forEach(b => (b.disabled = true));
  $("nextQuestionBtn").hidden = false;
}

$("nextQuestionBtn").addEventListener("click", () => {
  current++;

  if (current < questions.length) {
    loadQuestion();
    $("quizResult").textContent = "";
    return;
  }

  $("question").textContent = "Quiz Completed! 🎉";
  $("options").innerHTML = "";
  $("quizResult").textContent = "Your score: " + score + "/" + questions.length;

  readiness = Math.round((score / questions.length) * 100);
  localStorage.setItem(storageKey("readiness"), readiness);

  $("nextQuestionBtn").hidden = true;
  $("startQuizBtn").hidden = false;
  updateDashboard();
});

// ---------- DASHBOARD STATS ----------
function updateDashboard() {
  const completed = tasks.filter(t => t.done).length;
  const cgpa = marks.length
    ? marks.reduce((sum, m) => sum + m.sgpa, 0) / marks.length
    : 0;

  $("cgpa").textContent = cgpa.toFixed(2);
  $("completed").textContent = completed;
  $("readiness").textContent = readiness + "%";
  $("progressBar").style.width = readiness + "%";
  $("progressText").textContent = "Placement readiness: " + readiness + "%";
}

// ---------- INIT ----------
const savedEmail = localStorage.getItem("campuslyCurrentUser");
if (savedEmail) {
  const user = getData("campuslyUsers").find(u => u.email === savedEmail);
  if (user) openDashboard(user);
  else localStorage.removeItem("campuslyCurrentUser");
}
