# Frontend Admin Sorteo

Interfaz web del sistema de administración de sorteos.  
Desarrollada con *React + Vite, utiliza **Bootstrap* para el diseño y *React Router* para la navegación entre vistas.

---

##  Características principales

-  Funciones del proyecto de sorteos
-  Integración con microservicio de autenticación (API Gateway)  
-  Navegación con HashRouter (compatible con GitHub Pages)  
-  Diseño responsivo con Bootstrap 5  
-  Despliegue automático en *GitHub Pages*

---

##  Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- npm (viene con Node)

Verifica las versiones con:
bash
node -v
npm -v

## Instalación y ejecución en produccion

##Clonar el repositorio
bash
git clone https://github.com/jesusgcastro/frontendAdminSorteo.git
cd frontendAdminSorteo


##Instalar dependencias
bash
npm install

##Ejecutar el servidor de desarrollo
bash
npm run dev

##Construcción para producción
Para generar la versión optimizada del proyecto:
bash
npm run build

Esto crea la carpeta /dist con todos los archivos listos para producción.

##Despliegue en GitHub Pages
El proyecto está configurado para desplegarse automáticamente en GitHub Pages usando el paquete gh-pages.
Para hacerlo manualmente:
bash
npm run deploy

La página se publicará. 

Tomar en cuenta que se debe de trabajar de la rama "main", ya que al hacer build se generara un archivo dist, posteriormente al hacer deploy se subira automaticamente con github actions en la rama "gh-pages"