// Importation des modules nécessaires
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

// Création de l'application Express
const app = express();
app.use(cors());
// Importation des routes
const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");

// Connexion à la base de données MongoDB

mongoose
  .connect(
    "mongodb+srv://zahra:zahra123@p7-vieuxgrimoire.7kpcdxv.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Middleware pour gérer les en-têtes CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Middleware pour analyser le corps des requêtes au format JSON
app.use(bodyParser.json());

// Utilisation des routes spécifiques pour "/api/auth"
app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

// Exportation de l'application Express
module.exports = app;
