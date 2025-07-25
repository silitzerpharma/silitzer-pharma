const bcrypt = require('bcrypt');
const Distributor = require('../../models/DistributorModel');
const AuthUser = require('../../models/AuthUserModel');
const Order = require('../../models/OrderModel');
const AuthServices = require('../../services/AuthServices')
const DistributorServices = require('../../services/DistributorServices')



exports.saveDistributor = async (req, res) => {
  const distributorDetails = req.body.distributorDetails;

  if (!distributorDetails) {
    return res.status(400).json({ msg: "Request body is missing" });
  }

  const {
    name,
    gstNumber,
    address,
    email,
    phone,
    username,
    password,
    dateRegistered,
    drugLicenseNumber
  } = distributorDetails;

  if (!username || !password) {
    return res.status(400).json({ msg: "Username and password are required" });
  }

  const usernameExists = await AuthServices.checkUsernamePresent(username);
  if (usernameExists) {
    return res.status(400).json({ msg: "Username already present" });
  }

  try {
    // 1. Generate distributor ID
    const distributorId = await DistributorServices.getNextDistributorId();
    // 2. Save distributor details
    const newDistributor = new Distributor({
      distributorId,
      name,
      gst_number: gstNumber,
      email,
      phone_number: phone,
      address,
      date_registered: dateRegistered,
      drug_license_number: drugLicenseNumber, // Ensure this is defined in schema
    });

    const savedDistributor = await newDistributor.save();

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save auth user
    const newAuthUser = new AuthUser({
      username,
      password: hashedPassword,
      role: 'distributor',
      refId: savedDistributor._id,
      roleModel: 'Distributor',
    });

    await newAuthUser.save();

    return res.status(200).json({ msg: "Distributor created successfully" });
  } catch (err) {
    console.error("Error saving distributor:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
};

exports.removeDistributor = async (req, res) => {
  const { id: authUserId } = req.body; // AuthUser _id
  if (!authUserId) {
    return res.status(400).json({ message: 'Missing id in request body' });
  }

  try {
    // 1) Find the AuthUser document
    const authUser = await AuthUser.findById(authUserId);
    if (!authUser || authUser.roleModel !== 'Distributor') {
      return res.status(404).json({ message: 'Distributor AuthUser not found' });
    }

    // 2) Get the Distributor's _id from refId
    const distributorId = authUser.refId;

    // 3) Soft delete the Distributor document
    const distributorUpdate = await Distributor.findByIdAndUpdate(
      distributorId,
      { isDeleted: true },
      { new: true }
    );

    if (!distributorUpdate) {
      return res.status(404).json({ message: 'Distributor record not found' });
    }

    // 4) Update AuthUser username to free original username and soft delete the user
    const newUsername = `${authUser.username}_deleted_${Date.now()}`; // append timestamp for uniqueness

    const authUserUpdate = await AuthUser.findByIdAndUpdate(
      authUserId,
      { 
        isDeleted: true,
        username: newUsername
      },
      { new: true }
    );

    return res.json({
      message: 'Distributor and AuthUser marked as deleted and username changed',
      distributor: distributorUpdate,
      authUser: authUserUpdate,
    });
  } catch (err) {
    console.error('removeDistributor error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.editDistributor = async (req, res) => {

  const {
    distributor_Id,
    auth_id,
    username,
    password,
    name,
    gst_number,
    email,
    phone_number,
    address,
    drug_license_number,
  } = req.body;

  if (!distributor_Id || !auth_id) {
    return res.status(400).json({ message: 'Missing distributorId or auth_id in request body' });
  }
 
  const updateDistributorData = {
    name,
    gst_number,
    email,
    phone_number,
    address,
    drug_license_number,
  };

  try {
    // Update distributor details
    const updatedDistributor = await Distributor.findByIdAndUpdate(
      distributor_Id,
      updateDistributorData,
      { new: true, runValidators: true }
    );

    if (!updatedDistributor) {
      return res.status(404).json({ message: 'Distributor not found' });
    }

    // Prepare auth update data
    const authUpdateData = { username };
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      authUpdateData.password = hashedPassword;
    }

    // Update username and optionally password in Auth model
    const updatedAuth = await AuthUser.findByIdAndUpdate(
      auth_id,
      authUpdateData,
      { new: true, runValidators: true }
    );

    if (!updatedAuth) {
      return res.status(409).json({ message: 'Auth record not found' });
    }

    res.status(200).json({ distributor: updatedDistributor, auth: updatedAuth });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
};

exports.getAllDistributors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || 'username';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    const search = req.query.search ? req.query.search.trim().toLowerCase() : '';

    const skip = (page - 1) * limit;

    // Fetch all AuthUsers with role 'distributor' and populate Distributor info
    let authUsers = await AuthUser.find({ role: 'distributor' })
      .populate({
        path: 'refId',
        model: 'Distributor',
      });

    // Filter out deleted distributors
    let filtered = authUsers.filter(d => d.refId && d.refId.isDeleted !== true);

    // Add search filtering
    if (search) {
      filtered = filtered.filter(user => {
        const username = (user.username || '').toLowerCase();
        const dist = user.refId;

        if (username.includes(search)) {
          return true;
        }
        if (dist) {
          const name = (dist.name || '').toLowerCase();
          const distributorId = (dist.distributorId || '').toLowerCase();

          if (name.includes(search) || distributorId.includes(search)) {
            return true;
          }
        }
        return false;
      });
    }

    // Sorting (unchanged)
    const sorted = filtered.sort((a, b) => {
      const aVal = sortField === 'distributorId' ? a.refId?.distributorId :
                   sortField === 'addDate' ? new Date(a.refId?.date_registered) :
                   a[sortField];

      const bVal = sortField === 'distributorId' ? b.refId?.distributorId :
                   sortField === 'addDate' ? new Date(b.refId?.date_registered) :
                   b[sortField];

      if (aVal < bVal) return sortOrder === 1 ? -1 : 1;
      if (aVal > bVal) return sortOrder === 1 ? 1 : -1;
      return 0;
    });

    const paginated = sorted.slice(skip, skip + limit);

    const enrichedDistributors = await Promise.all(
      paginated.map(async (distributor) => {
        const distributorId = distributor._id;
        const orders = await Order.find({ distributor: distributorId });

        const totalOrders = orders.length;
        const pendingOrders = await Order.countDocuments({
          distributor: distributorId,
          status: 'Pending',
        });

        const allPaymentsCompleted = orders.every(order => order.paymentStatus === 'Completed');
        const paymentStatus = allPaymentsCompleted ? 'Completed' : 'Pending';

        return {
          ...distributor.toObject(),
          totalOrders,
          pendingOrders,
          paymentStatus,
        };
      })
    );

    res.status(200).json({
      data: enrichedDistributors,
      totalCount: sorted.length,
    });
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDistributorData = async (req, res) => {
  try {
    const distributorId = req.query.id;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const view = req.query.view || "All";
    const sortField = req.query.sortField || "createdAt";  // default sort field
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;  // asc or desc

    if (!distributorId) {
      return res.status(400).json({ error: "Distributor ID is required" });
    }

    const query = {
      distributor: distributorId
    };

    // Filter by status/view
    if (view !== "All") {
      query.status = view;
    }

    const totalCount = await Order.countDocuments(query);

    // Build sorting object dynamically
    const sort = {};
    // Map frontend sortField to backend field if needed
    switch (sortField) {
      case 'order_id':
        sort['orderNumber'] = sortOrder;
        break;
      case 'order_date':
        sort['orderDate'] = sortOrder;
        break;
      case 'order_status':
        sort['status'] = sortOrder;
        break;
      case 'payment_status':
        sort['paymentStatus'] = sortOrder;
        break;
      default:
        // fallback sorting by creation date
        sort['createdAt'] = sortOrder;
    }

    const orders = await Order.find(query)
      .sort(sort)
      .skip(page * limit)
      .limit(limit)
      .populate('distributor', 'username')
      .populate('productList.productId', 'productName');

    const transformedOrders = orders.map(order => ({
      id: order._id,
      order_id: order.orderNumber,
      order_date: order.orderDate,
      order_status: order.status,
      payment_status: order.paymentStatus,
      products_list: Array.isArray(order.productList)
        ? order.productList.map(product => ({
            productId: product.productId?._id || null,
            product_name: product.productId?.productName || 'Unknown',
            quantity: product.quantity
          }))
        : []
    }));

    res.status(200).json({
      orders: transformedOrders,
      totalCount
    });
  } catch (err) {
    console.error('Error fetching distributor orders:', err);
    res.status(500).json({ error: 'Failed to fetch distributor orders' });
  }
};

exports.blockDistributor = async (req, res) => {
  try {
    const { id, block } = req.body;

    if (!id || typeof block !== "boolean") {
      return res.status(400).json({ message: "Missing or invalid parameters" });
    }

    const updatedUser = await AuthUser.findByIdAndUpdate(
      id,
      { isBlock: block },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Distributor not found" });
    }

    res.status(200).json({
      message: `Distributor has been ${block ? "blocked" : "unblocked"} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in blockDistributor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.getDistributorsData = async (req, res) => {
  try {
    const totalCount = await Distributor.countDocuments({ isDeleted: false });

    res.status(200).json({
      success: true,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching distributors data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve distributors data.",
    });
  }
};
