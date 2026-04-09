// 🔐 Sistema de Autenticação e Players

let currentPlayer = null; // { id: 1 ou 2, name: 'Você' ou 'Namorada' }

// Salvar player atual no localStorage
function setCurrentPlayer(playerId, playerName) {
    currentPlayer = { id: playerId, name: playerName };
    localStorage.setItem('metasnenem_current_player_id', playerId);
    localStorage.setItem('metasnenem_current_player_name', playerName);
}

// Carregar player atual do localStorage
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

// Obter dados completos do jogador autenticado
function getAuthenticatedPlayer() {
    const player = getCurrentPlayer();
    if (!player) return null;
    return player.id === 1 ? gameState.player1 : gameState.player2;
}

// Limpar autenticação
function clearAuth() {
    currentPlayer = null;
    localStorage.removeItem('metasnenem_current_player_id');
    localStorage.removeItem('metasnenem_current_player_name');
}

// Setup da primeira vez (criar sala e pedir nomes)
async function setupFirstPlayerInRoom() {
    return new Promise((resolve) => {
        const modal = document.getElementById('setupPlayersModal');
        if (!modal) {
            console.error('Modal setupPlayersModal não encontrado');
            resolve(false);
            return;
        }

        modal.classList.add('show');

        // Click no botão "Confirmar nomes"
        const confirmBtn = document.getElementById('confirmPlayersBtn');
        confirmBtn.onclick = () => {
            const player1Name = document.getElementById('player1NameInput').value.trim();
            const player2Name = document.getElementById('player2NameInput').value.trim();

            if (!player1Name || !player2Name) {
                alert('⚠️ Digite os nomes de ambos os jogadores!');
                return;
            }

            // Salvar nomes
            gameState.player1.name = player1Name;
            gameState.player2.name = player2Name;
            saveGame();

            // Sincronizar com Supabase imediatamente
            if (USE_SUPABASE && supabase) {
                const roomId = getRoomId();
                supabase.upsertPlayer(roomId, 1, gameState.player1).catch(e => console.error('Erro ao criar player1:', e));
                supabase.upsertPlayer(roomId, 2, gameState.player2).catch(e => console.error('Erro ao criar player2:', e));
            }

            // Você é sempre player 1
            setCurrentPlayer(1, player1Name);

            modal.classList.remove('show');
            resolve(true);
        };
    });
}

// Pedir qual jogador é (quando sala já existe)
async function selectPlayerInExistingRoom() {
    return new Promise((resolve) => {
        const modal = document.getElementById('selectPlayerModal');
        if (!modal) {
            console.error('Modal selectPlayerModal não encontrado');
            resolve(false);
            return;
        }

        // Buscar nomes dos players no gameState (vindo do Supabase)
        const names = [gameState.player1.name, gameState.player2.name];
        
        modal.classList.add('show');

        // Atualizar nomes na modal
        document.getElementById('player1Option').textContent = `👤 ${names[0]} (Você)`;
        document.getElementById('selectPlayer2Option').textContent = `👤 ${names[1]} (Você)`;

        // Click nos botões
        document.getElementById('selectPlayer1Btn').onclick = () => {
            setCurrentPlayer(1, names[0]);
            modal.classList.remove('show');
            resolve(true);
        };

        document.getElementById('selectPlayer2Btn').onclick = () => {
            setCurrentPlayer(2, names[1]);
            modal.classList.remove('show');
            resolve(true);
        };
    });
}

// Pedir autenticação quando inicializa
async function initializeAuth() {
    const roomId = getRoomId();
    
    // 1. Verificar se jogador já está autenticado
    const existingPlayer = getCurrentPlayer();
    if (existingPlayer) {
        console.log(`✅ Jogador autenticado: ${existingPlayer.name} (${existingPlayer.id})`);
        return true;
    }

    // 2. Buscar players do Supabase para esta sala
    if (USE_SUPABASE && supabase) {
        try {
            const players = await supabase.getPlayers(roomId);
            
            if (players.length === 0) {
                // Primeira vez nesta sala
                console.log('🆕 Primeira vez nesta sala, pedindo nomes...');
                await setupFirstPlayerInRoom();
            } else if (players.length >= 2) {
                // Sala já tem 2 players, pedir qual é
                console.log('👥 Sala já tem players, pedindo confirmação...');
                await selectPlayerInExistingRoom();
            } else {
                // Sala tem 1 player, novato
                console.log('➕ Entrando em sala existente...');
                await selectPlayerInExistingRoom();
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao verificar players:', error);
            // Fallback: pedir nomes mesmo assim
            await setupFirstPlayerInRoom();
            return true;
        }
    } else {
        // Modo local, pedir nomes
        await setupFirstPlayerInRoom();
        return true;
    }
}

// Logout (para trocar de jogador)
function logoutPlayer() {
    if (confirm('⚠️ Tem certeza que quer trocar de jogador?')) {
        clearAuth();
        location.reload();
    }
}
