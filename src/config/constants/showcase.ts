export type ShowcaseProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  sizes: string[];
  colors: string[];
  label: string;
};

export const heroMetrics = [
  { label: 'Curated drops', value: '120+' },
  { label: 'Guest checkout', value: '1 step' },
  { label: 'Razorpay ready', value: 'Live' },
];

export const showcaseProducts: ShowcaseProduct[] = [
  {
    id: 'lookbook-01',
    name: 'Noir Tailored Blazer',
    category: 'Outerwear',
    price: 7490,
    image: 'https://images.unsplash.com/photo-1593032465175-481ac7f4013e?auto=format&fit=crop&w=1200&q=80',
    description: 'A sharp evening blazer with a structured shoulder and soft drape for premium layering.',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Espresso'],
    label: 'Preview item',
  },
  {
    id: 'lookbook-02',
    name: 'Ivory Silk Shirt',
    category: 'Essentials',
    price: 3990,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    description: 'Clean lines, fluid fabric, and a polished finish for elevated everyday dressing.',
    sizes: ['XS', 'S', 'M'],
    colors: ['Ivory', 'Sand'],
    label: 'Preview item',
  },
  {
    id: 'lookbook-03',
    name: 'Cropped Wool Trousers',
    category: 'Bottoms',
    price: 5290,
    image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=1200&q=80',
    description: 'Tailored wool trousers with a refined silhouette and all-day comfort.',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Stone'],
    label: 'Preview item',
  },
];

export const showcaseCallouts = [
  'Luxury styling cues',
  'Sold-out aware inventory',
  'Guest-first checkout flow',
];