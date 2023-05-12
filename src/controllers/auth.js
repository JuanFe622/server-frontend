const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("../utils/jwt");
const axios = require('axios');


// Funcion que se encarga de registrar un usuario

const register = async (req, res) => {
    const { firstname, lastname, departament , city ,  email, password } = req.body;

    const response = await axios.get('https://www.datos.gov.co/resource/xdk5-pm3f.json');
    const data = response.data;

    const departamento = data.find((item) => item.departamento.toLowerCase() === departament.toLowerCase());

    const ciudades = data.filter((item) => item.departamento.toLowerCase() === departament.toLowerCase()).map((item) => item.municipio.toLowerCase());

    if(!firstname) { 
        return res.status(400).send({ msg: "El nombre es requerido" });
    }

    if(!lastname) {
        return res.status(400).send({ msg: "El apellido es requerido" });
    }

    if(!departament) {
        return res.status(400).send({ msg: "El departamento es requerido" });
    }

    if (!departamento) {
        return res.status(400).json({ error: 'El departamento ingresado no es válido.' });
      }

    if(!city) {
        return res.status(400).send({ msg: "La ciudad es requerida" });
    }

    if (!ciudades.includes(city.toLowerCase())) {
        return res.status(400).json({ error: 'La ciudad ingresada no pertenece al departamento seleccionado.' });
      }

    if (!email) { 
        return res.status(400).send({ msg: "El email es requerido" });
    }

    if(!password) { 
        return res.status(400).send({ msg: "La constraseña es requerida" });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    const user = new User({
        firstname,
        lastname,
        departament,
        city,
        email: email.toLowerCase(),
        role: "user",
        active: false,
        password: hashPassword
    });

    try {
        const userStorage = await user.save();
        res.status(201).send(userStorage);
    }catch (error) {
        res.status(400).send({ msg: "Error al crear el usuario" })

    }
}

// Funcion que se encarga de loguear un usuario

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password){
            throw new Error("El email y la constraseña son obligatorios")
        }

        const emailToLowerCase = email.toLowerCase();
        const userStorage = await User.findOne({ email: emailToLowerCase }).exec();
        if(!userStorage){
            throw new Error("El usuario no existe")
        }

        const check = await bcrypt.compare(password, userStorage.password)
        if(!check){
            throw new Error("Contraseña incorrecta")
        }

        if(!userStorage.active){
            throw new Error("Usuario no autorizado o no activo")
        }

        res.status(200).send({
            access: jwt.createAccessToken(userStorage),
            refresh: jwt.createRefreshToken(userStorage)
        })
    } catch (error) {
        res.status(400).send({ msg: error.message })
    }
}

function refreshAccessToken(req, res) {
    const { token } = req.body;

    if(!token){
        res.status(400).send({ msg: "Token requerido" })
    }

    const { user_id } = jwt.decoded(token)
    User.findOne({ _id: user_id }, (error, userStorage) => {
        if(error){
            res.status(500).send({ msg: "Error del servidor" })
        }else{
            res.status(200).send({ accesToken: jwt.createAccessToken(userStorage)})
        }
    })
}

module.exports = {
    register,
    login,
    refreshAccessToken
}