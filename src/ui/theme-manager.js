/**
 * Dark Mode Manager
 * Gerencia o tema claro/escuro da aplicação
 */

const THEME_KEY = 'metasnenem_theme';

/**
 * Obtém o tema atual
 */
function getCurrentTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
}

/**
 * Define o tema
 */
function setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
        console.error('Tema inválido:', theme);
        return;
    }

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Atualizar ícone do botão se existir
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        toggleBtn.title = theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro';
    }

    console.log(`🎨 Tema alterado para: ${theme}`);
}

/**
 * Alterna entre os temas
 */
function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    return newTheme;
}

/**
 * Inicializa o tema ao carregar a página
 */
function initTheme() {
    const savedTheme = getCurrentTheme();
    setTheme(savedTheme);

    // Verificar preferência do sistema
    if (!localStorage.getItem(THEME_KEY)) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            setTheme('dark');
        }
    }
}

/**
 * Cria o botão de toggle do tema
 */
function createThemeToggleButton() {
    const button = document.createElement('button');
    button.id = 'themeToggle';
    button.className = 'btn-theme-toggle';
    button.innerHTML = getCurrentTheme() === 'dark' ? '☀️' : '🌙';
    button.title = getCurrentTheme() === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro';
    
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: none;
        background: var(--gradient-primary, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
        color: white;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        transition: transform 0.3s, box-shadow 0.3s;
    `;

    button.onmouseover = () => {
        button.style.transform = 'scale(1.1)';
        button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
    };

    button.onmouseout = () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    };

    button.onclick = toggleTheme;

    document.body.appendChild(button);
    return button;
}

// Exportar para escopo global
window.initTheme = initTheme;
window.createThemeToggleButton = createThemeToggleButton;
window.toggleTheme = toggleTheme;
