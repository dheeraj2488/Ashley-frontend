import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  Dialog,
  DialogContent,
  Paper,
  Stack,
  Toolbar,
  Typography,
  TextField,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { services } from '../services';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { addItem, closeCart, openCart, removeItem, updateQuantity } from '../redux/cart/cartSlice';
import { fetchProducts } from '../redux/products/products.thunk';
import type { Product } from '../redux/products/products.type';
import { heroMetrics, showcaseCallouts, showcaseProducts } from '../config/constants/showcase';

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const getReferencePrice = (value: number) => {
  const base = Math.round(value * 1.6);
  return base > value ? base : value + 299;
};

const getDiscountPercent = (price: number, referencePrice: number) => {
  if (referencePrice <= price) {
    return 0;
  }

  return Math.max(1, Math.round(((referencePrice - price) / referencePrice) * 100));
};

const StorefrontPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { productsList, loading } = useAppSelector((state) => state.product);
  const { items, isOpen } = useAppSelector((state) => state.cart);

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchProducts());
    services.categoryService.getCategories().then((response) => {
      if (response.success) {
        setCategories(response.data ?? []);
      }
    }).catch(() => {
      setCategories([]);
    });
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return productsList.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.categoryName === activeCategory;
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, productsList, search]);

  const showcaseProductsToRender = useMemo(() => {
    const featuredProducts = productsList
      .filter((product) => product.featured)
      .slice(0, 3)
      .map((product, index) => ({
        id: product.id,
        name: product.name,
        category: product.categoryName || 'Featured',
        price: Number(product.price),
        image: product.images?.[0] || showcaseProducts[index % showcaseProducts.length].image,
        description: product.description,
        sizes: product.sizes?.length ? product.sizes : showcaseProducts[index % showcaseProducts.length].sizes,
        colors: product.colors?.length ? product.colors : showcaseProducts[index % showcaseProducts.length].colors,
        label: 'Featured by admin',
      }));

    return featuredProducts.length ? featuredProducts : showcaseProducts;
  }, [productsList]);

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingFee = items.reduce((total, item) => total + (item.shippingCharge ?? 0) * item.quantity, 0);
  const grandTotal = subtotal + shippingFee;

  const getProductImages = (product: Product) =>
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80'];

  const handleImageStep = (productId: string, imageCount: number, direction: 'previous' | 'next') => {
    setImageIndexes((current) => {
      const currentIndex = current[productId] ?? 0;
      const nextIndex =
        direction === 'next'
          ? (currentIndex + 1) % imageCount
          : (currentIndex - 1 + imageCount) % imageCount;

      return {
        ...current,
        [productId]: nextIndex,
      };
    });
  };

  const openPreview = (product: Product, imageIndex: number) => {
    setPreviewProduct(product);
    setPreviewImageIndex(imageIndex);
  };

  const stepPreviewImage = (direction: 'previous' | 'next') => {
    if (!previewProduct) {
      return;
    }

    const images = getProductImages(previewProduct);
    const nextIndex =
      direction === 'next'
        ? (previewImageIndex + 1) % images.length
        : (previewImageIndex - 1 + images.length) % images.length;

    setPreviewImageIndex(nextIndex);
  };

  const closePreview = () => {
    setPreviewProduct(null);
    setPreviewImageIndex(0);
  };

  const handleAddToCart = (product: Product) => {
    if ((product.stockQuantity ?? 0) <= 0) {
      toast.error('This piece is sold out');
      return;
    }

    dispatch(
      addItem({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        shippingCharge: Number(product.shippingCharge ?? 0),
        quantity: 1,
        image: product.images?.[0],
        stockQuantity: product.stockQuantity,
      }),
    );

    toast.success(`${product.name} added to your cart`);
    dispatch(openCart());
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(18px)',
          backgroundColor: 'rgba(255, 250, 244, 0.7)',
          color: 'var(--text)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Toolbar sx={{ py: 1.5 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
            <Avatar sx={{ bgcolor: 'var(--primary)', width: 42, height: 42 }}>
              A
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 0.8 }}>
                Ashley Atelier
              </Typography>
              <Typography variant="caption" sx={{ color: 'var(--muted)' }}>
                Premium clothing. Guest checkout. Fast delivery.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              startIcon={<SearchRoundedIcon />}
              onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
              sx={{ color: 'var(--text)' }}
            >
              Shop
            </Button>
            <Button
              startIcon={
                <Badge badgeContent={cartCount} color="error">
                  <ShoppingCartOutlinedIcon />
                </Badge>
              }
              onClick={() => dispatch(openCart())}
              sx={{
                bgcolor: 'var(--primary)',
                color: 'white',
                '&:hover': { bgcolor: 'var(--primary-strong)' },
              }}
            >
              Cart
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 14 },
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'grid', gap: 4, alignItems: 'center', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.35fr) minmax(0, 0.85fr)' } }}>
            <Box>
              <Stack spacing={3}>
                <Chip
                  label="Autumn / Winter 2026"
                  sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(124, 79, 50, 0.08)', color: 'var(--primary-strong)' }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: { xs: '3.3rem', md: '6.2rem' },
                    lineHeight: 0.92,
                    fontWeight: 700,
                    maxWidth: 900,
                  }}
                >
                  Elevated essentials for customers who do not want the friction.
                </Typography>
                <Typography sx={{ maxWidth: 640, color: 'var(--muted)', fontSize: { xs: 16, md: 18 } }}>
                  A premium clothing storefront with polished merchandising, inventory awareness, guest checkout, and Razorpay-ready payments.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    size="large"
                    variant="contained"
                    onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
                    sx={{
                      bgcolor: 'var(--primary)',
                      px: 3,
                      py: 1.6,
                      '&:hover': { bgcolor: 'var(--primary-strong)' },
                    }}
                  >
                    Explore collection
                  </Button>
                  <Button
                    size="large"
                    variant="outlined"
                    onClick={() => navigate('/checkout')}
                    sx={{ px: 3, py: 1.6, borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    Checkout now
                  </Button>
                </Stack>

                <Box sx={{ display: 'grid', gap: 2, pt: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' } }}>
                  {heroMetrics.map((metric) => (
                    <Box key={metric.label}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2.3,
                          bgcolor: 'var(--bg-elevated)',
                          backdropFilter: 'blur(18px)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                          {metric.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
                          {metric.label}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Box>

            <Box>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 6,
                  bgcolor: 'rgba(255, 255, 255, 0.78)',
                  backdropFilter: 'blur(18px)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <Box
                  sx={{
                    height: 420,
                    borderRadius: 5,
                    overflow: 'hidden',
                    background:
                      'linear-gradient(135deg, rgba(124,79,50,0.95), rgba(216,179,138,0.88))',
                    position: 'relative',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: 'white',
                  }}
                >
                  <Box>
                    <Typography variant="overline" sx={{ letterSpacing: 2 }}>
                      Premium edit
                    </Typography>
                    <Typography variant="h4" sx={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>
                      Tailored silhouettes, tactile fabrics, smart stock control.
                    </Typography>
                  </Box>
                  <Stack spacing={1.2}>
                    {['Statement outerwear', 'Refined basics', 'Limited capsules'].map((label) => (
                      <Chip
                        key={label}
                        label={label}
                        sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.16)', color: 'white' }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 4 }}>
        <Paper
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 5,
            background: 'linear-gradient(135deg, rgba(31,26,23,0.96), rgba(124,79,50,0.92))',
            color: 'white',
            boxShadow: 'var(--shadow)',
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {showcaseCallouts.map((callout) => (
                <Chip key={callout} label={callout} sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }} />
              ))}
            </Stack>
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: 2, color: 'rgba(255,255,255,0.65)' }}>
                Preview lookbook
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>
                Dummy items to showcase the front-end presentation.
              </Typography>
              <Typography sx={{ mt: 1, maxWidth: 740, color: 'rgba(255,255,255,0.78)' }}>
                These are static showcase pieces for visual preview only. They help demonstrate the premium layout, card design, and collection styling before live inventory loads.
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ mt: 3, display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
            {showcaseProductsToRender.map((product) => (
              <Paper
                key={product.id}
                sx={{
                  overflow: 'hidden',
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <Box
                  component="img"
                  src={product.image}
                  alt={product.name}
                  sx={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
                <Box sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
                    <Box>
                      <Chip label={product.label} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'white' }} />
                      <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)' }}>
                        {product.category}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 800 }}>
                      {formatPrice(product.price)}
                    </Typography>
                  </Stack>

                  <Typography sx={{ mt: 1.5, color: 'rgba(255,255,255,0.72)' }}>
                    {product.description}
                  </Typography>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
                    {product.sizes.map((size) => (
                      <Chip key={size} label={size} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }} />
                    ))}
                    {product.colors.map((color) => (
                      <Chip key={color} label={color} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }} />
                    ))}
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Box>
        </Paper>
      </Container>

      <Container id="collection" maxWidth="xl" sx={{ pb: 10 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h3" sx={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>
                The collection
              </Typography>
              <Typography sx={{ color: 'var(--muted)' }}>
                Filter by category, browse what is available, and add to cart without signing in.
              </Typography>
            </Box>
            <TextField
              value={search}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
              placeholder="Search jackets, dresses, shirts..."
              size="small"
              sx={{ minWidth: { xs: '100%', md: 340 } }}
            />
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label="All" clickable color={activeCategory === 'All' ? 'primary' : 'default'} onClick={() => setActiveCategory('All')} />
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                clickable
                color={activeCategory === category.name ? 'primary' : 'default'}
                onClick={() => setActiveCategory(category.name)}
              />
            ))}
          </Stack>

          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' } }}>
            {loading &&
              Array.from({ length: 6 }).map((_, index) => (
                <Box key={index}>
                  <Paper sx={{ height: 420, borderRadius: 5 }} />
                </Box>
              ))}

            {!loading &&
              filteredProducts.map((product) => {
                const stockQuantity = product.stockQuantity ?? 0;
                const soldOut = stockQuantity <= 0;

                const images = getProductImages(product);
                const currentImageIndex = imageIndexes[product.id] ?? 0;

                return (
                  <Box key={product.id}>
                    <Card
                      onClick={() => openPreview(product, currentImageIndex)}
                      sx={{
                        height: '100%',
                        borderRadius: 5,
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow)',
                        background: 'rgba(255,255,255,0.84)',
                        backdropFilter: 'blur(12px)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    >
                      <Box sx={{ position: 'relative', height: { xs: 320, sm: 350, lg: 360 } }}>
                        <CardMedia
                          component="img"
                          image={images[currentImageIndex]}
                          alt={product.name}
                          sx={{ objectFit: 'contain', height: '100%' }}
                        />

                        <IconButton
                          aria-label="Save product"
                          onClick={(event) => event.stopPropagation()}
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: 'rgba(255,255,255,0.92)',
                            boxShadow: '0 6px 24px rgba(31,26,23,0.12)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                          }}
                          size="small"
                        >
                          <FavoriteBorderRoundedIcon fontSize="small" />
                        </IconButton>

                        <Chip
                          label={product.featured ? 'Hot Deal' : soldOut ? 'Sold out' : 'Best price'}
                          size="small"
                          sx={{
                            position: 'absolute',
                            left: 14,
                            bottom: 14,
                            bgcolor: product.featured ? 'rgba(82, 174, 90, 0.94)' : 'rgba(31,26,23,0.72)',
                            color: 'white',
                            fontWeight: 700,
                          }}
                        />

                        {images.length > 1 ? (
                          <>
                            <IconButton
                              onClick={(event) => {
                                event.stopPropagation();
                                handleImageStep(product.id, images.length, 'previous');
                              }}
                              sx={{
                                position: 'absolute',
                                left: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(255,255,255,0.85)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
                              }}
                              size="small"
                              aria-label="Previous product image"
                            >
                              <ChevronLeftRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={(event) => {
                                event.stopPropagation();
                                handleImageStep(product.id, images.length, 'next');
                              }}
                              sx={{
                                position: 'absolute',
                                right: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(255,255,255,0.85)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
                              }}
                              size="small"
                              aria-label="Next product image"
                            >
                              <ChevronRightRoundedIcon fontSize="small" />
                            </IconButton>
                            <Box
                              sx={{
                                position: 'absolute',
                                left: '50%',
                                bottom: 10,
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: 0.75,
                                px: 1,
                                py: 0.5,
                                borderRadius: 999,
                                bgcolor: 'rgba(31,26,23,0.45)',
                              }}
                            >
                              {images.map((_, imageIndex) => (
                                <Box
                                  key={imageIndex}
                                  sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    bgcolor: imageIndex === currentImageIndex ? 'white' : 'rgba(255,255,255,0.45)',
                                  }}
                                />
                              ))}
                            </Box>
                          </>
                        ) : null}
                      </Box>
                      <CardContent sx={{ p: 2, pb: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" spacing={1.5} alignItems="center">
                          <Box>
                            <Typography variant="caption" sx={{ color: 'var(--muted)', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 800 }}>
                              {product.categoryName || 'Signature'}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }} noWrap>
                              {product.name}
                            </Typography>
                          </Box>
                        
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>
                            {formatPrice(Number(product.price))}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: 'var(--muted)', textDecoration: 'line-through', fontWeight: 600 }}
                          >
                            {formatPrice(getReferencePrice(Number(product.price)))}
                          </Typography>
                          <Chip
                            label={`${getDiscountPercent(Number(product.price), getReferencePrice(Number(product.price)))}% off`}
                            size="small"
                            sx={{ bgcolor: 'rgba(82, 174, 90, 0.12)', color: '#2d7a36', fontWeight: 700 }}
                          />
                        </Stack>

                        <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'var(--muted)' }} noWrap>
                          {soldOut ? 'Currently sold out' : `${stockQuantity} pieces left`}
                        </Typography>
                      </CardContent>
                      <Divider />
                      <CardActions sx={{ p: 1.75, justifyContent: 'space-between' }}>
                        <Button
                          startIcon={<ShoppingBagRoundedIcon />}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAddToCart(product);
                          }}
                          disabled={soldOut}
                          size="small"
                          sx={{
                            bgcolor: 'var(--primary)',
                            color: 'white',
                            px: 2,
                            '&:hover': { bgcolor: 'var(--primary-strong)' },
                            '&.Mui-disabled': { bgcolor: 'rgba(124,79,50,0.16)', color: 'rgba(31,26,23,0.45)' },
                          }}
                        >
                          {soldOut ? 'Unavailable' : 'Add to cart'}
                        </Button>
                        {/* <Button
                          size="small"
                          variant="text"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate('/checkout');
                          }}
                        >
                          Buy now
                        </Button> */}
                      </CardActions>
                    </Card>
                  </Box>
                );
              })}
          </Box>
        </Stack>
      </Container>

      <Dialog open={Boolean(previewProduct)} onClose={closePreview} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: 0, bgcolor: '#0f0f0f' }}>
          {previewProduct ? (
            <Box sx={{ position: 'relative', bgcolor: '#0f0f0f' }}>
              <IconButton
                onClick={closePreview}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 2,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                }}
              >
                <CloseRoundedIcon />
              </IconButton>
              <Box
                component="img"
                src={getProductImages(previewProduct)[previewImageIndex]}
                alt={previewProduct.name}
                sx={{ width: '100%', maxHeight: '82vh', objectFit: 'contain', display: 'block', bgcolor: '#0f0f0f' }}
              />
              {getProductImages(previewProduct).length > 1 ? (
                <>
                  <IconButton
                    onClick={() => stepPreviewImage('previous')}
                    sx={{
                      position: 'absolute',
                      left: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                    }}
                    aria-label="Previous preview image"
                  >
                    <ChevronLeftRoundedIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => stepPreviewImage('next')}
                    sx={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                    }}
                    aria-label="Next preview image"
                  >
                    <ChevronRightRoundedIcon />
                  </IconButton>
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      bottom: 86,
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: 0.75,
                      px: 1,
                      py: 0.5,
                      borderRadius: 999,
                      bgcolor: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {getProductImages(previewProduct).map((_, imageIndex) => (
                      <Box
                        key={imageIndex}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: imageIndex === previewImageIndex ? 'white' : 'rgba(255,255,255,0.4)',
                        }}
                      />
                    ))}
                  </Box>
                </>
              ) : null}
              <Box sx={{ p: 2.5, color: 'white' }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {previewProduct.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mt: 1 }}>
                  {previewProduct.description}
                </Typography>

              </Box>
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      <Drawer anchor="right" open={isOpen} onClose={() => dispatch(closeCart())}>
        <Box sx={{ width: { xs: '100vw', sm: 420 }, p: 2.5, height: '100%', bgcolor: '#fffaf4' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Your cart
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
                {items.length} items selected
              </Typography>
            </Box>
            <IconButton onClick={() => dispatch(closeCart())}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2} sx={{ flex: 1, overflow: 'auto', maxHeight: '62vh' }}>
            {items.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700 }}>Your cart is empty.</Typography>
                <Typography variant="body2" sx={{ color: 'var(--muted)', mt: 1 }}>
                  Add a few signature pieces to get started.
                </Typography>
              </Paper>
            ) : (
              items.map((item) => (
                <Paper key={item.productId} variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                  <Stack direction="row" spacing={2}>
                    <Box
                      component="img"
                      src={item.image || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80'}
                      alt={item.name}
                      sx={{ width: 96, height: 112, objectFit: 'cover', borderRadius: 2 }}
                    />
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 800 }}>{item.name}</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--muted)' }}>
                          {formatPrice(item.price)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--muted)' }}>
                          Shipping: {item.shippingCharge ? formatPrice(item.shippingCharge) : 'Free'}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton size="small" onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}>
                          <RemoveRoundedIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ minWidth: 20, textAlign: 'center' }}>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                        >
                          <AddRoundedIcon fontSize="small" />
                        </IconButton>
                        <Button size="small" color="inherit" onClick={() => dispatch(removeItem(item.productId))}>
                          Remove
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Paper>
              ))
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="var(--muted)">Subtotal</Typography>
              <Typography sx={{ fontWeight: 700 }}>{formatPrice(subtotal)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="var(--muted)">Shipping</Typography>
              <Typography sx={{ fontWeight: 700 }}>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontWeight: 800 }}>Total</Typography>
              <Typography sx={{ fontWeight: 900 }}>{formatPrice(grandTotal)}</Typography>
            </Stack>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/checkout')}
              disabled={items.length === 0}
              sx={{
                mt: 1,
                bgcolor: 'var(--primary)',
                '&:hover': { bgcolor: 'var(--primary-strong)' },
              }}
            >
              Continue to checkout
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
};

export default StorefrontPage;