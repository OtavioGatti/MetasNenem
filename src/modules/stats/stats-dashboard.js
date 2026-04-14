/**
 * Módulo de Estatísticas e Dashboard
 * Gráficos e métricas de progresso do casal
 */

/**
 * Calcula estatísticas do jogo
 */
function calculateStats() {
    const gameState = window.gameState || {};
    
    // Total de moedas ganhas por jogador
    const player1TotalCoins = gameState.player1?.coins || 0;
    const player2TotalCoins = gameState.player2?.coins || 0;
    
    // Tarefas completadas
    const player1Tasks = gameState.player1?.tasksCompleted || 0;
    const player2Tasks = gameState.player2?.tasksCompleted || 0;
    const totalTasks = player1Tasks + player2Tasks;
    
    // Tarefas de casal vs pessoais
    const coupleTasks = (gameState.tasks || []).filter(t => t.type === 'casal' && t.completed).length;
    const personalTasks = totalTasks - coupleTasks;
    
    // Streaks
    const player1Streak = gameState.player1?.streak || 0;
    const player2Streak = gameState.player2?.streak || 0;
    const maxStreak = Math.max(player1Streak, player2Streak);
    
    // Níveis
    const player1Level = gameState.player1?.level || 1;
    const player2Level = gameState.player2?.level || 1;
    
    // Achievements
    const totalAchievements = Object.keys(window.ACHIEVEMENTS_DB || {}).length;
    const unlockedAchievements = (gameState.player1?.achievements || []).length;
    
    // Desafios completados
    const challengesCompleted = gameState.stats?.challengesCompleted || 0;
    
    // Total de moedas na economia
    const totalEconomy = player1TotalCoins + player2TotalCoins;
    
    return {
        player1: {
            coins: player1TotalCoins,
            level: player1Level,
            streak: player1Streak,
            tasks: player1Tasks
        },
        player2: {
            coins: player2TotalCoins,
            level: player2Level,
            streak: player2Streak,
            tasks: player2Tasks
        },
        totals: {
            tasks: totalTasks,
            coupleTasks,
            personalTasks,
            economy: totalEconomy,
            challenges: challengesCompleted,
            maxStreak
        },
        achievements: {
            unlocked: unlockedAchievements,
            total: totalAchievements,
            percentage: Math.round((unlockedAchievements / totalAchievements) * 100)
        }
    };
}

/**
 * Renderiza o dashboard de estatísticas
 */
function renderStatsDashboard() {
    const container = document.getElementById('statsDashboard');
    
    if (!container) {
        console.warn('Elemento statsDashboard não encontrado');
        return;
    }

    try {
        const stats = calculateStats();
        const gameState = window.gameState || {};
        const p1Name = gameState.player1?.name || 'Jogador 1';
        const p2Name = gameState.player2?.name || 'Jogador 2';
        
        console.log('📊 Renderizando dashboard:', stats);
        
        container.innerHTML = `
            <div class="stats-section">
                <h3 class="stats-section-title">💰 Economia Total</h3>
                <div class="stat-card large">
                    <div class="stat-value">${stats.totals.economy}</div>
                    <div class="stat-label">moedas na economia</div>
                </div>
            </div>
            
            <div class="stats-section">
                <h3 class="stats-section-title">📊 Comparação de Jogadores</h3>
                <div class="comparison-chart">
                    <div class="comparison-item">
                        <div class="player-label">${p1Name}</div>
                        <div class="bar-container">
                            <div class="bar bar-player1" style="width: ${calculatePercentage(stats.player1.tasks, stats.totals.tasks)}%"></div>
                        </div>
                        <div class="bar-value">${stats.player1.tasks} tarefas</div>
                    </div>
                    
                    <div class="comparison-item">
                        <div class="player-label">${p2Name}</div>
                        <div class="bar-container">
                            <div class="bar bar-player2" style="width: ${calculatePercentage(stats.player2.tasks, stats.totals.tasks)}%"></div>
                        </div>
                        <div class="bar-value">${stats.player2.tasks} tarefas</div>
                    </div>
                </div>
            </div>
            
            <div class="stats-section">
                <h3 class="stats-section-title">📈 Tipos de Tarefas</h3>
                <div class="pie-chart-container">
                    <div class="pie-chart" style="background: conic-gradient(
                        #667eea 0deg ${calculatePieAngle(stats.totals.personalTasks, stats.totals.tasks)}, 
                        #f5576c ${calculatePieAngle(stats.totals.personalTasks, stats.totals.tasks)}deg 360deg
                    );">
                    </div>
                    <div class="pie-legend">
                        <div class="legend-item">
                            <span class="legend-color" style="background: #667eea;"></span>
                            <span>Pessoais: ${stats.totals.personalTasks}</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-color" style="background: #f5576c;"></span>
                            <span>Casal: ${stats.totals.coupleTasks}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="stats-section">
                <h3 class="stats-section-title">🔥 Streaks Atuais</h3>
                <div class="streak-comparison">
                    <div class="streak-card">
                        <div class="streak-icon">🔥</div>
                        <div class="streak-value">${stats.player1.streak}</div>
                        <div class="streak-label">${p1Name}</div>
                    </div>
                    <div class="streak-vs">VS</div>
                    <div class="streak-card">
                        <div class="streak-icon">🔥</div>
                        <div class="streak-value">${stats.player2.streak}</div>
                        <div class="streak-label">${p2Name}</div>
                    </div>
                </div>
            </div>
            
            <div class="stats-section">
                <h3 class="stats-section-title">🏆 Progresso de Achievements</h3>
                <div class="progress-container">
                    <div class="progress-bar-stats">
                        <div class="progress-fill-stats" style="width: ${stats.achievements.percentage}%"></div>
                    </div>
                    <div class="progress-stats-text">
                        ${stats.achievements.unlocked}/${stats.achievements.total} desbloqueados (${stats.achievements.percentage}%)
                    </div>
                </div>
            </div>
            
            <div class="stats-section">
                <h3 class="stats-section-title">📋 Resumo Geral</h3>
                <div class="stats-grid">
                    <div class="mini-stat">
                        <div class="mini-stat-value">${stats.totals.tasks}</div>
                        <div class="mini-stat-label">Tarefas Total</div>
                    </div>
                    <div class="mini-stat">
                        <div class="mini-stat-value">${stats.totals.challenges}</div>
                        <div class="mini-stat-label">Desafios</div>
                    </div>
                    <div class="mini-stat">
                        <div class="mini-stat-value">${stats.totals.maxStreak}</div>
                        <div class="mini-stat-label">Melhor Streak</div>
                    </div>
                    <div class="mini-stat">
                        <div class="mini-stat-value">${Math.max(stats.player1.level, stats.player2.level)}</div>
                        <div class="mini-stat-label">Nível Máximo</div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('❌ Erro ao renderizar dashboard:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <p style="font-size: 24px; margin-bottom: 10px;">⚠️</p>
                <p>Erro ao carregar estatísticas</p>
                <p style="font-size: 12px; color: #999; margin-top: 10px;">${error.message}</p>
                <button onclick="renderStatsDashboard()" style="margin-top: 15px; padding: 8px 16px; border: none; border-radius: 6px; background: #667eea; color: white; cursor: pointer;">🔄 Tentar novamente</button>
            </div>
        `;
    }
}

