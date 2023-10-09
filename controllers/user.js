//Importation des modules nécessaires

const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userAuthToken = process.env.ZAHRA_SECRET_TOKEN;

// Fonction pour s'inscrire
exports.signup = (req, res, next) => {
  // Vérification du format de l'adresse e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return res.status(400).json({ error: "Adresse e-mail invalide !" });
  }

  // Vérification de la longueur et de la complexité du mot de passe
  const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!passwordRegex.test(req.body.password)) {
    return res.status(400).json({
      error:
        "Le mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial !",
    });
  }

  bcrypt
    .hash(req.body.password, 10) // Hashage du mot de passe avec un coût de 10
    .then((hash) => {
      // Création d'un nouvel utilisateur avec l'e-mail et le mot de passe hashé
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save() // Enregistrement de l'utilisateur dans la base de données
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Fonction pour se connecter
exports.login = (req, res, next) => {
  // Vérification du format de l'adresse e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
    return res.status(400).json({ error: "Adresse e-mail invalide !" });
  }

  // Vérification de la longueur et de la complexité du mot de passe
  const passwordRegex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (!passwordRegex.test(req.body.password)) {
    return res.status(400).json({
      error:
        "Le mot de passe doit contenir au moins 8 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial !",
    });
  }

  // Recherche de l'utilisateur dans la base de données par son e-mail
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      // Comparaison du mot de passe fourni avec le mot de passe hashé dans la base de données
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          // Si le mot de passe est valide, création d'un token JWT avec l'ID de l'utilisateur
          const token = jwt.sign({ userId: user._id }, userAuthToken, {
            expiresIn: "24h",
          });
          res.status(200).json({
            userId: user._id,
            token: token,
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
