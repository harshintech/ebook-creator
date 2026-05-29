const express = require("express");
const router = express.Router();

const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  updateBookCover,
  getPublicBookById,
} = require("../controllers/bookController");

const { protect } = require("../middlewares/authMiddleware");

const upload = require("../middlewares/uploadMiddleware");

// Public route to view published books (accessible without token)
router.get("/public/:id", getPublicBookById);

// Apply protect middleware to all routes in this file
router.use(protect);
router.route("/").post(createBook).get(getBooks);
router.route("/:id").get(getBookById).put(updateBook).delete(deleteBook);
router.route("/cover/:id").put(upload, updateBookCover);


/**
Both is same 

1.  router.route("/").post(createBook).get(getBooks);

2. router.post("/", createBook);
   router.get("/", getBooks);
 */

module.exports = router;
