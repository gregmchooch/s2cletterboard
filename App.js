import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import * as SplashScreen from 'expo-splash-screen';
import StencilBoard from './src/components/StencilBoard';
import ControlPanel from './src/components/ControlPanel';

// Must match the entitlement identifier configured in the RevenueCat dashboard
const PREMIUM_ENTITLEMENT_ID = 'alphaclick_premium';

// Exact product identifiers for each donation amount, as configured in
// App Store Connect / RevenueCat. Used for direct lookup (no pattern matching).
const DONATION_PRODUCT_IDS = {
  5: 'alphaclick_donation_5_consummable',
  10: 'alphaclick_donation_10_consummable',
  20: 'alphaclick_donation_20_consummable',
  100: 'alphaclick_donation_100_consummable',
};

// Keep the native splash screen visible until we explicitly hide it below
SplashScreen.preventAutoHideAsync().catch(() => {});

// Extra time (ms) to keep the splash screen visible after the app is ready,
// so it doesn't disappear too quickly.
const SPLASH_EXTRA_DELAY = 1000;

const App = () => {
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [wordHistory, setWordHistory] = useState([]);
  const [letterColor, setLetterColor] = useState('#FFD700');
  const [isPremium, setIsPremium] = useState(false);

  // Load history and premium status on app start
  useEffect(() => {
    const prepare = async () => {
      await Promise.all([
        initializeRevenueCat(),
        loadHistory(),
        loadPremiumStatus(),
      ]);

      // Keep splash screen up a little longer so it doesn't flash away too fast
      setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, SPLASH_EXTRA_DELAY);
    };

    prepare();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      // Configure RevenueCat with your API key
      // Production Public API Key
      await Purchases.configure({
        apiKey: 'appl_EhoaGGnZsBrDCiWmyTUAvEdEkbg',
      });
    } catch (error) {
      console.log('Error initializing RevenueCat:', error);
    }
  };

  const loadPremiumStatus = async () => {
    try {
      const premiumStored = await AsyncStorage.getItem('premiumStatus');
      if (premiumStored === 'true') {
        setIsPremium(true);
      }
    } catch (error) {
      console.log('Error loading premium status:', error);
    }
  };

  const savePremiumStatus = async (isPremiumUser) => {
    try {
      await AsyncStorage.setItem('premiumStatus', isPremiumUser ? 'true' : 'false');
    } catch (error) {
      console.log('Error saving premium status:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('wordHistory');
      const colorStored = await AsyncStorage.getItem('letterColor');

      if (stored) {
        const parsed = JSON.parse(stored);
        setWordHistory(parsed);
      }

      if (colorStored) {
        setLetterColor(colorStored);
      }
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  const saveHistory = async (history) => {
    try {
      await AsyncStorage.setItem('wordHistory', JSON.stringify(history));
    } catch (error) {
      console.log('Error saving history:', error);
    }
  };

  const saveLetterColor = async (color) => {
    try {
      await AsyncStorage.setItem('letterColor', color);
    } catch (error) {
      console.log('Error saving color:', error);
    }
  };

  const handleLetterSelected = (letter) => {
    setSelectedLetters((prevLetters) => [...prevLetters, letter]);
  };

  const handleRemoveLetter = (index) => {
    setSelectedLetters((prevLetters) => prevLetters.filter((_, i) => i !== index));
  };

  const handleStoreWord = () => {
    const word = selectedLetters.join('');
    if (word.trim().length > 0) {
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      const updatedHistory = [...wordHistory];
      const todayIndex = updatedHistory.findIndex((entry) => entry.date === dateStr);

      if (todayIndex >= 0) {
        // Add to existing day
        updatedHistory[todayIndex].words.unshift(word);
      } else {
        // Create new day entry
        updatedHistory.unshift({
          date: dateStr,
          words: [word],
        });
      }

      setWordHistory(updatedHistory);
      saveHistory(updatedHistory);
      setSelectedLetters([]);
    }
  };

  const handleDeleteWord = (dateIndex, wordIndex) => {
    const updatedHistory = [...wordHistory];
    updatedHistory[dateIndex].words.splice(wordIndex, 1);

    // Remove date entry if no words left
    if (updatedHistory[dateIndex].words.length === 0) {
      updatedHistory.splice(dateIndex, 1);
    }

    setWordHistory(updatedHistory);
    saveHistory(updatedHistory);
  };

  const handleLetterColorChange = (color) => {
    setLetterColor(color);
    saveLetterColor(color);
  };

  const handlePremiumPurchase = async (amount) => {
    try {
      const productId = DONATION_PRODUCT_IDS[amount];
      if (!productId) {
        console.log('[Donate] No product ID configured for amount:', amount);
        Alert.alert('Unavailable', 'This donation option is not available.');
        return;
      }

      const offerings = await Purchases.getOfferings();
      console.log('[Donate] Offerings fetched:', JSON.stringify({
        current: offerings.current?.identifier,
        packageCount: offerings.current?.availablePackages?.length,
      }));

      if (offerings.current === null || offerings.current.availablePackages.length === 0) {
        console.log('[Donate] No current offering / packages available.');
        Alert.alert('Unavailable', 'Donation options are not available right now. Please try again later.');
        return;
      }

      const availablePackages = offerings.current.availablePackages;
      console.log('[Donate] Available packages:', availablePackages.map((p) => ({
        identifier: p.identifier,
        productId: p.product?.identifier,
        price: p.product?.priceString,
      })));

      // Exact match on the product identifier configured for this donation amount
      const pkg = availablePackages.find((p) => p.product?.identifier === productId);

      if (!pkg) {
        console.log('[Donate] No package found for product ID:', productId);
        Alert.alert('Unavailable', 'This donation option is not available right now. Please try again later.');
        return;
      }

      console.log('[Donate] Selected package for amount', amount, ':', pkg.identifier, pkg.product?.identifier, pkg.product?.priceString);

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      console.log('[Donate] Purchase completed. Active entitlements:', Object.keys(customerInfo.entitlements.active));

      // Confirm your specific entitlement identifier matches your dashboard tag
      if (customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined) {
        setIsPremium(true);
        savePremiumStatus(true);
        Alert.alert('Thank You!', 'Thank you for your generous donation!');
      } else {
        console.log('[Donate] Entitlement', PREMIUM_ENTITLEMENT_ID, 'not found in active entitlements after purchase.');
      }
    } catch (error) {
      console.log('[Donate] Purchase error:', JSON.stringify(error));
      if (!error.userCancelled) {
        Alert.alert('Transaction Failed', error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.boardContainer}>
        <StencilBoard 
          onLetterSelected={handleLetterSelected}
          letterColor={letterColor}
        />
      </View>

      <ControlPanel
        selectedLetters={selectedLetters}
        wordHistory={wordHistory}
        onRemoveLast={handleRemoveLetter}
        onStoreWord={handleStoreWord}
        onDeleteWord={handleDeleteWord}
        letterColor={letterColor}
        onLetterColorChange={handleLetterColorChange}
        isPremium={isPremium}
        onPremiumPurchase={handlePremiumPurchase}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
});

export default App;
