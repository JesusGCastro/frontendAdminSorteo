import { test, expect } from "@playwright/test";
import { resolve } from "path";

const generateFutureDateTime = (daysAhead, hoursAhead = 0, minutesAhead = 0) => {
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

const generatePastDateTime = (daysAgo, hoursAgo = 0, minutesAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const generateUniqueRaffleName = () => {
  return `Sorteo Test ${Date.now()}`;
};

const loginAsSorteador = async (page) => {
  await page.goto("http://localhost:5173/frontendAdminSorteo/");
  await page.getByTestId("profile").nth(1).click();
  await page.locator('input[type="email"]').fill("sorteador4@mail.com");
  await page.locator('input[type="password"]').fill("123456");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.waitForURL("**/", { timeout: 5000 });
};

const fillBasicRaffleForm = async (page, customData = {}) => {
  const defaultData = {
    nombre: generateUniqueRaffleName(),
    descripcion: "Sorteo de prueba automatizada",
    precioBoleto: "15.50",
    cantidadMaximaBoletos: "500",
    premio: "Premio de prueba",
    limiteBoletosPorUsuario: "5",
  };

  const data = { ...defaultData, ...customData };

  await page.locator('input[name="nombre"]').fill(data.nombre);
  await page.locator('textarea[name="descripcion"]').fill(data.descripcion);
  await page.locator('input[name="precioBoleto"]').fill(data.precioBoleto);
  await page.locator('input[name="cantidadMaximaBoletos"]').fill(data.cantidadMaximaBoletos);
  await page.locator('input[name="premio"]').fill(data.premio);
  await page.locator('input[name="limiteBoletosPorUsuario"]').fill(data.limiteBoletosPorUsuario);
};

const waitForToast = async (page, message) => {
  // Esperamos 500 ms
  await page.waitForTimeout(500);
 
  const selectors = [
    `text="${message}"`,
    `text=${message}`,
    `*:has-text("${message}")`,
    `[class*="toast"]:has-text("${message}")`,
    `div:has-text("${message}")`
  ];

  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      await expect(element).toBeVisible({ timeout: 3000 });
      return true; // Si lo encuentra, retorna true
    } catch (e) {
      // Si no, prueba otro
      continue;
    }
  }

  await page.screenshot({ path: `test-results/toast-error-${Date.now()}.png` });
  throw new Error(`Toast no encontrado con mensaje: "${message}". Ver screenshot en test-results/`);
};

// ==================== PRUEBAS ====================

test.describe("", () => {
  test("SCS 1. Crear sorteo con datos válidos", async ({ page }) => {
    await loginAsSorteador(page);
    await page.getByRole("button", { name: " Crear Sorteo" }).click();

    // Fechas válidas
    const fechaInicioVenta = generateFutureDateTime(1);
    const fechaFinVenta = generateFutureDateTime(3);
    const fechaRealizacion = generateFutureDateTime(5);

    await fillBasicRaffleForm(page);

    // Rellenar fechas
    await page.locator('input[name="fechaInicialVentaBoletos"]').fill(fechaInicioVenta);
    await page.locator('input[name="fechaFinalVentaBoletos"]').fill(fechaFinVenta);
    await page.locator('input[name="fechaRealizacion"]').fill(fechaRealizacion);

    // Subir imagen
    const mockImagePath = resolve("./e2e/ps5-mock.png");
    await page.locator("#file-upload").setInputFiles(mockImagePath);
    await expect(page.getByText("ps5-mock.png")).toBeVisible();

    // Crear sorteo
    await page.getByRole("button", { name: "Crear Sorteo" }).click();
    
    // Verificar éxito
    await waitForToast(page, "¡Sorteo creado exitosamente!");
  });
});

