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

// Helpers de ID e listeners são declarados mais abaixo, perto do uso.

function normalizeEntityId(id) {
    if (id === null || id === undefined) return null;
    return String(id);
}

function matchesEntityId(entity, id) {
    const normalizedId = normalizeEntityId(id);
    if (!normalizedId || !entity) return false;
    
    return normalizeEntityId(entity.id) === normalizedId ||
        normalizeEntityId(entity.supabaseId) === normalizedId;
}

const pendingTaskUpdates = new Map();

function trackPendingTaskUpdate(task, updates) {
    const keys = [task.id, task.supabaseId]
        .map(normalizeEntityId)
        .filter(Boolean);
    
    keys.forEach(key => pendingTaskUpdates.set(key, { ...updates }));
}

function resolvePendingTaskUpdate(task) {
    const keys = [task?.id, task?.supabaseId]
        .map(normalizeEntityId)
        .filter(Boolean);
    
    const pending = keys
        .map(key => pendingTaskUpdates.get(key))
        .find(Boolean);
    
    if (!pending) return task;
    
    const remoteCompleted = task.completed;
    const remoteCompletedBy = task.completedBy;
    
    if (pending.completed !== undefined) {
        task.completed = pending.completed;
    }
    
    if (pending.completedBy !== undefined) {
        task.completedBy = pending.completedBy;
    }
    
    const remoteMatches = pending.completed === undefined ||
        (remoteCompleted === pending.completed && remoteCompletedBy === pending.completedBy);
    
    if (remoteMatches) {
        keys.forEach(key => pendingTaskUpdates.delete(key));
    }
    
    return task;
}

// Initialize
async function init() {
    initSupabase();
    validateConfig();
    loadGame();
    
    // Autenticar jogador antes de renderizar
    await initializeAuth();
    
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
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer) {
        const displayText = `${currentPlayer.name} (${currentPlayer.id === 1 ? 'Player 1' : 'Player 2'})`;
        document.getElementById('currentPlayerDisplay').textContent = displayText;
    }
    document.getElementById('settingsModal').classList.add('show');
}

function saveSettings() {
    // Não mais usado - autenticação agora é feita via initializeAuth()
    location.reload();
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
    // Usar primeira letra do nome real, não genérico
    const p1Initial = gameState.player1.name && gameState.player1.name !== 'Você' 
        ? gameState.player1.name.charAt(0).toUpperCase() 
        : 'O';
    const p2Initial = gameState.player2.name && gameState.player2.name !== 'Namorada' 
        ? gameState.player2.name.charAt(0).toUpperCase() 
        : 'C';
    
    document.getElementById('player1-initial').textContent = p1Initial;
    document.getElementById('player2-initial').textContent = p2Initial;
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
        id: Date.now(), // ID local para referência rápida
        supabaseId: null, // ID real do Supabase (será preenchido após criar)
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
    
    // Sincronizar com Supabase e atualizar supabaseId
    if (USE_SUPABASE && supabase) {
        const roomId = getRoomId();
        supabase.createTask(roomId, task)
            .then(created => {
                if (created && created.id) {
                    // Atualizar com o UUID real do Supabase
                    task.supabaseId = created.id;
                    saveGame();
                    console.log('✅ Task local atualizada com UUID do Supabase:', created.id);
                }
            })
            .catch(err => console.error('❌ ERRO ao criar tarefa no Supabase:', err));
    }
    
    renderTasks();
    closeModal('newTaskModal');
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskCoins').value = '10';
    showToast('✅ Tarefa criada!');
}

