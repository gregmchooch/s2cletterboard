# S2C Letter Board - Interactive Stencil App

A beautiful, touch-responsive letter board application for iPad and Android tablets. Uses a magnifying glass effect to help select letters accurately, ideal for spell-and-store word games.

## Features

? **Interactive Letter Grid**
- 5×5 main letter grid (A-Y)
- Dedicated space bar (rows 1-3 in column 6)
- Z positioned in row 5, column 6
- Large, readable 72px letters

? **Magnifying Glass Interaction**
- Visual circle that follows your finger
- Letters magnify (2.0x) within the magnification radius
- Smooth drag-to-explore experience
- Accurate tap-to-select functionality

? **Word Management**
- Spell words by tapping or dragging across letters
- Real-time display of currently spelled word
- Remove Letter button to undo
- Store Word to save to history
- Word History display with individual delete options
- History modal for expanded view

? **Cross-Platform**
- Built with React Native + Expo
- Works on iPad (iOS)
- Android/Galaxy Tab support ready

## Screenshots

[Your app in action on iPad]

## Installation

### Prerequisites
- Node.js and npm
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your iPad/Android tablet

### Setup

```bash
# Clone the repository
git clone https://github.com/gregmchooch/s2cletterboard.git
cd s2cletterboard

# Install dependencies
npm install

# Start the development server
npx expo start

# Scan the QR code with Expo Go on your device
```

## Usage

1. **Select Letters**: Tap any letter on the board to add it to the current word
2. **Drag to Explore**: Drag your finger across the board to see magnified letters
3. **Use Space Bar**: Tap the vertical bar on the right (rows 1-3) to add spaces
4. **Remove Last**: Click "Remove Letter" to undo the last selection
5. **Store Word**: Click "Store Word" to save the spelled word to history
6. **View History**: See all stored words in the Word History section

## Technical Details

### Architecture
- **App.js**: Root component managing state
- **StencilBoard.js**: Main board with touch/magnification logic
- **ControlPanel.js**: Word display and history management

### Key Technologies
- React Native
- Expo
- PanResponder for touch handling
- Dynamic coordinate system (pageX/pageY based)

### Board Specifications
- **Layout**: 6 columns × 5 rows
- **Magnification Radius**: 80px
- **Magnification Scale**: 2.0x
- **Letter Font Size**: 72px (bold)
- **Colors**: Gold (#FFD700) letters on dark (#2a2a2a) background

### Coordinate System
- Uses absolute screen coordinates (pageX/pageY)
- Board measurement via React Native measure() API
- Accurate on various device sizes and pixel densities

## Version History

### v1.0-stable (Current)
? All core features working and tested on iPad
- Magnification and selection working perfectly
- Letter accumulation without duplicates
- Space bar positioned correctly (rows 1-3)
- 1.5x enlarged letters (72px font)
- No known issues

## Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| iPad (iOS) | ? Tested & Working | Primary platform, fully optimized |
| Android | ?? Ready to Test | Code is cross-platform, awaiting Galaxy Tab testing |
| Android (Galaxy Tab) | ? Pending | Will test and adjust as needed |

## Troubleshooting

### Issue: Circle not appearing at tap location
**Solution**: Ensure Expo is using latest version and hot reload is enabled

### Issue: Letters not magnifying
**Solution**: Check that touch events are firing properly - try a quick drag across the board

### Issue: Duplicate letters being added
**Solution**: This was fixed in v1.0 - ensure you're on the latest version

## Development

### Running in Development
```bash
npx expo start
# Press 'i' for iOS simulator or 'a' for Android emulator
# Or scan QR code with Expo Go on device
```

### Testing on Device
```bash
# Run on iPad with Expo Go
npx expo start
# Scan QR code displayed in terminal

# Run on Android with Expo Go
npx expo start
# Scan QR code displayed in terminal
```

### Making Changes
- Edit files in `src/` directory
- Changes hot reload automatically in Expo Go
- No build required during development

## Known Limitations
- None identified in v1.0-stable

## Future Enhancements
- Sound effects
- Haptic feedback on letter selection
- Custom themes/colors
- Additional languages
- Performance optimizations
- Gesture refinements

## Contributing
This is a personal project. Feel free to fork and modify for your needs!

## License
MIT

## Contact
Created by Greg McHooch

---

**Status**: ? Stable and ready for production use on iPad  
**Last Updated**: Current Session  
**Tested On**: iPad via Expo Go
