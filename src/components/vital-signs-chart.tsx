import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PatientReading } from '@/types/patient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VitalSignsChartProps {
  readings: PatientReading[];
}

export function VitalSignsChart({ readings }: VitalSignsChartProps) {
  if (readings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Sem dados para exibir no gráfico</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = readings.map((reading, index) => ({
    timestamp: reading.timestamp,
    hr: reading.hr,
    spo2: reading.spo2,
    systolic: reading.pressao_sys,
    diastolic: reading.pressao_dia,
    temperature: reading.temp,
    respiratory: reading.resp_freq,
    index: index
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const reading = readings.find(r => r.timestamp === label);
      
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium mb-2">{`Tempo: ${label}`}</p>
          <div className="space-y-1 text-sm">
            <p className="text-chart-1">• FC: {data.hr} bpm</p>
            <p className="text-chart-2">• SpO2: {data.spo2}%</p>
            <p className="text-chart-3">• PA: {data.systolic}/{data.diastolic} mmHg</p>
            <p className="text-chart-4">• Temp: {data.temperature}°C</p>
            <p className="text-chart-5">• FR: {data.respiratory} rpm</p>
            {reading && (
              <p className={`font-medium ${reading.status === 'ALERTA' ? 'text-alert' : 'text-success'}`}>
                Status: {reading.status}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sinais Vitais ao Longo do Tempo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="timestamp" 
                className="text-xs"
                tick={{ fontSize: 10 }}
              />
              <YAxis className="text-xs" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line 
                type="monotone" 
                dataKey="hr" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2}
                name="FC (bpm)"
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--chart-1))', strokeWidth: 2 }}
              />
              
              <Line 
                type="monotone" 
                dataKey="spo2" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                name="SpO2 (%)"
                dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--chart-2))', strokeWidth: 2 }}
              />
              
              <Line 
                type="monotone" 
                dataKey="systolic" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2}
                name="PA Sistólica"
                dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--chart-3))', strokeWidth: 2 }}
              />
              
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="hsl(var(--chart-4))" 
                strokeWidth={2}
                name="Temperatura (°C)"
                dot={{ fill: 'hsl(var(--chart-4))', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, stroke: 'hsl(var(--chart-4))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }}></div>
            <span>Frequência Cardíaca</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }}></div>
            <span>Saturação O2</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-3))' }}></div>
            <span>Pressão Sistólica</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-4))' }}></div>
            <span>Temperatura</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}