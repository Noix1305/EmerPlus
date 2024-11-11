import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { UsuarioService } from '../services/usuarioService/usuario.service';
import { CrearUsuario } from '../models/crearUsuario';
import { LoginService } from '../services/loginService/login.service';

export async function mostrarFormularioRegistro(usuarioService: UsuarioService, loginService: LoginService) {
  const { value: formValues } = await Swal.fire({
    title: 'Registro de Usuario',
    html: `
      <input id="rut" class="swal2-input" placeholder="RUT: ej:11111111-1" type="text">
      <input id="password" class="swal2-input" placeholder="Ingresa tu contraseña" type="password">
      <input id="repeatPassword" class="swal2-input" placeholder="Repite la contraseña" type="password">
      <input id="correo" class="swal2-input" placeholder="ej: exaple@example.com" type="email">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Registrarse',
    cancelButtonText: 'Cancelar',
    heightAuto: false,
    preConfirm: () => {
      const rut = (document.getElementById('rut') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
      const repeatPassword = (document.getElementById('repeatPassword') as HTMLInputElement).value;
      const correo = (document.getElementById('correo') as HTMLInputElement).value;

      if (!rut || !password || !repeatPassword || !correo) {
        Swal.showValidationMessage('Por favor, completa todos los campos');
        return;
      }

      if (password !== repeatPassword) {
        Swal.showValidationMessage('Las contraseñas no coinciden');
        return;
      }

      if (!validarRUT(rut)) {
        Swal.showValidationMessage('RUT no válido');
        return;
      }

      if (!validarCorreo(correo)) {
        Swal.showValidationMessage('El correo ingresado no es válido');
        return;
      }

      return { rut, password, correo };
    }
  });

  if (formValues) {
    console.log('Datos del usuario:', formValues);
    registrarUsuario(formValues, usuarioService, loginService);
    // Aquí puedes llamar a un servicio de registro o procesar los datos como necesites.
    // Por ejemplo:
    // await this.authService.registerUser(formValues.rut, formValues.correo, formValues.password);
  }
}

async function registrarUsuario(
  formValues: { rut: string; correo: string; password: string },
  usuarioService: UsuarioService,
  loginService: LoginService) {
    
  let errorMessage = ''; // Reiniciar el mensaje de error
  let successMessage = ''; // Reiniciar el mensaje de éxito
  const defaultRoleId = 2;

  try {
    // Verificar si el usuario ya existe en tu base de datos
    const usuarioExistenteBD = await firstValueFrom(usuarioService.getUsuarioPorRut(formValues.rut));
    if (usuarioExistenteBD.body && Array.isArray(usuarioExistenteBD.body) && usuarioExistenteBD.body.length > 0) {
      errorMessage = 'El RUT ya está registrado en la base de datos.';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        heightAuto: false
      });
      console.error(errorMessage);
      return;
    }

    const nuevoUsuario: CrearUsuario = {
      rut: formValues.rut,
      password: loginService.encryptText(formValues.password),
      rol: [defaultRoleId],
      correo: formValues.correo,
      estado: 1
    };

    console.log('Registrando nuevo usuario en la base de datos...');
    await firstValueFrom(usuarioService.crearUsuario(nuevoUsuario));

    successMessage = 'Usuario creado exitosamente.';
    await Swal.fire({
      icon: 'success',
      title: 'Exito',
      text: successMessage,
      heightAuto: false
    });
  } catch (error) {
    errorMessage = 'Ocurrió un error al crear el usuario. Inténtalo de nuevo.';
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: errorMessage,
      heightAuto: false
    });
  }
}


function validarRUT(rut: string): boolean {
  // Expresión regular para validar el formato del RUT
  const regex = /^\d{1,8}-[0-9Kk]$/;

  // Comprobar si el RUT coincide con la expresión regular
  if (!regex.test(rut)) {
    return false; // Formato inválido
  }

  // Separar el RUT y el dígito verificador
  const [rutSinDv, dv] = rut.split('-');

  // Completar con ceros a la izquierda si el RUT tiene menos de 8 dígitos
  const rutCompleto = rutSinDv.padStart(8, '0');
  let suma = 0;
  let multiplicador = 2;

  // Calcular el dígito verificador
  for (let i = rutCompleto.length - 1; i >= 0; i--) {
    suma += parseInt(rutCompleto.charAt(i)) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resultado = 11 - (suma % 11);
  const dvCalculado = resultado === 10 ? 'K' : resultado === 11 ? '0' : resultado.toString();

  // Comparar el dígito verificador calculado con el ingresado
  return dv.toUpperCase() === dvCalculado.toUpperCase();
}

function validarCorreo(correo: string): boolean {
  // Expresión regular para validar el formato del correo electrónico
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(correo);
}