const Users = require("../models/users");
const jwt = require("jsonwebtoken");

const controller = {
  save: async (req, res) => {
    const params = req.body;

    const user = new Users();

    user.name = params.name;
    user.email = params.email;
    user.password = params.password;
    user.active = true;

    if (!user.name || !user.email || !user.password) {
      return res.status(404).send({
        error: true,
        message: "Los datos son obligatorios",
        data: [],
      });
    }

    if (user.password.length < 6) {
      return res.status(404).send({
        error: true,
        message: "La contraseña debe tener al menos 6 caracteres",
        data: [],
      });
    }

    const userFound = await Users.findOne({ email: user.email });

    if (userFound) {
      return res.status(404).send({
        error: true,
        message: "El usuario ya está registrado",
        data: [],
      });
    }

    user.save((err, userStored) => {
      if (err) {
        return res.status(500).send({
          error: true,
          message: "Error al guardar el usuario",
          data: [],
        });
      }

      if (!userStored)
        return res.status(404).send({
          error: true,
          message: "No se ha podido registrar el usuario",
          data: [],
        });

      return res.status(200).send({
        error: false,
        message: "Usuario agregado correctamente",
        data: userStored,
      });
    });
  },

  login: async (req, res) => {
    const params = req.body;

    const email = params.email;
    const password = params.password;

    if (!email || !password)
      return res.status(404).send({
        error: true,
        message: "Los datos son obligatorios",
        data: [],
      });

    const userFound = await Users.findOne(
      {
        email: email,
        password: password,
      },
      { password: 0, id: 0 }
    );

    if (!userFound) {
      return res.status(404).send({
        error: true,
        message: "El usuario o contraseña son incorrectos",
        data: [],
      });
    }

    const token = jwt.sign({ id: userFound.id }, "secretKey", {
      expiresIn: "5h",
    });

    userFound.token = token;

    await userFound.save((err, userStored) => {
      if (err)
        return res.status(500).send({
          error: true,
          message: "Error al guardar el token",
          data: [],
        });

      return res.status(200).send({
        error: false,
        message: "Sesión iniciada correctamente",
        data: userFound,
      });
    });
  },

  delete: async (req, res) => {
    const email = req.body.email;

    try {
      const deletedUser = await Users.findOneAndDelete({ email: email });

      if (!deletedUser) {
        return res.status(404).send({
          error: true,
          message: "El usuario no existe",
          data: [],
        });
      }

      return res.status(200).send({
        error: false,
        message: "Usuario eliminado correctamente",
        data: [],
      });
    } catch (error) {
      return res.status(500).send({
        error: true,
        message: "Error al eliminar el usuario",
        data: [],
      });
    }
  },
};

module.exports = controller;
