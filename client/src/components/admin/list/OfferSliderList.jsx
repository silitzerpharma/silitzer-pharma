import { useState, useEffect } from "react";
import {
  Box, Button, Card, CardMedia, CardContent, Typography,
  Dialog, DialogTitle, DialogContent, IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddOffer from "../form/AddOffer";
import Loader from "../../common/Loader";
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OfferSliderList = () => {
  const [offerList, setOfferList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [selectedOfferProducts, setSelectedOfferProducts] = useState([]);
  const [isApplyToAll, setIsApplyToAll] = useState(false);
  const [loading, setLoading] = useState(false);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);

  useEffect(() => { fetchOfferList(); }, []);

  const fetchOfferList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/admin/get-offer-List`, {
        method: "GET", credentials: "include"
      });
      const data = await res.json();
      setOfferList(data);
    } catch (err) {
      console.error("Error fetching offers:", err);
    } finally {
      setLoading(false);
    }
  };

  const promptDelete = (id) => {
    setOfferToDelete(id);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/admin/remove-offer-slider/${offerToDelete}`, {
        method: "DELETE", credentials: "include"
      });
      if (!res.ok) {
        toast.error("Failed to delete offer");
      } else {
        toast.success("Offer deleted successfully");
        fetchOfferList();
      }
    } catch (err) {
      toast.error("Error deleting offer");
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
      setOfferToDelete(null);
    }
  };

  const handleViewProducts = (offer) => {
    setSelectedOfferProducts(offer.products || []);
    setIsApplyToAll(offer.applyToAll);
    setShowProductDialog(true);
  };

  if (loading) return <Loader message="Loading product Offers..." />;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 2 }}>
        {!showForm && (
          <Button variant="contained" onClick={() => {
            setEditingOffer(null);
            setShowForm(true);
          }}>
            Add Offer
          </Button>
        )}
      </Box>

      {showForm ? (
        <AddOffer
          initialOffer={editingOffer}
          onClose={() => {
            setShowForm(false);
            setEditingOffer(null);
          }}
          onSuccess={() => {
            fetchOfferList();
            setShowForm(false);
          }}
        />
      ) : (
        <>
          <Typography variant="h5" gutterBottom>Offer Slider List</Typography>
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr"
            }}
            gap={2}
          >
            {offerList.map((offer) => (
              <Card key={offer._id}>
                <CardMedia component="img" height="160" image={offer.image} alt="Offer" />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">{offer.description}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valid Till: {new Date(offer.validTill).toLocaleDateString("en-GB")}
                  </Typography>
                  <Box mt={1}>
                    {offer.applyToAll ? (
                      <Typography color="success.main" fontWeight="bold">Applies to All Products</Typography>
                    ) : (
                      <Button size="small" onClick={() => handleViewProducts(offer)}>View Products</Button>
                    )}
                  </Box>
                  <Box mt={2} display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setEditingOffer(offer);
                        setShowForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => promptDelete(offer._id)}
                    >
                      Remove
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onClose={() => setShowProductDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Offer Products
          <IconButton
            aria-label="close"
            onClick={() => setShowProductDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: "400px" }}>
          {isApplyToAll ? (
            <Typography>This offer is applied to all products.</Typography>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }}
              gap={1}
            >
              {selectedOfferProducts.map((prod) => (
                <Box key={prod._id} p={1} border={1} borderRadius={1}>
                  <Typography fontWeight="bold">{prod.productName}</Typography>
                  <Typography variant="body2">{prod.productCode}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this offer?</Typography>
          <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={confirmDelete}>Delete</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OfferSliderList;
