/**
 * Sistema de Notificações em Tempo Real
 * Notifica quando o parceiro completa uma tarefa
 */

let notificationPermission = 'default';

/**
 * Solicita permissão para notificações do navegador
 */
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Navegador não suporta notificações');
        return false;
    }

    if (Notification.permission === 'granted') {
        notificationPermission = 'granted';
        return true;
    }

    try {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;
        return permission === 'granted';
    } catch (error) {
        console.error('Erro ao solicitar permissão:', error);
        return false;
    }
}

/**
 * Envia notificação visual quando parceiro completa tarefa
 */
function notifyTaskCompleted(taskDescription, partnerName, coins) {
    // Notificação visual no app (sempre mostrar)
    showInAppNotification(`${partnerName} completou "${taskDescription}" +${coins}⭐`);

    // Notificação do navegador (se permitido)
    if (notificationPermission === 'granted') {
        try {
            new Notification('💕 MetasNenem', {
                body: `${partnerName} completou uma tarefa!`,
                icon: '🎯',
                tag: 'task-completed-' + Date.now(),
                requireInteraction: false
            });
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
        }
    }
}

/**
 * Mostra notificação visual no app (toast melhorado)
 */
function showInAppNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'partner-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">💑</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Animação de entrada
    setTimeout(() => notification.classList.add('show'), 10);

    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

/**
 * Verifica se houve nova atividade do parceiro
 */
let lastKnownActivity = null;

function checkPartnerActivity(currentGameState, previousGameState) {
    if (!previousGameState || !currentGameState) return;

    // Verificar se tarefas foram completadas
    const currentTasks = currentGameState.tasks || [];
    const previousTasks = previousGameState.tasks || [];

    currentTasks.forEach(currentTask => {
        const previousTask = previousTasks.find(t => 
            (t.id === currentTask.id || t.supabaseId === currentTask.supabaseId)
        );

        // Se tarefa foi completada agora
        if (currentTask.completed && (!previousTask || !previousTask.completed)) {
            const currentPlayer = typeof getCurrentPlayer === 'function' ? getCurrentPlayer() : null;
            const partnerId = currentPlayer?.id === 1 ? 'player2' : 'player1';
            const partnerName = currentGameState[partnerId]?.name || 'Parceiro';

            // Só notificar se não foi o jogador atual que completou
            if (currentTask.completedBy !== `player${currentPlayer?.id}`) {
                notifyTaskCompleted(
                    currentTask.description,
                    partnerName,
                    currentTask.coins
                );
            }
        }
    });
}

// CSS para notificações
const style = document.createElement('style');
style.textContent = `
    .partner-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        z-index: 10000;
        transform: translateX(400px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 350px;
    }

    .partner-notification.show {
        transform: translateX(0);
        opacity: 1;
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .notification-icon {
        font-size: 24px;
    }

    .notification-message {
        flex: 1;
        font-size: 14px;
        line-height: 1.4;
        font-weight: 500;
    }

    .notification-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        transition: background 0.2s;
    }

    .notification-close:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    @media (max-width: 768px) {
        .partner-notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
        }
    }
`;
document.head.appendChild(style);

// Exportar funções para escopo global
window.requestNotificationPermission = requestNotificationPermission;
window.checkPartnerActivity = checkPartnerActivity;
window.notifyTaskCompleted = notifyTaskCompleted;
