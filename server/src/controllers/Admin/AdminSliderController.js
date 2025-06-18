const ProductOffer = require('../../models/ProductOfferModel')
const ProductSlider = require('../../models/ProductSliderModel')
const imagekit = require('../../config/imagekit');

exports.getOfferList = async (req, res) => {
  try {
    const offers = await ProductOffer.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'products',
        select: 'productName productCode' // Only select needed fields
      });

    res.status(200).json(offers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({ error: "Failed to fetch offer list" });
  }
};




// exports.removeOfferSlider = async (req, res) => {
//     const offerId = req.params.id;
//   try {
//     // Your DB logic to delete
//     await ProductOffer.findByIdAndDelete(offerId);
//     res.status(200).json({ message: 'Offer removed successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to remove offer' });
//   }
// }

exports.removeOfferSlider = async (req, res) => {
  const offerId = req.params.id;

  try {
    const offer = await ProductOffer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }

    // If imageKitFileId exists, delete image from ImageKit
    if (offer.imageKitFileId) {
      try {
        await imagekit.deleteFile(offer.imageKitFileId);
        console.log("ImageKit file deleted:", offer.imageKitFileId);
      } catch (imagekitErr) {
        console.warn("ImageKit deletion failed:", imagekitErr.message);
        // Not fatal – proceed with deleting DB entry
      }
    }

    // Remove offer from DB
    await ProductOffer.findByIdAndDelete(offerId);

    res.status(200).json({ message: "Offer removed successfully" });
  } catch (err) {
    console.error("Failed to remove offer:", err);
    res.status(500).json({ error: "Failed to remove offer" });
  }
};

// exports.editOfferSlider = async (req, res) => {
//   const offerId = req.params.id;
//   const { description, validTill, img, products, applyToAll } = req.body;

//   // Prepare update object
//   const updatedData = {
//     description,
//     validTill,
//     image: img,
//     applyToAll: !!applyToAll, // convert to boolean
//     products: [], // default to empty
//   };

//   // If applyToAll is false and products array exists, save the products
//   if (!applyToAll && Array.isArray(products) && products.length > 0) {
//     updatedData.products = products;
//     updatedData.applyToAll = false;
//   }

//   try {
//     const updatedOffer = await ProductOffer.findByIdAndUpdate(
//       offerId,
//       updatedData,
//       { new: true }
//     );

//     if (!updatedOffer) {
//       return res.status(404).json({ error: 'Offer not found' });
//     }

//     res.status(200).json(updatedOffer);
//   } catch (err) {
//     console.error('Error updating offer:', err);
//     res.status(500).json({ error: 'Failed to update offer' });
//   }
// };

exports.editOfferSlider = async (req, res) => {
  const offerId = req.params.id;
  const { description, validTill, imageBase64, imageName, applyToAll, products } = req.body;

  try {
    // Find the existing offer
    const existingOffer = await ProductOffer.findById(offerId);
    if (!existingOffer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    let imageUrl = existingOffer.image;
    let imageKitFileId = existingOffer.imageKitFileId;

    // If a new image is provided, upload it and remove old one
    if (imageBase64 && imageName) {
      // Delete old image from ImageKit if present
      if (existingOffer.imageKitFileId) {
        try {
          await imagekit.deleteFile(existingOffer.imageKitFileId);
        } catch (err) {
          console.warn('Failed to delete old image from ImageKit:', err.message);
        }
      }

      // Upload new image
      try {
        const uploadResponse = await imagekit.upload({
          file: imageBase64,
          fileName: imageName,
          folder: 'OfferSliders'
        });
        imageUrl = uploadResponse.url;
        imageKitFileId = uploadResponse.fileId;
      } catch (uploadErr) {
        return res.status(500).json({ error: 'Image upload failed' });
      }
    }

    // Prepare update
    const updatedData = {
      description,
      validTill,
      image: imageUrl,
      imageKitFileId,
      applyToAll: !!applyToAll,
      products: Array.isArray(products) && !applyToAll ? products : [],
    };

    const updatedOffer = await ProductOffer.findByIdAndUpdate(offerId, updatedData, {
      new: true
    });

    res.status(200).json(updatedOffer);
  } catch (err) {
    console.error('Error updating offer:', err);
    res.status(500).json({ error: 'Failed to update offer' });
  }
};

exports.saveOfferSlider = async (req, res) => {
  console.log("req comes");
  try {
    const {
      description,
      validTill,
      imageBase64,
      imageName,
      applyToAll,
      products,
    } = req.body;

    let imageUrl = "";
    let imageKitFileId = "";

    // Upload to ImageKit if image provided
    if (imageBase64 && imageName) {
      try {
        const uploadResponse = await imagekit.upload({
          file: imageBase64,
          fileName: imageName,
          folder: "OfferSliders",
        });
        imageUrl = uploadResponse.url;
        imageKitFileId = uploadResponse.fileId; // Store fileId for later deletion
      } catch (uploadError) {
        console.error("ImageKit upload failed:", uploadError);
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    const offerData = {
      description,
      validTill,
      image: imageUrl,
      imageKitFileId, // <-- Save it here
      applyToAll: true,
      products: [],
    };

    if (!applyToAll && Array.isArray(products) && products.length > 0) {
      offerData.applyToAll = false;
      offerData.products = products;
    }

    const newOffer = new ProductOffer(offerData);
    const savedOffer = await newOffer.save();

    res.status(201).json(savedOffer);
  } catch (error) {
    console.error("Error saving offer:", error);
    res.status(500).json({ error: "Failed to save offer" });
  }
};










exports.saveProductSlider = async (req, res) => {
  try {
    const { title, products } = req.body;

    // Validation
    if (!title || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Title and product list are required' });
    }

    // Extract only _id from each product object
    const productIds = products.map(p => p._id);

    // Create a new ProductSlider document
    const newSlider = new ProductSlider({
      title,
      productList: productIds
    });

    await newSlider.save();

    return res.status(201).json({ message: 'Product slider created successfully', slider: newSlider });
  } catch (error) {
    console.error('Error saving product slider:', error);
    return res.status(500).json({ message: 'Server error while saving product slider' });
  }
};

exports.getProductSlider = async (req, res) => {

  try {
    // Fetch all sliders and populate the productList with product details
    const sliders = await ProductSlider.find().populate('productList', '_id productName');

    res.status(200).json( sliders );
  } catch (error) {
    console.error('Error fetching product sliders:', error);
    res.status(500).json({ message: 'Server error fetching product sliders' });
  }
};

exports.updateProductSlider = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, products } = req.body;

    const slider = await ProductSlider.findByIdAndUpdate(
      id,
      { title, productList: products.map(p => p._id || p) },
      { new: true }
    );

    if (!slider) return res.status(404).json({ message: 'Slider not found' });

    res.json({ message: 'Slider updated', slider });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteProductSlider = async (req, res) => {
  const { id } = req.params;
  try {
    await ProductSlider.findByIdAndDelete(id);
    res.status(200).json({ message: 'Slider deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete slider', error: err.message });
  }
};
