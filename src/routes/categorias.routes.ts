

import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {

    const categorias = await prisma.categoria.findMany({
        orderBy: { nombre: "asc" }
    });
    res.json(categorias);
});


router.post("/", async (req, res) => {

    const { nombre } = req.body;

    if (typeof nombre !== "string" || nombre.trim() === "") {
        return res.status(400).json({ error: "El nombre esta vacio" });
    };

    try {

        const nuevoCat = await prisma.categoria.create(
            { data: { nombre: nombre } }
        );
        //console.log(nuevoCat);
        res.status(201).json(nuevoCat);

    } catch (error) {
        return res.status(400).json({ error: "Error el dato no es valido o esta repetido en BD" });
          
    }
});



router.patch("/:id", async (req, res) => {

    const id = req.params.id;
    const nombre = req.body.nombre;
    const idnumber = parseInt(id);

    if (Number.isNaN(idnumber)) {
        return res.status(400).json({ error: "ID inválido" });
    }


    if (typeof nombre !== "string" || nombre.trim() === "") {
        return res.status(400).json({ error: "El nombre esta vacio" });
    };

    try {

        const findcategoria = await prisma.categoria.findUnique({
            where: {
                id: idnumber
            }
        });

        if (!findcategoria) {
            return res.status(404).json({ error: "No se encontro la categoría" });
        };



        const actualizarCategoria = await prisma.categoria.update({
            where: { id: idnumber },
            data: { nombre: nombre },
        });
        return res.status(200).json(actualizarCategoria);
    } catch (error) {
        return res.status(500).json({ error: "Error al escribir en base de datos" });
    };

});


router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    const borrarConCascada = req.query.cascade === "true";
    const idnumber = parseInt(id);

    if (Number.isNaN(idnumber)) {
        return res.status(400).json({ error: "ID inválido" });
    }


    try {

        const findcategoria = await prisma.categoria.findUnique({
            where: {
                id: idnumber
            }
        });

        if (!findcategoria) {
            return res.status(404).json({ error: "No se encontro la categoría" });
        };


        const totalproductos = await prisma.producto.count({ where: { categoriaId: idnumber } });

        if (totalproductos > 0 && !borrarConCascada) {
            return res.status(409).json({
                error: `Esta categoría tiene ${totalproductos} productos. Para borrar todo, usa ?cascade=true`,
                productosAsociados: totalproductos
            });
        }

        if (totalproductos > 0) {
            await prisma.$transaction([
                prisma.producto.deleteMany({ where: { categoriaId: idnumber } }),
                prisma.categoria.delete({ where: { id: idnumber } }),
            ]);
            return res.status(200).json({ mensaje: `Total de productos eliminados: ${totalproductos}` });

        } else {
            await prisma.categoria.delete({ where: { id: idnumber } });
            return res.status(200).json({
                mensaje: "Categoría eliminada"
            });
        }


    }
    catch (error) {
        return res.status(500).json({ error: "Error borrar en la base de datos" });
    }



});



export default router;