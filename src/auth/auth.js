// 🔐 Sistema de Autenticação Simplificado
// Para uso exclusivo de Otávio e Camilla

let currentPlayer = null;

// Nomes fixos do casal - ALTERE AQUI SE PRECISAR
const PLAYER_NAMES = {
    player1: 'Otávio',
    player2: 'Camilla'
};

// Salvar player atual
function setCurrentPlayer(playerId, playerName) {
    currentPlayer = { id: playerId, name: playerName };
    localStorage.setItem('metasnenem_current_player_id', playerId);
    localStorage.setItem('metasnenem_current_player_name', playerName);
}

// Carregar player atual
function getCurrentPlayer() {
    if (!currentPlayer) {
        const id = localStorage.getItem('metasnenem_current_player_id');
        const name = localStorage.getItem('metasnenem_current_player_name');
        if (id && name) {
            currentPlayer = { id: parseInt(id), name };
        }
    }
    return currentPlayer;
}

// Limpar autenticação
function clearAuth() {
    currentPlayer = null;
    localStorage.removeItem('metasnenem_current_player_id');
    localStorage.removeItem('metasnenem_current_player_name');
}

// Autenticação simplificada - sem modais complexos
async function initializeAuth() {
    try {
        console.log('🔐 Iniciando autenticação simplificada...');

        // Verificar se já está autenticado
        const existingPlayer = getCurrentPlayer();
        if (existingPlayer) {
            console.log(`✅ Jogador já autenticado: ${existingPlayer.name}`);
            
            // Aplicar nomes fixos ao gameState
            if (gameState) {
                gameState.player1.name = PLAYER_NAMES.player1;
                gameState.player2.name = PLAYER_NAMES.player2;
            }
            
            // Sincronizar com Supabase se disponível
            await syncPlayerToSupabase(existingPlayer);
            
            return true;
        }

        // Mostrar modal simples de seleção
        return showSimplePlayerSelection();
    } catch (error) {
        console.error('❌ Erro em initializeAuth:', error);
        return false;
    }
}

// Sincronizar player com Supabase
async function syncPlayerToSupabase(player) {
    if (!player || !USE_SUPABASE || !supabase) {
        console.log('⚠️ Supabase não disponível, usando localStorage');
        return;
    }

    try {
        const roomId = typeof getRoomId === 'function' ? getRoomId() : null;
        if (!roomId) {
            console.log('⚠️ RoomId não disponível');
            return;
        }

        console.log(`🔄 Sincronizando ${player.name} com Supabase (room: ${roomId})`);

        // Atualizar nomes no gameState primeiro
        if (gameState) {
            gameState.player1.name = PLAYER_NAMES.player1;
            gameState.player2.name = PLAYER_NAMES.player2;
        }

        // Sincronizar ambos os players com Supabase
        await supabase.upsertPlayer(roomId, 1, {
            name: PLAYER_NAMES.player1,
            coins: gameState?.player1?.coins || 0,
            level: gameState?.player1?.level || 1,
            streak: gameState?.player1?.streak || 0,
            tasksCompleted: gameState?.player1?.tasksCompleted || 0,
            achievements: gameState?.player1?.achievements || [],
            lastActivityDate: gameState?.player1?.lastActivityDate
        });

        await supabase.upsertPlayer(roomId, 2, {
            name: PLAYER_NAMES.player2,
            coins: gameState?.player2?.coins || 0,
            level: gameState?.player2?.level || 1,
            streak: gameState?.player2?.streak || 0,
            tasksCompleted: gameState?.player2?.tasksCompleted || 0,
            achievements: gameState?.player2?.achievements || [],
            lastActivityDate: gameState?.player2?.lastActivityDate
        });

        console.log(`✅ ${player.name} sincronizado com Supabase`);
    } catch (error) {
        console.error('❌ Erro ao sincronizar com Supabase:', error);
    }
}

// Modal simples de seleção
function showSimplePlayerSelection() {
    return new Promise((resolve) => {
        try {
            // Criar modal dinamicamente
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.id = 'simpleAuthModal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px; text-align: center;">
                    <h2>👋 Quem é você?</h2>
                    <p style="color: #666; margin: 15px 0 25px;">Selecione seu nome para começar</p>
                    <div style="display: grid; gap: 12px;">
                        <button class="btn-primary" onclick="selectPlayerSimple(1, '${PLAYER_NAMES.player1}')" 
                                style="padding: 16px; font-size: 16px; font-weight: bold;">
                            👤 Eu sou ${PLAYER_NAMES.player1}
                        </button>
                        <button class="btn-primary" onclick="selectPlayerSimple(2, '${PLAYER_NAMES.player2}')" 
                                style="padding: 16px; font-size: 16px; font-weight: bold; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                            👤 Eu sou ${PLAYER_NAMES.player2}
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('show'), 10);

            // Função global para seleção
            window.selectPlayerSimple = async (id, name) => {
                setCurrentPlayer(id, name);
                
                // Aplicar nomes ao gameState
                if (gameState) {
                    gameState.player1.name = PLAYER_NAMES.player1;
                    gameState.player2.name = PLAYER_NAMES.player2;
                }
                
                // Sincronizar com Supabase
                await syncPlayerToSupabase({ id, name });
                
                modal.classList.remove('show');
                setTimeout(() => {
                    if (modal.parentNode) modal.parentNode.removeChild(modal);
                }, 300);
                
                resolve(true);
            };
        } catch (error) {
            console.error('❌ Erro ao mostrar seleção:', error);
            resolve(false);
        }
    });
}

// Exportar para escopo global
window.getCurrentPlayer = getCurrentPlayer;
window.setCurrentPlayer = setCurrentPlayer;
window.clearAuth = clearAuth;
window.PLAYER_NAMES = PLAYER_NAMES;
