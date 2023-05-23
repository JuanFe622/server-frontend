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

const createUser = async (req, res) => {
    try {
      const userData = req.body;
      const user = new User({ ...userData, active: false });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.new_password, salt);
      user.new_password = hashedPassword;
  
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

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    if (userData.new_password) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(userData.new_password, salt);
      userData.new_password = hashPassword;
    } else {
      delete userData.new_password;
    }

    if (req.files && req.files.avatar) {
      const imagePath = image.getFilePath(req.files.avatar);
      userData.avatar = imagePath;
    }

    await User.findByIdAndUpdate({ _id: id}, userData);
    res.status(200).send({ msg: "Usuario actualizado" });
  } catch (error) {
    res.status(400).send({ msg: "Error al actualizar el usuario" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).send({ msg: "Usuario eliminado" });
  } catch (error) {
    res.status(400).send({ msg: "Error al eliminar el usuario" });
  }
};

module.exports = {
  getMe,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
