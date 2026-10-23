import { Router } from "express";
import { generarProductos } from "../services/generador.services";

const router = Router();

const MAXIMO=20;

router.post("/generar", async (req,res)=>{
    const {cantidad, categoria}=req.body;

    if (typeof cantidad!=="number" || cantidad <1 || cantidad>MAXIMO){
        return res
            .status(400)
            .json({error: `La cantidad debe ser un número entre 1 y ${MAXIMO}`});
    }

    if (typeof categoria!=="string" || categoria.trim()===""){
        return res.status(400).json({error:`La categoría es obligatoria`});
    }

    try{
       const productos = await generarProductos(cantidad,categoria.trim());
       res.json(productos); 
    }catch(error){
        console.error("Error al generar productos",error);
        res.status(500).json
    }

    

});

export default router;