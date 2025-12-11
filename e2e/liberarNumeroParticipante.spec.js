import { test, expect } from "@playwright/test";



// Función para iniciar sesión como participante
const loginAsParticipante = async (page) => {
  await page.goto("http://localhost:5173/frontendAdminSorteo/");
  await page.getByTestId("profile").nth(1).click();
  await page.locator('input[type="email"]').fill("hector21@gmail.com");
  await page.locator('input[type="password"]').fill("Hector21$");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.waitForURL("**", { timeout: 10000 });
};

const selectRaffle = async (page) => {
    await page.getByRole('img', { name: 'Regreso a Clases Solidario' }).click();
    await expect (page.getByRole('heading', { name: 'Regreso a Clases Solidario' })).toBeVisible();
}

const reserveTickets = async (page) => {
  await page.getByRole("button", { name: "51", exact: true }).click();
  await page.getByRole("button", { name: "52", exact: true }).click();
  await page.getByRole('button', { name: 'Apartar números' }).click();
  await expect (page.getByText('Boletos apartados')).toBeVisible();
}

const liberarTickets = async (page) => {
  await page.getByRole("button", { name: "51", exact: true }).click();
  await page.getByRole("button", { name: "52", exact: true }).click();
  await page.getByRole('button', { name: 'Liberar números' }).click();
  await expect (page.getByText('Boletos liberados')).toBeVisible();
}

const liberarTicketsNoValidos = async (page) => {
    await expect(
        page.getByRole("button", { name: "2", exact: true }))
        .toBeDisabled();
    await expect(
        page.getByRole("button", { name: "3", exact: true }))
        .toBeDisabled();
    await expect(
        page.getByRole("button", { name: "16", exact: true }))
        .toHaveCSS('cursor', 'not-allowed');
}


test ("PLN 1 - Liberar numeros apartados por el participante", async ({ page }) => {
  await loginAsParticipante(page);
  await selectRaffle(page);
  await reserveTickets(page);
  await liberarTickets(page);
});

test ("PLN 2 - Verificar que no se pueden liberar numeros no apartados por el participante", async ({ page }) => {
    await loginAsParticipante(page);
    await selectRaffle(page);
    await liberarTicketsNoValidos(page);
});

