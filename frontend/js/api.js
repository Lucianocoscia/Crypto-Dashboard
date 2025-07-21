export async function fetchCryptos() {
    try {
        const response = await fetch("http://localhost:8080/api/cryptos");
        
        if(!response.ok){
            throw new Error(`Error de red ${response.status}`);
        }
         const data = await response.json();
         return data.data;
    } catch (error) {
        console.log("Error al obtener criptomonedas:",error);
        throw error;
    }
};
export async function fetchCryptosPorCategoria() {
    try {
        const response = await fetch("http://localhost:8080/api/cryptos/categorias");
        
        if(!response.ok){
            throw new Error(`Error de red ${response.status}`);
        }
         const data = await response.json();
        //  console.log(data.data.length, "Soy la data del api.js trayendo criptos por categorias")
         return data.data;
    } catch (error) {
        console.log("Error al obtener criptomonedas:",error);
        throw error;
    }
};
