const express = require("express");
const router = express.Router();
const bookCtrl = require("../controllers/book");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.post("/", auth, multer, bookCtrl.createBook);
router.get("/bestrating", bookCtrl.bestRating);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.get("/:id", bookCtrl.getOneBook);
router.get("/", bookCtrl.getAllBooks);
router.delete("/:id", auth, multer, bookCtrl.deleteBook);
router.post("/:id/rating", bookCtrl.rateBook);

module.exports = router;
