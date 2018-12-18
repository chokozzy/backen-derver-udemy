var express = require("express");
var bcrypt = require("bcryptjs");
var Usuario = require("../models/usuario");
var jwt = require("jsonwebtoken");
var mdAutenticacion = require('../middleware/autenticacion');
// Inicializar variables
var app = express();
//
// Obtener todos los Usuarios
//

app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Usuario.find({}, "nombre email img role")
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando usuario",
                    errors: err
                });
            } else {
                Usuario.count({}, (err, conteo) => {

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: conteo
                    });
                });
            }
        });
});


//==================================================
// Actualizar Usuario
//==================================================

app.put('/:id', (req, res) => {
    var body = req.body;
    var id = req.params.id;
    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Usuario ' + id + ' no encontrado',
                errors: { message: 'No exitse  un usuario con ese ID' }
            });
        }
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = ':)';
            return res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });


});

//==================================================
// Crear usuario
//==================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        return res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.tokenUser
        });
    });
});
//==================================================
// Borrar usuario
//==================================================

app.delete('/:id', (req, res) => {
    var id = req.params.id;
    Usuario.findOneAndDelete(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No Existe un usuario con ese Id",
                errors: { message: 'No existe un usuario con ese Id' }
            });
        }
        return res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });
});

module.exports = app;