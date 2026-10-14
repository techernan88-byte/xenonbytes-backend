

import { Router } from "express";
import { extraerProducto } from "../services/catalogdor.services";
 
const router = Router();
 

router.post("/extraer", async (req, res) => {
  const { texto } = req.body;
 
  if (!texto || typeof texto !== "string") {
    return res.status(400).json({ error: "Falta el campo 'texto' (string)." });
  }
 
  try {
    const producto = await extraerProducto(texto);
    res.json(producto);
  } catch (error) {
    console.error("Error al extraer producto:", error);
    res.status(500).json({ error: "No se pudo extraer el producto." });
  }
});
 
export default router;
 
