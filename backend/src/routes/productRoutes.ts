import express, { Request, Response } from 'express';
import Product from '../models/Product';

const router = express.Router();

/**
 * @desc    Get all available products
 * @route   GET /api/products
 * @access  Public
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { store, active } = req.query;

    const query: any = {};

    if (active === 'true') {
      query.isActive = true;
    }

    const products = await Product.find(query).sort({ displayOrder: 1 });

    // Filter by store if specified
    let filteredProducts = products;
    if (store === 'google') {
      filteredProducts = products.filter((p) => p.googlePlayProductId);
    } else if (store === 'apple') {
      filteredProducts = products.filter((p) => p.appStoreProductId);
    } else if (store === 'stripe' || store === 'web') {
      filteredProducts = products.filter((p) => p.stripeProductId);
    }

    res.status(200).json({
      products: filteredProducts.map((product) => ({
        id: product._id,
        productId: product.productId,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        billingPeriod: product.billingPeriod,
        trialPeriodDays: product.trialPeriodDays,
        features: product.features,
        store: {
          google: product.googlePlayProductId,
          apple: product.appStoreProductId,
          stripe: product.stripeProductId,
        },
      })),
    });
  } catch (error: any) {
    console.error('Error getting products:', error);
    res.status(500).json({ message: 'Error getting products', error: error.message });
  }
});

/**
 * @desc    Get a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      $or: [{ _id: id }, { productId: id }],
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json({
      product: {
        id: product._id,
        productId: product.productId,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        billingPeriod: product.billingPeriod,
        trialPeriodDays: product.trialPeriodDays,
        gracePeriodDays: product.gracePeriodDays,
        features: product.features,
        store: {
          google: product.googlePlayProductId,
          apple: product.appStoreProductId,
          stripe: product.stripeProductId,
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting product:', error);
    res.status(500).json({ message: 'Error getting product', error: error.message });
  }
});

export default router;
