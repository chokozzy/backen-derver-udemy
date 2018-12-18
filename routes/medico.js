var express = require("express");
var bcrypt = require("bcryptjs");
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");
var mdAutenticacion = require('../middleware/autenticacion');

var app = express();


//==================================================
// Obtener todos los medicos
//==================================================
app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({}, "nombre img usuario hospital")
        .populate("usuario", "nombre email")
        .populate("hospital")
        .skip(desde)
        .limit(5)
        .exec((err, medicos) => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: "Error cargando medicos",
                    errors: err
                });
            } else {
                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });

                });
            }
        });
});
//==================================================
// Crea un medico
//==================================================
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.tokenUser,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        } else {
            return res.status(201).json({
                ok: true,
                medico: medicoGuardado,
                usuarioToken: req.tokenUser
            });
        }
    });
});

//==================================================
// Actualizar Medico
//==================================================

app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var id = req.params.id;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar medico",
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'medico ' + id + ' no encontrado',
                errors: { message: 'No exitse  un medico con ese ID' }
            });
        }
        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.tokenUser;
        medico.hospital = body.hospital;
        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            return res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });
});
//==================================================
// Eliminar Usuario
//==================================================
app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findOneAndDelete(id, (err, medicoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el medico',
                errors: err
            });
        }
        if (!medicoEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: "No Existe un medico con ese Id",
                errors: { message: 'No existe un medico con ese Id' }
            });
        }
        return res.status(200).json({
            ok: true,
            medico: medicoEliminado
        });
    });
});

module.exports = app;