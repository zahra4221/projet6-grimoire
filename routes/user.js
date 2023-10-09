// Importation du module express et création d'un router
const express = require("express");
const router = express.Router();

// Importation du contrôleur userCtrl
const userCtrl = require("../controllers/user");

// Route POST pour l'inscription d'un utilisateur
router.post("/signup", userCtrl.signup);

// Route POST pour la connexion d'un utilisateur
router.post("/login", userCtrl.login);

// Exportation du router
module.exports = router;
