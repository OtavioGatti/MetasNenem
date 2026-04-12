/**
 * Gerenciador de Modais
 * Controla abertura e fechamento de modais
 */

/**
 * Abre um modal
 */
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal ${modalId} não encontrado`);
        return false;
    }
    modal.classList.add('show');
    return true;
}

/**
 * Fecha um modal
 */
export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal ${modalId} não encontrado`);
        return false;
    }
    modal.classList.remove('show');
    return true;
}

/**
 * Fecha todos os modais
 */
export function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('show'));
}

/**
 * Fecha modal ao clicar fora
 */
export function setupModalCloseOnClickOutside() {
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.classList.remove('show');
            }
        });
    };
}

/**
 * Fecha modal com tecla ESC
 */
export function setupModalCloseOnEscape() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

/**
 * Inicializa todos os handlers de modal
 */
export function initModalHandlers() {
    setupModalCloseOnClickOutside();
    setupModalCloseOnEscape();
}
