# RevenueCat Premium Setup Guide

## Overview
AlphaClick now includes a freemium model with RevenueCat integration. Free users can use the app but cannot access History or customize colors. Premium users get full functionality including stored word history and color customization.

## What was Added

### In-App Purchase
- **One-time purchase**: $4.99 USD
- **Label**: "Donate and Enable Premium Features"
- **Benefit**: Unlocks History and Settings (color customization)

### Premium State
- Premium status is persisted in AsyncStorage
- Free version shows "Premium" button instead of "History"
- Clicking "Premium" button shows donation modal
- After purchase, "Premium" changes to "History" and full features enabled

## Setting Up RevenueCat

### Step 1: Create RevenueCat Account
1. Go to https://www.revenuecat.com
2. Sign up for a free account
3. Create a new project (e.g., "AlphaClick")

### Step 2: Get Your Test Store API Key (for Testing)
1. In RevenueCat dashboard, go to **Project Settings**
2. Look for **Test Store API Key** (labeled "Sandbox/Test")
3. Copy this key
4. Update `FixedStencilApp/App.js` in the `initializeRevenueCat()` function:
   ```javascript
   await Purchases.configure({
     apiKey: 'YOUR_TEST_STORE_KEY_HERE',
   });
   ```

### Step 3: Get Your Production Public API Key (for Release)
1. In RevenueCat dashboard, go to **Project Settings**
2. Look for **Public API Key** (labeled "Production")
3. Copy this key
4. You'll use this when building the final release version

### Step 4: Configure Products (iOS and Android)

#### For iOS:
1. Go to Apple App Store Connect
2. Create your app
3. Set up an In-App Purchase with:
   - **Type**: Non-Consumable
   - **Product ID**: `com.gregmchooch.alphaclick.premium`
   - **Price**: $4.99
   - **Reference Name**: "AlphaClick Premium"
4. Create an **Entitlement** in RevenueCat:
   - **Name**: `premium`
   - Link it to your App Store product

#### For Android:
1. Go to Google Play Console
2. Create your app
3. Set up an In-App Product with:
   - **Product ID**: `com.gregmchooch.alphaclick.premium`
   - **Type**: One-time purchase
   - **Price**: $4.99
   - **Name**: "AlphaClick Premium"
4. Link it to RevenueCat entitlement `premium`

### Step 4: Link RevenueCat to App Stores
1. In RevenueCat Dashboard, go to **Apps & Products**
2. Add your iOS app credentials
3. Add your Android app credentials
4. RevenueCat will automatically sync products

### Step 5: Set Up Entitlements
1. In RevenueCat, create an entitlement named `premium`
2. Link all your products to this entitlement
3. This is what the app checks to determine premium status

## Testing

### Local Testing (Before Publishing)

**Using Test Store API Key:**
```bash
cd FixedStencilApp
# 1. Add your Test Store Key to App.js initializeRevenueCat()
# 2. Run:
npx expo start
# On iPad: scan QR code
# On Android: press 'a'
```

**What you'll see in Test Store Mode:**
- Test products available for purchase
- No real charges
- Perfect for validating the flow
- Premium status will update correctly
- Test purchases sync to RevenueCat dashboard

**Free users will see:**
- "Premium" button instead of "History"
- No Settings option in modals
- No color customization
- No stored word history (history still works but not saved)

**Premium users (after test purchase) will see:**
- "History" button
- "Settings" option in History modal
- Full color customization
- Persistent word history

### Switching to Production

**Before submitting to app stores:**
1. Replace Test Store Key with your **Public API Key** (Production)
2. Rebuild the app
3. Products must be created in actual App Store/Play Store (not Test Store)
4. Update to production API key before final build

### Testing Purchases with Test Products
- RevenueCat Test Store provides free test products
- No credit card needed for testing
- Purchases won't actually charge you
- Perfect for validating the entire flow

## Important Notes

### Security
- API key in code is fine for public (iOS/Android clients cannot make purchases without it)
- Consider environment-specific keys in production
- Always validate purchases on your backend in production

### Persistence
- Premium status is stored in AsyncStorage
- Even if user uninstalls/reinstalls, they retain premium status
- RevenueCat also tracks their entitlements on their servers

### Testing Restoration
- If testing and need to "restore" purchases, RevenueCat provides restoration methods
- Users can restore their purchases if they reinstall the app

## Troubleshooting

### Purchase not working?
1. Check API key is correct
2. Verify product is linked to entitlement in RevenueCat
3. Check console logs for specific errors
4. Ensure app is properly signed for the platform

### Premium status not persisting?
1. Check AsyncStorage has permission
2. Verify `savePremiumStatus()` is being called
3. Clear app data and try again

### Products not showing?
1. Verify products created in App Store/Play Store
2. Check they're linked in RevenueCat
3. Refresh offerings after configuring

## Next Steps
1. Set up RevenueCat account
2. Create products in App Store and Play Store
3. Link to RevenueCat
4. Test locally with sandbox
5. Build and deploy to TestFlight/Internal Testing
6. Go live!

