import React from 'react';
import { PatientReading } from '@/types/patient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatientTableProps {
  readings: PatientReading[];
  isLoading?: boolean;
  onDownload: () => void;
}

export function PatientTable({ readings, isLoading = false, onDownload }: PatientTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (readings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum registro encontrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Dados do Paciente</CardTitle>
        <Button onClick={onDownload} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium">Timestamp</th>
                <th className="text-left p-3 font-medium">FC (bpm)</th>
                <th className="text-left p-3 font-medium">SpO2 (%)</th>
                <th className="text-left p-3 font-medium">Sistólica</th>
                <th className="text-left p-3 font-medium">Diastólica</th>
                <th className="text-left p-3 font-medium">Temp (°C)</th>
                <th className="text-left p-3 font-medium">FR (rpm)</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((reading, index) => (
                <tr 
                  key={`${reading.paciente_id}-${reading.timestamp}-${index}`}
                  className={cn(
                    "border-b border-border/50 transition-colors hover:bg-muted/50",
                    reading.status === 'ALERTA' && "bg-alert/5 hover:bg-alert/10"
                  )}
                >
                  <td className="p-3 font-mono text-sm">{reading.timestamp}</td>
                  <td className="p-3">{reading.hr}</td>
                  <td className="p-3">{reading.spo2}</td>
                  <td className="p-3">{reading.pressao_sys}</td>
                  <td className="p-3">{reading.pressao_dia}</td>
                  <td className="p-3">{reading.temp.toFixed(1)}</td>
                  <td className="p-3">{reading.resp_freq}</td>
                  <td className="p-3">
                    <Badge 
                      variant={reading.status === 'ALERTA' ? 'destructive' : 'secondary'}
                      className={cn(
                        reading.status === 'ALERTA' && "bg-alert text-alert-foreground"
                      )}
                    >
                      {reading.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground text-center">
          Total: {readings.length} registros
          {readings.filter(r => r.status === 'ALERTA').length > 0 && (
            <span className="ml-4 text-alert font-medium">
              • {readings.filter(r => r.status === 'ALERTA').length} alertas
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}