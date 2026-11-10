import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import StencilBoard from './src/components/StencilBoard';
import ControlPanel from './src/components/ControlPanel';

// Safely evaluate a basic math expression (e.g. "5+3", "10*2", "100/4-5")
const evaluateMathExpression = (expr) => {
  try {
    // Normalize operators: replace 'X', 'x', multiplication and division symbols with '*' and '/'
    const sanitized = expr
      .replace(/X/gi, '*')
      .replace(/\u00D7/g, '*')
      .replace(/\u00F7/g, '/')
      .replace(/\s+/g, '');

    // Allow only digits, decimal points, and standard arithmetic operators
    if (!/^[\d\.\+\-\*\/]+$/.test(sanitized)) return null;

    // Must have at least one operator and at least one digit
    if (!/[\+\-\*\/]/.test(sanitized) || !/\d/.test(sanitized)) return null;

    // Cannot end with an operator (e.g. "5+")
    if (/[\+\-\*\/]$/.test(sanitized)) return null;

    // Evaluate safely
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${sanitized})`)();

    if (typeof result !== 'number' || !isFinite(result)) return null;

    // Round up to 4 decimal places to prevent floating point inaccuracies like 0.1 + 0.2
    const rounded = Math.round(result * 10000) / 10000;
    return String(rounded);
  } catch {
    return null;
  }
};

const App = () => {
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [wordHistory, setWordHistory] = useState([]);
  const [letterColor, setLetterColor] = useState('#FFD700');
  const [isPremium, setIsPremium] = useState(false);
  const [boardMode, setBoardMode] = useState('letters'); // 'letters' | 'numbers'

  const handleToggleBoardMode = () => {
    setBoardMode((prev) => (prev === 'letters' ? 'numbers' : 'letters'));
  };

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
    if (letter === '=') {
      setSelectedLetters((prevLetters) => {
        // Find expression after the last '=' if any, or whole string
        const lastEqualIdx = prevLetters.lastIndexOf('=');
        const exprTokens = lastEqualIdx >= 0 ? prevLetters.slice(lastEqualIdx + 1) : prevLetters;
        const exprStr = exprTokens.join('');

        const calculation = evaluateMathExpression(exprStr);
        if (calculation !== null) {
          // Append '=' followed by the calculated result characters
          return [...prevLetters, '=', ...calculation.split('')];
        }
        return [...prevLetters, '='];
      });
      return;
    }

    setSelectedLetters((prevLetters) => [...prevLetters, letter]);
  };

  const handleRemoveLetter = (index) => {
    setSelectedLetters((prevLetters) => prevLetters.filter((_, i) => i !== index));
  };

  const handleClearLetters = () => {
    setSelectedLetters([]);
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
          boardMode={boardMode}
        />
      </View>

      <ControlPanel
        selectedLetters={selectedLetters}
        wordHistory={wordHistory}
        onRemoveLast={handleRemoveLetter}
        onClearLetters={handleClearLetters}
        onStoreWord={handleStoreWord}
        onDeleteWord={handleDeleteWord}
        letterColor={letterColor}
        onLetterColorChange={handleLetterColorChange}
        isPremium={isPremium}
        onPremiumPurchase={handlePremiumPurchase}
        boardMode={boardMode}
        onToggleBoardMode={handleToggleBoardMode}
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
