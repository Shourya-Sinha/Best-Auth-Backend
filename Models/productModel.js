const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
name:{
    type: String,
    required: [true, 'Please eneter product name'],
    trim:true,
},
description:{
    type: String,
    required: [true, 'Please eneter product description'],
},
highlights:[
    {
        type: String,
    }
],
specifications:[
    {
        title:{
            type: String,
            required: true,
        },
        description:{
            type: String,
            required: true,
        }
    }
],
price:{
    type: Number,
    required: [true, 'Please eneter product price'],
},
cuttedPrice:{
    type: Number,
},
images:[
    {
        public_id:{
            type: String,
            required: true,
        },
        url:{
            type: String,
            required: true,
        }
    }
],
brand:{
    name:{
        type: String,
        required: true,
    },
    logo:{
        public_id:{
            type: String,
            required: true,
        },
        url:{
            type: String,
            required: true,
        }
    }
},
category:{
    type: String,
    required: [true, 'Please eneter product category'],
},
stock:{
    type: Number,
    required: [true, 'Please eneter product stock'],
    maxlength:[4,'stock cannot exceed limit'],
    default:1,
},
warrenty:{
    type:Number,
    default:1
},
ratings:{
    type: Number,
    default: 0,
},
numofReviews:{
    type: Number,
    default: 0,
},
reviews:[
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },
        name:{
            type: String,
            required: true,
        },
        rating:{
            type: Number,
            required: true,
        },
        comment:{
            type: String,
            required: true,
        }
    }
],
user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
},
createdAt:{
    type: Date,
}
});

const Product = mongoose.model('Product',productSchema);

module.exports = Product;