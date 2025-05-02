# 🚀 Nombre de tu API

Breve descripción (1-2 líneas) sobre el propósito de la API. Ejemplo:  
_"API REST para el modulo de Productos Nuevos, utilizando Express, SQL Server, JWT"_

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/express-4.18.2-lightgrey)](https://expressjs.com/)

## 📋 Requisitos Previos

- Node.js >= 20.17.0 ([Descargar Node.js](https://nodejs.org/))
- npm >= 10.8.2 (viene con Node.js) o yarn
- Mssql >= 10.8.2 (local o [Atlas](https://www.mongodb.com/atlas/database))

## 🛠️ Instalación

- npm install
- crear un archivo .env (variables de entorno) con lo siguiente
- ejemplo:
- - - PORT=3000
- - - MONGODB_URI=mongodb://localhost:27017/nombre_db
- - - JWT_SECRET=tu_clave_secreta

## Correr Servidor

- node src/server.js

## Estructura del proyecto

src/
├── controllers/ # Lógica de endpoints ()
├── files/ # Lógica de los archivos
├── middlewares/ # Auth, validaciones, etc.
├── notifications/ # Lógica de las notificaciones
├── routes/ # Definición de rutas (HTTP)
├── sql/ #
└── server.js # Inicialización de Express

## Otros archivos

--- .env -> Variables de entorno que son accesibles desde cualquier parte del codigo
--- .http -> Pruebas de peticiones http (solo sirve para pruebas)
--- eslint.config.js -> Archivo de configuracion del linter(nos muestra errores en el codigo)
--- package.json -> Archivo que almacena las versiones de todos los paquetes npm instalados en el proyecto y la configuracion general del proyecto
