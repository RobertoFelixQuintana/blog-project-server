const Comments = require("../models/Comments");
const Users = require("../models/users");

const controller = {
  saveComments: async (req, res) => {
    const params = req.body;

    const comments = new Comments();

    comments.comment = params.comment;
    comments.anonymous = params.anonymous;
    comments.user = params?.userId;
    comments.issuesId = params?.issuesId;

    const userFound = await Users.findOne({ _id: params.userId });

    if (userFound && !params.anonymous) {
      comments.author = userFound?.name;
    }

    if (!comments.comment || !comments.user) {
      return res.status(404).send({
        error: true,
        message: "Los datos son obligatorios",
        data: [],
      });
    }

    comments.save((err, commentsStored) => {
      if (err)
        return res.status(500).send({
          error: true,
          message: "Error al guardar el comentario",
          data: [],
        });

      if (!commentsStored)
        return res.status(404).send({
          error: true,
          message: "No se ha podido registrar el comentario",
          data: [],
        });

      return res.status(200).send({
        error: false,
        message: "Comentario registrado",
        data: [],
      });
    });
  },

  deleteComments: async (req, res) => {
    const { id } = req.params;

    Comments.findByIdAndDelete(id, (err, commentsDeleted) => {
      if (err)
        return res.status(500).send({
          error: true,
          message: "Error al eliminar el comentario",
          data: [],
        });

      if (!commentsDeleted)
        return res.status(404).send({
          error: true,
          message: "No se ha podido eliminar el comentario",
          data: [],
        });

      return res.status(200).send({
        error: false,
        message: "Comentario eliminado",
        data: [],
      });
    });
  },
};

module.exports = controller;