function completeTask(taskId, playerId, playerName) {
    const task = gameState.tasks.find(t => matchesEntityId(t, taskId));
    if (!task) {
        console.warn('Task nÃ£o encontrada para completar:', {
            taskId,
            availableTaskIds: gameState.tasks.map(t => ({
                id: t.id,
                supabaseId: t.supabaseId,
                description: t.description
            }))
        });
        return;
    }
    
    if (task.completed) return;
    
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
        
        // Usar supabaseId se disponível, senão usar id local (para tarefas antigas)
        const taskIdToUpdate = task.supabaseId || task.id;
        trackPendingTaskUpdate(task, {
            completed: true,
            completedBy: playerId
        });
        
        supabase.updateTask(taskIdToUpdate, { completed: true, completed_by: playerId })
            .then(() => console.log('✅ Task atualizada no Supabase'))
            .catch(e => console.error('❌ ERRO ao atualizar task:', e, {taskId: taskIdToUpdate, supabaseId: task.supabaseId}));
        
        // Sincronizar player que completa
        supabase.updatePlayer(roomId, playerId === 'player1' ? 1 : 2, {
            coins: player.coins,
            level: player.level,
            streak: player.streak,
            tasks_completed: player.tasksCompleted
        }).then(() => console.log('✅ Player atualizado no Supabase'))
          .catch(e => console.error('❌ ERRO ao atualizar player:', e));
    }
    
    renderAll();
    showToast(`🎉 ${playerName} ganhou ${task.coins} moedas!`);
}

function deleteTask(taskId) {
    const task = gameState.tasks.find(t => matchesEntityId(t, taskId));
    gameState.tasks = gameState.tasks.filter(t => !matchesEntityId(t, taskId));
    saveGame();
    
    // Sincronizar com Supabase
    if (USE_SUPABASE && supabase && task) {
        // Usar supabaseId se disponível
        const taskIdToDelete = task.supabaseId || task.id;
        supabase.deleteTask(taskIdToDelete)
            .then(() => console.log('✅ Tarefa apagada do Supabase'))
            .catch(err => console.error('❌ ERRO ao deletar tarefa:', err, {taskId: taskIdToDelete, supabaseId: task.supabaseId}));
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
                        <button class="btn-small btn-check" data-task-id="${task.supabaseId || task.id}" data-player-id="1">
                            ${gameState.player1.name}
                        </button>
                        <button class="btn-small btn-check" data-task-id="${task.supabaseId || task.id}" data-player-id="2">
                            ${gameState.player2.name}
                        </button>
                    `}
                    <button class="btn-small btn-delete" data-task-id="${task.id}">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Adicionar event listeners DEPOIS de renderizar
    addTaskEventListeners();
}

// Adicionar event listeners aos botões das tarefas
let taskListenerAttached = false;
let processingTaskIds = new Set(); // Evitar execução duplicada

function addTaskEventListeners() {
    // Usar event delegation para evitar duplicar listeners
    if (taskListenerAttached) return;
    
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;
    
    tasksList.addEventListener('click', function(e) {
        const checkBtn = e.target.closest('button.btn-check[data-task-id][data-player-id]');
        if (checkBtn) {
            const taskId = normalizeEntityId(checkBtn.getAttribute('data-task-id'));
            const playerId = parseInt(checkBtn.getAttribute('data-player-id'));
            
            // Evitar múltiplos cliques na mesma task
            if (processingTaskIds.has(taskId)) {
                console.log('⚠️ Task já está sendo processada:', taskId);
                return;
            }
            
            processingTaskIds.add(taskId);
            checkBtn.disabled = true;
            
            const playerKey = `player${playerId}`;
            const playerName = gameState[playerKey].name;
            
            console.log('🖱️ Task completed:', { taskId, playerId, playerKey, playerName });
            completeTask(taskId, playerKey, playerName);
            
            // Remover do processing após um tempo seguro
            setTimeout(() => processingTaskIds.delete(taskId), 500);
            return;
        }
        
        const deleteBtn = e.target.closest('button.btn-delete[data-task-id]');
        if (deleteBtn) {
            const taskId = normalizeEntityId(deleteBtn.getAttribute('data-task-id'));
            console.log('🗑️ Task deleted:', taskId);
            deleteTask(taskId);
            return;
        }
    });
    
    taskListenerAttached = true;
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
        id: Date.now(), // ID local
        supabaseId: null, // ID real do Supabase
        description,
        coins,
        difficulty,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    gameState.challenges.push(challenge);
    saveGame();
    
    // Sincronizar com Supabase e atualizar supabaseId
    if (USE_SUPABASE && supabase) {
        const roomId = getRoomId();
        supabase.createChallenge(roomId, challenge)
            .then(created => {
                if (created && created.id) {
                    // Atualizar com o UUID real do Supabase
                    challenge.supabaseId = created.id;
                    saveGame();
                    console.log('✅ Challenge local atualizado com UUID do Supabase:', created.id);
                }
            })
            .catch(err => console.error('❌ ERRO ao criar desafio no Supabase:', err));
    }
    
    renderChallenges();
    closeModal('newChallengeModal');
    document.getElementById('challengeDescription').value = '';
    document.getElementById('challengeCoins').value = '20';
    showToast('✅ Desafio criado!');
}

function completeChallenge(challengeId) {
    const challenge = gameState.challenges.find(c => matchesEntityId(c, challengeId));
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
        
        // Usar supabaseId se disponível
        const challengeIdToUpdate = challenge.supabaseId || challenge.id;
        
        supabase.updateChallenge(challengeIdToUpdate, { completed: true })
            .then(() => console.log('✅ Challenge atualizado no Supabase'))
            .catch(e => console.error('❌ ERRO ao atualizar challenge:', e, {id: challengeIdToUpdate, supabaseId: challenge.supabaseId}));
        
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

let challengeListenerAttached = false;
let processingChallengeIds = new Set();

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
                <button class="btn-complete-challenge" data-challenge-id="${challenge.id}">✨ Completar</button>
            </div>
        </div>
    `).join('');
    
    // Adicionar event listeners
    addChallengeEventListeners();
}

