var express = require("express");
var Usuario = require("../models/usuario");
// Inicializar variables
var app = express();
//
// Obtener todos los Usuarios
//

app.get("/", (req, res, next) => {
  Usuario.find({}, "nombre email img role").exec((err, usuarios) => {
    if (err) {
      res.status(500).json({
        ok: false,
        mensaje: "Error cargando usuario",
        errors: err
      });
    } else {
      res.status(200).json({
        ok: true,
        usuarios: usuarios
      });
    }
  });
});

//==================================================
// Crear usuario
//==================================================

app.post("/", (req, res) => {});

module.exports = app;
