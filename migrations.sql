-- HealthGo Database Schema
-- Script para criar tabela patient_readings no Supabase

-- Habilitar RLS (Row Level Security) se necessário
-- ALTER TABLE patient_readings ENABLE ROW LEVEL SECURITY;

-- Criar tabela principal
CREATE TABLE IF NOT EXISTS patient_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id TEXT NOT NULL,
    paciente_nome TEXT NOT NULL,
    paciente_cpf TEXT NOT NULL,
    hr INTEGER NOT NULL CHECK (hr >= 30 AND hr <= 300),
    spo2 INTEGER NOT NULL CHECK (spo2 >= 50 AND spo2 <= 100),
    pressao_sys INTEGER NOT NULL CHECK (pressao_sys >= 50 AND pressao_sys <= 250),
    pressao_dia INTEGER NOT NULL CHECK (pressao_dia >= 30 AND pressao_dia <= 150),
    temp NUMERIC(4,1) NOT NULL CHECK (temp >= 30.0 AND temp <= 45.0),
    resp_freq INTEGER NOT NULL CHECK (resp_freq >= 5 AND resp_freq <= 60),
    status TEXT NOT NULL CHECK (status IN ('NORMAL', 'ALERTA')),
    timestamp TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_patient_readings_paciente_id ON patient_readings (paciente_id);
CREATE INDEX IF NOT EXISTS idx_patient_readings_timestamp ON patient_readings (timestamp);
CREATE INDEX IF NOT EXISTS idx_patient_readings_created_at ON patient_readings (created_at);
CREATE INDEX IF NOT EXISTS idx_patient_readings_status ON patient_readings (status);

-- Índice composto para consultas filtradas por paciente e período
CREATE INDEX IF NOT EXISTS idx_patient_readings_composite ON patient_readings (paciente_id, timestamp, status);

-- Comentários para documentação
COMMENT ON TABLE patient_readings IS 'Tabela para armazenar leituras de sinais vitais dos pacientes do HealthGo';
COMMENT ON COLUMN patient_readings.paciente_id IS 'Identificador único do paciente (ex: PAC001)';
COMMENT ON COLUMN patient_readings.paciente_nome IS 'Nome completo do paciente';
COMMENT ON COLUMN patient_readings.paciente_cpf IS 'CPF do paciente';
COMMENT ON COLUMN patient_readings.hr IS 'Frequência cardíaca em batimentos por minuto (30-300)';
COMMENT ON COLUMN patient_readings.spo2 IS 'Saturação de oxigênio em porcentagem (50-100)';
COMMENT ON COLUMN patient_readings.pressao_sys IS 'Pressão arterial sistólica em mmHg (50-250)';
COMMENT ON COLUMN patient_readings.pressao_dia IS 'Pressão arterial diastólica em mmHg (30-150)';
COMMENT ON COLUMN patient_readings.temp IS 'Temperatura corporal em graus Celsius (30.0-45.0)';
COMMENT ON COLUMN patient_readings.resp_freq IS 'Frequência respiratória por minuto (5-60)';
COMMENT ON COLUMN patient_readings.status IS 'Status da leitura: NORMAL ou ALERTA';
COMMENT ON COLUMN patient_readings.timestamp IS 'Timestamp da coleta no formato HH:MM:SS.ss';
COMMENT ON COLUMN patient_readings.created_at IS 'Timestamp de inserção no banco de dados';

-- Política RLS básica (opcional - ajustar conforme necessidades de segurança)
-- CREATE POLICY "Permitir leitura de dados dos pacientes" ON patient_readings
--     FOR SELECT USING (true);

-- CREATE POLICY "Permitir inserção de novos registros" ON patient_readings
--     FOR INSERT WITH CHECK (true);