import React, { useState, useCallback } from 'react';
import { PatientReading, FilterState, Patient, UploadResult } from '@/types/patient';
import { FileUpload } from '@/components/ui/file-upload';
import { PatientTable } from '@/components/patient-table';
import { PatientFilters } from '@/components/patient-filters';
import { VitalSignsChart } from '@/components/vital-signs-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { parseCSV, generateCSV } from '@/lib/csv-parser';
import { patientService } from '@/lib/supabase';
import { Activity, Upload, Heart } from 'lucide-react';

const Index = () => {
  const [readings, setReadings] = useState<PatientReading[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    patientId: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const { toast } = useToast();

  // Load patients on component mount
  React.useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = useCallback(async () => {
    try {
      const patientsData = await patientService.getPatients();
      setPatients(patientsData);
    } catch (error) {
      toast({
        title: 'Erro ao carregar pacientes',
        description: 'Não foi possível carregar a lista de pacientes.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 10MB.',
          variant: 'destructive',
        });
        return;
      }

      setIsUploading(true);
      setUploadResult(null);

      try {
        const startTime = Date.now();
        const parseResult = await parseCSV(file);

        if (parseResult.patientIds.size > 1) {
          const patientList = Array.from(parseResult.patientIds).join(', ');
          toast({
            title: 'Múltiplos pacientes detectados',
            description: `CSV contém múltiplos paciente_id: ${patientList}. Envie apenas 1 paciente por arquivo.`,
            variant: 'destructive',
          });
          setIsUploading(false);
          return;
        }

        if (parseResult.errors.length > 0) {
          toast({
            title: 'Erros encontrados no CSV',
            description: `${parseResult.errors.length} erro(s) encontrado(s). Verifique os dados.`,
            variant: 'destructive',
          });

          // Show detailed errors
          parseResult.errors.slice(0, 5).forEach((error, index) => {
            setTimeout(() => {
              toast({
                title: `Erro ${index + 1}`,
                description: error,
                variant: 'destructive',
              });
            }, index * 1000);
          });

          setIsUploading(false);
          return;
        }

        // Upload to database
        const result = await patientService.uploadReadings(parseResult.data);
        const processingTime = (Date.now() - startTime) / 1000;

        setUploadResult({
          ...result,
          processing_time: processingTime,
        });

        if (result.success) {
          toast({
            title: 'Upload realizado com sucesso',
            description: `${result.inserted_count} registros inseridos em ${processingTime.toFixed(1)}s`,
          });

          // Refresh patients and load data for uploaded patient
          await loadPatients();
          if (parseResult.data.length > 0) {
            setFilters((prev) => ({ ...prev, patientId: parseResult.data[0].paciente_id }));
            handleSearch(parseResult.data[0].paciente_id);
          }
        }
      } catch (error) {
        toast({
          title: 'Erro no upload',
          description: 'Erro interno ao processar o arquivo.',
          variant: 'destructive',
        });
        console.error('Upload error:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [toast, loadPatients]
  );

  const handleSearch = useCallback(
    async (patientId?: string) => {
      setIsLoading(true);

      try {
        const searchPatientId = patientId || filters.patientId;
        const finalPatientId = searchPatientId === 'all' ? '' : searchPatientId;
        const searchFilters = {
          from: filters.dateFrom,
          to: filters.dateTo,
        };

        const data = await patientService.getPatientReadings(finalPatientId, searchFilters);
        setReadings(data);

        if (data.length === 0) {
          toast({
            title: 'Nenhum registro encontrado',
            description: 'Tente ajustar os filtros de pesquisa.',
          });
        }
      } catch (error) {
        toast({
          title: 'Erro na pesquisa',
          description: 'Não foi possível carregar os dados.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [filters, toast]
  );

  const handleDownload = useCallback(() => {
    if (readings.length === 0) {
      toast({
        title: 'Sem dados para download',
        description: 'Execute uma pesquisa primeiro.',
        variant: 'destructive',
      });
      return;
    }

    const csvContent = generateCSV(readings);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `healthgo-${filters.patientId === 'all' ? 'all' : filters.patientId || 'all'}-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Download concluído',
      description: `${readings.length} registros exportados.`,
    });
  }, [readings, filters.patientId, toast]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      patientId: 'all',
      dateFrom: '',
      dateTo: '',
    });
    setReadings([]);
    setUploadResult(null);
  }, []);

  const alertCount = readings.filter((r) => r.status === 'ALERTA').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Heart className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">HealthGo</h1>
              </div>
              <Badge variant="secondary" className="ml-4">
                Monitoramento de Pacientes
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload de Dados Clínicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onFileSelect={handleFileUpload} disabled={isUploading} />

            {isUploading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 text-primary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Processando arquivo...
                </div>
              </div>
            )}

            {uploadResult && (
              <div className="mt-4">
                <Alert>
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Upload {uploadResult.success ? 'concluído' : 'falhou'}:</strong>{' '}
                    {uploadResult.message}
                    <br />
                    Registros inseridos: {uploadResult.inserted_count} | Erros:{' '}
                    {uploadResult.error_count} | Tempo: {uploadResult.processing_time.toFixed(1)}s
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <PatientFilters
          filters={filters}
          onFiltersChange={setFilters}
          patients={patients}
          onSearch={() => handleSearch()}
          onClear={handleClearFilters}
          isLoading={isLoading}
        />

        {/* Data Visualization */}
        {readings.length > 0 && (
          <>
            {/* Chart */}
            <VitalSignsChart readings={readings} />

            {/* Table */}
            <PatientTable readings={readings} isLoading={isLoading} onDownload={handleDownload} />
          </>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>HealthGo - Sistema de Monitoramento de Pacientes</p>
          <p>Desenvolvido para processar dados de sinais vitais com validação rigorosa</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
