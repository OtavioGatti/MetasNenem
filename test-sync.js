// ========================================
// FERRAMENTA DE TESTE - Cole no Console
// ========================================

/**
 * Teste 1: Sincronizar players com Supabase
 * Comando: testPlayerSync()
 */
async function testPlayerSync() {
    console.clear();
    console.log('🧪 === TESTE 1: SINCRONIZAÇÃO DE PLAYERS === 🧪\n');
    
    const roomId = getRoomId();
    console.log('📍 Room ID:', roomId);
    console.log('👥 Estado Local:');
    console.log('  Player 1:', {
        name: gameState.player1.name,
        coins: gameState.player1.coins,
        level: gameState.player1.level
    });
    console.log('  Player 2:', {
        name: gameState.player2.name,
        coins: gameState.player2.coins,
        level: gameState.player2.level
    });
    
    console.log('\n⬆️ Enviando players para Supabase...\n');
    
    try {
        // Verificar players no Supabase ANTES
        console.log('📡 Buscando players no Supabase (ANTES)...');
        const beforePlayers = await supabase.getPlayers(roomId);
        console.log('  Encontrados:', beforePlayers.length > 0 ? beforePlayers : '(vazio)');
        
        // Fazer upsert
        console.log('\n⬆️ Fazendo UPSERT do Player 1...');
        await supabase.upsertPlayer(roomId, 1, {
            name: gameState.player1.name,
            coins: gameState.player1.coins,
            level: gameState.player1.level,
            streak: gameState.player1.streak,
            tasksCompleted: gameState.player1.tasksCompleted,
            achievements: gameState.player1.achievements,
            lastActivityDate: gameState.player1.lastActivityDate
        });
        
        console.log('⬆️ Fazendo UPSERT do Player 2...');
        await supabase.upsertPlayer(roomId, 2, {
            name: gameState.player2.name,
            coins: gameState.player2.coins,
            level: gameState.player2.level,
            streak: gameState.player2.streak,
            tasksCompleted: gameState.player2.tasksCompleted,
            achievements: gameState.player2.achievements,
            lastActivityDate: gameState.player2.lastActivityDate
        });
        
        // Verificar players no Supabase DEPOIS
        console.log('\n📡 Buscando players no Supabase (DEPOIS)...');
        const afterPlayers = await supabase.getPlayers(roomId);
        console.log('  Encontrados:', afterPlayers.length);
        
        if (afterPlayers.length > 0) {
            console.log('\n✅ PLAYERS SALVOS COM SUCESSO!\n');
            afterPlayers.forEach((p, i) => {
                console.log(`📊 Player ${p.player_number}:`);
                console.log(`   Nome: ${p.name}`);
                console.log(`   Coins: ${p.coins}`);
                console.log(`   Level: ${p.level}`);
                console.log(`   Streak: ${p.streak}`);
            });
        } else {
            console.log('\n❌ ERRO: Players não foram salvos!');
        }
    } catch (error) {
        console.error('\n❌ ERRO na sincronização:', error);
    }
}

/**
 * Teste 2: Testar leitura de dados
 * Comando: testRead()
 */
async function testRead() {
    console.clear();
    console.log('🧪 === TESTE 2: LEITURA DE DADOS === 🧪\n');
    
    const roomId = getRoomId();
    
    try {
        console.log('📖 Testando READ de players...');
        const players = await supabase.getPlayers(roomId);
        console.log('✅ Leitura OK - Encontrados:', players.length, 'players');
        console.log(players);
    } catch (error) {
        console.error('❌ Erro na leitura:', error);
    }
}

/**
 * Teste 3: Testar escrita de dados
 * Comando: testWrite()
 */
async function testWrite() {
    console.clear();
    console.log('🧪 === TESTE 3: ESCRITA DE DADOS === 🧪\n');
    
    const roomId = getRoomId();
    const testPlayer = {
        name: 'Teste ' + Date.now(),
        coins: 999,
        level: 5,
        streak: 3,
        tasksCompleted: 10,
        achievements: [],
        lastActivityDate: new Date().toDateString()
    };
    
    try {
        console.log('✍️ Criando player de teste...');
        await supabase.upsertPlayer(roomId, 99, testPlayer);
        console.log('✅ Escrita OK');
        
        // Verificar se foi criado
        const players = await supabase.getPlayers(roomId);
        const created = players.find(p => p.player_number === 99);
        
        if (created) {
            console.log('✅ Player de teste criado:\n', created);
        } else {
            console.log('❌ Player de teste não foi encontrado após criação');
        }
    } catch (error) {
        console.error('❌ Erro na escrita:', error);
    }
}

/**
 * Teste 4: Testar RLS Policies
 * Comando: testRLS()
 */
