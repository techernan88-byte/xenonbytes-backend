import Anthropic from "@anthropic-ai/sdk";
import { type ProductoExtraido } from "../types/ProductoExtraido";

const anthropic = new Anthropic();

const REGLAS_DESCRIPCION=`
- Máximo 600 caracteres.
- Máximo 2 párrafos.
- Sin emojis.
- Tono profesional pero llamativo.
- Conserva las especificaciones técnicas importantes del producto.
- Elimina relleno de marketing (frases como "la plataforma definitiva").
`;


const INSTRUCCIONES=`Eres un catalogador de productos para una tienda de tecnología.
Recibes el texto crudo y desordenado de un producto (copiado de una tienda online)
y extraes la información a un objeto JSON.
 
Devuelve ÚNICAMENTE un objeto JSON válido con EXACTAMENTE estos campos, sin texto antes ni después:
{
  "titulo": string,      // el título completo del producto, tal cual (largo está bien)
  "precio_mercado": number,      // el precio REAL del producto como número, sin símbolo ni comas. OJO: ignora precios de mensualidades o pagos a plazos.
  "categoria": string,   // propón la categoría más adecuada; puedes proponer una nueva
  "descripcion": string  // una descripción reescrita siguiendo estas reglas:
}
 
Reglas para la descripción:
${REGLAS_DESCRIPCION}
 
Responde solo con el JSON, nada más.`;



export async function extraerProducto(textoCrudo:string):Promise<ProductoExtraido>{
    const respuesta= await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens:1024,
        system:INSTRUCCIONES,
        messages:[{role:"user", content:textoCrudo}],
    });

    const bloque = respuesta.content[0];
     console.log("TIPO DE BLOQUE:", bloque.type);   
    if(bloque.type !=="text"){
        throw new Error("Claude no devolvió text");
    }
    console.log("TEXTO CRUDO DE CLAUDE:", bloque.text);  
      // Claude a veces envuelve el JSON en ```json ... ```; se limpia por si acaso.
    const limpio=bloque.text.replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();;

    return JSON.parse(limpio) as ProductoExtraido;
}



