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
                },
                body: JSON.stringify({
                    room_id: 'metasnenem-test123',
                    player_number: 1,
                    name: 'Teste',
                    coins: 100,
                    level: 1
                })
            }
        );
        
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Response:', data);
        
        if (response.ok || response.status === 201) {
            console.log('✅ Player enviado!');
        } else {
            console.log('❌ Erro:', data);
        }
    } catch (error) {
        console.error('❌ Erro ao enviar:', error);
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
