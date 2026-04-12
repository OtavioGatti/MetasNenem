// 🔍 Script de Diagnóstico Completo

console.log('='.repeat(60));
console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO');
console.log('='.repeat(60));

// 1. Verificar se os arquivos foram carregados
console.log('\n📦 VERIFICAÇÃO DE ARQUIVOS CARREGADOS:');
console.log('config.js carregado?', typeof SUPABASE_URL !== 'undefined' ? '✅' : '❌');
console.log('supabase.js carregado?', typeof SupabaseManager !== 'undefined' ? '✅' : '❌');
console.log('auth.js carregado?', typeof getCurrentPlayer !== 'undefined' ? '✅' : '❌');
console.log('script.js carregado?', typeof createTask !== 'undefined' ? '✅' : '❌');

// 2. Verificar sintaxe dos arquivos
console.log('\n🔧 VERIFICAÇÃO DE SINTAXE:');
const filesCheck = {
    'config.js': () => {
        try {
            if (!SUPABASE_URL) throw new Error('SUPABASE_URL não definido');
            if (!SUPABASE_KEY) throw new Error('SUPABASE_KEY não definido');
            return 'OK';
        } catch (e) {
            return 'ERRO: ' + e.message;
        }
    },
    'supabase.js': () => {
        try {
            if (!SupabaseManager) throw new Error('SupabaseManager não definido');
            if (!supabase) throw new Error('supabase não inicializado');
            return 'OK';
        } catch (e) {
            return 'ERRO: ' + e.message;
        }
    },
    'auth.js': () => {
        try {
            if (typeof getCurrentPlayer !== 'function') throw new Error('getCurrentPlayer não é função');
            if (typeof initializeAuth !== 'function') throw new Error('initializeAuth não é função');
            return 'OK';
        } catch (e) {
            return 'ERRO: ' + e.message;
        }
    },
    'script.js': () => {
        try {
            if (typeof createTask !== 'function') throw new Error('createTask não é função');
            if (typeof gameState === 'undefined') throw new Error('gameState não definido');
            return 'OK';
        } catch (e) {
            return 'ERRO: ' + e.message;
        }
    }
};

Object.entries(filesCheck).forEach(([file, check]) => {
    const result = check();
    const icon = result === 'OK' ? '✅' : '❌';
    console.log(`${icon} ${file}: ${result}`);
});

// 3. Verificar gameState
console.log('\n🎮 ESTADO DO JOGO:');
try {
    console.log('gameState.player1:', gameState?.player1?.name || 'não definido');
    console.log('gameState.player2:', gameState?.player2?.name || 'não definido');
    console.log('gameState.tasks:', (gameState?.tasks?.length || 0) + ' tarefas');
    console.log('gameState.challenges:', (gameState?.challenges?.length || 0) + ' desafios');
} catch (e) {
    console.error('❌ Erro ao verificar gameState:', e.message);
}

// 4. Verificar autenticação
console.log('\n🔐 AUTENTICAÇÃO:');
try {
    const player = getCurrentPlayer?.();
    if (player) {
        console.log('✅ Jogador autenticado:', player.name, `(Player ${player.id})`);
    } else {
        console.log('⚠️ Nenhum jogador autenticado');
    }
} catch (e) {
    console.error('❌ Erro ao verificar autenticação:', e.message);
}

// 5. Verificar Supabase
console.log('\n☁️ SUPABASE:');
try {
    console.log('URL:', SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada');
    console.log('KEY:', SUPABASE_KEY ? '✅ Configurada' : '❌ Não configurada');
    console.log('USE_SUPABASE:', USE_SUPABASE ? '✅ Ativo' : '❌ Inativo');
    console.log('supabase instance:', supabase ? '✅ Inicializado' : '❌ Não inicializado');
    
    if (supabase) {
        console.log('Métodos disponíveis:');
        ['getPlayers', 'createTask', 'updateTask', 'createChallenge', 'updateChallenge'].forEach(method => {
            const has = typeof supabase[method] === 'function';
            console.log(`  ${has ? '✅' : '❌'} ${method}`);
        });
    }
} catch (e) {
    console.error('❌ Erro ao verificar Supabase:', e.message);
}

// 6. Verificar Room
console.log('\n🔗 SALA:');
try {
    const roomId = getRoomId?.();
    console.log('Room ID:', roomId || '❌ Não obtido');
} catch (e) {
    console.error('❌ Erro ao verificar Room:', e.message);
}

// 7. Verificar Modais
console.log('\n🪟 MODAIS:');
const modals = ['setupPlayersModal', 'selectPlayerModal', 'settingsModal', 'newTaskModal', 'newChallengeModal', 'roomModal'];
modals.forEach(modalId => {
    const exists = document.getElementById(modalId) ? '✅' : '❌';
    console.log(`${exists} ${modalId}`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ DIAGNÓSTICO CONCLUÍDO');
console.log('='.repeat(60));
