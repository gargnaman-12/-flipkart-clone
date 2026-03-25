const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

function toInt(value, fallback) {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const CATEGORY_IMAGE_BANK = {
  Mobiles: [
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1603898037225-dab4e9d86f76?auto=format&fit=crop&w=900&q=60'
  ],
  Audio: [
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1585386959984-a41552231693?auto=format&fit=crop&w=900&q=60'
  ],
  Laptops: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=60'
  ],
  TVs: [
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1601944177325-f8867652837f?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=60'
  ],
  Fashion: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=900&q=60'
  ],
  'Home & Kitchen': [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1585515656973-e6c8db4d5df6?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1586208958839-06c17cacdf08?auto=format&fit=crop&w=900&q=60'
  ],
  Grocery: [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1603046891744-76182f8f3b1c?auto=format&fit=crop&w=900&q=60'
  ],
  Beauty: [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=60',
    'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=60'
  ]
};

function pickCategoryImages(category, idx) {
  const bank = CATEGORY_IMAGE_BANK[category] || CATEGORY_IMAGE_BANK['Home & Kitchen'];
  const hero = bank[idx % bank.length];
  const gallery = [
    bank[idx % bank.length],
    bank[(idx + 1) % bank.length],
    bank[(idx + 2) % bank.length]
  ];
  return { hero, gallery };
}

function normalizeProductVisual(product, idx = 0) {
  const p = typeof product.toObject === 'function' ? product.toObject() : { ...product };
  const picked = pickCategoryImages(p.category, idx);
  return {
    ...p,
    image: picked.hero,
    images: picked.gallery
  };
}

// Get products (supports search/category/sort/pagination)
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      sort = 'featured',
      page = '1',
      limit = '24'
    } = req.query;

    const pageNum = clamp(toInt(page, 1), 1, 5000);
    const limitNum = clamp(toInt(limit, 24), 1, 60);

    const query = {};
    if (category && String(category).trim().length > 0) {
      query.category = String(category).trim();
    }
    if (search && String(search).trim().length > 0) {
      query.title = { $regex: String(search).trim(), $options: 'i' };
    }

    let sortObj = { _id: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'rating_desc') sortObj = { rating: -1, ratingCount: -1 };

    const [items, total] = await Promise.all([
      Product.find(query)
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);

    res.json({
      items: items.map((p, i) => normalizeProductVisual(p, i)),
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNum))
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(normalizeProductVisual(product, 0));
  } catch (err) {
    res.status(400).json({ error: 'Invalid id' });
  }
});

