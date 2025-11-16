import { test, expect } from "@playwright/test";
import { resolve } from "path";

const generateFutureDateTime = (
  daysAhead,
  hoursAhead = 0,
  minutesAhead = 0
) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(date.getHours() + hoursAhead);
  date.setMinutes(date.getMinutes() + minutesAhead);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/*const generatePastDateTime = (daysAgo, hoursAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};*/

const generateUniqueRaffleName = () => {
  // Usa un timestamp para asegurar la unicidad del nombre
  return `Sorteo Test ${Date.now()}`;
};

// Test para crear un sorteo
test("SCS 1. Crear sorteo con datos validos.", async ({ page }) => {
  // Abrimos la pagina de inicio de sesion
  await page.goto("http://localhost:5173/frontendAdminSorteo/");

  // Iniciamos sesion como sorteador
  await page.getByTestId("profile").nth(1).click();
  await page.locator('input[type="email"]').click();
  await page.locator('input[type="email"]').fill("sorteador4@mail.com");
  await page.locator('input[type="password"]').click();
  await page.locator('input[type="password"]').fill("123456");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  // Navegamos a la pagina de crear sorteo
  await page.getByRole("button", { name: " Crear Sorteo" }).click();

  // Rellenamos el formulario de crear sorteo
  const fechaInicioVenta = generateFutureDateTime(1);
  const fechaFinVenta = generateFutureDateTime(3);
  const fechaRealizacion = generateFutureDateTime(5);

  // Usamos un nombre unico para evitar conflictos
  await page.locator('input[name="nombre"]').fill(generateUniqueRaffleName());
  await page
    .locator('textarea[name="descripcion"]')
    .fill("Sorteo de prueba automatizada con Cloudinary");
  await page.locator('input[name="precioBoleto"]').fill("15.50");
  await page.locator('input[name="cantidadMaximaBoletos"]').fill("500");
  await page.locator('input[name="premio"]').fill("Viaje a la NASA");
  await page.locator('input[name="limiteBoletosPorUsuario"]').fill("5");

  // Rellenamos las fechas
  await page
    .locator('input[name="fechaInicialVentaBoletos"]')
    .fill(fechaInicioVenta);
  await page
    .locator('input[name="fechaFinalVentaBoletos"]')
    .fill(fechaFinVenta);
  await page.locator('input[name="fechaRealizacion"]').fill(fechaRealizacion);

  const mockImagePath = resolve("./e2e/ps5-mock.png");

  await page.locator("#file-upload").setInputFiles(mockImagePath);

  await expect(page.getByText("ps5-mock.png")).toBeVisible();

  await page.getByRole("button", { name: "Crear Sorteo" }).click();
  // Comprobamos que el sorteo se ha creado correctamente
  await expect(page.getByText("¡Sorteo creado exitosamente!")).toBeVisible();
});

