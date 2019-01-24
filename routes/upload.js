var express = require("express");
var fileUpload = require('express-fileupload');
var fileSystem = require('fs');

// Inicializar variables
var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
//Middleware
app.use(fileUpload());

app.put("/:tipo/:id", (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: "Tipo incorrecto",
            errors: { message: 'Los tipos apropiados son: ' + tiposValidos.join(',') }
        });
    }

    if (!req.files) {
        res.status(400).json({
            ok: false,
            mensaje: "No Selecciono nada",
            errors: { message: 'Debe Seleccionar una imagen' }
        });

    }
    //Obtener Nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];
    var extensionesValidas = ['png', 'JPG', 'gif', 'jpeg'];


    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: "Extension no Valida",
            errors: { message: 'Las extensiones validas son: ' + extensionesValidas.join(',') }
        });
    } else {
        //Nombre Personalizado
        var nombreFinal = `${ id }-${ new Date().getMilliseconds()}.${ extensionArchivo }`;

        //Mover uploads

        var path = `./uploads/${ tipo }/${ nombreFinal }`;
        archivo.mv(path, err => {
            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: "Error al mover archivo",
                    path: path,
                    errors: err
                });
            } else {
                subirPorTipo(tipo, id, nombreFinal, res);
            }
        });


    }

});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo == 'usuarios') {
        Usuario.findById(id, (err, usr) => {
            if (!usr) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "Usuario no existe",
                    errors: { message: 'Usuario no existe' }
                });
            }
            var pathViejo = '../uploads/usuarios/' + usr.img;
            if (fileSystem.existsSync(pathViejo)) {
                fileSystem.unlink(pathViejo);
            }
            usr.img = nombreArchivo;
            return usr.save((err, usuarioActualizado) => {
                usuarioActualizado.password = '=)';
                res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de Usuario Actualizado",
                    usuario: usuarioActualizado
                });
            });


        });

    }
    if (tipo == 'medicos') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "EL Medico no existe",
                    errors: { message: 'Medico no existe' }
                });
            }
            var pathViejo = '../uploads/medicos/' + medico.img;
            if (fileSystem.existsSync(pathViejo)) {
                fileSystem.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            return medico.save((err, medicoActualizado) => {

                res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de Medico Actualizado",
                    medico: medicoActualizado
                });
            });


        });
    }
    if (tipo == 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "EL Hospital no existe",
                    errors: { message: 'Hospital no existe' }
                });
            }
            var pathViejo = '../uploads/hospitales/' + hospital.img;
            if (fileSystem.existsSync(pathViejo)) {
                fileSystem.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            return hospital.save((err, hospitalActualizado) => {

                res.status(200).json({
                    ok: true,
                    mensaje: "Imagen de Hospital Actualizado",
                    hospital: hospitalActualizado
                });
            });


        });
    }
}
module.exports = app;