//Importation du module jsonwebtoken
const jwt = require("jsonwebtoken");
// Récupération des variables d'environnement depuis le fichier .env
const dotenv = require("dotenv");
dotenv.config();
const userAuthToken = process.env.ZAHRA_SECRET_TOKEN;

// Middleware d'authentification
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, userAuthToken);
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
