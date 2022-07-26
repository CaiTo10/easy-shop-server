const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ProductSchema = new Schema({
    name:{type:String, required:true},
    description:{type:String, required:true},
    richDescription:{type:String, default:""},
    image:{type:String, default:""},
    images:[{type:String}],
    brand:{type:String, default:""},
    price:{type:Number, default:0},
    category:{type:Schema.Types.ObjectId,ref:"Category",required:true},
    countInStock:{type:Number, required:true, min:0},
    rating:{type:Number,default:0},
    numReviews:{type:Number,default:0},
    isFeatured:{type:Boolean,default:false},
    dateCreated:{type:Date,default:Date.now}
},{
    toJSON: { virtuals: true }
})

// creating virtual id helper
// Converting from ._id to .id
// 1 create a virtual field called 'id'
// 2 write a function for the virtual field to get its value
ProductSchema.virtual('id').get(function (){
    return this._id.toHexString()
})
// make ProductSchema to use the virtual for every send via Json to frontend
// ProductSchema.set("toJson",{
//     virtuals:true
// })
 

const Product = mongoose.model("Product",ProductSchema)

module.exports = Product