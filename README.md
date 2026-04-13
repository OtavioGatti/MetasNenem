# 💕 MetasNenem - Desafios do Casal

> Um aplicativo gamificado para casais que querem conquistar metas juntos!

## 🚀 Funcionalidades

### ✨ Core
- **Sistema de 2 jogadores** com nomes customizáveis
- **Tarefas pessoais e de casal** com sincronização em tempo real
- **Desafios do casal** com 3 níveis de dificuldade
- **Sistema de moedas e níveis** - ganhe moedas completando tarefas
- **Streak diário** - mantenha a consistência
- **8 achievements desbloqueáveis**
- **Loja de recompensas** - troque moedas por experiências

### 🔄 Sincronização
- **Multi-browser** - sincronize entre dispositivos via Supabase
- **Tempo real** - polling a cada 1.5 segundos
- **Modo offline** - funciona com localStorage como fallback
- **Sala compartilhada** - código único para parear dispositivos

## 📁 Estrutura do Projeto

```
MetasNenem/
├── index.html              # Interface principal
├── script.js               # Lógica principal (será modularizado)
├── README.md               # Este arquivo
├── docs/                   # Documentação
│   ├── GUIA_SUPABASE.md
│   ├── SETUP_RAPIDO.md
│   └── TESTE_MULTI_BROWSER.md
├── src/                    # Código fonte
│   ├── app.js              # Ponto de entrada
│   ├── core/               # Estado e configurações
│   │   ├── game-state.js
│   │   ├── config.js
│   │   └── constants.js
│   ├── auth/               # Autenticação
│   │   └── auth.js
│   ├── database/           # Integração com banco
│   │   └── supabase.js
│   ├── modules/            # Módulos de funcionalidades
│   │   ├── tasks/
│   │   ├── challenges/
│   │   ├── shop/
│   │   ├── achievements/
│   │   └── players/
│   ├── ui/                 # Componentes de UI
│   │   ├── notifications.js
│   │   └── modals.js
│   └── utils/              # Utilitários
│       ├── helpers.js
│       ├── debug.js
│       └── test-sync.js
├── styles/                 # Estilos
│   └── style.css
├── assets/                 # Recursos estáticos
│   ├── icons/
│   ├── images/
│   └── fonts/
└── database/               # Schema e migrações
    ├── setup.sql
    └── migrations/
        └── 002_add_created_by.sql
```

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/OtavioGatti/MetasNenem.git
cd MetasNenem
```

### 2. Configurar Supabase (Opcional mas recomendado)

1. Crie uma conta em [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute o arquivo `database/setup.sql`
4. Copie a URL e a chave anônima do projeto
5. Edite `src/core/config.js` com suas credenciais

```javascript
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_KEY = 'sua-chave-anon';
const USE_SUPABASE = true;
```

### 3. Abrir no navegador

Simplesmente abra o `index.html` no navegador ou use um servidor local:

```bash
# Python 3
python -m http.server 8000

# Node.js (http-server)
npx http-server -p 8000
```

Acesse: `http://localhost:8000`

## 🎮 Como Usar

### Primeira vez em uma sala
1. Clique em **🔗 Sala** no topo
2. Copie o código da sala
3. Envie para seu parceiro
4. Seu parceiro cola o código e clica em **✅ Entrar em Outra Sala**
5. Ambos definem seus nomes
6. Comecem a criar tarefas!

### Criando tarefas
- **Tarefa Pessoal**: Apenas você vê e completa
- **Tarefa de Casal**: Ambos veem e quando um completa, ambos recebem moedas

### Completando tarefas
- Clique no seu nome na tarefa para marcar como completa
- Para tarefas de casal, clique em **Completar 💑**
- Ganhe moedas e suba de nível!

### Loja de recompensas
- Use suas moedas para comprar recompensas
- Exemplos: Pizza Night 🍕, Cinema 🎬, Flores 💐

## 📱 PWA - App Instalável

O MetasNenem é um **Progressive Web App (PWA)** - instale no celular e use como app nativo!

### Como Instalar

**Android:**
1. Acesse no Chrome
2. Toque em "Instalar MetasNenem"
3. Ícone aparece na tela inicial

**iPhone (Safari):**
1. Toque em Compartilhar (⎋)
2. "Adicionar à Tela de Início"
3. Confirme e pronto!

### Funcionalidades PWA
- ✅ **Instalável** - Ícone na home screen
- 🌐 **Offline** - Funciona sem internet
- ⚡ **Rápido** - Carrega instantaneamente
- 🎨 **Tela cheia** - Sem barra de navegador
- 🔔 **Notificações** - Alertas em tempo real

📖 **Guia completo**: [docs/GUIA_PWA.md](docs/GUIA_PWA.md)

##  Migração do Banco de Dados

Se você já tem o Supabase configurado e precisa aplicar mudanças:

1. Execute `database/migrations/002_add_created_by.sql` no SQL Editor do Supabase
2. Isso removerá a coluna `assigned` e adicionará `created_by`

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Roadmap

- [ ] ✅ Reorganização da estrutura de arquivos
- [ ] ✅ Sistema de backup/restore
- [ ] 🔄 Dark mode
- [ ] 📅 Datas/deadlines para tarefas
- [ ] 🏷️ Categorias e tags
- [ ] 🔔 Notificações push
- [ ] 📱 PWA (instalável no celular)
- [ ] 📊 Dashboard de estatísticas
- [ ] 🔄 Tarefas recorrentes

## 🐛 Debug

O projeto inclui ferramentas de debug no console:

```javascript
// Verificar estado atual
console.log(gameState);

// Testar sincronização
testSync();

// Verificar diagnóstico
runDiagnostics();
```

## 📄 Licença

Este projeto é de uso pessoal para casais. Sinta-se livre para usar e modificar!

## 💡 Dicas

- **Mantenha o streak**: Complete pelo menos uma tarefa por dia
- **Desafios dão mais moedas**: Invista em desafios de casal
- **Comunicação é key**: Use as tarefas para manter o diálogo aberto
- **Divirtam-se**: O objetivo é fortalecer o relacionamento!

## 👥 Feito com ❤️ por

**Otávio Gatti** e **Camilla**

---

**Versão**: 2.0.0  
**Última atualização**: Abril 2026
