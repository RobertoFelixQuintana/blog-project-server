const Issues = require("../models/Issues");
const Users = require("../models/users");

const controller = {
  getPosts: async (req, res) => {
    try {
      const posts = await Issues.aggregate([
        {
          $lookup: {
            from: "comments",
            let: { issuesId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$issuesId", "$$issuesId"],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  issuesId: 0,
                },
              },
            ],
            as: "comments",
          },
        },
      ]);

      return res.status(200).send({
        error: false,
        message: "Posts encontrados",
        data: posts,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send({
        error: true,
        message: "Ha ocurrido un error al buscar los posts",
        data: [],
      });
    }
  },

  getPostsById: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(404).send({
        error: true,
        message: "Los datos son obligatorios",
        data: [],
      });
    }

    try {
      const postFound = await Issues.aggregate([
        {
          $match: { _id: id },
        },
        {
          $lookup: {
            from: "comments",
            let: { issuesId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$issuesId", "$$issuesId"],
                  },
                },
              },
              {
                $project: {
                  issuesId: 0,
                },
              },
            ],
            as: "comments",
          },
        },
      ]);

      if (!postFound) {
        return res.status(404).send({
          error: true,
          message: "No se encontraron posts",
          data: [],
        });
      }

      const [userPost] = postFound;

      return res.status(200).send({
        error: false,
        message: "Post encontrado",
        data: userPost,
      });
    } catch (err) {
      return res.status(500).send({
        error: true,
        message: "Ha ocurrido un error al buscar los post",
        data: [],
      });
    }
  },

  setLike: async (req, res) => {
    const params = req.body;

    if (!params.id || !params.userId) {
      return res.status(404).send({
        error: true,
        message: "Los datos son obligatorios",
        data: [],
      });
    }

    const issues = await Issues.findOne({ _id: params.id });

    if (!issues) {
      return res.status(404).send({
        error: true,
        message: "El post no existe",
        data: [],
      });
    }

    if (issues.likes.includes(params.userId)) {
      const tempData = issues.likes.filter((item) => item !== params.userId);

      issues.likes = tempData;
    } else {
      const tempData = [...issues.likes];
      tempData.push(params.userId);

      issues.likes = tempData;
    }

    issues.save((err, postsStored) => {
      if (err)
        return res.status(500).send({
          error: true,
          message: "Error al guardar el post",
          data: [],
        });

      if (!postsStored)
        return res.status(404).send({
          error: true,
          message: "No se ha podido registrar el post",
          data: [],
        });

      return res.status(200).send({
        error: false,
        message: "Registro actualizado correctamente",
        data: [],
      });
    });
  },

  savePosts: async (req, res) => {
    const params = req.body;

    const issues = new Issues();

    issues.title = params.title;
    issues.description = params.description;
    issues.anonymous = params.anonymous;
    issues.active = true;

    const user = await Users.findOne({ email: params.email });

    if (user) {
      issues.user = user?._id;
    }

    if (!issues.anonymous) {
      issues.author = user?.name;
    }

    if (!issues.title || !issues.description) {
      return res.status(404).send({
        error: true,
        message: "Los datos son obligatorios",
        data: [],
      });
    }

    issues.save((err, postsStored) => {
      if (err)
        return res.status(500).send({
          error: true,
          message: "Error al guardar el post",
          data: [],
        });

      if (!postsStored)
        return res.status(404).send({
          error: true,
          message: "No se ha podido registrar el post",
          data: [],
        });

      return res.status(200).send({
        error: false,
        message: "Post agregado correctamente",
        data: [],
      });
    });
  },

  deletePosts: async (req, res) => {
    const params = req.body;

    const posts = new Issues();

    posts.title = params.title;
    posts.content = params.content;
    posts.active = true;

    if (!posts.title || !posts.content) {
      return res.status(404).send({
        error: true,
        message: "Los datos son obligatorios",
        data: [],
      });
    }

    posts.save((err, postsStored) => {
      if (err)
        return res.status(500).send({
          error: true,
          message: "Error al guardar el post",
          data: [],
        });

      if (!postsStored)
        return res.status(404).send({
          error: true,
          message: "No se ha podido registrar el post",
          data: [],
        });

      return res.status(200).send({
        error: false,
        message: "Post agregado correctamente",
        data: postsStored,
      });
    });
  },
};

module.exports = controller;
