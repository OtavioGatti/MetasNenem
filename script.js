// Game State
let gameState = {
    player1: {
        name: 'Você',
        coins: 0,
        level: 1,
        streak: 0,
        lastActivityDate: null,
        tasksCompleted: 0,
        achievements: []
    },
    player2: {
        name: 'Namorada',
        coins: 0,
        level: 1,
        streak: 0,
        lastActivityDate: null,
        tasksCompleted: 0,
        achievements: []
    },
    tasks: [],
    challenges: [],
    history: [],
    filter: 'all'
};

// Achievements Database
const ACHIEVEMENTS_DB = {
    'first_task': { icon: '🎯', name: 'Primeira Tarefa', description: 'Complete sua primeira tarefa' },
    'level_5': { icon: '⭐', name: 'Nível 5', description: 'Alcance nível 5' },
    'level_10': { icon: '🌟', name: 'Nível 10', description: 'Alcance nível 10' },
    'streak_7': { icon: '🔥', name: 'Semana de Fogo', description: 'Mantenha 7 dias de streak' },
    'coins_100': { icon: '💰', name: 'Colecionador', description: 'Ganhe 100 moedas' },
    'coins_500': { icon: '💸', name: 'Milionário', description: 'Ganhe 500 moedas' },
    'challenge_5': { icon: '💑', name: 'Casal Dedicado', description: 'Complete 5 desafios de casal' },
    'team_player': { icon: '🤝', name: 'Team Player', description: 'Complete 10 tarefas compartilhadas' }
};

// Initialize
function init() {
    initSupabase();
    validateConfig();
    loadGame();
    setupRoomUI();
    renderAll();
    checkDailyStreak();
    startSync();
}

// Local Storage
function loadGame() {
    const saved = localStorage.getItem('metasNenemGame');
    if (saved) {
        gameState = JSON.parse(saved);
    }
    updatePlayerInitials();
}

function saveGame() {
    localStorage.setItem('metasNenemGame', JSON.stringify(gameState));
}

function resetData() {
    if (confirm('⚠️ Tem certeza? Todos os dados serão apagados!')) {
        gameState = {
            player1: {
                name: 'Você',
                coins: 0,
                level: 1,
                streak: 0,
                lastActivityDate: null,
                tasksCompleted: 0,
                achievements: []
            },
            player2: {
                name: 'Namorada',
                coins: 0,
                level: 1,
                streak: 0,
                lastActivityDate: null,
                tasksCompleted: 0,
                achievements: []
            },
            tasks: [],
            challenges: [],
            history: [],
            filter: 'all'
        };
        saveGame();
        renderAll();
        closeModal('settingsModal');
        showToast('✨ Dados resetados!');
    }
}

// UI Functions
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    event.target.classList.add('active');
}

function filterTasks(filter) {
    gameState.filter = filter;
    document.querySelectorAll('.filter-btn').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');
    renderTasks();
}

function toggleSettings() {
    document.getElementById('settingsModal').classList.add('show');
    document.getElementById('player1NameInput').value = gameState.player1.name;
    document.getElementById('player2NameInput').value = gameState.player2.name;
}

function saveSettings() {
    const name1 = document.getElementById('player1NameInput').value.trim();
    const name2 = document.getElementById('player2NameInput').value.trim();
    
    if (name1) gameState.player1.name = name1;
    if (name2) gameState.player2.name = name2;
    
    saveGame();
    updatePlayerInitials();
    renderPlayers();
    closeModal('settingsModal');
    showToast('✅ Nomes atualizados!');
}

function openNewTaskModal() {
    document.getElementById('newTaskModal').classList.add('show');
}

