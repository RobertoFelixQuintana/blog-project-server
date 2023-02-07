"use strict";

const Users = require("../models/users");
const { use } = require("../routes/users");

const controller = {
  save: async (req, res) => {
    const params = req.body;

    const user = new Users();

    user.name = params.name;
    user.email = params.email;
    user.password = params.password;
    user.token = params.token;
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
      if (err)
        return res.status(500).send({
          error: true,
          message: "Error al guardar el usuario",
          data: [],
        });

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

    const userFound = await Users.findOne({
      email: email,
      password: password,
    });

    if (!userFound) {
      return res.status(404).send({
        error: true,
        message: "El usuario o contraseña son incorrectos",
        data: [],
      });
    }

    return res.status(200).send({
      error: false,
      message: "Sesión iniciada correctamente",
      data: userFound,
    });
  },

  delete: (req, res) => {
    const id = req.params.id;

    Users.findByIdAndRemove(id, (err, userRemoved) => {
      if (err)
        return res.status(500).send({
          error: true,
          message: "Error al eliminar el usuario",
          data: [],
        });

      if (!userRemoved)
        return res.status(404).send({
          error: true,
          message: "No se ha podido eliminar el usuario",
          data: [],
        });

      return res.status(200).send({
        error: false,
        message: "Usuario eliminado correctamente",
        data: userRemoved,
      });
    });
  },
};

module.exports = controller;
