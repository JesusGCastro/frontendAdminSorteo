import { test, expect } from '@playwright/test';

test('IS 1. Iniciar sesion con credenciales validas.', async ({ page }) => {
  // Abrimos la pagina y seleccionamos el boton de login
  await page.goto('http://localhost:5173/frontendAdminSorteo/#/');
  await page.getByTestId('profile').nth(1).click();

  // Rellenamos el formulario de login y accedemos a la cuenta;
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('carlos@mail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  // Comprobamos que hemos iniciado sesion correctamente, viendo el nombre del usuario en la parte de arriba de la pagina
  await expect(page.getByText('Carlos')).toBeVisible();
});

test('IS 2. Iniciar sesion con credenciales invalidas.', async ({ page }) => {
  // Abrimos la pagina y seleccionamos el boton de login
  await page.goto('http://localhost:5173/frontendAdminSorteo/#/');
  await page.getByTestId('profile').nth(1).click();
  // Rellenamos el formulario de login con credenciales invalidas
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('carlos@mail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await expect(page.getByText(/Correo o contraseña/i)).toBeVisible();
});

test('IS 3. Registrarse con correo ya registrado.', async ({ page }) => {
  // Abrimos la pagina y seleccionamos el boton de registrarse
  await page.goto('http://localhost:5173/frontendAdminSorteo/#/');
  await page.getByTestId('profile').nth(1).click();
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
  await page.getByTestId('profile').nth(1).click();
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

// Prueba 5: IS 5. Participante no ve boton iniciar sesion				
test('IS 5. Participante no ve boton iniciar sesion', async ({ page }) => {
  await page.goto('http://localhost:5173/frontendAdminSorteo/');
  await page.getByTestId('profile').nth(1).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('carlos@mail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByRole('button', { name: 'profile' })).toHaveCount(0);
});

// Prueba 6: IS 6. Invitado no puede ver la configuración ni cambiar de cuenta.		
test('IS 6. Invitado no puede ver la configuración ni cambiar de cuenta.', async ({ page }) => {
  await page.goto('http://localhost:5173/frontendAdminSorteo/');
  await expect(page.getByText('Invitado')).toBeVisible();
  await expect(page.getByRole('button', { name: 'config' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'switch' })).toHaveCount(0);
});

// Prueba 7: IS 7. Participante no puede cambiar de cuenta.	
test('IS 7. Participante no puede cambiar de cuenta.', async ({ page }) => {
  await page.goto('http://localhost:5173/frontendAdminSorteo/');
  await page.getByTestId('profile').nth(1).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('carlos@mail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill('123456');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByRole('button', { name: 'switch' })).toHaveCount(0);
});

// Prueba 8: IS 8. Sorteador cambia a vista de participante y de vuelta.			
test('IS 8. Sorteador cambia a vista de participante y de vuelta.', async ({ page }) => {
  await page.goto('http://localhost:5173/frontendAdminSorteo/');
  await page.getByTestId('profile').nth(1).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill('sorteador3@mail.com');
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('S');
  await page.locator('input[type="password"]').press('CapsLock');
  await page.locator('input[type="password"]').fill('Sorteador0*');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
  await expect(page).toHaveURL(/#\/sorteador$/);
  let rolActual = await page.evaluate(() => localStorage.getItem('rolActual'));
  await expect(rolActual).toBe('sorteador');
  await page.getByTestId('switch').click();
  await page.waitForURL(/#\/$/);
  rolActual = await page.evaluate(() => localStorage.getItem('rolActual'));
  await expect(rolActual).toBe('participante');
  await page.getByTestId('switch').nth(1).click();
  await expect(page).toHaveURL(/#\/sorteador$/);
  rolActual = await page.evaluate(() => localStorage.getItem('rolActual'));
  await expect(rolActual).toBe('sorteador');
});	