const router = require("express").Router(); // Ge the router instance of Express
const userController = require("../controllers/user"); // Get all exported functions in the user controller
const fileController = require("../controllers/file");
const auth = require("../middleware/auth");
const { upload } = require("../middleware/multer");

// Map the `signup` request to the ssignup function
router.post("/signup", userController.signup);

// Map the `login` request to the login function
router.post("/login", userController.login);

// Map the 'upload' request to the upload function
router.post("/upload", auth, upload.single("file"), fileController.upload);

module.exports = router;