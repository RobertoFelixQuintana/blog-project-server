const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: true,
      message: "Token no proporcionado",
    });
  }

  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Token no válido",
      });
    }

    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;
