const ProductRouter = require('express').Router();

const ProductController = require('../Controller/AdminProductController');

const Protect = require('../Controller/AuthController');

ProductRouter.post('/v1/products/add-product',Protect.Protect, ProductController.addProduct);

ProductRouter.delete('/v1/products/delete-product',Protect.Protect, ProductController.deleteProduct);

ProductRouter.put('/v1/products/update-product',Protect.Protect, ProductController.updateProduct);

ProductRouter.get('/v1/products/getall-product',Protect.Protect, ProductController.getallProduct);

ProductRouter.get('/v1/products/getcategory-product',Protect.Protect, ProductController.getProductByCategory);

module.exports = ProductRouter;