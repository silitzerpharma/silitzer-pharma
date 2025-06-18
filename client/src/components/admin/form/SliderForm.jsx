import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  IconButton,
  Stack,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


import Loader from "../../common/Loader";


const SliderForm = ({ onCancel, onSave, editData = null }) => {
  const [title, setTitle] = useState(editData?.title || '');
  const [productInput, setProductInput] = useState('');
  const [products, setProducts] = useState(editData?.productList || []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleAddProduct = async () => {
    if (!productInput.trim()) return;

    try {
      const res = await fetch(
        `${BASE_URL}/admin/products/check?name=${encodeURIComponent(productInput)}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      const data = await res.json();

      if (data.available && data.product) {
        const alreadyExists = products.some((p) => p._id === data.product._id);
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

  const handleSubmit = () => {
    if (!title.trim() || products.length === 0) {
      setError('Please enter a title and add at least one product');
      return;
    }

    const payload = {
      title,
      products,
    };

    onSave(payload);
  };

  
  return (
    <Box
      display="flex"
      justifyContent="center"
      mt={4}
    >
      <Paper elevation={3} sx={{ p: 3, width: '100%', maxWidth: 500 }}>
        <Stack spacing={2}>
          <TextField
            label="Slider Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />

          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Product Name"
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleAddProduct}>
              Add
            </Button>
          </Stack>

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <List>
            {products.map((prod) => (
              <ListItem
                key={prod._id}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    color="error"
                    onClick={() =>
                      setProducts(products.filter((p) => p._id !== prod._id))
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                {prod.productName}
              </ListItem>
            ))}
          </List>

          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleSubmit}>
              {editData ? 'Update Slider' : 'Create Slider'}
            </Button>
            <Button variant="outlined" color="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default SliderForm;
