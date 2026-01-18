# 🏦 VaultX High-Frequency Trading Platform

> Um simulador de trading de criptomoedas distribuído, focado em precisão financeira e dados em tempo real.

![Status](https://img.shields.io/badge/status-online-emerald)
![Tech](https://img.shields.io/badge/stack-Go_|_Python_|_Node_|_Next.js-blue)

## 💼 Sobre o Projeto

O **VaultX** é uma plataforma de simulação de investimentos que resolve o desafio de **orquestrar transações financeiras** em um ambiente de microsserviços.

O sistema garante consistência de saldo (ACID-like) enquanto consome dados de mercado voláteis em tempo real, permitindo que o usuário execute ordens de compra/venda com feedback instantâneo.

---

## 🏗️ Arquitetura de Microsserviços

O sistema foi desenhado para utilizar a melhor ferramenta para cada tarefa:

| Serviço            | Tecnologia            | Responsabilidade (Role)                                                                                                 | Porta   |
| ------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------- |
| **Ledger (Cofre)** | **Golang (Fiber)**    | Gerenciamento de saldo com Mutex para garantir atomicidade e evitar "race conditions".                                  | `:3001` |
| **Market Data**    | **Python (FastAPI)**  | Busca preços reais (CoinGecko API) e implementa fallback inteligente com simulação matemática em caso de falha de rede. | `:8000` |
| **Broker**         | **Node.js (Express)** | Orquestrador. Recebe ordens, valida cotações atuais e autoriza débitos no Ledger.                                       | `:4000` |
| **Terminal**       | **Next.js 14**        | Dashboard reativo para o investidor final.                                                                              | `:3000` |

---

## 🚀 Funcionalidades Chave

- **Integridade Financeira:** O Ledger em Go impede saldo negativo matematicamente.
- **Resiliência:** O serviço Python alterna automaticamente entre API Real e Simulação se a internet cair.
- **Trader Experience:** Interface inspirada em terminais financeiros (Bloomberg) com atualização a cada 5 segundos.

---

## ⚙️ Como Rodar Localmente

Você precisará de 4 terminais.

### 1. Iniciar o Ledger (Go)

```bash
cd vault-ledger
go run main.go
```

```bash

cd vault-market
# Ative seu venv antes
uvicorn market:app --reload --port 8000
```

```bash

cd vault-broker
node server.js

```

```bash

cd vault-frontend
npm run dev

```
