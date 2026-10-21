# React Native Minesweeper

A modern, high-performance implementation of the classic Minesweeper game built with React Native and Expo. Developed for the Mobile Developer Internship Assignment.

---

## Features and Requirements Checklist

This project was built to strictly adhere to all Core Requirements, Bonus Features, and Submission criteria while providing a clean and responsive mobile UI.

### Core Requirements
- [x] **Two Screens**: Strictly architected with Home Screen (`/`) and Game Screen (`/game`). Settings are integrated as an in-app modal overlay to maintain the two-screen requirement.
- [x] **Game Screen and Modes**: Displays the board, supporting both `Dig` and `Flag` modes via an animated bottom toggle.
- [x] **Tap Execution**: Tapping a square applies the selected mode.
- [x] **Flag Safety**: Flagged squares are entirely immune to digging until unflagged.
- [x] **Classic Logic**: Mines are randomly distributed *after* the first click, guaranteeing the player always starts on a safe, 0-adjacent blank cell.
- [x] **Adjacent Mine Indicators**: Revealed cells display numbers (1-8) colored distinctly.
- [x] **Zero-Adjacent Flood Fill**: Implemented an optimized iterative BFS (Breadth-First Search) algorithm to automatically reveal massive blank sections without triggering JavaScript Call Stack limitations.
- [x] **Win Condition**: The player wins exactly when all safe squares are revealed (flagging is completely optional).
- [x] **Loss Condition**: Revealing a mine results in an instant loss and reveals all remaining hidden mines.

### Bonus Features Implemented
- [x] **Light and Dark Theme**: Fully implemented with dynamic `expo-linear-gradient` backgrounds, Glassmorphism (`expo-blur`), and tailored UI colors.
- [x] **Sound Effects**: Custom synthesized 16-bit PCM audio (Wooden Marimba for dig, Deep Sub-bass for explosions, Magical Chords for wins).
- [x] **Settings Interface**: Integrated a sleek overlay on the Home Screen to toggle Dark Mode and Sound Effects without leaving the root screen.
- [x] **Clean Animations**: 60fps/120fps hardware-accelerated animations using `react-native-reanimated` (Spring physics, FadeIns, dynamic scaling, tactile 3D buttons).

### Additional Mechanics
- **Chording**: Long-pressing an already revealed number will auto-dig all adjacent hidden cells *if* the player has placed the correct number of flags around it.

---

## Setup and Run Instructions

This project uses modern Expo and npm.

### Prerequisites
- Node.js (>= 18.x)
- npm or yarn

