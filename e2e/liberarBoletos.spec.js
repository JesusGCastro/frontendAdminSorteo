import { test, expect } from '@playwright/test';

// Constantes para la prueba
const RAFFLE_ID = '2'; // Usamos el ID 2 como en tu captura
const TICKET_A_LIBERAR = '11';
const TICKET_NO_LIBERAR = '12';

// --- DATOS SIMULADOS (MOCKS) ---

// 1. Usuario Admin
const mockUserAdmin = {
  token: 'fake-jwt-token',
  user: { id: 99, nombre: 'Sorteador4', rol: 'sorteador' }
};

// 2. Datos del Sorteo
const mockSorteo = {
  id: RAFFLE_ID,
  nombre: 'Gran Sorteo BETO 2025',
  urlImagen: 'https://via.placeholder.com/150',
  cantidadMaximaBoletos: 100,
  estado: 'activo'
};

// 3. Lista de boletos apartados (Simulamos la respuesta que se ve en tu consola)
const mockBoletosApartados = [
  { id: 98, raffleId: 2, userId: 458, numeroBoleto: 11, estado: 'APARTADO' },
  { id: 99, raffleId: 2, userId: 1, numeroBoleto: 12, estado: 'APARTADO' },
  { id: 100, raffleId: 2, userId: 6, numeroBoleto: 17, estado: 'APARTADO' },
  // ...simulamos que hay varios
];

// 4. Respuesta de éxito al liberar
const mockRespuestaLiberacion = {
  message: 'Boletos liberados exitosamente.',
  cantidadLiberada: 1,
  numerosLiberados: [11]
};