// Usar event delegation para evitar duplicar listeners
function addChallengeEventListeners() {
    if (challengeListenerAttached) return;
    
    const html = document.getElementById('couple-challenges');
    if (!html) return;
    
    html.addEventListener('click', function(e) {
        const btn = e.target.closest('button.btn-complete-challenge[data-challenge-id]');
        if (btn) {
            const challengeId = normalizeEntityId(btn.getAttribute('data-challenge-id'));
            
            // Evitar múltiplos cliques
            if (processingChallengeIds.has(challengeId)) {
                console.log('⚠️ Challenge já está sendo processado:', challengeId);
                return;
            }
            
            processingChallengeIds.add(challengeId);
            btn.disabled = true;
            
            console.log('🎯 Challenge completed:', challengeId);
            completeChallenge(challengeId);
            
            setTimeout(() => processingChallengeIds.delete(challengeId), 500);
        }
    });
    
    challengeListenerAttached = true;
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

// Shop Items Database
const SHOP_ITEMS = [
    { id: 1, name: '🍕 Pizza Night', description: 'Noite romantica com pizza', cost: 50, icon: '🍕' },
    { id: 2, name: '🎬 Cinema Data', description: 'Sessao de cinema ao lado dela/dele', cost: 40, icon: '🎬' },
    { id: 3, name: '💐 Flores', description: 'Um buque lindo de flores', cost: 30, icon: '💐' },
    { id: 4, name: '🎁 Presente Surpresa', description: 'Uma surpresa especial', cost: 60, icon: '🎁' },
    { id: 5, name: '🏖️ Viagem Fds', description: 'Uma viagem no proximo fim de semana', cost: 100, icon: '🏖️' },
    { id: 6, name: '💅 Spa Day', description: 'Dia de spa para relaxar', cost: 80, icon: '💅' },
    { id: 7, name: '🎵 Musica Ao Vivo', description: 'Show musical especial', cost: 70, icon: '🎵' },
    { id: 8, name: '🍽️ Jantar Gourmet', description: 'Jantar fine dining', cost: 90, icon: '🍽️' }
];

// Shop Functions
function updatePlayerCoinsDisplay() {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer) return;
    
    const userCoinsDisplay = document.getElementById('userCoinsDisplay');
    const playerData = gameState[`player${currentPlayer.id}`];
    
    if (userCoinsDisplay) {
        userCoinsDisplay.textContent = playerData.coins;
    }
}