/**
 * Calcula porcentagem
 */
function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

/**
 * Calcula ângulo para gráfico de pizza
 */
function calculatePieAngle(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 360);
}

// CSS para o dashboard
const style = document.createElement('style');
style.textContent = `
    .stats-section {
        margin-bottom: 25px;
    }
    
    .stats-section-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--text-primary);
    }
    
    .stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        color: white;
    }
    
    .stat-card.large .stat-value {
        font-size: 48px;
        font-weight: bold;
        margin-bottom: 5px;
    }
    
    .stat-card.large .stat-label {
        font-size: 14px;
        opacity: 0.9;
    }
    
    .comparison-chart {
        background: white;
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .comparison-item {
        margin-bottom: 15px;
    }
    
    .comparison-item:last-child {
        margin-bottom: 0;
    }
    
    .player-label {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 8px;
        color: #666;
    }
    
    .bar-container {
        background: #f0f0f0;
        border-radius: 8px;
        height: 24px;
        overflow: hidden;
        margin-bottom: 5px;
    }
    
    .bar {
        height: 100%;
        border-radius: 8px;
        transition: width 0.5s ease-out;
    }
    
    .bar-player1 {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .bar-player2 {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .bar-value {
        font-size: 12px;
        color: #999;
        text-align: right;
    }
    
    .pie-chart-container {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 20px;
    }
    
    .pie-chart {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        flex-shrink: 0;
    }
    
    .pie-legend {
        flex: 1;
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
    }
    
    .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 4px;
    }
    
    .streak-comparison {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .streak-card {
        text-align: center;
        flex: 1;
    }
    
    .streak-icon {
        font-size: 32px;
        margin-bottom: 10px;
    }
    
    .streak-value {
        font-size: 36px;
        font-weight: bold;
        color: #f59e0b;
    }
    
    .streak-label {
        font-size: 13px;
        color: #666;
        margin-top: 5px;
    }
    
    .streak-vs {
        font-size: 24px;
        font-weight: bold;
        color: #999;
    }
    
    .progress-container {
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .progress-bar-stats {
        background: #f0f0f0;
        border-radius: 8px;
        height: 20px;
        overflow: hidden;
        margin-bottom: 10px;
    }
    
    .progress-fill-stats {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        height: 100%;
        border-radius: 8px;
        transition: width 0.5s ease-out;
    }
    
    .progress-stats-text {
        text-align: center;
        font-size: 14px;
        color: #666;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }
    
    .mini-stat {
        background: white;
        border-radius: 12px;
        padding: 15px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .mini-stat-value {
        font-size: 28px;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 5px;
    }
    
    .mini-stat-label {
        font-size: 12px;
        color: #999;
    }
    
    @media (max-width: 768px) {
        .pie-chart-container {
            flex-direction: column;
        }
        
        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .streak-value {
            font-size: 28px;
        }
        
        .stat-card.large .stat-value {
            font-size: 36px;
        }
    }
`;
document.head.appendChild(style);

// Exportar para escopo global
window.calculateStats = calculateStats;
window.renderStatsDashboard = renderStatsDashboard;

console.log('✅ stats-dashboard.js carregado com sucesso');
console.log('📊 window.renderStatsDashboard:', typeof window.renderStatsDashboard);
