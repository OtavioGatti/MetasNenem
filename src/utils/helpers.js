/**
 * Funções utilitárias globais
 * Helpers para manipulação de dados, segurança e formatação
 */

/**
 * Normaliza um ID de entidade para string
 */
export function normalizeEntityId(id) {
    if (id === null || id === undefined) return null;
    return String(id);
}

/**
 * Verifica se uma entidade corresponde a um ID
 */
export function matchesEntityId(entity, id) {
    const normalizedId = normalizeEntityId(id);
    if (!normalizedId || !entity) return false;

    return normalizeEntityId(entity.id) === normalizedId ||
        normalizeEntityId(entity.supabaseId) === normalizedId;
}

/**
 * Escapa caracteres HTML para prevenir XSS
 */
export function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Converte valor para número seguro
 */
export function toSafeNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

/**
 * Obtém o nome do jogador pela chave
 */
export function getPlayerNameByKey(playerKey, gameState) {
    return escapeHtml(gameState[playerKey]?.name || playerKey);
}

/**
 * Obtém o ID de ação de uma tarefa
 */
export function getTaskActionId(task) {
    return escapeHtml(task.supabaseId || task.id);
}

/**
 * Verifica se uma entidade local é recente (criada nos últimos 30s)
 */
export function isRecentLocalEntity(entity, maxAgeMs = 30000) {
    if (entity?.supabaseId) return false;
    const createdAt = new Date(entity?.createdAt || 0).getTime();
    return Number.isFinite(createdAt) && Date.now() - createdAt < maxAgeMs;
}

/**
 * Formata data ISO para exibição legível
 */
export function formatDate(isoString) {
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

/**
 * Obtém emoji de dificuldade
 */
export function getDifficultyEmoji(difficulty) {
    const emojis = { facil: '😊', medio: '😎', dificil: '🔥' };
    return emojis[difficulty] || '📌';
}

/**
 * Debounce - limita execuções de função
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Gera um ID único para sala
 */
export function generateRoomId(prefix = 'metasnenem') {
    return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
}
