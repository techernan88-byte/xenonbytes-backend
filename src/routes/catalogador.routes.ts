

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { extraerProducto } from "../services/catalogador.services";

 
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




// Recibe producto para registrar

router.post("/registrar", async (req,res)=>{
  const {titulo, precio, categoria, descripcion}= req.body;

  if(typeof titulo!=="string"||titulo.trim()===""){
    return res.status(400).json({error:"El titulo es obligatorio"});
  };
  if(typeof precio !=="number" || precio<=0){
    return res.status(400).json({error:"El precio debe ser un número mayor a 0."})
  };
  if (typeof categoria !=="string" || categoria.trim()===""){
    return res.status(400).json({error:"La categoria debe ser texto"})
  };

  if (descripcion!==undefined && typeof descripcion!=="string"){
    return res.status(400).json({error:"La descripción debe tener texto"})
  };

  try{
  const nuevoProducto = await prisma.producto.create({
    data:{
      titulo:titulo,
      precio:precio,
      categoria:categoria,
      descripcion:descripcion,
      stock:1
    },
  });
   res.status(201).json ({Datos: nuevoProducto})
}catch(error){
  console.error("Error al registrar producto", error);
  res.status(400).json ({error: "No se pudo registrar el producto"})
} });




export default router;
 
