require("dotenv").config();
require("./database/database.js").connect();
const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const router = require("./routes/index");
const auth = require("./middleware/auth");

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000'
}));
const port = process.env.PORT || 5000;

app.use("/api", router);

app.use('/uploads', express.static('./uploads'));

app.get("/", (req, res) => {
    res.send({ message: "Hello, nodemon!" });
});

app.listen(port, () => {
    console.log(`app is listening at http://localhost:${port}`);
});

app.post("/api/hello", auth, (req, res) => {
  res.status(200).send("Hello 🙌 ");
});