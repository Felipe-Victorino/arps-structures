const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const connectDB = require("./db");

const app = express();

app.use(express.json());

connectDB();

const PRODUTOS_URL = process.env.PRODUTOS_URL || "http://localhost:3001";

const CLIENTES_URL = process.env.CLIENTES_URL || "http://localhost:3003";

const pedidoSchema = new mongoose.Schema({
  produto_id: Number,
  cliente_id: Number,
  nome_produto: String,
  preco_unitario: Number,
  quantidade: Number,
  total: Number,
});

const Pedido = mongoose.model("Pedido", pedidoSchema);

app.get("/pedidos", async (req, res) => {
  try {
    const resultado = await Pedido.find().sort({ _id: 1 });

    res.json(resultado);
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao buscar pedidos",
    });
  }
});

app.get("/pedidos/:id", async (req, res) => {
  try {
    console.log(`Finding by id: ${req.params.id}`);
    const resultado = await Pedido.findById(req.params.id);
    console.log(resultado)
    const pedido = resultado;
    
    if (!pedido) {
      return res.status(404).json({
        erro: "Pedido não encontrado",
      });
    }

    res.json(pedido);
  } catch (erro) {
    res.status(500).json({
      erro: erro.message,
    });
  }
});

app.post("/pedidos", async (req, res) => {
  console.log(req.body);
  const { produtoId, clienteId, quantidade } = req.body;
  if (!produtoId) {
    return res.status(400).json({
      erro: "produtoId é obrigatório",
    });
  }

  if (!clienteId) {
    return res.status(400).json({
      erro: "clienteId é obrigatório",
    });
  }

  if (!quantidade) {
    return res.status(400).json({
      erro: "quantidade é obrigatória",
    });
  }

  try {
    const res_produto = await axios.get(
      `${PRODUTOS_URL}/produtos/${produtoId}`,
      {
        timeout: 3000,
      },
    );

    const res_cliente = await axios.get(
      `${CLIENTES_URL}/clientes/${clienteId}`,
      {
        timeout: 3000,
      },
    );

    const produto = res_produto.data;
    const cliente = res_cliente.data;
    const total = produto.preco * quantidade;

    const pedido = await Pedido.create({
      produto_id: produto.id,
      cliente_id: cliente.id,
      nome_produto: produto.nome,
      preco_unitario: produto.preco,
      quantidade,
      total,
    });

    res.status(201).json(pedido);
  } catch (erro) {
    if (erro.response?.status === 404) {
      return res.status(400).json({
        erro: erro.message,
      });
    }

    if (erro.code === "ECONNREFUSED" || erro.code === "ECONNABORTED") {
      return res.status(503).json({
        erro: "Serviço de Produtos indisponível",
      });
    }

    return res.status(500).json({
      erro: erro.message,
    });
  }
});

app.listen(3002, () => {
  console.log("Pedidos rodando na porta 3002");
});
