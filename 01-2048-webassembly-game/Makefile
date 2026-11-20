# Engine unit tests (no Qt required). The GUI/WASM build uses CMake, see README.
CXX      ?= g++
CXXFLAGS ?= -std=c++17 -O1 -g -Wall -Wextra

.PHONY: test clean

test: tests/test_engine
	./tests/test_engine

tests/test_engine: tests/test_engine.cpp src/gameengine.cpp src/gameengine.h
	$(CXX) $(CXXFLAGS) -o $@ tests/test_engine.cpp src/gameengine.cpp

clean:
	rm -f tests/test_engine
