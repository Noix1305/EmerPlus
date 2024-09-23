import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard'; // Asegúrate de que el guard esté bien importado

describe('AuthGuard', () => {  // Usar el nombre correcto de la clase
  let guard: AuthGuard;  // Crear una variable para la instancia del guard

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard]  // Asegurarse de incluir el guard en los proveedores del módulo de prueba
    });
    guard = TestBed.inject(AuthGuard);  // Inyectar el guard en el test
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();  // Verificar que el guard fue creado correctamente
  });
});
