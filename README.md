# 💕 MetasNenem - Desafios do Casal Gamificado

Um site interativo e divertido para você e sua namorada gerenciarem metas, tarefas e desafios com um sistema completo de gamificação!

> 👉 **[COMECE AQUI!](COMECE_AQUI.md)** - Guia rápido pra começar em 5 minutos!

## 🎮 Funcionalidades

### 📋 Tarefas Pessoais
- Crie tarefas individuais com pontos customizáveis
- Marque como concluído para ganhar moedas
- Filtrar por tipo (pessoal, casal, concluído)
- Histórico completo de atividades

### 💑 Desafios do Casal
- Crie desafios para vocês dois juntos
- 3 níveis de dificuldade (fácil, médio, difícil)
- Ambos ganham os mesmos pontos ao completar
- Builds conexão de casal através de objetivos comuns

### 🏆 Sistema de Pontos & Níveis
- **Moedas (⭐)**: Ganhe completando tarefas
- **Níveis**: Suba de nível gastando moedas (cada nível = 100 × nível anterior)
- **Streak (🔥)**: Mantenha atividades diárias para aumentar seu streak
- **Placar Dinâmico**: Veja o progresso de ambos em tempo real

### 🎖️ Achievements
- Desbloqueie conquistas ao atingir marcos
- Primeiras tarefas, streaks, moedas, etc.
- Visão compartilhada de todas as conquistas

### 📊 Histórico
- Timeline interativa de todas as atividades
- Datas formatadas (hoje, ontem, etc)
- Acompanhe a jornada do casal

## 🚀 Como Usar

1. **Abra o index.html no navegador**
   - Simplesmente abra o arquivo `index.html` no seu navegador favorito

2. **Configure os Nomes**
   - Clique no ⚙️ no topo direito
   - Digite seus nomes
   - Clique em "Salvar"

3. **Crie Tarefas**
   - Vá para a aba "📋 Tarefas"
   - Clique em "+ Nova Tarefa"
   - Preencha:
     - Descrição (ex: "Fazer café para ela")
     - Moedas a ganhar (pontos)
     - Tipo (pessoal ou casal)
     - Responsável (você, ela, ou ambos)

4. **Crie Desafios do Casal**
   - Vá para a aba "💑 Casal"
   - Clique em "+ Novo Desafio"
   - Preencha:
     - Descrição (ex: "Assistir filme juntos")
     - Moedas para cada um
     - Dificuldade do desafio

5. **Complete Tarefas**
   - Clique no botão do seu nome na tarefa para completar
   - Ganhe moedas instantaneamente
   - Acompanhe seu progresso em tempo real

6. **Desbloqueie Achievements**
   - Va para a aba "🏆 Achievements"
   - Veja as conquistas desbloqueadas
   - Metas futuras para alcançar

## 💾 Armazenamento

Todos os dados são salvos **automaticamente** no navegador (LocalStorage):
- Sem necessidade de banco de dados
- Sem login necessário
- Funciona offline
- Para limpar tudo: ⚙️ → "Limpar Dados"

## 🔗 Sincronização entre Celulares

Quer jogar sincronizado com sua namorada? Temos 2 formas:

### 📱 Opção 1: Sem Supabase (Fácil)
- Use apenas localStorage
- Atualize manual (F5) para ver mudanças
- Sem sincronização em tempo real
- **Veja:** [SETUP_RAPIDO.md](SETUP_RAPIDO.md)

### 🚀 Opção 2: Com Supabase (Recomendado!)
- Sincronização **automática em tempo real**
- Ambos veem mudanças de forma instantânea
- Gratuito e fácil de configurar
- **Siga:** [SETUP_RAPIDO.md](SETUP_RAPIDO.md)
- 🐛 **Se der erro no SQL:** [COMO_COPIAR_SQL.md](COMO_COPIAR_SQL.md)

## 🎯 Ideias de Tarefas

### Pessoais
- ✅ Fazer exercício (10 ⭐)
- ✅ Ler um capítulo (5 ⭐)
- ✅ Meditar 10 min (8 ⭐)
- ✅ Fazer tarefa de casa (15 ⭐)
- ✅ Limpar quarto (12 ⭐)
- ✅ Estudar para prova (20 ⭐)

### Casal
- ✅ Assistir filme juntos (15 ⭐)
- ✅ Jantar fora (20 ⭐)
- ✅ Passear no parque (10 ⭐)
- ✅ Fazer algo romântico (25 ⭐)
- ✅ Jogar algo juntos (12 ⭐)
- ✅ Cozinhar receita nova (18 ⭐)

## � Deploy na Internet

Quer usar de **qualquer lugar** sem arquivo local? Faça deploy!

- **GitHub Pages** (Grátis)
- **Vercel** (Grátis)  
- **Netlify** (Grátis)

**Veja:** [DEPLOY.md](DEPLOY.md)

---

O site possui temas automáticos:
- Gradientes de cores
- Animações suaves
- Design responsivo (mobile & desktop)
- Interface intuitiva e gamificada

## 🔧 Requisitos

Nada! Apenas um navegador moderno:
- Chrome, Firefox, Safari, Edge
- Suporta mobile
- Não precisa de servidor

## 💡 Dicas

1. **Comece com tarefas fáceis** para ganhar momentum
2. **Use streaks** como motivação diária
3. **Crie desafios juntos** para fortalecer o vínculo
4. **Customize os pontos** baseado no esforço real
5. **Faça check-in regularmente** para manter o hábito

## 📱 Versão Mobile

O site é totalmente responsivo! Use no celular com a mesma experiência.

## 🐛 Troubleshooting

**Dados desapareceram?**
- Verifique se você não limpou o cache/cookies do navegador
- O localStorage pode ter sido limpo

**Quer salvar para outro dispositivo?**
- Copie os dados do DevTools (F12) → Application → LocalStorage
- Você pode fazer um backup JSON manual

---

**Feito com ❤️ para você e sua namorada!**

Versão 1.0 - Gamificação para casais
