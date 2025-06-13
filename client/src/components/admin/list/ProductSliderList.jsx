import React, { useState, useEffect } from 'react';
import './ProductSliderList.scss';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

const ProductSliderList = () => {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [productInput, setProductInput] = useState('');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [sliderList, setSliderList] = useState([]);
  const [editSliderId, setEditSliderId] = useState(null);

  // New state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sliderToDelete, setSliderToDelete] = useState(null);

const fetchSliderList = async () => {
  try {
    const response = await fetch('http://localhost:3000/admin/get-product-slider', {
      method: "GET",
      credentials: "include", // ✅ Include cookies (auth/session)
    });

    const data = await response.json();

    if (Array.isArray(data)) {
      setSliderList(data);
    } else {
      console.error('Expected array but got:', data);
      setSliderList([]);
    }
  } catch (err) {
    console.error('Error fetching sliders:', err);
  }
};


  useEffect(() => {
    fetchSliderList();
  }, []);

const handleAddProduct = async () => {
  if (!productInput.trim()) return;

  try {
    const res = await fetch(
      `http://localhost:3000/admin/products/check?name=${encodeURIComponent(productInput)}`,
      {
        method: "GET",
        credentials: "include", // ✅ Include cookies for authentication
      }
    );

    const data = await res.json();

    if (data.available && data.product) {
      const alreadyExists = products.some(p => p._id === data.product._id);
      if (!alreadyExists) {
        setProducts([...products, data.product]);
        setProductInput('');
        setError('');
      } else {
        setError('Product already added');
      }
    } else {
      setError('Product not available');
    }
  } catch (err) {
    setError('Server error while checking product');
  }
};

const handleSaveSlider = async () => {
  if (!title.trim() || products.length === 0) {
    setError('Please enter a title and add at least one product');
    return;
  }

  const payload = {
    title,
    products,
  };

  const url = editSliderId
    ? `http://localhost:3000/admin/update-product-slider/${editSliderId}`
    : `http://localhost:3000/admin/save-product-slider`;

  const method = editSliderId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ Include cookies for session/auth
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert(`Slider ${editSliderId ? 'updated' : 'created'} successfully!`);
      setShowForm(false);
      setTitle('');
      setProducts([]);
      setProductInput('');
      setError('');
      setEditSliderId(null);
      fetchSliderList();
    } else {
      setError(`Failed to ${editSliderId ? 'update' : 'create'} slider`);
    }
  } catch (err) {
    setError(`Server error while ${editSliderId ? 'updating' : 'creating'} slider`);
  }
};


  const handleEditSlider = (slider) => {
    setTitle(slider.title);
    setProducts(slider.productList || []);
    setEditSliderId(slider._id);
    setShowForm(true);
    setError('');
  };

  // NEW FUNCTIONALITY: open delete confirmation dialog
  const handleRemoveClick = (slider) => {
    setSliderToDelete(slider);
    setDeleteDialogOpen(true);
  };

  // NEW FUNCTIONALITY: confirm delete, call server, refresh list
 const handleConfirmDelete = async () => {
  if (!sliderToDelete) return;

  try {
    const res = await fetch(
      `http://localhost:3000/admin/delete-product-slider/${sliderToDelete._id}`,
      {
        method: 'DELETE',
        credentials: 'include', // ✅ Include cookies for session/auth
      }
    );

    if (res.ok) {
      alert('Slider deleted successfully!');
      setDeleteDialogOpen(false);
      setSliderToDelete(null);
      fetchSliderList();
    } else {
      alert('Failed to delete slider.');
    }
  } catch (err) {
    alert('Server error while deleting slider.');
  }
};


  // NEW FUNCTIONALITY: cancel delete dialog
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSliderToDelete(null);
  };

  return (
    <div className="ProductSliderList">
      <div className="add-btn">
        <button
          onClick={() => {
            setShowForm(true);
            setEditSliderId(null);
            setTitle('');
            setProducts([]);
            setProductInput('');
            setError('');
          }}
        >
          Create New Slider
        </button>
      </div>

      {showForm && (
        <div className="slider-form">
          <div>
            <label>Slider Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label>Add Product:</label>
            <input
              type="text"
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
            />
            <button onClick={handleAddProduct}>Add Product</button>
          </div>

          {error && <p className="error">{error}</p>}

          <ul className="product-lists">
            {products.map((prod) => (
              <li
                key={prod._id}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                {prod.productName}
                <button
                  onClick={() => {
                    setProducts(products.filter((p) => p._id !== prod._id));
                  }}
                  style={{ color: 'red', cursor: 'pointer' }}
                  type="button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <button onClick={handleSaveSlider}>
            {editSliderId ? 'Update Slider' : 'Create Slider'}
          </button>

          <button
            onClick={() => {
              setShowForm(false);
              setTitle('');
              setProducts([]);
              setProductInput('');
              setError('');
              setEditSliderId(null);
            }}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="slider-List">
        <div className="title">Product Slider List</div>

        {!Array.isArray(sliderList) || sliderList.length === 0 ? (
          <p>No sliders found.</p>
        ) : (
          sliderList.map((slider) => (
            <div className="slider" key={slider._id}>
              <div className="slider-title">
                <strong>Title:</strong> {slider.title}
              </div>
              <ul className="product-lists">
                {slider.productList?.map((prod) => (
                  <li key={prod._id}>{prod.productName}</li>
                ))}
              </ul>
              <div className="slider-actions">
                <button onClick={() => handleEditSlider(slider)}>Edit</button>
                <button onClick={() => handleRemoveClick(slider)}>Remove</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-delete-dialog-title"
        aria-describedby="confirm-delete-dialog-description"
      >
        <DialogTitle id="confirm-delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-delete-dialog-description">
            Are you sure you want to delete the slider "{sliderToDelete?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductSliderList;
