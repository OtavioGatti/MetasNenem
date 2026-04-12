/**
 * Ponto de entrada principal da aplicação
 * Inicializa e coordena todos os módulos
 */

import { loadGame, saveGame, resetGameState, getGameState } from '../core/game-state.js';
import { showToast } from '../ui/notifications.js';
import { initModalHandlers, closeModal } from '../ui/modals.js';
import { createTask, completeTask, deleteTask, renderTasks } from '../modules/tasks/task-manager.js';

// Inicialização da aplicação
async function init() {
    console.log('🚀 Iniciando MetasNenem...');

    try {
        // Carregar jogo
        loadGame();
        console.log('✅ Jogo carregado');

        // Inicializar handlers de modal
        initModalHandlers();
        console.log('✅ Modais inicializados');

        // Autenticar jogador (se módulo de auth estiver disponível)
        if (window.initializeAuth) {
            await window.initializeAuth();
            console.log('✅ Autenticação concluída');
        }

        // Configurar UI da sala
        if (window.setupRoomUI) {
            window.setupRoomUI();
            console.log('✅ UI da sala configurada');
        }

        // Renderizar tudo
        if (window.renderAll) {
            window.renderAll();
            console.log('✅ UI renderizada');
        }

        // Verificar streak diário
        if (window.checkDailyStreak) {
            window.checkDailyStreak();
            console.log('✅ Streak verificado');
        }

        // Iniciar sincronização
        if (window.startSync) {
            window.startSync();
            console.log('✅ Sincronização iniciada');
        }

        console.log('🎉 MetasNenem iniciado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
        showToast('❌ Erro ao inicializar o app');
    }
}

// Salvar ao mudar visibilidade
document.addEventListener('visibilitychange', () => {
    saveGame();
    if (document.visibilityState === 'hidden') {
        if (window.stopSync) window.stopSync();
    } else {
        if (window.startSync) window.startSync();
    }
});

// Event listeners globais
window.addEventListener('task:completed', async (event) => {
    const { taskId, playerKey, playerName } = event.detail;
    const result = completeTask(taskId, playerKey, playerName);

    if (result) {
        // Atualizar levels e streaks
        if (result.bothPlayers) {
            if (window.updateLevel) {
                window.updateLevel('player1');
                window.updateLevel('player2');
            }
            if (window.updateStreak) {
                window.updateStreak('player1');
                window.updateStreak('player2');
            }
            if (window.checkAchievements) {
                window.checkAchievements('player1');
                window.checkAchievements('player2');
            }

            const gameState = getGameState();
            if (window.addHistory) {
                window.addHistory(`💑 ${gameState.player1.name} e ${gameState.player2.name} completaram "${result.task.description}" +${result.task.coins}⭐ cada`);
            }

            if (window.syncToCloud) window.syncToCloud();
            renderTasks();
            window.renderPlayers?.();
            showToast(`🎉 Tarefa de casal completada! +${result.task.coins}⭐ para cada!`);
        } else {
            const player = getGameState()[playerKey];
            if (window.updateLevel) window.updateLevel(playerKey);
            if (window.updateStreak) window.updateStreak(playerKey);
            if (window.checkAchievements) window.checkAchievements(playerKey);

            if (window.addHistory) {
                window.addHistory(`${playerName} completou "${result.task.description}" +${result.task.coins}⭐`);
            }

            if (window.syncToCloud) window.syncToCloud();
            renderTasks();
            window.renderPlayers?.();
            showToast(`🎉 ${playerName} ganhou ${result.task.coins} moedas!`);
        }
    }
});

window.addEventListener('task:deleted', async (event) => {
    const { taskId } = event.detail;
    const task = deleteTask(taskId);

    if (task) {
        // Sincronizar com Supabase se disponível
        if (window.USE_SUPABASE && window.supabase) {
            const taskIdToDelete = task.supabaseId || task.id;
            window.supabase.deleteTask(taskIdToDelete)
                .then(() => console.log('✅ Tarefa apagada do Supabase'))
                .catch(err => console.error('❌ ERRO ao deletar tarefa:', err));
        }

        renderTasks();
        showToast('🗑️ Tarefa removida');
    }
});

// Inicializar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