function renderLoja() {
    const lojaItemsContainer = document.getElementById('loja-items');
    const currentPlayer = getCurrentPlayer();
    
    if (!currentPlayer) {
        lojaItemsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">❌ Você precisa estar autenticado</p>';
        return;
    }
    
    const playerCoins = gameState[`player${currentPlayer.id}`].coins;
    
    lojaItemsContainer.innerHTML = SHOP_ITEMS.map(item => {
        const canAfford = playerCoins >= item.cost;
        return `
            <div class="loja-item">
                <div class="loja-item-icon">${item.icon}</div>
                <div class="loja-item-name">${item.name}</div>
                <div class="loja-item-description">${item.description}</div>
                <div class="loja-item-price">${item.cost}⭐</div>
                <button class="loja-item-button btn-purchase" data-item-id="${item.id}" data-item-cost="${item.cost}" ${!canAfford ? 'disabled' : ''}>
                    ${canAfford ? 'Comprar' : 'Moedas insuficientes'}
                </button>
            </div>
        `;
    }).join('');
    
    addShopEventListeners();
}

let shopListenerAttached = false;
let processingItemIds = new Set();

function addShopEventListeners() {
    if (shopListenerAttached) return;
    
    const lojaItemsContainer = document.getElementById('loja-items');
    if (!lojaItemsContainer) return;
    
    lojaItemsContainer.addEventListener('click', function(e) {
        const btn = e.target.closest('button.btn-purchase[data-item-id][data-item-cost]');
        if (btn) {
            const itemId = parseInt(btn.getAttribute('data-item-id'));
            const itemCost = parseInt(btn.getAttribute('data-item-cost'));
            
            // Evitar múltiplos cliques
            if (processingItemIds.has(itemId)) {
                console.log('⚠️ Item já está sendo processado:', itemId);
                return;
            }
            
            processingItemIds.add(itemId);
            btn.disabled = true;
            
            console.log('🛍️ Item purchased:', { itemId, itemCost });
            purchaseItem(itemId, itemCost);
            
            setTimeout(() => processingItemIds.delete(itemId), 500);
        }
    });
    
    shopListenerAttached = true;
}

