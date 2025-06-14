const mongoose = require("mongoose");
const Product = require('../../models/ProductModel');
const StockServices = require('../../services/StockServices')
const ProductServices = require('../../services/ProductServices')
const Orders = require ('../../models/OrderModel');

const imagekit = require('../../config/imagekit');




exports.addProduct = async (req, res) => {
  try {
    const { productDetails, imageBase64, imageName } = req.body;

    if (!productDetails || !productDetails.productName) {
      return res.status(400).json({ msg: 'Product name is required' });
    }

    // Upload image to ImageKit (optional)
    if (imageBase64 && imageName) {
      try {
        const uploadResponse = await imagekit.upload({
          file: imageBase64,
          fileName: imageName,
          folder: "products",
        });
        productDetails.imageUrl = uploadResponse.url;
      } catch (imgErr) {
        console.error("Image upload failed:", imgErr);
        return res.status(500).json({ msg: "Image upload failed" });
      }
    }

    // === Original logic from here ===
    const productCode = await ProductServices.getNextProductCode();
    productDetails.productCode = productCode;

    if (productDetails.expiryDate) {
      const expiry = new Date(productDetails.expiryDate);
      if (isNaN(expiry.getTime())) {
        delete productDetails.expiryDate;
      } else {
        productDetails.expiryDate = expiry;
      }
    } else {
      delete productDetails.expiryDate;
    }

    if (productDetails.manufactureDate) {
      const mfg = new Date(productDetails.manufactureDate);
      if (isNaN(mfg.getTime())) {
        delete productDetails.manufactureDate;
      } else {
        productDetails.manufactureDate = mfg;
      }
    } else {
      delete productDetails.manufactureDate;
    }

    if (productDetails.quantityPerPackage !== undefined && productDetails.quantityPerPackage !== "") {
      const qty = parseInt(productDetails.quantityPerPackage, 10);
      if (isNaN(qty) || qty < 1) {
        delete productDetails.quantityPerPackage;
      } else {
        productDetails.quantityPerPackage = qty;
      }
    } else {
      delete productDetails.quantityPerPackage;
    }

    if (productDetails.unitsPerBox !== undefined && productDetails.unitsPerBox !== "") {
      const units = parseInt(productDetails.unitsPerBox, 10);
      if (isNaN(units) || units < 0) {
        delete productDetails.unitsPerBox;
      } else {
        productDetails.unitsPerBox = units;
      }
    } else {
      delete productDetails.unitsPerBox;
    }

    const initialStock = parseInt(productDetails.stock, 10) || 0;
    if (initialStock <= 0) {
      productDetails.inStock = false;
    }
    delete productDetails.stock;

    const newProduct = new Product(productDetails);
    await newProduct.save();

    if (initialStock > 0) {
      const success = await StockServices.updateStock(
        newProduct._id,
        initialStock,
        'Initial stock on product creation'
      );
      if (!success) {
        console.warn('Failed to update stock for product:', newProduct._id);
      }
    }

    res.status(201).json({ msg: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};










exports.getProduct = async (req, res) => {
  const { productId } = req.body
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Invalid ID or server error' });
  }
}

exports.removeProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    // Attempt to soft delete the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { isDeleted: true },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({
      message: "Product soft-deleted successfully",
      product: updatedProduct,
    });

  } catch (error) {
    console.error("Error soft-deleting product:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

exports.productCheck = async (req, res) => {
  try {
    const search = req.query.name; // now used for both name or code

    if (!search) {
      return res.status(400).json({
        available: false,
        message: 'Product name or code is required',
      });
    }

    const escapedSearch = escapeRegExp(search);

    const product = await Product.findOne(
      {
        $or: [
          { productName: new RegExp(`^${escapedSearch}$`, 'i') }, // case-insensitive exact match
          { productCode: new RegExp(`^${escapedSearch}$`, 'i') }
        ],
        isDeleted: false,
      },
      '_id productName productCode'
    );

    if (product) {
      return res.json({
        available: true,
        product: {
          _id: product._id,
          productName: product.productName,
          productCode: product.productCode,
        },
      });
    } else {
      return res.json({ available: false });
    }
  } catch (error) {
    console.error('Error checking product:', error);
    res.status(500).json({
      available: false,
      message: 'Server error',
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = req.query.sortField || 'productName';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const sort = { [sortField]: sortOrder };

    const search = req.query.search ? req.query.search.trim() : '';

    // Build search query if search term exists
    const searchQuery = search
      ? {
          $or: [
            { productName: { $regex: search, $options: 'i' } },
            { productCode: { $regex: search, $options: 'i' } },
            { batchNumber: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    // Final query includes isDeleted and search filter
    const query = { isDeleted: false, ...searchQuery };

    const [products, totalCount] = await Promise.all([
      Product.find(query)
        .select('_id productCode productName itemRate purchaseRate expiryDate batchNumber totalOrders')
        .skip(skip)
        .limit(limit)
        .sort(sort),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      data: products,
      total: totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching products with pagination, sorting, and search:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductsOrders = async (req, res) => {
  try {
    const { productId, page = 0, limit = 10 } = req.query;
    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const skip = parseInt(page) * parseInt(limit);

    // Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(productId);

    const orders = await Orders.find({ "productList.productId": objectId })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Orders.countDocuments({
      "productList.productId": objectId,
    });

    return res.status(200).json({ orders, totalCount });
  } catch (error) {
    console.error("Error in getProductsOrders:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
