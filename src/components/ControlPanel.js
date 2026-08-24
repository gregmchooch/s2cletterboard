import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';

const ControlPanel = ({
  selectedLetters,
  wordHistory,
  historyExpanded,
  onRemoveLast,
  onStoreWord,
  onDeleteWord,
  onToggleHistory,
}) => {
  const word = selectedLetters.join('');

  return (
    <>
      <View style={styles.container}>
        {/* SPELLED WORD PANEL */}
        <View style={styles.controlPanel}>
          <Text style={styles.label}>SPELLED</Text>
          <View style={styles.contentBox}>
            <Text style={styles.wordDisplay}>{word || '—'}</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.removeButton, selectedLetters.length === 0 && styles.disabled]}
              onPress={onRemoveLast}
              disabled={selectedLetters.length === 0}
            >
              <Text style={styles.buttonText}>? Remove Letter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, selectedLetters.length === 0 && styles.disabled]}
              onPress={onStoreWord}
              disabled={selectedLetters.length === 0}
            >
              <Text style={styles.buttonText}>? Store Word</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WORD HISTORY PANEL */}
        <View style={styles.controlPanel}>
          <Text style={styles.label}>WORD HISTORY</Text>
          <TouchableOpacity
            style={styles.contentBox}
            onPress={onToggleHistory}
            activeOpacity={0.7}
          >
            {wordHistory.length === 0 ? (
              <Text style={styles.emptyText}>No words stored yet</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.historyScroll}>
                <View style={styles.historyItemsContainer}>
                  {wordHistory.map((word, index) => (
                    <View key={`${word}-${index}`} style={styles.historyBubble}>
                      <Text style={styles.historyWord}>{word}</Text>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => onDeleteWord(index)}
                      >
                        <Text style={styles.deleteBtnText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* HISTORY MODAL */}
      <Modal
        visible={historyExpanded}
        transparent={true}
        animationType="fade"
        onRequestClose={onToggleHistory}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={onToggleHistory}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Word History</Text>

            {wordHistory.length === 0 ? (
              <Text style={styles.modalEmptyText}>No words stored yet</Text>
            ) : (
              <ScrollView style={styles.historyList}>
                {wordHistory.map((word, index) => (
                  <View key={`${word}-${index}`} style={styles.historyEntry}>
                    <Text style={styles.historyEntryWord}>{word}</Text>
                    <TouchableOpacity
                      style={styles.historyEntryDeleteBtn}
                      onPress={() => onDeleteWord(index)}
                    >
                      <Text style={styles.historyEntryDeleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderTopWidth: 0,
    padding: 15,
    gap: 15,
    flex: 0,
    minHeight: 220,
  },
  controlPanel: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 10,
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  contentBox: {
    backgroundColor: '#333',
    borderWidth: 3,
    borderColor: '#FFD700',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  wordDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  historyScroll: {
    flexGrow: 1,
  },
  historyItemsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 8,
    alignItems: 'center',
  },
  historyBubble: {
    backgroundColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyWord: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 2,
  },
  deleteBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#FF9800',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#333',
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    maxHeight: '90%',
  },
  modalClose: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalCloseText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  historyList: {
    gap: 12,
  },
  historyEntry: {
    backgroundColor: '#444',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyEntryWord: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    letterSpacing: 3,
    flex: 1,
  },
  historyEntryDeleteBtn: {
    backgroundColor: '#FF5252',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  historyEntryDeleteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalEmptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 30,
  },
});

export default ControlPanel;
