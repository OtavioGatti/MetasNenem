// 🔧 CONFIGURAÇÃO DO SUPABASE
// 
// Siga o guia em GUIA_SUPABASE.md e preencha com suas credenciais:

const SUPABASE_URL = "https://uzwuctjfhjopgjkqahqz.supabase.co"; // Substitua com sua URL do Supabase
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6d3VjdGpmaGpvcGdqa3FhaHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTI3MTYsImV4cCI6MjA5MTMyODcxNn0.2BH7YLlPaeJex943JBkjrkcVF5TQb6TyhyGD40DZbdk"; // Substitua com sua chave pública do Supabase

// IMPORTANTE: Nunca compartilhe sua chave em público!
// Se precisar resetar: Settings → API → Regenerate Keys

// Teste se as credenciais estão preenchidas
function validateConfig() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.warn("⚠️ Credenciais do Supabase não configuradas!");
        console.log("📖 Siga o guia em GUIA_SUPABASE.md para configurar");
        return false;
    }
    return true;
}

// ID da sala (deve ser igual para ambos os celulares)
// Mude para um ID único seu
let ROOM_ID = localStorage.getItem('metasnenem_room_id') || "metasnenem-" + new Date().getTime();

function setRoomId(newRoomId) {
    ROOM_ID = newRoomId;
    localStorage.setItem('metasnenem_room_id', newRoomId);
}

function getRoomId() {
    return ROOM_ID;
}

// Modo: 'local' (localStorage) ou 'cloud' (Supabase)
const USE_SUPABASE = SUPABASE_URL !== "" && SUPABASE_KEY !== "";
