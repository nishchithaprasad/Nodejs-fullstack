const { User, validate } = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { encrypt, decrypt } = require("../utils/confirmation");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

exports.signup = async (req, res) => {
  try {
    // Validate the user data
    const { error } = validate(req.body);
    console.log("req.body",req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { firstName, lastName, username, email, password } = req.body; // Get the user data

    // Check if the user exists in the database
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create an user object
    let user = await User.create({
      firstName,
      lastName,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Create the user token
    const token = jwt.sign(
      { userId: user._id, email },
      process.env.TOKEN_SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;

    // Return the created user data
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
  }
};

exports.login = async (req, res) => {
    try {
      // Get user data
      const { emailOrUsername, password } = req.body;
  
      // Validate user data
      if (!(emailOrUsername && password)) {
        res.status(400).send("All data is required");
      }
  
      // A regex expression to test if the given value is an email or username
      let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      const data = regexEmail.test(emailOrUsername)
        ? {
            email: emailOrUsername,
          }
        : {
            username: emailOrUsername,
          };
  
      // Validate if user exist in our database
      const user = await User.findOne(data);

      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const email = user.email;
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_SECRET_KEY,
          {
            expiresIn: "2h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        return res.status(200).json(user);
      }
      res.status(400).send("Invalid Credentials");
    } catch (err) {
      console.error(err);
      return res.status(400).send(err.message);
    }
  };