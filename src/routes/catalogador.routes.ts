

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
    const categorias = await prisma.categoria. findMany({
      select: {nombre:true},
    });
    const nombresCategorias = categorias.map ((c)=>c.nombre);
    //console.log(nombresCategorias);

    const producto = await extraerProducto(texto,nombresCategorias);
    console.log(producto);
    res.json(producto);
  } catch (error) {
    console.error("Error al extraer producto:", error);
    res.status(500).json({ error: "No se pudo extraer el producto." });
  }
});




// Recibe producto para registrar

router.post("/registrar", async (req, res) => {
  const { titulo, precio, categoria, esNueva, descripcion } = req.body;

  if (typeof titulo !== "string" || titulo.trim() === "") {
    return res.status(400).json({ error: "El titulo es obligatorio" });
  };
  if (typeof precio !== "number" || precio <= 0) {
    return res.status(400).json({ error: "El precio debe ser un número mayor a 0." })
  };
  if (typeof categoria !== "string" || categoria.trim() === "") {
    return res.status(400).json({ error: "La categoria debe ser texto" })
  };

  if (descripcion !== undefined && typeof descripcion !== "string") {
    return res.status(400).json({ error: "La descripción debe tener texto" })
  };

  const nombreCategoria = categoria.trim();

  try {
    let categoriaId: number;
    if (esNueva === true) {
      // upsert: si por alguna razón ya existía, se reutiliza (evita duplicados).
      const cat = await prisma.categoria.upsert({
        where: { nombre: nombreCategoria },
        update: {},
        create: { nombre: nombreCategoria }
      });
      categoriaId = cat.id;
    } else {
      // debe existir una categoria con el nombre
      const cat = await prisma.categoria.findUnique({
        where: { nombre: nombreCategoria },
      });
      if (!cat) {
        return res.status(400).json({
          error: `La categoría "${nombreCategoria}" no existe. Márcala como nueva para crearla`,
        });
      }
      categoriaId = cat.id;
    }

    // Crear producto con categoriaId  
    const nuevoProducto = await prisma.producto.create({
      data: {
        titulo: titulo,
        precio: precio,
        categoriaId: categoriaId,
        descripcion: descripcion,
        stock: 1
      },
    });
    res.status(201).json({ Datos: nuevoProducto });
  }
  catch (error) {
    console.error("Error al registrar producto", error);
    res.status(400).json({ error: "no se pudo registrar el producto" })

  }



});




export default router;

