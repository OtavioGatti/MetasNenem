/**
 * Sistema de Notificações e UI Feedback
 * Gerencia toasts, loading states e feedback visual
 */

let toastTimeout = null;

/**
 * Mostra uma notificação toast
 */
export function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn('Elemento toast não encontrado');
        return;
    }

    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }

    toast.textContent = message;
    toast.classList.add('show');

    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Adiciona estado de loading a um botão
 */
export function setLoading(button, isLoading = true, originalText = null) {
    if (!button) return;

    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.disabled = true;
        button.innerHTML = '<span class="loading-spinner">⏳</span> Carregando...';
    } else {
        button.disabled = false;
        button.textContent = originalText || button.dataset.originalText || button.textContent;
    }
}

/**
 * Mostra erro visual em um campo
 */
export function showFieldError(inputElement, message) {
    if (!inputElement) return;
    
    inputElement.classList.add('error');
    inputElement.title = message;
    
    // Remove o erro após 3 segundos
    setTimeout(() => {
        inputElement.classList.remove('error');
        inputElement.title = '';
    }, 3000);
}

/**
 * Confirmação visual antes de ação destrutiva
 */
export async function showConfirmation(message, title = 'Confirmação') {
    return new Promise((resolve) => {
        // Cria modal de confirmação dinamicamente
        const modal = document.createElement('div');
        modal.className = 'modal confirmation-modal';
        modal.innerHTML = `
            <div class="modal-content confirmation-content">
                <h3>${title}</h3>
                <p style="margin: 20px 0; color: #666;">${message}</p>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn-cancel" data-action="cancel">Cancelar</button>
                    <button class="btn-confirm" data-action="confirm" style="background: var(--danger, #dc3545);">Confirmar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Força reflow para animação
        setTimeout(() => modal.classList.add('show'), 10);

        const handleAction = (e) => {
            const action = e.target.dataset.action;
            modal.classList.remove('show');
            
            setTimeout(() => {
                document.body.removeChild(modal);
                document.removeEventListener('click', handleAction);
            }, 300);

            if (action === 'confirm') {
                resolve(true);
            } else {
                resolve(false);
            }
        };

        modal.addEventListener('click', handleAction);
    });
}

/**
 * Notificação de sucesso
 */
export function showSuccess(message) {
    showToast(`✅ ${message}`);
}

/**
 * Notificação de erro
 */
export function showError(message) {
    showToast(`❌ ${message}`);
}

/**
 * Notificação de aviso
 */
export function showWarning(message) {
    showToast(`⚠️ ${message}`);
}

/**
 * Notificação de informação
 */
export function showInfo(message) {
    showToast(`ℹ️ ${message}`);
}