function openNewChallengeModal() {
    document.getElementById('newChallengeModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function updatePlayerInitials() {
    document.getElementById('player1-initial').textContent = gameState.player1.name.charAt(0).toUpperCase();
    document.getElementById('player2-initial').textContent = gameState.player2.name.charAt(0).toUpperCase();
}

// Task Management
function createTask() {
    const description = document.getElementById('taskDescription').value.trim();
    const coins = parseInt(document.getElementById('taskCoins').value) || 10;
    const type = document.getElementById('taskType').value;
    const assigned = document.getElementById('taskAssigned').value;
    
    if (!description) {
        showToast('⚠️ Descreva a tarefa!');
        return;
    }
    
    const task = {
        id: Date.now(),
        description,
        coins,
        type,
        assigned,
        completed: false,
        completedBy: null,
        createdAt: new Date().toISOString()
    };
    
    gameState.tasks.push(task);
    saveGame();
    
    // Sincronizar com Supabase
    if (USE_SUPABASE && supabase) {
        supabase.createTask(getRoomId(), task).then((createdTask) => {
            // Atualizar o task local com o ID real do Supabase
            task.id = createdTask.id;
            saveGame();
            console.log('✅ Tarefa sincronizada com Supabase, ID:', createdTask.id);
        }).catch(err => {
            console.error('❌ ERRO ao criar tarefa no Supabase:', err);
        });
    }
    
    renderTasks();
    closeModal('newTaskModal');
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskCoins').value = '10';
    showToast('✅ Tarefa criada!');
}

function completeTask(taskId, playerId, playerName) {
    const task = gameState.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const player = gameState[playerId];
    
    task.completed = true;
    task.completedBy = playerId;
    
    player.coins += task.coins;
    player.tasksCompleted += 1;
    
    updateLevel(playerId);
    updateStreak(playerId);
    checkAchievements(playerId);
    
    addHistory(`${playerName} completou "${task.description}" +${task.coins}⭐`);
    saveGame();
    
    // Sincronizar com Supabase
    if (USE_SUPABASE && supabase) {
        const roomId = getRoomId();
        supabase.updateTask(task.id, { completed: true, completed_by: playerId }).catch(e => console.error('Erro ao atualizar task:', e));
        supabase.updatePlayer(roomId, playerId === 'player1' ? 1 : 2, {
            coins: player.coins,
            level: player.level,
            streak: player.streak,
            tasks_completed: player.tasksCompleted
        }).catch(e => console.error('Erro ao atualizar player:', e));
    }
    
    renderAll();
    showToast(`🎉 ${playerName} ganhou ${task.coins} moedas!`);
}

function deleteTask(taskId) {
    gameState.tasks = gameState.tasks.filter(t => t.id !== taskId);
    saveGame();
    
    // Sincronizar com Supabase
    if (USE_SUPABASE && supabase) {
        supabase.deleteTask(taskId)
            .then(() => console.log('✅ Tarefa apagada do Supabase'))
            .catch(err => console.error('❌ ERRO ao deletar tarefa:', err));
    }
    
    renderTasks();
    showToast('🗑️ Tarefa removida');
}

function renderTasks() {
    let tasks = gameState.tasks;
    
    if (gameState.filter === 'pessoal') {
        tasks = tasks.filter(t => t.type === 'pessoal');
    } else if (gameState.filter === 'casal') {
        tasks = tasks.filter(t => t.type === 'casal');
    } else if (gameState.filter === 'concluido') {
        tasks = tasks.filter(t => t.completed);
    }
    
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-card ${task.completed ? 'concluido' : ''}">
            <div class="task-header">
                <span class="task-type ${task.type}">${task.type === 'casal' ? '💑 Casal' : '👤 Pessoal'}</span>
            </div>
            <div class="task-description">${task.description}</div>
            <div class="task-footer">
                <span class="task-coins">${task.coins}⭐</span>
                <div class="task-actions">
                    ${task.completed ? `
                        <span style="color: green; font-weight: bold;">✓ Feito</span>
                    ` : `
                        <button class="btn-small btn-check" onclick="completeTask(${task.id}, 'player1', '${gameState.player1.name}')">
                            ${gameState.player1.name}
                        </button>
                        <button class="btn-small btn-check" onclick="completeTask(${task.id}, 'player2', '${gameState.player2.name}')">
                            ${gameState.player2.name}
                        </button>
                    `}
                    <button class="btn-small btn-delete" onclick="deleteTask(${task.id})">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Challenges
function createChallenge() {
    const description = document.getElementById('challengeDescription').value.trim();
    const coins = parseInt(document.getElementById('challengeCoins').value) || 20;
    const difficulty = document.getElementById('challengeDifficulty').value;
    
    if (!description) {
        showToast('⚠️ Descreva o desafio!');
        return;
    }
    
    const challenge = {
        id: Date.now(),
        description,
        coins,
        difficulty,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    gameState.challenges.push(challenge);
    saveGame();
    
    // Sincronizar com Supabase
    if (USE_SUPABASE && supabase) {
        supabase.createChallenge(getRoomId(), challenge).then((createdChallenge) => {
            // Atualizar challenge local com ID real do Supabase
            challenge.id = createdChallenge.id;
            saveGame();
            console.log('✅ Desafio sincronizado com Supabase, ID:', createdChallenge.id);
        }).catch(err => {
            console.error('❌ ERRO ao criar desafio no Supabase:', err);
        });
    }
    
    renderChallenges();
    closeModal('newChallengeModal');
    document.getElementById('challengeDescription').value = '';
    document.getElementById('challengeCoins').value = '20';
    showToast('✅ Desafio criado!');
}

function completeChallenge(challengeId) {
    const challenge = gameState.challenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;
    
    challenge.completed = true;
    
    gameState.player1.coins += challenge.coins;
    gameState.player2.coins += challenge.coins;
    
    updateLevel('player1');
    updateLevel('player2');
    updateStreak('player1');
    updateStreak('player2');
    
    checkAchievements('player1');
    checkAchievements('player2');
    
    addHistory(`💑 ${gameState.player1.name} e ${gameState.player2.name} completaram desafio: "${challenge.description}" +${challenge.coins}⭐ cada`);
    
    saveGame();
    
    // Sincronizar com Supabase
    if (USE_SUPABASE && supabase) {
        const roomId = getRoomId();
        supabase.updateChallenge(challenge.id, { completed: true })
            .then(() => console.log('✅ Challenge atualizado no Supabase'))
            .catch(e => console.error('❌ ERRO ao atualizar challenge:', e, {id: challenge.id}));
        
        // Sincronizar ambos os players
        supabase.updatePlayer(roomId, 1, {
            coins: gameState.player1.coins,
            level: gameState.player1.level,
            streak: gameState.player1.streak
        })
            .then(() => console.log('✅ Player1 atualizado no Supabase'))
            .catch(e => console.error('❌ ERRO ao atualizar player1:', e, {roomId}));
        
        supabase.updatePlayer(roomId, 2, {
            coins: gameState.player2.coins,
            level: gameState.player2.level,
            streak: gameState.player2.streak
        })
            .then(() => console.log('✅ Player2 atualizado no Supabase'))
            .catch(e => console.error('❌ ERRO ao atualizar player2:', e, {roomId}));
    }
    
    renderAll();
    showToast('🎉 Desafio do casal completado! +' + challenge.coins + '⭐ para cada um!');
}

function renderChallenges() {
    const challenges = gameState.challenges.filter(c => !c.completed);
    const html = document.getElementById('couple-challenges');
    
    if (challenges.length === 0) {
        html.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Nenhum desafio disponível</p>';
        return;
    }
    
    html.innerHTML = challenges.map(challenge => `
        <div class="challenge-card">
            <div class="challenge-header">
                <h3>${challenge.description}</h3>
                <span class="challenge-difficulty">${getDifficultyEmoji(challenge.difficulty)} ${challenge.difficulty}</span>
            </div>
            <div class="challenge-reward">${challenge.coins}⭐ cada</div>
            <div class="challenge-buttons">
                <button class="btn-complete-challenge" onclick="completeChallenge(${challenge.id})">✨ Completar</button>
            </div>
        </div>
    `).join('');
}

function getDifficultyEmoji(difficulty) {
    const emojis = { facil: '😊', medio: '😎', dificil: '🔥' };
    return emojis[difficulty] || '📌';
}

// Level System
function updateLevel(playerId) {
    const player = gameState[playerId];
    const coinsNeeded = player.level * 100;
    
    if (player.coins >= coinsNeeded) {
        player.level += 1;
        player.coins -= coinsNeeded;
        showToast(`🎖️ ${player.name} subiu para nível ${player.level}!`);
    }
}

// Streak System
function checkDailyStreak() {
    const today = new Date().toDateString();
    
    [gameState.player1, gameState.player2].forEach(player => {
        if (player.lastActivityDate !== today) {
            if (player.lastActivityDate) {
                const lastDate = new Date(player.lastActivityDate);
                const currentDate = new Date();
                const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
                
                if (daysDiff > 1) {
                    player.streak = 0;
                }
            }
        }
    });
}

function updateStreak(playerId) {
    const player = gameState[playerId];
    const today = new Date().toDateString();
    
    if (player.lastActivityDate !== today) {
        player.streak += 1;
        player.lastActivityDate = today;
    }
}

// Achievements
function checkAchievements(playerId) {
    const player = gameState[playerId];
    const newAchievements = [];
    
    if (player.tasksCompleted === 1 && !player.achievements.includes('first_task')) {
        newAchievements.push('first_task');
    }
    if (player.level >= 5 && !player.achievements.includes('level_5')) {
        newAchievements.push('level_5');
    }
    if (player.level >= 10 && !player.achievements.includes('level_10')) {
        newAchievements.push('level_10');
    }
    if (player.streak >= 7 && !player.achievements.includes('streak_7')) {
        newAchievements.push('streak_7');
    }
    if (player.coins >= 100 && !player.achievements.includes('coins_100')) {
        newAchievements.push('coins_100');
    }
    if (player.coins >= 500 && !player.achievements.includes('coins_500')) {
        newAchievements.push('coins_500');
    }
    
    newAchievements.forEach(achievement => {
        player.achievements.push(achievement);
        const ach = ACHIEVEMENTS_DB[achievement];
        showToast(`🏆 ${ach.icon} ${ach.name}!`);
    });
}

function renderAchievements() {
    const allAchievements = document.getElementById('achievements-grid');
    let html = '<h3 style="grid-column: 1/-1;">Meus Achievements</h3>';
    
    Object.entries(ACHIEVEMENTS_DB).forEach(([key, ach]) => {
        const unlocked = gameState.player1.achievements.includes(key) || gameState.player2.achievements.includes(key);
        html += `
            <div class="achievement ${unlocked ? '' : 'locked'}" title="${ach.description}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-name">${ach.name}</div>
            </div>
        `;
    });
    
    allAchievements.innerHTML = html;
}

// History
function addHistory(action) {
    const historyEntry = {
        action,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };
    gameState.history.unshift(historyEntry);
    
    if (gameState.history.length > 50) {
        gameState.history.pop();
    }
    
    // Sincronizar com Supabase
    if (USE_SUPABASE && supabase) {
        supabase.addHistory(getRoomId(), action)
            .then(() => console.log('✅ Histórico sincronizado'))
            .catch(err => console.error('❌ ERRO ao sincronizar histórico:', err));
    }
}

function renderHistory() {
    const timeline = document.getElementById('timeline');
    
    if (gameState.history.length === 0) {
        timeline.innerHTML = '<p style="text-align: center;">Nenhuma atividade ainda</p>';
        return;
    }
    
    timeline.innerHTML = gameState.history.map(item => `
        <div class="timeline-item">
            <div class="timeline-dot">📌</div>
            <div class="timeline-content">
                <div class="timeline-title">${item.action}</div>
                <div class="timeline-date">${formatDate(item.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
        return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric' });
    }
}

// Rendering
function renderPlayers() {
    [1, 2].forEach(num => {
        const player = gameState[`player${num}`];
        document.getElementById(`player${num}-name`).textContent = player.name;
        document.getElementById(`player${num}-coins`).textContent = player.coins;
        document.getElementById(`player${num}-level`).textContent = player.level;
        document.getElementById(`player${num}-streak`).textContent = player.streak + '🔥';
        
        const progress = (player.coins / (player.level * 100)) * 100;
        document.getElementById(`player${num}-progress`).style.width = Math.min(progress, 100) + '%';
    });
}

function renderAll() {
    renderPlayers();
    renderTasks();
    renderChallenges();
    renderHistory();
    renderAchievements();
}

// Close modal on outside click
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// ============ SYNC & ROOM FUNCTIONS ============

let syncInterval = null;
let lastSyncData = null;

// Setup UI da Sala
function setupRoomUI() {
    const roomId = getRoomId();
    document.getElementById('roomIdInput').value = roomId;
    updateSyncStatus();
}

// Toggle Room Modal
function toggleRoomModal() {
    document.getElementById('roomModal').classList.add('show');
    document.getElementById('roomIdInput').value = getRoomId();
}

// Copiar ID da Sala
async function copyRoomId() {
    const roomId = getRoomId();
    try {
        await navigator.clipboard.writeText(roomId);
        showToast('✅ Código copiado para clipboard!');
    } catch {
        showToast('⚠️ Copie manualmente: ' + roomId);
    }
}

// Entrar em outra sala
function joinRoom() {
    const newRoom = document.getElementById('newRoomInput').value.trim();
    if (!newRoom) {
        showToast('⚠️ Digite um código válido!');
        return;
    }
    setRoomId(newRoom);
    setupRoomUI();
    closeModal('roomModal');
    showToast('🔗 Sala alterada! Agora sincronizando...');
    stopSync();
    startSync();
}

// Criar nova sala
function createNewRoom() {
    const newRoomId = "metasnenem-" + Math.random().toString(36).substring(2, 10);
    setRoomId(newRoomId);
    setupRoomUI();
    closeModal('roomModal');
    showToast('🆕 Nova sala criada! Compartilhe o código com sua namorada');
    stopSync();
    startSync();
}

// Iniciar sincronização
function startSync() {
    if (!USE_SUPABASE) {
        console.log('📱 Modo Local: localStorage apenas');
        return;
    }
    
    console.log('🔄 Iniciando sincronização com Supabase...');
    updateSyncStatus(true);
    
    if (syncInterval) clearInterval(syncInterval);
    
    syncInterval = supabase.setupRealtimeListener(getRoomId(), (data) => {
        syncRemoteData(data);
    }, 1500);
}

// Parar sincronização
function stopSync() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
}

// Sincronizar dados remotos
function syncRemoteData(data) {
    if (!data.players || data.players.length === 0) return;
    
    const remote = data.players;
    
    // Atualizar player 1
    const p1 = remote.find(p => p.player_number === 1);
    if (p1) {
        gameState.player1 = {
            name: p1.name || gameState.player1.name,
            coins: p1.coins || 0,
            level: p1.level || 1,
            streak: p1.streak || 0,
            lastActivityDate: p1.last_activity_date,
            tasksCompleted: p1.tasks_completed || 0,
            achievements: p1.achievements || []
        };
    }
    
    // Atualizar player 2
    const p2 = remote.find(p => p.player_number === 2);
    if (p2) {
        gameState.player2 = {
            name: p2.name || gameState.player2.name,
            coins: p2.coins || 0,
            level: p2.level || 1,
            streak: p2.streak || 0,
            lastActivityDate: p2.last_activity_date,
            tasksCompleted: p2.tasks_completed || 0,
            achievements: p2.achievements || []
        };
    }
    
    // Atualizar tarefas
    if (data.tasks) {
        gameState.tasks = data.tasks.map(t => ({
            id: t.id,
            description: t.description,
            coins: t.coins,
            type: t.type,
            assigned: t.assigned,
            completed: t.completed,
            completedBy: t.completed_by,
            createdAt: t.created_at
        }));
    }
    
    // Atualizar desafios
    if (data.challenges) {
        gameState.challenges = data.challenges.map(c => ({
            id: c.id,
            description: c.description,
            coins: c.coins,
            difficulty: c.difficulty,
            completed: c.completed,
            createdAt: c.created_at
        }));
    }
    
    // Atualizar histórico
    if (data.history) {
        gameState.history = data.history.map(h => ({
            id: h.id,
            action: h.action,
            timestamp: h.timestamp
        }));
    }
    
    renderAll();
}

// Atualizar status de sincronização
function updateSyncStatus(syncing = null) {
    const status = document.getElementById('syncStatus');
    if (syncing === null) {
        syncing = USE_SUPABASE && syncInterval !== null;
    }
    
    if (syncing) {
        status.textContent = '🟢 Sincronizado';
        status.classList.add('connected');
        status.classList.remove('disconnected');
    } else {
        status.textContent = '📱 Modo Local';
        status.classList.remove('connected');
        status.classList.add('disconnected');
    }
}

// Salvar para cloud quando usar Supabase
async function syncToCloud() {
    if (!USE_SUPABASE || !supabase) return;
    
    try {
        const roomId = getRoomId();
        
        // Criar/Upsert players (cria se não existir)
        await supabase.upsertPlayer(roomId, 1, {
            name: gameState.player1.name,
            coins: gameState.player1.coins,
            level: gameState.player1.level,
            streak: gameState.player1.streak,
            tasksCompleted: gameState.player1.tasksCompleted,
            achievements: gameState.player1.achievements,
            lastActivityDate: gameState.player1.lastActivityDate
        });
        
        await supabase.upsertPlayer(roomId, 2, {
            name: gameState.player2.name,
            coins: gameState.player2.coins,
            level: gameState.player2.level,
            streak: gameState.player2.streak,
            tasksCompleted: gameState.player2.tasksCompleted,
            achievements: gameState.player2.achievements,
            lastActivityDate: gameState.player2.lastActivityDate
        });
        
        console.log('✅ Players sincronizados com Supabase');
    } catch (error) {
        console.error('❌ Erro ao sincronizar com cloud:', error);
    }
}

// Chamar syncToCloud quando o jogo inicia
function initSupabaseSync() {
    if (USE_SUPABASE && supabase) {
        syncToCloud();
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', function() {
    init();
    setTimeout(initSupabaseSync, 500); // Aguarda inicialização
});

// Auto-save on visibility change
document.addEventListener('visibilitychange', () => {
    saveGame();
    if (document.visible === false) {
        stopSync();
    } else {
        startSync();
    }
});
