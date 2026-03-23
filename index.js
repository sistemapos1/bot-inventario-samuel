const express = require('express');
const axios = require('axios');
const Tesseract = require('tesseract.js');
const app = express();

app.use(express.json());

const URL_APPS_SCRIPT = "https://script.google.com/macros/s/AKfycbwi6WJaYksXUxtTBXfMjXh7A2kFzYZDiHD4rpoRWO997skMi6WAJ0K868VTSOwAOoCE/exec";

app.post('/registrar', async (req, res) => {
    const { producto, inicial, consumos, real, fotoUrl, responsable } = req.body;

    console.log(`Procesando cierre de: ${producto}`);

    try {
        // El Bot usa Tesseract para leer la foto que viene de la columna J
        const { data: { text } } = await Tesseract.recognize(fotoUrl, 'spa');
        
        // Buscamos la fecha en el ticket (formato DD/MM/YYYY)
        const fechaTicket = text.match(/\d{2}\/\d{2}\/\d{4}/) || [new Date().toLocaleDateString('es-CO')];

        // Enviamos todo de vuelta al Excel en el orden correcto
        await axios.post(URL_APPS_SCRIPT, {
            producto: producto,
            inicial: inicial,
            ventasBot: 0, // Aquí podrías extraer el número del ticket con otra lógica
            consumos: consumos,
            real: real,
            fecha: fechaTicket[0], // Va para la columna H
            responsable: responsable, // Va para la columna I
            foto: fotoUrl // Se queda en la J
        });

        res.status(200).send("✅ Procesado con éxito");
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).send("Error procesando imagen");
    }
});

app.listen(process.env.PORT || 3000, () => console.log("Bot listo 24/7"));
