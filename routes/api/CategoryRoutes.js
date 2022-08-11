const express = require("express");
const Category = require("../../schema/categorySchema");
const router = express.Router();
const CATEGORY = require("../../schema/categorySchema");

router.get("/", async (req, res, next) => {
  const categoryList = await CATEGORY.find({}, ["name", "icon", "color"]);
  if (!categoryList) {
    res.sendStatus(500);
    return;
  }
  res.status(200).send(categoryList);
});

router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  const category = await CATEGORY.findById(id, ["name", "icon", "color"]);
  if (!category) {
    res.sendStatus(500);
    return;
  }
  res.status(200).send(category);
});

router.post("/", async (req, res, next) => {
  let category = new CATEGORY({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });
  category = await category.save();
  if (!category) {
    return res.status(404).send("Category Failed to  create");
  }
  res.send(category);
});

router.put("/:id", async (req, res, next) => {
  const id = req.params.id;
  const category = await CATEGORY.findByIdAndUpdate(id, {
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  },{
    new:true
  });
  if (!category) {
    res.sendStatus(500);
    return;
  }
  res.status(202).send(category);
});

router.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  Category.findByIdAndDelete(id)
    .then((category) => {
      if (category) {
        return res.status(200).json({
          success: true,
          message: "The category is successfully deleted",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No Such Category",
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
