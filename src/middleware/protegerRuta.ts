import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";


export function protegerRuta(req: Request, res:Response, next:NextFunction){
    //leer token
    const authHeader=req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({error: "No autorizado: falta el token"});
    }
     // Extrae solo el token (quitar el "Bearer ")
    const token = authHeader.split(" ")[1];

    try{
    //  Verificar el token con el secreto
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as {userId:number};
   // Guardamos el userId del token en req; el "as any" calla a TS porque Request aún no conoce esa propiedad (userId).
    (req as any).userId = payload.userId;
    //daje pasar la ruta
        next();

    } catch(error){
        return res.status(401).json({error: "No autorizado: token inválido o expirado"});
    }
 

    
   
}