test.describe('Flujo: Liberación de Boletos Apartados', () => {

  test.beforeEach(async ({ page }) => {
    // --- INTERCEPCIÓN DE RED (MOCKING) ---
    
    // A. Login y Perfil
    await page.route('**api/users/login', async route => route.fulfill({ json: mockUserAdmin }));
    await page.route('**api/users/perfil', async route => route.fulfill({ json: mockUserAdmin }));
    
    // B. Detalles del Sorteo
    await page.route(`**api/raffles/${RAFFLE_ID}`, async route => route.fulfill({ json: mockSorteo }));
    
    // C. Obtener Boletos Apartados (La lista inicial)
    await page.route(`**api/raffles/admin/tickets/reserved/${RAFFLE_ID}`, async route => {
      await route.fulfill({ json: mockBoletosApartados });
    });

    // D. Acción de Liberar (PUT)
    await page.route(`**api/raffles/admin/tickets/release/${RAFFLE_ID}`, async route => {
      // Verificamos que el front envíe los datos correctos antes de responder éxito
      const postData = route.request().postDataJSON();
      if (postData.numerosBoletos.includes(11)) {
        await route.fulfill({ json: mockRespuestaLiberacion });
      } else {
        await route.fulfill({ status: 400, json: { error: 'Bad Request' } });
      }
    });

    // --- PASOS DE PREPARACIÓN ---
    
    // 1. Iniciar sesión (Simulado visualmente)
    await page.goto('/#/login');
    await page.locator('input[type="email"]').fill('sorteador4@mail.com');
    await page.locator('input[type="password"]').fill('123456');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    
    // 2. Navegar directamente a la página de boletos del sorteo
    // (Esto ahorra clics de navegación en el dashboard)
    await page.goto(`/#/edicionSorteos/${RAFFLE_ID}/boletos`);
  });

  test('SLNA 1 Sorteador visualiza boletos, selecciona uno y lo libera correctamente', async ({ page }) => {
    
    // 1. VERIFICACIÓN DE CARGA
    // Validar que estamos en la página correcta
    await expect(page.getByText('Gran Sorteo BETO 2025')).toBeVisible();
    
    // Validar que los boletos mockeados se renderizan
    const boleto11 = page.getByText(TICKET_A_LIBERAR, { exact: true });
    const boleto12 = page.getByText(TICKET_NO_LIBERAR, { exact: true });
    
    await expect(boleto11).toBeVisible();
    await expect(boleto12).toBeVisible();
    
    // Verificar que el botón Continuar está deshabilitado al inicio
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();

    // 2. INTERACCIÓN (SELECCIÓN)
    // Seleccionar el boleto 11
    await boleto11.click();
    
    // Verificar cambio visual (color de selección)
    // Nota: Basado en tu CSS, el color cambia. Playwright puede checar estilos computados o simplemente que el botón continuar se active.
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeEnabled();

    // 3. APERTURA DEL MODAL
    await page.getByRole('button', { name: 'Continuar' }).click();
    
    // Verificar que el modal aparece
    await expect(page.getByText('Liberar numero apartado')).toBeVisible();
    await expect(page.getByText('¿Deseas liberar los siguientes números?')).toBeVisible();
    // Verificar que el número 11 está dentro del modal
    // (Usamos un selector más específico dentro del modal para asegurar)
    const modalBody = page.locator('.modal-body');
    await expect(modalBody.getByText(TICKET_A_LIBERAR, { exact: true })).toBeVisible();

    // 4. CONFIRMACIÓN Y LIBERACIÓN
    await page.getByRole('button', { name: 'Liberar números' }).click();

    // 5. VERIFICACIÓN FINAL (POST-LIBERACIÓN)
    
    // A. Verificar el Toast de éxito (El texto verde de tu screenshot)
    await expect(page.getByText('1 boleto(s) liberado(s) exitosamente')).toBeVisible();
    
    // B. Verificar que el boleto 11 YA NO aparece en la lista (o ha sido filtrado)
    // Como tu lógica de front filtra el array localmente tras el éxito:
    await expect(page.getByText(TICKET_A_LIBERAR, { exact: true })).not.toBeVisible();
    
    // C. Verificar que el boleto 12 SIGUE ahí (no se borró accidentalmente todo)
    await expect(page.getByText(TICKET_NO_LIBERAR, { exact: true })).toBeVisible();
  });

  test('SLNA 2 Funcionalidad "Seleccionar todos" activa todos los boletos', async ({ page }) => {
    // Checkbox de seleccionar todos
    const checkTodos = page.locator('#selectAll'); // Asegúrate que tu input tenga este ID o usa getByLabel
    
    // Si no tiene ID, usa: page.getByLabel('Seleccionar todos');
    await page.getByText('Seleccionar todos').click();
    
    // El botón continuar debe activarse
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeEnabled();
    
    // Hacemos click para ver el modal
    await page.getByRole('button', { name: 'Continuar' }).click();
    
    // Verificar que en el modal aparecen múltiples boletos (11 y 12)
    const modalBody = page.locator('.modal-body');
    await expect(modalBody.getByText('11', { exact: true })).toBeVisible();
    await expect(modalBody.getByText('12', { exact: true })).toBeVisible();
  });

  // PRUEBA 3: Cancelación del proceso
  test('SLNA 3 El usuario puede cancelar la liberación desde el modal', async ({ page }) => {
    // 1. Seleccionar boleto
    await page.getByText(TICKET_A_LIBERAR, { exact: true }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // 2. Verificar que el modal está abierto
    await expect(page.getByText('¿Deseas liberar los siguientes números?')).toBeVisible();

    // 3. Click en Cancelar
    await page.getByRole('button', { name: 'Cancelar' }).click();

    // 4. Verificar que el modal se cerró
    await expect(page.getByText('¿Deseas liberar los siguientes números?')).not.toBeVisible();

    // 5. IMPORTANTE: Verificar que el boleto SIGUE ahí (no se liberó)
    await expect(page.getByText(TICKET_A_LIBERAR, { exact: true })).toBeVisible();
  });


  // PRUEBA 4: Estado vacío (Sin boletos apartados)
  test('SLNA 4 Muestra mensaje correcto cuando no hay boletos apartados', async ({ page }) => {
    // Simulamos que el endpoint devuelve un array vacío
    await page.route(`**api/raffles/admin/tickets/reserved/${RAFFLE_ID}`, async route => {
      await route.fulfill({ json: [] });
    });

    // Recargamos la página para que tome el nuevo mock vacío
    await page.reload();

    // 1. Verificar mensaje de estado vacío
    await expect(page.getByText('No hay boletos apartados en este sorteo')).toBeVisible();

    // 2. Verificar que no hay "badges" de boletos
    // (Buscamos que no exista ningún elemento con la clase visual de los boletos)
    // Nota: Ajusta el selector si tus boletos tienen una clase específica, o usa el texto de ejemplo.
    await expect(page.getByText(TICKET_A_LIBERAR)).not.toBeVisible();
  });

});

