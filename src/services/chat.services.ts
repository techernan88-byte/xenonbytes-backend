import Anthropic from "@anthropic-ai/sdk";
import { MensajeClaude } from "../types/MensajeChat";
import { TOOLS, ejecutarTool } from "./chatTools";

const anthropic = new Anthropic();

const SYSTEM_PROMT = `Eres un asesor virtual de Xenonbytes, una tienda mexicana de componentes de PC
Tu rol:
-Ayudas a usuarios a elegir componentes de PC (tarjetas de video, procesadores, memorias RAM, tarjetas madre, fuentes de poder, gabinetes, almacenamiento, enfriamiento, monitores y periféricos)
-Hablas en español, con tono cercano pero profesional.
- Si nop tienes informacion especpifica (precios, stock, catalogo), SE HONESTO: aun no tienes acceso al catalogo real.

Reglas:
-Nunca inventes productos ni precios.
-Si el usuario pregunta por algo fuera del tema de PCs, redirige amablemente.
-Manten respuestas concisas; no abrumes con texto
`;

const MAX_ITERACIONES = 5;

export async function responderChat(
    historialInicial: MensajeClaude[]
): Promise<{ historialFinal: MensajeClaude[]; respuestaTexto: string }> {

    const historial: MensajeClaude[] = [...historialInicial]

    //realiza peticion a API de Claude
    for (let i = 0; i < MAX_ITERACIONES; i++) {

        const respuesta = await anthropic.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 2048,
            system: SYSTEM_PROMT,
            tools: TOOLS,
            messages: historial
        });


        historial.push({
            role: "assistant",
            content: respuesta.content,
        });

        /// Loop con Claude  + Tools

     

         if (respuesta.stop_reason === "end_turn") {
            const textoFinal= respuesta.content.filter(
                (b): b is Anthropic.TextBlock => b.type ==="text"
            ).map((b)=>b.text)
            .join("\n");
            return {historialFinal: historial, respuestaTexto:textoFinal}
         };

        if (respuesta.stop_reason === "tool_use") {
            const toolUses = respuesta.content.filter(
                (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
            );

            const toolResults: Anthropic.ToolResultBlockParam[] = []

            for (const toolUse of toolUses) {

                const resultado = await ejecutarTool(toolUse.name, toolUse.input);

                toolResults.push({
                    type: "tool_result",
                    tool_use_id: toolUse.id,
                    content: resultado,
                });
            }

            historial.push({
                role: "user",
                content: toolResults,
            });
            continue;
        };

        console.warn("stop_reason inesperado", respuesta.stop_reason);
        const textoFallback = respuesta.content.filter(
            (b): b is Anthropic.TextBlock => b.type === "text"
        ).map(
            (b) => b.text
        ).join("\n");

        return {
            historialFinal:historial,
            respuestaTexto:
                textoFallback|| "Respuesta incompleta, Intenta reformular tu pregunta",
        };
    };

    // las iteraciones se terminaron
    console.warn("Se alcanzo MAX_ITERACIONES sin end_turn");
    return{
        historialFinal: historial,
        respuestaTexto:"La consulta requerio demasiados poasos. Intenta ser mas específico"
    };

}

