const Product = require("../Models/productModel");
const User = require("../Models/userModel");
const moment = require("moment");
const cloudinary = require("../Utils/Cloudinary");
const upload = require("../Utils/multer");
const DeletedProduct = require("../Models/deletedSaveModel");

exports.addProduct = async (req, res) => {
  try {
    const localTime = moment();
    const newTime = localTime.format("YYYY-MM-DD HH:mm:ss");

    const { name, description, price, category, quantity, image } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to perform this action",
      });
    }

    let imageUrl;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      quantity,
      image: imageUrl,
      createdAt: newTime,
    });

    return res.status(201).json({
      status: "success",
      message: "Product added successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.userId);

    const localTime = moment();
    const newTime = localTime.format("YYYY-MM-DD HH:mm:ss");

    if (user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to perform this action",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    const deletedProduct = await DeletedProduct.create({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      quantity: product.quantity,
      image: product.image,
      createdAt: product.createdAt,
      deletedAt: newTime,
    });

    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productId, name, description, price, quantity, category, image } =
      req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to perform this action",
      });
    }

    let updateImage = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updateImage = result.secure_url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description,
        price,
        quantity,
        category,
        image: updateImage,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: {
        updatedProduct,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getallProduct = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to perform this action",
      });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();

    const products = await Product.find().skip(skip).limit(limit);

    return res.status(200).json({
      status: "success",
      message: "Products fetched successfully",
      data: {
        products,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getProductByCategory = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to perform this action",
      });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = 1;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();

    let category = req.body.category;
    if (!category) {
      return res.status(400).json({
        status: "error",
        message: "Category is required",
      });
    }

    category = category.trim();

    //const category = req.query.category.trim();

    const regex = new RegExp(category.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i"); // Match categories that start with the provided string
    const product = await Product.find({ 
      category: regex // Use the regular expression for case-insensitive search
    }).skip(skip).limit(limit);

    if (!product || product.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Products not found with this category name",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Products fetched successfully",
      data: {
        product,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
