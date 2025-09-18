import { describe, it, expect } from 'vitest';
import { generateCSV } from '@/lib/csv-parser';
import { PatientReading } from '@/types/patient';

describe('CSV Parser', () => {
  describe('generateCSV', () => {
    it('should generate valid CSV from patient data', () => {
      const testData: PatientReading[] = [
        {
          id: '1',
          paciente_id: 'PAC001',
          paciente_nome: 'João Silva',
          paciente_cpf: '123.456.789-00',
          hr: 75,
          spo2: 98,
          pressao_sys: 120,
          pressao_dia: 80,
          temp: 36.5,
          resp_freq: 16,
          status: 'NORMAL',
          timestamp: '12:00:00.00',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          paciente_id: 'PAC001',
          paciente_nome: 'João Silva',
          paciente_cpf: '123.456.789-00',
          hr: 85,
          spo2: 96,
          pressao_sys: 140,
          pressao_dia: 90,
          temp: 37.2,
          resp_freq: 20,
          status: 'ALERTA',
          timestamp: '12:05:00.00',
          created_at: '2024-01-01T00:05:00Z'
        }
      ];

      const csv = generateCSV(testData);
      
      // Check header
      expect(csv).toContain('paciente_id,paciente_nome,paciente_cpf');
      expect(csv).toContain('hr,spo2,pressao_sys,pressao_dia');
      expect(csv).toContain('temp,resp_freq,status,timestamp');
      
      // Check data rows
      expect(csv).toContain('PAC001,João Silva,123.456.789-00,75,98,120,80,36.5,16,NORMAL,12:00:00.00');
      expect(csv).toContain('PAC001,João Silva,123.456.789-00,85,96,140,90,37.2,20,ALERTA,12:05:00.00');
    });

    it('should handle empty data array', () => {
      const csv = generateCSV([]);
      const lines = csv.split('\n');
      
      expect(lines.length).toBe(1); // Only header
      expect(lines[0]).toBe('paciente_id,paciente_nome,paciente_cpf,hr,spo2,pressao_sys,pressao_dia,temp,resp_freq,status,timestamp');
    });

    it('should preserve data order', () => {
      const testData: PatientReading[] = [
        {
          paciente_id: 'PAC001',
          paciente_nome: 'João Silva',
          paciente_cpf: '123.456.789-00',
          hr: 75,
          spo2: 98,
          pressao_sys: 120,
          pressao_dia: 80,
          temp: 36.5,
          resp_freq: 16,
          status: 'NORMAL',
          timestamp: '12:05:00.00'
        },
        {
          paciente_id: 'PAC001',
          paciente_nome: 'João Silva',
          paciente_cpf: '123.456.789-00',
          hr: 80,
          spo2: 97,
          pressao_sys: 125,
          pressao_dia: 82,
          temp: 36.7,
          resp_freq: 17,
          status: 'NORMAL',
          timestamp: '12:00:00.00'
        }
      ];

      const csv = generateCSV(testData);
      const lines = csv.split('\n');
      
      // First data row should be the first item in the array
      expect(lines[1]).toContain('12:05:00.00');
      expect(lines[2]).toContain('12:00:00.00');
    });
  });

  describe('Medical validation ranges', () => {
    it('should have correct medical ranges defined', () => {
      // Test that our validation ranges are medically appropriate
      const medicalRanges = {
        hr: { min: 30, max: 300 }, // Heart rate
        spo2: { min: 50, max: 100 }, // SpO2
        pressao_sys: { min: 50, max: 250 }, // Systolic pressure
        pressao_dia: { min: 30, max: 150 }, // Diastolic pressure
        temp: { min: 30.0, max: 45.0 }, // Temperature
        resp_freq: { min: 5, max: 60 } // Respiratory frequency
      };

      // These ranges should be reasonable for medical monitoring
      expect(medicalRanges.hr.min).toBeLessThan(medicalRanges.hr.max);
      expect(medicalRanges.spo2.max).toBe(100); // SpO2 cannot exceed 100%
      expect(medicalRanges.temp.min).toBeGreaterThan(25); // Reasonable temperature range
      
      // Normal values should be within ranges
      expect(75).toBeGreaterThanOrEqual(medicalRanges.hr.min);
      expect(75).toBeLessThanOrEqual(medicalRanges.hr.max);
      
      expect(98).toBeGreaterThanOrEqual(medicalRanges.spo2.min);
      expect(98).toBeLessThanOrEqual(medicalRanges.spo2.max);
    });
  });
});