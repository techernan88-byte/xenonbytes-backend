import express from "express";
import cors from "cors";  
import productosRouter from "./routes/productos.routes";
import carritoRouter from "./routes/carrito.routes"
import authRouter from "./routes/auth.routes";
import catalogadorRouter from "./routes/catalogador.routes";
import generadorRouter from "./routes/generador.routes"
import categoriasRouter from "./routes/categorias.routes";

const app = express();
const  PORT = process.env.PORT || 3000;


app.use(cors({
  origin: ["https://xenonbytes-frontend.vercel.app", "http://localhost:5173"]
}));

app.use(express.json());



app.get("/", (req, res) => {
  res.send("Back funcionando de Xenonbyte");
});


///route Productos
app.use ("/productos", productosRouter);
///route Carrito
app.use("/carrito",carritoRouter);
//router registrar
app.use("/auth", authRouter)

//router catalogador
app.use("/catalogador",catalogadorRouter);

//router generador de productos
app.use("/generador",generadorRouter);

//router categorias
app.use("/categorias", categoriasRouter);

//prueba de ejecución con puerto
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

