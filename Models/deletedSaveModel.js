const mongoose = require('mongoose');

const deleteDProductSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
   quantity:{
    type: Number,
    required: true,
   },
   cloudinary_Id:{
    type: String,
   },
   createdAt:{
    type: Date,
   },
   updatedAt:{
    type: Date,
   },
   deletedAt:{
    type: Date,
   }
});

const Deleted_Product = mongoose.model('Deleted_Product',deleteDProductSchema);

module.exports = Deleted_Product;