import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';

dotenv.config();

const PRODUCTS = [
  // ============================================================================
  // BUYER PLANS
  // ============================================================================
  {
    productId: 'buyer_pro_monthly',
    name: 'Buyer Pro',
    description: 'Never miss a new listing! Get notified the moment a property matching your criteria hits the market.',
    type: 'subscription' as const,
    price: 1.50,
    currency: 'EUR',
    billingPeriod: 'monthly' as const,
    features: [
      'Instant email & SMS notifications',
      'Save unlimited searches',
      'Early access to new listings',
      'Advanced market insights',
    ],
    targetRole: 'buyer' as const,
    displayOrder: 1,
    highlighted: false,
    isActive: true,
    isVisible: true,
    hasFreeTrial: false,
    gracePeriodDays: 3,
  },

  // ============================================================================
  // SELLER PLANS
  // ============================================================================
  {
    productId: 'seller_pro_monthly',
    name: 'Pro Monthly',
    description: 'Great for starting out with professional selling tools.',
    type: 'subscription' as const,
    price: 25,
    currency: 'EUR',
    billingPeriod: 'monthly' as const,
    features: [
      'Up to 3 active ads',
      'Standard placement',
      'Basic analytics',
      'Email support',
      'Mobile app access',
    ],
    targetRole: 'seller' as const,
    displayOrder: 2,
    highlighted: false,
    isActive: true,
    isVisible: true,
    hasFreeTrial: false,
    gracePeriodDays: 3,
  },
  {
    productId: 'seller_pro_yearly',
    name: 'Pro Yearly',
    description: 'Best value for serious sellers - save with annual billing.',
    type: 'subscription' as const,
    price: 200,
    currency: 'EUR',
    billingPeriod: 'yearly' as const,
    features: [
      'Up to 10 active property ads',
      'Premium listing placement',
      'Advanced analytics dashboard',
      'Lead management system',
      'Professional photography tips',
      'Priority customer support',
    ],
    targetRole: 'seller' as const,
    displayOrder: 1,
    badge: 'MOST POPULAR',
    badgeColor: 'red',
    highlighted: true,
    cardStyle: {
      backgroundColor: 'from-green-50 to-cyan-50',
      borderColor: 'border-green-400',
    },
    isActive: true,
    isVisible: true,
    hasFreeTrial: false,
    gracePeriodDays: 3,
  },
  {
    productId: 'seller_enterprise_yearly',
    name: 'Enterprise',
    description: 'For agencies and professional sellers with unlimited needs.',
    type: 'subscription' as const,
    price: 1000,
    currency: 'EUR',
    billingPeriod: 'yearly' as const,
    features: [
      'Unlimited Property Listings',
      '3 Priority Ads per month',
      'Dedicated Account Manager',
      'API access for integrations',
      'Custom branding options',
      'Advanced reporting',
    ],
    targetRole: 'agent' as const,
    displayOrder: 3,
    highlighted: false,
    cardStyle: {
      backgroundColor: 'bg-neutral-800',
      textColor: 'text-white',
    },
    isActive: true,
    isVisible: true,
    hasFreeTrial: false,
    gracePeriodDays: 7,
  },
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/balkan-estate';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.deleteMany({});
    // console.log('🗑️  Cleared existing products');

    // Insert products
    for (const productData of PRODUCTS) {
      await Product.findOneAndUpdate(
        { productId: productData.productId },
        productData,
        { upsert: true, new: true }
      );
      console.log(`✅ Seeded product: ${productData.name} (${productData.productId})`);
    }

    console.log('\n🎉 Successfully seeded all products!');
    console.log(`📊 Total products: ${PRODUCTS.length}`);

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the seed function
seedProducts();
