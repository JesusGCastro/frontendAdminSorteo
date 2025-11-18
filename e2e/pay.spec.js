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
  await page.locator('input[type="email"]').fill('numeroApartado@mail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole("img", { name: "Navidad" }).click();
  // Comprobamos que se muestra la descripcion del sorteo
  await page.getByRole("heading", { name: "Descripción" }).toBeVisible();

  // Hacemos click en un sorteo y comprobamos que se muestra la descripcion
  await page.getByRole("img", { name: "Navidad" }).click();

  // Comprobamos que se muestra la descripcion del sorteo
  await page.getByRole("heading", { name: "Descripción" }).toBeVisible();

  //Seleccionar pagar online
  await page.getByTestId('btn-pagar-online').click();

  // Seleccionar un número
  await page.getByTestId('checkbox-numero').first().check();

  // Verificar que NO se puede pagar sin llenar tarjeta
  await expect(page.getByTestId('btn-realizar-compra')).toBeDisabled();

  // Datos válidos
  await page.getByTestId('input-num-tarjeta').fill('4111111111111111');
  await page.getByTestId('input-cvv').fill('123');
  await page.getByTestId('input-exp').fill('12/30');
  await expect(page.getByTestId('btn-realizar-compra')).toBeEnabled();

  //Verificar que si este disponible el boton de pagar
  await expect(page.getByTestId('btn-realizar-compra')).toBeEnabled();

  // Intentar letras en tarjeta
  await page.getByTestId('input-num-tarjeta').fill('abcd');
  await page.getByTestId('input-cvv').fill('xyz');
  await expect(page.getByTestId('btn-realizar-compra')).toBeDisabled();

  // Verificar que NO se puede pagar sin llenar tarjeta
  await expect(page.getByTestId('btn-realizar-compra')).toBeDisabled();

  // Datos válidos
  await page.getByTestId('input-num-tarjeta').fill('4111111111111111');
  await page.getByTestId('input-cvv').fill('123');
  await page.getByTestId('input-exp1').fill('12/30');
  await page.getByTestId('input-exp2').fill('30');
  await expect(page.getByTestId('btn-realizar-compra')).toBeEnabled();

  // Fecha expirada
  await page.getByTestId('input-exp1').fill('01');
  await page.getByTestId('input-exp2').fill('20');
  await expect(page.getByTestId('btn-realizar-compra')).toBeDisabled();

  // Verificar que NO se puede pagar sin llenar tarjeta
  await expect(page.getByTestId('btn-realizar-compra')).toBeDisabled();

  // Poner una fecha valida
  await page.getByTestId('input-exp1').fill('12');
  await page.getByTestId('input-exp2').fill('30');
  await expect(page.getByTestId('btn-realizar-compra')).toBeEnabled();

  // Quitar la selección de número
  await page.getByTestId('checkbox-numero').first().uncheck();

  // Verificar que NO se puede pagar sin llenar tarjeta
  await expect(page.getByTestId('btn-realizar-compra')).toBeDisabled();
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

  // Llenar tarjeta válida
  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).click();
  await page.getByRole('textbox', { name: '•••• •••• •••• ••••' }).fill('1111222233334444');
  await page.getByRole('textbox', { name: 'MM/AA' }).click();
  await page.getByRole('textbox', { name: 'MM/AA' }).fill('1234');
  await page.getByRole('textbox', { name: 'CVC' }).click();
  await page.getByRole('textbox', { name: 'CVC' }).fill('060');;

  // Seleccionar todos los números
  await page.getByRole('checkbox', { name: 'Comprar todos los numeros' }).check();

  // Hacer la compra
  await page.getByRole('button', { name: 'Realizar compra' }).click();

  // Validar compra exitosa
  await expect(page.getByText("Función de compra pendiente de implementar.")).toBeVisible();
});