// Seed products if none exist (for demo)
router.post('/seed', async (req, res) => {
  try {
    const force = String(req.query.force ?? 'false') === 'true';
    const count = await Product.countDocuments();

    if (!force && count > 0) {
      return res.json({ message: 'Products already exist. Use ?force=true to reseed.' });
    }

    if (force) {
      await Product.deleteMany({});
    }

    const demo = [
      {
        title: 'Apple iPhone 15 (128 GB)',
        brand: 'Apple',
        category: 'Mobiles',
        price: 65999,
        mrp: 79999,
        discountPercent: 18,
        image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'All‑day battery, fast A‑series performance, and a bright display.',
        highlights: ['128 GB ROM', '6.1" Super Retina XDR', 'A‑series chip', 'Fast charging support'],
        rating: 4.6,
        ratingCount: 12784,
        reviews: [
          { name: 'Naman', rating: 5, title: 'Best phone', comment: 'Super smooth and camera is amazing.' },
          { name: 'Aditi', rating: 4, title: 'Great', comment: 'Battery is good, price is high but worth it.' }
        ]
      },
      {
        title: 'Noise Buds VS104 Max',
        brand: 'Noise',
        category: 'Audio',
        price: 1499,
        mrp: 3499,
        discountPercent: 57,
        image: 'https://images.unsplash.com/photo-1518441986151-07d28d1fe0b8?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1518441986151-07d28d1fe0b8?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1585386959984-a41552231693?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1629429408209-1f912961dbd8?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'TWS earbuds with low latency and punchy bass.',
        highlights: ['Up to 45h playback', 'Quad mic ENC', 'Low latency mode', 'Type‑C charging'],
        rating: 4.2,
        ratingCount: 55321,
        reviews: [
          { name: 'Rahul', rating: 4, title: 'Value for money', comment: 'Sound is great for this price.' },
          { name: 'Sneha', rating: 5, title: 'Loved it', comment: 'Battery backup is excellent.' }
        ]
      },
      {
        title: 'HP 15s Ryzen 5 (8GB/512GB SSD)',
        brand: 'HP',
        category: 'Laptops',
        price: 41990,
        mrp: 55990,
        discountPercent: 25,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'Fast SSD, smooth multitasking, and a crisp 15.6" display.',
        highlights: ['Ryzen 5', '8GB DDR4', '512GB SSD', '15.6" FHD'],
        rating: 4.3,
        ratingCount: 9812,
        reviews: [
          { name: 'Vikram', rating: 4, title: 'Solid daily laptop', comment: 'Great for coding and office work.' }
        ]
      },
      {
        title: 'Mi 108 cm (43) 4K Ultra HD Smart TV',
        brand: 'Xiaomi',
        category: 'TVs',
        price: 22999,
        mrp: 39999,
        discountPercent: 42,
        image: 'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1601944177325-f8867652837f?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'Cinematic 4K visuals with built‑in streaming apps.',
        highlights: ['4K UHD', 'Dolby Audio', 'PatchWall', '3 HDMI ports'],
        rating: 4.1,
        ratingCount: 22111,
        reviews: [
          { name: 'Saurabh', rating: 4, title: 'Good picture', comment: 'Great display, average speakers.' }
        ]
      },
      {
        title: 'Puma Men Running Shoes',
        brand: 'Puma',
        category: 'Fashion',
        price: 2499,
        mrp: 4999,
        discountPercent: 50,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1528701800489-20be3c2ea2c0?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'Comfortable running shoes with breathable mesh.',
        highlights: ['Lightweight', 'Rubber outsole', 'Breathable upper', 'Everyday comfort'],
        rating: 4.4,
        ratingCount: 14503,
        reviews: [
          { name: 'Meera', rating: 5, title: 'Super comfy', comment: 'Perfect for walks and running.' }
        ]
      },
      {
        title: 'Philips Air Fryer (4.1L)',
        brand: 'Philips',
        category: 'Home & Kitchen',
        price: 7499,
        mrp: 12995,
        discountPercent: 42,
        image: 'https://images.unsplash.com/photo-1612198790700-0ff3a4db4c84?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1612198790700-0ff3a4db4c84?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1604908554029-3b1b8db7a7c3?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1604908177453-7462950a6b65?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'Crispy food with less oil and easy cleaning.',
        highlights: ['Rapid Air technology', '4.1L capacity', 'Easy clean', 'Multiple presets'],
        rating: 4.5,
        ratingCount: 6122,
        reviews: [
          { name: 'Kunal', rating: 5, title: 'Healthy cooking', comment: 'Makes great fries with very little oil.' }
        ]
      }
    ];

    // Build: at least 4 reviewed products per category
    const categories = [
      'Mobiles',
      'Audio',
      'Laptops',
      'TVs',
      'Fashion',
      'Home & Kitchen',
      'Grocery',
      'Beauty'
    ];

    const groceryTemplates = [
      {
        title: 'Aashirvaad Atta (10 kg)',
        brand: 'Aashirvaad',
        category: 'Grocery',
        price: 469,
        mrp: 585,
        discountPercent: 20,
        image:
          'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'Soft rotis everyday with trusted quality wheat flour.',
        highlights: ['10 kg pack', 'Daily use', 'Fresh seal packaging', 'Trusted brand'],
        rating: 4.5,
        ratingCount: 18842,
        reviews: [
          { name: 'Priya', rating: 5, title: 'Fresh', comment: 'Good quality and fine texture.' },
          { name: 'Rohit', rating: 4, title: 'Worth it', comment: 'Nice for daily cooking.' }
        ]
      },
      {
        title: 'Tata Tea Gold (1 kg)',
        brand: 'Tata',
        category: 'Grocery',
        price: 545,
        mrp: 650,
        discountPercent: 16,
        image:
          'https://images.unsplash.com/photo-1528826194825-1a0ccf1d2b1a?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1528826194825-1a0ccf1d2b1a?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'Rich aroma and strong taste for perfect chai.',
        highlights: ['1 kg pack', 'Strong taste', 'Great aroma', 'Daily chai'],
        rating: 4.4,
        ratingCount: 10991,
        reviews: [
          { name: 'Aman', rating: 4, title: 'Nice flavor', comment: 'Strong tea, good aroma.' },
          { name: 'Komal', rating: 5, title: 'Best chai', comment: 'Great for milk tea.' }
        ]
      },
      {
        title: 'Fortune Sunflower Oil (5 L)',
        brand: 'Fortune',
        category: 'Grocery',
        price: 699,
        mrp: 899,
        discountPercent: 22,
        image:
          'https://images.unsplash.com/photo-1601153302456-0b4cc4f28da9?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1601153302456-0b4cc4f28da9?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'Light oil for everyday cooking.',
        highlights: ['5 L jar', 'Light & healthy', 'Everyday use', 'Refined oil'],
        rating: 4.3,
        ratingCount: 7421,
        reviews: [
          { name: 'Deepak', rating: 4, title: 'Good', comment: 'Decent quality for price.' },
          { name: 'Shalini', rating: 5, title: 'Nice', comment: 'Light and good for frying.' }
        ]
      },
      {
        title: 'Maggi 2-Minute Noodles (12 pack)',
        brand: 'Maggi',
        category: 'Grocery',
        price: 168,
        mrp: 192,
        discountPercent: 12,
        image:
          'https://source.unsplash.com/800x600/?noodles,instant-noodles',
        images: [
          'https://source.unsplash.com/900x700/?noodles,food',
          'https://source.unsplash.com/900x700/?instant-noodles,packet'
        ],
        description: 'Classic instant noodles for quick meals.',
        highlights: ['12 pack', '2-minute', 'Classic taste', 'Quick meal'],
        rating: 4.6,
        ratingCount: 30112,
        reviews: [
          { name: 'Neha', rating: 5, title: 'Always good', comment: 'Kids love it.' },
          { name: 'Arjun', rating: 4, title: 'Tasty', comment: 'Quick snack option.' }
        ]
      }
    ];

    const beautyTemplates = [
      {
        title: 'Lakmé 9to5 Primer + Matte Lip Color',
        brand: 'Lakmé',
        category: 'Beauty',
        price: 499,
        mrp: 625,
        discountPercent: 20,
        image:
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'Comfortable matte finish with long wear.',
        highlights: ['Matte finish', 'Long wear', 'Smooth application', 'Rich pigment'],
        rating: 4.2,
        ratingCount: 6122,
        reviews: [
          { name: 'Riya', rating: 4, title: 'Nice matte', comment: 'Color stays for hours.' },
          { name: 'Ishita', rating: 5, title: 'Love it', comment: 'Great shade and texture.' }
        ]
      },
      {
        title: 'NIVEA Soft Moisturizer (200 ml)',
        brand: 'NIVEA',
        category: 'Beauty',
        price: 299,
        mrp: 399,
        discountPercent: 25,
        image:
          'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1611930022065-4fd0c4a96571?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'Light moisturizer for soft, hydrated skin.',
        highlights: ['Non-sticky', 'Daily use', 'Fast absorbing', 'All skin types'],
        rating: 4.6,
        ratingCount: 24451,
        reviews: [
          { name: 'Sana', rating: 5, title: 'Best', comment: 'Very light and effective.' },
          { name: 'Varun', rating: 4, title: 'Good', comment: 'Works well in summers.' }
        ]
      },
      {
        title: 'The Derma Co 1% Hyaluronic Sunscreen Aqua Gel',
        brand: 'The Derma Co',
        category: 'Beauty',
        price: 449,
        mrp: 599,
        discountPercent: 25,
        image:
          'https://images.unsplash.com/photo-1614859324967-5b0f01f68058?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1614859324967-5b0f01f68058?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'SPF sunscreen gel with lightweight finish.',
        highlights: ['SPF', 'No white cast', 'Gel texture', 'Daily protection'],
        rating: 4.4,
        ratingCount: 9831,
        reviews: [
          { name: 'Bhavna', rating: 5, title: 'No white cast', comment: 'Feels super light.' },
          { name: 'Karan', rating: 4, title: 'Good', comment: 'Nice finish, works well.' }
        ]
      },
      {
        title: "Maybelline Fit Me Foundation (30 ml)",
        brand: 'Maybelline',
        category: 'Beauty',
        price: 399,
        mrp: 549,
        discountPercent: 27,
        image:
          'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=60',
        images: [
          'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=60',
          'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=60'
        ],
        description: 'Natural coverage with a smooth finish.',
        highlights: ['Buildable coverage', 'Smooth finish', 'Everyday wear', 'Easy blend'],
        rating: 4.3,
        ratingCount: 15021,
        reviews: [
          { name: 'Anjali', rating: 4, title: 'Good coverage', comment: 'Matches my skin tone well.' },
          { name: 'Pooja', rating: 5, title: 'Nice', comment: 'Blends easily and looks natural.' }
        ]
      }
    ];

    const templates = [...demo, ...groceryTemplates, ...beautyTemplates];

    const expanded = [];
    function pushProduct(base, cat, idxInCat) {
      const tweak = idxInCat + 1;
      const picked = pickCategoryImages(cat, idxInCat);
      expanded.push({
        ...base,
        _id: undefined,
        category: cat,
        image: picked.hero,
        images: picked.gallery,
        title: idxInCat === 0 ? base.title : `${base.title} • Offer ${tweak}`,
        price: Math.max(99, Math.round((base.price || 999) * (0.92 + (idxInCat % 4) * 0.05))),
        rating: Math.max(
          3.8,
          Math.min(4.8, Number(((base.rating || 4.2) - 0.2 + (idxInCat % 4) * 0.15).toFixed(1)))
        ),
        ratingCount: Math.max(50, (base.ratingCount || 2000) + idxInCat * 321),
        discountPercent: clamp((base.discountPercent ?? 15) + (idxInCat % 4) * 3, 0, 70),
        inStock: idxInCat % 9 !== 0,
        // ensure reviews exist for seeded products
        reviews:
          Array.isArray(base.reviews) && base.reviews.length
            ? base.reviews
            : [
                { name: 'User', rating: 5, title: 'Great', comment: 'Good quality for the price.' },
                { name: 'Buyer', rating: 4, title: 'Nice', comment: 'Delivery was fast and product is good.' }
              ]
      });
    }

    // Ensure minimum 4 per category
    for (const cat of categories) {
      const basePool = templates.filter((t) => t.category === cat);
      const pool = basePool.length ? basePool : templates;
      for (let i = 0; i < 4; i++) {
        const base = pool[i % pool.length];
        pushProduct(base, cat, i);
      }
    }

    // Add some extra variety, but only from same-category templates
    for (let i = 0; i < 18; i++) {
      const cat = categories[i % categories.length];
      const pool = templates.filter((t) => t.category === cat);
      const base = pool[i % pool.length];
      pushProduct(base, cat, 4 + Math.floor(i / categories.length));
    }

    await Product.insertMany(expanded);
    res.json({ message: 'Demo products seeded.', inserted: expanded.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;