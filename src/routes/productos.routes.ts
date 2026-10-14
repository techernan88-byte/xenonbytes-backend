import {Router} from "express"
import {prisma} from "../lib/prisma"

const router =Router();

router.get("/", async (req, res) => {
  const productos = await prisma.producto.findMany();
  res.json(productos);
});

export default router;