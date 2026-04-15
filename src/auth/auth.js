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
            
            return true;
        }

        // Mostrar modal simples de seleção
        return showSimplePlayerSelection();
    } catch (error) {
        console.error('❌ Erro em initializeAuth:', error);
        return false;
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
            window.selectPlayerSimple = (id, name) => {
                setCurrentPlayer(id, name);
                
                // Aplicar nomes ao gameState
                if (gameState) {
                    gameState.player1.name = PLAYER_NAMES.player1;
                    gameState.player2.name = PLAYER_NAMES.player2;
                }
                
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
