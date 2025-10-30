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

// Serve frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Chill Wear API is running',
    timestamp: new Date().toISOString()
  });
});

// Sample data for initial setup
app.get('/api/sample-data', async (req, res) => {
  try {
    const sampleProducts = [
      {
        name: 'BOSS Hoodie',
        description: 'Premium BOSS hoodie with comfortable fit and iconic branding.',
        price: 1299,
        images: ['boss-hoodie.jpg'],
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'hoodies',
        featured: true,
        inStock: true
      },
      {
        name: 'Urban Denim Jacket',
        description: 'Classic denim jacket with modern fit, perfect for layering.',
        price: 1199,
        images: ['denim-jacket.jpg'],
        sizes: ['S', 'M', 'L', 'XL'],
        category: 'jackets',
        featured: true,
        inStock: true
      }
    ];
    
    // Insert sample products
    const Product = mongoose.model('Product');
    await Product.deleteMany({});
    const insertedProducts = await Product.insertMany(sampleProducts);
    
    res.json({
      message: 'Sample data inserted successfully',
      products: insertedProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🏠 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api/health`);
  console.log(`📊 Sample Data: http://localhost:${PORT}/api/sample-data`);
});
