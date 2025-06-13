const Product = require('../models/ProductModel');
const Order = require('../models/OrderModel');

const OrderServices = require('../services/OrderServices');
const productServices = require("../services/ProductServices");
const NotificationServices =require('../services/NotificationServices')
const SocketServices = require('../services/SocketServices')

const ProductOffer = require('../models/ProductOfferModel')
const ProductSlider = require('../models/ProductSliderModel')
const { getUserIDByToken ,getUserById } = require('../services/AuthServices')
const Distributor = require('../models/DistributorModel')
const bcrypt = require('bcrypt');




exports.getAllProducts = async (req, res) => {
  try {
    // Step 1: Fetch products (only needed fields)
    const products = await Product.find(
      { isDeleted: false },
      '_id productName inStock imageUrl'
    ).sort({ inStock: -1 }).lean(); // Use lean for performance

    // Step 2: Add offers to each product
    for (const product of products) {
      const productId = product._id.toString();
      const offers = await productServices.getProductOffers(productId);
      product.offers = offers || [];
      product._id = productId; // Ensure ID is a string for frontend consistency
    }

    // Step 3: Send response
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.placeOrder = async (req, res) => {
  try {
    const {
      distributor,
      productList,
      paymentStatus = 'Pending',
      status = 'Pending',
      instructions = '', // <-- renamed from orderInstructions for clarity
    } = req.body.payload;

    // Validate required fields
    if (
      !distributor ||
      !productList ||
      !Array.isArray(productList) ||
      productList.length === 0
    ) {
      return res.status(400).json({ message: 'Missing required fields or invalid product list' });
    }

    const orderNumber = await OrderServices.getNextOrderNumber();

    // Create new order with instructions
    const newOrder = new Order({
      orderNumber,
      distributor,
      productList,
      paymentStatus,
      status,
      orderInstructions: instructions?.trim() || ''
    });
      await newOrder.save();
 
   // Emit orderUpdated event safely
   OrderServices.updateOrderSocket(req);
    await NotificationServices.saveNotificationForAdmin(
      'New Order Placed',
      `Order #${orderNumber} has been successfully placed.`,
      'order',
      newOrder._id,
      'Order',
      true
    );
   SocketServices.updateAdminNotificationSocket(req);
 
    return res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ message: 'Server error while placing order' });
  }
};




exports.getAllProductsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const orderBy = req.query.orderBy || 'productName';
    const order = req.query.order === 'desc' ? -1 : 1;

    // Sort first by inStock descending, then by the requested field
    const sortObj = {
      inStock: -1,
      [orderBy]: order,
    };

    const total = await Product.countDocuments({ isDeleted: false });

    const products = await Product.find({ isDeleted: false })
      .sort(sortObj)
      .skip(page * limit)
      .limit(limit)
      .select('_id productName inStock imageUrl')
      .lean(); // Use lean for faster read and easier modification

    // Add offers to each product
    for (const product of products) {
      const productId = product._id.toString();
      const offers = await productServices.getProductOffers(productId);
      product.offers = offers || [];
      product._id = productId; // Ensure _id is string for consistency
    }

    res.json({
      total,
      page,
      limit,
      items: products,
    });
  } catch (error) {
    console.error('Error fetching product list:', error);
    res.status(500).json({ message: 'Failed to fetch product list' });
  }
};

exports.getOfferproducts = async (req, res) => {
  try {
    const { offerId } = req.query;
    if (!offerId) {
      return res.status(400).json({ error: "Offer ID is required" });
    }

    const offer = await ProductOffer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }

    let products;
    const productQuery = { isDeleted: false };

    if (offer.applyToAll) {
      // Get all products
      products = await Product.find(productQuery).select("productName imageUrl inStock unitsPerBox");
    } else {
      // Get only products linked in the offer
      productQuery._id = { $in: offer.products };
      products = await Product.find(productQuery).select("productName imageUrl inStock unitsPerBox");
    }

    // Attach offers to each product
    const productsWithOffers = await Promise.all(products.map(async (product) => {
      const offers = await productServices.getProductOffers(product._id);
      return {
        ...product.toObject(),
        offers,
      };
    }));

    res.json({ products: productsWithOffers ,offer });
  } catch (error) {
    console.error("Error in getOfferproducts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).select(
      '_id productName imageUrl productDescription other batchNumber expiryDate manufactureDate hsnCode advantages features uses howToUse specifications inStock unitsPerBox'
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const offers = await productServices.getProductOffers(product._id);
    res.json({ product ,offers});
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    // Fetch general (global) offers to include in top-level `offers` field
    const offers = await ProductOffer.find()
      .sort({ createdAt: -1 })
      .lean();

    // Fetch sliders with basic product info
    let sliders = await ProductSlider.find()
      .populate('productList', '_id productName inStock imageUrl')
      .lean();

    // Enrich each product with its applicable offers using the helper
    for (const slider of sliders) {
      for (const product of slider.productList) {
        const productId = product._id.toString();
        const productOffers = await productServices.getProductOffers(productId); // 🟢 Use helper
        product.offers = productOffers || [];
        product._id = productId; // Ensure _id is string
      }
    }

    const DashboardData = {
      offers,   // Top-level offers (all for reference/display)
      sliders,  // Each product inside includes its relevant offers
    };

    res.status(200).json(DashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllOrders = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(400).json({ msg: "User not logged in" });

  const ip = req.ip;

  try {
    const user_id = await getUserIDByToken(token, ip);
    const user = await getUserById(user_id);
    if (!user) {
      return res.status(401).json({ msg: "Invalid user or session" });
    }

    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search/filter params
    const search = req.query.search?.trim() || '';
    const statusFilter = req.query.status?.trim() || '';
    const sortParam = req.query.sort || 'date_desc'; // default sort

    // Build MongoDB query filter
    const filter = { distributor: user_id };

    if (search) {
      // Case-insensitive regex search for orderNumber substring
      filter.orderNumber = { $regex: search, $options: 'i' };
    }

    if (statusFilter && statusFilter.toLowerCase() !== 'all') {
      filter.status = { $regex: `^${statusFilter}$`, $options: 'i' }; // exact status match, case-insensitive
    }

    // Build sort object
    // sortParam can be: date_asc, date_desc, status_asc, status_desc
    let sort = {};
    switch (sortParam) {
      case 'date_asc':
        sort = { orderDate: 1 };
        break;
      case 'date_desc':
        sort = { orderDate: -1 };
        break;
      case 'status_asc':
        sort = { status: 1 };
        break;
      case 'status_desc':
        sort = { status: -1 };
        break;
      default:
        sort = { orderDate: -1 };
    }

    // Get total count for filtered query
    const totalOrders = await Order.countDocuments(filter);

    // Get filtered, sorted, paginated orders
    const orders = await Order.find(
      filter,
      'orderNumber status productList paymentStatus orderDate statusHistory'
    )
      .populate({
        path: 'productList.productId',
        select: 'productName',
      })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getProfile = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(400).json({ msg: "User not logged in" });

  const ip = req.ip;

  try {
    const user_id = await getUserIDByToken(token, ip);
    const user = await getUserById(user_id);

    if (!user) {
      return res.status(401).json({ msg: "Invalid user or session" });
    }

    // Ensure the user's roleModel is Distributor
    if (user.roleModel !== 'Distributor') {
      return res.status(403).json({ msg: "User is not a distributor" });
    }

    const distributor = await Distributor.findById(user.refId);
    if (!distributor) {
      return res.status(404).json({ error: 'Distributor not found' });
    }

    // Construct the combined response
    const profileData = {
      username: user.username,
      name: distributor.name,
      gst_number: distributor.gst_number,
      email: distributor.email,
      phone_number: distributor.phone_number,
      address: distributor.address,
      date_registered: distributor.date_registered,
      drug_license_number: distributor.drug_license_number,
    };

    res.status(200).json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.saveProfile = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(400).json({ msg: "User not logged in" });

  const ip = req.ip;

  try {
    const user_id = await getUserIDByToken(token, ip);
    const user = await getUserById(user_id);

    if (!user) {
      return res.status(401).json({ msg: "Invalid user or session" });
    }

    // Ensure the user's roleModel is Distributor
    if (user.roleModel !== 'Distributor') {
      return res.status(403).json({ msg: "User is not a distributor" });
    }

    const distributor = await Distributor.findById(user.refId);
    if (!distributor) {
      return res.status(404).json({ error: 'Distributor not found' });
    }

    // Only allow updating editable fields
    const { name, email, phone_number, address } = req.body;

    if (name !== undefined) distributor.name = name;
    if (email !== undefined) distributor.email = email;
    if (phone_number !== undefined) distributor.phone_number = phone_number;
    if (address !== undefined) distributor.address = address;

    await distributor.save();

    res.status(200).json({ message: 'Profile updated successfully', distributor });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.savePassword = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(400).json({ msg: "User not logged in" });

  const ip = req.ip;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
  }

  try {
    const user_id = await getUserIDByToken(token, ip);
    const user = await getUserById(user_id);

    if (!user || user.roleModel !== 'Distributor') {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};
exports.getProductsOffers = async (req, res) => {
  try {
    const { productIds } = req.query;

    if (!productIds) {
      return res.status(400).json({ error: "productIds query is required" });
    }

    const idsArray = productIds.split(',').map(id => id.trim());

    const result = [];

    console.log(idsArray);
    // for (const productId of idsArray) {
    //   const offers = await productServices.getProductOffers(productId);
    //   offers.forEach((offer) => {
    //     result.push({ productId, ...offer });
    //   });
    // }

    return res.json(result);
  } catch (error) {
    console.error("Error in getProductsOffers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ message: 'Query is required' });
    }

    const regex = new RegExp(query.trim(), 'i');

    const products = await Product.find({
      isDeleted: false,
      $or: [
        { productName: { $regex: regex } },
        { productDescription: { $regex: regex } },
        { other: { $regex: regex } },
        { advantages: { $elemMatch: { $regex: regex } } },
        { features: { $elemMatch: { $regex: regex } } },
        { uses: { $elemMatch: { $regex: regex } } },
        { howToUse: { $elemMatch: { $regex: regex } } },
        { 'specifications.value': { $regex: regex } },
      ],
    })
      .select('_id productName imageUrl inStock unitsPerBox') // ✅ include _id
      .limit(50);

    const results = await Promise.all(
      products.map(async (product) => {
        const offers = await productServices.getProductOffers(product._id);
        return {
          _id: product._id,
          productName: product.productName,
          imageUrl: product.imageUrl,
          inStock: product.inStock,
          unitsPerBox: product.unitsPerBox,
          offers,
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error('Error in searchProducts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};