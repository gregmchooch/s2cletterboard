import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';

const StencilBoard = ({ onLetterSelected, letterColor = '#FFD700' }) => {
  const [magnifierPos, setMagnifierPos] = useState(null);
  const [magnifiedLetters, setMagnifiedLetters] = useState(new Set());
  const boardRef = useRef(null);

  // Detect iPhone vs iPad (landscape) based on the shorter screen dimension
  const screenMinDimension = Math.min(
    Dimensions.get('window').width,
    Dimensions.get('window').height
  );
  const isPhone = Platform.OS !== 'web' && screenMinDimension < 600;

  // Constants for layout
  const MAGNIFY_RADIUS = isPhone ? 40 : 80;
  const MAGNIFY_SCALE = isPhone ? 1.6 : 2.0;
  const BOARD_PADDING = 6;
  const BOARD_PADDING_BOTTOM = 20;
  const GRID_GAP = 4;
  const COLUMNS = 5;
  const ROWS = 5;
  const SPACE_BAR_WIDTH = 45;

  // Letters A-Z: 5 columns for rows 1-5, plus column 6 with space bar (rows 1-3) and Z (row 5)
  const LETTERS = [
    ['A', 'B', 'C', 'D', 'E', ' '],    // Row 1: space bar placeholder
    ['F', 'G', 'H', 'I', 'J', ' '],    // Row 2: space bar placeholder
    ['K', 'L', 'M', 'N', 'O', ' '],    // Row 3: space bar placeholder
    ['P', 'Q', 'R', 'S', 'T', ' '],    // Row 4: space bar placeholder
    ['U', 'V', 'W', 'X', 'Y', 'Z'],    // Row 5: Z instead of space bar
  ];

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  // Board dimensions - expand to fill available space
  const boardWidth = windowWidth - 30;
  const boardHeight = windowHeight - 120; // Reduced to account for smaller bottom bar

  // Handle board layout measurement
  const handleBoardLayout = (event) => {
    // Layout is captured but not needed for current implementation
  };

  // Calculate letter tile dimensions (extra bottom padding keeps the last row clear of the border)
  const letterWidth = (boardWidth - BOARD_PADDING * 2 - (GRID_GAP * 6)) / (COLUMNS + 1);
  const letterHeight = (boardHeight - BOARD_PADDING - BOARD_PADDING_BOTTOM - (GRID_GAP * (ROWS - 1))) / ROWS;

  // Responsive font size based on tile size (scales for iPhone vs iPad)
  const letterFontSize = Math.max(20, Math.min(letterWidth, letterHeight) * 0.55);

  // Get letter position by grid coordinates (relative to board)
  const getLetterPosition = (row, col) => {
    const x = BOARD_PADDING + col * (letterWidth + GRID_GAP);
    const y = BOARD_PADDING + row * (letterHeight + GRID_GAP);
    return { x, y, width: letterWidth, height: letterHeight };
  };

  // Check which letters are within magnifier radius
  const getLettersInRadius = (touchX, touchY) => {
    const magnified = new Set();
    for (let row = 0; row < ROWS; row++) {
      const rowLetters = LETTERS[row];
      for (let col = 0; col < rowLetters.length; col++) {
        const letter = rowLetters[col];
        if (letter === ' ') continue; // Skip space bar tiles

        const pos = getLetterPosition(row, col);
        const letterCenterX = pos.x + pos.width / 2;
        const letterCenterY = pos.y + pos.height / 2;
        const distance = Math.sqrt(
          Math.pow(letterCenterX - touchX, 2) + Math.pow(letterCenterY - touchY, 2)
        );
        if (distance <= MAGNIFY_RADIUS) {
          magnified.add(`${row}-${col}`);
        }
      }
    }
    return magnified;
  };

  // Get letter at position - find the SINGLE closest letter
  const getLetterAtPosition = (touchX, touchY) => {
    let closestLetter = null;
    let closestDistance = Infinity;

    for (let row = 0; row < ROWS; row++) {
      const rowLetters = LETTERS[row];
      for (let col = 0; col < rowLetters.length; col++) {
        const letter = rowLetters[col];
        if (letter === ' ') continue; // Skip space bar tiles

        const pos = getLetterPosition(row, col);

        // Check if touch is within this letter's bounds
        if (
          touchX >= pos.x &&
          touchX <= pos.x + pos.width &&
          touchY >= pos.y &&
          touchY <= pos.y + pos.height
        ) {
          // Touch is directly on this letter, return it immediately
          return letter;
        }

        // Otherwise track the closest letter by distance
        const letterCenterX = pos.x + pos.width / 2;
        const letterCenterY = pos.y + pos.height / 2;
        const distance = Math.sqrt(
          Math.pow(letterCenterX - touchX, 2) + Math.pow(letterCenterY - touchY, 2)
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestLetter = letter;
        }
      }
    }

    // Check space bar
    const spaceBarLeft = BOARD_PADDING + COLUMNS * (letterWidth + GRID_GAP) + letterWidth / 4;
    const spaceBarTop = BOARD_PADDING;
    const spaceBarWidth = letterWidth / 2;
    const spaceBarHeight = letterHeight;

    for (let row = 0; row < 3; row++) {
      const tileTop = spaceBarTop + row * (letterHeight + GRID_GAP);
      if (
        touchX >= spaceBarLeft &&
        touchX <= spaceBarLeft + spaceBarWidth &&
        touchY >= tileTop &&
        touchY <= tileTop + spaceBarHeight
      ) {
        return ' ';
      }
    }

    // Return closest letter if found, otherwise null
    return closestLetter;
  };

  // Create PanResponder
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const pageX = evt.nativeEvent.pageX;
          const pageY = evt.nativeEvent.pageY;

          if (boardRef.current) {
            boardRef.current.measure((x, y, width, height, pageXBoard, pageYBoard) => {
              const relativeX = pageX - pageXBoard;
              const relativeY = pageY - pageYBoard;

              setMagnifierPos({ x: relativeX, y: relativeY });
              const magnified = getLettersInRadius(relativeX, relativeY);
              setMagnifiedLetters(magnified);
            });
          }
        },
        onPanResponderMove: (evt) => {
          const pageX = evt.nativeEvent.pageX;
          const pageY = evt.nativeEvent.pageY;

          if (boardRef.current) {
            boardRef.current.measure((x, y, width, height, pageXBoard, pageYBoard) => {
              const relativeX = pageX - pageXBoard;
              const relativeY = pageY - pageYBoard;

              setMagnifierPos({ x: relativeX, y: relativeY });
              const magnified = getLettersInRadius(relativeX, relativeY);
              setMagnifiedLetters(magnified);
            });
          }
        },
        onPanResponderRelease: (evt) => {
          const pageX = evt.nativeEvent.pageX;
          const pageY = evt.nativeEvent.pageY;

          if (boardRef.current) {
            boardRef.current.measure((x, y, width, height, pageXBoard, pageYBoard) => {
              const relativeX = pageX - pageXBoard;
              const relativeY = pageY - pageYBoard;

              const letter = getLetterAtPosition(relativeX, relativeY);
              if (letter) {
                onLetterSelected(letter);
              }
            });
          }

          setMagnifierPos(null);
          setMagnifiedLetters(new Set());
        },
        onPanResponderTerminate: () => {
          setMagnifierPos(null);
          setMagnifiedLetters(new Set());
        },
      }),
    []
  );

  const renderLetter = (letter, row, col) => {
    const magnifyKey = `${row}-${col}`;
    const isMagnified = magnifiedLetters.has(magnifyKey);
    const scale = isMagnified ? MAGNIFY_SCALE : 1;

    return (
      <View
        key={magnifyKey}
        style={[
          styles.letterTile,
          {
            width: letterWidth,
            height: letterHeight,
            transform: [{ scale }],
          },
          isMagnified && styles.letterMagnified,
        ]}
      >
        <Text style={styles.letterText}>{letter}</Text>
      </View>
    );
  };

  return (
    <View
      ref={boardRef}
      onLayout={handleBoardLayout}
      style={[
        styles.board,
        {
          width: boardWidth,
          height: boardHeight,
          borderColor: letterColor,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Letter grid in absolute positioning */}
      {LETTERS.map((row, rowIdx) =>
        row.map((letter, colIdx) => {
          const pos = getLetterPosition(rowIdx, colIdx);
          const isSpaceBarTile = letter === ' ';

          if (isSpaceBarTile) {
            // Space bar tiles are transparent/invisible, space bar rendered separately
            return null;
          }

          return (
            <View
              key={`${rowIdx}-${colIdx}`}
              style={[
                styles.letterTile,
                {
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: letterWidth,
                  height: letterHeight,
                  transform: [
                    {
                      scale: magnifiedLetters.has(`${rowIdx}-${colIdx}`)
                        ? MAGNIFY_SCALE
                        : 1,
                    },
                  ],
                },
                magnifiedLetters.has(`${rowIdx}-${colIdx}`) &&
                  styles.letterMagnified,
              ]}
            >
              <Text style={[styles.letterText, { color: letterColor, fontSize: letterFontSize }]}>{letter}</Text>
            </View>
          );
        })
      )}

      {/* Space bar - Column 6, rows 1-3 only */}
      <View
        style={[
          styles.spaceBar,
          {
            position: 'absolute',
            left: BOARD_PADDING + COLUMNS * (letterWidth + GRID_GAP) + letterWidth / 4,
            top: BOARD_PADDING,
            width: letterWidth / 2,
            height: letterHeight * 3 + GRID_GAP * 2,
            backgroundColor: letterColor,
          },
        ]}
      />

      {/* Magnifier circle */}
      {magnifierPos && (
        <View
          style={[
            styles.magnifierCircle,
            {
              left: magnifierPos.x - MAGNIFY_RADIUS,
              top: magnifierPos.y - MAGNIFY_RADIUS,
              width: MAGNIFY_RADIUS * 2,
              height: MAGNIFY_RADIUS * 2,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    backgroundColor: '#2a2a2a',
    borderWidth: 8,
    borderColor: '#FFD700', // Will be overridden by inline style
    borderRadius: 25,
    position: 'relative',
    overflow: 'hidden',
  },
  letterTile: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  letterText: {
    fontSize: 90,
    fontWeight: 'bold',
    color: '#FFD700', // Will be overridden by inline style
  },
  letterMagnified: {
    zIndex: 5,
  },
  spaceBar: {
    backgroundColor: '#FFD700',
    borderRadius: 25,
  },
  magnifierCircle: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    borderRadius: 100,
    pointerEvents: 'none',
    zIndex: 10,
  },
});

export default StencilBoard;
