/**
 * Gerenciador de Tarefas Recorrentes
 * Lida com repetição automática de tarefas (diária, semanal, mensal)
 */

/**
 * Verifica e recria tarefas recorrentes que foram completadas
 */
export function checkAndRecreateRecurringTasks() {
    const gameState = window.gameState || {};
    const tasks = gameState.tasks || [];
    const now = new Date();
    let recreatedCount = 0;

    tasks.forEach(task => {
        if (!task.recurrence || task.recurrence === 'none' || !task.completed) return;

        const lastCompleted = new Date(task.lastCompleted || task.createdAt);
        const hoursSinceCompleted = (now - lastCompleted) / (1000 * 60 * 60);

        // Verificar se já passou o tempo necessário para recriar
        let shouldRecreate = false;

        if (task.recurrence === 'daily' && hoursSinceCompleted >= 24) {
            shouldRecreate = true;
        } else if (task.recurrence === 'weekly' && hoursSinceCompleted >= 168) {
            shouldRecreate = true;
        } else if (task.recurrence === 'monthly' && hoursSinceCompleted >= 720) {
            shouldRecreate = true;
        }

        if (shouldRecreate) {
            // Marcar a tarefa original como não completada
            task.completed = false;
            task.completedBy = null;
            task.lastCompleted = now.toISOString();
            task.nextDue = calculateNextDueDate(task.recurrence, now).toISOString();
            recreatedCount++;
        }
    });

    if (recreatedCount > 0) {
        window.saveGame?.();
        console.log(`🔄 ${recreatedCount} tarefa(s) recorrente(s) recriada(s)`);
    }

    return recreatedCount;
}

/**
 * Calcula a próxima data de vencimento
 */
function calculateNextDueDate(recurrence, fromDate) {
    const nextDate = new Date(fromDate);

    switch (recurrence) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
    }

    return nextDate;
}

/**
 * Obtém label de recorrência
 */
export function getRecurrenceLabel(recurrence) {
    const labels = {
        none: '',
        daily: '📅 Diária',
        weekly: '📅 Semanal',
        monthly: '📅 Mensal'
    };
    return labels[recurrence] || '';
}

/**
 * Obtém emoji de recorrência
 */
export function getRecurrenceEmoji(recurrence) {
    const emojis = {
        none: '',
        daily: '🔁',
        weekly: '🔁',
        monthly: '🔁'
    };
    return emojis[recurrence] || '';
}

// Exportar para escopo global
window.checkAndRecreateRecurringTasks = checkAndRecreateRecurringTasks;
window.getRecurrenceLabel = getRecurrenceLabel;
window.getRecurrenceEmoji = getRecurrenceEmoji;
