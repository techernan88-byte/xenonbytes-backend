import {Router} from "express"
import {prisma} from "../lib/prisma"
import { protegerRuta } from "../middleware/protegerRuta";

const router =Router();
router.use(protegerRuta);

// CARRITO ENDPOINTS

//lee todos los items del carrito, con producto incluido
router.get("/", async (req,res)=>{
  const userId = (req as any).userId;
  const carrito = await prisma.carritoItem.findMany({
    where: {userId},
    include: {producto:true},
    orderBy:{createdAt:"asc"},
  });
  res.json(carrito);
});

// Crea un item nuevo para el usuario
router.post("/", async(req,res)=>{
   const userId = (req as any).userId;
   try{
    const nuevoItem = await prisma.carritoItem.create({
    data:{
      productoId:   req.body.productoId,
      cantidad:     req.body.cantidad,
      seleccionado: req.body.seleccionado,
      userId:userId
    },
  });
  res.status(201).json(nuevoItem);
   }catch(error){
    res.status(400).json({error: "No se pudo agregar: producto inválido"});
   }
  
});

// actualiza item que existe
router.patch("/:id", async (req,res)=>{
  const userId = (req as any).userId;
  const item= await prisma.carritoItem.findFirst({
    where: {id: req.params.id, userId:userId},
  });

  if(!item){
    return res.status(404).json({error:"Item no encontrado"})
  }

    const itemActualizado= await prisma.carritoItem.update({
    where: {id: item.id},
    data:  { cantidad: req.body.cantidad,
             seleccionado: req.body.seleccionado,
           },
  });

  res.json(itemActualizado);
});


// elimina item

router.delete("/:id",async(req,res)=>{
  const userId = (req as any).userId;
  await prisma.carritoItem.deleteMany({
    where:{id: req.params.id,userId:userId},
  });
  res.json({mensaje:`Item eliminado`});
});

export default router;