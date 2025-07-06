const mongoose = require("mongoose");
const Product = require('../../models/ProductModel');
const StockServices = require('../../services/StockServices')
const ProductServices = require('../../services/ProductServices')
const Orders = require ('../../models/OrderModel');

const imagekit = require('../../config/imagekit');




exports.getProductsData = async (req, res) => {
  try {
    const totalCount = await Product.countDocuments({ isDeleted: false });

    res.status(200).json({
      success: true,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching products data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve products data.",
    });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { productDetails, imageBase64, imageName } = req.body;

    if (!productDetails || !productDetails.productName) {
      return res.status(400).json({ msg: 'Product name is required' });
    }

    // === Upload image to ImageKit (optional) ===
    if (imageBase64 && imageName) {
      try {
        const uploadResponse = await imagekit.upload({
          file: imageBase64,
          fileName: imageName,
          folder: "products",
        });
        productDetails.imageUrl = uploadResponse.url;
        productDetails.imageFileId = uploadResponse.fileId;
      } catch (imgErr) {
        console.error("Image upload failed:", imgErr);
        return res.status(500).json({ msg: "Image upload failed" });
      }
    }

    // === Product code generation ===
    const productCode = await ProductServices.getNextProductCode();
    productDetails.productCode = productCode;

    // === Date validation ===
    if (productDetails.expiryDate) {
      const expiry = new Date(productDetails.expiryDate);
      productDetails.expiryDate = isNaN(expiry.getTime()) ? undefined : expiry;
    }

    if (productDetails.manufactureDate) {
      const mfg = new Date(productDetails.manufactureDate);
      productDetails.manufactureDate = isNaN(mfg.getTime()) ? undefined : mfg;
    }

 

    if (productDetails.unitsPerBox !== undefined && productDetails.unitsPerBox !== "") {
      const units = parseInt(productDetails.unitsPerBox, 10);
      productDetails.unitsPerBox = isNaN(units) || units < 0 ? undefined : units;
    }


    // === Stock logic ===
    const initialStock = parseInt(productDetails.stock, 10) || 0;
    productDetails.stock = initialStock; // ✅ Don't delete — needed for schema and pre-save logic
    productDetails.inStock = initialStock > 0; // ✅ Ensure inStock is true if stock > 0

    // === Save product ===
    const newProduct = new Product(productDetails);
    await newProduct.save();

    const warnings = [];


    res.status(200).json({ msg: 'Product added successfully', warnings });
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updatedData = req.body;

    if (!updatedData._id) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    const existingProduct = await Product.findById(updatedData._id);
    if (!existingProduct) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // If new image is provided, delete old image if it exists
    if (updatedData.imageBase64 && updatedData.imageName) {
      if (existingProduct.imageFileId) {
        try {
          await imagekit.deleteFile(existingProduct.imageFileId);
          console.log("Old image deleted from ImageKit");
        } catch (imgDelErr) {
          console.error("Old image deletion failed:", imgDelErr);
          return res.status(500).json({ msg: "Failed to delete old image" });
        }
      }

      try {
        const uploadResponse = await imagekit.upload({
          file: updatedData.imageBase64,
          fileName: updatedData.imageName,
          folder: "products",
        });
        updatedData.imageUrl = uploadResponse.url;
        updatedData.imageFileId = uploadResponse.fileId;
      } catch (imgErr) {
        console.error("Image upload failed:", imgErr);
        return res.status(500).json({ msg: "Image upload failed" });
      }
    }

    // Optional: If user explicitly wants to delete image without uploading new one
    if (updatedData.imageDeleteFlag && existingProduct.imageFileId) {
      try {
        await imagekit.deleteFile(existingProduct.imageFileId);
        updatedData.imageUrl = "";
        updatedData.imageFileId = "";
      } catch (imgDelErr) {
        console.error("Image deletion failed:", imgDelErr);
        return res.status(500).json({ msg: "Image deletion failed" });
      }
    }

    // Remove frontend-only fields
    delete updatedData.imageBase64;
    delete updatedData.imageName;
    delete updatedData.imageDeleteFlag;

    const updatedProduct = await Product.findByIdAndUpdate(
      updatedData._id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ msg: "Product not found after update" });
    }

    return res.status(200).json({ msg: "Product updated successfully" });
  } catch (error) {
    console.error("Edit product error:", error);
    return res.status(500).json({ error: "Server error while updating product" });
  }
};

exports.getProductDetails = async (req, res) => {
  const { productId } = req.body
  if (!productId) {
    return res.status(400).json({ msg: 'Product ID is required' });
  }
  if (!productId) {
    return res.status(400).json({ msg: 'Product ID is required' });
  }
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(400).json({ msg: 'Product not found' });

    return    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ msg: 'Invalid ID or server error' });
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

exports.checkProduct = async (req, res) => {
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
