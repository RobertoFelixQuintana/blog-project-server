const Issues = require("../models/Issues");
const Users = require("../models/users");

const controller = {
  getStatsByIssues: async (req, res) => {
    try {
      const issues = await Issues.aggregate([
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

      let totalComments = 0;
      let totalLikes = 0;

      issues?.forEach((issue) => {
        const { comments } = issue;

        totalComments = totalComments + parseInt(comments?.length ?? 0);
        totalLikes = totalLikes + parseInt(issue?.likes?.length ?? 0);
      });

      const stats = [
        {
          label: "Total de comentarios",
          value: totalComments,
        },
        {
          label: "Total de likes",
          value: totalLikes,
        },
      ];

      return res.status(200).send({
        error: false,
        message: "Estadisticas encontradas",
        data: {
          totalInteractions: stats,
          totalIssues: [
            {
              label: "Total de tareas cerradas",
              value: issues.filter((issue) => issue.active === false).length,
            },
            {
              label: "Total de tareas activas",
              value: issues.filter((issue) => issue.active === true).length,
            },
          ],
        },
      });
    } catch (err) {
      return res.status(500).send({
        error: true,
        message: "Ha ocurrido un error al buscar las estadisticas",
        data: [],
      });
    }
  },

  getPosts: async (req, res) => {
    try {
      const posts = await Issues.aggregate([
        {
          $match: { active: true },
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
      return res.status(500).send({
        error: true,
        message: "Ha ocurrido un error al buscar los posts",
        data: [],
      });
    }
  },

  getPostsById: async (req, res) => {
    const { id } = req.params;
    const { byUser } = req.query;

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
          $match: { [byUser ? "user" : "_id"]: id },
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

      if (byUser) {
        return res.status(200).send({
          error: false,
          message: "Post encontrado",
          data: postFound,
        });
      }

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

  editPost: async (req, res) => {
    const params = req.body;

    if (!params.id || !params.title || !params.description) {
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

    issues.title = params.title;
    issues.description = params.description;
    issues.active = params.active;

    if (typeof params.anonymous === "boolean") {
      issues.anonymous = params.anonymous;
    }
    const user = await Users.findOne({ email: params.email });

    if (!issues.anonymous && user) {
      issues.author = user?.name;
    } else {
      issues.author = "Anónimo";
    }

    await issues.save((err, postsStored) => {
      if (err) {
        return res.status(500).send({
          error: true,
          message: "Error al guardar el post",
          data: [],
        });
      }

      return res.status(200).send({
        error: false,
        message: "Post actualizado correctamente",
        data: postsStored,
      });
    });
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
