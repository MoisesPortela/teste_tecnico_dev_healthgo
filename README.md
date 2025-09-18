# 🏥 HealthGo - Sistema de Monitoramento de Pacientes

Sistema web containerizado em Docker para upload, armazenamento e visualização de dados de sinais vitais de pacientes.

## 🎯 Funcionalidades

### ✅ Implementadas
- **Upload de CSV**: Drag & drop com validação rigorosa
- **Validação de dados**: Apenas 1 paciente por arquivo, validação de ranges médicos
- **Armazenamento**: Integração com Supabase (PostgreSQL)  
- **Visualização**: Tabela paginada com destaque para status ALERTA
- **Gráfico interativo**: Sinais vitais ao longo do tempo com Recharts
- **Filtros avançados**: Por paciente e intervalo de tempo
- **Download CSV**: Exportação dos dados filtrados
- **Docker**: Containerização completa com docker-compose

### 🔒 Validações Implementadas
- ✅ Apenas 1 paciente por arquivo CSV
- ✅ Campos obrigatórios e tipos de dados
- ✅ Ranges médicos válidos (FC: 30-300 bpm, SpO2: 50-100%, etc.)
- ✅ Ordenação automática por timestamp
- ✅ Limite de arquivo: 10MB
- ✅ Tratamento robusto de erros com relatórios detalhados

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose
- Conta Supabase (gratuita)

### 1. Configuração do Ambiente

```bash
# Clone o repositório
git clone <repository-url>
cd healthgo

# Copie o arquivo de exemplo
cp .env.example .env
```

### 2. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o script `migrations.sql` no SQL Editor do Supabase
3. Copie as credenciais para o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 3. Executar com Docker

```bash
# Desenvolvimento (com hot-reload)
docker-compose up healthgo-dev

# Produção
docker-compose up --build healthgo

# Em background
docker-compose up -d --build
```

### 4. Acessar a Aplicação

- **Interface Web**: http://localhost:8080 (produção) ou http://localhost:5173 (dev)
- **Status**: Verifique se o Supabase está conectado no cabeçalho

## 📋 Testando a Aplicação

### Upload Manual
1. Use o arquivo `sample.csv` incluído no projeto
2. Arraste para a área de upload ou clique para selecionar
3. Verifique os dados na tabela e gráfico

### Testes Automatizados (API)
```bash
# Dê permissão de execução
chmod +x demo.sh

# Execute os testes
./demo.sh
```

### Testes com cURL

```bash
# Upload CSV
curl -X POST \
     -H "Content-Type: multipart/form-data" \
     -F "file=@sample.csv" \
     http://localhost:8080/api/upload

# Listar pacientes
curl http://localhost:8080/api/patients

# Obter leituras de um paciente
curl http://localhost:8080/api/patient/PAC001/readings

# Download CSV
curl "http://localhost:8080/api/patient/PAC001/readings?download=csv" \
     -o dados_paciente.csv
```

## 🏗️ Arquitetura Técnica

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui + Recharts
- **Backend**: Supabase (PostgreSQL + APIs automáticas)
- **Containerização**: Docker + Docker Compose
- **Validação**: Papa Parse + validação customizada

### Estrutura de Pastas
```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn)
│   ├── patient-table.tsx
│   ├── vital-signs-chart.tsx
│   └── patient-filters.tsx
├── lib/                # Utilitários
│   ├── csv-parser.ts   # Parser e validador CSV
│   └── supabase.ts     # Cliente Supabase
├── types/              # Tipos TypeScript
│   └── patient.ts
└── pages/              # Páginas principais
    └── Index.tsx
```

### Banco de Dados

**Tabela**: `patient_readings`

| Campo | Tipo | Restrições |
|-------|------|------------|
| id | UUID | PK, auto |
| paciente_id | TEXT | NOT NULL |
| paciente_nome | TEXT | NOT NULL |
| paciente_cpf | TEXT | NOT NULL |
| hr | INTEGER | 30-300 bpm |
| spo2 | INTEGER | 50-100% |
| pressao_sys | INTEGER | 50-250 mmHg |
| pressao_dia | INTEGER | 30-150 mmHg |
| temp | NUMERIC(4,1) | 30.0-45.0°C |
| resp_freq | INTEGER | 5-60 rpm |
| status | TEXT | NORMAL\\|ALERTA |
| timestamp | TEXT | HH:MM:SS.ss |
| created_at | TIMESTAMPTZ | auto |

## 📊 Funcionalidades Avançadas

### Gráfico Interativo
- Múltiplas séries de dados (FC, SpO2, PA, Temp)
- Tooltip detalhado com todos os valores
- Cores diferenciadas por tipo de sinal vital
- Responsivo e acessível

### Filtros Inteligentes
- Seleção por paciente (dropdown)
- Intervalo de data/hora
- Busca em tempo real
- Limpar filtros

### Validação Robusta
- Parser CSV tolerante a vírgulas e aspas
- Validação de ranges médicos realistas
- Relatório detalhado de erros por linha
- Prevenção de múltiplos pacientes por arquivo

## 🔧 Scripts Disponíveis

```json
{
  "dev": "vite",
  "build": "tsc && vite build", 
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "docker:build": "docker build -t healthgo .",
  "docker:run": "docker run -p 8080:8080 healthgo",
  "docker:up": "docker-compose up --build"
}
```

## 🐛 Solução de Problemas

### Erro: "Conecte o Supabase"
- Verifique as variáveis de ambiente no `.env`
- Execute o script `migrations.sql` no Supabase
- Reinicie o container: `docker-compose restart`

### CSV não é aceito
- Verifique se o arquivo tem extensão `.csv`
- Confirme que contém apenas 1 `paciente_id`
- Valide os tipos de dados e ranges

### Gráfico não aparece
- Certifique-se de que há dados carregados
- Verifique console do navegador para erros
- Confirme que os timestamps estão em formato válido

## 📈 Exemplos de Uso

### Formato CSV Esperado
```csv
paciente_id,paciente_nome,paciente_cpf,hr,spo2,pressao_sys,pressao_dia,temp,resp_freq,status,timestamp
PAC001,João Silva,123.456.789-00,75,98,120,80,36.5,16,NORMAL,12:00:00.00
```

### Comportamentos
- **Append**: Novos CSVs do mesmo paciente são adicionados aos existentes
- **Ordenação**: Dados sempre ordenados por timestamp
- **Destaque**: Linhas com status ALERTA aparecem em vermelho
- **Download**: CSV baixado contém apenas dados filtrados

## 🚢 Deploy em Produção

### Variáveis de Ambiente Necessárias
```env
VITE_SUPABASE_URL=https://projeto.supabase.co
VITE_SUPABASE_ANON_KEY=chave_anonima
NODE_ENV=production
```

### Docker Production
```bash
docker-compose -f docker-compose.yml up -d healthgo
```

## 🤝 Desenvolvimento

### Rodar Localmente (sem Docker)
```bash
npm install
npm run dev
```

### Contribuir
1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto é parte de um teste técnico e está disponível apenas para fins educacionais.

---

**HealthGo** - Monitoramento de Pacientes com Tecnologia Moderna 🏥💙