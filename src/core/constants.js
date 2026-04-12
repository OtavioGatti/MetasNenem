/**
 * Constantes globais do sistema
 * Centraliza todos os valores fixos e configurações
 */

// Achievement Database
export const ACHIEVEMENTS_DB = {
    'first_task': { icon: '🎯', name: 'Primeira Tarefa', description: 'Complete sua primeira tarefa' },
    'level_5': { icon: '⭐', name: 'Nível 5', description: 'Alcance nível 5' },
    'level_10': { icon: '🌟', name: 'Nível 10', description: 'Alcance nível 10' },
    'streak_7': { icon: '🔥', name: 'Semana de Fogo', description: 'Mantenha 7 dias de streak' },
    'coins_100': { icon: '💰', name: 'Colecionador', description: 'Ganhe 100 moedas' },
    'coins_500': { icon: '💸', name: 'Milionário', description: 'Ganhe 500 moedas' },
    'challenge_5': { icon: '💑', name: 'Casal Dedicado', description: 'Complete 5 desafios de casal' },
    'team_player': { icon: '🤝', name: 'Team Player', description: 'Complete 10 tarefas compartilhadas' }
};

// Shop Items Database
export const SHOP_ITEMS = [
    { id: 1, name: '🍕 Pizza Night', description: 'Noite romantica com pizza', cost: 50, icon: '🍕' },
    { id: 2, name: '🎬 Cinema Data', description: 'Sessao de cinema ao lado dela/dele', cost: 40, icon: '🎬' },
    { id: 3, name: '💐 Flores', description: 'Um buque lindo de flores', cost: 30, icon: '💐' },
    { id: 4, name: '🎁 Presente Surpresa', description: 'Uma surpresa especial', cost: 60, icon: '🎁' },
    { id: 5, name: '🏖️ Viagem Fds', description: 'Uma viagem no proximo fim de semana', cost: 100, icon: '🏖️' },
    { id: 6, name: '💅 Spa Day', description: 'Dia de spa para relaxar', cost: 80, icon: '💅' },
    { id: 7, name: '🎵 Musica Ao Vivo', description: 'Show musical especial', cost: 70, icon: '🎵' },
    { id: 8, name: '🍽️ Jantar Gourmet', description: 'Jantar fine dining', cost: 90, icon: '🍽️' }
];

// Configurações do sistema
export const CONFIG = {
    SYNC_INTERVAL: 1500, // 1.5 segundos
    MAX_HISTORY_ITEMS: 50,
    PENDING_UPDATE_TIMEOUT: 15000, // 15 segundos
    PROCESSING_TIMEOUT: 500 // 500ms
};

// Task Types
export const TASK_TYPES = {
    PESSOAL: 'pessoal',
    CASAL: 'casal'
};

// Task Assigned To
export const TASK_ASSIGNED = {
    PLAYER1: 'player1',
    PLAYER2: 'player2',
    BOTH: 'both'
};

// Challenge Difficulty
export const CHALLENGE_DIFFICULTY = {
    FACIL: 'facil',
    MEDIO: 'medio',
    DIFICIL: 'dificil'
};

// Difficulty Emojis
export const DIFFICULTY_EMOJIS = {
    facil: '😊',
    medio: '😎',
    dificil: '🔥'
};
