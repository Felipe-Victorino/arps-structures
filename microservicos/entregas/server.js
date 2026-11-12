const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const connectDB = require("./db");

const app = express();

app.use(express.json());

const PEDIDOS_URL = process.env.PEDIDOS_URL || "https://localhost:3002"

connectDB();

const entregaSchema = new mongoose.Schema({
  pedido_id: Number,
  endereco: String,
  stats: String,
  codigo_rastreio: Number,
});

const Entrega = mongoose.model("Entrega", entregaSchema);

app.get("/entregas", async (req, res) => {
  try {
    const resultado = await Entrega.find().sort({ _id: 1 });

    res.json(resultado);
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao buscar pedidos",
    });
  }
});

app.get("/entregas:id", async (req, res) => {
  try {
    const resultado = await Entrega.findById(req.params.id);

    const pedido = resultado.rows[0];

    if (!pedido) {
      return res.status(404).json({
        erro: "Entrega não encontrada",
      });
    }

    res.json(pedido);
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao buscar entrega",
    });
  }
});

app.listen(3004, () => {
  console.log("Entregas rodando na porta 3004");
});
