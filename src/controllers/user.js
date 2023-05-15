const bcrypt = require("bcryptjs");
const User = require("../models/user");
const image = require("../utils/image");

const getMe = async (req, res) => {
  try {
    const { user_id } = req.user;
    const response = await User.findById(user_id);
    if (!response) {
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }
    return res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
};

const getUsers = async (req, res) => {
  try {
    const { active } = req.query;
    let response = null;

    if (active === undefined) {
      response = await User.find();
    } else {
      response = await User.find({ active });
    }
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
};

// const createUser = async (req, res) => {
//   try {
//     const { firstname, lastname, departament, city, email, password, avatar } =
//       req.body;
//     const user = new User({ ...req.body, active: false });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     user.password = hashedPassword;

//     if (req.files.avatar) {
//       const imagePath = image.getFilePath(req.files.avatar);
//       user.avatar = imagePath;
//     }

//     const userStored = await user.save();
//     res.status(201).send(userStored);
//   } catch (error) {
//     console.error("Error: ", error);
//     res.status(400).send(error);
//   }
// };

const createUser = async (req, res) => {
    try {
      const userData = req.body;
      const user = new User({ ...userData, active: false });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      user.password = hashedPassword;
  
      if (req.files.avatar) {
        const imagePath = image.getFilePath(req.files.avatar);
        user.avatar = imagePath;
      }
  
      const userStored = await user.save();
      res.status(201).send(userStored);
    } catch (error) {
      res.status(400).send({ msg: "Error al crear el usuario" });
    }
  };

module.exports = {
  getMe,
  getUsers,
  createUser,
};
