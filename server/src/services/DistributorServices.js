const Distributor = require('../models/DistributorModel'); // adjust path as needed

exports.getNextDistributorId = async () => {
  try {
    // Get the latest distributor by sorting _id descending
    const lastDistributor = await Distributor.findOne()
      .sort({ _id: -1 })
      .select('distributorId')
      .exec();

    const lastNumber = lastDistributor && lastDistributor.distributorId
      ? parseInt(lastDistributor.distributorId.replace('DIS-', ''), 10)
      : 99;

    return `DIS-${lastNumber + 1}`;
  } catch (error) {
    console.error('Error generating next distributor ID:', error);
    throw error;
  }
};