### Installation
1. Clone the repository and navigate into the project directory:
   ```bash
   git clone https://github.com/yigitsarpavci/react-native-minesweeper.git
   cd react-native-minesweeper
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally
1. Start the Expo development server:
   ```bash
   npx expo start -c
   ```
2. Open the app:
   - **iOS**: Press `i` to open in the iOS Simulator.
   - **Android**: Press `a` to open in the Android Emulator.
   - **Web**: Press `w` to run in your local web browser.

---

## Code Structure Overview

The project strictly follows the **Separation of Concerns** principle, heavily decoupling React view logic from pure TypeScript game engine logic.

- **`src/features/minesweeper/logic/minesweeper.ts`**: The pure TypeScript game engine. Completely decoupled from React components. Handles immutable matrix creation, mine planting, iterative BFS flood-filling, and victory state calculations.
- **`src/features/minesweeper/hooks/useMinesweeperGame.ts`**: The state management layer utilizing `useReducer` to safely bridge the pure logic to React components, preventing stale closures on rapid taps.
- **`src/hooks/useSoundEffects.ts`**: A robust, cross-platform audio hook managing playback of synthesized `.wav` assets via `expo-audio` and Web Audio APIs.
- **`src/theme/PreferencesContext.tsx`**: Context API for global state management (Theme and Sound preferences), allowing seamless light/dark mode transitions across the entire app hierarchy.
- **`src/app/`**: Modern file-based routing architecture using Expo Router (`index.tsx` for Home, `game.tsx` for Game).
- **`src/components/`**: Highly-optimized UI components (e.g., the Neumorphic/Glassmorphic `Cell`, `GameHeader`, and `Board`).

---

## Assumptions and Limitations

**Assumptions:**
- **Platform Agnosticism**: The app targets iOS, Android, and Web smoothly. It assumes the user has a relatively modern browser or device to render the 60fps Reanimated physics.
- **Hardware Integration**: It assumes the device supports basic haptic feedback (`expo-haptics`) to complement the audio.

**Limitations:**
- **Extreme Board Sizes**: While the iterative BFS logic is O(N) and memory optimized, rendering massive boards (e.g., 50x50) could encounter React Native Flex layout limitations since the grid relies on mapped components rather than a `FlatList` virtualizer.
- **Zooming**: There is no pinch-to-zoom camera implemented. On very small mobile screens, the "Expert" mode (16x16) requires precise tapping.

---

## Implementation Approach and Challenges Solved

### 1. Pure Reducer-Driven Logic
**Approach**: I chose to abstract the raw game logic (matrix creation, mine planting, cell revealing) completely out of React state loops. The game runs inside a pure `useReducer` processing strictly defined actions (`DIG`, `FLAG`, `CHORD`).
**Why**: This makes the core logic 100% unit-testable without needing React DOM mounts, and creates highly predictable state transitions.

### 2. Recursion Stack Overflows (Flood-Fill)
**Challenge**: Initially, digging a blank cell on a large board could exceed JavaScript's maximum call stack via recursive calls, crashing the app.
**Solution**: I rewrote the flood-fill algorithm in `minesweeper.ts` to use an iterative Breadth-First Search (BFS) queue. To prevent infinite loops or exponential memory usage, cells are marked as "revealed" *immediately* before being pushed to the queue.

### 3. React Stale Closures on Rapid Tapping
**Challenge**: Rapidly tapping adjacent cells would sometimes process an old state matrix, causing the game to miscalculate flags or "un-reveal" cells.
**Solution**: Leveraged `useReducer` combined with action dispatching. Every action computes the absolute next state from the engine directly, bypassing stale `useState` dependency arrays during intense interaction bursts.

### 4. Flawless 60fps Modal Transitions
**Challenge**: The React Native `<Modal>` component abruptly unmounts, severely interrupting `react-native-reanimated` exit animations when closing the settings screen.
**Solution**: Abandoned conditional unmounting entirely. Replaced it with an unconditional `Animated.View` overlay driven purely by a `useSharedValue(opacity)` and `pointerEvents="none"`. This guarantees flawless, uninterrupted hardware-accelerated animations upon exiting.

### 5. High-Precision Background Timer and Accessibility
**Enhancement**: Realized `setInterval` drifts and pauses when the React Native app goes into the background.
**Solution**: Refactored the Timer to use absolute `Date.now()` differences, ensuring millisecond-perfect timing regardless of OS backgrounding. Additionally, deeply integrated Android/iOS Screen Reader support (A11y) dynamically labeling every cell's state and adjacent mines, making the complex grid fully playable for visually impaired users.

### 6. Immersive Sensory Feedback
**Enhancement**: Basic UI feedback felt lacking.
**Solution**: Engineered a multi-channel `expo-audio` engine driven by 5 distinct, Python-synthesized 44.1kHz `.wav` procedural assets (Marimba Dig, Cinematic Bomb Sub-bass, Chime Win). Paired this with a custom-built 60fps Reanimated Particle Emitter that calculates the exact screen dimensions to randomly scatter 100+ confetti or spark particles entirely on the native UI thread without JS bridge overhead.

---

## Future Improvements

- **Alternative Win Condition**: Allow the game to finish successfully when all mines are correctly flagged, in addition to the standard win condition of revealing all safe cells.
- **Android OS Button Overlap**: Fix the layout issue on Android where the "New Game" button overlaps with or appears under the system navigation buttons.
- **Theme Refactoring**: Refactor the hardcoded color definitions in the `Cell` component to utilize the global theme/PreferencesContext.
- **Audio Playback Stability**: Address occasional sound errors where audio either fails to play or triggers twice.
- **General UI Fixes**: Resolve remaining minor UI layout and rendering issues.
