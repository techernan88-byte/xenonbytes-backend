import { Router } from "express";
import { prisma } from "../lib/prisma";
import { responderChat } from "../services/chat.services";
import type { MensajeClaude } from "../types/MensajeChat";

const router = Router();

router.post("/", async (req, res) => {
    const { conversacionId, mensaje } = req.body;

    // primera las validaciones de entrada
    if (typeof mensaje !== "string" || mensaje.trim() === "") {
        return res.status(400).json({ error: "El mensaje es obligatorio" });
    };

    if (
        conversacionId !== null && (typeof conversacionId !== "number" || !Number.isInteger(conversacionId))
    ) {
        return res.status(400).json({ error: "conversacionId debe ser null o número entero" });
    }
    

    ///////// Conversacion

    try {

        let idConversacion: number;
        let historial: MensajeClaude[] = [];

        if (conversacionId === null) {
            // crea la conversacion por primera vez
            const nueva = await prisma.conversacion.create({ data: {} });
            idConversacion = nueva.id;
        } else {
            //validar que exista y cargar historial
            const conv = await prisma.conversacion.findUnique({
                where: { id: conversacionId },
                include: { mensajes: { orderBy: { id: "asc" } } },
            });
            if (!conv) {
                return res.status(404).json({ error: "Conversación no encontrada" })
            }
            idConversacion = conv.id;

            historial = conv.mensajes.map((m) => ({
                role: m.rol as "user" | "assistant",
                content: m.contenido as any,
            }));
        }

        // Agregar el mensaje nuevo del usuario al historial
    
        historial.push({
            role: "user",
            content: mensaje,
        });

 
        // loop con Claude + tools 
        const {historialFinal,respuestaTexto}= await responderChat(historial)

        // --- 4. Persistir los turnos NUEVOS ---   el -1 es tambien para agregar el user 
        const  nuevosTurnos  = historialFinal.slice(historial.length-1);   

        await prisma.mensaje.createMany({
            data: nuevosTurnos.map((turno)=>({
                conversacionId: idConversacion,
                rol: turno.role,
                contenido: turno.content as any,
            })),
        });

        res.json({
            conversacionId:idConversacion,
            respuesta: respuestaTexto,
        });
    }
    catch (error) {
        console.error("Error en /chat", error);
        res.status(500).json({error:"No se pudo procesar el mensaje."});
    }
});

export default router;