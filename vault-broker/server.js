const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Endereços dos nossos outros microsserviços
const LEDGER_URL = "http://localhost:3001"; // Go
const MARKET_URL = "http://localhost:8000"; // Python

// ROTA DE COMPRA/VENDA (A Mágica Acontece Aqui)
app.post("/trade", async (req, res) => {
  const { userId, coin, amount, type } = req.body;
  // type: "BUY" ou "SELL"
  // amount: Quantidade de moedas (ex: 0.1 BTC)

  try {
    console.log(
      `🤖 Iniciando Trade: ${type} ${amount} ${coin} para ${userId}...`,
    );

    // PASSO 1: Perguntar ao Python quanto custa a moeda AGORA
    const priceResponse = await axios.get(`${MARKET_URL}/price/${coin}`);
    const currentPrice = priceResponse.data.price;

    if (!currentPrice)
      return res.status(500).json({ error: "Mercado indisponível" });

    // PASSO 2: Calcular o total em Dólares
    // Se for COMPRA, o custo é negativo (sai da conta). Se for VENDA, é positivo.
    let totalCost = currentPrice * amount;
    if (type === "BUY") {
      totalCost = -totalCost; // Remove dinheiro
    }

    console.log(
      `💰 Cotação: $${currentPrice} | Total Transação: $${totalCost}`,
    );

    // PASSO 3: Tentar executar no Cofre (Go)
    // O Go vai bloquear se não tiver saldo (Atomicidade)
    const ledgerResponse = await axios.post(`${LEDGER_URL}/transaction`, {
      user_id: userId,
      amount: totalCost, // Manda o valor já negativo se for compra
      type: `TRADE_${type}_${coin.toUpperCase()}`,
    });

    // Se chegou aqui, o Go aprovou!
    return res.json({
      status: "EXECUTED",
      details: {
        coin: coin,
        amount: amount,
        price_at_execution: currentPrice,
        total_value: Math.abs(totalCost), // Valor absoluto para mostrar bonito
        new_balance: ledgerResponse.data.new_balance,
      },
    });
  } catch (error) {
    // Se o Go recusou (Erro 400 - Saldo Insuficiente)
    if (error.response && error.response.data) {
      console.log("❌ Transação Recusada pelo Cofre:", error.response.data);
      return res
        .status(400)
        .json({ error: "Transação falhou", reason: error.response.data });
    }
    console.error("Erro interno:", error.message);
    return res.status(500).json({ error: "Erro no Broker" });
  }
});

app.listen(4000, () => {
  console.log("👔 VaultX Broker (Gerente) rodando na porta 4000");
});
