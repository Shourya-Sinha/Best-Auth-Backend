const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    shippingInfo:{
        address:{
            type: String,
            required: true,
        },
        city:{
            type: String,
            required: true,
        },
        state:{
            type: String,
            required: true,
        },
        country:{
            type: String,
            required: true,
        },
        pincode:{
            type: Number,
            required: true,
        },
        phoneNo:{
            type: Number,
            required: true,
        },
    },
    orderItems:[
        {
            name:{
                type: String,
                required: true,
            },
            price:{
                type: Number,
                required: true,
            },
            quantity:{
                type: Number,
                required: true,
            },
            image:{
                type: String,
                required: true,
            },
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
        },
    ],
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    paymentInfo:{
        id:{
            type: String,
            required: true,
        },
        status:{
            type: String,
            required: true,
        },
    },
    paidAt:{
        type: Date,
        required: true,
    },
    totalPrice:{
        type: Number,
        required: true,
        default: 0,
    },
    orderStatus:{
        type: String,
        required: true,
        default: "Processing",
    },
    deliveredAt:{
        type: Date,
    },
    shippedAt:{
        type: Date,
    },
    createdAt:{
        type: Date,
    },
});

const Order = mongoose.model('Order',orderSchema);

module.exports = Order;