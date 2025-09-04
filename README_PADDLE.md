# AdCopySurge - Paddle Integration

## 🔥 What's New: Paddle Billing Integration

AdCopySurge now uses **Paddle** for subscription management instead of Stripe! Paddle provides:

- ✅ **Better Global Support**: Handles taxes, compliance, and payments worldwide
- ✅ **Simpler Integration**: Less complex than Stripe for subscription billing  
- ✅ **Merchant of Record**: Paddle handles all tax obligations
- ✅ **Overlay Checkout**: Smooth, non-redirect checkout experience

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ and Python 3.9+
- PostgreSQL database
- Paddle account (sandbox for development)

### 2. Setup Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your Paddle credentials

# Run the server
python main.py
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies  
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your Paddle vendor ID

# Start development server
npm start
```

### 4. Configure Paddle

1. **Create Paddle Account**: Sign up at [paddle.com](https://paddle.com)
2. **Get Credentials**: Vendor ID, Auth Code, Public Key from dashboard
3. **Create Products**: Set up Basic ($49/month) and Pro ($99/month) plans
4. **Setup Webhooks**: Point to your API webhook endpoint

👉 **See [PADDLE_SETUP.md](./PADDLE_SETUP.md) for detailed setup instructions**

## 🏗️ Architecture Overview

### Backend (FastAPI)
- **PaddleService**: Handles all Paddle API interactions
- **Webhook Handler**: Processes subscription events from Paddle
- **Database Models**: Updated with Paddle-specific fields
- **API Endpoints**: New endpoints for Paddle checkout and management

### Frontend (React)
- **paddleService**: Manages Paddle.js integration and checkout overlay
- **Updated Pricing Page**: Uses Paddle checkout instead of Stripe
- **Error Handling**: Proper feedback for payment success/failure

### Database Changes
New fields added to `users` table:
- `paddle_subscription_id`: Links to Paddle subscription
- `paddle_plan_id`: Current Paddle plan identifier  
- `paddle_checkout_id`: Checkout session reference

## 🔧 Key Files Changed

### Backend
- `app/services/paddle_service.py` - 🆕 Paddle integration service
- `app/api/subscriptions.py` - Updated with Paddle endpoints
- `app/models/user.py` - Added Paddle fields
- `app/core/config.py` - Added Paddle configuration
- `requirements.txt` - Added paddle-billing dependency

### Frontend  
- `src/services/paddleService.js` - 🆕 Paddle frontend service
- `src/pages/Pricing.js` - Updated to use Paddle checkout
- `.env.example` - Added Paddle environment variables

## 🧪 Testing

Run the integration test to verify your setup:

```bash
cd backend
python test_paddle_integration.py
```

This will check:
- ✅ Paddle configuration
- ✅ Service initialization  
- ✅ API endpoints
- ✅ Database models

## 🌍 API Endpoints

### New Paddle Endpoints
- `POST /api/subscriptions/paddle/checkout` - Create checkout session
- `POST /api/subscriptions/paddle/webhook` - Handle Paddle webhooks
- `POST /api/subscriptions/paddle/cancel` - Cancel subscription

### Existing Endpoints (Updated)
- `GET /api/subscriptions/current` - Now uses Paddle service
- `GET /api/subscriptions/plans` - Returns available plans

## 🔒 Security & Production

### Environment Variables
Keep these secure and never commit to version control:
- `PADDLE_VENDOR_ID`
- `PADDLE_AUTH_CODE`  
- `PADDLE_PUBLIC_KEY`

### Webhook Security
- Webhooks are verified using Paddle's signature verification
- Use HTTPS for webhook endpoints in production
- Monitor webhook delivery in Paddle dashboard

### Going Live
1. Switch `PADDLE_ENVIRONMENT=live` 
2. Update `PADDLE_API_URL` to production URL
3. Update webhook URLs in Paddle dashboard
4. Test thoroughly with real payment methods

## 🐛 Troubleshooting

### Common Issues

**Paddle.js not loading?**
- Check `REACT_APP_PADDLE_VENDOR_ID` is set correctly
- Verify environment (sandbox vs live) matches your Paddle account

**Webhook not working?**
- Ensure webhook URL is accessible publicly
- Check webhook signature verification settings
- Look at Paddle dashboard for webhook delivery logs

**Product ID errors?**
- Verify product IDs in code match exactly with Paddle dashboard
- Check both backend mapping and frontend service

### Debug Mode
Enable detailed logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📊 Migration from Stripe

If you're migrating from Stripe:

1. **Parallel Operation**: Keep Stripe code until migration is complete
2. **Data Migration**: Export customer data from Stripe, import to Paddle
3. **Webhook Update**: Switch webhook URLs when ready  
4. **Customer Communication**: Notify customers about the change
5. **Clean Up**: Remove Stripe code and credentials after successful migration

Legacy Stripe code is marked and will be removed in future versions.

## 🎯 Features Supported

- ✅ **Subscription Creation**: Basic and Pro plans
- ✅ **Payment Processing**: Secure card processing via Paddle
- ✅ **Webhook Handling**: Real-time subscription updates  
- ✅ **Subscription Management**: Upgrade, downgrade, cancel
- ✅ **Usage Limits**: Plan-based feature restrictions
- ✅ **Overlay Checkout**: Smooth checkout without page redirects

## 📚 Resources

- [Paddle Developer Docs](https://developer.paddle.com)
- [Paddle Dashboard](https://vendors.paddle.com)
- [Paddle.js Documentation](https://developer.paddle.com/paddlejs/overview)

## 💬 Support

For Paddle-specific issues:
1. Check [PADDLE_SETUP.md](./PADDLE_SETUP.md) 
2. Run `python test_paddle_integration.py`
3. Check Paddle dashboard for webhook/payment logs
4. Contact Paddle support through their dashboard

---

🎉 **Ready to accept payments with Paddle!** Follow the setup guide to get started.
