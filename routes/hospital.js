var express = require("express");
var bcrypt = require("bcryptjs");
var Hospital = require("../models/hospital");
var mdAutenticacion = require('../middleware/autenticacion');

//Init Variables

var app = express();

//==================================================
// Obtener todos los usuarios
//==================================================
app.get("/", (req, res, next) => {
    Hospital.find({}, "nombre img usuario")
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando hospitales",
                    errors: err
                });
            } else {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales
                });
            }
        });
});
//==================================================
// Crea un usuario
//==================================================
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.tokenUser
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        } else {
            return res.status(201).json({
                ok: true,
                hospital: hospitalGuardado,
                usuarioToken: req.tokenUser
            });
        }
    });
});

//==================================================
// Actualizar Hospital
//==================================================

app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var id = req.params.id;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar hospital",
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Hospital ' + id + ' no encontrado',
                errors: { message: 'No exitse  un hospital con ese ID' }
            });
        }
        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.tokenUser;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });
});
//==================================================
// Eliminar Usuario
//==================================================
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findOneAndDelete(id, (err, hospitalEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }
        if (!hospitalEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No Existe un hospital con ese Id",
                errors: { message: 'No existe un hospital con ese Id' }
            });
        }
        return res.status(200).json({
            ok: true,
            hospital: hospitalEliminado
        });
    });
});
module.exports = app;