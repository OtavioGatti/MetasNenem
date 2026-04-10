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
        try {
            const modal = document.getElementById('setupPlayersModal');
            if (!modal) {
                console.error('❌ Modal setupPlayersModal não encontrado');
                alert('❌ Erro ao carregar modal de setup');
                resolve(false);
                return;
            }

            modal.classList.add('show');

            // Click no botão "Confirmar nomes"
            const confirmBtn = document.getElementById('confirmPlayersBtn');
            if (!confirmBtn) {
                console.error('❌ Botão confirmPlayersBtn não encontrado');
                resolve(false);
                return;
            }

            confirmBtn.onclick = () => {
                try {
                    const input1 = document.getElementById('player1NameInput');
                    const input2 = document.getElementById('player2NameInput');
                    
                    if (!input1 || !input2) {
                        alert('❌ Campos de entrada não encontrados');
                        return;
                    }

                    const player1Name = input1.value.trim();
                    const player2Name = input2.value.trim();

                    if (!player1Name || !player2Name) {
                        alert('⚠️ Digite os nomes de ambos os jogadores!');
                        return;
                    }

                    // Salvar nomes
                    if (!gameState) {
                        console.error('❌ gameState não está pronto');
                        alert('❌ Erro: gameState não está pronto');
                        return;
                    }

                    gameState.player1.name = player1Name;
                    gameState.player2.name = player2Name;
                    saveGame();

                    // Sincronizar com Supabase imediatamente
                    if (USE_SUPABASE && supabase) {
                        const roomId = getRoomId?.();
                        if (roomId) {
                            supabase.upsertPlayer(roomId, 1, gameState.player1).catch(e => console.error('❌ Erro ao criar player1:', e));
                            supabase.upsertPlayer(roomId, 2, gameState.player2).catch(e => console.error('❌ Erro ao criar player2:', e));
                        }
                    }

                    // Você é sempre player 1
                    setCurrentPlayer(1, player1Name);

                    modal.classList.remove('show');
                    resolve(true);
                } catch (error) {
                    console.error('❌ Erro ao confirmar nomes:', error);
                    alert('❌ Erro ao confirmar nomes');
                    resolve(false);
                }
            };
        } catch (error) {
            console.error('❌ Erro em setupFirstPlayerInRoom:', error);
            resolve(false);
        }
    });
}

// Pedir qual jogador é (quando sala já existe)
async function selectPlayerInExistingRoom() {
    return new Promise((resolve) => {
        try {
            const modal = document.getElementById('selectPlayerModal');
            if (!modal) {
                console.error('❌ Modal selectPlayerModal não encontrado');
                resolve(false);
                return;
            }

            // Verificar se gameState existe e tem nomes
            if (!gameState || !gameState.player1 || !gameState.player2) {
                console.error('❌ gameState não está pronto:', gameState);
                resolve(false);
                return;
            }

            const names = [gameState.player1.name || 'Jogador 1', gameState.player2.name || 'Jogador 2'];
            
            modal.classList.add('show');

            // Atualizar nomes na modal com proteção
            const p1Btn = document.getElementById('player1Option');
            const p2Btn = document.getElementById('selectPlayer2Option');
            
            if (!p1Btn || !p2Btn) {
                console.error('❌ Botões da modal não encontrados');
                resolve(false);
                return;
            }

            // Atualizar com os NOMES REAIS (não genéricos)
            p1Btn.textContent = `👤 Eu sou ${names[0]}`;
            p2Btn.textContent = `👤 Eu sou ${names[1]}`;

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
        } catch (error) {
            console.error('❌ Erro em selectPlayerInExistingRoom:', error);
            resolve(false);
        }
    });
}

// Pedir autenticação quando inicializa
async function initializeAuth() {
    try {
        console.log('🔐 Iniciando autenticação...');
        
        const roomIdFn = window.getRoomId;
        if (typeof roomIdFn !== 'function') {
            console.error('❌ getRoomId não está disponível');
            return false;
        }
        
        const roomId = roomIdFn();
        console.log('Room ID:', roomId);
        
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
                console.log('📌 Players encontrados no Supabase:', players.length);
                
                if (players.length === 0) {
                    // Primeira vez nesta sala
                    console.log('🆕 Primeira vez nesta sala, pedindo nomes...');
                    const result = await setupFirstPlayerInRoom();
                    return result;
                } else if (players.length >= 2) {
                    // Sala já tem 2 players, pedir qual é
                    console.log('👥 Sala já tem 2 players, pedindo confirmação...');
                    const result = await selectPlayerInExistingRoom();
                    return result;
                } else {
                    // Sala tem 1 player, o novo entra
                    console.log('➕ Entrando em sala existente...');
                    const result = await selectPlayerInExistingRoom();
                    return result;
                }
            } catch (error) {
                console.error('❌ Erro ao verificar players no Supabase:', error);
                // Fallback: pedir nomes mesmo assim
                const result = await setupFirstPlayerInRoom();
                return result;
            }
        } else {
            // Modo local, pedir nomes
            console.log('📱 Modo local: Pedindo nomes...');
            const result = await setupFirstPlayerInRoom();
            return result;
        }
    } catch (error) {
        console.error('❌ Erro fatal em initializeAuth:', error);
        return false;
    }
}

// Logout (para trocar de jogador)
function logoutPlayer() {
    if (confirm('⚠️ Tem certeza que quer trocar de jogador?')) {
        clearAuth();
        location.reload();
    }
}
