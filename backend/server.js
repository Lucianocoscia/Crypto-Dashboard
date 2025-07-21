import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;
const url = "https://pro-api.coinmarketcap.com";
const apiKey = "a9271d10-6598-439a-8659-ca5fdb707e40";

app.use(cors());


app.get("/api/cryptos", async(req, res) => {
    try {
        const response = await fetch(
            url+"/v1/cryptocurrency/listings/latest", {
            method: "GET",
            headers: {
                "X-CMC_PRO_API_KEY": apiKey,
                'Content-Type': 'application/json',
            }
        });
        console.log("STATUS:", response.status); // Vemos el estado de la respuesta
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error al obtener datos del listado normal:", error);
        res.status(500).json({error: "Error al obtener datos"});
    }
});
app.get("/api/cryptos/categorias", async(req, res) => {
    try {
        const response = await fetch(
            url+"/v1/cryptocurrency/categories?limit=100", {
            method: "GET",
            headers: {
                "X-CMC_PRO_API_KEY": apiKey,
                'Content-Type': 'application/json',
            }
        });
        console.log("STATUS de la ruta categorias:", response.status);// Vemos el estado de la respuesta
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error al obtener datos de las categorias:", error);
        res.status(500).json({error: "Error al obtener datos"});
    }
});


app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en puerto ${PORT}`)
})