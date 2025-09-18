-- Habilitar Row Level Security na tabela patient_readings
ALTER TABLE patient_readings ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas para acesso público (conforme especificação técnica)
-- Permitir leitura de todos os dados
CREATE POLICY "Permitir leitura de dados dos pacientes" ON patient_readings
    FOR SELECT USING (true);

-- Permitir inserção de novos registros
CREATE POLICY "Permitir inserção de novos registros" ON patient_readings
    FOR INSERT WITH CHECK (true);