# Cross-Platform & WebAssembly Game Lab

[![C++17](https://img.shields.io/badge/C%2B%2B-17-00599C?logo=c%2B%2B&logoColor=white)](https://isocpp.org)
[![Qt 6](https://img.shields.io/badge/Qt-6.7-41CD52?logo=qt&logoColor=white)](https://www.qt.io)
[![WebAssembly](https://img.shields.io/badge/Target-WebAssembly%20(WASM)-654FF0?logo=webassembly&logoColor=white)](https://webassembly.org)
[![React Native](https://img.shields.io/badge/Mobile-React%20Native%20%7C%20Expo-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A curated laboratory of cross-platform game engineering architectures exploring native compilation to **WebAssembly (WASM)** via **Emscripten** and cross-platform mobile development with **React Native & Expo**. Focuses on deterministic state machines, non-recursive traversal algorithms, memory-efficient history snapshots, and native hardware integration.

---

## Lab Modules Overview

| Module | Core Stack | Execution Target | Architectural & Algorithmic Highlights |
|---|---|---|---|
| **[01. 2048 WebAssembly Game](./01-2048-webassembly-game)** · [Live Demo](https://yigitsarpavci.github.io/2048-webassembly-game/) | `C++17`, `Qt 6`, `Emscripten`, `CMake` | Browser (WASM Canvas) & Native Desktop | Canonical directional grid normalization, infinite undo history stack (`std::stack`), browser key-event filtering. |
| **[02. React Native Minesweeper](./02-react-native-minesweeper)** | `React Native`, `Expo`, `TypeScript` | iOS, Android & Mobile Web | Non-recursive iterative BFS flood-fill, pure reducer state architecture (`useReducer`), safe first-click, synthesized 16-bit PCM audio, Expo haptics. |

---

## Architectural Deep Dive

### 1. 2048 WebAssembly Engine (`01-2048-webassembly-game`)
- **WebAssembly Compilation Pipeline:** Engineered in C++17 using the Qt 6 framework and cross-compiled to WebAssembly bytecode via Emscripten and CMake, enabling near-native computational throughput directly inside modern web browsers.
- **Directional Grid Normalization:** Implements canonical matrix rotation algorithms so that tile shifting and merging logic only needs to be defined for a single direction (Left). Rotations ($90^\circ, 180^\circ, 270^\circ$) normalize arbitrary directional swipes into a unified execution path before rotating back, eliminating redundant code.
- **Infinite Undo History Stack:** Employs an in-memory stack (`std::stack<GameState>`) capturing deep-copy board snapshots and score differentials on every valid move, enabling instant, unbounded rollbacks with $O(1)$ push/pop complexity.
- **CI/CD Deployment:** Automated GitHub Actions workflow compiling the C++ sources with Emscripten and deploying static artifacts to GitHub Pages.

### 2. React Native Minesweeper (`02-react-native-minesweeper`)
- **Non-Recursive Iterative BFS Flood-Fill:** Standard recursive flood-fill algorithms risk call-stack overflows on large or empty minefield cascades on mobile runtimes. This implementation utilizes a queue-driven iterative Breadth-First Search (BFS) with an index-tracking visited set, guaranteeing deterministic $O(V)$ time and $O(V)$ memory safety.
- **Pure Reducer State Architecture:** Manages game state through an immutable state reducer pattern (`useReducer`), decoupling user touch interactions (flagging, revealing, chording) from board evaluation and timer side-effects.
- **Guaranteed Safe First-Click:** Generates mine layouts dynamically on the user's initial touch, guaranteeing that the first revealed cell and its immediate neighbors are always empty ($0$ adjacent mines).
- **Native Hardware Haptics & Audio:** Custom-synthesized 16-bit PCM audio feedback coupled with multi-tier Expo haptic pulses distinguishing cell reveals, flags, chord operations, and game-over states.

---

## Build & Run Instructions

### 1. 2048 WebAssembly Engine
```bash
cd 01-2048-webassembly-game

# Local Native Desktop Build (requires Qt 6 & CMake)
mkdir build && cd build
cmake ..
cmake --build .
./game2048

# WebAssembly Build (requires Emscripten SDK)
emcmake cmake -B build-wasm
cmake --build build-wasm
python3 -m http.server 8080 --directory build-wasm
```

### 2. React Native Minesweeper
```bash
cd 02-react-native-minesweeper

# Install dependencies
npm install

# Start development server
npx expo start
```

---

## License

This repository is licensed under the [MIT License](LICENSE).

---

## Author

**Yiğit Sarp Avcı**  
Computer Engineering Student @ Boğaziçi University  
[GitHub Profile](https://github.com/yigitsarpavci) · [LinkedIn](https://www.linkedin.com/in/yigitsarpavci)
