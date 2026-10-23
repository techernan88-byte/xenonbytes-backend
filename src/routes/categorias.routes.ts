

import {Router} from "express";
import {prisma} from "../lib/prisma";

const router = Router();

router.get("/", async (req,res)=>{

    const categorias = await prisma.categoria.findMany({
        orderBy: {nombre:"asc"}
    });
    res.json(categorias);
});

export default router;