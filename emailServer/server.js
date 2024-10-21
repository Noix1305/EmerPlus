import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Resend } from 'resend';

dotenv.config(); // Carga las variables de entorno

const resend = new Resend(process.env.RESEND_API_KEY); // Inicializa Resend con tu clave API
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // Permite todas las solicitudes

// Middleware para analizar el cuerpo de las solicitudes en formato JSON
app.use(express.json());


app.post('/send-email', async (req, res) => {
  const { to, subject, html } = req.body; // Asegúrate de que estos campos están en el cuerpo de la solicitud

  if (!to || !subject || !html) {
    return res.status(400).json({ success: false, message: 'Faltan campos requeridos: to, subject, html' });
  }

  try {
    const response = await resend.emails.send({
      from: 'emerplus@resend.dev',
      to,
      subject,
      html,
    });

    console.log('Correo enviado:', response);
    return res.status(200).json({ success: true, message: 'Correo enviado', response });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return res.status(500).json({ success: false, message: 'Error al enviar el correo', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});



// import express from 'express';
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// import cors from 'cors';

// dotenv.config(); // Carga las variables de entorno

// console.log('Email User:', process.env.EMAIL_USER); // Verifica el usuario del correo
// console.log('Email Pass:', process.env.EMAIL_PASS); // Verifica la contraseña del correo

// const app = express();
// const PORT = process.env.PORT || 3001;

// app.use(cors()); // Permite todas las solicitudes

// // Middleware para analizar el cuerpo de las solicitudes en formato JSON
// app.use(express.json());

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   debug: true, // Habilita el modo de depuración
// });

// console.log('Transporter configurado:', transporter); // Verifica que el transportador está configurado

// app.post('/send-email', async (req, res) => {
//   console.log('Datos recibidos:', req.body); // Verifica los datos que llegan en el cuerpo de la solicitud

//   // Asegurarse de que el cuerpo de la solicitud tenga las propiedades necesarias
//   const { destinatario, asunto, texto } = req.body;

//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: destinatario, // Usar el destinatario enviado desde el cliente
//     subject: asunto, // Usar el asunto enviado desde el cliente
//     text: texto, // Usar el contenido del correo enviado desde el cliente
//   };

//   try {
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.log('Error al enviar el correo:', error);
//         // Responder con un objeto JSON en caso de error
//         return res.status(500).json({ success: false, message: 'Error al enviar el correo', error: error.message });
//       }
//       console.log('Correo enviado:', info.response);
//       // Responder con un objeto JSON en caso de éxito
//       return res.status(200).json({ success: true, message: 'Correo enviado', info });
//     });
//   } catch (error) {
//     console.error('Error al enviar el correo:', error); // Muestra el error si ocurre
//     res.status(500).send('Error al enviar el correo');
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Servidor escuchando en el puerto ${PORT}`);
// });