test.describe("", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSorteador(page);
    await page.getByRole("button", { name: " Crear Sorteo" }).click();
    await fillBasicRaffleForm(page);
    
    // Subir imagen
    const mockImagePath = resolve("./e2e/ps5-mock.png");
    await page.locator("#file-upload").setInputFiles(mockImagePath);
  });

  test("SCS 2. Error cuando fecha de inicio de venta es pasada", async ({ page }) => {
    const fechaInicioPasada = generatePastDateTime(1);
    const fechaFinVenta = generateFutureDateTime(3);
    const fechaRealizacion = generateFutureDateTime(5);

    await page.locator('input[name="fechaInicialVentaBoletos"]').fill(fechaInicioPasada);
    await page.locator('input[name="fechaFinalVentaBoletos"]').fill(fechaFinVenta);
    await page.locator('input[name="fechaRealizacion"]').fill(fechaRealizacion);

    await page.getByRole("button", { name: "Crear Sorteo" }).click();

    await waitForToast(page, "La fecha de inicio de venta no puede ser anterior a la fecha actual.");
  });

  test("SCS 3. Error cuando fecha de fin de venta es pasada", async ({ page }) => {
    const fechaInicioVenta = generateFutureDateTime(1);
    const fechaFinPasada = generatePastDateTime(1);
    const fechaRealizacion = generateFutureDateTime(5);

    await page.locator('input[name="fechaInicialVentaBoletos"]').fill(fechaInicioVenta);
    await page.locator('input[name="fechaFinalVentaBoletos"]').fill(fechaFinPasada);
    await page.locator('input[name="fechaRealizacion"]').fill(fechaRealizacion);

    await page.getByRole("button", { name: "Crear Sorteo" }).click();

    await waitForToast(page, "La fecha de fin de venta no puede ser anterior a la fecha actual.");
  });

  test("SCS 4. Error cuando fecha de realización es pasada", async ({ page }) => {
    const fechaInicioVenta = generateFutureDateTime(1);
    const fechaFinVenta = generateFutureDateTime(3);
    const fechaRealizacionPasada = generatePastDateTime(1);

    await page.locator('input[name="fechaInicialVentaBoletos"]').fill(fechaInicioVenta);
    await page.locator('input[name="fechaFinalVentaBoletos"]').fill(fechaFinVenta);
    await page.locator('input[name="fechaRealizacion"]').fill(fechaRealizacionPasada);

    await page.getByRole("button", { name: "Crear Sorteo" }).click();

    await waitForToast(page, "La fecha de realización no puede ser anterior a la fecha actual.");
  });

  test("SCS 5. Error cuando fecha fin <= fecha inicio", async ({ page }) => {
    const fechaInicioVenta = generateFutureDateTime(3);
    const fechaFinVenta = generateFutureDateTime(1); // Anterior a la fecha de inicio
    const fechaRealizacion = generateFutureDateTime(5);

    await page.locator('input[name="fechaInicialVentaBoletos"]').fill(fechaInicioVenta);
    await page.locator('input[name="fechaFinalVentaBoletos"]').fill(fechaFinVenta);
    await page.locator('input[name="fechaRealizacion"]').fill(fechaRealizacion);

    await page.getByRole("button", { name: "Crear Sorteo" }).click();

    await waitForToast(page, "La fecha de fin de venta debe ser posterior a la fecha de inicio.");
  });

  test("SCS 6. Error cuando fecha realización <= fecha fin", async ({ page }) => {
    const fechaInicioVenta = generateFutureDateTime(1);
    const fechaFinVenta = generateFutureDateTime(5);
    const fechaRealizacion = generateFutureDateTime(3); // Anterior a fecha fin

    await page.locator('input[name="fechaInicialVentaBoletos"]').fill(fechaInicioVenta);
    await page.locator('input[name="fechaFinalVentaBoletos"]').fill(fechaFinVenta);
    await page.locator('input[name="fechaRealizacion"]').fill(fechaRealizacion);

    await page.getByRole("button", { name: "Crear Sorteo" }).click();

    await waitForToast(page, "La fecha de realización del sorteo debe ser posterior a la fecha de fin de venta.");
  });
});