async function testRLS() {
    console.clear();
    console.log('🧪 === TESTE 4: RLS POLICIES === 🧪\n');
    
    try {
        console.log('🔐 Verificando RLS Policies...\n');
        
        // Tentar ler dados públicos
        const response = await fetch(
            'https://uzwuctjfhjopgjkqahqz.supabase.co/rest/v1/players?select=count()',
            {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6d3VjdGpmaGpvcGdqa2FhaHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2MjkyODAsImV4cCI6MTcyNzQwNTI4MH0.ey0-_JHbGCi0i1Uz-I1IHis1nR5cCi6ikpXVC39-I'
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ RLS Read OK - Total players:', data[0].count);
        } else {
            console.log('❌ RLS Read bloqueado -', response.status);
        }
    } catch (error) {
        console.error('❌ Erro ao testar RLS:', error);
    }
}

/**
 * Teste 5: Diagnóstico Completo
 * Comando: completeDiagnostic()
 */
async function completeDiagnostic() {
    console.clear();
    console.log('🧪 === DIAGNÓSTICO COMPLETO === 🧪\n');
    
    const roomId = getRoomId();
    
    console.log('✅ VERIFICAÇÕES INICIAIS:');
    console.log('  Config.js carregado?', typeof USE_SUPABASE !== 'undefined');
    console.log('  Supabase.js carregado?', typeof supabase !== 'undefined');
    console.log('  Script.js carregado?', typeof gameState !== 'undefined');
    console.log('  Auth.js carregado?', typeof getCurrentPlayer === 'function');
    
    console.log('\n👤 AUTENTICAÇÃO:');
    const currentPlayer = getCurrentPlayer();
    if (currentPlayer) {
        console.log('  ✅ Jogador autenticado:', currentPlayer.name, '(Player', currentPlayer.id + ')');
    } else {
        console.log('  ❌ Nenhum jogador autenticado');
    }
    
    console.log('\n🏠 SALA:');
    console.log('  Room ID:', roomId);
    console.log('  Sincronização:', USE_SUPABASE ? '✅ Ativa' : '❌ Desativada');
    
    console.log('\n📊 ESTADO LOCAL:');
    console.log('  Player 1:', gameState.player1.name, '-', gameState.player1.coins, 'coins');
    console.log('  Player 2:', gameState.player2.name, '-', gameState.player2.coins, 'coins');
    console.log('  Tarefas:', gameState.tasks.length);
    console.log('  Desafios:', gameState.challenges.length);
    
    console.log('\n🌐 SUPABASE:');
    try {
        const players = await supabase.getPlayers(roomId);
        const tasks = await fetch(
            `https://uzwuctjfhjopgjkqahqz.supabase.co/rest/v1/tasks?room_id=eq.${roomId}&select=count()`,
            {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6d3VjdGpmaGpvcGdqa2FhaHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2MjkyODAsImV4cCI6MTcyNzQwNTI4MH0.ey0-_JHbGCi0i1Uz-I1IHis1nR5cCi6ikpXVC39-I'
                }
            }
        ).then(r => r.json());
        
        console.log('  ✅ Players no Supabase:', players.length);
        console.log('  ✅ Tasks no Supabase:', tasks[0]?.count || 0);
        
        if (players.length === 0) {
            console.log('  ⚠️ AVISO: Nenhum player em Supabase - execute testPlayerSync()');
        }
    } catch (error) {
        console.log('  ❌ Erro ao ler Supabase:', error.message);
    }
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('  1. testPlayerSync() - Sincronizar players');
    console.log('  2. testRead() - Testar leitura');
    console.log('  3. testWrite() - Testar escrita');
}

/**
 * Comando rápido para sincronizar e recarregar
 * Comando: quickSync()
 */
async function quickSync() {
    console.log('🔄 Sincronizando players...');
    await testPlayerSync();
    console.log('\n✅ Sincronização completa! Recarregando página...');
    setTimeout(() => location.reload(), 2000);
}

// ========================================
// INSTRUÇÕES
// ========================================

console.log(`
╔════════════════════════════════════════════════════════╗
║          FERRAMENTAS DE TESTE CARREGADAS ✅            ║
╚════════════════════════════════════════════════════════╝

Comandos disponíveis:

1️⃣  testPlayerSync()      - Sincronizar players
2️⃣  testRead()            - Testar leitura de dados
3️⃣  testWrite()           - Testar escrita de dados
4️⃣  testRLS()             - Testar políticas de segurança
5️⃣  completeDiagnostic()  - Diagnóstico completo
6️⃣  quickSync()           - Sincronizar e recarregar

Exemplo:
  > testPlayerSync()
  
`);
