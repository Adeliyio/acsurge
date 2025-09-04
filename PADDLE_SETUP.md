# Paddle Integration Setup Guide

This guide will help you complete the migration from Stripe to Paddle for subscription management in AdCopySurge.

## 🏁 Quick Start

### 1. Create Paddle Account

1. **Sign up for Paddle**: Go to [paddle.com](https://www.paddle.com) and create an account
2. **Verify your account**: Complete email verification and business verification if required
3. **Access the Dashboard**: Go to [vendors.paddle.com](https://vendors.paddle.com) (for sandbox) or use the live dashboard

### 2. Get Your Paddle Credentials

In your Paddle dashboard:

1. **Vendor ID**: 
   - Go to Developer Tools > Authentication
   - Copy your Vendor ID

2. **API Auth Code**:
   - In Developer Tools > Authentication
   - Generate an Auth Code
   - Copy the Auth Code (keep this secure!)

3. **Public Key**:
   - In Developer Tools > Public Key
   - Copy your public key for webhook verification

### 3. Create Products in Paddle

Create two subscription products in your Paddle dashboard:

#### Basic Plan ($49/month)
1. Go to Catalog > Products
2. Click "Create Product"
3. **Name**: "AdCopySurge Basic Plan"
4. **Type**: Subscription
5. **Billing**: Monthly
6. **Price**: $49 USD
7. **Product ID**: Use `basic_monthly` (or note the generated ID)

#### Pro Plan ($99/month)
1. Create another product
2. **Name**: "AdCopySurge Pro Plan"
3. **Type**: Subscription
4. **Billing**: Monthly
5. **Price**: $99 USD
6. **Product ID**: Use `pro_monthly` (or note the generated ID)

### 4. Configure Environment Variables

#### Backend (.env)
Copy `.env.example` to `.env` and update these values:

```bash
# Paddle Configuration
PADDLE_VENDOR_ID=12345  # Your actual vendor ID
PADDLE_AUTH_CODE=your-auth-code-here
PADDLE_PUBLIC_KEY=your-public-key-here
PADDLE_ENVIRONMENT=sandbox
PADDLE_API_URL=https://sandbox-vendors.paddle.com/api
```

#### Frontend (.env)
Copy `.env.example` to `.env` and update:

```bash
# Paddle Configuration
REACT_APP_PADDLE_VENDOR_ID=12345  # Same as backend
REACT_APP_PADDLE_ENVIRONMENT=sandbox
REACT_APP_API_URL=http://localhost:8000/api
```

### 5. Update Product IDs in Code

Update the product IDs in your code to match your Paddle products:

#### Backend: `app/api/subscriptions.py`
```python
plan_mapping = {
    "basic": "basic_monthly",  # Replace with your actual Paddle product ID
    "pro": "pro_monthly"       # Replace with your actual Paddle product ID
}
```

#### Frontend: `src/services/paddleService.js`
```javascript
getPaddleProductMapping() {
  return {
    basic: {
      productId: 'basic_monthly', // Replace with actual Paddle product ID
      name: 'Basic Plan',
      price: 49
    },
    pro: {
      productId: 'pro_monthly',   // Replace with actual Paddle product ID
      name: 'Pro Plan',
      price: 99
    }
  };
}
```

### 6. Install Dependencies

#### Backend:
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend:
```bash
cd frontend
npm install
```

### 7. Database Migration

The User model has been updated with Paddle fields. If you have an existing database, you'll need to add these columns:

```sql
ALTER TABLE users ADD COLUMN paddle_subscription_id VARCHAR;
ALTER TABLE users ADD COLUMN paddle_plan_id VARCHAR;
ALTER TABLE users ADD COLUMN paddle_checkout_id VARCHAR;

CREATE INDEX idx_users_paddle_subscription_id ON users(paddle_subscription_id);
```

### 8. Configure Webhooks in Paddle

1. Go to Developer Tools > Webhooks in your Paddle dashboard
2. Add a new webhook endpoint: `https://yourdomain.com/api/subscriptions/paddle/webhook`
3. Select these events:
   - `subscription_created`
   - `subscription_updated`
   - `subscription_cancelled`
   - `subscription_payment_succeeded`
   - `subscription_payment_failed`

For local development, you can use ngrok:
```bash
ngrok http 8000
# Then use: https://your-ngrok-url.ngrok.io/api/subscriptions/paddle/webhook
```

### 9. Test the Integration

1. **Start the backend**:
   ```bash
   cd backend
   python main.py
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Test subscription flow**:
   - Go to http://localhost:3000/pricing
   - Try subscribing to a paid plan
   - Use Paddle's test card numbers for testing

### 10. Paddle Test Cards

For testing in sandbox mode, use these test card numbers:

- **Successful payment**: `4000000000000002`
- **Declined payment**: `4000000000000010`
- **Insufficient funds**: `4000000000000028`

## 🔧 Development Notes

### API Endpoints

New Paddle endpoints have been added:

- `POST /api/subscriptions/paddle/checkout` - Create checkout session
- `POST /api/subscriptions/paddle/webhook` - Handle webhooks  
- `POST /api/subscriptions/paddle/cancel` - Cancel subscription

### Frontend Integration

The `paddleService.js` handles:
- Loading Paddle.js dynamically
- Opening checkout overlays
- Handling payment success/failure
- API communication with backend

### Security Considerations

1. **Webhook Verification**: Enable webhook signature verification in production
2. **Environment Variables**: Never commit real credentials to version control
3. **HTTPS**: Use HTTPS for webhooks in production
4. **Error Handling**: Implement proper error handling and user feedback

## 🚀 Going Live

When ready for production:

1. **Switch to Live Environment**:
   ```bash
   PADDLE_ENVIRONMENT=live
   PADDLE_API_URL=https://vendors.paddle.com/api
   REACT_APP_PADDLE_ENVIRONMENT=live
   ```

2. **Update Webhook URL**: Point to your production domain
3. **Test thoroughly**: Test all subscription flows in live mode
4. **Monitor**: Set up monitoring for webhook delivery and payment failures

## 🐛 Troubleshooting

### Common Issues

1. **Paddle.js not loading**: Check vendor ID and environment settings
2. **Webhook not working**: Verify URL is accessible and returns 200 OK
3. **Product ID errors**: Ensure product IDs match exactly between code and Paddle dashboard
4. **CORS issues**: Add your domain to ALLOWED_HOSTS in backend config

### Debug Mode

Enable debug logging to troubleshoot issues:

```python
# In your backend
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📞 Support

- **Paddle Documentation**: [developer.paddle.com](https://developer.paddle.com)
- **Paddle Support**: Available through your Paddle dashboard
- **Community**: Paddle developer Slack community

## ✅ Migration Checklist

- [ ] Paddle account created and verified
- [ ] Products created in Paddle dashboard  
- [ ] Environment variables configured
- [ ] Product IDs updated in code
- [ ] Dependencies installed
- [ ] Database migrated
- [ ] Webhooks configured
- [ ] Local testing completed
- [ ] Test cards working
- [ ] Ready for production deployment

---

**Next Steps**: Once you complete this setup, you can remove the legacy Stripe code and fully migrate to Paddle!