/*test("SCS 2. Seleccionar fechas, rango y precio invalidos.", async ({
 page,
}) => {
 // Abrimos la pagina de inicio de sesion
 await page.goto("http://localhost:5173/frontendAdminSorteo/");

 // Iniciamos sesion como sorteador
 await page.getByTestId("profile").nth(1).click();
 await page.locator('input[type="email"]').click();
 await page.locator('input[type="email"]').fill("sorteador4@mail.com");
 await page.locator('input[type="password"]').click();
 await page.locator('input[type="password"]').fill("123456");
 await page.getByRole("button", { name: "Iniciar Sesión" }).click();

 // Navegamos a la pagina de crear sorteo
 await page.getByRole("button", { name: " Crear Sorteo" }).click();

 // Fechas para la prueba:
 const fechaPasada = generatePastDateTime(1, 1); // D-1 (Para error 1)
 const fechaFuturaValida = generateFutureDateTime(5); // D+5 (Para corrección)
 const fechaFuturaCercana = generateFutureDateTime(1); // D+1 (Para error de rango)

 // Para forzar el error de realización <= fin
 const fechaFinInvalida = generateFutureDateTime(2); // D+2
 const fechaRealizacionInvalida = generateFutureDateTime(2); // D+2

 // 1. LLENAR DATOS BÁSICOS Y ERROR INICIAL (PRECIO = 0)

 await page.locator('input[name="nombre"]').fill("Sorteo Fallido Test");
 await page
  .locator('textarea[name="descripcion"]')
  .fill("Prueba de error de validación");
 await page.locator('input[name="premio"]').fill("Ninguno");

 // ERROR 1: Precio = 0
 await page.locator('input[name="precioBoleto"]').fill('0'); 
 await page.locator('input[name="cantidadMaximaBoletos"]').fill("100");
 await page.locator('input[name="limiteBoletosPorUsuario"]').fill("5");

 // 2. SUBIR IMAGEN (Necesario para pasar la primera validación)
 const mockImagePath = resolve("./e2e/ps5-mock.png");
 await page.locator("#file-upload").setInputFiles(mockImagePath);

 // 3. Rellenamos las fechas con valores que fallarán en el orden de las validaciones de JS
 await page.locator('input[name="fechaInicialVentaBoletos"]').fill(fechaPasada); // D-1
 await page.locator('input[name="fechaFinalVentaBoletos"]').fill(fechaFuturaValida); // D+5
 await page.locator('input[name="fechaRealizacion"]').fill(fechaFuturaValida); // D+5

 // --- INICIO DE ASERSIONES DE ERROR (Paso a paso) ---

 // 4.1. VERIFICAR EL ERROR NUMÉRICO (PRECIO <= 0)
 await page.getByRole('button', { name: 'Crear Sorteo' }).click();
 await expect(page.getByText('El precio del boleto debe ser mayor a cero.')).toBeVisible({ timeout: 10000 });


 // 4.2. CORREGIR EL PRECIO E INTRODUCIR ERROR DE FECHA DE INICIO (Pasado)
 await page.locator('input[name="precioBoleto"]').fill('10.00'); // Corregido
 // La fecha de inicio ya está en el pasado (fechaPasada), lo cual dispara el siguiente error.
 
 await page.getByRole('button', { name: 'Crear Sorteo' }).click();

 // 4.3. VERIFICAR EL ERROR DE FECHA DE INICIO 
 await expect(page.getByText('La fecha de inicio de venta no puede ser anterior a la fecha actual.')).toBeVisible({ timeout: 10000 });
 
 
 // 4.4. CORREGIR FECHA DE INICIO y PRUEBA DE ERROR DE RANGO (Inicio > Fin)
 await page.locator('input[name="fechaInicialVentaBoletos"]').fill(fechaFuturaValida); // D+5 (Correcto)
 await page.locator('input[name="fechaFinalVentaBoletos"]').fill(fechaFuturaCercana); // D+1 (D+1 < D+5, dispara el error de rango)

 await page.getByRole('button', { name: 'Crear Sorteo' }).click();
 
 // 4.5. VERIFICAR EL ERROR DE RANGO (fechaFin <= fechaInicio)
 await expect(page.getByText('La fecha final de venta debe ser posterior a la fecha de inicio.')).toBeVisible({ timeout: 10000 });


 // 4.6. CORREGIR RANGO E INTRODUCIR ERROR DE REALIZACIÓN (Realización <= Fin)
 await page.locator('input[name="fechaFinalVentaBoletos"]').fill(generateFutureDateTime(4)); // D+4 (Rango válido: D+5 > D+4)
 await page.locator('input[name="fechaRealizacion"]').fill(fechaRealizacionInvalida); // D+4 (D+4 <= D+4, dispara el error)

 await page.getByRole('button', { name: 'Crear Sorteo' }).click();

 // 4.7. VERIFICAR EL ERROR DE REALIZACIÓN
 await expect(page.getByText('La fecha de realización del sorteo debe ser posterior a la fecha final de venta.')).toBeVisible({ timeout: 10000 });


 // 5. ASERSION FINAL: Navegación NO debe ocurrir (porque el último error no fue corregido)
 await expect(page).not.toHaveURL('http://localhost:5173/'); 
});*/