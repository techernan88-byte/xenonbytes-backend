
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../lib/prisma";

export const TOOLS: Anthropic.Tool[] = [
    {
        name: "buscar_productos",
        description: "Busca productos del catálogo de Xenonbytes (tienda de componentes de PC)." +
            "Usa esta tool SIEMPRE que necesites precios, stock o especificaciones reales. " +
            "Nunca inventes productos ni precios: si no están en el resultado, no existen en la tienda.",
        input_schema: {
            type: "object",
            properties: {
                busqueda: {
                    type: "string",
                    description: "Palabras clave a buscar en el título (ej. 'RTX 5090', 'Ryzen 7', 'DDR5 32GB')."
                },
                categoria: {
                    type: "string",
                    description: "Nombre EXACTO de categoría (usa listar_categorias primero si dudas). " +
                        "Ejemplos: 'Tarjetas de Video', 'Procesadores', 'Memorias RAM'.",
    
                    },
                precio_max: {
                    type: "number",
                    description: "Precio máximo en pesos mexicanos."
                },
                precio_min: {
                    type: "number",
                    description: "Precio mínimo en pesos mexicanos."
                },
                solo_disponibles: {
                    type: "boolean",
                    description: "Si true, excluye productos con 0 stock. Default:true"
                },
                limite: {
                    type: "number",
                    description: "Cuantos productos devolver (1-20) Default:5",
                },

            },
            required: [],

        },
    },
    {
        name: "listar_categorias",
        description:
            "Devuelve la lista exacta de categorías disponibles en Xenonbytes" +
            "útil para saber qué nombres usar para buscar_productos",
        input_schema: {
            type: "object",
            properties: {},
            required: [],
        }
    }
];


interface InputBuscar {
    busqueda?: string;
    categoria?: string;
    precio_max?: number;
    precio_min?: number;
    solo_disponibles?: boolean;
    limite?: number;

};

async function ejecutarBuscarProductos(input: InputBuscar): Promise<string> {
    // Validación defensiva de los inputs que Claude mando
    const limite = Math.min(
        Math.max(typeof input.limite === "number" ? input.limite : 5, 1),
        20
    );

    const soloDisponibles = input.solo_disponibles !== false;//default truee

    const where: any = {};

    if (typeof input.busqueda === "string" && input.busqueda.trim()) {
        where.titulo = { contains: input.busqueda.trim(), mode: "insensitive" };
    }
    if (typeof input.categoria === "string" && input.categoria.trim()) {
        where.categoria = { nombre: input.categoria.trim() };
    }
    if (soloDisponibles) {
        where.stock = { gt: 0 };
    }
    if (typeof input.precio_min === "number" && input.precio_min > 0) {
        where.precio = { ...where.precio, gte: input.precio_min };
    }
    if (typeof input.precio_max === "number" && input.precio_max > 0) {
        where.precio = { ...where.precio, lte: input.precio_max };
    }

    // Lista estrcuta de campos
    const productos = await prisma.producto.findMany({
        where,
        take: limite,
        orderBy: { precio: "asc" },
        select: {
            id: true,
            titulo: true,
            precio: true,
            stock: true,
            descripcion: true,
            categoria: { select: { nombre: true } }
        },
    });

    const resultado = {
        total_encontrados: productos.length,
        productos: productos.map((p) => ({
            id: p.id,
            titulo: p.titulo,
            precio: p.precio,
            stock: p.stock,
            descripcion: p.descripcion,
            categoria: p.categoria.nombre,
        })),
    };

    return JSON.stringify(resultado);
};



async function ejecutarListarCategorias(): Promise<string> {
    const categorias = await prisma.categoria.findMany({
        orderBy: { nombre: "asc" },
        select: { nombre: true },
    });
    return JSON.stringify({ categoria: categorias.map((c) => c.nombre) });

};


// Dispatcher:  le llega el ToolUseBlock a Clude y despácha

export async function ejecutarTool(
    nombre: string,
    input: unknown
): Promise<string> {

    console.log(`[tool] ${nombre}`, input);

    switch (nombre) {
        case "buscar_productos":
            return ejecutarBuscarProductos(input as InputBuscar);
        case "listar_categorias":
            return ejecutarListarCategorias();
        default:
            return JSON.stringify({ error: `Tool desconocida: ${nombre}` });
    }
}