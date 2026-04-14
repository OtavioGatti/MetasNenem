/**
 * Gerenciador de Categorias e Tags
 * Permite organizar tarefas por tags e filtrar por elas
 */

/**
 * Obtém todas as tags únicas do sistema
 */
function getAllTags() {
    const gameState = window.gameState || {};
    const tasks = gameState.tasks || [];
    const tags = new Set();

    tasks.forEach(task => {
        if (task.tags && Array.isArray(task.tags)) {
            task.tags.forEach(tag => tags.add(tag.toLowerCase()));
        }
    });

    return Array.from(tags).sort();
}

/**
 * Filtra tarefas por tag
 */
function filterTasksByTag(tasks, selectedTag) {
    if (!selectedTag || selectedTag === 'all') return tasks;

    return tasks.filter(task => {
        if (!task.tags || !Array.isArray(task.tags)) return false;
        return task.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase());
    });
}

/**
 * Renderiza badges de tags em um card de tarefa
 */
function renderTaskTags(task) {
    if (!task.tags || !Array.isArray(task.tags) || task.tags.length === 0) return '';

    return task.tags.map(tag => 
        `<span class="task-tag">${escapeHtml(tag)}</span>`
    ).join('');
}

/**
 * Escapa HTML para segurança
 */
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Exportar para escopo global
window.getAllTags = getAllTags;
window.filterTasksByTag = filterTasksByTag;
window.renderTaskTags = renderTaskTags;
