# 🔗 Guia: Conectar MetasNenem via Supabase

## Passo 1: Criar Conta no Supabase (Gratuito!)

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com Google/GitHub
4. Crie uma nova organização
5. Crie um novo projeto:
   - Nome: `MetasNenem`
   - Password: Guarde uma senha forte
   - Size: Free tier
   - Region: Escolha a mais próxima (ex: São Paulo 🇧🇷)
6. Aguarde 1-2 minutos para criar

## Passo 2: Pegar as Credenciais

1. No painel do Supabase, clique em **Settings** (engrenagem)
2. Vá em **API**
3. Copie:
   - **Project URL** (URL do seu projeto)
   - **anon public** (chave pública)

Exemplo:
```
URL: https://xxxxxxxx.supabase.co
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Passo 3: Criar as Tabelas no Supabase

1. No painel, clique em **SQL Editor**
2. Clique em "New Query"
3. **Abra o arquivo `setup.sql` e copie TUDO** (sem os markers ```sql)
4. Cole no Supabase SQL Editor
5. Clique **Run** (ou Ctrl+Enter)
6. ✅ Pronto!

> ⚠️ **NÃO copie os markers de código (```sql)** - só o SQL puro!

---

Se preferir o código completo, veja em `setup.sql` ou:

```sql
-- Tabela de Jogadores
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,
  player_number INT NOT NULL,
  name TEXT NOT NULL,
  coins INT DEFAULT 0,
  level INT DEFAULT 1,
  streak INT DEFAULT 0,
  tasks_completed INT DEFAULT 0,
  achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
  last_activity_date TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
-- ... (veja setup.sql para o código completo)
```

> 📌 **Copie o arquivo `setup.sql` inteiro** para o SQL Editor do Supabase!

---

4. Clique em **Run** (ou Ctrl+Enter)
5. Pronto! Tabelas criadas! ✅

## Passo 4: Configurar Credenciais

Coloque as credenciais no `config.js`:

```javascript
// config.js
const SUPABASE_URL = "https://seu-projeto.supabase.co";
const SUPABASE_KEY = "sua-chave-publica-aqui";
```

## Passo 5: Usar seu Site

1. Ambos abrem o `index.html`
2. Clicam em 🔗 **Sala** no topo
3. Compartilham o **código da sala** (ex: `metasnenem-abc123`)
4. 🎉 **Pronto!** Estão sincronizados em tempo real!

Qualquer mudança que vocês fazem aparece em tempo real no celular um do outro!

---

## 🔄 Como Funciona a Sincronização

```
Celular 1 (Você)
    ↓
[Completa tarefa]
    ↓
Supabase (Sincroniza)
    ↓
Celular 2 (Namorada)
    ↓
[Atualiza automaticamente! ✨]
```

## 💡 Dicas

- **Room ID**: Cada casal tem um código único. Não compartilhe em público
- **Backup**: Supabase salva tudo automaticamente
- **Offline**: Funciona offline e sincroniza quando conecta
- **Free tier**: Suporta thousands de requisições por dia (mais que suficiente!)

## 🚨 Troubleshooting

**"Connection error"**
- Verifique se a URL e Key estão corretas
- Verifique sua conexão de internet

**"Dados não sincronizam"**
- Recarregue a página (F5)
- Verifique se vocês estão com o mesmo ROOM_ID

**"Erro nas tabelas"**
- Vá em **SQL Editor** e rode as queries de novo

---

**Desvenda ao seguir esses passos! Qualquer dúvida, me chama!** 💕
