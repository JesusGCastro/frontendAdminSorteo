// import { test, expect } from '@playwright/test';
// import { resolve } from "path";

// const loginAsSorteador = async (page) => {
//   await page.goto('/');
//   // Ajusta estas credenciales según tu base de datos de prueba local
//   await page.getByTestId("profile").nth(1).click();
//   await page.locator('input[type="email"]').fill("sorteador4@mail.com");
//   await page.locator('input[type="password"]').fill("123456");
//   await page.getByRole("button", { name: "Iniciar Sesión" }).click();
//   // Esperar a que cargue la home
//   await expect(page.getByText("Sorteos disponibles")).toBeVisible();
// };

// test.describe('Sorteador Edita Sorteo (Interfaz)', () => {

//   test.beforeEach(async ({ page }) => {
//     await loginAsSorteador(page);
//     await page.getByRole("img").first().click(); 
//   });

//   test('SES 1. Verificar acceso y renderizado de vista de edición', async ({ page }) => {
//     // Verificar URL correcta (debe contener /edicionSorteos/)
//     await expect(page).toHaveURL(/\/edicionSorteos\/\d+/);

//     // Verificar que aparecen los títulos clave
//     await expect(page.getByText("Descripción")).toBeVisible();
//     await expect(page.getByText("Monto recaudado")).toBeVisible();
    
//     // Verificar que estamos viendo la vista de "Sorteador" (inputs estilo formulario)
//     await expect(page.getByRole('button', { name: 'Confirmar cambios' })).toBeVisible();
//   });

//   test('SES 2. Verificar campos protegidos (Solo lectura)', async ({ page }) => {
//     const inputPrecio = page.locator('input[name="precioBoletoPaquete"]');
//     const inputBoletos = page.locator('input[name="numeroBoletosIncluidos"]');
//     const inputPremio = page.locator('input[name="premio"]');

//     // Verificar que no son editables
//     await expect(inputPrecio).not.toBeEditable();
//     await expect(inputBoletos).not.toBeEditable();
//     await expect(inputPremio).not.toBeEditable();
//   });

//   test('SES 3. Verificar campos editables (Descripción y Fechas)', async ({ page }) => {
//     // 1. Editar Descripción
//     const descripcion = page.locator('textarea[name="descripcion"]');
//     await expect(descripcion).toBeEditable();
//     await descripcion.fill('Esta es una nueva descripción editada por Playwright.');
//     await expect(descripcion).toHaveValue('Esta es una nueva descripción editada por Playwright.');

//     // 2. Editar Fechas (Rango y Realización)
//     await page.locator('input[name="rangoInicio"]').fill('2025-11-01');
//     await page.locator('input[name="rangoFin"]').fill('2025-12-24');
//     await page.locator('input[name="fechaRealizacion"]').fill('2025-12-25');
//   });

//   test('SES 4. Interacción con botones de Estado', async ({ page }) => {
//     const btnActivado = page.getByRole('button', { name: 'Activado' });
//     const btnDesactivado = page.getByRole('button', { name: 'Desactivado' });
    
//     // Click en Desactivado
//     await btnDesactivado.click();
//     // Verificar cambio visual (esto depende de tus estilos, pero podemos checar si no tira error al clickear)
//     await expect(btnDesactivado).toBeVisible();

//     // Click en Activado
//     await btnActivado.click();
//     await expect(btnActivado).toBeVisible();
//   });

//   test('SES 5. Carga de imagen en edición', async ({ page }) => {
//     const fileInput = page.locator('input[type="file"]');
//     const mockImagePath = resolve("./e2e/ps5-mock.png"); 

//     // Simular subida de archivo
//     await fileInput.setInputFiles(mockImagePath);

//     // Verificar que el texto del span cambió al nombre del archivo
//     await expect(page.getByText("ps5-mock.png")).toBeVisible();
//   });

//   test('SES 6. Botón Volver redirige al Home', async ({ page }) => {
//     await page.getByRole('button', { name: 'Volver' }).click();
    
//     // Debería regresar a la raíz
//     await expect(page).toHaveURL(/#\/$/);
//     await expect(page.getByText("Sorteos disponibles")).toBeVisible();
//   });

//   test('SES 7. Botón Confirmar es cliqueable (Smoke Test)', async ({ page }) => {

//     const btnConfirmar = page.getByRole('button', { name: 'Confirmar cambios' });
    
//     await expect(btnConfirmar).toBeEnabled();
//     await btnConfirmar.click();

//   });

// });