import { test, expect } from '@playwright/test';

test('IS 1. Iniciar sesion con credenciales validas.', async ({ page }) => {
// Abrimos la pagina y seleccionamos el boton de login
  await page.goto('http://localhost:5173/frontendAdminSorteo/#/');
  await page.getByRole('link', { name: '' }).nth(1).click();

// Rellenamos el formulario de login y accedemos a la cuenta
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('carlos@mail.com');
  await page.locator('input[type="email"]').press('Tab');
  await page.locator('input[type="password"]').fill('123456');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

// Comprobamos que hemos iniciado sesion correctamente, viendo el nombre del usuario en la parte de arriba de la pagina
  await expect(page.getByText('Carlos')).toBeVisible();
});

test('IS 2. Iniciar sesion con credenciales invalidas.', async ({ page }) => {
// Abrimos la pagina y seleccionamos el boton de login
  await page.goto('http://localhost:5173/frontendAdminSorteo/#/');
  await page.getByRole('link', { name: '' }).nth(1).click();

// Rellenamos el formulario de login con credenciales invalidas
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('carlitos@mail.com');
  await page.locator('input[type="email"]').press('Tab');
  await page.locator('input[type="password"]').fill('123456');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

// Comprobamos que aparece el mensaje de error
    await expect(page.getByText('Correo o contraseña')).toBeVisible();
});

test('IS 3. Registrarse con correo ya registrado.', async ({ page }) => {
// Abrimos la pagina y seleccionamos el boton de registrarse
  await page.goto('http://localhost:5173/frontendAdminSorteo/#/');
  await page.getByRole('link', { name: '' }).nth(1).click();
  await page.getByRole('link', { name: 'Regístrate' }).click();

// Rellenamos el formulario de registro con un correo ya registrado
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill('Carlos Perez');
  await page.locator('input[type="text"]').press('Tab');
  await page.locator('input[type="email"]').fill('carlos@mail.com');
  await page.locator('input[type="email"]').press('Tab');
  await page.getByRole('textbox').nth(2).fill('Carlitos0*');
  await page.getByRole('textbox').nth(2).press('Tab');
  await page.getByRole('textbox').nth(3).fill('Carlitos0*');
  await page.getByRole('button', { name: 'Registrarse' }).click();

// Comprobamos que aparece el mensaje de error
    await expect(page.getByText('No se pudo registrar.')).toBeVisible();
});

//Esta tenemos problema ya que se necesita un correo no registrado para poder hacer el test
test('IS 4. Registrarse con credenciales validas.', async ({ page }) => {
  // Generamos un correo aleatorio para el registro
    const randomEmail = `test${Date.now()}@gmail.com`;

// Abrimos la pagina y seleccionamos el boton de registrarse
  await page.goto('http://localhost:5173/frontendAdminSorteo/#/');
  await page.getByRole('link', { name: '' }).nth(1).click();
  await page.getByRole('link', { name: 'Regístrate' }).click();

// Rellenamos el formulario de registro con credenciales validas
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill('Prueba T3');
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill(randomEmail);
  await page.locator('input[type="email"]').press('Tab');
  await page.getByRole('textbox').nth(2).fill('Prueba0*');
  await page.getByRole('textbox').nth(2).press('Tab');
  await page.getByRole('textbox').nth(3).fill('Prueba0*');
  await page.getByRole('button', { name: 'Registrarse' }).click();

// Comprobamos que se ha registrado correctamente viendo la pagina de login, despues del mensaje de exito
    await expect(page.getByText('Inicie sesión para continuar')).toBeVisible();
});

// TODO: Terminar los test de IS