package main

import (
	"fmt"
	"log"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// --- ESTRUTURAS ---
type Wallet struct {
	ID      string  `json:"id"`
	Balance float64 `json:"balance"`
}

type TransactionRequest struct {
	UserID string  `json:"user_id"`
	Amount float64 `json:"amount"`
	Type   string  `json:"type"`
}

// --- BANCO DE DADOS (MEMÓRIA) ---
var (
	wallets = map[string]*Wallet{
		"user123": {ID: "user123", Balance: 10000.00},
	}
	mutex sync.Mutex
)

func main() {
	app := fiber.New()
	app.Use(cors.New())

	// ROTA 1: VER SALDO
	app.Get("/balance/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		mutex.Lock()
		wallet, exists := wallets[id]
		mutex.Unlock()

		if !exists {
			return c.Status(404).JSON(fiber.Map{"error": "Carteira não encontrada"})
		}
		return c.JSON(wallet)
	})

	// ROTA 2: TRANSAÇÃO
	app.Post("/transaction", func(c *fiber.Ctx) error {
		var req TransactionRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Dados inválidos"})
		}

		mutex.Lock()
		defer mutex.Unlock()

		wallet, exists := wallets[req.UserID]
		if !exists {
			return c.Status(404).JSON(fiber.Map{"error": "Usuário inexistente"})
		}

		// Verifica saldo se for saque/compra (valor negativo)
		if req.Amount < 0 && (wallet.Balance+req.Amount) < 0 {
			return c.Status(400).JSON(fiber.Map{"error": "Saldo insuficiente"})
		}

		wallet.Balance += req.Amount
		wallets[req.UserID] = wallet

		fmt.Printf("💰 Nova transação: %.2f | Novo Saldo: %.2f\n", req.Amount, wallet.Balance)
		return c.JSON(wallet)
	})

	fmt.Println("🚀 VaultX Ledger rodando na porta 3001")
	log.Fatal(app.Listen(":3001"))
}