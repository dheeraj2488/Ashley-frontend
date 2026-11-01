import { Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { services } from '../../services';

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '', sortOrder: '' });

  const loadCategories = async () => {
    const response = await services.categoryService.getCategories();
    setCategories(response.data ?? []);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await services.categoryService.createCategory({
      name: form.name,
      slug: form.slug,
      description: form.description,
      sortOrder: Number(form.sortOrder || 0),
    });
    setForm({ name: '', slug: '', description: '', sortOrder: '' });
    await loadCategories();
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4" sx={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 700 }}>
        Categories
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <TextField label="Slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
            <TextField label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <TextField label="Sort order" type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
            <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start', bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--primary-strong)' } }}>
              Create category
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {categories.map((category) => (
          <Chip key={category.id} label={`${category.name} · ${category.slug}`} color={category.isActive ? 'success' : 'default'} />
        ))}
      </Stack>
    </Stack>
  );
};

export default CategoriesPage;