import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'] 
  },
  description: { 
    type: String, 
    required: [true, 'Product description is required'] 
  },
  price: { 
    type: Number, 
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  images: [{ 
    type: String 
  }],
  sizes: [{ 
    type: String,
    enum: ['S', 'M', 'L', 'XL', 'XXL']
  }],
  category: { 
    type: String,
    required: true,
    enum: ['hoodies', 'jackets', 'tshirts', 'pants']
  },
  inStock: { 
    type: Boolean, 
    default: true 
  },
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Product', productSchema);
