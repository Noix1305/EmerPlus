const fs = require('fs');

const dotenv = require('dotenv');

dotenv.config();



// Detecta si estás en Appflow (ENV debería estar configurado en las variables de entorno de Appflow)

const isAppflow = !!process.env.ENV && !process.env.LOCAL_ENV;

const envFilePath = isAppflow ? null : '.env';

const environmentFile = (process.env.ENV || 'development') === 'development' ? `environment.ts` : "environment.prod.ts";



// Carga las variables de entorno desde el archivo local si no está en Appflow

let envConfig = {};

if (!isAppflow && envFilePath) {

    envConfig = dotenv.parse(fs.readFileSync(envFilePath));

} else {

    // Usa process.env directamente en Appflow

    envConfig = {

        production: true,

        API_URL: process.env.API_URL || '',

        API_KEY_SUPABASE: process.env.API_KEY_SUPABASE || '',

        CORREO_USER_DB: process.env.CORREO_USER_DB || '',

        PASSWORD_DB: process.env.PASSWORD_DB || '',

        GOOGLE_MAP_TOKEN: process.env.GOOGLE_MAP_TOKEN || ''

    };

}

console.log("Creando carpeta de entornos...");
if (!fs.existsSync('./src/environments')) {
    fs.mkdirSync('./src/environments', { recursive: true });
    console.log("Carpeta creada.");
} else {
    console.log("La carpeta ya existe.");
}

// Genera el archivo de entorno para Angular

fs.writeFileSync(

    `./src/environments/${environmentFile}`,

    'export const environment = ' + JSON.stringify(envConfig) + ';'

);



console.log(`Archivo de entorno generado en ${environmentFile} para el entorno ${process.env.ENV || 'desarrollo'}`);

