const express = require("express");
const app = express();
const router = express.Router();
const bodyP = require("body-parser");
const compiler = require("compilex");
const mongoose = require("mongoose");
require('dotenv').config();
const bcrypt = require("bcrypt");
const { timeout } = require("nodemon/lib/config");
const options = { stats: true };
const cors = require("cors");

app.use(cors());

console.log('MongoDB URI:', process.env.MONGOURL);
mongoose
  .connect(
    process.env.MONGOURL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Database successfully connected!!");
  })
  .catch((ex) => {
    console.log("Database connection error");
    console.log(ex);
  });

const db = mongoose.connection;

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  address: String,
});
const User = mongoose.model("User", userSchema);

compiler.init(options);
app.use(bodyP.json());
app.use(
  "/codemirror",
  express.static("D:/Projects/Web/Micro Project/CodeSphere/codemirror")
);
app.use("/", router);

app.get("/", function (req, res) {
  res.sendFile("D:/Projects/Web/Micro Project/CodeSphere/index.html");
});

router.post("/signup", async (req, res) => {
  try {
    console.log("signs");
    const { name, email, phone, password, address } = req.query;
    if (!name || !email || !phone || !password || !address) {
      return res
        .status(401)
        .json({ msg: "Please provide all required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
    });
    await user.save();

    res.json({
      status: true,
      msg: "User Registered Successfully",
      data: user,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: false,
      msg: "Something went wrong!",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.query;
    if (!email || !password) {
      return res
        .status(400)
        .json({ msg: "Please provide both email and password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    res.status(200).json({
      status: true,
      msg: "Login successful",
      data: user,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: false,
      msg: "Something went wrong!",
    });
  }
});

app.post("/compile", function (req, res) {
  var code = req.body.code;
  var input = req.body.input;
  var lang = req.body.lang;
  var envData = { OS: "windows" };
  try {
    if (lang == "Cpp") {
      if (!input) {
        var envData = {
          OS: "windows",
          cmd: "g++",
          options: { timeout: 10000 },
        };
        compiler.compileCPP(envData, code, function (data) {
          if (data.output) {
            res.send(data);
          } else {
            res.send({ output: "error" });
          }
        });
      } else {
        var envData = {
          OS: "windows",
          cmd: "g++",
          options: { timeout: 10000 },
        };
        compiler.compileCPPWithInput(envData, code, input, function (data) {
          if (data.output) {
            res.send(data);
          } else {
            res.send({ output: "error" });
          }
        });
      }
    } else if (lang == "Java") {
      if (!input) {
        var envData = { OS: "windows" };
        compiler.compileJava(envData, code, function (data) {
          if (data.output) {
            res.send(data);
          } else {
            res.send({ output: "error" });
          }
        });
      } else if (lang == "Python") {
        var envData = { OS: "windows" };
        compiler.compileJavaWithInput(envData, code, input, function (data) {
          if (data.output) {
            res.send(data);
          } else {
            res.send({ output: "error" });
          }
        });
      }
    } else {
      if (!input) {
        var envData = { OS: "windows" };
        compiler.compilePython(envData, code, function (data) {
          if (data.output) {
            res.send(data);
          } else {
            res.send({ output: "error" });
          }
        });
      } else {
        var envData = { OS: "windows" };
        compiler.compilePythonWithInput(envData, code, input, function (data) {
          if (data.output) {
            res.send(data);
          } else {
            res.send({ output: "error" });
          }
        });
      }
    }
  } catch (e) {
    console.log("error");
  }
});

app.listen(8000);
