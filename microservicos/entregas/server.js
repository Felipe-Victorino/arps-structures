const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const connectDB = require("./db");

const app = express();

app.use(express.json());

const PEDIDOS_URL = process.env.PEDIDOS_URL || "https://localhost:3004"

connectDB();

const entregaSchema = new mongoose.Schema({
  pedido_id: Number,
  endereco: String,
  stats: String,
  codigo_rastreio: Number,
});

const Entrega = mongoose.model("Entrega", entregaSchema);

app.listen(3004, () => {
  console.log("Pedidos rodando na porta 3002");
});
