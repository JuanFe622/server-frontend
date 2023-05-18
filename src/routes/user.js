const express = require('express');
const multiparty = require("connect-multiparty");
const UserController = require('../controllers/user');
const md_auth = require('../middlewares/authenticated');

const md_upload = multiparty({ uploadDir: './uploads/avatar' });
const api = express.Router();

// Rutas de usuario ( Solo usuarios registrados)w
api.get("/me", [md_auth.ensureAuth], UserController.getMe);
api.get("/users-list", [md_auth.ensureAuth], UserController.getUsers);

api.post("/create-user", [md_auth.ensureAuth, md_upload], UserController.createUser);

api.patch("/update-user/:id", [md_auth.ensureAuth, md_upload], UserController.updateUser);

api.delete("/delete-user/:id", [md_auth.ensureAuth], UserController.deleteUser);

module.exports = api;