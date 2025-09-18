export interface PatientReading {
  id?: string;
  paciente_id: string;
  paciente_nome: string;
  paciente_cpf: string;
  hr: number; // Heart Rate (bpm)
  spo2: number; // SpO2 (%)
  pressao_sys: number; // Systolic Pressure (mmHg)
  pressao_dia: number; // Diastolic Pressure (mmHg)
  temp: number; // Temperature (°C)
  resp_freq: number; // Respiratory Frequency (rpm)
  status: 'NORMAL' | 'ALERTA';
  timestamp: string; // Time format: HH:MM:SS.ss
  created_at?: string;
}

export interface Patient {
  paciente_id: string;
  paciente_nome: string;
  last_reading: string;
  total_readings: number;
}

export interface UploadResult {
  success: boolean;
  message: string;
  inserted_count: number;
  error_count: number;
  processing_time: number;
  errors?: string[];
}

export interface FilterState {
  patientId: string;
  dateFrom: string;
  dateTo: string;
}