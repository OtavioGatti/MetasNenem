// Script para debugar e forçar sincronização manualmente

window.debugSupabase = {
    init: function() {
        console.log('=== DIAGNÓSTICO SUPABASE ===');
        console.log('URL:', SUPABASE_URL);
        console.log('KEY:', SUPABASE_KEY ? 'Configurada ✅' : 'Vazia ❌');
        console.log('USE_SUPABASE:', USE_SUPABASE);
        console.log('Supabase Manager:', supabase ? '✅' : '❌');
    }
};

// Testar conexão
window.testSupabaseConnection = async function() {
    console.log('\n🔍 Testando conexão com Supabase...');
    
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/players?limit=1`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            }
        );
        
        console.log('Status:', response.status);
        console.log('Response:', response);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Conexão OK!');
            console.log('Dados retornados:', data);
        } else {
            console.log('❌ Erro na resposta:', response.statusText);
        }
    } catch (error) {
        console.error('❌ Erro ao conectar:', error);
    }
}

// Forçar envio de um player
window.forceUploadPlayer = async function() {
    console.log('\n📤 Forçando upload de player...');
    
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/players`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'  // Não retorna dados
                },
                body: JSON.stringify({
                    room_id: 'metasnenem-test123',
                    player_number: 1,
                    name: 'Teste Supabase',
                    coins: 100,
                    level: 1
                })
            }
        );
        
        console.log('Status:', response.status);
        
        if (response.status === 201) {
            console.log('✅ Player criado com sucesso no Supabase!');
            console.log('Agora verifique em Table Editor → players');
        } else if (response.status === 200) {
            console.log('✅ Player enviado!');
        } else {
            console.log('❌ Status inesperado:', response.status);
            try {
                const data = await response.json();
                console.log('Erro:', data);
            } catch (e) {
                console.log('Não conseguiu parsear resposta');
            }
        }
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

// Checker de status
window.checkStatus = function() {
    console.log('\n📊 STATUS ATUAL:');
    console.log('Game State Players:', gameState.player1, gameState.player2);
    console.log('Sync Status:', syncInterval ? '🟢 Ativo' : '❌ Inativo');
    console.log('Room ID:', getRoomId());
}

// Executar testes
console.log('\n▶️ Execute no console:');
console.log('testSupabaseConnection() - Test connection');
console.log('forceUploadPlayer() - Enviar um player');
console.log('checkStatus() - Ver status');
console.log('syncToCloud() - Forçar sincronização');
