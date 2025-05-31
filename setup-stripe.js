// This script creates Stripe products and prices for the chat application
// Run this script to set up your Stripe products and get the price IDs
// Then update your .env.local file with the actual price IDs

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  try {
    console.log('Creating Stripe products and prices...');

    // Create Pro plan
    const proProduct = await stripe.products.create({
      name: 'Pro Plan',
      description: 'Unlimited chatbots and advanced features for growing businesses',
      metadata: {
        plan: 'pro'
      }
    });

    const proPrice = await stripe.prices.create({
      unit_amount: 2900, // $29.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      product: proProduct.id,
    });

    // Create Enterprise plan
    const enterpriseProduct = await stripe.products.create({
      name: 'Enterprise Plan',
      description: 'White-label solution with premium support for large organizations',
      metadata: {
        plan: 'enterprise'
      }
    });

    const enterprisePrice = await stripe.prices.create({
      unit_amount: 9900, // $99.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      product: enterpriseProduct.id,
    });

    console.log('✅ Products and prices created successfully!');
    console.log('\nUpdate your .env.local file with these price IDs:');
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`STRIPE_ENTERPRISE_PRICE_ID=${enterprisePrice.id}`);

    console.log('\nProduct Details:');
    console.log('Pro Plan:', { productId: proProduct.id, priceId: proPrice.id });
    console.log('Enterprise Plan:', { productId: enterpriseProduct.id, priceId: enterprisePrice.id });

  } catch (error) {
    console.error('Error creating products:', error);
  }
}

// Only run if called directly
if (require.main === module) {
  createProducts();
}

module.exports = { createProducts };
