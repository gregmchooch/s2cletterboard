import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import StencilBoard from './components/StencilBoard';
import ControlPanel from './components/ControlPanel';

const App = () => {
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [wordHistory, setWordHistory] = useState([]);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const handleLetterSelected = (letter) => {
    setSelectedLetters([...selectedLetters, letter]);
  };

  const handleRemoveLast = () => {
    if (selectedLetters.length > 0) {
      setSelectedLetters(selectedLetters.slice(0, -1));
    }
  };

  const handleStoreWord = () => {
    const word = selectedLetters.join('');
    if (word.trim().length > 0) {
      setWordHistory([word, ...wordHistory]);
      setSelectedLetters([]);
    }
  };

  const handleDeleteWord = (index) => {
    setWordHistory(wordHistory.filter((_, i) => i !== index));
  };

  const handleToggleHistory = () => {
    setHistoryExpanded(!historyExpanded);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.boardContainer}>
        <StencilBoard onLetterSelected={handleLetterSelected} />
      </View>

      <ControlPanel
        selectedLetters={selectedLetters}
        wordHistory={wordHistory}
        historyExpanded={historyExpanded}
        onRemoveLast={handleRemoveLast}
        onStoreWord={handleStoreWord}
        onDeleteWord={handleDeleteWord}
        onToggleHistory={handleToggleHistory}
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
