import { readFileSync, writeFileSync } from 'fs';

import { parse } from 'dotenv';



// Detecta si estás en Appflow (ENV debería estar configurado en las variables de entorno de Appflow)

const isAppflow = !!process.env.ENV && !process.env.LOCAL_ENV;

const envFilePath = isAppflow ? null : '.env';

const environmentFile = (process.env.ENV || 'development') === 'development' ? `environment.ts` : "environment.prod.ts";



// Carga las variables de entorno desde el archivo local si no está en Appflow

let envConfig = {};

if (!isAppflow && envFilePath) {

 envConfig = parse(readFileSync(envFilePath));

} else {

 // Usa process.env directamente en Appflow

 envConfig = {

  production: true,

  API_URL: process.env.API_URL || '',

  API_KEY_SUPABASE: process.env.API_KEY_SUPABASE || '',

  CORREO_USER_DB: process.env.CORREO_USER_DB || '',

  PASSWORD_DB: process.env.PASSWORD_DB || ''


 };

}



// Genera el archivo de entorno para Angular

writeFileSync(

 `./src/environments/${environmentFile}`,

 'export const environment = ' + JSON.stringify(envConfig) + ';'

);



console.log(`Archivo de entorno generado en ${environmentFile} para el entorno ${process.env.ENV || 'desarrollo'}`);

