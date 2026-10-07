import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";  

const app = express();
const  PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(cors()); 
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Back funcionando de Xenonbyte");
});

app.get("/productos", async (req, res) => {
  const productos = await prisma.producto.findMany();
  res.json(productos);
});



// CARRITO ENDPOINTS

//lee todos los items del carrito
app.get("/carrito", async (req,res)=>{
  const carrito = await prisma.carritoItem.findMany({
    orderBy:{createdAt:"asc"}
  });
  res.json(carrito);
});

// Crea un item nuevo
app.post("/carrito", async(req,res)=>{
  const nuevoItem = await prisma.carritoItem.create({
    data:{
      productoId:   req.body.productoId,
      cantidad:     req.body.cantidad,
      seleccionado: req.body.seleccionado
    },
  });
  res.json(nuevoItem);
});

// actualiza item que existe
app.patch("/carrito/:id", async (req,res)=>{
  const itemActualizado= await prisma.carritoItem.update({
    where: {id: req.params.id},
    data: req.body,
  });
  res.json(itemActualizado);
});


// elimina item

app.delete("/carrito/:id",async(req,res)=>{
  await prisma.carritoItem.delete({
    where:{id: req.params.id},
  });
  res.json({mensaje:`Item eliminado`});
});


//prueba de ejecución con puerto
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

