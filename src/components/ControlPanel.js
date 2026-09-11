import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';

const ControlPanel = ({
  selectedLetters,
  wordHistory,
  onRemoveLast,
  onStoreWord,
  onDeleteWord,
  letterColor,
  onLetterColorChange,
  isPremium,
  onPremiumPurchase,
}) => {
  const [historyVisible, setHistoryVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const [highlightTimer, setHighlightTimer] = useState(null);
  const word = selectedLetters.join('');

  const AVAILABLE_COLORS = [
    { hex: '#FFD700', name: 'Gold (Default)' },
    { hex: '#FF0000', name: 'Red' },
    { hex: '#00FF00', name: 'Green' },
    { hex: '#0000FF', name: 'Blue' },
    { hex: '#FF1493', name: 'Pink' },
    { hex: '#4ECDC4', name: 'Teal' },
    { hex: '#DFE6E9', name: 'Grey' },
    { hex: '#FFFFFF', name: 'White' },
  ];

  // Auto-highlight new letter and auto-unhighlight after 10 seconds
  useEffect(() => {
    if (selectedLetters.length > 0) {
      // Always highlight the last letter when a new one is added
      setHighlightedIndex(selectedLetters.length - 1);

      // Clear existing timer
      if (highlightTimer) clearTimeout(highlightTimer);

      // Set new timer to auto-unhighlight
      const timer = setTimeout(() => {
        setHighlightedIndex(null);
      }, 10000);

      setHighlightTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [selectedLetters.length]); // Only depend on length change

  const handleLetterPress = (index) => {
    if (highlightedIndex === index) {
      // Delete this letter if it's highlighted
      onRemoveLast(index);
      setHighlightedIndex(null);
    } else {
      // Highlight this letter
      setHighlightedIndex(index);

      // Clear existing timer and set new one
      if (highlightTimer) clearTimeout(highlightTimer);
      const timer = setTimeout(() => {
        setHighlightedIndex(null);
      }, 10000);
      setHighlightTimer(timer);
    }
  };

  const handleSettingsOpen = () => {
    setHistoryVisible(false);
    setSettingsVisible(true);
  };

  const handleDonateOpen = () => {
    setHistoryVisible(false);
    setPremiumModalVisible(true);
  };

  // Debug: Log character codes for special symbols
  React.useEffect(() => {
    console.log('Special Characters Debug:');
    console.log('Delete X: charCode =', '?'.charCodeAt(0), 'codePoint =', '?'.codePointAt(0).toString(16));
    console.log('Checkmark: charCode =', '?'.charCodeAt(0), 'codePoint =', '?'.codePointAt(0).toString(16));
  }, []);

  return (
    <>
      {/* SPELLED WORD INPUT & BUTTONS ROW */}
      <View style={styles.bottomContainer}>
        <View style={styles.spelledContainer}>
          <View style={[styles.spelledBox, { borderColor: letterColor }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lettersScroll}>
                <View style={styles.lettersContainer}>
                  {selectedLetters.length === 0 ? (
                    <Text style={[styles.placeholderText, { color: letterColor }]}>—</Text>
                  ) : (
                    selectedLetters.map((letter, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.letterBubble,
                          highlightedIndex === index && styles.letterBubbleHighlighted,
                          { borderColor: letterColor },
                          highlightedIndex === index && { backgroundColor: letterColor },
                        ]}
                        onPress={() => handleLetterPress(index)}
                      >
                        <Text style={[
                          styles.bubbleLetter, 
                          { color: letterColor },
                          highlightedIndex === index && { color: '#1a1a1a' }
                        ]}>
                          {letter}
                        </Text>
                        {highlightedIndex === index && (
                          <View style={styles.deleteX}>
                            <Text style={styles.deleteXText}>{String.fromCharCode(0x2715)}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>

          {/* STORE BUTTON */}
          <TouchableOpacity
            style={[
              styles.storeButton,
              selectedLetters.length === 0 && styles.storeButtonDisabled,
              { backgroundColor: letterColor },
            ]}
            onPress={() => onStoreWord()}
            disabled={selectedLetters.length === 0}
          >
            <Text style={styles.storeButtonText}>Store</Text>
          </TouchableOpacity>

          {/* HISTORY BUTTON */}
          <TouchableOpacity
            style={[styles.historyButton, { backgroundColor: letterColor }]}
            onPress={() => setHistoryVisible(true)}
          >
            <Text style={styles.historyButtonText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* HISTORY/SETTINGS MODAL */}
      <Modal
        visible={historyVisible}
        transparent={true}
        animationType="slide"
        supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* CLOSE BUTTON */}
            <View style={[styles.modalHeader, { borderBottomColor: letterColor }]}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setHistoryVisible(false)}
              >
                <Text style={[styles.closeButtonText, { color: letterColor }]}>{String.fromCharCode(0x2715)}</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: letterColor }]}>Word History</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.settingsLink}
                  onPress={handleSettingsOpen}
                >
                  <Text style={[styles.settingsLinkText, { color: letterColor }]}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.settingsLink}
                  onPress={handleDonateOpen}
                >
                  <Text style={[styles.settingsLinkText, { color: letterColor }]}>Donate</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* HISTORY LIST */}
            <ScrollView style={styles.historyList}>
              {wordHistory.length === 0 ? (
                <View style={styles.emptyHistoryContainer}>
                  <Text style={[styles.emptyHistoryText, { color: letterColor }]}>No words stored yet</Text>
                </View>
              ) : (
                <View>
                  {wordHistory.map((entry, dateIndex) => (
                    <View key={dateIndex} style={[styles.historyEntry, { borderLeftColor: letterColor }]}>
                      <View style={styles.historyDateRow}>
                        <Text style={[styles.historyDate, { color: letterColor }]}>{entry.date}</Text>
                      </View>
                      {entry.words.map((word, wordIndex) => (
                        <View key={wordIndex} style={styles.historyWordRow}>
                          <Text style={[styles.historyWord, { color: letterColor }]}>{word}</Text>
                          <TouchableOpacity
                            onPress={() => onDeleteWord(dateIndex, wordIndex)}
                          >
                            <Text style={styles.historyDeleteBtn}>{String.fromCharCode(0x2715)}</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* SETTINGS MODAL */}
      <Modal
        visible={settingsVisible}
        transparent={true}
        animationType="fade"
        supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.settingsOverlay}>
          <View style={styles.settingsContainer}>
            <View style={[styles.settingsHeader, { borderBottomColor: letterColor }]}>
              <TouchableOpacity
                onPress={() => {
                  setSettingsVisible(false);
                }}
              >
                <Text style={[styles.closeButtonText, { color: letterColor }]}>{String.fromCharCode(0x2715)}</Text>
              </TouchableOpacity>
              <Text style={[styles.settingsTitle, { color: letterColor }]}>Letterboard Colour</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.colorGrid}>
              {/* Current color display */}
              <View style={[styles.currentColorDisplay, { borderColor: letterColor }]}>
                <View style={[styles.currentColorBox, { backgroundColor: letterColor }]} />
                <Text style={[styles.currentColorText, { color: letterColor }]}>
                  {AVAILABLE_COLORS.find(c => c.hex === letterColor)?.name || 'Custom'}
                </Text>
              </View>

              {/* Color options as dropdown list */}
              <View style={styles.colorDropdown}>
                {AVAILABLE_COLORS.map((colorOption) => (
                  <TouchableOpacity
                    key={colorOption.hex}
                    style={[
                      styles.colorDropdownOption,
                      { borderBottomColor: letterColor },
                      letterColor === colorOption.hex && { backgroundColor: colorOption.hex + '20' },
                    ]}
                    onPress={() => {
                      onLetterColorChange(colorOption.hex);
                      setSettingsVisible(false);
                    }}
                  >
                    <View style={[styles.colorDropdownBox, { backgroundColor: colorOption.hex }]} />
                    <Text style={[styles.colorDropdownText, { color: letterColor }]}>
                      {colorOption.name}
                    </Text>
                    {letterColor === colorOption.hex && (
                      <Text style={[styles.colorDropdownCheckmark, { color: letterColor }]}>{String.fromCharCode(0x2713)}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PREMIUM MODAL */}
      <Modal
        visible={premiumModalVisible}
        transparent={true}
        animationType="fade"
        supportedOrientations={['landscape', 'landscape-left', 'landscape-right']}
        onRequestClose={() => setPremiumModalVisible(false)}
      >
        <View style={styles.premiumOverlay}>
          <View style={styles.premiumContainer}>
            <TouchableOpacity
              style={styles.premiumCloseButton}
              onPress={() => setPremiumModalVisible(false)}
            >
              <Text style={[styles.premiumCloseText, { color: letterColor }]}>{String.fromCharCode(0x2715)}</Text>
            </TouchableOpacity>

            <Text style={[styles.premiumTitle, { color: letterColor }]}>Support AlphaClick</Text>

            <ScrollView style={styles.premiumContent}>
              <Text style={[styles.premiumMessage, { color: letterColor }]}>
                This application is free for use however should you want to show your appreciation for the developer's effort you can donate a small contribution of your thanks.
              </Text>
            </ScrollView>

            <View style={styles.donateAmountRow}>
              {[5, 10, 20, 100].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[styles.donateAmountButton, { backgroundColor: letterColor }]}
                  onPress={async () => {
                    await onPremiumPurchase(amount);
                    setPremiumModalVisible(false);
                  }}
                >
                  <Text style={styles.donateAmountText}>${amount}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.donateCancelButton}
              onPress={() => setPremiumModalVisible(false)}
            >
              <Text style={[styles.donateCancelText, { color: letterColor }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    backgroundColor: '#1a1a1a',
  },
  spelledContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    gap: 8,
    alignItems: 'center',
  },
  spelledBox: {
    flex: 1,
    height: 50,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  lettersScroll: {
    height: '100%',
  },
  lettersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  letterBubble: {
    backgroundColor: '#444',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterBubbleHighlighted: {
    borderColor: '#fff',
  },
  bubbleLetter: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  deleteX: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteXText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  storeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    minWidth: 60,
  },
  storeButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.5,
  },
  storeButtonText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
    fontSize: 14,
  },
  historyButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  historyButtonText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingTop: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsLink: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsLinkText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  historyList: {
    flex: 1,
    padding: 15,
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistoryText: {
    color: '#FFD700',
    fontSize: 16,
    fontStyle: 'italic',
  },
  historyEntry: {
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
    paddingLeft: 15,
  },
  historyDateRow: {
    marginBottom: 10,
  },
  historyDate: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyWordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  historyWord: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyDeleteBtn: {
    color: '#FF5252',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  settingsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  settingsTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
  },
  colorGrid: {
    padding: 20,
  },
  currentColorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  currentColorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  currentColorText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorDropdown: {
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
  },
  colorDropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  colorDropdownBox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  colorDropdownText: {
    flex: 1,
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  colorDropdownCheckmark: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
  },
  colorOption: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#444',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  colorCheckmark: {
    color: '#1a1a1a',
    fontSize: 28,
    fontWeight: 'bold',
  },
  premiumOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  premiumContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
    width: '100%',
  },
  premiumCloseButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  premiumCloseText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  premiumContent: {
    marginBottom: 20,
  },
  premiumMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  premiumDonateButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumDonateText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  donateAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 15,
  },
  donateAmountButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donateAmountText: {
    color: '#1a1a1a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  donateCancelButton: {
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#666',
  },
  donateCancelText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ControlPanel;
