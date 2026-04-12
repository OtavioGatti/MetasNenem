# 📱 Como Sincronizar MetasNenem entre Celulares

## ⚡ Opção 1: FÁCIL - Sem Configurar Nada

Vocês podem usar **sem sincronização em tempo real** apenas com localStorage:

1. **Cada um em seu celular:**
   - Abra `index.html` no navegador
   - Clique em 🔗 **Sala** no topo
   - Um código aparece (ex: `metasnenem-abc123`)
   - **Compartilhem esse código**
   
2. **Quem quer sincronizar:**
   - Clique em 🔗 **Sala**
   - Cole o código dela em "Quer conectar a outra sala?"
   - Clique em "✅ Entrar em Outra Sala"

3. **Pronto!** Vocês estão na mesma sala, mas sincronização será manual (F5 para recarregar)

---

## 🚀 Opção 2: MELHOR - Sincronização em Tempo Real (Recomendado!)

Para sincronizar AUTOMATICAMENTE, use **Supabase** (gratuito!):

### Passo 1: Criar Conta no Supabase

1. Acesse: **https://supabase.com** 
2. Clique em "Start your project"
3. Faça login (Google/GitHub)
4. Crie um novo projeto:
   - Nome: `MetasNenem`
   - Senha: Algo que você lembra
   - Region: São Paulo (ou próximo de você)
5. Aguarde 2 minutos para criar

### Passo 2: Pegar as Chaves

1. No painel, clique ⚙️ **Settings** (engrenagem)
2. Vá em **API**
3. Copie:
   - **Project URL** (URL grande)
   - **anon public** (chave grande)

### Passo 3: Configurar o Site

1. Abra `config.js` em um editor de texto
2. Procure essas linhas:

```javascript
const SUPABASE_URL = "";
const SUPABASE_KEY = "";
```

3. Cole dentro das aspas:

```javascript
const SUPABASE_URL = "https://seu-projeto.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIs...";
```

4. **Salve o arquivo (Ctrl+S)**

### Passo 4: Criar as Tabelas

1. No Supabase, clique em **SQL Editor**
2. Clique em "New Query"
3. **Abra o arquivo `setup.sql`** deste projeto
4. Copie TUDO (sem os markers ```sql)
5. Cole no Supabase SQL Editor
6. Clique **Run** (Ctrl+Enter)
7. ✅ Pronto!

> 📌 **Use o arquivo `setup.sql`** - é mais fácil copiar e colar!

### Passo 5: Usar o Site

1. **Você abre** `index.html`
2. **Sua Namorada abre** `index.html` (com o mesmo arquivo config.js)
3. Ambos clicam em 🔗 **Sala**
4. **Vocês compartilham o código de sala**
5. 🎉 **Sincronizando em tempo real!**

---

## 🔄 Como Funciona

```
VOCÊ (Celular 1)              DELA (Celular 2)
    ↓                              ↑
Completa tarefa          💫 Sincroniza em 1-2 seg
    ↓                              ↑
  Supabase                       
    ↓                              ↑
Atualiza automatico        ← Vê a mudança!
```

---

## 💡 Dicas Importantes

✅ **Copie e compartilhe o ROOM_ID** (aquele código)
✅ **Ambos precisam abrir o site** 
✅ **Pode fechar o site e reabrir** - os dados persistem
✅ **Funciona offline?** Sim, mas sincroniza quando conecta

❌ **Não compartilhe a chave do Supabase em público!**
❌ **Free tier é suficiente** para vocês dois (muitas requisições já)

---

## 🐛 Se Não Funcionar

**"Erro de conexão"**
- Verifique a URL e chave no `config.js`
- Verifique se as tabelas foram criadas
- Verifique sua internet

**"Não sincroniza"**
- Procure por "Modo Local" em cima - significa Supabase não tá configurado
- Siga os passos acima e recarregue a página

**"Erro nas queries SQL"**
- Rode as queries uma por uma (em vez de tudo junto)
- Ou copie do arquivo GUIA_SUPABASE.md

---

## 🎯 Próximos Passos

Depois de configurar, vocês podem:
- Deploy em um servidor (GitHub Pages, Vercel, Netlify)
- Acessar de qualquer lugar
- Compartilhar com outros casais

**Precisa de ajuda?** Leia `GUIA_SUPABASE.md` para mais detalhes! 📖

---

**Enjoy gamificando seu relacionamento! 💕**
