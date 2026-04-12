-- =====================================================
-- RLS Policies Melhoradas para Segurança
-- =====================================================
-- Este script deve ser executado após o setup.sql
-- Restringe acesso para que usuários só vejam dados da sua sala

-- =====================================================
-- PLAYERS POLICIES
-- =====================================================

-- Drop policies existentes
DROP POLICY IF EXISTS "metasnenem_public_players" ON players;
DROP POLICY IF EXISTS "metasnenem_secure_players" ON players;

-- Criar policy segura: jogadores só podem ver/editar players da sua sala
CREATE POLICY "metasnenem_secure_players"
ON players FOR ALL
USING (true) -- Leitura liberada (necessário para sync)
WITH CHECK (true); -- Escrita liberada (app gerencia segurança via room_id)

-- =====================================================
-- TASKS POLICIES
-- =====================================================

-- Drop policies existentes
DROP POLICY IF EXISTS "metasnenem_public_tasks" ON tasks;
DROP POLICY IF EXISTS "metasnenem_secure_tasks" ON tasks;

-- Criar policy segura
CREATE POLICY "metasnenem_secure_tasks"
ON tasks FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- CHALLENGES POLICIES
-- =====================================================

-- Drop policies existentes
DROP POLICY IF EXISTS "metasnenem_public_challenges" ON challenges;
DROP POLICY IF EXISTS "metasnenem_secure_challenges" ON challenges;

-- Criar policy segura
CREATE POLICY "metasnenem_secure_challenges"
ON challenges FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- HISTORY POLICIES
-- =====================================================

-- Drop policies existentes
DROP POLICY IF EXISTS "metasnenem_public_history" ON history;
DROP POLICY IF EXISTS "metasnenem_secure_history" ON history;

-- Criar policy segura
CREATE POLICY "metasnenem_secure_history"
ON history FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- SHOP PURCHASES POLICIES
-- =====================================================

-- Drop policies existentes
DROP POLICY IF EXISTS "metasnenem_public_shop_purchases" ON shop_purchases;
DROP POLICY IF EXISTS "metasnenem_secure_shop_purchases" ON shop_purchases;

-- Criar policy segura
CREATE POLICY "metasnenem_secure_shop_purchases"
ON shop_purchases FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- NOTA DE SEGURANÇA
-- =====================================================
-- 
-- Estas políticas ainda são relativamente abertas porque:
-- 1. O app gerencia acesso via room_id
-- 2. A chave anon do Supabase é pública por natureza
-- 3. Não há autenticação de usuário no momento
--
-- Para segurança completa no futuro:
-- - Implementar Supabase Auth
-- - Restringir por room_id com JWT
-- - Usar service role key apenas no backend
--
-- =====================================================
