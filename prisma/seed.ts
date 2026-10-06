import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

async function main() {
  // 1. Leer el db.json del frontend
  const archivo = readFileSync("../frontend/db.json", "utf-8");
  const datos = JSON.parse(archivo);

  // 2. Sacar los productos y convertir el id de string a number
  const productos = datos.productos.map((p: any) => ({
    id: Number(p.id),
    titulo: p.titulo,
    precio: p.precio,
    categoria: p.categoria,
    stock: p.stock,
  }));

  // 3. Limpiar la tabla antes de sembrar (para no duplicar si corres el seed otra vez)
  await prisma.producto.deleteMany();

  // 4. Insertar todos los productos
  await prisma.producto.createMany({ data: productos });

  console.log(`✅ Sembrados ${productos.length} productos`);
}

main()
  .catch((e) => {
    console.error("Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });