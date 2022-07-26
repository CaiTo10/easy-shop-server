const mongoose = require("mongoose")
const Schema = mongoose.Schema

const OrderItemSchma = new Schema({
    quantity:{
        type:Number,
        require:true
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    }
})

const OrderItem = mongoose.model("OrderItem",OrderItemSchma)

module.exports = OrderItem