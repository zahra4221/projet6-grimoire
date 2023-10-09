Book = require("../models/book");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Fonction pour créer une publication de livre
exports.createBook = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "Veuillez sélectionner une image." });
  }

  // Redimensionner l'image avec Sharp
  const imageFilename = `${Date.now()}.webp`;
  sharp(req.file.path)
    .resize(500) // Modifier les dimensions de l'image selon vos besoins
    .toFile(path.join(__dirname, "../images", imageFilename))
    .then(() => {
      // Supprimer l'image temporaire
      fs.unlinkSync(req.file.path);

      const bookObject = JSON.parse(req.body.book);
      // Ajoute l'identifiant utilisateur actuel aux propriétés de bookObject.
      bookObject.userId = req.auth.userId;
      delete bookObject._id;
      const book = new Book({
        ...bookObject,
        imageUrl: `${req.protocol}://${req.get(
          "host"
        )}/images/${imageFilename}`,
      });

      book
        .save()
        .then(() => {
          res.status(201).json({ message: "Livre enregistré !" });
        })
        .catch((error) => {
          res.status(404).json({ error });
        });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// Fonction pour obtenir plus de détails sur un livre
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

//Fonction pour supprimer un livre
exports.deleteBook = (req, res, next) => {
  const bookId = req.params.id;

  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé !" });
      }

      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: "Non autorisé !" });
      }

      const imagePath = path.join(
        __dirname,
        "../images",
        getImageFilename(book.imageUrl)
      );

      fs.unlink(imagePath, (error) => {
        if (error) {
          console.log(
            "Erreur lors de la suppression de l'image du livre :",
            error
          );
        }
      });

      Book.deleteOne({ _id: bookId })
        .then(() => {
          res.status(200).json({ message: "Livre supprimé !" });
        })
        .catch((error) => {
          res.status(500).json({ error });
        });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

const getImageFilename = (imageUrl) => {
  const urlParts = imageUrl.split("/");
  return urlParts[urlParts.length - 1];
};
// Fonction pour obtenir plus de détails sur tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// Fonction pour mettre à jour un livre
exports.modifyBook = async (req, res) => {
  try {
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename.split(".")[0]
          }resized.webp`,
        }
      : { ...req.body };

    delete bookObject._userId;
    const book = await Book.findOne({ _id: req.params.id });

    if (book.userId != req.auth.userId) {
      res.status(401).json({ message: "Non autorisé !" });
    } else {
      if (req.file) {
        try {
          const filename = book.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, (err) => {
            if (err) throw err;
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({ error });
        }

        const imageFilename = `${Date.now()}.webp`;
        await sharp(req.file.path)
          .resize(500)
          .toFile(path.join(__dirname, "../images", imageFilename))
          .then(() => {
            fs.unlinkSync(req.file.path);
          });

        bookObject.imageUrl = `${req.protocol}://${req.get(
          "host"
        )}/images/${imageFilename}`;
      }

      await Book.updateOne(
        { _id: req.params.id },
        { ...bookObject, _id: req.params.id }
      );

      res.status(200).json({ message: "Livre modifié !" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

//Fonction pour noter les livres

exports.rateBook = (req, res, next) => {
  const { userId, rating } = req.body;
  const bookId = req.params.id;

  // Vérifier que userId et rating sont définis et ont une valeur
  if (!userId || isNaN(rating)) {
    return res.status(400).json({
      error: "Veuillez spécifier un ID utilisateur valide et une note valide.",
    });
  }

  // Vérifier que la note est un nombre compris entre 0 et 5
  if (rating < 0 || rating > 5) {
    return res
      .status(400)
      .json({ error: "La note doit être comprise entre 0 et 5." });
  }

  // Trouver le livre correspondant à l'ID fourni
  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Livre introuvable." });
      }

      // Vérifier si l'utilisateur a déjà noté ce livre
      const alreadyRated = book.ratings.some(
        (rated) => rated.userId === userId
      );
      if (alreadyRated) {
        return res
          .status(400)
          .json({ error: "L'utilisateur a déjà noté ce livre." });
      }

      // Ajouter la nouvelle note à la liste des notes du livre
      book.ratings.push({ userId, grade: rating });

      // Mettre à jour la note moyenne du livre
      const ratingsCount = book.ratings.length;
      const ratingsSum = book.ratings.reduce(
        (sum, currRating) => sum + currRating.grade,
        0
      );
      book.averageRating = ratingsSum / ratingsCount;

      // Enregistrer les modifications du livre dans la base de données
      book
        .save()
        .then((updatedBook) => {
          res.status(200).json(updatedBook);
        })
        .catch((error) => {
          res
            .status(500)
            .json({ error: "Erreur lors de l'enregistrement de la note." });
        });
    })
    .catch((error) => {
      res.status(500).json({ error: "Erreur lors de la recherche du livre." });
    });
};

//Fonction pour afficher les 3 meilleurs livres
exports.bestRating = (req, res, next) => {
  try {
    Book.find()
      .sort({ averageRating: -1 })
      .limit(3)
      .then((topRatedBooks) => {
        res.status(200).json(topRatedBooks);
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des meilleurs livres." });
  }
};
