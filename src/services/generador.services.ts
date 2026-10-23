import Anthropic from "@anthropic-ai/sdk";
import type { ProductoGenerado } from "../types/ProductoGenerado";
const anthropic = new Anthropic();

const TAMANO_LOTE=10;

const REGLAS_DESCRIPCION=`
- Máximo 600 caracteres.
- Máximo 2 párrafos.
- Sin emojis.
- Tono profesional pero llamativo.
- Conserva las especificaciones técnicas importantes del producto.
- Elimina relleno de marketing.
`;

function construirInstrucciones (cantidad:number, categoria:string):string {
    return `Eres un generador de catálogo para una tienda de tecnología mexicana.
Genera ${cantidad} productos REALISTAS y DISTINTOS de la categoría "${categoria}".
Inventa modelos creíbles (marcas y specs reales del mercado), sin repetir entre ellos.
 
Devuelve ÚNICAMENTE un array JSON válido, sin texto antes ni después.
Cada elemento del array tiene EXACTAMENTE estos campos:
[
  {
    "titulo": string,       // nombre completo y realista del producto
    "precio": number,       // precio de venta realista en PESOS MEXICANOS, como número sin símbolo ni comas
    "categoria": string,    // usa exactamente "${categoria}"
    "descripcion": string   // descripción siguiendo las reglas de abajo
  }
]
 
Reglas para la descripción:
${REGLAS_DESCRIPCION}
 
Usa EXACTAMENTE los nombres de campo indicados. No agregues campos extra.
Responde solo con el array JSON, nada más.`;
}

async function generarLote(cantidad:number, categoria:string): Promise<ProductoGenerado[]>{

    const respuesta = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 4000,
        system: construirInstrucciones(cantidad,categoria),
        messages:[
            {role:"user",
            content: `Genera ${cantidad} productos de ${categoria}`,}
        ],
    });

    const bloque = respuesta.content[0];
    if (bloque.type!=="text"){
        throw new Error("Claude no devolvió texto");
    }

    const limpio = bloque.text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim()

    return JSON.parse(limpio) as ProductoGenerado[];
}


export async function generarProductos(cantidadTotal:number,categoria:string):Promise<ProductoGenerado[]>{
  
 const todos : ProductoGenerado[]=[];
 let restantes = cantidadTotal;   

 while (restantes>0){
      // Tamaño de este lote: TAMANO_LOTE (VALOR NUMERICO GLOBAL), salvo que falten menos,
      // y entonces se pides los que falten (así el último lote no se pasa).
    const esteLote = Math.min(TAMANO_LOTE, restantes);
    const productos = await generarLote(esteLote,categoria);
    todos.push(...productos);
    restantes-=esteLote;
 }

 return todos;

}

