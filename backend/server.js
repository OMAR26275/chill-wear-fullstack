import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chillwear';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/products', productRoutes);

// Sample data endpoint for initial setup
app.get('/api/sample-products', (req, res) => {
  const sampleProducts = [
    {
      _id: '1',
      name: 'BOSS Hoodie',
      description: 'Premium BOSS hoodie with comfortable fit and iconic branding.',
      price: 1299,
      images: ['boss-hoodie.jpg'],
      sizes: ['S', 'M', 'L', 'XL'],
      category: 'hoodies',
      inStock: true
    },
    {
      _id: '2',
      name: 'Urban Denim Jacket',
      description: 'Classic denim jacket with modern fit, perfect for layering.',
      price: 1199,
      images: ['denim-jacket.jpg'],
      sizes: ['S', 'M', 'L', 'XL'],
      category: 'jackets',
      inStock: true
    }
  ];
  res.json(sampleProducts);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Sample products: http://localhost:${PORT}/api/sample-products`);
});
