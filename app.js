//Requires
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

// Inicializar variables
var app = express();

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Importar Rutas.

var appRoutes = require("./routes/app");
var usuarioRoutes = require("./routes/usuario");
var loginRoutes = require("./routes/login");
var hospitalesRoutes = require("./routes/hospital");
var medicoRoutes = require("./routes/medico");
var busquedaRoutes = require("./routes/busqueda");
var uploadRoutes = require("./routes/upload");

// Conexion a la Base de DAtos
mongoose.connection.openUri(
    "mongodb://localhost:27017/hospitalDB",
    (err, resp) => {
        if (err) throw err;

        console.log("Base de Datos: \x1b[32m%s\x1b[0m", "online");
    }
);
// Rutas
app.use("/usuario", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/hospitales", hospitalesRoutes);
app.use("/medicos", medicoRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/upload", uploadRoutes);
app.use("/", appRoutes);

//escuchar peticiones
app.listen(3000, () => {
    console.log("Express server puerto 3000: \x1b[32m%s\x1b[0m", "online");
});