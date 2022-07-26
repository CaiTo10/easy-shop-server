const express = require("express");
const router = express.Router();
const mongoose = require("mongoose")
const PRODUCT = require("../../schema/productSchema");
const CATEGORY = require("../../schema/categorySchema");
const multer = require('multer')

const FILE_TYPE_MAP = {
  'image/png':'png',
  'image/jpeg':'jpeg',
  'image/jpg':'jpg'
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-")
    const extension = FILE_TYPE_MAP[file.mimetype]
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({ storage: storage })

router.get("/", async (req, res, next) => {
  try {
    console.log(req.auth)
    const filter = {}

    if(req.query.categories){
      filter.category = req.query.categories.split(',')
    }
    // // filter scopes of field to return
    // const productList = await PRODUCT.find(filter,["name", "image", "price","id"]);
    const productList = await PRODUCT.find(filter);
  if (!productList) {
    res.sendStatus(500);
    return;
  }
  res.send(productList);
  } catch (error) {
    res.status(500).send(error)
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await PRODUCT.findById(req.params.id, [
      "name",
      "image",
      "price",
      "category",
    ]).populate("category");
    if (!product) {
      return res.status(404).json({ success: false });
    }
    res.send(product);
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
});

router.get("/get/count",async(req,res,next)=>{
try {
  const productCount = await PRODUCT.countDocuments()
  if(!productCount){
     return res.send("no Product available")
  }
  res.send({productCount})
} catch (error) {
  res.send(error)
}
})

router.get("/get/featured/",async(req,res,next)=>{
  try {
    const count = req.query.count || 0
    const products = await PRODUCT.find({isFeatured:true}).limit(+count)
    if(!products){
       return res.send("no Product available")
    }
    res.send({products})
  } catch (error) {
    res.send(error)
  }
  })

router.post("/",uploadOptions.single('image') ,async (req, res, next) => {
  const category = await CATEGORY.findById(req.body.category);
  console.log(category);
  if (!category) {
    return res.status(400).send("Invalid Category Selected");
  }
  const file = req.file
  if(!file){
    return res.status(400).send("No Product Image")
  }
  console.log(req.file)
  const fileName = req.file.filename
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
  const newProduct = new PRODUCT({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });
  const product = await newProduct.save();
  if (!product) {
    return res.status(500).send("Failed to Create New Product");
  }
  return res.status(200).send(product);
});

router.put("/:id",uploadOptions.single('image'), async (req, res, next) => {
  try {
    const id = req.params.id;
    if(!mongoose.isValidObjectId(id)){
      return res.status(400).send("Please check your request ID")
    }
    // mongoose.isValidObjectId(id)
    const category = await CATEGORY.findById(req.body.category)
    console.log(category);
    if (!category) {
      return res.status(400).send("Invalid Category Selected");
    }
    const product = await PRODUCT.findById(id)
    if(!product){
      return res.status(400).send("Invalid Product Selected");
    }
    const file = req.file
    let imagePath
    if(file){
      const fileName = req.file.filename
      const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
      imagePath = `${basePath}${fileName}`
    }else{
      imagePath = product.image
    }
    const updatedProduct = await PRODUCT.findByIdAndUpdate(
      id,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: imagePath,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
      },
      {
        new: true,
      }
    )
    if (!updatedProduct) {
      res.status(500).send("Failed to Update the Product");
      return;
    }
    res.status(202).send(updatedProduct);
  } catch (error) {
    console.log(error)
    return res.status(500).send(error)
  }
});

router.put("/gallery-images/:id",uploadOptions.array('images',10), async (req, res, next) => {
try {
  const id = req.params.id
  if(!mongoose.isValidObjectId(id)){
    return res.status(400).send("Please check your request ID")
  }
  const files= req.files
  console.log({files})
  let imagesPaths = []
  const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
  if(files){
    files.map(file=>{
      console.log({file})
      imagesPaths.push(`${basePath}${file.filename}`)
    })
  }
  
  const updatedProduct = await PRODUCT.findByIdAndUpdate(
    id,
    {
      images:imagesPaths
    },
    {
      new: true,
    }
  )
  if(!updatedProduct){
    return res.status(500).send("Failed to Upload Images Array")
  }
  res.status(202).send(updatedProduct)
} catch (error) {
  console.log(error)
  res.status(500).send("Issue at backend")
}
})

router.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  PRODUCT.findByIdAndDelete(id)
    .then((product) => {
      if (product) {
        return res.status(200).json({
          success: true,
          message: "The product is successfully deleted",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No Such product",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json({
        success: false,
        error: err,
      });
    });
});



module.exports = router;
