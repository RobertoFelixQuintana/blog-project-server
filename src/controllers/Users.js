const Users = require("../models/users");
const Posts = require("../models/Issues");
const Comments = require("../models/Comments");
const jwt = require("jsonwebtoken");

const controller = {
  getStatsByUsers: async (req, res) => {
    const startOfMonth = new Date();
    startOfMonth.setMonth(startOfMonth.getMonth() - 7);
    startOfMonth.setDate(1);

    const stats = await Users.aggregate([
      {
        $match: {
          created: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$created",
            },
          },
          users: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $project: {
          date: "$_id",
          users: 1,
          _id: 0,
        },
      },
    ]);

    return res.status(200).json({
      error: false,
      message: "Estadísticas de usuarios",
      data: stats,
    });
  },

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

  editUser: async (req, res) => {
    const { id, email, name, password } = req.body;

    if (!password || !id) {
      return res.status(404).send({
        error: true,
        message: "Los campos son obligatorios",
        data: [],
      });
    }

    if (password.length < 6) {
      return res.status(404).send({
        error: true,
        message: "La contraseña debe tener al menos 6 caracteres",
        data: [],
      });
    }

    const usersByEmail = Users.find({
      email: email,
    });

    if (usersByEmail?.length > 1) {
      return res.status(404).send({
        error: true,
        message: "El email ya está registrado",
        data: [],
      });
    }

    const user = await Users.findOne({ email: email, password: password });

    if (!user) {
      return res.status(404).send({
        error: true,
        message: "El usuario o contraseña son incorrectos",
        data: {},
      });
    }

    user.name = name;
    user.email = email;

    await user.save((err, userStored) => {
      if (err) {
        return res.status(500).send({
          error: true,
          message: "Error al guardar el usuario",
          data: {},
        });
      }

      return res.status(200).send({
        error: false,
        message: "Usuario actualizado correctamente",
        data: userStored,
      });
    });
  },

  delete: async (req, res) => {
    const { id } = req.body;

    try {
      if (!id) {
        return res.status(404).send({
          error: true,
          message: "Los campos son obligatorios",
          data: [],
        });
      }

      await Comments.deleteMany({ user: id });
      await Posts.deleteMany({ user: id });

      const deletedUser = await Users.findOneAndDelete({ _id: id });

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
