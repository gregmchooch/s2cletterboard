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
      const offerings = await Purchases.getOfferings();

      if (offerings.current === null || offerings.current.availablePackages.length === 0) {
        Alert.alert('Unavailable', 'Donation options are not available right now. Please try again later.');
        return;
      }

      const availablePackages = offerings.current.availablePackages;

      // Match the package configured for this specific donation amount.
      // Uses a whole-number boundary check (via regex) so "10" never matches
      // inside "100" (a plain substring "includes" check would incorrectly
      // match "donate_100" when looking for "_10").
      const amountPattern = new RegExp(`(^|[^0-9])${amount}([^0-9]|$)`);
      const pkg =
        availablePackages.find((p) =>
          amountPattern.test(p.identifier.toLowerCase()) ||
          amountPattern.test(p.product?.identifier?.toLowerCase() ?? '')
        ) || availablePackages[0];

      const { customerInfo } = await Purchases.purchasePackage(pkg);

      // Confirm your specific entitlement identifier matches your dashboard tag
      if (customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined) {
        setIsPremium(true);
        savePremiumStatus(true);
        Alert.alert('Thank You!', 'Thank you for your generous donation!');
      }
    } catch (error) {
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
