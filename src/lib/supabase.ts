// Supabase client configuration
// Para conectar ao Supabase, use o botão verde "Supabase" no topo da interface Lovable

import { PatientReading } from '@/types/patient';

export interface SupabaseConfig {
  url: string;
  key: string;
}

// Simulação da conexão Supabase (será substituída pela integração nativa do Lovable)
export const supabaseConfig: SupabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  key: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
};

// Mock functions que serão substituídas pela integração real
export const patientService = {
  // Mock - Upload CSV data
  async uploadReadings(readings: any[]) {
    console.warn('⚠️ CONECTE O SUPABASE: Use o botão verde no topo para ativar a integração');
    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      inserted_count: readings.length,
      error_count: 0,
      processing_time: 1.2,
      message: 'Mock upload - conecte o Supabase para funcionamento real'
    };
  },

  // Mock - Get all patients
  async getPatients() {
    console.warn('⚠️ CONECTE O SUPABASE: Use o botão verde no topo para ativar a integração');
    return [
      {
        paciente_id: 'PAC001',
        paciente_nome: 'João Silva',
        last_reading: '2024-01-15 14:30:00',
        total_readings: 25
      },
      {
        paciente_id: 'PAC002',
        paciente_nome: 'Maria Santos',
        last_reading: '2024-01-15 15:45:00',
        total_readings: 18
      }
    ];
  },

  // Mock - Get patient readings
  async getPatientReadings(patientId: string, filters: any = {}) {
    console.warn('⚠️ CONECTE O SUPABASE: Use o botão verde no topo para ativar a integração');
    // Simula dados de exemplo
    return [
      {
        id: '1',
        paciente_id: patientId || 'PAC001',
        paciente_nome: 'João Silva',
        paciente_cpf: '123.456.789-00',
        hr: 75,
        spo2: 98,
        pressao_sys: 120,
        pressao_dia: 80,
        temp: 36.5,
        resp_freq: 16,
        status: 'NORMAL' as const,
        timestamp: '12:00:00.00',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        paciente_id: patientId || 'PAC001',
        paciente_nome: 'João Silva',
        paciente_cpf: '123.456.789-00',
        hr: 85,
        spo2: 96,
        pressao_sys: 140,
        pressao_dia: 90,
        temp: 37.2,
        resp_freq: 20,
        status: 'ALERTA' as const,
        timestamp: '12:05:00.00',
        created_at: new Date().toISOString()
      }
    ] as PatientReading[];
  }
};

// Helper para verificar se Supabase está conectado
export function isSupabaseConnected(): boolean {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}