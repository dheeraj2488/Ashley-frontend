import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { deleteProduct, fetchAdminProducts } from '../../redux/products/products.thunk';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography, IconButton } from '@mui/material';
import { updateProduct } from '../../redux/products/products.thunk';
import { toast } from 'react-toastify';
import { services } from '../../services';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

type Category = {
  id: string;
  name: string;
};

type EditForm = {
  id: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  categoryName: string;
  stockQuantity: string;
  shippingCharge: string;
  discounted: 'true' | 'false';
  discountPercent: string;
  featured: 'true' | 'false';
  images: string[];
  sizes: string;
  colors: string;
  isActive: 'true' | 'false';
};

const readFilesAsDataUrls = (files: FileList | null) =>
  Promise.all(
    Array.from(files ?? []).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        }),
    ),
  );

const ProductsPage = () => {
  const dispatch = useAppDispatch();
  const { productsList, loading } = useAppSelector((state) => state.product);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    id: '',
    name: '',
    description: '',
    price: '0',
    categoryId: '',
    categoryName: '',
    stockQuantity: '10',
    shippingCharge: '0',
    discounted: 'false',
    discountPercent: '0',
    featured: 'false',
    images: [],
    sizes: '',
    colors: '',
    isActive: 'true',
  });

  useEffect(() => {
    dispatch(fetchAdminProducts());
    services.categoryService.getCategories().then((response) => {
      if (response.success) {
        setCategories(response.data ?? []);
      }
    });
  }, [dispatch]);

  const startEdit = (row: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    categoryId?: string;
    categoryName?: string;
    stockQuantity?: number;
    shippingCharge?: number;
    discounted?: boolean;
    discountPercent?: number;
    featured?: boolean;
    images?: string[];
    sizes?: string[];
    colors?: string[];
    isActive?: boolean;
  }) => {
    setEditForm({
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      price: String(row.price ?? 0),
      categoryId: row.categoryId ?? '',
      categoryName: row.categoryName ?? '',
      stockQuantity: String(row.stockQuantity ?? 10),
      shippingCharge: String(row.shippingCharge ?? 0),
      discounted: row.discounted ? 'true' : 'false',
      discountPercent: String(row.discountPercent ?? 0),
      featured: row.featured ? 'true' : 'false',
      images: row.images ?? [],
      sizes: (row.sizes ?? []).join(', '),
      colors: (row.colors ?? []).join(', '),
      isActive: row.isActive === false ? 'false' : 'true',
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    try {
      await dispatch(
        updateProduct({
          id: editForm.id,
          data: {
            name: editForm.name,
            description: editForm.description,
            price: Number(editForm.price),
            categoryId: editForm.categoryId || undefined,
            categoryName: editForm.categoryName || undefined,
            stockQuantity: Number(editForm.stockQuantity),
            shippingCharge: Number(editForm.shippingCharge),
            discounted: editForm.discounted === 'true',
            discountPercent: Number(editForm.discountPercent),
            featured: editForm.featured === 'true',
            images: editForm.images,
            sizes: editForm.sizes
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            colors: editForm.colors
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            isActive: editForm.isActive === 'true',
          },
        }),
      ).unwrap();
      toast.success('Product updated successfully');
      setEditOpen(false);
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedImages = await readFilesAsDataUrls(event.target.files);
    if (!uploadedImages.length) {
      return;
    }

    setEditForm((current) => ({
      ...current,
      images: [...current.images, ...uploadedImages],
    }));
    event.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setEditForm((current) => ({
      ...current,
      images: current.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    const confirmed = window.confirm(`Delete ${name}? This will remove the product from the storefront.`);
    if (!confirmed) {
      return;
    }

    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success('Product deleted successfully');
      dispatch(fetchAdminProducts());
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex:1},
    { field: 'price', headerName: 'Price', width: 90 },
    { field: 'categoryName', headerName: 'Category', width: 160 },
    { field: 'stockQuantity', headerName: 'Stock', width: 100 },
    {
      field: 'featured',
      headerName: 'Featured',
      width: 120,
      renderCell: (params) => (params.value ? <Chip label="Yes" color="warning" /> : <Chip label="No" variant="outlined" />),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 150,
      renderCell: (params) =>
        params.value ? (
          <Chip label="Active" color="success" />
        ) : (
          <Chip label="Inactive" color="error" />
        ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 240,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => startEdit(params.row)}>
            Edit Product
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<DeleteOutlineRoundedIcon fontSize="small" />}
            onClick={() => handleDeleteProduct(params.row.id, params.row.name)}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Box>
        <Chip label="Inventory" color="primary" variant="outlined" />
      </Box>
      <DataGrid
        rows={productsList}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        autoHeight
        pageSizeOptions={[5, 10, 20]}
      />

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit product: {editForm.name}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={editForm.name}
              onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
            />
            <TextField
              label="Description"
              multiline
              minRows={3}
              value={editForm.description}
              onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
            />
            <TextField
              label="Price"
              type="number"
              value={editForm.price}
              onChange={(event) => setEditForm({ ...editForm, price: event.target.value })}
            />
            <TextField
              select
              label="Category"
              value={editForm.categoryId}
              onChange={(event) => {
                const category = categories.find((entry) => entry.id === event.target.value);
                setEditForm({ ...editForm, categoryId: event.target.value, categoryName: category?.name ?? '' });
              }}
            >
              <MenuItem value="">Select category</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Stock quantity"
              type="number"
              value={editForm.stockQuantity}
              onChange={(event) => setEditForm({ ...editForm, stockQuantity: event.target.value })}
            />
            <TextField
              label="Shipping charge"
              type="number"
              value={editForm.shippingCharge}
              onChange={(event) => setEditForm({ ...editForm, shippingCharge: event.target.value })}
            />
            <TextField
              select
              label="Discounted"
              value={editForm.discounted}
              onChange={(event) => setEditForm({ ...editForm, discounted: event.target.value as 'true' | 'false' })}
              SelectProps={{ native: true }}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </TextField>
            <TextField
              label="Discount percent"
              type="number"
              value={editForm.discountPercent}
              onChange={(event) => setEditForm({ ...editForm, discountPercent: event.target.value })}
              disabled={editForm.discounted !== 'true'}
            />
            <TextField
              select
              label="Featured"
              value={editForm.featured}
              onChange={(event) => setEditForm({ ...editForm, featured: event.target.value as 'true' | 'false' })}
              SelectProps={{ native: true }}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </TextField>
            <Button component="label" variant="outlined">
              Upload one or more product images
              <input hidden type="file" accept="image/*" multiple onChange={handleImageUpload} />
            </Button>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Selected images: {editForm.images.length}
            </Typography>
            {editForm.images.length > 0 ? (
              <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
                {editForm.images.map((image, index) => (
                  <Box
                    key={`${image.slice(0, 24)}-${index}`}
                    sx={{ position: 'relative', width: 96, height: 120, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
                  >
                    <Box component="img" src={image} alt={`Selected product image ${index + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(index)}
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        bgcolor: 'rgba(0,0,0,0.65)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                      }}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            ) : null}
            <TextField
              label="Sizes"
              helperText="Comma separated like S, M, L"
              value={editForm.sizes}
              onChange={(event) => setEditForm({ ...editForm, sizes: event.target.value })}
            />
            <TextField
              label="Colors"
              helperText="Comma separated like Black, Blue"
              value={editForm.colors}
              onChange={(event) => setEditForm({ ...editForm, colors: event.target.value })}
            />
            <TextField
              select
              label="Active"
              value={editForm.isActive}
              onChange={(event) => setEditForm({ ...editForm, isActive: event.target.value as 'true' | 'false' })}
              SelectProps={{ native: true }}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-strong)' } }}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ProductsPage;
