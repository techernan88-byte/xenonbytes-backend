import {Router} from "express"
import {prisma} from "../lib/prisma"
import { type Prisma } from "@prisma/client"; 

const router =Router();
const PRODUCTOS_X_PAGINA = 12;

router.get("/", async (req, res) => {
  
  // Si no viene o es inválido, EMPIEZA en página 1.
   const page = Math.max(1, Number(req.query.page) || 1);

  // EJEMPLO SALTAR = (3 - 1)* 20 =  40  -> EMPIEZA EN 40 
  const skip= (page- 1) * PRODUCTOS_X_PAGINA;

   // categoria llega como string por query (o undefined si no viene).
  const categoria = 
  typeof req.query.categoria ==="string" ? req.query.categoria : undefined;
  const busqueda =
  typeof req.query.busqueda === "string" ? req.query.busqueda :undefined;
  const disponibles= req.query.disponibles==="true";

  // UN solo where que acumula condiciones. Prisma las combina con AND.
  const where: Prisma.ProductoWhereInput ={};

  if (categoria){
    where.categoria={nombre:categoria}
  };
  if (busqueda){
    where.titulo={contains:busqueda, mode:"insensitive"};
  };
  if (disponibles){
    where.stock={gt:0}
  };


  const  [productos, total]= await Promise.all([ 
    prisma.producto.findMany({
      where:where,
      skip:skip,
      take:PRODUCTOS_X_PAGINA,
      orderBy:{id:"asc"},
      include:{categoria:true},// JOIN con (id, nombre) de la categoria
    }),
    prisma.producto.count({where}),
  ]);

  const productosPlanos = productos.map((p)=>({
    ...p,
    categoria: p.categoria.nombre,
  }));

  res.json({
    productos:productosPlanos,
    total:total,
    page:page,
    totalPaginas: Math.ceil(total /PRODUCTOS_X_PAGINA),
  });
});

export default router;