function purchaseItem(itemId, itemCost) {
    const currentPlayer = getCurrentPlayer();
    
    if (!currentPlayer) {
        showToast('❌ Você precisa estar autenticado');
        return;
    }
    
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) {
        showToast('❌ Item não encontrado');
        return;
    }
    
    const playerId = `player${currentPlayer.id}`;
    const playerData = gameState[playerId];
    
    if (playerData.coins < itemCost) {
        showToast('❌ Moedas insuficientes!');
        return;
    }
    
    // Deduzir moedas do jogador autenticado
    playerData.coins -= itemCost;
    saveGame();
    
    // Registrar compra no histórico
    addHistory(`${currentPlayer.name} comprou ${item.name} por ${itemCost}⭐`);
    
    // Sincronizar with Supabase
    if (USE_SUPABASE && supabase) {
        const roomId = getRoomId();
        supabase.updatePlayer(roomId, currentPlayer.id, {
            coins: playerData.coins
        })
            .then(() => {
                console.log('✅ Compra sincronizada com Supabase');
            })
            .catch(e => console.error('❌ ERRO ao sincronizar compra:', e));
    }
    
    updatePlayerCoinsDisplay();
    renderLoja();
    showToast(`🎉 ${currentPlayer.name} comprou ${item.name}! 🛍️`);
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
    updatePlayerCoinsDisplay();
    renderLoja();
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
    
    console.log('🔄 Mudando para sala:', newRoom);
    
    // 1. Parar sincronização atual
    stopSync();
    console.log('✅ Sincronização anterior parada');
    
    // 2. Limpar dados da sala anterior
    localStorage.removeItem('metasNenemGame');
    processingTaskIds.clear();
    processingChallengeIds.clear();
    processingItemIds.clear();
    taskListenerAttached = false;
    challengeListenerAttached = false;
    shopListenerAttached = false;
    gameState = {
        player1: { name: 'Você', coins: 0, level: 1, streak: 0, lastActivityDate: null, tasksCompleted: 0, achievements: [] },
        player2: { name: 'Namorada', coins: 0, level: 1, streak: 0, lastActivityDate: null, tasksCompleted: 0, achievements: [] },
        tasks: [],
        challenges: [],
        history: [],
        filter: 'all'
    };
    console.log('✅ Dados antigos limpos');
    
    // 3. Fazer logout (limpar autenticação)
    localStorage.removeItem('metasnenem_current_player_id');
    localStorage.removeItem('metasnenem_current_player_name');
    console.log('✅ Autenticação limpa');
    
    // 4. Mudar para nova sala
    setRoomId(newRoom);
    console.log('✅ Sala alterada para:', newRoom);
    
    // 5. Fechar modal e recarregar
    closeModal('roomModal');
    document.getElementById('newRoomInput').value = '';
    
    showToast('🔗 Sala alterada! Reautenticando...');
    
    // 6. Forçar recarregamento da página para reinicializar tudo
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// Criar nova sala
function createNewRoom() {
    const newRoomId = "metasnenem-" + Math.random().toString(36).substring(2, 10);
    
    console.log('🆕 Criando nova sala:', newRoomId);
    
    // 1. Parar sincronização atual
    stopSync();
    console.log('✅ Sincronização anterior parada');
    
    // 2. Limpar dados da sala anterior
    localStorage.removeItem('metasNenemGame');
    processingTaskIds.clear();
    processingChallengeIds.clear();
    processingItemIds.clear();
    taskListenerAttached = false;
    challengeListenerAttached = false;
    shopListenerAttached = false;
    gameState = {
        player1: { name: 'Você', coins: 0, level: 1, streak: 0, lastActivityDate: null, tasksCompleted: 0, achievements: [] },
        player2: { name: 'Namorada', coins: 0, level: 1, streak: 0, lastActivityDate: null, tasksCompleted: 0, achievements: [] },
        tasks: [],
        challenges: [],
        history: [],
        filter: 'all'
    };
    console.log('✅ Dados antigos limpos');
    
    // 3. Fazer logout (limpar autenticação)
    localStorage.removeItem('metasnenem_current_player_id');
    localStorage.removeItem('metasnenem_current_player_name');
    console.log('✅ Autenticação limpa');
    
    // 4. Mudar para nova sala
    setRoomId(newRoomId);
    console.log('✅ Nova sala criada:', newRoomId);
    
    // 5. Fechar modal
    closeModal('roomModal');
    document.getElementById('newRoomInput').value = '';
    
    showToast('🆕 Nova sala criada! Reautenticando...');
    
    // 6. Forçar recarregamento da página para reinicializar tudo
    setTimeout(() => {
        location.reload();
    }, 1000);
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
        gameState.tasks = data.tasks.map(t => resolvePendingTaskUpdate({
            id: t.id,
            supabaseId: t.id,
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
            supabaseId: c.id,
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

// Não chamar syncToCloud() na inicialização - evita duplicar players!
// Os dados são sincronizados automaticamente por:
// 1. setupFirstPlayerInRoom() que faz upsertPlayer() quando cria a sala
// 2. startSync() que faz polling a cada 1.5s
// 3. Cada ação (createTask, completeTask, etc) que faz sync
function initSupabaseSync() {
    console.log('✅ Supabase já está inicializado via polling');
    // Não fazer nada aqui - evita duplicação de players
}

// Initialize on load
window.addEventListener('DOMContentLoaded', function() {
    init();
    // Não mais chamar initSupabaseSync() - sync já está ativo via startSync()
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
