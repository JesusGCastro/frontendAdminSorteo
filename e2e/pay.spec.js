import { test, expect } from '@playwright/test';

test('PPL 1. El sorteador no puede comprar números.', async ({ page }) => {
  // Ingresar como sorteador
  await page.goto('/');
  await page.getByTestId('profile').nth(1).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('sorteador3@mail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('S');
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('Sorteador0*');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole("img", { name: "Navidad" }).click();

  // Comprobamos que este en la pantalla correcta de descripcion de sorteos
  await expect(page).toHaveURL(/edicionSorteos/);
});

test('PPL 2. El invitado no puede realizar compras.', async ({ page }) => {
  await page.goto('/');

  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole("img", { name: "Navidad" }).click();
  // Comprobamos que se muestra la descripcion del sorteo
  await expect(
    page.getByRole("heading", { name: "Descripción" })
  ).toBeVisible();

  // Validar que NO exista el botón de pagar
  await expect(page.getByTestId('btn-pagar-online')).not.toBeVisible();
});

test('PPL 3. No se puede pagar sin números apartados.', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('profile').nth(1).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('carlos@mail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole("img", { name: "Navidad" }).click();
  // Comprobamos que se muestra la descripcion del sorteo
  await expect(
    page.getByRole("heading", { name: "Descripción" })
  ).toBeVisible();

  // Validar que NO exista el botón pagar
  await expect(page.getByTestId('btn-pagar-online')).not.toBeVisible();
});

test('PPL 4. Validación de campos de tarjeta y selección mínima.', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('profile').nth(1).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('hector21@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('Hector21$');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  await page.getByRole('img', { name: 'Navidad' }).click();

  await page.getByRole('button', { name: 'Pagar Números Apartados' }).click();

  await page.getByRole('button', { name: 'Pago en Línea' }).click();

  // Verificar que NO se puede pagar sin llenar tarjeta
  await expect(page.getByText('Realizar compra')).toBeDisabled();

  await page.getByRole("button", { name: "1", exact: true }).click();
  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).click();
  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).fill('1234 1234 1234 1234');
  await page.getByRole('textbox', { name: 'MM' }).click();
  await page.getByRole('textbox', { name: 'MM' }).fill('11');
  await page.getByRole('textbox', { name: 'AA' }).click();
  // Año futuro para no expirar
  await page.getByRole('textbox', { name: 'AA' }).fill('30');
  await page.getByRole('textbox', { name: 'CVC' }).click();
  await page.getByRole('textbox', { name: 'CVC' }).fill('060');

  //Verificar que si este disponible el boton de pagar
  await expect(page.getByText('Realizar compra')).toBeEnabled();

  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).click();
  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).fill('1234 1234 1234 12w$');

  // Verificar que NO se puede pagar sin llenar tarjeta
  await expect(page.getByText('Realizar compra')).toBeDisabled();

  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).fill('1234 1234 1234 1234');

  //Verificar que si este disponible el boton de pagar
  await expect(page.getByText('Realizar compra')).toBeEnabled();

  await page.getByRole('textbox', { name: 'MM' }).click();
  // CAMBIO AQUÍ: Usamos '00' para forzar inválido, ya que '32' se autocorrige a '12'
  await page.getByRole('textbox', { name: 'MM' }).fill('00');

  // Verificar que NO se puede pagar sin llenar tarjeta (mes inválido)
  await expect(page.getByText('Realizar compra')).toBeDisabled();

  await page.getByRole('textbox', { name: 'MM' }).click();
  await page.getByRole('textbox', { name: 'MM' }).fill('11');

  //Verificar que si este disponible el boton de pagar
  await expect(page.getByText('Realizar compra')).toBeEnabled();

  await page.getByText('62').click();

  // Verificar que NO se puede pagar sin llenar tarjeta (sin boletos)
  await expect(page.getByText('Realizar compra')).toBeDisabled();

  await page.getByText('62').click();

  //Verificar que si este disponible el boton de pagar
  await expect(page.getByText('Realizar compra')).toBeEnabled();
});

test('PPL 5. Pago de todos los números apartados.', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('profile').nth(1).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('hector21@gmail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('Hector21$');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole("img", { name: "Navidad" }).click();

  // Dar click en pagar números apartados
  await page.getByRole('button', { name: 'Pagar Números Apartados' }).click();

  await page.getByRole('button', { name: 'Pago en Línea' }).click();

  // Llenar tarjeta válida
  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).click();
  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).fill('1234 1234 1234 1234');
  await page.getByRole('textbox', { name: 'MM' }).click();
  await page.getByRole('textbox', { name: 'MM' }).fill('11');
  await page.getByRole('textbox', { name: 'AA' }).click();
  // Año futuro para no expirar
  await page.getByRole('textbox', { name: 'AA' }).fill('30');
  await page.getByRole('textbox', { name: 'CVC' }).click();
  await page.getByRole('textbox', { name: 'CVC' }).fill('060');

  // Seleccionar todos los números
  await page.getByRole('checkbox', { name: 'Comprar todos los numeros' }).check();

  // Validar que NO exista el botón pagar
  await expect(page.getByText('Realizar compra')).toBeEnabled();
});