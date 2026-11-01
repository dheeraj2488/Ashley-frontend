import { TextField, Button, Stack, Paper, Typography, MenuItem, Box, IconButton } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../redux/store';
import { createProduct } from '../../redux/products/products.thunk';
import { toast } from 'react-toastify';
import { services } from '../../services';

type Category = {
  id: string;
  name: string;
};

const CreateProduct = () => {
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    shippingCharge: '0',
    discounted: 'false',
    discountPercent: '0',
    images: [] as string[],
    sizes: '',
    colors: '',
    categoryId: '',
    categoryName: '',
    stockQuantity: '10',
    featured: 'false',
  });

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

  useEffect(() => {
    services.categoryService.getCategories().then((response) => {
      if (response.success) {
        setCategories(response.data ?? []);
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedImages = await readFilesAsDataUrls(event.target.files);
    if (!uploadedImages.length) {
      return;
    }

    setForm((current) => ({
      ...current,
      images: [...current.images, ...uploadedImages],
    }));
    event.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.images.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }
  
    try {
      await dispatch(
        createProduct({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          shippingCharge: Number(form.shippingCharge),
          discounted: form.discounted === 'true',
          discountPercent: Number(form.discountPercent),
          categoryId: form.categoryId,
          categoryName: form.categoryName,
          stockQuantity: Number(form.stockQuantity),
          featured: form.featured === 'true',
          images: form.images,
          sizes: form.sizes.split(','),
          colors: form.colors.split(','),
        })
      ).unwrap(); 
  

      setForm({
        name: '',
        description: '',
        price: '',
        shippingCharge: '0',
        discounted: 'false',
        discountPercent: '0',
        images: [],
        sizes: '',
        colors: '',
        categoryId: '',
        categoryName: '',
        stockQuantity: '10',
        featured: 'false',
      });
      
      toast.success('Product created successfully');
    } catch (error) {
      toast.error('Failed to create product');
      console.error(error);
    }
  };
  
  

  return (
    <Paper sx={{ p: 4, maxWidth: 600 }}>
      <Typography variant="h6" mb={2}>
        Create Product
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField name="name" label="Name" onChange={handleChange} />
          <TextField name="description" label="Description" multiline rows={3} onChange={handleChange} />
          <TextField name="price" label="Price" type="number" onChange={handleChange} />
          <TextField
            name="shippingCharge"
            label="Shipping charge"
            type="number"
            value={form.shippingCharge}
            onChange={handleChange}
            helperText="Saved only when you create the product"
          />
          <TextField select name="discounted" label="Discounted" value={form.discounted} onChange={handleChange}>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </TextField>
          <TextField
            name="discountPercent"
            label="Discount percent"
            type="number"
            value={form.discountPercent}
            onChange={handleChange}
            disabled={form.discounted !== 'true'}
            helperText="Enter how much off to apply"
          />
          <TextField name="stockQuantity" label="Stock quantity" type="number" value={form.stockQuantity} onChange={handleChange} />
          <TextField select name="categoryId" label="Category" value={form.categoryId} onChange={(event) => {
            const category = categories.find((entry) => entry.id === event.target.value);
            setForm({ ...form, categoryId: event.target.value, categoryName: category?.name ?? '' });
          }}>
            <MenuItem value="">Select category</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select name="featured" label="Featured" value={form.featured} onChange={handleChange}>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </TextField>
          <Button component="label" variant="outlined">
            Upload one or more product images
            <input hidden type="file" accept="image/*" multiple onChange={handleImageUpload} />
          </Button>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: -1 }}>
            Upload one or more images from your system. URL input is disabled.
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Selected images: {form.images.length}
          </Typography>
          {form.images.length > 0 ? (
            <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
              {form.images.map((image, index) => (
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
          <TextField name="sizes" label="Sizes (S,M,L)" onChange={handleChange} />
          <TextField name="colors" label="Colors (Black,Blue)" onChange={handleChange} />

          <Button variant="contained" type="submit">
            Create Product
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default CreateProduct;
