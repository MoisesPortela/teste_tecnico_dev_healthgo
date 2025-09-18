import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterState, Patient } from '@/types/patient';
import { Search, RotateCcw } from 'lucide-react';

interface PatientFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  patients: Patient[];
  onSearch: () => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function PatientFilters({ 
  filters, 
  onFiltersChange, 
  patients, 
  onSearch, 
  onClear,
  isLoading = false 
}: PatientFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Filtros de Pesquisa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient">Paciente</Label>
            <Select 
              value={filters.patientId} 
              onValueChange={(value) => onFiltersChange({ ...filters, patientId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar paciente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os pacientes</SelectItem>
                {patients.map((patient) => (
                  <SelectItem key={patient.paciente_id} value={patient.paciente_id}>
                    {patient.paciente_id} - {patient.paciente_nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label htmlFor="dateFrom">Data/Hora Início</Label>
            <Input
              id="dateFrom"
              type="datetime-local"
              value={filters.dateFrom}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label htmlFor="dateTo">Data/Hora Fim</Label>
            <Input
              id="dateTo"
              type="datetime-local"
              value={filters.dateTo}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={onSearch} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            {isLoading ? 'Pesquisando...' : 'Pesquisar'}
          </Button>
          <Button variant="outline" onClick={onClear}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Limpar
          </Button>
        </div>

        {/* Current Filter Info */}
        {filters.patientId && filters.patientId !== 'all' && (
          <div className="text-sm text-muted-foreground">
            Filtro ativo: {patients.find(p => p.paciente_id === filters.patientId)?.paciente_nome || filters.patientId}
            {(filters.dateFrom || filters.dateTo) && (
              <span>
                {filters.dateFrom && ` • De: ${new Date(filters.dateFrom).toLocaleString()}`}
                {filters.dateTo && ` • Até: ${new Date(filters.dateTo).toLocaleString()}`}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}