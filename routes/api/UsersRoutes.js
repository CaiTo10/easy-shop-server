const express = require("express");
const router = express.Router();
const User = require("../../schema/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.get("/",async (req, res, next) => {
  try {
    // to exclude passwordHash field from res
    const userList = await User.find().select("-passwordHash");
    if (!userList) {
      return res.status(500).json({ success: false });
    }
    res.send(userList);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:id",async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id).select("-passwordHash");
    if (!user) {
      res.sendStatus(500);
      return;
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/get/count",async (req, res, next) => {
  try {
    
    const userCount = await User.countDocuments();
    if (!userCount) {
      return res.send("no User available");
    }
    res.send({ userCount });
  } catch (error) {
    res.send(error);
  }
});

router.post("/",async (req, res, next) => {
  if(!req.auth.isAdmin){
    res.sendStatus(403)
  }
  try {
    const registeredUser = await User.findOne({ email: req.body.email });
    if (registeredUser) {
      return res.status(400).send("User Already Existed");
    }

    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });
    user = await user.save();
    if (!user) {
      return res.status(404).send("Category Failed to  create");
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const registeredUser = await User.findOne({ email: req.body.email });
    if (registeredUser) {
      return res.status(400).send("User Already Existed");
    }

    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });
    user = await user.save();
    if (!user) {
      return res.status(404).send("Category Failed to  create");
    }
    res.status(200).send(user);
  } catch (error) {
    
    res.status(500).send(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("No Such User");
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res.status(200).send({ user: user.email, token });
    } else {
      return res.status(400).send("Please check your credential again");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/:id", (req, res, next) => {

  const id = req.params.id;
  User.findByIdAndDelete(id)
    .then((user) => {
      if (user) {
        return res.status(200).json({
          success: true,
          message: "The User is successfully deleted",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No Such User",
        });
      }
    })
    .catch((err) => {
      
      res.status(400).json({
        success: false,
        error: err,
      });
    });
});

module.exports = router;
