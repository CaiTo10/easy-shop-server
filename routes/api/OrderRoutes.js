const express = require("express");
const Category = require("../../schema/categorySchema");
const router = express.Router();

const ORDER = require("../../schema/orderSchema");
const ORDERITEM = require("../../schema/orderItemSchema");


router.get("/", async (req, res, next) => {
  // 
  const orderList = await ORDER.find().populate("user", ["name"]);
  if (!orderList) {
    res.sendStatus(500);
    return;
  }
  res.status(200).send(orderList);
});

router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  let order = await ORDER.findById(id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    }) // === order = await ORDERITEM.populate(order,{path:"orderItems.product"})
    .sort({"dateOrdered":-1})
    .catch((error) => {
      
      return res.sendStatus(500).send(error);
    });
  if (!order) {
    res.sendStatus(500);
    return;
  }

  res.status(200).send(order);
});

router.get("/get/totalsales", async (req, res, next) => {
  const totalSales = await ORDER.aggregate([
    // $match for filtering only selected field value
    { $match: {} },
    // $group use Id to identify by each field , follow by the
    // variable name given by us , get the value by $sum of fieldname property
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
    // $sort by fieldname either desc or asc
    { $sort: {} },
  ]);
  if (!totalSales) {
    return res.status(400).send("There is no order Sales Yet");
  } else {
    res.send({ totalSales: totalSales.pop().totalSales });
  }
});

router.get("/get/count", async (req, res, next) => {
  try {
    const orderCount = await ORDER.countDocuments();
    if (!orderCount) {
      return res.send("no Order available");
    }
    res.send({ orderCount });
  } catch (error) {
    res.send(error);
  }
});

router.get("/get/userorders/:userId", async (req, res, next) => {
  const userId = req.params.userId;
  const userOrderList = await ORDER.find({ user: userId }).populate({
    path: "orderItems",
    populate: {
      path: "product",
      populate: "category",
    },
  })
  .sort({"dateOrdered":-1});
  if (!userOrderList) {
    res.sendStatus(500);
    return;
  }
  res.status(200).send(userOrderList);
});

router.post("/", async (req, res, next) => {
  const userAuth = req.auth.userId
  
  try {
    
    const orderItemsIds = Promise.all(
      req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new ORDERITEM({
          product: orderItem.product,
          quantity: orderItem.quantity,
        });
        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
      })
    );

    const orderItemsIdsResolved = await orderItemsIds;
    // calculate total order item price
    const totalPrices = await Promise.all(
      orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await ORDERITEM.findById(orderItemId).populate(
          "product",
          "price"
        );
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
      })
    );
    // 
    const combinedTotalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new ORDER({
      orderItems: orderItemsIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: combinedTotalPrice,
      user: req.body.user,
    });
    order = await order.save();
    if (!order) {
      return res.status(404).send("Category Failed to  create");
    }
    res.send(order);
  } catch (error) {
    
    res.status(500).send(error);
  }
});

router.put("/:id", async (req, res, next) => {
  const id = req.params.id;
  const order = await ORDER.findByIdAndUpdate(
    id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  if (!order) {
    res.sendStatus(500);
    return;
  }
  res.status(202).send(order);
});

router.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  ORDER.findByIdAndDelete(id)
    .then(async (order) => {
      // 
      if (order) {
        order.orderItems.map(async (orderItem) => {
          await ORDERITEM.findByIdAndRemove(orderItem);
        });
        return res.status(200).json({
          success: true,
          message: "The order is successfully deleted",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No Such order",
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
