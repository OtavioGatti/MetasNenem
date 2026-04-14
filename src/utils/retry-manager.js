/**
 * Retry Automático para Sincronização
 * Implementa retry com backoff exponencial para operações do Supabase
 */

const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 segundo
const MAX_DELAY = 10000; // 10 segundos

/**
 * Executa uma função com retry automático
 * @param {Function} fn - Função async a ser executada
 * @param {string} context - Contexto da operação (para logs)
 * @param {number} maxRetries - Número máximo de tentativas
 * @returns {Promise<any>} Resultado da operação
 */
async function withRetry(fn, context = 'Operação', maxRetries = MAX_RETRIES) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await fn();
            
            if (attempt > 1) {
                console.log(`✅ ${context} sucesso após ${attempt} tentativas`);
            }
            
            return result;
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ Tentativa ${attempt}/${maxRetries} falhou para ${context}:`, error.message);

            // Se não é a última tentativa, espera antes de retry
            if (attempt < maxRetries) {
                const delay = calculateBackoff(attempt);
                console.log(`⏳ Aguardando ${delay}ms antes de retry...`);
                await sleep(delay);
            }
        }
    }

    // Todas as tentativas falharam
    console.error(`❌ ${context} falhou após ${maxRetries} tentativas`);
    throw lastError;
}

/**
 * Calcula o delay com backoff exponencial + jitter
 */
function calculateBackoff(attempt) {
    // Backoff exponencial: 1s, 2s, 4s, 8s...
    const exponentialDelay = BASE_DELAY * Math.pow(2, attempt - 1);
    
    // Limitar ao delay máximo
    const cappedDelay = Math.min(exponentialDelay, MAX_DELAY);
    
    // Adicionar jitter (variação aleatória de até 20%)
    const jitter = cappedDelay * 0.2 * Math.random();
    
    return Math.floor(cappedDelay + jitter);
}

/**
 * Sleep helper
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wrapper para operações do Supabase com retry
 */
function createSupabaseWrapper(supabaseInstance) {
    if (!supabaseInstance) {
        return null;
    }

    const originalMethods = { ...supabaseInstance };

    return {
        ...originalMethods,
        
        createTask: async (roomId, taskData) => {
            return withRetry(
                () => originalMethods.createTask(roomId, taskData),
                'Criar tarefa'
            );
        },

        updateTask: async (taskId, updates) => {
            return withRetry(
                () => originalMethods.updateTask(taskId, updates),
                'Atualizar tarefa'
            );
        },

        deleteTask: async (taskId) => {
            return withRetry(
                () => originalMethods.deleteTask(taskId),
                'Deletar tarefa'
            );
        },

        createChallenge: async (roomId, challengeData) => {
            return withRetry(
                () => originalMethods.createChallenge(roomId, challengeData),
                'Criar desafio'
            );
        },

        updateChallenge: async (challengeId, updates) => {
            return withRetry(
                () => originalMethods.updateChallenge(challengeId, updates),
                'Atualizar desafio'
            );
        },

        updatePlayer: async (roomId, playerNumber, updates) => {
            return withRetry(
                () => originalMethods.updatePlayer(roomId, playerNumber, updates),
                'Atualizar jogador'
            );
        },

        addHistory: async (roomId, action) => {
            return withRetry(
                () => originalMethods.addHistory(roomId, action),
                'Adicionar ao histórico',
                2 // Menos retries para histórico (não crítico)
            );
        },

        getPlayers: async (roomId) => {
            return withRetry(
                () => originalMethods.getPlayers(roomId),
                'Buscar jogadores'
            );
        },

        getTasks: async (roomId) => {
            return withRetry(
                () => originalMethods.getTasks(roomId),
                'Buscar tarefas'
            );
        },

        getChallenges: async (roomId) => {
            return withRetry(
                () => originalMethods.getChallenges(roomId),
                'Buscar desafios'
            );
        },

        getHistory: async (roomId) => {
            return withRetry(
                () => originalMethods.getHistory(roomId),
                'Buscar histórico'
            );
        }
    };
}

// Exportar para escopo global
window.withRetry = withRetry;
window.createSupabaseWrapper = createSupabaseWrapper;
