# RevenueCat Production Setup Guide

## Overview
This guide walks you through setting up RevenueCat for production testing and release on iOS App Store and Google Play Store.

## Step 1: Get Your Production API Keys from RevenueCat

### In RevenueCat Dashboard:
1. Go to **Project Settings**
2. Look for **API Keys** section
3. You'll see:
   - **Test Store API Key** (used for development/sandbox testing)
   - **Public API Key** (used for production)
4. Copy your **Public API Key** (this is what you need for production)

**Your production key typically looks like:** `appl_xxxxxxxxxxxxxxxxxxxxxxxx`

## Step 2: Set Up iOS App Store

### 2a. Create App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Sign in with your Apple Developer account
3. Click **My Apps** ? **+** to create new app
4. Fill in:
   - **Platform**: iOS
   - **App Name**: AlphaClick
   - **Bundle ID**: `com.gregmchooch.alphaclick` (must match your app)
   - **SKU**: Any unique identifier (e.g., `alphaclick-001`)

### 2b. Create In-App Purchase Product
1. In App Store Connect, go to your app ? **In-App Purchases**
2. Click **+** to add new product
3. Select **Non-Consumable** (for one-time purchase)
4. Fill in:
   - **Reference Name**: AlphaClick Premium
   - **Product ID**: `com.gregmchooch.alphaclick.premium` (this is KEY)
   - **Price Tier**: Select $4.99 USD
   - **Localization**: Add English description of premium features

5. Fill in metadata:
   - **Display Name**: AlphaClick Premium
   - **Description**: Unlock Stored History and Customizations

6. Save and submit for review (required before linking to RevenueCat)

