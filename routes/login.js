var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var Usuario = require("../models/usuario");
var SEED = require('../config/config').SEED;

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
// Inicializar variables
var app = express();

// ==================================================
// Autenticacion por Google
// ==================================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        // [CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,

    };
}

app.post('/google', async(req, res) => {

    const token = req.body.token;
    const googleUser = await verify(token)
        .catch((e) => {
            return res.status(403).json({
                ok: false,
                mensaje: "Token no Valido",
            });
        });
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err,
            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar una autenticacion normal'
                });
            } else {
                const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                return res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    mensaje: 'login Correcto UsuarioDB',
                    token: token,
                });
            }

        } else {
            var usuarioNuevo = new Usuario();
            usuarioNuevo.nombre = googleUser.nombre;
            usuarioNuevo.email = googleUser.email;
            usuarioNuevo.img = googleUser.img;
            usuarioNuevo.google = true;
            usuarioNuevo.password = ':)';
            usuarioNuevo.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 horas
                res.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    error: err,
                    token: token
                });
            })
        }
    });
});
// ==================================================
// Autenticacion Normal
// ==================================================
app.post('/', (req, res) => {
    const body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err,
            });
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - email',
                errors: 'errores',
            });
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales Incorrectas - password',
                errors: bcrypt.hashSync(body.password, 10),
            });
        }
        usuarioDB.password = ':)';
        const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        return res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            mensaje: 'login Correcto',
            token: token,
        });
    });
});

module.exports = app;