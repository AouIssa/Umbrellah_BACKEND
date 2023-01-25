const express = require("express");
const app = express();

require("dotenv").config();
const mongoose = require("mongoose");

app.use(express.json());

const port = 5005;
const multer = require("multer");

const ImageSchema = new mongoose.Schema({
  image: { type: Buffer, required: true },
});
const Image = mongoose.model("Image", ImageSchema);
const storage = multer.memoryStorage();
const upload = multer({ storage });

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database");
  })
  .catch((e) => console.log(e));

app.listen(port, () => {
  console.log("Server started");
});

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const newImage = new Image({ image: req.file.buffer });
    await newImage.save();
    res.send({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.send({ status: "error" });
  }
});

app.post("/post", async (req, res) => {
  console.log(req.body);
  const { data } = req.body;

  try {
    if (data == "aous") {
      res.send({ status: "ok" });
    } else {
      res.send({ status: "User Not found" });
    }
  } catch (error) {
    res.send({ status: "Something went wrong try again" });
  }
});

require("./userDetails");

const User = mongoose.model("UserInfo");

//Password handler

const bcrypt = require("bcrypt");
const { Router } = require("next/router");

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (name == "" || email == "" || password == "") {
    res.json({
      status: "Failed",
      message: "Empty input fields!",
    });
  } else if (!/^[a-zA-Z ]*$/.test(name)) {
    res.json({
      status: "FAILED",
      message: "Invalid name input",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid email input",
    });
  } else if (password.length < 8) {
    res.json({
      status: "FAILED",
      message: "Password must be at least 8 or more characters",
    });
  } else {
    User.find({ email })
      .then((result) => {
        if (result.length) {
          res.json({
            status: "Failed",
            message: "User with the provided email already exists!",
          });
        } else {
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                uname: name,
                email,
                password: hashedPassword,
              });

              newUser
                .save()
                .then((result) => {
                  res.json({
                    status: "Success",
                    message: "SignUp Succesfull",
                    data: result,
                  });
                })
                .catch((err) => {
                  res.json({
                    status: "Failed",
                    message: "An error occured while saving account!",
                  });
                });
            })
            .catch((err) => {
              res.json({
                status: "Failed",
                message: "An error occured while hashing password!",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occurred while checking for existing user!",
        });
      });
  }

  // try {
  //   await User.create({
  //       uname: name,
  //       email,
  //       password
  //   });
  //   res.send({status:"ok xD"})
  // } catch (error) {
  //   res.send({status: "Error xD"})
  // }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (email == "" || password == "") {
    res.json({
      status: "Failed",
      message: "Empty inputs",
    });
  } else {
    User.find({ email })
      .then((data) => {
        if (data) {
          const hashedPassword = data[0].password;
          bcrypt
            .compare(password, hashedPassword)
            .then((result) => {
              if (result) {
                res.json({
                  status: "SUCCESS",
                  message: "Signin successful",
                  data: data,
                });
              } else {
                res.json({
                  status: "FAILED",
                  message: "Invalid password entered!",
                });
              }
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "An error orccured while comparing the passords",
              });
            });
        } else {
          res.json({
            status: "FAILED",
            message: "Invalid inputs",
          });
        }
      })
      .catch((err) => {
        res.json({
          status: "Failed",
          message: "An error occurred while checking for existing user!",
        });
      });
  }
});

module.exports = app;
