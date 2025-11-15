export const convertirImagenABase64 = (archivo) => {
    return new Promise((resolve, reject) => {
        const lector = new FileReader();
        lector.readAsDataURL(archivo);
        lector.onload = () => resolve(lector.result.split(',')[1]); // Obtener solo la parte base64
        lector.onerror = (error) => reject(error);
    });
};