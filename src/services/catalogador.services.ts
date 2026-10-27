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

function construirInstrucciones(categoriasExistentes:string[]):string{

const listaCategorias = categoriasExistentes.map((c)=>`${c}`).join(", ");  

return `Eres un catalogador de productos para una tienda de tecnología.
Recibes el texto crudo y desordenado de un producto (copiado de una tienda online)
y extraes la información a un objeto JSON.

Las categorías que YA existen en la tienda son: ${listaCategorias}.

Devuelve ÚNICAMENTE un objeto JSON válido con EXACTAMENTE estos campos, sin texto antes ni después:
{
  "titulo": string,      // el título completo del producto, tal cual (largo está bien)
  "precio_mercado": number,      // el precio REAL del producto como número, sin símbolo ni comas (CONVIERTE DOLAR A MXN). OJO: ignora precios de mensualidades o pagos a plazos.
  "categoria": string,   // propón la categoría más adecuada; puedes proponer una nueva
  "esNueva": boolean,        // ver reglas de categoría abajo
  "descripcion": string  // una descripción reescrita siguiendo estas reglas:
}

- Clasifica el producto en la categoría existente que le corresponda con NATURALIDAD. Reconoce sinónimos (ej. "Tarjetas gráficas" = "Tarjetas de Video") y pon "esNueva": false.
- Si el producto NO pertenece de forma natural a ninguna categoría existente, NO lo fuerces en la más cercana. En su lugar, propón una categoría nueva, específica y bien nombrada, y pon "esNueva": true.
- Ejemplo: una silla gamer no es un "Periférico" ni un "Accesorio"; merece una categoría propia como "Sillas Gamer".
- Prefiere reutilizar una categoría existente cuando el encaje es claro; crea una nueva solo cuando el producto es genuinamente de otro tipo.
- Omite la categoria "Otros"

Reglas para la descripción:
${REGLAS_DESCRIPCION}
 
Responde solo con el JSON, nada más.`;

}





export async function extraerProducto(textoCrudo:string
  , categoriaExistentes:string []
)
:Promise<ProductoExtraido>{
    const respuesta= await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens:1024,
        system:construirInstrucciones(categoriaExistentes), cache_control: { type: "ephemeral" },
        messages:[{role:"user", content:textoCrudo}],
    });

    const bloque = respuesta.content[0];
     // console.log("TIPO DE BLOQUE:", bloque.type);   
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



