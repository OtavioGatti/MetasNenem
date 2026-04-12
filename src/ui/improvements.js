/**
 * Melhorias de UI/UX para o MetasNenem
 * - Sistema de confirmação para deleção
 * - Backup e Restore de dados
 * - Busca de tarefas
 * - Loading states
 */

// Função de confirmação melhorada
async function confirmAction(message, title = 'Confirmação') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal confirmation-modal';
        modal.style.cssText = 'z-index: 10000;';
        modal.innerHTML = `
            <div class="modal-content confirmation-content" style="max-width: 400px;">
                <h3 style="margin-bottom: 15px; color: var(--primary);">${title}</h3>
                <p style="margin: 20px 0; color: #666; line-height: 1.5;">${message}</p>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
                    <button class="btn-cancel" data-action="cancel" style="padding: 10px 20px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer; font-weight: 500;">Cancelar</button>
                    <button class="btn-confirm" data-action="confirm" style="padding: 10px 20px; border: none; border-radius: 8px; background: #dc3545; color: white; cursor: pointer; font-weight: 500;">Confirmar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        const handleAction = (e) => {
            const action = e.target.dataset.action;
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    document.body.removeChild(modal);
                }
                document.removeEventListener('click', handleAction);
            }, 300);
            resolve(action === 'confirm');
        };

        modal.addEventListener('click', handleAction);
    });
}

// Backup e Restore
function exportBackup() {
    try {
        const dataStr = JSON.stringify(gameState, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.download = `metasnenem-backup-${date}.json`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('✅ Backup exportado com sucesso!');
    } catch (error) {
        console.error('Erro ao exportar backup:', error);
        showToast('❌ Erro ao exportar backup');
    }
}

function importBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const imported = JSON.parse(text);
            
            // Validar estrutura básica
            if (!imported.player1 || !imported.player2) {
                throw new Error('Arquivo de backup inválido');
            }

            if (confirm('⚠️ Isso substituirá todos os dados atuais. Continuar?')) {
                gameState = imported;
                normalizeGameStateShape();
                saveGame();
                renderAll();
                showToast('✅ Backup importado com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao importar backup:', error);
            showToast('❌ Erro ao importar: arquivo inválido');
        }
    };

    input.click();
}

// Loading state para botões
function setButtonLoading(button, isLoading, originalText = null) {
    if (!button) return;
    
    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.disabled = true;
        button.innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Processando...';
    } else {
        button.disabled = false;
        button.textContent = originalText || button.dataset.originalText || 'Processar';
    }
}

// Debounce para busca
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Busca de tarefas
let currentSearchQuery = '';

function setupTaskSearch() {
    const searchInput = document.getElementById('taskSearch');
    if (!searchInput) return;

    const handleSearch = debounce((e) => {
        currentSearchQuery = e.target.value.trim();
        renderTasks();
    }, 300);

    searchInput.addEventListener('input', handleSearch);
}

function filterTasksWithSearch(tasks) {
    if (!currentSearchQuery) return tasks;
    
    const query = currentSearchQuery.toLowerCase();
    return tasks.filter(t => 
        t.description.toLowerCase().includes(query)
    );
}

// Adicionar CSS de animação
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .confirmation-modal .modal-content {
        animation: slideUp 0.3s ease-out;
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .task-search-container {
        margin-bottom: 15px;
    }
    
    #taskSearch {
        width: 100%;
        padding: 10px 15px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.3s;
    }
    
    #taskSearch:focus {
        outline: none;
        border-color: var(--primary);
    }
    
    .backup-buttons {
        display: flex;
        gap: 10px;
        margin-top: 15px;
    }
    
    .btn-backup {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s;
    }
    
    .btn-export {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }
    
    .btn-import {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
    }
    
    .btn-backup:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
`;
document.head.appendChild(styleSheet);
