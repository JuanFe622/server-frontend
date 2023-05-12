const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const { API_VERSION } = require("./constants");
const app = express();
/* Cargamos las rutas */
const authRoutes = require("./src/routes/auth")

/* Trabajar con la extensión client-rest */
app.use(bodyParser.json());
/* pruebas de reques usando postman */
app.use(bodyParser.urlencoded({ extended: true }));

/* 
Evita bloqueos en el navegador cuando estemos trabajando
con backend y el front a la vez
*/
app.use(cors());
console.log(`api/${API_VERSION}/`);
app.use(`/api/${ API_VERSION }/auth`, authRoutes)

module.exports = app;