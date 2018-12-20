var express = require("express");
var fileUpload = require('express-fileupload');

// Inicializar variables
var app = express();


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
                    errors: err
                });
            } else {
                res.status(200).json({
                    ok: true,
                    mensaje: "Archivo movido"
                });
            }
        });


    }

});

module.exports = app;