import { test, expect } from '@playwright/test';
import { resolve } from "path";

// --- Helper para Login ---
const loginAsSorteador = async (page) => {
  await page.goto('/');
  await page.getByTestId("profile").nth(1).click();
  await page.locator('input[type="email"]').fill("sorteador4@mail.com");
  await page.locator('input[type="password"]').fill("123456");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  
  // Esperar a que cargue el dashboard de sorteador
  await expect(page.getByRole("button", { name: "Crear Sorteo" })).toBeVisible({ timeout: 15000 });
};

test.describe('Sorteador Edita Sorteo (Interfaz)', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsSorteador(page);
    
    // Clic en la primera tarjeta de sorteo
    await page.locator('.sorteo-card').first().click(); 
    
    // Verificación URL
    await expect(page).toHaveURL(/\/edicionSorteos\/\d+/);

    // Esperar a que el formulario se hidrate.
    // Usamos el input de precio como referencia de que los datos llegaron
    await expect(page.locator('input[name="precioBoleto"]')).toBeVisible({ timeout: 10000 });
  });

  test('SES 1. Verificar acceso y renderizado de vista de edición', async ({ page }) => {
    await expect (page.getByText('SorteoPagosBoletos apartados')).toBeVisible();
    await expect(page.getByText("Monto recaudado")).toBeVisible();
    await expect(page.getByRole('button', { name: 'Confirmar cambios' })).toBeVisible();
  });

  test('SES 2. Verificar campos protegidos (Solo lectura)', async ({ page }) => {
    const inputPrecio = page.locator('input[name="precioBoleto"]');
    const inputBoletos = page.locator('input[name="cantidadMaximaBoletos"]');
    const inputPremio = page.locator('input[name="premio"]');

    await expect(inputPrecio).toBeVisible();
    await expect(inputPrecio).not.toBeEditable();
    
    await expect(inputBoletos).not.toBeEditable();
    await expect(inputPremio).not.toBeEditable();
  });

  test('SES 3. Verificar campos editables (Descripción) y presencia de Fechas', async ({ page }) => {
  // 1. Editar Descripción - Este campo SÍ es editable
  const descripcion = page.locator('textarea[name="descripcion"]');
  await expect(descripcion).toBeEditable();
  await descripcion.fill('Descripción editada por Playwright');
  await expect(descripcion).toHaveValue('Descripción editada por Playwright');

  // 2. Verificar que los campos de fechas existen y están presentes
  const fechaInicio = page.locator('input[name="fechaInicialVentaBoletos"]');
  const fechaFin = page.locator('input[name="fechaFinalVentaBoletos"]');
  const fechaRealizacion = page.locator('input[name="fechaRealizacion"]');

  // Verificar que los campos están visibles y tienen valores
  await expect(fechaInicio).toBeVisible();
  await expect(fechaFin).toBeVisible();
  await expect(fechaRealizacion).toBeVisible();
  
  await expect(fechaInicio).not.toHaveValue('');
  await expect(fechaFin).not.toHaveValue('');
  await expect(fechaRealizacion).not.toHaveValue('');
  
  // Verificar que son de tipo date
  await expect(fechaInicio).toHaveAttribute('type', 'date');
  await expect(fechaFin).toHaveAttribute('type', 'date');
  await expect(fechaRealizacion).toHaveAttribute('type', 'date');
});

  test('SES 4. Interacción con botones de Estado', async ({ page }) => {
    const btnActivo = page.getByRole('button', { name: 'Activo', exact: true });
    const btnInactivo = page.getByRole('button', { name: 'Inactivo', exact: true });
    const btnFinalizado = page.getByRole('button', { name: 'Finalizado', exact: true });

    await expect(btnActivo).toBeVisible();
    await expect(btnInactivo).toBeVisible();
    await expect(btnFinalizado).toBeVisible();

    // Probar interacción
    await btnInactivo.click();
    await btnActivo.click();
  });

  test('SES 5. Carga de imagen en edición', async ({ page }) => {
    const fileInput = page.locator('#file-upload'); 
    const mockImagePath = resolve("./e2e/ps5-mock.png"); 

    await fileInput.setInputFiles(mockImagePath);

    // Al cargar una nueva imagen local, tu componente muestra <img alt="Nueva imagen">
    await expect(page.getByRole('img', { name: 'Nueva imagen' })).toBeVisible();
  });

  test('SES 6. Botón Volver redirige al Home', async ({ page }) => {
    await page.getByRole('button', { name: 'Volver' }).click();
    await expect(page).toHaveURL(/#\/$/);
    await expect(page.getByText("Sorteos disponibles")).toBeVisible();
  });

  test('SES 7. Botón Confirmar es cliqueable', async ({ page }) => {
    const btnConfirmar = page.getByRole('button', { name: 'Confirmar cambios' });
    await expect(btnConfirmar).toBeEnabled();
    await btnConfirmar.click();
  });

});