const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("../utils/jwt");
const axios = require("axios");
const validator = require("validator");

// Funcion que se encarga de registrar un usuario

const register = async (req, res) => {
  const { firstname, lastname, departament, city, email, new_password} =
    req.body;

  // Obtener los datos de la base de datos de los departamentos y ciudades
  
  const departamentosResponse = await axios.get(
    'https://www.datos.gov.co/resource/xdk5-pm3f.json?$select=departamento&$group=departamento'
  );
  const departamentosData = departamentosResponse.data;

  // Validar que el departamento exista en la base de datos
  const departamento = departamentosData.find(
    (item) => item.departamento.toLowerCase() === departament.toLowerCase()
  );

  if (!departamento) {
    console.log('El departamento no existe en la base de datos.');
    return;
  }

  // Obtener los datos de las ciudades del departamento seleccionado
  const ciudadesResponse = await axios.get(
    `https://www.datos.gov.co/resource/xdk5-pm3f.json?departamento=${departament}&$select=municipio&$group=municipio`
  );
  const ciudadesData = ciudadesResponse.data;

  // Validar que la ciudad pertenezca al departamento
  const ciudad = ciudadesData.find(
    (item) => item.municipio.toLowerCase() === city.toLowerCase()
  );

  if (!ciudad) {
    console.log('La ciudad no pertenece al departamento especificado.');
    return;
  }

  // Validar que los campos no esten vacios

  if (!firstname) {
    return res.status(400).send({ msg: "El nombre es requerido" });
  }

  if (!lastname) {
    return res.status(400).send({ msg: "El apellido es requerido" });
  }
  
  if (!email) {
    return res.status(400).send({ msg: "El email es requerido" });
  }

  // Validar que el email sea institucional

  if (!validator.isEmail(email)) {
    return res.status(400).send({ msg: "El email no es válido" });
  }

  if (!email.endsWith("@autonoma.edu.co")) {
    return res.status(400).send({ msg: "El email debe ser institucional" });
  }

  if (!new_password) {
    return res.status(400).send({ msg: "La constraseña es requerida" });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(new_password, salt);

  const user = new User({
    firstname,
    lastname,
    departament,
    city,
    email: email.toLowerCase(),
    role: "user",
    active: false,
    new_password: hashPassword,
  });

  try {
    const userStorage = await user.save();
    res.status(201).send(userStorage);
  } catch (error) {
    res.status(400).send({ msg: "Error al crear el usuario" });
  }
};

// Funcion que se encarga de loguear un usuario

const login = async (req, res) => {
  const { email, new_password } = req.body;

  try {
    if (!email || !new_password) {
      throw new Error("El email y la constraseña son obligatorios");
    }

    const emailToLowerCase = email.toLowerCase();
    const userStorage = await User.findOne({ email: emailToLowerCase }).exec();
    if (!userStorage) {
      throw new Error("El usuario no existe");
    }

    const check = await bcrypt.compare(new_password, userStorage.new_password);
    if (!check) {
      throw new Error("Contraseña incorrecta");
    }

    if (!userStorage.active) {
      throw new Error("Usuario no autorizado o no activo");
    }

    res.status(200).send({
      access: jwt.createAccessToken(userStorage),
      refresh: jwt.createRefreshToken(userStorage),
    });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

function refreshAccessToken(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).send({ msg: "Token requerido" });
    }

    const { user_id } = jwt.decoded(token);
    //Buscar el usuario utilizando una promesa y el id del usuario
    const userStorage = User.findOne({ _id: user_id });
    // Generar un nuevo token de acceso
    const accessToken = jwt.createAccessToken(userStorage);
    // Enviar respuesta al cliente
    return res.status(200).send({ accessToken });
  } catch (error) {
    console.error("Error del servidor: ", error);
    return res.status(500).send({ msg: "Error del servidor" });
  }
}

module.exports = {
  register,
  login,
  refreshAccessToken,
};
