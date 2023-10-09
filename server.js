// Récupérer les variables d'environnement du fichier .env
const dotenv = require("dotenv");
dotenv.config();

const http = require("http"); // Importe le module http de Node.js pour créer le serveur HTTP
const app = require("./app"); // Importe le module app depuis le fichier app.js

const normalizePort = (val) => {
  // Fonction pour normaliser le numéro de port
  const port = parseInt(val, 10); // Convertit le numéro de port en un entier

  if (isNaN(port)) {
    // Vérifie si le port n'est pas un nombre
    return val; // Renvoie la valeur du port telle quelle
  }

  if (port >= 0) {
    // Vérifie si le port est un nombre positif ou nul
    return port; // Renvoie les numéro de port valide
  }

  return false; // Renvoie false si le port est invalide
};

const port = normalizePort(process.env.PORT || "3000"); // Normalise le port spécifié ou utilise le port par défaut 3000
app.set("port", port); // Configure l'application pour utiliser le port spécifié

const errorHandler = (error) => {
  // Fonction de gestion des erreurs
  if (error.syscall !== "listen") {
    // Vérifie si l'erreur ne concerne pas la fonction listen du serveur
    throw error; // Lève l'erreur
  }

  const address = server.address(); // Récupère l'adresse du serveur
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port; // Formatte l'adresse du serveur

  switch (error.code) {
    case "EACCES": // Erreur d'autorisation
      console.error(bind + " requires elevated privileges.");
      process.exit(1); // Quitte le processus avec un code d'échec
      break;
    case "EADDRINUSE": // Erreur d'adresse déjà utilisée
      console.error(bind + " is already in use.");
      process.exit(1); // Quitte le processus avec un code d'échec
      break;
    default:
      throw error; // Lève l'erreur
  }
};

const server = http.createServer(app); // Crée le serveur HTTP en utilisant l'application app

server.on("error", errorHandler); // Gère les erreurs du serveur
server.on("listening", () => {
  const address = server.address(); // Récupère l'adresse du serveur
  const bind = typeof address === "string" ? "pipe " + address : "port " + port; // Formatte l'adresse du serveur

  console.log("Listening on " + bind); // Affiche un message lorsque le serveur est en écoute
});

server.listen(port); // Lance le serveur en écoutant sur le port spécifié
