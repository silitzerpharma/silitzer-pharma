import { FaShoppingCart } from 'react-icons/fa';
import './style/productcard.css'

const ProductCard = ({ image, name, available }) => {
  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />

      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className={`availability ${available ? 'in-stock' : 'out-of-stock'}`}>
          {available ? 'In Stock' : 'Out of Stock'}
        </p>
        <button className="add-to-cart" disabled={!available}>
          <FaShoppingCart size={10} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
