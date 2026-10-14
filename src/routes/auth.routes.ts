import {Router} from "express";
import bycrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import {prisma} from "../lib/prisma"
import { protegerRuta } from "../middleware/protegerRuta";

const router = Router();


router.post("/register", async(req,res)=>{
    const {email, password, nombre}=req.body;
    
    if(!email||!password){
        return res.status(400).json({error:"Email y contraseña son obligatorios"});
    }
    
    try{
       const passwordHash= await bycrypt.hash(password,10);

       const usuario= await prisma.user.create({
        data: {
            email:email,
            password:passwordHash,
            nombre:nombre
        }
       });

       res.status(201).json({
        id:usuario.id,
        email:usuario.id,
        nombre:usuario.nombre,
       });

    }catch(error){
        res.status(400).json({error: "El email ya esta registrado"});
    }
});

router.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    if(!email||!password){
        return res.status(400).json({error:"Email y contraseña son obligatorios"});

    }

    //buscarusuario
    const usuario = await prisma.user.findUnique({where:{email}});

    if(!usuario || !(await bycrypt.compare(password, usuario.password))){
        return res.status(401).json({error:"Credenciales inválidas"});
    }

    const token = jwt.sign(
        {userId:usuario.id},
        process.env.JWT_SECRET!,
        {expiresIn:"1h"}
    );

    res.json({
        token,
        usuario:{
            id:usuario.id,
            email:usuario.email,
            nombre:usuario.nombre,
        }
    });

})


// ruta proteguira con token válido


router.get("/me", protegerRuta, async(req, res)=>{
    const userId =(req as any).userId;
    const usuario = await prisma.user.findUnique({
        where:{id:userId},
        select: {id:true, email:true, nombre:true},
    });
    res.json(usuario);
});

export default router;

