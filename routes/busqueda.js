var express = require("express");

// Inicializar variables
var app = express();
var Hospital = require("../models/hospital");
var Medicos = require("../models/medico");
var Usuario = require("../models/usuario");

//==================================================
// Busqueda por coleccion
//==================================================
app.get("/coleccion/:tabla/:busqueda", (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regexBusqueda = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regexBusqueda);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regexBusqueda);
            break;
        case 'hospitales':
            promesa = buscarHospital(busqueda, regexBusqueda);
            break;
        default:
            res.status(400).json({
                ok: false,
                message: "Los tipos de busqueda solo son Usuarios, Medicos y Hospitales",
                error: { message: "Tipo de Tabla invalido" }
            });


    }
    promesa.then(resultado => {
        res.status(200).json({
            ok: true,
            [tabla]: resultado
        });
    });
});

//==================================================
// Busqueda General en todas las colecciones
//==================================================
app.get("/todo/:busqueda", (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospital(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuesta => {
        res.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuarios: respuesta[2]
        });

    });





});

function buscarHospital(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject("Error al cargar hospitales", err);
                } else {
                    resolve(hospitales);
                }
            });

    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medicos.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, medicos) => {
                if (err) {
                    reject("Error al cargar Medicos", err);
                } else {
                    resolve(medicos);
                }
            });

    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject("Error al cargar Usuarios", err);
                } else {
                    resolve(usuarios);
                }
            });

    });
}
module.exports = app;