/**
 * PWA Registration e Install Handler
 * Gerencia registro do service worker e instalação do app
 */

let deferredPrompt = null;
let isAppInstalled = false;

/**
 * Registra o service worker
 */
export async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.log('[PWA] Service Workers não suportados');
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
        });

        console.log('[PWA] Service Worker registrado com sucesso!');
        console.log('[PWA] Scope:', registration.scope);

        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('[PWA] Nova versão sendo instalada...');

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    showUpdateNotification();
                }
            });
        });

        // Detectar quando ficar online/offline
        navigator.serviceWorker.addEventListener('message', (event) => {
            const { type, message } = event.data || {};
            
            if (type === 'ONLINE') {
                console.log('[PWA] Voltou online!');
                if (typeof showToast === 'function') {
                    showToast('✅ Conexão restaurada!');
                }
            }
            
            if (type === 'OFFLINE') {
                console.log('[PWA] Ficou offline!');
                if (typeof showToast === 'function') {
                    showToast('📴 Modo offline ativado');
                }
            }
        });

        return true;
    } catch (error) {
        console.error('[PWA] Erro ao registrar service worker:', error);
        return false;
    }
}

/**
 * Configura handlers de instalação do PWA
 */
export function setupPWAInstall() {
    // Capturar evento beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('[PWA] beforeinstallprompt disparado');
        e.preventDefault();
        deferredPrompt = e;
        
        // Mostrar botão de instalação se existir
        showInstallButton();
    });

    // Detectar quando app é instalado
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] App instalado com sucesso!');
        isAppInstalled = true;
        deferredPrompt = null;
        hideInstallButton();
        
        if (typeof showToast === 'function') {
            showToast('🎉 App instalado na tela inicial!');
        }
    });

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
        isAppInstalled = true;
        console.log('[PWA] Rodando como app instalado');
    }

    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS && !window.MSStream) {
        console.log('[PWA] iOS detectado - mostrar instruções de instalação');
        showIOSInstructions();
    }
}

/**
 * Mostra botão de instalação
 */
function showInstallButton() {
    let installBtn = document.getElementById('pwaInstallBtn');
    
    if (!installBtn) {
        installBtn = document.createElement('button');
        installBtn.id = 'pwaInstallBtn';
        installBtn.innerHTML = '📲 Instalar App';
        installBtn.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            padding: 12px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            z-index: 9998;
            animation: slideInRight 0.5s ease-out;
        `;
        
        installBtn.onclick = handleInstall;
        document.body.appendChild(installBtn);
    }
}

/**
 * Esconde botão de instalação
 */
function hideInstallButton() {
    const installBtn = document.getElementById('pwaInstallBtn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
}

/**
 * Handler de instalação
 */
async function handleInstall() {
    if (!deferredPrompt) {
        console.log('[PWA] Nenhum prompt de instalação disponível');
        return;
    }

    try {
        // Mostrar prompt nativo de instalação
        const result = await deferredPrompt.prompt();
        console.log('[PWA] Resultado da instalação:', result.outcome);
        
        if (result.outcome === 'accepted') {
            console.log('[PWA] Usuário aceitou instalar');
        } else {
            console.log('[PWA] Usuário recusou instalar');
        }
        
        deferredPrompt = null;
        hideInstallButton();
    } catch (error) {
        console.error('[PWA] Erro ao instalar:', error);
    }
}

/**
 * Mostra instruções para iOS
 */
function showIOSInstructions() {
    const notification = document.createElement('div');
    notification.id = 'iosInstallNotification';
    notification.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        z-index: 10001;
        transform: translateY(100%);
        transition: transform 0.4s ease-out;
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
    `;
    
    notification.innerHTML = `
        <div style="max-width: 500px; margin: 0 auto;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <span style="font-size: 32px;">📱</span>
                <div style="flex: 1;">
                    <strong style="font-size: 16px; display: block; margin-bottom: 5px;">Instalar MetasNenem</strong>
                    <span style="font-size: 13px; opacity: 0.9;">Adicione à sua tela inicial para acesso rápido!</span>
                </div>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; font-size: 13px;">
                <strong>Como instalar:</strong><br>
                1️⃣ Clique no botão compartilhar <span style="font-size: 18px;">⎋</span><br>
                2️⃣ Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong><br>
                3️⃣ Confirme o nome e toque em <strong>"Adicionar"</strong>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Auto-remove após 15 segundos
    setTimeout(() => {
        notification.style.transform = 'translateY(100%)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 400);
    }, 15000);
}

/**
 * Mostra notificação de atualização disponível
 */
function showUpdateNotification() {
    if (confirm('🆕 Nova versão disponível! Deseja atualizar?')) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }
}

/**
 * Adicionar URLs ao cache
 */
export function cacheUrls(urls) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'CACHE_URLS',
            urls: urls
        });
    }
}

/**
 * Limpar todo o cache
 */
export async function clearCache() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_CACHE'
        });
        
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('[PWA] Cache limpo com sucesso');
        }
    }
}

/**
 * Verificar status online/offline
 */
export function getConnectionStatus() {
    return navigator.onLine ? 'online' : 'offline';
}

/**
 * Monitorar mudança de conexão
 */
export function monitorConnection() {
    window.addEventListener('online', () => {
        console.log('[PWA] Conexão restaurada');
        if (typeof showToast === 'function') {
            showToast('✅ Online! Sincronizando...');
        }
    });

    window.addEventListener('offline', () => {
        console.log('[PWA] Conexão perdida');
        if (typeof showToast === 'function') {
            showToast('📴 Offline - dados salvos localmente');
        }
    });
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(300px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Exportar para escopo global
window.registerServiceWorker = registerServiceWorker;
window.setupPWAInstall = setupPWAInstall;
window.handleInstall = handleInstall;
window.cacheUrls = cacheUrls;
window.clearCache = clearCache;
window.getConnectionStatus = getConnectionStatus;
