import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import StencilBoard from './src/components/StencilBoard';
import ControlPanel from './src/components/ControlPanel';

const App = () => {
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [wordHistory, setWordHistory] = useState([]);
  const [letterColor, setLetterColor] = useState('#FFD700');
  const [isPremium, setIsPremium] = useState(false);

  // Load history and premium status on app start
  useEffect(() => {
    initializeRevenueCat();
    loadHistory();
    loadPremiumStatus();
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

  const handleStoreWord = (onShowAlert) => {
    const word = selectedLetters.join('');
    if (word.trim().length > 0) {
      // Check if user is premium
      if (!isPremium) {
        // Show alert and clear input
        if (onShowAlert) {
          onShowAlert('Storing history can only be done when the application is in Premium mode.');
        }
        setSelectedLetters([]);
        return;
      }

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

  const handlePremiumPurchase = async () => {
    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current !== null && offerings.current.availablePackages.length > 0) {
        // Get the monthly subscription package
        const package_ = offerings.current.availablePackages[0];

        console.log('Attempting purchase of package:', package_.identifier);

        const { customerInfo } = await Purchases.purchasePackage(package_);

        // Check if purchase was successful by looking at active entitlements
        const entitlements = customerInfo.entitlements.active;

        console.log('Active entitlements:', Object.keys(entitlements));

        // Check for any active entitlement (could be 'premium' or other names)
        if (Object.keys(entitlements).length > 0) {
          setIsPremium(true);
          savePremiumStatus(true);
          console.log('Premium access granted!');
        }
      } else {
        console.log('No packages available for purchase');
      }
    } catch (error) {
      console.log('Error processing premium purchase:', error);
      // User cancelled purchase is a normal flow, not an error
      if (error.code !== 'PURCHASE_CANCELLED') {
        console.log('Purchase error details:', error);
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
