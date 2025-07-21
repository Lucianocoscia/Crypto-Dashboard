import {fetchCryptos, fetchCryptosPorCategoria} from "./api.js";

// genero variables donde guardo mis elementos html
const resultados = document.getElementById("contenedorGrillaCards");
const btnRefrescar = document.getElementById("buscadorRefrescar");
const paginador = document.getElementById("paginador");
const selectRango = document.getElementById("filtroRango");
const inputBuscador = document.getElementById("buscador");
const filtrarPorCategorias = document.getElementById("filtrarPorCategorias");

// genero una variable como array vacio para luego insertarle la data
let listadoCryptos = [];
let listadoCryptosPorCategoria = [];

// Guardo en variable el intervalo del refresh para luego limpiar y reiniciar
let intervaloAutoRefresh = null;
// Declaro esta variable global para utilizarla en set interval para conservar el numero de pagina cuando refresca
let numeroPaginaActiva = 1;

document.addEventListener("DOMContentLoaded", async () => {
    // guardo la data del thead para luego utilizarla en boton volver al listado
    const theadOriginal = document.querySelector("thead").innerHTML;

    // Función que carga las criptomonedas desde el api.js, guarda los datos globalmente, calcula cuántas páginas se necesitan, genera los botones y muestra la primera página.
    async function cargarCriptos(numeroPaginaActiva = 1){
        try {
            const data = await fetchCryptos();
            // console.log(data, "soy la data del main.js q trae las criptos a travez de api.js");
            listadoCryptos = data;

            const totalPaginas = Math.ceil(listadoCryptos.length / 10); // calculo cuantas paginas necesito para la cantidad de resultados

            renderPaginador(totalPaginas, listadoCryptos, numeroPaginaActiva); // renderizo botones por cantidad de paginas
            mostrarPagina(numeroPaginaActiva); // muestro la pagina con los resultados
        } catch (error) {
            console.log("Error desde main.js", error)
            resultados.innerHTML = "<p>Error al cargar datos</p>"
        }
    };

    // Función que renderiza una lista de criptos recibida como parámetro, y luego inserto los valores en HTML dentro del contenedor principal.
    function renderResultados(lista){
        if(lista.length === 0){
            resultados.innerHTML =  "<p>No se encontraron resultados</p>"
            return
        }
        resultados.innerHTML = lista.map((cripto) => (
            `
            <tr>
                <td>${cripto.id}</td>
                <td><i>${cripto.symbol}</i></td>
                <td>${cripto.name}</td>
                <td>$${cripto.quote.USD.price.toFixed(2)}</td>
                <td>${cripto.quote.USD.percent_change_24h.toFixed(2)}%</td>
                <td>${Number(cripto.quote.USD.volume_24h).toLocaleString()}</td>
            </tr>
            `
        )).join("");
    };

    await cargarCriptos(numeroPaginaActiva); // Ejecuto la primera carga

    intervaloAutoRefresh = setInterval(()=>{
        const paginaItemActiva = document.querySelector(" #paginador .active");
        numeroPaginaActiva = paginaItemActiva ? parseInt(paginaItemActiva.textContent):1;
        // console.log(numeroPaginaActiva, "Set interval");
        // console.log("Me refresque")
        cargarCriptos(numeroPaginaActiva);
    }, 10000); // Auto-refresh cada 10 segundos guardado en variable para hacer clean despues

    // Lógica boton refrescar, limpia el intervalo, recarga los datos y reinicia el contador
    btnRefrescar.addEventListener("click", async ()=>{
        const paginaItemActivaBtnRefresh = document.querySelector(" #paginador .active");
        numeroPaginaActiva = paginaItemActivaBtnRefresh ? parseInt(paginaItemActivaBtnRefresh.textContent):1;

        clearInterval(intervaloAutoRefresh); 
        await cargarCriptos(numeroPaginaActiva);  
        intervaloAutoRefresh = setInterval(() => {
            // console.log(numeroPaginaActiva, "Set interval despues de tocar boton");

            cargarCriptos(numeroPaginaActiva); // le pasás la página actual como parámetro
        }, 10000);
    });

    //Esta funcion muestra una página específica de resultados (10 por página). Recibe por parametro un array (global o distinto) para mostrar filtros o búsquedas.
    function mostrarPagina(num, array = listadoCryptos){
        const inicio = (num - 1)* 10;
        const fin = num * 10;

        const paginaCriptos = array.slice(inicio, fin);

        renderResultados(paginaCriptos);
    };

    // Función que genera los botones de paginación según la cantidad de páginas recibida. Cada botón muestra su página correspondiente al hacer clic.
    function renderPaginador(totalPaginas, array = listadoCryptos, paginaActual = 1, callback = mostrarPagina){
        // borro botones 
        paginador.innerHTML = "";

         // Creo el Botón anterior, le agrego una clase, inserto elemento a y hago una validacion por si estoy en la posicion 1 aparezca como disabled
        const liPrev = document.createElement("li");
        liPrev.className = "page-item";
        liPrev.innerHTML = `<a class="page-link" href="#">«</a>`;
        paginaActual === 1 ? liPrev.classList.add("disabled"):liPrev.classList.remove("disabled") ;
        
        // Genero la logica para paginado 
        liPrev.addEventListener("click", () => {
            if (paginaActual > 1) {
                renderPaginador(totalPaginas, array, paginaActual - 1, callback);
                callback(paginaActual - 1, array);
            }
        });
        
        paginador.appendChild(liPrev);

        // Lógica para mostrar hasta 5 botones de páginas
        const maxVisible = 5;
        let start = Math.max(1, paginaActual - 2);
        let end = Math.min(totalPaginas, start + maxVisible - 1);

        if(end - start < maxVisible - 1) {
            start = Math.max(1, end < maxVisible + 1);
        }

        // Genero los botones 
        for (let i = start; i <= end; i++) {
            const li = document.createElement("li");
            li.className = "page-item" + (i === paginaActual ? " active" : "");
            li.id = `page-item-${i}`
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener("click", () => {
                renderPaginador(totalPaginas, array, i,callback);
                callback(i, array);
            });
            paginador.appendChild(li);
        }

        // Creo el Botón siguiente, le agrego una clase, inserto elemento a y hago una validacion por si estoy en la posicion 10 aparezca como disabled
        const liNext = document.createElement("li");
        liNext.className = "page-item";
        liNext.innerHTML = `<a class="page-link" href="#">»</a>`;
        if (paginaActual === totalPaginas) liNext.classList.add("disabled");

        liNext.addEventListener("click", () => {
            if (paginaActual < totalPaginas) {
                renderPaginador(totalPaginas, array, paginaActual + 1,callback);
                callback(paginaActual + 1, array);
            }
        });

        paginador.appendChild(liNext);
    }   


    // Funcion general aplicarFiltros, filtro por nombre y rango a la vez. 
    function aplicarFiltros(){
        const nombre = inputBuscador.value.toLowerCase();
        const rangoSeleccionado = selectRango.value;

        // Filtrar por nombre
        let resultadoFiltrado = listadoCryptos.filter((cripto) => {
            const nombreBuscado = cripto.name.toLowerCase();
            return nombreBuscado.includes(nombre); 
        });

        // Aplico el filtro por rango sobre el resultado ya filtrado
        resultadoFiltrado = resultadoFiltrado.filter((cripto)=>{
             const valorRango = cripto.quote.USD.price;

            switch (rangoSeleccionado) { 
                case "menor500":
                    return valorRango < 500;
                case "500-1000":
                    return valorRango >= 500 && valorRango <= 1000;
                case "mayor1000":
                    return valorRango > 1000;
                case "todos":
                default:
                    return true;
            }
        });
        const totalPaginas = Math.ceil(resultadoFiltrado.length / 10);
        renderPaginador(totalPaginas, resultadoFiltrado); // Le paso el total de paginas a la funcion renderPaginador + los resultados para q los pagine
        mostrarPagina(1, resultadoFiltrado); // muestro la data filtrada
    };

    inputBuscador.addEventListener("input", aplicarFiltros); 
    selectRango.addEventListener("change", aplicarFiltros);

    const limpiarBuscador = document.getElementById("limpiarBuscador");
    const limpiarRango = document.getElementById("limpiarRango");
    // Funcion para limpiar el input Buscador
    limpiarBuscador.addEventListener("click", async()=>{
        inputBuscador.value = "";
        await cargarCriptos(numeroPaginaActiva);
       
    });
    // Funcion para limpiar el selector de rango
    limpiarRango.addEventListener("click", async ()=>{
        selectRango.value = "todos";
        await cargarCriptos(numeroPaginaActiva);
       
    });

    // Comienza logica de CATEGORIAS
    // Capto el evento del boton y apartir de eso realizo el fetch para obtener la data por categoria, la guardo en una variable global, detengo el contador refresh automatico, renderizo la data en una tabla y muestro el boton de "volver al listado"
    filtrarPorCategorias.addEventListener("click", async ()=>{
        try{
            btnRefrescar.classList.add("disabled");
            btnRefrescar.disabled = true;
            const resultadosPorCategorias = await fetchCryptosPorCategoria();
            listadoCryptosPorCategoria = resultadosPorCategorias;
            console.log(listadoCryptosPorCategoria, "Aca muestro la data de listadoCryptosPorCategorias ");

            clearInterval(intervaloAutoRefresh); // detengo el contador 
            numeroPaginaActiva = 1;
            renderTablaCategorias(listadoCryptosPorCategoria);
            
            const totalPaginas = Math.ceil(listadoCryptosPorCategoria.length / 10); // calculo cuantas paginas necesito para la cantidad de resultados

            renderPaginador(totalPaginas, listadoCryptosPorCategoria, numeroPaginaActiva, mostrarPaginaCategoria); // renderizo botones por cantidad de paginas 
            mostrarPaginaCategoria(numeroPaginaActiva, listadoCryptosPorCategoria)
            mostrarBotonVolverAlListado();
        } catch(error){
            console.error("Error al cargar categorias:", error);
        };
    });
   


    //Esta funcion muestra una página específica de resultados (10 por página). Recibe por parametro un array (global o distinto) para mostrar datos por categorias
    function mostrarPaginaCategoria(num, array = listadoCryptosPorCategoria){
        const inicio = (num - 1)* 10;
        const fin = num * 10;

        const paginaCriptosPorCategorias = array.slice(inicio, fin);

        renderTablaCategorias(paginaCriptosPorCategorias);
    };
     // Funcion que renderiza la data q se le pasa por parametro en una tabla y reemplazo los headers de la tabla
    function renderTablaCategorias(categorias){
         if(categorias.length === 0){ 
            resultados.innerHTML =  "<p>No se encontraron resultados de categorias</p>"
            return
        }
        
        resultados.innerHTML = categorias.map((categoria)=>(
            `
            <tr>
            <td>${categoria.name}</td>
            <td>${categoria.description}</td>
            <td>${categoria.market_cap}</td>
            <td>${categoria.volume}</td>
        </tr>
            `
        )).join("");

        // reemplazo los headers de la tabla
        document.querySelector("thead").innerHTML = `
            <tr>
                <th>Nombre</th>
                <th>Descripcion</th>
                <th>Market Cap</th>
                <th>Volumen</th>
            </tr>
        `;
    };

    // Funcion que muestra el boton volver al listado, valida si existe, lo genera y defino logica una vez clickeado (reseteo los theader, cargo nuevamente la data original, vuelvo activar el refresco automatico y remuevo el boton "volver..")
    function mostrarBotonVolverAlListado() {
        if (document.getElementById("volverAlListado")) return;

        const contenedorVolverListado = document.getElementById("contenedorVolverListado");

        const botonVolver = document.createElement("button");
        botonVolver.id = "volverAlListado";
        botonVolver.className = "btn btn-outline-secondary btn-block d-inline-flex align-items-center justify-content-center";
        botonVolver.innerHTML = '<i class="fas fa-arrow-left mr-2"></i> Volver al listado';

        botonVolver.addEventListener("click", async () => {
            //Agrego los headers a la tabla ya guardados al comienzo de la carga del dom
            document.querySelector("thead").innerHTML = theadOriginal;

            await cargarCriptos(1); 

            intervaloAutoRefresh = setInterval(() => {
                const paginaItemActiva = document.querySelector("#paginador .active");
                const numeroPaginaActiva = paginaItemActiva ? parseInt(paginaItemActiva.textContent) : 1;
                cargarCriptos(numeroPaginaActiva);
            }, 10000);

            botonVolver.remove();
        });

        contenedorVolverListado.appendChild(botonVolver);    
    };

});





