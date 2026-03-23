const express = require('express');
const axios = require('axios');
const app = express();

// Para que el bot pueda leer datos JSON que le enviemos
app.use(express.json());

// --- CONFIGURACIÓN ---
// Pega aquí la URL que copiaste de Google Apps Script (la que termina en /exec)
const URL_WEBHOOK_GOOGLE = "TU_URL_DE_APPS_SCRIPT_AQUI";

// 1. Ruta principal para que Render vea que el bot está vivo
app.get('/', (req, res) => {
    res.send('🚀 Bot de Inventario de Samuel operativo 24/7');
});

// 2. Función para mandar los datos al Excel
async function enviarAlExcel(datos) {
    try {
        const respuesta = await axios.post(URL_WEBHOOK_GOOGLE, {
            producto: datos.producto || "Sin nombre",
            inicial: datos.inicial || 0,
            ventas: datos.ventas || 0,
            consumos: datos.consumos || 0,
            esperado: (datos.inicial - datos.ventas - datos.consumos) || 0,
            real: datos.real || 0,
            faltante: (datos.real - (datos.inicial - datos.ventas - datos.consumos)) || 0,
            fecha: new Date().toLocaleDateString('es-CO'), // Fecha en la H
            responsable: datos.responsable || "Sistema"    // Responsable en la I
        });
        console.log("✅ Datos enviados al Sheets:", respuesta.data);
        return true;
    } catch (error) {
        console.error("❌ Error enviando a Sheets:", error.message);
        return false;
    }
}

// 3. Ruta para recibir datos de la App o del OCR
app.post('/registrar', async (req, res) => {
    const datosRecibidos = req.body;
    const exito = await enviarAlExcel(datosRecibidos);
    
    if (exito) {
        res.status(200).send("Registro completado");
    } else {
        res.status(500).send("Error en el servidor");
    }
});

// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Bot encendido en puerto ${PORT}`);
});