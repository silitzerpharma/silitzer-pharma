import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Typography,
  Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle
} from '@mui/material';

import SliderForm from '../form/SliderForm';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductSliderList = () => {
  const [showForm, setShowForm] = useState(false);
  const [editSliderId, setEditSliderId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [sliderList, setSliderList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sliderToDelete, setSliderToDelete] = useState(null);

  const fetchSliderList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/get-product-slider`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      setSliderList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching sliders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliderList();
  }, []);

  const handleSaveSlider = async (payload) => {
    const url = editSliderId
      ? `${BASE_URL}/admin/update-product-slider/${editSliderId}`
      : `${BASE_URL}/admin/save-product-slider`;

    const method = editSliderId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`Slider ${editSliderId ? 'updated' : 'created'} successfully!`);
        setShowForm(false);
        setEditSliderId(null);
        setEditData(null);
        fetchSliderList();
      } else {
        toast.error(`Failed to ${editSliderId ? 'update' : 'create'} slider`);
      }
    } catch (err) {
      toast.error('Server error. Please try again.');
    }
  };

  const handleEditSlider = (slider) => {
    setEditSliderId(slider._id);
    setEditData(slider);
    setShowForm(true);
  };

  const handleRemoveClick = (slider) => {
    setSliderToDelete(slider);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sliderToDelete) return;
    try {
      const res = await fetch(
        `${BASE_URL}/admin/delete-product-slider/${sliderToDelete._id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (res.ok) {
        toast.success('Slider deleted successfully!');
        fetchSliderList();
      } else {
        toast.error('Failed to delete slider.');
      }
    } catch (err) {
      toast.error('Server error while deleting slider.');
    } finally {
      setDeleteDialogOpen(false);
      setSliderToDelete(null);
    }
  };

  if (loading) return <Loader message="Loading Product Sliders..." />;

  return (
    <Box sx={{ p: 3 }}>
      {!showForm && (
        <Box mb={2}>
          <Button
            variant="contained"
            onClick={() => {
              setShowForm(true);
              setEditSliderId(null);
              setEditData(null);
            }}
          >
            Create New Slider
          </Button>
        </Box>
      )}

      {showForm ? (
        <SliderForm
          editData={editData}
          onCancel={() => {
            setShowForm(false);
            setEditSliderId(null);
            setEditData(null);
          }}
          onSave={handleSaveSlider}
        />
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Product Slider List
          </Typography>

          {sliderList.length === 0 ? (
            <Typography>No sliders found.</Typography>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr',
              }}
              gap={2}
            >
              {sliderList.map((slider) => (
                <Card key={slider._id}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {slider.title}
                    </Typography>
                    <Box mt={1}>
                      <Typography variant="body2" fontWeight="bold">
                        Products:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {slider.productList?.map((prod) => (
                          <li key={prod._id}>{prod.productName}</li>
                        ))}
                      </ul>
                    </Box>
                    <Box mt={2} display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleEditSlider(slider)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleRemoveClick(slider)}
                      >
                        Remove
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="confirm-delete-dialog-title"
      >
        <DialogTitle id="confirm-delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the slider "{sliderToDelete?.title}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductSliderList;