test.describe("", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSorteador(page);
    await page.getByRole("button", { name: " Crear Sorteo" }).click();
    
    // Subir imagen
    const mockImagePath = resolve("./e2e/ps5-mock.png");
    await page.locator("#file-upload").setInputFiles(mockImagePath);
  });

  test("SCS 7. Error cuando precio del boleto es cero o negativo", async ({ page }) => {
    await fillBasicRaffleForm(page, { precioBoleto: "0" });

    const fechaInicioVenta = generateFutureDateTime(1);
    const fechaFinVenta = generateFutureDateTime(3);
    const fechaRealizacion = generateFutureDateTime(5);

    await page.locator('input[name="fechaInicialVentaBoletos"]').fill(fechaInicioVenta);
    await page.locator('input[name="fechaFinalVentaBoletos"]').fill(fechaFinVenta);
    await page.locator('input[name="fechaRealizacion"]').fill(fechaRealizacion);

    await page.getByRole("button", { name: "Crear Sorteo" }).click();

    await waitForToast(page, "El precio del boleto debe ser mayor a cero.");
  });

  test("SCS 8. Error cuando cantidad de boletos es cero o negativo", async ({ page }) => {
    await fillBasicRaffleForm(page, { cantidadMaximaBoletos: "0" });

    const fechaInicioVenta = generateFutureDateTime(1);
    const fechaFinVenta = generateFutureDateTime(3);
    const fechaRealizacion = generateFutureDateTime(5);

    await page.locator('input[name="fechaInicialVentaBoletos"]').fill(fechaInicioVenta);
    await page.locator('input[name="fechaFinalVentaBoletos"]').fill(fechaFinVenta);
    await page.locator('input[name="fechaRealizacion"]').fill(fechaRealizacion);

    await page.getByRole("button", { name: "Crear Sorteo" }).click();

    await waitForToast(page, "El número de boletos debe ser mayor a cero.");
  });

  test("SCS 9. Error cuando límite de boletos por usuario es cero o negativo", async ({ page }) => {
    await fillBasicRaffleForm(page, { limiteBoletosPorUsuario: "0" });

    const fechaInicioVenta = generateFutureDateTime(1);
    const fechaFinVenta = generateFutureDateTime(3);
    const fechaRealizacion = generateFutureDateTime(5);

    await page.locator('input[name="fechaInicialVentaBoletos"]').fill(fechaInicioVenta);
    await page.locator('input[name="fechaFinalVentaBoletos"]').fill(fechaFinVenta);
    await page.locator('input[name="fechaRealizacion"]').fill(fechaRealizacion);

    await page.getByRole("button", { name: "Crear Sorteo" }).click();

    await waitForToast(page, "El límite de boletos por persona debe ser mayor a cero.");
  });
});

test.describe("", () => {
  test("SCS 10. Error cuando no se selecciona imagen", async ({ page }) => {
    await loginAsSorteador(page);
    await page.getByRole("button", { name: " Crear Sorteo" }).click();
    await fillBasicRaffleForm(page);

    const fechaInicioVenta = generateFutureDateTime(1);
    const fechaFinVenta = generateFutureDateTime(3);
    const fechaRealizacion = generateFutureDateTime(5);

    await page.locator('input[name="fechaInicialVentaBoletos"]').fill(fechaInicioVenta);
    await page.locator('input[name="fechaFinalVentaBoletos"]').fill(fechaFinVenta);
    await page.locator('input[name="fechaRealizacion"]').fill(fechaRealizacion);

    await page.getByRole("button", { name: "Crear Sorteo" }).click();

    await waitForToast(page, "Por favor, selecciona una imagen para el sorteo.");
  });
});

test.describe("", () => {
  test("SCS 11. Botón cancelar redirige correctamente", async ({ page }) => {
    await loginAsSorteador(page);
    await page.getByRole("button", { name: " Crear Sorteo" }).click();
    
    await expect(page.getByText("Crear Sorteo")).toBeVisible();
    
    await page.getByRole("button", { name: "Cancelar" }).click();
    
    await expect(page).toHaveURL('http://localhost:5173/frontendAdminSorteo/#/');
  });
});