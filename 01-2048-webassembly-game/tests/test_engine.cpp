// Dependency-free tests for the Qt-free 2048 GameEngine (no Qt, no framework).
// Build and run with `make test`.
#include <cstdio>
#include <iostream>
#include <string>
#include <vector>

#include "../src/gameengine.h"

static int checks = 0, failures = 0;

#define CHECK(cond)                                                                \
    do {                                                                           \
        ++checks;                                                                  \
        if (!(cond)) {                                                             \
            ++failures;                                                            \
            std::printf("  FAIL %s:%d: %s\n", __FILE__, __LINE__, #cond);          \
        }                                                                          \
    } while (0)

using Row = std::vector<int>;
using Board = std::vector<Row>;

// Replaces the whole board with `b` and disables random spawning so moves are deterministic.
static void load(GameEngine& e, const Board& b) {
    for (int r = 0; r < (int)b.size(); ++r)
        for (int c = 0; c < (int)b[r].size(); ++c) e.setTile(r, c, b[r][c]);
    e.setScore(0);
    e.setSpawnEnabled(false);
}

static Board values(const GameEngine& e) {
    Board b;
    for (const auto& row : e.getGrid()) {
        Row r;
        for (const auto& t : row) r.push_back(t.value);
        b.push_back(r);
    }
    return b;
}

static int tileCount(const GameEngine& e) {
    int n = 0;
    for (const auto& row : e.getGrid())
        for (const auto& t : row) n += t.value != 0;
    return n;
}

static void run(const char* name, void (*fn)()) {
    int before = failures;
    fn();
    std::printf("%-52s %s\n", name, failures == before ? "ok" : "FAILED");
}

static void test_new_game_has_two_tiles() {
    GameEngine e(4, 4, 2048);
    CHECK(tileCount(e) == 2);
    CHECK(e.getScore() == 0);
    CHECK(e.getHistoryDepth() == 0);
}

static void test_slide_in_all_directions() {
    GameEngine e(3, 3, 2048);
    load(e, {{0, 0, 0}, {0, 2, 0}, {0, 0, 0}});
    CHECK(e.move(Direction::Left));
    CHECK((values(e) == Board{{0, 0, 0}, {2, 0, 0}, {0, 0, 0}}));
    CHECK(e.move(Direction::Right));
    CHECK((values(e) == Board{{0, 0, 0}, {0, 0, 2}, {0, 0, 0}}));
    CHECK(e.move(Direction::Up));
    CHECK((values(e) == Board{{0, 0, 2}, {0, 0, 0}, {0, 0, 0}}));
    CHECK(e.move(Direction::Down));
    CHECK((values(e) == Board{{0, 0, 0}, {0, 0, 0}, {0, 0, 2}}));
}

static void test_each_tile_merges_once_per_move() {
    GameEngine e(1, 4, 2048);
    load(e, {{2, 2, 2, 2}});
    CHECK(e.move(Direction::Left));
    CHECK((values(e) == Board{{4, 4, 0, 0}}));
    CHECK(e.getScore() == 8);

    load(e, {{2, 2, 4, 0}});
    CHECK(e.move(Direction::Left));
    CHECK((values(e) == Board{{4, 4, 0, 0}})); // the new 4 must not merge again with the existing 4

    load(e, {{4, 2, 2, 0}});
    CHECK(e.move(Direction::Right));
    CHECK((values(e) == Board{{0, 0, 4, 4}}));
}

static void test_merge_direction_priority() {
    GameEngine e(1, 3, 2048);
    load(e, {{2, 2, 2}});
    e.move(Direction::Left);
    CHECK((values(e) == Board{{4, 2, 0}})); // merge starts from the side the tiles move toward
    load(e, {{2, 2, 2}});
    e.move(Direction::Right);
    CHECK((values(e) == Board{{0, 2, 4}}));
}

static void test_invalid_move_changes_nothing() {
    GameEngine e(2, 2, 2048);
    load(e, {{2, 4}, {0, 0}});
    CHECK(!e.move(Direction::Left)); // already packed to the left
    CHECK((values(e) == Board{{2, 4}, {0, 0}}));
    CHECK(e.getScore() == 0);
    CHECK(e.getHistoryDepth() == 0); // failed moves must not pollute undo history
}

static void test_spawn_adds_exactly_one_tile() {
    GameEngine e(4, 4, 2048);
    load(e, {{2, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0}});
    e.setSpawnEnabled(true);
    CHECK(e.move(Direction::Right));
    CHECK(tileCount(e) == 2);
    CHECK(e.getSpawnId() != -1);
}

static void test_generation_chance_controls_spawn_value() {
    GameEngine e(4, 4, 1 << 20);
    e.setGenerationChances(1.0); // always spawn a 2
    for (int i = 0; i < 20; ++i) {
        load(e, {{0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0}, {2, 0, 0, 0}});
        e.setSpawnEnabled(true);
        e.move(Direction::Right);
        for (const auto& row : e.getGrid())
            for (const auto& t : row) CHECK(t.value == 0 || t.value == 2);
    }
    e.setGenerationChances(0.0); // always spawn a 4
    load(e, {{0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0}, {2, 0, 0, 0}});
    e.setSpawnEnabled(true);
    e.move(Direction::Right);
    int fours = 0;
    for (const auto& row : e.getGrid())
        for (const auto& t : row) fours += t.value == 4;
    CHECK(fours == 1);
}

static void test_undo_restores_grid_and_score() {
    GameEngine e(1, 4, 2048);
    load(e, {{2, 2, 4, 4}});
    CHECK(e.move(Direction::Left));
    CHECK(e.getScore() == 12);
    e.undo();
    CHECK((values(e) == Board{{2, 2, 4, 4}}));
    CHECK(e.getScore() == 0);
    e.undo(); // nothing left: must be a harmless no-op
    CHECK((values(e) == Board{{2, 2, 4, 4}}));
}

static void test_unbounded_undo_history() {
    GameEngine e(2, 2, 1 << 30);
    load(e, {{2, 0}, {0, 0}});
    const int moves = 1000;
    for (int i = 0; i < moves; ++i) e.move(i % 2 ? Direction::Left : Direction::Right);
    CHECK(e.getHistoryDepth() == moves);
    for (int i = 0; i < moves; ++i) e.undo();
    CHECK(e.getHistoryDepth() == 0);
    CHECK((values(e) == Board{{2, 0}, {0, 0}}));
}

static void test_win_and_game_over_detection() {
    GameEngine e(2, 2, 8);
    load(e, {{4, 0}, {0, 0}});
    CHECK(!e.hasWon());
    load(e, {{8, 0}, {0, 0}});
    CHECK(e.hasWon());

    load(e, {{2, 4}, {4, 2}});
    CHECK(!e.canMove()); // full board, no equal neighbours
    load(e, {{2, 2}, {4, 8}});
    CHECK(e.canMove());  // a horizontal merge is possible
    load(e, {{2, 4}, {2, 8}});
    CHECK(e.canMove());  // a vertical merge is possible
}

static void test_non_square_grid() {
    GameEngine e(2, 5, 2048);
    load(e, {{2, 0, 0, 0, 2}, {0, 4, 0, 4, 0}});
    CHECK(e.move(Direction::Left));
    CHECK((values(e) == Board{{4, 0, 0, 0, 0}, {8, 0, 0, 0, 0}}));
    CHECK(e.getScore() == 12);
}

static void test_best_score_tracks_maximum_and_survives_undo() {
    GameEngine e(1, 4, 2048);
    load(e, {{4, 4, 8, 8}});
    e.move(Direction::Left);
    CHECK(e.getBestScore() == 24);
    e.undo();
    CHECK(e.getScore() == 0);
    CHECK(e.getBestScore() == 24);
}

static void test_move_records_animation_metadata() {
    GameEngine e(1, 4, 2048);
    load(e, {{0, 2, 2, 0}});
    e.move(Direction::Left);
    const auto& moves = e.getLastMoves();
    CHECK(moves.size() == 2); // both tiles travel to column 0 and one is flagged as merged
    for (const auto& m : moves) {
        CHECK(m.toRow == 0 && m.toCol == 0);
        CHECK(m.merged && m.value == 4);
    }
}

int main() {
    // The engine logs every move to std::cout; keep test output readable.
    std::cout.setstate(std::ios_base::failbit);

    std::printf("2048 GameEngine tests\n");
    run("new game starts with two tiles", test_new_game_has_two_tiles);
    run("tiles slide in all four directions", test_slide_in_all_directions);
    run("each tile merges at most once per move", test_each_tile_merges_once_per_move);
    run("merges start from the side tiles move toward", test_merge_direction_priority);
    run("no-op moves change nothing and are not undoable", test_invalid_move_changes_nothing);
    run("a valid move spawns exactly one tile", test_spawn_adds_exactly_one_tile);
    run("generation chance controls the spawned value", test_generation_chance_controls_spawn_value);
    run("undo restores grid and score", test_undo_restores_grid_and_score);
    run("undo history is effectively unbounded", test_unbounded_undo_history);
    run("win and game-over detection", test_win_and_game_over_detection);
    run("non-square grids work", test_non_square_grid);
    run("best score survives undo", test_best_score_tracks_maximum_and_survives_undo);
    run("moves record animation metadata", test_move_records_animation_metadata);

    std::printf("\n%d checks, %d failures\n", checks, failures);
    return failures ? 1 : 0;
}
