import { test, expect } from "@playwright/test";

const loginAsSorteador = async (page) => {
    await page.goto("http://localhost:5173/frontendAdminSorteo/");
    // Esperar a que cargue la redirección inicial si la hay
    await page.waitForTimeout(1000); 
    
    // Si ya hay sesión iniciada, cerramos (opcional, depende de tu flujo)
    // Asumimos flujo limpio:
    if (await page.getByTestId("profile").count() > 0) {
        await page.getByTestId("profile").nth(1).click();
    }
    
    await page.locator('input[type="email"]').fill("sorteador4@mail.com");
    await page.locator('input[type="password"]').fill("123456");
    await page.getByRole("button", { name: "Iniciar Sesión" }).click();
    
    // Esperamos a navegar al Home
    await page.waitForURL("**/", { timeout: 10000 });
};

const seleccionarSorteo = async (page) => {
    // Busca el sorteo por el texto del título en lugar de la imagen, es más estable
    // O usa el selector de imagen si prefieres, pero asegúrate que el sorteo existe
    await page.locator('.card-title').filter({ hasText: 'Regreso a Clases Solidario' }).click();
    await page.getByRole('link', { name: 'Pagos' }).click();
    // Esperar a que la tabla cargue
    await page.waitForSelector('table');
}

test("SMNP 1 - Confirmar comprobante de pago", async ({ page }) => {
    await loginAsSorteador(page);
    await seleccionarSorteo(page);

    // BUSCAR DINÁMICO: Click en la primera fila que tenga "PENDIENTE" y "TRANSFERENCIA"
    const filaPendiente = page.locator('tbody tr')
        .filter({ hasText: 'PENDIENTE' })
        .filter({ hasText: 'TRANSFERENCIA' })
        .first();

    // Verificamos que exista al menos uno antes de dar click
    await expect(filaPendiente).toBeVisible({ timeout: 5000 });
    await filaPendiente.click();

    // Boton confirmar debe ser visible
    await expect(page.getByRole('button', { name: 'CONFIRMAR PAGO' })).toBeVisible();
});

test("SMNP 2 - Rechazar comprobante de pago", async ({ page }) => {
    await loginAsSorteador(page);
    await seleccionarSorteo(page);

    // BUSCAR DINÁMICO: Igual que el anterior, buscamos uno pendiente
    const filaPendiente = page.locator('tbody tr')
        .filter({ hasText: 'PENDIENTE' })
        .filter({ hasText: 'TRANSFERENCIA' })
        .first();
        
    await expect(filaPendiente).toBeVisible({ timeout: 5000 });
    await filaPendiente.click();

    // Boton rechazar debe ser visible
    await expect(page.getByRole('button', { name: 'RECHAZAR PAGO' })).toBeVisible();
});

test("SMNP 3 - Visualización de botones en transferencia no pendiente", async ({ page }) => {
    await loginAsSorteador(page);
    await seleccionarSorteo(page);

    // BUSCAR DINÁMICO: Click en una fila que sea TRANSFERENCIA pero que NO sea PENDIENTE (ej. COMPLETADO)
    // Nota: Necesitas tener un pago COMPLETADO o RECHAZADO en la BD para que esto pase.
    const filaNoPendiente = page.locator('tbody tr')
        .filter({ hasText: 'TRANSFERENCIA' })
        .filter({ hasNotText: 'PENDIENTE' }) 
        .first();

    // Si no tienes pagos completados, este test fallará. 
    // Asegúrate de tener datos o cambia 'hasNotText' según lo que tengas.
    if (await filaNoPendiente.isVisible()) {
        await filaNoPendiente.click();
        await expect(page.getByRole('img', { name: 'Comprobante' })).toBeVisible();
        // Botones no deben ser visibles
        await expect(page.getByRole('button', { name: 'RECHAZAR PAGO' })).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'CONFIRMAR PAGO' })).not.toBeVisible();
    } else {
        console.log("Salto Test 3: No hay transferencias completadas para probar.");
    }
});

test("SMNP 4 - Visualización de botones en no transferencia.", async ({ page }) => {
    await loginAsSorteador(page);
    await seleccionarSorteo(page);

    // BUSCAR DINÁMICO: Buscar un pago en LÍNEA
    const filaLinea = page.locator('tbody tr')
        .filter({ hasText: 'LINEA' })
        .first();

    if (await filaLinea.isVisible()) {
        await filaLinea.click();
        // Botones no deben ser visibles
        await expect(page.getByRole('button', { name: 'RECHAZAR PAGO' })).not.toBeVisible();
        await expect(page.getByRole('button', { name: 'CONFIRMAR PAGO' })).not.toBeVisible();
    } else {
         console.log("Salto Test 4: No hay pagos en línea para probar.");
    }
});