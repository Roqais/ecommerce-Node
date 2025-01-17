const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");



// Create Product
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

    req.body.user = req.user.id
    
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        product 
    })
})

// GET PRODUCT DETAILS

exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success: true,
        product,
        
    })
})

// GET ALL PRODUCTS -- Admin

exports.getAllProducts = catchAsyncErrors(async (req, res) => {

    const resultPerPage = 5;
    const productCount = await Product.countDocuments();


    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter().pagination(resultPerPage)
    const products = await apiFeature.query;

    res.status(200).json({
        success: true,
        products,
        productCount
    })
})


// Update Products -- Admin

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    })
})

//  DELETE PRODUCT

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }

    await Product.deleteOne({ _id: product._id });

    res.status(200).json({
        success: true,
        message: "Prodcut deleted successfully"
    })

})


