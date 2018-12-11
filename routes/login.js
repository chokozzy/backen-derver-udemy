var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var Usuario = require("../models/usuario");
var SEED = require("../config/config").SEED;
// Inicializar variables
var app = express();

app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - email',
                errors: err
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - password',
                errors: err
            });
        }
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        return res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            mensaje: "login Correcto",
            token: token
        });
    });

});

module.exports = app;