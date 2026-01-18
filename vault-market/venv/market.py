from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import random
import time

app = FastAPI()

# Permite que o Next.js (Frontend) converse com a gente
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURAÇÕES ---
# API Pública da CoinGecko (Não precisa de chave, mas tem limite de uso)
COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"

# Preços base para o caso de "FALHA" da API (Modo Simulação)
# Assim seu projeto nunca quebra na frente do recrutador.
FALLBACK_PRICES = {
    "bitcoin": 95000.00,
    "ethereum": 2800.00,
    "solana": 140.00
}

def get_real_price(crypto_id: str):
    """Tenta pegar o preço real na internet"""
    try:
        response = requests.get(
            COINGECKO_URL, 
            params={"ids": crypto_id, "vs_currencies": "usd"},
            timeout=2 # Se demorar mais de 2s, desiste
        )
        data = response.json()
        if crypto_id in data:
            return data[crypto_id]["usd"]
    except:
        pass # Se der erro, silencia e vai para o plano B
    return None

def get_simulated_price(crypto_id: str):
    """Gera um preço matemático baseado em variação aleatória"""
    base = FALLBACK_PRICES.get(crypto_id, 1000.00)
    # Variação de -0.5% a +0.5% para parecer real
    variation = random.uniform(0.995, 1.005)
    return round(base * variation, 2)

@app.get("/")
def read_root():
    return {"status": "Market Analyst Online 📈"}

@app.get("/price/{coin}")
def get_price(coin: str):
    # Padroniza para minusculo (ex: BTC -> bitcoin)
    coin_map = {"btc": "bitcoin", "eth": "ethereum", "sol": "solana"}
    crypto_id = coin_map.get(coin.lower(), coin.lower())
    
    # 1. Tenta o Real
    price = get_real_price(crypto_id)
    source = "REAL_MARKET"
    
    # 2. Se falhar, vai para o Simulado
    if price is None:
        price = get_simulated_price(crypto_id)
        source = "SIMULATION_AI"

    return {
        "symbol": coin.upper(),
        "price": price,
        "currency": "USD",
        "source": source, # Para você saber se é real ou fake
        "timestamp": time.time()
    }