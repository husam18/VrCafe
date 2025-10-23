// === Select elements ===
const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const tasksContainer = document.getElementById("tasksContainer");
const filterButtons = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sortSelect");
const hamburgerBtn = document.querySelector(".hamburger-btn");
const navLinks = document.querySelector(".nav-links");

hamburgerBtn.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

// === Load tasks from LocalStorage ===
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// === Update progress bars ===
function updateProgressBars() {
  const categories = ["Werk", "Persoonlijk", "Vrije tijd"];
  
  categories.forEach(category => {
    const categoryTasks = tasks.filter(task => task.category === category);
    const completedTasks = categoryTasks.filter(task => task.completed);
    
    const progressPercentage = categoryTasks.length > 0 
      ? (completedTasks.length / categoryTasks.length) * 100 
      : 0;

    // ✅ Fix for "Vrije tijd" bar
    let progressId = "";
    if (category === "Werk") progressId = "progressWerk";
    if (category === "Persoonlijk") progressId = "progressPersoonlijk";
    if (category === "Vrije tijd") progressId = "progressVrijetijd";

    const progressBar = document.getElementById(progressId);
    if (progressBar) {
      progressBar.style.width = `${progressPercentage}%`;
    }
  });
}

// === Render tasks ===
function renderTasks(filter = "all") {
  tasksContainer.innerHTML = "";

  let filteredTasks = tasks;

  if (filter === "completed") filteredTasks = tasks.filter(t => t.completed);
  if (filter === "pending") filteredTasks = tasks.filter(t => !t.completed);

  // Sort tasks
  if (sortSelect.value === "newest") filteredTasks.sort((a, b) => b.id - a.id);
  else filteredTasks.sort((a, b) => a.id - b.id);

  filteredTasks.forEach(task => {
    const taskDiv = document.createElement("div");
    taskDiv.classList.add("task");
    if (task.completed) taskDiv.classList.add("completed");

    taskDiv.innerHTML = `
      <span>${task.text}</span>
      <span class="category">${task.category}</span>
      <div>
        <button class="complete-btn">${task.completed ? "Onvoltooid" : "Voltooid"}</button>
        <button class="delete-btn">Verwijderen</button>
      </div>
    `;

    // Complete button
    taskDiv.querySelector(".complete-btn").addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks(filter);
      updateProgressBars();
    });

    // Delete button
    taskDiv.querySelector(".delete-btn").addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks(filter);
      updateProgressBars();
    });

    tasksContainer.appendChild(taskDiv);
  });
  
  updateProgressBars();
}

// === Add task ===
addTaskBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const category = categorySelect.value;

  if (!text) return alert("Voer een taak in!");

  tasks.push({
    id: Date.now(),
    text,
    category,
    completed: false
  });

  taskInput.value = "";
  saveTasks();
  renderTasks(document.querySelector(".filter-btn.active")?.dataset.filter || "all");
});

// === Filter buttons ===
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTasks(btn.dataset.filter);
  });
});

// === Sort tasks ===
sortSelect.addEventListener("change", () => {
  renderTasks(document.querySelector(".filter-btn.active")?.dataset.filter || "all");
});

// === Enter key to add task ===
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTaskBtn.click();
});

document.querySelector(".filter-btn[data-filter='all']").classList.add("active");
renderTasks();
