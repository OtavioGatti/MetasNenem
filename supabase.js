// 🌐 Integração Supabase
// Gerencia sincronização em tempo real

class SupabaseManager {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'Content-Type': 'application/json',
            'apikey': key,
            'Authorization': `Bearer ${key}`
        };
    }

    // ============ PLAYERS ============
    async getPlayers(roomId) {
        const response = await fetch(
            `${this.url}/rest/v1/players?room_id=eq.${roomId}`,
            { headers: this.headers }
        );
        return response.json();
    }

    async upsertPlayer(roomId, playerNumber, playerData) {
        const response = await fetch(
            `${this.url}/rest/v1/players`,
            {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    room_id: roomId,
                    player_number: playerNumber,
                    name: playerData.name,
                    coins: playerData.coins,
                    level: playerData.level,
                    streak: playerData.streak,
                    tasks_completed: playerData.tasksCompleted,
                    achievements: playerData.achievements,
                    last_activity_date: playerData.lastActivityDate
                })
            }
        );
        if (response.ok) return { success: true };
        throw new Error(`POST /players failed: ${response.status}`);
    }

    async updatePlayer(roomId, playerNumber, updates) {
        const response = await fetch(
            `${this.url}/rest/v1/players?room_id=eq.${roomId}&player_number=eq.${playerNumber}`,
            {
                method: 'PATCH',
                headers: {
                    ...this.headers,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(updates)
            }
        );
        if (response.ok) return { success: true };
        throw new Error(`PATCH /players failed: ${response.status}`);
    }

    // ============ TASKS ============
    async getTasks(roomId) {
        const response = await fetch(
            `${this.url}/rest/v1/tasks?room_id=eq.${roomId}&order=created_at.desc`,
            { headers: this.headers }
        );
        return response.json();
    }

    async createTask(roomId, taskData) {
        const response = await fetch(
            `${this.url}/rest/v1/tasks`,
            {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    room_id: roomId,
                    description: taskData.description,
                    coins: taskData.coins,
                    type: taskData.type,
                    assigned: taskData.assigned,
                    completed: false
                })
            }
        );
        // POST com 'return=minimal' retorna 201 sem corpo
        if (response.ok) return { success: true };
        throw new Error(`POST /tasks failed: ${response.status}`);
    }

    async updateTask(taskId, updates) {
        const response = await fetch(
            `${this.url}/rest/v1/tasks?id=eq.${taskId}`,
            {
                method: 'PATCH',
                headers: {
                    ...this.headers,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(updates)
            }
        );
        // PATCH com 'return=minimal' retorna 200/204 sem corpo
        if (response.ok) return { success: true };
        throw new Error(`PATCH /tasks failed: ${response.status}`);
    }

    async deleteTask(taskId) {
        return fetch(
            `${this.url}/rest/v1/tasks?id=eq.${taskId}`,
            { method: 'DELETE', headers: this.headers }
        );
    }

    // ============ CHALLENGES ============
    async getChallenges(roomId) {
        const response = await fetch(
            `${this.url}/rest/v1/challenges?room_id=eq.${roomId}&completed=eq.false`,
            { headers: this.headers }
        );
        return response.json();
    }

    async createChallenge(roomId, challengeData) {
        const response = await fetch(
            `${this.url}/rest/v1/challenges`,
            {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    room_id: roomId,
                    description: challengeData.description,
                    coins: challengeData.coins,
                    difficulty: challengeData.difficulty,
                    completed: false
                })
            }
        );
        if (response.ok) return { success: true };
        throw new Error(`POST /challenges failed: ${response.status}`);
    }

    async updateChallenge(challengeId, updates) {
        const response = await fetch(
            `${this.url}/rest/v1/challenges?id=eq.${challengeId}`,
            {
                method: 'PATCH',
                headers: {
                    ...this.headers,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(updates)
            }
        );
        if (response.ok) return { success: true };
        throw new Error(`PATCH /challenges failed: ${response.status}`);
    }

    // ============ HISTORY ============
    async addHistory(roomId, action) {
        const response = await fetch(
            `${this.url}/rest/v1/history`,
            {
                method: 'POST',
                headers: {
                    ...this.headers,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    room_id: roomId,
                    action: action
                })
            }
        );
        if (response.ok) return { success: true };
        throw new Error(`POST /history failed: ${response.status}`);
    }

    async getHistory(roomId) {
        const response = await fetch(
            `${this.url}/rest/v1/history?room_id=eq.${roomId}&order=timestamp.desc&limit=50`,
            { headers: this.headers }
        );
        return response.json();
    }

    // ============ REAL-TIME (Polling) ============
    setupRealtimeListener(roomId, callback, interval = 2000) {
        return setInterval(async () => {
            try {
                const players = await this.getPlayers(roomId);
                const tasks = await this.getTasks(roomId);
                const challenges = await this.getChallenges(roomId);
                const history = await this.getHistory(roomId);
                
                callback({ players, tasks, challenges, history });
            } catch (error) {
                console.error('Erro ao sincronizar:', error);
            }
        }, interval);
    }
}

// Instância global
let supabase = null;

function initSupabase() {
    if (USE_SUPABASE && SUPABASE_URL && SUPABASE_KEY) {
        supabase = new SupabaseManager(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase conectado!');
        return true;
    }
    console.log('⚠️ Usando localStorage (Supabase não configurado)');
    return false;
}

// Auxiliares
async function withError(promise, context = '') {
    try {
        return await promise;
    } catch (error) {
        console.error(`Erro ${context}:`, error);
        return null;
    }
}
