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
  status: String,
  codigo_rastreio: Number,
});

const entregaStatusEnum = {
  PREPARANDO: "PREPARANDO",
  ENVIADO: "ENVIADO",
  EM_TRANSITO: "EM_TRANSITO",
  ENTREGUE: "ENTREGUE",
  CANCELADO: "CANCELADO"
}

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

app.get("/entregas/:id", async (req, res) => {
  try {
    const resultado = await Entrega.findById(req.params.id);

    const entrega = resultado.rows[0];

    if (!entrega) {
      return res.status(404).json({
        erro: "Entrega não encontrada",
      });
    }

    res.json(entrega);
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao buscar entrega",
    });
  }
});

app.get("/entregas/pedido/:pedido_id", async (req, res) => {
  try {
    const resultado = await Entrega.find({ pedido_id: req.params.id });

    const entrega = resultado.rows[0];

    if (!entrega) {
      return res.status(404).json({
        erro: "Entrega não encontrada",
      });
    }

    res.json(entrega);
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao buscar pedido da entrega",
    });
  }
  
})

app.post("/entregas", async (req, res) => {
  const {pedidoId, endereco} = req.body;

  if(!pedidoId){
    return res.status(400).json({
      erro: "pedidoId é obrigatório",
    });
  }

  if(!endereco){
    return res.status(400).json({
      erro: "Endereço é obrigatório",
    });
  }

  try{
    const res_pedido = await axios.get(`${PEDIDOS_URL}/pedidos/${pedidoId}`, 
      {
        timeout:3000
      }
    );

    const pedido = res_pedido.data;

    const entrega = await Entrega.create({
      pedido_id: pedido.id,
      endereco,
      status: entregaStatusEnum.PREPARANDO,
      codigo_rastreio: crypto.randomUUID()
    });

    res.status(201).json(entrega)

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
})

app.put("/entregas/:id/status", async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      erro: "Status é obrigatório",
    });
  }

  if(
    ![entregaStatusEnum.CANCELADO, 
      entregaStatusEnum.EM_TRANSITO, 
      entregaStatusEnum.ENTREGUE, 
      entregaStatusEnum.ENVIADO, 
      entregaStatusEnum.PREPARANDO].includes(status)
    ){
      return res.status(400).json({
        erro: "Status não tem valor possível",
      });
    }

    const id = req.params.id;

    try{
      const entrega = await Entrega.findOneAndUpdate(
        {_id: id},
        {$set: {status: status} },
        {new: true, runValidators: true}
      )

      res.status(200).json(entrega);

    } catch (erro) {
      if (erro.response?.status === 404) {
        return res.status(400).json({
          erro: erro.message,
        });
      }

      return res.status(500).json({
        erro: erro.message,
      });
    }
  
})

app.listen(3004, () => {
  console.log("Entregas rodando na porta 3004");
});
