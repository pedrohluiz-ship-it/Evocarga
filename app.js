let currentUser = null;
let currentExercises = [];

// Lista de exercícios
const commonExercises = [
  "Supino Reto Barra", "Supino Inclinado", "Supino Declinado",
  "Agachamento Livre", "Agachamento Smith", "Leg Press",
  "Levantamento Terra", "Rosca Bíceps Barra", "Rosca Bíceps Dumbbell",
  "Tríceps Pulley", "Tríceps Francês", "Desenvolvimento Ombro",
  "Elevação Lateral", "Puxada Frontal", "Remada Curvada",
  "Remada Unilateral", "Barra Fixa", "Crucifixo",
  "Cadeira Extensora", "Cadeira Flexora", "Panturrilha em Pé",
  "Abdominal Crunch", "Prancha"
];

// ====================== LOGIN ======================
function loadProfiles() {
  const profiles = JSON.parse(localStorage.getItem('evoCargaProfiles') || '[]');
  const select = document.getElementById('profile-select');
  select.innerHTML = '<option value="">-- Selecione um aluno --</option>';
  profiles.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

function login() {
  let name = document.getElementById('username').value.trim();
  if (!name) name = prompt("Digite o nome do aluno:");
  if (!name) return;
  createAndLogin(name);
}

function loginWithSelectedProfile() {
  const name = document.getElementById('profile-select').value;
  if (!name) return alert("Selecione um aluno!");
  createAndLogin(name);
}

function createAndLogin(name) {
  let profiles = JSON.parse(localStorage.getItem('evoCargaProfiles') || '[]');
  if (!profiles.includes(name)) {
    profiles.push(name);
    localStorage.setItem('evoCargaProfiles', JSON.stringify(profiles));
  }
  loginWithName(name);
}

function loginWithName(name) {
  currentUser = name;
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'block';
  document.getElementById('current-user').textContent = `Aluno: ${name}`;
  document.getElementById('workout-date').valueAsDate = new Date();
  showSection('log');
}

function logout() {
  if (confirm("Sair?")) {
    currentUser = null;
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
    loadProfiles();
  }
}

// ====================== BUSCA ======================
function filterExercises() {
  const input = document.getElementById('exercise-search');
  const box = document.getElementById('exercise-suggestions');
  const term = input.value.toLowerCase().trim();

  if (term.length < 2) {
    box.style.display = 'none';
    return;
  }

  const filtered = commonExercises.filter(name => name.toLowerCase().includes(term));
  let html = '';
  filtered.forEach(name => {
    html += `<div onclick="addExercise('${name}')" style="padding:12px; cursor:pointer;">${name}</div>`;
  });
  box.innerHTML = html || '<div style="padding:12px;color:#888;">Nenhum encontrado</div>';
  box.style.display = 'block';
}

function addExercise(name) {
  currentExercises.push({ name: name, sets: [{ weight: 0, reps: 0 }], collapsed: false });
  document.getElementById('exercise-search').value = '';
  document.getElementById('exercise-suggestions').style.display = 'none';
  renderExercises();
}

function addCustomExercise() {
  const name = prompt("Nome do exercício personalizado:");
  if (name) {
    currentExercises.push({ name, sets: [{ weight: 0, reps: 0 }], collapsed: false });
    renderExercises();
  }
}

// ====================== RENDER ======================
function renderExercises() {
  const container = document.getElementById('exercises-list');
  container.innerHTML = '';

  if (currentExercises.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:30px; color:#aaa;">Adicione exercícios usando a busca acima.</p>';
    return;
  }

  currentExercises.forEach((ex, exIndex) => {
    const isCollapsed = ex.collapsed || false;
    let setsHTML = '';
    if (!isCollapsed) {
      ex.sets.forEach((set, setIndex) => {
        setsHTML += `
          <div class="set-row">
            <strong>Série ${setIndex + 1}</strong>
            <label>Carga (kg):</label>
            <input type="number" value="${set.weight}" placeholder="Ex: 80" onchange="updateSet(${exIndex}, ${setIndex}, 'weight', this.value)">
            <label>Repetições:</label>
            <input type="number" value="${set.reps}" placeholder="Ex: 12" onchange="updateSet(${exIndex}, ${setIndex}, 'reps', this.value)">
            <button onclick="removeSet(${exIndex}, ${setIndex})" style="color:red;">−</button>
          </div>`;
      });
    }

    container.innerHTML += `
      <div class="exercise-item">
        <div onclick="toggleCollapse(${exIndex})" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;">
          <strong>${ex.name}</strong>
          <span>${isCollapsed ? '▶' : '▼'}</span>
        </div>
        ${setsHTML}
        ${!isCollapsed ? `<button onclick="addSet(${exIndex}); event.stopImmediatePropagation();" style="width:100%; margin-top:10px;">+ Adicionar Série</button>` : ''}
      </div>`;
  });
}

function toggleCollapse(exIndex) {
  currentExercises[exIndex].collapsed = !currentExercises[exIndex].collapsed;
  renderExercises();
}

function updateSet(exIndex, setIndex, field, value) {
  currentExercises[exIndex].sets[setIndex][field] = parseFloat(value) || 0;
}

function addSet(exIndex) {
  const lastWeight = currentExercises[exIndex].sets.length > 0 
    ? currentExercises[exIndex].sets.slice(-1)[0].weight 
    : 0;
  currentExercises[exIndex].sets.push({ weight: lastWeight, reps: 0 });
  renderExercises();
}

function removeSet(exIndex, setIndex) {
  if (currentExercises[exIndex].sets.length > 1) {
    currentExercises[exIndex].sets.splice(setIndex, 1);
    renderExercises();
  }
}

function removeExercise(exIndex) {
  if (confirm("Remover exercício?")) {
    currentExercises.splice(exIndex, 1);
    renderExercises();
  }
}

// ====================== SALVAR ======================
function saveWorkout() {
  if (currentExercises.length === 0) return alert("Adicione pelo menos um exercício!");
  const date = document.getElementById('workout-date').value;
  const key = `evoWorkouts_${currentUser}`;
  let workouts = JSON.parse(localStorage.getItem(key) || '[]');
  workouts.push({ date, exercises: JSON.parse(JSON.stringify(currentExercises)) });
  localStorage.setItem(key, JSON.stringify(workouts));

  alert("✅ Treino salvo com sucesso!");
  currentExercises = [];
  renderExercises();
}

// ====================== HISTÓRICO ======================
function loadHistory() {
  const key = `evoWorkouts_${currentUser}`;
  const workouts = JSON.parse(localStorage.getItem(key) || '[]');
  const container = document.getElementById('history-list');
  container.innerHTML = '';

  if (workouts.length === 0) {
    container.innerHTML = '<p>Nenhum treino salvo ainda.</p>';
    return;
  }

  workouts.reverse().forEach(w => {
    let html = `<div style="background:#1a1a1a; padding:15px; border-radius:10px; margin-bottom:15px;">
      <strong>${w.date}</strong><br>`;
    w.exercises.forEach(ex => {
      html += `<strong>${ex.name}:</strong> `;
      ex.sets.forEach(s => html += `${s.weight}kg × ${s.reps} | `);
      html += '<br>';
    });
    html += '</div>';
    container.innerHTML += html;
  });
}

// ====================== PROGRESSÃO ======================
function loadProgressExercises() {
  const key = `evoWorkouts_${currentUser}`;
  const workouts = JSON.parse(localStorage.getItem(key) || '[]');
  const select = document.getElementById('exercise-select-progress');
  select.innerHTML = '<option value="">Selecione um exercício</option>';

  const unique = new Set();
  workouts.forEach(w => w.exercises.forEach(ex => unique.add(ex.name)));

  unique.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

function showExerciseProgress() {
  const name = document.getElementById('exercise-select-progress').value;
  if (!name) return;
  const details = document.getElementById('progress-details');
  details.innerHTML = `<h3>${name}</h3><p>Progressão será mostrada aqui.</p>`;
}

// ====================== NAVEGAÇÃO ======================
function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById(section + '-section').style.display = 'block';
  
  if (section === 'history') loadHistory();
  if (section === 'progress') loadProgressExercises();
}

// Inicialização
loadProfiles();