### 2c. Get App Store Shared Secret
1. In App Store Connect ? **App Information**
2. Scroll to **App-Specific Shared Secret**
3. Copy this secret (you'll need it for RevenueCat)

### 2d. Get Your App's Bundle Identifier
- Should be: `com.gregmchooch.alphaclick`
- Located in Xcode build settings if you're building locally

## Step 3: Set Up Google Play Store

### 3a. Create App in Google Play Console
1. Go to https://play.google.com/console
2. Sign in with your Google account
3. Click **+ Create app**
4. Fill in:
   - **App name**: AlphaClick
   - **Default language**: English
   - **App type**: Application
   - **Category**: Education

### 3b. Complete App Setup
1. Fill out all required sections:
   - App details
   - App description
   - Graphics & images
   - Content rating questionnaire
   - Permissions

### 3c. Create In-App Product
1. Go to **Monetization setup** ? **In-app products**
2. Click **Create in-app product**
3. Fill in:
   - **Product ID**: `com.gregmchooch.alphaclick.premium` (MUST match iOS)
   - **Product name**: AlphaClick Premium
   - **Description**: Unlock Stored History and Customizations
   - **Price**: $4.99

4. Save and activate

### 3d. Generate Service Account Credentials
1. Go to **Setup** ? **API access**
2. Look for **Google Play Android Developer API** credentials
3. Create a **Service Account** JSON key file
4. Download and save this file (you'll upload it to RevenueCat)

### 3e. Grant Access
1. In **Users and permissions**, add your service account
2. Grant it **Financial data** and **Order management** permissions

## Step 4: Link to RevenueCat (Production)

### 4a. Configure iOS in RevenueCat
1. In RevenueCat dashboard, go to **Apps & Products**
2. Click your app ? **iOS**
3. Fill in:
   - **App ID**: Your App Store app ID (found in App Store Connect)
   - **Bundle ID**: `com.gregmchooch.alphaclick`
   - **App Store Shared Secret**: (from Step 2c)

4. Click **Add product** and enter:
   - **App Store Product ID**: `com.gregmchooch.alphaclick.premium`
   - Map to Entitlement: `premium`

### 4b. Configure Android in RevenueCat
1. In RevenueCat dashboard, go to **Apps & Products**
2. Click your app ? **Android**
3. Fill in:
   - **Package name**: `com.gregmchooch.alphaclick`
   - **Google Service Account JSON**: Upload the file from Step 3d

4. Click **Add product** and enter:
   - **Google Play Product ID**: `com.gregmchooch.alphaclick.premium`
   - Map to Entitlement: `premium`

### 4c. Create Entitlement
1. Go to **Entitlements**
2. Click **Create entitlement**
3. Fill in:
   - **Name**: `premium`
   - **Description**: Unlock premium features

4. Link both iOS and Android products to this entitlement

## Step 5: Update Your App Code

### Update App.js with Production API Key
```javascript
const initializeRevenueCat = async () => {
  try {
    await Purchases.configure({
      // Use your Production Public API Key from RevenueCat
      apiKey: 'appl_YOUR_PRODUCTION_API_KEY_HERE',
    });
  } catch (error) {
    console.log('Error initializing RevenueCat:', error);
  }
};
```

## Step 6: Build for Production

### iOS Production Build
```bash
cd FixedStencilApp
eas build --platform ios --auto-submit
```

**Requirements:**
- Apple Developer account ($99/year)
- Xcode setup
- Signing certificates
- Provisioning profiles

### Android Production Build
```bash
cd FixedStencilApp
eas build --platform android
```

**Requirements:**
- Google Play Developer account ($25 one-time)
- Android keystore file

## Step 7: Testing Production Builds

### TestFlight (iOS Testing)
1. Upload build to TestFlight
2. Add test users
3. Users install via TestFlight app
4. Real in-app purchases work (can be refunded later for testing)

### Internal Testing Track (Android Testing)
1. Upload build to internal testing track
2. Add test users
3. Users get download link
4. Real in-app purchases work in this track

## Step 8: Monitor RevenueCat

### Dashboard Checks
1. Go to RevenueCat **Dashboard**
2. Check:
   - **Active Subscribers**: Shows premium users
   - **Transactions**: All purchases and refunds
   - **Revenue**: Total earnings
   - **Churn**: Users who cancelled

### Debug Logs
```javascript
// Add to App.js for production debugging:
Purchases.setLogLevel('debug'); // Shows detailed RevenueCat logs in console
```

## Checklist Before Going Live

- [ ] iOS app created in App Store Connect
- [ ] iOS in-app product created and approved
- [ ] iOS shared secret obtained
- [ ] Android app created in Google Play Console
- [ ] Android in-app product created
- [ ] Google Play service account credentials generated
- [ ] RevenueCat linked to both iOS and Android
- [ ] Entitlement named `premium` created in RevenueCat
- [ ] App code updated with production API key
- [ ] TestFlight build created and tested
- [ ] Internal test build created for Android and tested
- [ ] App submitted to App Store
- [ ] App submitted to Google Play

## Production API Key Format

Your RevenueCat Production Public API Key will look like:
```
appl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Where to find it:**
- RevenueCat Dashboard ? Project Settings ? API Keys ? **Public API Key**

## Important Notes

### Security
- **Never commit real API keys to git** - use environment variables
- Production key is safe in client code (designed for mobile)
- Don't share your Shared Secrets with anyone

### Testing in Production
- **Real charges**: Test purchases will charge real money (can refund within 30 days)
- **TestFlight/Internal Testing**: Use these for testing before public release
- **Sandbox vs Production**: RevenueCat handles both automatically

### Going Live
1. Test thoroughly in TestFlight/Internal Testing
2. Monitor first 24 hours after launch
3. Check RevenueCat dashboard for purchase errors
4. Have customer support ready for billing questions

## Troubleshooting

### Purchases not working?
1. Check API key is correct
2. Verify product IDs match exactly (including case)
3. Check entitlements are linked properly
4. Look at RevenueCat debug logs

### Product not showing?
1. Verify product was created in app store
2. Check product status (should be "Active")
3. Wait 15-30 minutes for RevenueCat to sync

### Refund issues?
1. iOS: Refunds handled in App Store Connect
2. Android: Refunds handled in Google Play Console
3. RevenueCat automatically syncs refund status

## Support

- **RevenueCat Docs**: https://www.revenuecat.com/docs
- **App Store Connect Help**: https://help.apple.com/app-store-connect
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer

## Next Steps

1. Get your RevenueCat Production API Key (from Step 1)
2. Set up iOS in App Store Connect (Step 2)
3. Set up Android in Google Play Console (Step 3)
4. Link both to RevenueCat (Step 4)
5. Update your app code with production key (Step 5)
6. Build and test in TestFlight/Internal Testing (Step 6-7)
7. Submit to stores and go live!

