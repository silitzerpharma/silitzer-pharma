const mongoose = require('mongoose');

const productSliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  productList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  ]
});

const ProductSlider = mongoose.model('ProductSlider', productSliderSchema);

module.exports = ProductSlider;
