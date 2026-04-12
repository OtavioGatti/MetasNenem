/**
 * Estado do Jogo
 * Gerencia o estado global e persistência local
 */

import { toSafeNumber } from '../utils/helpers.js';

// Estado inicial padrão
const DEFAULT_GAME_STATE = {
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
    purchases: {
        player1: [],
        player2: []
    },
    stats: {
        challengesCompleted: 0,
        sharedTasksCompleted: {
            player1: 0,
            player2: 0
        }
    },
    filter: 'all'
};

// Estado global do jogo
let gameState = { ...DEFAULT_GAME_STATE };

/**
 * Obtém o estado do jogo
 */
export function getGameState() {
    return gameState;
}

/**
 * Define o estado do jogo
 */
export function setGameState(newState) {
    gameState = newState;
}

/**
 * Reseta o estado do jogo para o padrão
 */
export function resetGameState() {
    gameState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
    return gameState;
}

/**
 * Normaliza a estrutura do estado do jogo
 * Garante que todos os campos necessários existam
 */
export function normalizeGameStateShape() {
    gameState.tasks = Array.isArray(gameState.tasks) ? gameState.tasks : [];
    gameState.challenges = Array.isArray(gameState.challenges) ? gameState.challenges : [];
    gameState.history = Array.isArray(gameState.history) ? gameState.history : [];
    gameState.purchases = gameState.purchases || {};
    gameState.purchases.player1 = Array.isArray(gameState.purchases.player1) ? gameState.purchases.player1 : [];
    gameState.purchases.player2 = Array.isArray(gameState.purchases.player2) ? gameState.purchases.player2 : [];
    gameState.stats = gameState.stats || {};
    gameState.stats.challengesCompleted = toSafeNumber(gameState.stats.challengesCompleted, 0);
    gameState.stats.sharedTasksCompleted = gameState.stats.sharedTasksCompleted || {};
    gameState.stats.sharedTasksCompleted.player1 = toSafeNumber(gameState.stats.sharedTasksCompleted.player1, 0);
    gameState.stats.sharedTasksCompleted.player2 = toSafeNumber(gameState.stats.sharedTasksCompleted.player2, 0);
}

/**
 * Carrega o jogo do localStorage
 */
export function loadGame() {
    const saved = localStorage.getItem('metasNenemGame');
    if (saved) {
        try {
            gameState = JSON.parse(saved);
        } catch (error) {
            console.error('Erro ao carregar jogo:', error);
            gameState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
        }
    }
    normalizeGameStateShape();
    return gameState;
}

/**
 * Salva o jogo no localStorage
 */
export function saveGame() {
    normalizeGameStateShape();
    localStorage.setItem('metasNenemGame', JSON.stringify(gameState));
}

/**
 * Importa estado de um JSON
 */
export function importGameState(jsonString) {
    try {
        const imported = JSON.parse(jsonString);
        gameState = imported;
        normalizeGameStateShape();
        saveGame();
        return { success: true, message: '✅ Dados importados com sucesso!' };
    } catch (error) {
        return { success: false, message: '❌ Erro ao importar: arquivo inválido' };
    }
}

/**
 * Exporta estado como JSON
 */
export function exportGameState() {
    normalizeGameStateShape();
    const dataStr = JSON.stringify(gameState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metasnenem-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}
