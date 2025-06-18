import { useEffect, useState } from "react";
import {
  Box, Button, TextField, Typography, RadioGroup, FormControlLabel,
  Radio, Stack, IconButton, Paper, Divider
} from "@mui/material";
import Loader from "../../common/Loader";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { toast } from 'react-toastify';

const AddOffer = ({ initialOffer, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    description: "",
    validTill: "",
    productType: "all",
    img: "", // holds URL of existing image
  });
  const [productInput, setProductInput] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialOffer) {
      setForm({
        description: initialOffer.description || "",
        validTill: initialOffer.validTill?.split("T")[0] || "",
        productType: initialOffer.applyToAll ? "all" : "custom",
        img: initialOffer.image || "",
      });
      setImagePreview(initialOffer.image || "");
      setProducts(initialOffer.products || []);
    }
  }, [initialOffer]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Live preview
    }
  };

  const handleAddProduct = async () => {
    if (!productInput.trim()) return;
    try {
      const res = await fetch(
        `${BASE_URL}/admin/products/check?name=${encodeURIComponent(productInput)}`,
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (data.available && data.product) {
        if (!products.some((p) => p._id === data.product._id)) {
          setProducts([...products, data.product]);
          setProductInput("");
          setError("");
        } else {
          setError("Product already added");
        }
      } else {
        setError("Product not found");
      }
    } catch {
      setError("Server error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let base64Image = "";
    if (imageFile) {
      base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = (error) => reject(error);
      });
    }

    const payload = {
      description: form.description,
      validTill: form.validTill,
      products: form.productType === "all" ? [] : products.map((p) => p._id),
      applyToAll: form.productType === "all",
      imageBase64: base64Image,
      imageName: imageFile?.name || "",
    };

    const url = initialOffer
      ? `${BASE_URL}/admin/edit-offer-slider/${initialOffer._id}`
      : `${BASE_URL}/admin/save-offer-slider`;

    const method = initialOffer ? "PUT" : "POST";

    try {
      setLoading(true);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) toast.error("Failed to save offer");
     
       toast.success('Offer saved successfully'); 
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Saving Offer..." />;

  return (
    <Paper elevation={4} sx={{ p: 3, mb: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Typography variant="h6">
            {initialOffer ? "Edit Offer" : "Add Offer"}
          </Typography>

          <Button variant="outlined" component="label">
            Upload Image
            <input type="file" accept="image/*" hidden onChange={handleImageChange} required />
          </Button>

          {imagePreview && (
            <Box
              component="img"
              src={imagePreview}
              alt="Preview"
              sx={{ width: 200, height: 120, borderRadius: 1, objectFit: "cover", mt: 1 }}
            />
          )}

          <TextField
            name="description"
            label="Offer Description"
            multiline
            required
            value={form.description}
            onChange={handleInputChange}
          />
          <TextField
            type="date"
            name="validTill"
            label="Valid Till"
            InputLabelProps={{ shrink: true }}
            value={form.validTill}
            onChange={handleInputChange}
          />

          <RadioGroup row name="productType" value={form.productType} onChange={handleInputChange}>
            <FormControlLabel value="all" control={<Radio />} label="All Products" />
            <FormControlLabel value="custom" control={<Radio />} label="Custom Products" />
          </RadioGroup>

          {form.productType === "custom" && (
            <>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Search Product"
                  fullWidth
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                />
                <Button variant="contained" onClick={handleAddProduct}>Add</Button>
              </Stack>
              {error && <Typography color="error">{error}</Typography>}

              <Stack spacing={1}>
                {products.map((p) => (
                  <Box
                    key={p._id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      p: 1,
                      border: "1px solid #ccc",
                      borderRadius: 1
                    }}
                  >
                    <Typography>{p.productName}</Typography>
                    <IconButton size="small" onClick={() =>
                      setProducts(products.filter((x) => x._id !== p._id))
                    }>❌</IconButton>
                  </Box>
                ))}
              </Stack>
            </>
          )}

          <Divider />

          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained">
              {initialOffer ? "Update Offer" : "Save Offer"}
            </Button>
            <Button variant="outlined" onClick={onClose}>Cancel</Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
};

export default AddOffer;
