import Papa from 'papaparse';
import { PatientReading } from '@/types/patient';

export interface ParseResult {
  data: PatientReading[];
  errors: string[];
  patientIds: Set<string>;
}

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const data: PatientReading[] = [];
    const patientIds = new Set<string>();

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        results.data.forEach((row: any, index: number) => {
          try {
            // Validate required fields
            const requiredFields = [
              'paciente_id', 'paciente_nome', 'paciente_cpf',
              'hr', 'spo2', 'pressao_sys', 'pressao_dia', 
              'temp', 'resp_freq', 'status', 'timestamp'
            ];

            const missingFields = requiredFields.filter(field => !row[field]);
            if (missingFields.length > 0) {
              errors.push(`Linha ${index + 2}: Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
              return;
            }

            // Parse and validate data types
            const reading: PatientReading = {
              paciente_id: String(row.paciente_id).trim(),
              paciente_nome: String(row.paciente_nome).trim(),
              paciente_cpf: String(row.paciente_cpf).trim(),
              hr: parseInt(String(row.hr)),
              spo2: parseInt(String(row.spo2)),
              pressao_sys: parseInt(String(row.pressao_sys)),
              pressao_dia: parseInt(String(row.pressao_dia)),
              temp: parseFloat(String(row.temp)),
              resp_freq: parseInt(String(row.resp_freq)),
              status: String(row.status).toUpperCase() as 'NORMAL' | 'ALERTA',
              timestamp: String(row.timestamp).trim(),
            };

            // Validate status
            if (!['NORMAL', 'ALERTA'].includes(reading.status)) {
              errors.push(`Linha ${index + 2}: Status inválido '${row.status}'. Deve ser NORMAL ou ALERTA`);
              return;
            }

            // Validate numeric values
            if (isNaN(reading.hr) || isNaN(reading.spo2) || isNaN(reading.pressao_sys) || 
                isNaN(reading.pressao_dia) || isNaN(reading.temp) || isNaN(reading.resp_freq)) {
              errors.push(`Linha ${index + 2}: Valores numéricos inválidos`);
              return;
            }

            // Validate ranges (basic medical validation)
            if (reading.hr < 30 || reading.hr > 300) {
              errors.push(`Linha ${index + 2}: Frequência cardíaca fora do range válido (30-300 bpm)`);
              return;
            }

            if (reading.spo2 < 50 || reading.spo2 > 100) {
              errors.push(`Linha ${index + 2}: SpO2 fora do range válido (50-100%)`);
              return;
            }

            patientIds.add(reading.paciente_id);
            data.push(reading);

          } catch (error) {
            errors.push(`Linha ${index + 2}: Erro ao processar dados - ${error}`);
          }
        });

        // Sort by timestamp
        data.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        resolve({ data, errors, patientIds });
      },
      error: (error) => {
        errors.push(`Erro ao processar CSV: ${error.message}`);
        resolve({ data: [], errors, patientIds: new Set() });
      }
    });
  });
}

export function generateCSV(data: PatientReading[]): string {
  const headers = [
    'paciente_id', 'paciente_nome', 'paciente_cpf',
    'hr', 'spo2', 'pressao_sys', 'pressao_dia',
    'temp', 'resp_freq', 'status', 'timestamp'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.paciente_id,
      row.paciente_nome,
      row.paciente_cpf,
      row.hr,
      row.spo2,
      row.pressao_sys,
      row.pressao_dia,
      row.temp,
      row.resp_freq,
      row.status,
      row.timestamp
    ].join(','))
  ].join('\n');

  return csvContent;
}