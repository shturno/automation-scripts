# Node.js Automation Project

Este projeto contém ferramentas para automações, web scraping e scripts utilitários usando Node.js.

## Estrutura do Projeto

```
nodejs_automation/
│
├── src/                    # Código fonte
│   ├── scrapers/           # Módulos de web scraping
│   ├── automations/        # Scripts de automação
│   └── utils/              # Funções utilitárias
│
├── tests/                  # Testes unitários
├── data/                   # Dados de entrada/saída
├── docs/                   # Documentação
├── config/                 # Arquivos de configuração
├── package.json            # Dependências do projeto
└── README.md               # Este arquivo
```

## Instalação

```bash
# Instalar dependências
npm install

# Para instalação em ambiente de desenvolvimento
npm install --save-dev
```

## Uso

O projeto inclui vários scripts NPM para facilitar o uso:

```bash
# Iniciar a aplicação principal
npm start

# Iniciar em modo de desenvolvimento (com auto-reload)
npm run dev

# Executar testes
npm test

# Executar o linter
npm run lint

# Executar web scraper
npm run scrape

# Executar automações agendadas
npm run automate
```

## Utilitários Disponíveis

- Web Scraping com Cheerio ou Puppeteer
- Processamento de dados CSV/Excel
- Agendamento de tarefas com node-cron
- Funções utilitárias para manipulação de arquivos e dados 