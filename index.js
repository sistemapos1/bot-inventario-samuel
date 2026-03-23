const express = require('express');
const Tesseract = require('tesseract.js'); // Librería para leer fotos
const axios = require('axios');
const app = express();

app.use(express.json());

const URL_EXCEL = "TU_URL_DE_APPS_SCRIPT_AQUI";

// --- LA MAGIA: LEER LA FOTO ---
async function leerTicket(urlImagen) {
    console.log("Leyendo ticket...");
    const { data: { text } } = await Tesseract.recognize(urlImagen, 'spa');
    
    // Aquí el bot busca palabras clave en el texto del ticket
    // Ejemplo: Busca la fecha 22/03/2026
    const fechaEncontrada = text.match(/\d{2}\/\d{2}\/\d{4}/) || [new Date().toLocaleDateString()];
    
    return {
        texto: text,
        fecha: fechaEncontrada[0]
    };
}

app.post('/procesar-cierre', async (req, res) => {
    const { fotoUrl, responsable, inicial, real } = req.body;
    
    const resultado = await leerTicket(fotoUrl);
    
    // El bot envía todo al Excel
    await axios.post(URL_EXCEL, {
        producto: "Cierre Diario", // O el nombre que extraiga del texto
        inicial: inicial,
        ventas: 0, // Aquí pondrías lo que el bot leyó en el ticket
        consumos: 0,
        real: real,
        fecha: resultado.fecha,
        responsable: responsable
    });

    res.send("¡Cierre procesado y guardado en la H e I!");
});

app.listen(process.env.PORT || 3000);
