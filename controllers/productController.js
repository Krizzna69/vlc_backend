const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = {};
    
    // Search functionality
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Create base query
    let productsQuery = Product.find(query);
    
    // Apply sorting
    if (sort) {
      const sortOrder = sort.startsWith('-') ? -1 : 1;
      const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
      productsQuery = productsQuery.sort({ [sortField]: sortOrder });
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }
    
    const products = await productsQuery;
    
    // Calculate total inventory value
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.price * product.quantity);
    }, 0);
    
    // Get low stock products
    const lowStockProducts = products.filter(product => product.quantity <= 5);
    
    res.status(200).json({
      success: true,
      count: products.length,
      totalValue,
      lowStockCount: lowStockProducts.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    // If there's a file uploaded, add the path to the request body
    if (req.file) {
      req.body.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const product = await Product.create(req.body);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid product data',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    // If there's a file uploaded, add the path to the request body
    if (req.file) {
      req.body.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid product data',
      error: error.message
    });
  }
};

// Delete product
// Update just the deleteProduct function in your controller file
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Use findByIdAndDelete instead of remove() which is deprecated
    await Product.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};