import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StencilBoard from './src/components/StencilBoard';
import ControlPanel from './src/components/ControlPanel';

const App = () => {
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [wordHistory, setWordHistory] = useState([]);
  const [letterColor, setLetterColor] = useState('#FFD700');

  // Load history on app start
  useEffect(() => {
    loadHistory();
  }, []);

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
