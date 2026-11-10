import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';

// Letter layout: 5 rows x 6 columns (last column has space bar on rows 1-3, Z on row 5)
const LETTERS = [
  ['A', 'B', 'C', 'D', 'E', ' '],    // Row 1: space bar placeholder
  ['F', 'G', 'H', 'I', 'J', ' '],    // Row 2: space bar placeholder
  ['K', 'L', 'M', 'N', 'O', ' '],    // Row 3: space bar placeholder
  ['P', 'Q', 'R', 'S', 'T', ' '],    // Row 4: space bar placeholder
  ['U', 'V', 'W', 'X', 'Y', 'Z'],    // Row 5: Z instead of space bar
];

// Number & Operator layout: 3 rows x 6 columns (last column has space bar on rows 1-3)
const NUMBERS = [
  ['+', '-', 'X', '/', '=', ' '],    // Row 1: operators + space bar placeholder
  ['0', '1', '2', '3', '4', ' '],    // Row 2: digits 0-4 + space bar placeholder
  ['5', '6', '7', '8', '9', ' '],    // Row 3: digits 5-9 + space bar placeholder
];

const StencilBoard = ({ onLetterSelected, letterColor = '#FFD700', boardMode = 'letters' }) => {
  const [magnifierPos, setMagnifierPos] = useState(null);
  const [magnifiedLetters, setMagnifiedLetters] = useState(new Set());
  const boardRef = useRef(null);

  const isNumbers = boardMode === 'numbers';
  const GRID_ITEMS = isNumbers ? NUMBERS : LETTERS;
  const ROWS = isNumbers ? 3 : 5;
  const COLUMNS = 5;

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
  const BOARD_PADDING_BOTTOM = 18;
  const GRID_GAP = 4;

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  // Board dimensions - expand to fill available space
  const boardWidth = windowWidth - 30;
  const boardHeight = windowHeight - 120;

  // Reset magnifier when board mode changes
  useEffect(() => {
    setMagnifierPos(null);
    setMagnifiedLetters(new Set());
  }, [boardMode]);

  // Handle board layout measurement
  const handleBoardLayout = (event) => {
    // Layout is captured but not needed for current implementation
  };

  // Calculate letter tile dimensions
  const letterWidth = (boardWidth - BOARD_PADDING * 2 - (GRID_GAP * 6)) / (COLUMNS + 1);
  const letterHeight = (boardHeight - BOARD_PADDING - BOARD_PADDING_BOTTOM - (GRID_GAP * (ROWS - 1))) / ROWS;

  // Responsive font size based on tile size (scales for iPhone vs iPad)
  // Numbers board has 3 rows (taller tiles) and uses a slightly larger font for reduced errors
  const letterFontSize = isNumbers
    ? Math.max(26, Math.min(letterWidth, letterHeight) * 0.62)
    : Math.max(20, Math.min(letterWidth, letterHeight) * 0.55);

  // Get letter position by grid coordinates (relative to board)
  const getLetterPosition = (row, col) => {
    const x = BOARD_PADDING + col * (letterWidth + GRID_GAP);
    const y = BOARD_PADDING + row * (letterHeight + GRID_GAP);
    return { x, y, width: letterWidth, height: letterHeight };
  };

  // Space bar dimensions (height is 2/3 of the 3-row span, vertically centered)
  const spaceBarLeft = BOARD_PADDING + COLUMNS * (letterWidth + GRID_GAP) + letterWidth / 4;
  const spaceBarFullSpan = letterHeight * 3 + GRID_GAP * 2;
  const spaceBarWidth = letterWidth / 2;
  const spaceBarHeight = spaceBarFullSpan * (2 / 3);
  const spaceBarTop = BOARD_PADDING + (spaceBarFullSpan - spaceBarHeight) / 2;

  // Check which letters are within magnifier radius
  const getLettersInRadius = (touchX, touchY) => {
    const magnified = new Set();
    for (let row = 0; row < ROWS; row++) {
      const rowLetters = GRID_ITEMS[row];
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

  // Get letter at position - find the SINGLE closest letter or space bar
  const getLetterAtPosition = (touchX, touchY) => {
    // 1. Direct hit on space bar
    if (
      touchX >= spaceBarLeft - 8 &&
      touchX <= spaceBarLeft + spaceBarWidth + 8 &&
      touchY >= spaceBarTop &&
      touchY <= spaceBarTop + spaceBarHeight
    ) {
      return ' ';
    }

    let closestLetter = null;
    let closestDistance = Infinity;

    for (let row = 0; row < ROWS; row++) {
      const rowLetters = GRID_ITEMS[row];
      for (let col = 0; col < rowLetters.length; col++) {
        const letter = rowLetters[col];
        if (letter === ' ') continue; // Skip space bar tiles

        const pos = getLetterPosition(row, col);

        // Direct hit on tile
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

    // Check if touch is closer to space bar than closest letter
    const dx = Math.max(spaceBarLeft - touchX, 0, touchX - (spaceBarLeft + spaceBarWidth));
    const dy = Math.max(spaceBarTop - touchY, 0, touchY - (spaceBarTop + spaceBarHeight));
    const spaceDistance = Math.sqrt(dx * dx + dy * dy);
    if (spaceDistance < closestDistance) {
      return ' ';
    }

    // Return closest letter if found, otherwise null
    return closestLetter;
  };

  // Ref to hold latest callbacks so PanResponder never uses stale closures
  const stateRef = useRef({});
  stateRef.current = {
    getLettersInRadius,
    getLetterAtPosition,
    onLetterSelected,
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
              const magnified = stateRef.current.getLettersInRadius(relativeX, relativeY);
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
              const magnified = stateRef.current.getLettersInRadius(relativeX, relativeY);
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

              const letter = stateRef.current.getLetterAtPosition(relativeX, relativeY);
              if (letter) {
                stateRef.current.onLetterSelected(letter);
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
      {/* Letter/Number grid in absolute positioning */}
      {GRID_ITEMS.map((row, rowIdx) =>
        row.map((letter, colIdx) => {
          const pos = getLetterPosition(rowIdx, colIdx);
          const isSpaceBarTile = letter === ' ';

          if (isSpaceBarTile) {
            // Space bar tiles are transparent/invisible, space bar rendered separately
            return null;
          }

          return (
            <View
              key={`${boardMode}-${rowIdx}-${colIdx}`}
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

      {/* Space bar - Column 6 */}
      <View
        style={[
          styles.spaceBar,
          {
            position: 'absolute',
            left: spaceBarLeft,
            top: spaceBarTop,
            width: spaceBarWidth,
            height: spaceBarHeight,
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
