# 2048 WebAssembly Game (Qt 6 & C++17)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![C++17](https://img.shields.io/badge/Language-C%2B%2B17-00599C?logo=c%2B%2B&logoColor=white)](#technical-architecture)
[![Qt 6](https://img.shields.io/badge/Framework-Qt%206-41CD52?logo=qt&logoColor=white)](#technical-architecture)
[![WebAssembly](https://img.shields.io/badge/Target-WebAssembly%20(WASM)-654FF0?logo=webassembly&logoColor=white)](#live-demo)
[![Course: CMPE 230](https://img.shields.io/badge/Course-CMPE%20230%20Boğaziçi-purple.svg)](#overview)

A high-performance, cross-platform implementation of the **2048** puzzle game, engineered with **C++17** and the **Qt 6** framework. Developed as part of the **CMPE 230 (Systems Programming)** curriculum at **Boğaziçi University**, this project demonstrates canonical matrix normalization algorithms, infinite state-history management for undos, and cross-compilation for modern web browsers via **WebAssembly (Emscripten)**.

---

## Live Demo

**Play in your browser:** [https://yigitsarpavci.github.io/2048-webassembly-game/](https://yigitsarpavci.github.io/2048-webassembly-game/)

---

## Key Features

- **Multiple Game Modes:**
  - **Normal**: Traditional 2048 goal with configurable target tile $K$.
  - **Unlimited**: Endless play for high-score progression.
  - **Hard Mode**: Time-constrained mode with a 5-second countdown penalty (executes a random valid move on timeout).
- **Infinite Undo History:** Revert to any prior board state since the start of the session using a deep-copy stack mechanism (`std::stack`).
- **High Performance:** Deterministic $O(N \times M)$ grid shifting and merging logic.
- **Responsive UI:** Custom Qt widget styling with dynamic color palettes and smooth layout resizing.
- **Automated Web Deployment:** Integrated GitHub Actions CI/CD workflow that cross-compiles C++17 sources via Emscripten and deploys static WebAssembly artifacts to GitHub Pages.

---

## Technical Architecture

- **Engine Logic (`src/gameengine.h`, `src/gameengine.cpp`)**: Decoupled `GameEngine` class using `std::vector` for 2D grid representation and `std::stack` for state history snapshots.
- **Directional Normalization**: All directional moves (Up, Down, Right) are mathematically reduced to a single canonical `moveLeft()` operation via transpose and row-reversal transformations, minimizing code duplication and ensuring algorithmic consistency.
- **Event Filtering (`src/mainwindow.cpp`)**: Low-level Qt event interception ensuring responsive keyboard navigation across both native desktop windows and WebAssembly browser canvases.

---

## Project Structure

```text
01-2048-webassembly-game/
├── CMakeLists.txt           # CMake build configuration (Native Qt 6 & Emscripten WASM)
├── src/
│   ├── main.cpp             # Application entry point
│   ├── gameengine.h         # Core 2048 state machine & history stack interface
│   ├── gameengine.cpp       # Matrix rotation, tile merging, and RNG implementation
│   ├── mainwindow.h         # Qt 6 GUI window and slot declarations
│   ├── mainwindow.cpp       # UI rendering, event filtering, and timer controllers
│   └── mainwindow.ui        # Qt Designer layout specification
├── report.pdf               # Technical documentation and signal-slot architecture report
├── report.tex               # LaTeX source for the technical report
├── LICENSE                  # MIT License
└── README.md                # Project documentation
```

---

## Building from Source

```bash
git clone https://github.com/yigitsarpavci/cross-platform-game-lab.git
cd cross-platform-game-lab/01-2048-webassembly-game

# Native Desktop Build (requires Qt 6 & CMake)
mkdir build && cd build
cmake ..
cmake --build .
./game2048

# WebAssembly Build (requires Emscripten SDK)
emcmake cmake -B build-wasm
cmake --build build-wasm
python3 -m http.server 8080 --directory build-wasm
```

---

## Documentation

Detailed technical implementation, class diagrams, and Qt signal-slot mappings are provided in the [Project Report (PDF)](./report.pdf).

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Related Projects

Part of the **[Cross-Platform & WebAssembly Game Lab](../README.md)** suite:
- **[02-react-native-minesweeper](../02-react-native-minesweeper)**: Cross-platform mobile Minesweeper engineered with React Native, Expo, and TypeScript featuring iterative BFS flood-fill and synthesized PCM audio.

---

*Developed by Yiğit Sarp Avcı and Doğukan Süngü*
