"use strict";

const express = require("express");
const mongoose = require("mongoose");
const users_routes = require("./routes/users");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const port = 3001;
const url = process.env.MONGODB_URI;

mongoose.Promise = global.Promise;

app.use(express.urlencoded({ extended: true, useUnifiedTopology: true }));

// Convertimos cualquier petición a JSON
app.use(express.json());

// Configuramos el CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Origin, Authorization, X-Requested-With, Accept, X-Requested-With"
  );
  res.header("Allow", "GET, POST, PUT, OPTIONS, DELETE");
  next();
});

app.use("/api", users_routes);

mongoose.set("strictQuery", false);

mongoose
  .connect(url, { useNewUrlParser: true })
  .then(() => {
    console.log("Conexión a la base de datos establecida con éxito...");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => console.log(err));
