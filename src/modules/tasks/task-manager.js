/**
 * Gerenciador de Tarefas
 * CRUD de tarefas, filtros e renderização
 */

import { getGameState, saveGame } from '../core/game-state.js';
import { getTaskActionId, escapeHtml, toSafeNumber, getPlayerNameByKey, matchesEntityId } from '../utils/helpers.js';
import { showToast } from '../ui/notifications.js';
import { closeModal } from '../ui/modals.js';
import { TASK_TYPES } from '../core/constants.js';

// Estado de listeners
let taskListenerAttached = false;
let processingTaskIds = new Set();

// Pending updates para race conditions
const pendingTaskUpdates = new Map();

/**
 * Rastreia atualização pendente de tarefa
 */
export function trackPendingTaskUpdate(task, updates) {
    const keys = [task.id, task.supabaseId]
        .filter(Boolean)
        .map(id => String(id));

    keys.forEach(key => pendingTaskUpdates.set(key, { ...updates }));
    setTimeout(() => {
        keys.forEach(key => pendingTaskUpdates.delete(key));
    }, 15000);
}

/**
 * Resolve atualização pendente
 */
export function resolvePendingTaskUpdate(task) {
    const keys = [task?.id, task?.supabaseId]
        .filter(Boolean)
        .map(id => String(id));

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

/**
 * Cria uma nova tarefa
 */
export function createTask(description, coins, type, currentPlayer) {
    if (!description || !description.trim()) {
        showToast('⚠️ Descreva a tarefa!');
        return null;
    }

    const gameState = getGameState();

    const task = {
        id: Date.now(),
        supabaseId: null,
        description: description.trim(),
        coins: Math.max(1, coins || 10),
        type: type || TASK_TYPES.PESSOAL,
        createdBy: currentPlayer ? `player${currentPlayer.id}` : null,
        completed: false,
        completedBy: null,
        createdAt: new Date().toISOString()
    };

    gameState.tasks.push(task);
    saveGame();

    console.log('📝 Tarefa criada:', task);

    return task;
}

/**
 * Completa uma tarefa
 */
export function completeTask(taskId, playerId, playerName) {
    const gameState = getGameState();
    const task = gameState.tasks.find(t => matchesEntityId(t, taskId));

    if (!task) {
        console.warn('Tarefa não encontrada para completar:', taskId);
        showToast('❌ Tarefa não encontrada');
        return false;
    }

    if (task.completed) {
        showToast('⚠️ Tarefa já foi completada');
        return false;
    }

    // Se for tarefa de casal
    if (task.type === TASK_TYPES.CASAL || playerId === 'both') {
        return completeCoupleTask(task, gameState);
    }

    // Tarefa pessoal
    return completePersonalTask(task, playerId, playerName, gameState);
}

/**
 * Completa tarefa de casal (ambos recebem)
 */
function completeCoupleTask(task, gameState) {
    task.completed = true;
    task.completedBy = 'both';

    // Ambos recebem coins
    gameState.player1.coins += task.coins;
    gameState.player2.coins += task.coins;
    gameState.player1.tasksCompleted += 1;
    gameState.player2.tasksCompleted += 1;

    gameState.stats.sharedTasksCompleted.player1 += 1;
    gameState.stats.sharedTasksCompleted.player2 += 1;

    saveGame();

    // Retornar dados para sincronização
    return {
        task,
        bothPlayers: true,
        player1Coins: gameState.player1.coins,
        player2Coins: gameState.player2.coins,
        player1TasksCompleted: gameState.player1.tasksCompleted,
        player2TasksCompleted: gameState.player2.tasksCompleted
    };
}

/**
 * Completa tarefa pessoal
 */
function completePersonalTask(task, playerId, playerName, gameState) {
    const player = gameState[playerId];
    
    if (!player) {
        console.error('Jogador não encontrado:', playerId);
        return false;
    }

    task.completed = true;
    task.completedBy = playerId;

    player.coins += task.coins;
    player.tasksCompleted += 1;

    saveGame();

    return {
        task,
        bothPlayers: false,
        playerId,
        coins: player.coins,
        tasksCompleted: player.tasksCompleted
    };
}

/**
 * Deleta uma tarefa
 */
export function deleteTask(taskId) {
    const gameState = getGameState();
    const task = gameState.tasks.find(t => matchesEntityId(t, taskId));

    if (!task) {
        showToast('❌ Tarefa não encontrada');
        return false;
    }

    gameState.tasks = gameState.tasks.filter(t => !matchesEntityId(t, taskId));
    saveGame();

    return task;
}

/**
 * Filtra tarefas baseado no jogador e filtro selecionado
 */
export function filterTasks(currentPlayer, filterType) {
    const gameState = getGameState();
    let tasks = [...gameState.tasks];

    // Filtrar baseado no jogador autenticado
    if (currentPlayer) {
        const playerKey = `player${currentPlayer.id}`;
        tasks = tasks.filter(t => {
            // Tarefas de casal: mostrar todas
            if (t.type === TASK_TYPES.CASAL) {
                return true;
            }
            // Tarefas pessoais: mostrar apenas as criadas pelo jogador ou completadas por ele
            if (t.type === TASK_TYPES.PESSOAL) {
                return t.createdBy === playerKey || t.completedBy === playerKey;
            }
            return true;
        });
    }

    // Aplicar filtro de tipo
    if (filterType === TASK_TYPES.PESSOAL) {
        tasks = tasks.filter(t => t.type === TASK_TYPES.PESSOAL);
    } else if (filterType === TASK_TYPES.CASAL) {
        tasks = tasks.filter(t => t.type === TASK_TYPES.CASAL);
    } else if (filterType === 'concluido') {
        tasks = tasks.filter(t => t.completed);
    }

    return tasks;
}

/**
 * Busca tarefas por descrição
 */
export function searchTasks(query, tasks) {
    if (!query || !query.trim()) return tasks;
    
    const searchQuery = query.toLowerCase().trim();
    return tasks.filter(t => 
        t.description.toLowerCase().includes(searchQuery)
    );
}

/**
 * Renderiza botões de conclusão de tarefa
 */
export function renderTaskCompletionButtons(task) {
    if (task.completed) {
        if (task.completedBy === 'both') {
            return `<span style="color: green; font-weight: bold;">Feito pelo casal 💑</span>`;
        }
        const completedByName = task.completedBy ? getPlayerNameByKey(task.completedBy, getGameState()) : '';
        const label = completedByName ? ` por ${completedByName}` : '';
        return `<span style="color: green; font-weight: bold;">Feito${label}</span>`;
    }

    const actionId = getTaskActionId(task);

    // Para tarefa de casal, mostrar apenas um botão "Completar"
    if (task.type === TASK_TYPES.CASAL) {
        return `
            <button class="btn-small btn-check" data-task-id="${actionId}" data-player-id="both" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                Completar 💑
            </button>
        `;
    }

    // Para tarefa pessoal
    return `
        <button class="btn-small btn-check" data-task-id="${actionId}" data-player-id="${task.createdBy}">
            ${getPlayerNameByKey(task.createdBy || 'player1', getGameState())}
        </button>
    `;
}

/**
 * Renderiza lista de tarefas
 */
export function renderTasks() {
    const gameState = getGameState();
    const tasksList = document.getElementById('tasks-list');
    
    if (!tasksList) {
        console.warn('Elemento tasks-list não encontrado');
        return;
    }

    const tasks = filterTasks(
        window.getCurrentPlayer ? window.getCurrentPlayer() : null,
        gameState.filter
    );

    if (tasks.length === 0) {
        tasksList.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Nenhuma tarefa encontrada</p>';
        return;
    }

    tasksList.innerHTML = tasks.map(task => {
        const actionId = getTaskActionId(task);
        const type = task.type === TASK_TYPES.CASAL ? 'casal' : 'pessoal';
        const typeLabel = type === 'casal' ? 'Casal' : 'Pessoal';
        const coins = toSafeNumber(task.coins, 0);

        return `
        <div class="task-card ${task.completed ? 'concluido' : ''}">
            <div class="task-header">
                <span class="task-type ${type}">${typeLabel}</span>
            </div>
            <div class="task-description">${escapeHtml(task.description)}</div>
            <div class="task-footer">
                <span class="task-coins">${coins}⭐</span>
                <div class="task-actions">
                    ${renderTaskCompletionButtons(task)}
                    <button class="btn-small btn-delete" data-task-id="${actionId}">🗑️</button>
                </div>
            </div>
        </div>
    `;
    }).join('');

    // Adicionar event listeners
    addTaskEventListeners();
}

/**
 * Adiciona event listeners para tarefas
 */
export function addTaskEventListeners() {
    if (taskListenerAttached) return;

    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;

    tasksList.addEventListener('click', function(e) {
        // Botão de completar
        const checkBtn = e.target.closest('button.btn-check[data-task-id][data-player-id]');
        if (checkBtn) {
            handleCompleteTask(checkBtn);
            return;
        }

        // Botão de deletar
        const deleteBtn = e.target.closest('button.btn-delete[data-task-id]');
        if (deleteBtn) {
            handleDeleteTask(deleteBtn);
            return;
        }
    });

    taskListenerAttached = true;
}

/**
 * Handler para completar tarefa
 */
async function handleCompleteTask(button) {
    const taskId = String(button.getAttribute('data-task-id'));
    const playerIdAttr = button.getAttribute('data-player-id');

    // Verificar se é 'both' ou um número
    let playerId;
    let playerKey;
    let playerName;

    if (playerIdAttr === 'both') {
        playerId = 'both';
        playerKey = 'both';
        const gameState = getGameState();
        playerName = `${gameState.player1.name} e ${gameState.player2.name}`;
    } else {
        playerId = parseInt(playerIdAttr);
        playerKey = `player${playerId}`;
        const gameState = getGameState();
        playerName = gameState[playerKey]?.name || 'Jogador';
    }

    // Evitar múltiplos cliques
    if (processingTaskIds.has(taskId)) {
        console.log('⚠️ Tarefa já está sendo processada:', taskId);
        return;
    }

    processingTaskIds.add(taskId);
    button.disabled = true;

    console.log('🖱️ Tarefa completada:', { taskId, playerId, playerKey, playerName });
    
    // Disparar evento para o módulo principal
    window.dispatchEvent(new CustomEvent('task:completed', {
        detail: { taskId, playerKey, playerName }
    }));

    setTimeout(() => processingTaskIds.delete(taskId), 500);
}

/**
 * Handler para deletar tarefa
 */
async function handleDeleteTask(button) {
    const taskId = String(button.getAttribute('data-task-id'));

    // Confirmar antes de deletar
    const confirmed = await window.showConfirmation?.('Tem certeza que deseja excluir esta tarefa?');
    
    if (!confirmed) return;

    console.log('🗑️ Tarefa deletada:', taskId);
    
    window.dispatchEvent(new CustomEvent('task:deleted', {
        detail: { taskId }
    }));
}

/**
 * Reseta estado dos listeners
 */
export function resetTaskListeners() {
    taskListenerAttached = false;
    processingTaskIds.clear();
}
