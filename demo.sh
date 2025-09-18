#!/bin/bash

# HealthGo Demo Script
# Script para validar rapidamente as funcionalidades da API

echo "🏥 HealthGo - Script de Demonstração"
echo "===================================="

# Configuration
BASE_URL="http://localhost:8080"
SAMPLE_CSV="sample.csv"

echo ""
echo "📋 Testando funcionalidades..."

# 1. Test CSV Upload
echo ""
echo "1️⃣ Testando upload de CSV..."
if [ -f "$SAMPLE_CSV" ]; then
    curl -X POST \
         -H "Content-Type: multipart/form-data" \
         -F "file=@$SAMPLE_CSV" \
         "$BASE_URL/api/upload" \
         -w "\nStatus: %{http_code}\nTime: %{time_total}s\n"
else
    echo "❌ Arquivo $SAMPLE_CSV não encontrado!"
fi

echo ""
echo "2️⃣ Listando pacientes disponíveis..."
curl -X GET "$BASE_URL/api/patients" \
     -H "Accept: application/json" \
     -w "\nStatus: %{http_code}\n"

echo ""
echo "3️⃣ Obtendo leituras do paciente PAC001..."
curl -X GET "$BASE_URL/api/patient/PAC001/readings" \
     -H "Accept: application/json" \
     -w "\nStatus: %{http_code}\n"

echo ""
echo "4️⃣ Testando download CSV do paciente PAC001..."
curl -X GET "$BASE_URL/api/patient/PAC001/readings?download=csv" \
     -H "Accept: text/csv" \
     -o "download_test.csv" \
     -w "\nStatus: %{http_code}\nDownload salvo em: download_test.csv\n"

echo ""
echo "5️⃣ Testando filtro por período..."
FROM_DATE="2024-01-15T12:00:00"
TO_DATE="2024-01-15T12:01:00"
curl -X GET "$BASE_URL/api/patient/PAC001/readings?from=$FROM_DATE&to=$TO_DATE" \
     -H "Accept: application/json" \
     -w "\nStatus: %{http_code}\n"

echo ""
echo "✅ Teste de API concluído!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Verifique os logs da aplicação"
echo "   2. Acesse a interface web em http://localhost:8080"
echo "   3. Teste o upload manual de CSV"
echo "   4. Visualize os gráficos interativos"
echo ""
echo "🐳 Para rodar com Docker:"
echo "   docker-compose up --build"
echo ""
echo "💾 Para verificar dados no banco:"
echo "   Acesse o painel do Supabase e verifique a tabela patient_readings"