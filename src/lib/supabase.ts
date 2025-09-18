// Supabase service layer for HealthGo patient readings

import { supabase } from '@/integrations/supabase/client';
import { PatientReading } from '@/types/patient';

export const patientService = {
  // Upload CSV data to Supabase
  async uploadReadings(readings: any[]) {
    const startTime = Date.now();
    
    try {
      // Inserir os dados na tabela patient_readings
      const { data, error } = await supabase
        .from('patient_readings')
        .insert(readings)
        .select();

      if (error) {
        console.error('Erro ao inserir dados:', error);
        return {
          success: false,
          inserted_count: 0,
          error_count: readings.length,
          processing_time: (Date.now() - startTime) / 1000,
          message: `Erro ao inserir dados: ${error.message}`
        };
      }

      const processingTime = (Date.now() - startTime) / 1000;
      
      return {
        success: true,
        inserted_count: data?.length || readings.length,
        error_count: 0,
        processing_time: processingTime,
        message: `${data?.length || readings.length} registros inseridos com sucesso`
      };

    } catch (error: any) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        inserted_count: 0,
        error_count: readings.length,
        processing_time: (Date.now() - startTime) / 1000,
        message: `Erro no upload: ${error.message}`
      };
    }
  },

  // Get all patients with summary info
  async getPatients() {
    try {
      const { data, error } = await supabase
        .from('patient_readings')
        .select('paciente_id, paciente_nome, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar pacientes:', error);
        return [];
      }

      // Agrupar por paciente e obter informações resumidas
      const patientMap = new Map();
      
      data?.forEach(reading => {
        const patientId = reading.paciente_id;
        if (!patientMap.has(patientId)) {
          patientMap.set(patientId, {
            paciente_id: patientId,
            paciente_nome: reading.paciente_nome,
            last_reading: reading.created_at,
            total_readings: 1
          });
        } else {
          const patient = patientMap.get(patientId);
          patient.total_readings += 1;
          // Manter a data mais recente
          if (new Date(reading.created_at) > new Date(patient.last_reading)) {
            patient.last_reading = reading.created_at;
          }
        }
      });

      return Array.from(patientMap.values());

    } catch (error: any) {
      console.error('Erro ao buscar pacientes:', error);
      return [];
    }
  },

  // Get patient readings with optional filters
  async getPatientReadings(patientId: string, filters: any = {}) {
    try {
      let query = supabase
        .from('patient_readings')
        .select('*');

      // Filtrar por paciente se especificado
      if (patientId && patientId.trim()) {
        query = query.eq('paciente_id', patientId);
      }

      // Filtros de data
      if (filters.from) {
        query = query.gte('created_at', filters.from);
      }
      if (filters.to) {
        query = query.lte('created_at', filters.to);
      }

      // Ordenar por timestamp
      query = query.order('timestamp', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar leituras:', error);
        return [];
      }

      return data as PatientReading[];

    } catch (error: any) {
      console.error('Erro ao buscar leituras do paciente:', error);
      return [];
    }
  }
};

// Helper para verificar se Supabase está conectado
export function isSupabaseConnected(): boolean {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}