#include <iostream>
#include <cstdlib>
#include <vector>
#include <string>
#include <cctype>
#include <fstream>

using namespace std;

char board[8][8];

// ==========================================
// GAME STATE
// ==========================================

struct GameState {

    char board[8][8];

    bool whiteKingMoved;
    bool blackKingMoved;

    bool whiteRookLeftMoved;
    bool whiteRookRightMoved;

    bool blackRookLeftMoved;
    bool blackRookRightMoved;

    int enPassantRow;
    int enPassantCol;

    bool whiteTurn;
};

vector<GameState> history;

// ==========================================
// CASTLING TRACKING
// ==========================================

bool whiteKingMoved = false;
bool blackKingMoved = false;

bool whiteRookLeftMoved = false;
bool whiteRookRightMoved = false;

bool blackRookLeftMoved = false;
bool blackRookRightMoved = false;

// ==========================================
// EN PASSANT TRACKING
// ==========================================

int enPassantRow = -1;
int enPassantCol = -1;

// ==========================================
// SAVE GAME STATE
// ==========================================

void saveGameState(bool whiteTurn) {

    GameState state;

    for (int row = 0; row < 8; row++) {
        for (int col = 0; col < 8; col++) {
            state.board[row][col] = board[row][col];
        }
    }

    state.whiteKingMoved = whiteKingMoved;
    state.blackKingMoved = blackKingMoved;

    state.whiteRookLeftMoved = whiteRookLeftMoved;
    state.whiteRookRightMoved = whiteRookRightMoved;

    state.blackRookLeftMoved = blackRookLeftMoved;
    state.blackRookRightMoved = blackRookRightMoved;

    state.enPassantRow = enPassantRow;
    state.enPassantCol = enPassantCol;

    state.whiteTurn = whiteTurn;

    history.push_back(state);
}

// ==========================================
// UNDO
// ==========================================

bool undoMove(bool &whiteTurn) {

    if (history.empty()) {

        cout << "\nNo moves to undo.\n";
        return false;
    }

    GameState state = history.back();

    history.pop_back();

    for (int row = 0; row < 8; row++) {
        for (int col = 0; col < 8; col++) {
            board[row][col] = state.board[row][col];
        }
    }

    whiteKingMoved = state.whiteKingMoved;
    blackKingMoved = state.blackKingMoved;

    whiteRookLeftMoved = state.whiteRookLeftMoved;
    whiteRookRightMoved = state.whiteRookRightMoved;

    blackRookLeftMoved = state.blackRookLeftMoved;
    blackRookRightMoved = state.blackRookRightMoved;

    enPassantRow = state.enPassantRow;
    enPassantCol = state.enPassantCol;

    whiteTurn = state.whiteTurn;

    cout << "\nMove undone successfully.\n";

    return true;
}


// ==========================================
// SAVE / LOAD GAME
// ==========================================

bool saveToFile(bool whiteTurn) {
    ofstream file("chess_save.txt");
    if (!file) return false;

    for (int row = 0; row < 8; row++) {
        for (int col = 0; col < 8; col++)
            file << board[row][col];
        file << '\n';
    }

    file << whiteTurn << '\n';
    file << whiteKingMoved << ' ' << blackKingMoved << '\n';
    file << whiteRookLeftMoved << ' ' << whiteRookRightMoved << '\n';
    file << blackRookLeftMoved << ' ' << blackRookRightMoved << '\n';
    file << enPassantRow << ' ' << enPassantCol << '\n';
    return true;
}

bool loadFromFile(bool &whiteTurn) {
    ifstream file("chess_save.txt");
    if (!file) return false;

    char tempBoard[8][8];
    string line;
    for (int row = 0; row < 8; row++) {
        if (!(file >> line) || line.size() != 8) return false;
        for (int col = 0; col < 8; col++) tempBoard[row][col] = line[col];
    }

    if (!(file >> whiteTurn)) return false;
    if (!(file >> whiteKingMoved >> blackKingMoved)) return false;
    if (!(file >> whiteRookLeftMoved >> whiteRookRightMoved)) return false;
    if (!(file >> blackRookLeftMoved >> blackRookRightMoved)) return false;
    if (!(file >> enPassantRow >> enPassantCol)) return false;

    for (int row = 0; row < 8; row++)
        for (int col = 0; col < 8; col++)
            board[row][col] = tempBoard[row][col];

    history.clear();
    return true;
}

// ==========================================
// INITIALIZE BOARD
// ==========================================

void initializeBoard() {

    for (int row = 0; row < 8; row++) {

        for (int col = 0; col < 8; col++) {

            board[row][col] = '.';
        }
    }

    // Black pieces
    board[0][0] = 'r';
    board[0][1] = 'n';
    board[0][2] = 'b';
    board[0][3] = 'q';
    board[0][4] = 'k';
    board[0][5] = 'b';
    board[0][6] = 'n';
    board[0][7] = 'r';

    // Black pawns
    for (int col = 0; col < 8; col++) {
        board[1][col] = 'p';
    }

    // White pieces
    board[7][0] = 'R';
    board[7][1] = 'N';
    board[7][2] = 'B';
    board[7][3] = 'Q';
    board[7][4] = 'K';
    board[7][5] = 'B';
    board[7][6] = 'N';
    board[7][7] = 'R';

    // White pawns
    for (int col = 0; col < 8; col++) {
        board[6][col] = 'P';
    }

    // Reset game state
    whiteKingMoved = false;
    blackKingMoved = false;

    whiteRookLeftMoved = false;
    whiteRookRightMoved = false;

    blackRookLeftMoved = false;
    blackRookRightMoved = false;

    enPassantRow = -1;
    enPassantCol = -1;

    history.clear();
}

// ==========================================
// DISPLAY BOARD
// ==========================================

void displayBoard() {

    cout << "\n";

    cout << "    a b c d e f g h\n";
    cout << "  +-----------------+\n";

    for (int row = 0; row < 8; row++) {

        cout << 8 - row << " | ";

        for (int col = 0; col < 8; col++) {

            cout << board[row][col] << " ";
        }

        cout << "| " << 8 - row << "\n";
    }

    cout << "  +-----------------+\n";
    cout << "    a b c d e f g h\n";
}

// ==========================================
// POSITION CONVERSION
// ==========================================

bool convertPosition(string position,
                     int &row,
                     int &col) {

    if (position.length() != 2) {
        return false;
    }

    char file = position[0];
    char rank = position[1];

    if (file < 'a' || file > 'h') {
        return false;
    }

    if (rank < '1' || rank > '8') {
        return false;
    }

    col = file - 'a';
    row = 8 - (rank - '0');

    return true;
}

// ==========================================
// PIECE COLOR
// ==========================================

bool isWhitePiece(char piece) {

    return piece >= 'A' &&
           piece <= 'Z';
}

bool isBlackPiece(char piece) {

    return piece >= 'a' &&
           piece <= 'z';
}

// ==========================================
// PATH CLEAR
// ==========================================

bool isPathClear(int fromRow,
                 int fromCol,
                 int toRow,
                 int toCol) {

    int rowStep = 0;
    int colStep = 0;

    if (toRow > fromRow)
        rowStep = 1;
    else if (toRow < fromRow)
        rowStep = -1;

    if (toCol > fromCol)
        colStep = 1;
    else if (toCol < fromCol)
        colStep = -1;

    int row = fromRow + rowStep;
    int col = fromCol + colStep;

    while (row != toRow || col != toCol) {

        if (board[row][col] != '.') {
            return false;
        }

        row += rowStep;
        col += colStep;
    }

    return true;
}

// ==========================================
// CHECK IF SQUARE IS ATTACKED
// ==========================================

bool isSquareUnderAttack(int targetRow,
                         int targetCol,
                         bool byWhite) {

    // White pawn attacks
    if (byWhite) {

        int pawnRow = targetRow + 1;

        if (pawnRow >= 0 && pawnRow < 8) {

            if (targetCol - 1 >= 0 &&
                board[pawnRow][targetCol - 1] == 'P') {
                return true;
            }

            if (targetCol + 1 < 8 &&
                board[pawnRow][targetCol + 1] == 'P') {
                return true;
            }
        }
    }

    // Black pawn attacks
    else {

        int pawnRow = targetRow - 1;

        if (pawnRow >= 0 && pawnRow < 8) {

            if (targetCol - 1 >= 0 &&
                board[pawnRow][targetCol - 1] == 'p') {
                return true;
            }

            if (targetCol + 1 < 8 &&
                board[pawnRow][targetCol + 1] == 'p') {
                return true;
            }
        }
    }

    // Knight attacks
    int knightMoves[8][2] = {

        {-2, -1},
        {-2, 1},
        {-1, -2},
        {-1, 2},
        {1, -2},
        {1, 2},
        {2, -1},
        {2, 1}
    };

    for (int i = 0; i < 8; i++) {

        int row = targetRow + knightMoves[i][0];
        int col = targetCol + knightMoves[i][1];

        if (row >= 0 && row < 8 &&
            col >= 0 && col < 8) {

            if (byWhite &&
                board[row][col] == 'N') {
                return true;
            }

            if (!byWhite &&
                board[row][col] == 'n') {
                return true;
            }
        }
    }

    // Bishop / Queen diagonal attacks
    int diagonal[4][2] = {

        {-1, -1},
        {-1, 1},
        {1, -1},
        {1, 1}
    };

    for (int i = 0; i < 4; i++) {

        int row = targetRow + diagonal[i][0];
        int col = targetCol + diagonal[i][1];

        while (row >= 0 && row < 8 &&
               col >= 0 && col < 8) {

            char piece = board[row][col];

            if (piece != '.') {

                if (byWhite &&
                    (piece == 'B' ||
                     piece == 'Q')) {
                    return true;
                }

                if (!byWhite &&
                    (piece == 'b' ||
                     piece == 'q')) {
                    return true;
                }

                break;
            }

            row += diagonal[i][0];
            col += diagonal[i][1];
        }
    }

    // Rook / Queen straight attacks
    int straight[4][2] = {

        {-1, 0},
        {1, 0},
        {0, -1},
        {0, 1}
    };

    for (int i = 0; i < 4; i++) {

        int row = targetRow + straight[i][0];
        int col = targetCol + straight[i][1];

        while (row >= 0 && row < 8 &&
               col >= 0 && col < 8) {

            char piece = board[row][col];

            if (piece != '.') {

                if (byWhite &&
                    (piece == 'R' ||
                     piece == 'Q')) {
                    return true;
                }

                if (!byWhite &&
                    (piece == 'r' ||
                     piece == 'q')) {
                    return true;
                }

                break;
            }

            row += straight[i][0];
            col += straight[i][1];
        }
    }

    // King attacks
    for (int rowOffset = -1;
         rowOffset <= 1;
         rowOffset++) {

        for (int colOffset = -1;
             colOffset <= 1;
             colOffset++) {

            if (rowOffset == 0 &&
                colOffset == 0) {
                continue;
            }

            int row = targetRow + rowOffset;
            int col = targetCol + colOffset;

            if (row >= 0 && row < 8 &&
                col >= 0 && col < 8) {

                if (byWhite &&
                    board[row][col] == 'K') {
                    return true;
                }

                if (!byWhite &&
                    board[row][col] == 'k') {
                    return true;
                }
            }
        }
    }

    return false;
}

// ==========================================
// FIND KING
// ==========================================

bool findKing(bool whiteKing,
              int &kingRow,
              int &kingCol) {

    char king = whiteKing ? 'K' : 'k';

    for (int row = 0; row < 8; row++) {

        for (int col = 0; col < 8; col++) {

            if (board[row][col] == king) {

                kingRow = row;
                kingCol = col;

                return true;
            }
        }
    }

    return false;
}

// ==========================================
// CHECK DETECTION
// ==========================================

bool isKingInCheck(bool whiteKing) {

    int kingRow;
    int kingCol;

    if (!findKing(
            whiteKing,
            kingRow,
            kingCol)) {

        return false;
    }

    return isSquareUnderAttack(
        kingRow,
        kingCol,
        !whiteKing
    );
}

// ==========================================
// BASIC MOVE
// ==========================================

bool makeBasicMove(int fromRow,
                   int fromCol,
                   int toRow,
                   int toCol) {

    char piece = board[fromRow][fromCol];
    char destination = board[toRow][toCol];

    // White Pawn
    if (piece == 'P') {

        if (fromCol == toCol &&
            toRow == fromRow - 1 &&
            destination == '.') {

            board[toRow][toCol] = piece;
            board[fromRow][fromCol] = '.';

            return true;
        }

        if (fromCol == toCol &&
            fromRow == 6 &&
            toRow == 4 &&
            board[5][fromCol] == '.' &&
            board[4][fromCol] == '.') {

            board[toRow][toCol] = piece;
            board[fromRow][fromCol] = '.';

            return true;
        }

        if (abs(toCol - fromCol) == 1 &&
            toRow == fromRow - 1 &&
            isBlackPiece(destination)) {

            board[toRow][toCol] = piece;
            board[fromRow][fromCol] = '.';

            return true;
        }

        return false;
    }

    // Black Pawn
    if (piece == 'p') {

        if (fromCol == toCol &&
            toRow == fromRow + 1 &&
            destination == '.') {

            board[toRow][toCol] = piece;
            board[fromRow][fromCol] = '.';

            return true;
        }

        if (fromCol == toCol &&
            fromRow == 1 &&
            toRow == 3 &&
            board[2][fromCol] == '.' &&
            board[3][fromCol] == '.') {

            board[toRow][toCol] = piece;
            board[fromRow][fromCol] = '.';

            return true;
        }

        if (abs(toCol - fromCol) == 1 &&
            toRow == fromRow + 1 &&
            isWhitePiece(destination)) {

            board[toRow][toCol] = piece;
            board[fromRow][fromCol] = '.';

            return true;
        }

        return false;
    }

    // Rook
    if (piece == 'R' ||
        piece == 'r') {

        if (fromRow == toRow &&
            fromCol == toCol) {
            return false;
        }

        if (fromRow != toRow &&
            fromCol != toCol) {
            return false;
        }

        if (!isPathClear(
                fromRow,
                fromCol,
                toRow,
                toCol)) {
            return false;
        }

        board[toRow][toCol] = piece;
        board[fromRow][fromCol] = '.';

        return true;
    }

    // Knight
    if (piece == 'N' ||
        piece == 'n') {

        int rowDifference =
            abs(toRow - fromRow);

        int colDifference =
            abs(toCol - fromCol);

        if ((rowDifference == 2 &&
             colDifference == 1) ||
            (rowDifference == 1 &&
             colDifference == 2)) {

            board[toRow][toCol] = piece;
            board[fromRow][fromCol] = '.';

            return true;
        }

        return false;
    }

    // Bishop
    if (piece == 'B' ||
        piece == 'b') {

        int rowDifference =
            abs(toRow - fromRow);

        int colDifference =
            abs(toCol - fromCol);

        if (rowDifference != colDifference ||
            rowDifference == 0) {
            return false;
        }

        if (!isPathClear(
                fromRow,
                fromCol,
                toRow,
                toCol)) {
            return false;
        }

        board[toRow][toCol] = piece;
        board[fromRow][fromCol] = '.';

        return true;
    }

    // Queen
    if (piece == 'Q' ||
        piece == 'q') {

        int rowDifference =
            abs(toRow - fromRow);

        int colDifference =
            abs(toCol - fromCol);

        bool straight =
            fromRow == toRow ||
            fromCol == toCol;

        bool diagonal =
            rowDifference == colDifference;

        if (!straight && !diagonal) {
            return false;
        }

        if (rowDifference == 0 &&
            colDifference == 0) {
            return false;
        }

        if (!isPathClear(
                fromRow,
                fromCol,
                toRow,
                toCol)) {
            return false;
        }

        board[toRow][toCol] = piece;
        board[fromRow][fromCol] = '.';

        return true;
    }

    // King
    if (piece == 'K' ||
        piece == 'k') {

        int rowDifference =
            abs(toRow - fromRow);

        int colDifference =
            abs(toCol - fromCol);

        if (rowDifference <= 1 &&
            colDifference <= 1 &&
            rowDifference + colDifference > 0) {

            board[toRow][toCol] = piece;
            board[fromRow][fromCol] = '.';

            return true;
        }

        return false;
    }

    return false;
}

// ==========================================
// CASTLING
// ==========================================

bool performCastling(int fromRow,
                     int fromCol,
                     int toRow,
                     int toCol,
                     bool whiteTurn) {

    // White Kingside
    if (whiteTurn &&
        fromRow == 7 &&
        fromCol == 4 &&
        toRow == 7 &&
        toCol == 6) {

        if (whiteKingMoved ||
            whiteRookRightMoved)
            return false;

        if (board[7][5] != '.' ||
            board[7][6] != '.')
            return false;

        if (board[7][7] != 'R')
            return false;

        if (isSquareUnderAttack(7, 4, false) ||
            isSquareUnderAttack(7, 5, false) ||
            isSquareUnderAttack(7, 6, false))
            return false;

        board[7][4] = '.';
        board[7][6] = 'K';

        board[7][7] = '.';
        board[7][5] = 'R';

        whiteKingMoved = true;
        whiteRookRightMoved = true;

        return true;
    }

    // White Queenside
    if (whiteTurn &&
        fromRow == 7 &&
        fromCol == 4 &&
        toRow == 7 &&
        toCol == 2) {

        if (whiteKingMoved ||
            whiteRookLeftMoved)
            return false;

        if (board[7][1] != '.' ||
            board[7][2] != '.' ||
            board[7][3] != '.')
            return false;

        if (board[7][0] != 'R')
            return false;

        if (isSquareUnderAttack(7, 4, false) ||
            isSquareUnderAttack(7, 3, false) ||
            isSquareUnderAttack(7, 2, false))
            return false;

        board[7][4] = '.';
        board[7][2] = 'K';

        board[7][0] = '.';
        board[7][3] = 'R';

        whiteKingMoved = true;
        whiteRookLeftMoved = true;

        return true;
    }

    // Black Kingside
    if (!whiteTurn &&
        fromRow == 0 &&
        fromCol == 4 &&
        toRow == 0 &&
        toCol == 6) {

        if (blackKingMoved ||
            blackRookRightMoved)
            return false;

        if (board[0][5] != '.' ||
            board[0][6] != '.')
            return false;

        if (board[0][7] != 'r')
            return false;

        if (isSquareUnderAttack(0, 4, true) ||
            isSquareUnderAttack(0, 5, true) ||
            isSquareUnderAttack(0, 6, true))
            return false;

        board[0][4] = '.';
        board[0][6] = 'k';

        board[0][7] = '.';
        board[0][5] = 'r';

        blackKingMoved = true;
        blackRookRightMoved = true;

        return true;
    }

    // Black Queenside
    if (!whiteTurn &&
        fromRow == 0 &&
        fromCol == 4 &&
        toRow == 0 &&
        toCol == 2) {

        if (blackKingMoved ||
            blackRookLeftMoved)
            return false;

        if (board[0][1] != '.' ||
            board[0][2] != '.' ||
            board[0][3] != '.')
            return false;

        if (board[0][0] != 'r')
            return false;

        if (isSquareUnderAttack(0, 4, true) ||
            isSquareUnderAttack(0, 3, true) ||
            isSquareUnderAttack(0, 2, true))
            return false;

        board[0][4] = '.';
        board[0][2] = 'k';

        board[0][0] = '.';
        board[0][3] = 'r';

        blackKingMoved = true;
        blackRookLeftMoved = true;

        return true;
    }

    return false;
}

// ==========================================
// UPDATE MOVEMENT STATUS
// ==========================================

void updatePieceMovementStatus(char piece,
                               int fromRow,
                               int fromCol) {

    if (piece == 'K')
        whiteKingMoved = true;

    if (piece == 'k')
        blackKingMoved = true;

    if (piece == 'R') {

        if (fromRow == 7 &&
            fromCol == 0)
            whiteRookLeftMoved = true;

        if (fromRow == 7 &&
            fromCol == 7)
            whiteRookRightMoved = true;
    }

    if (piece == 'r') {

        if (fromRow == 0 &&
            fromCol == 0)
            blackRookLeftMoved = true;

        if (fromRow == 0 &&
            fromCol == 7)
            blackRookRightMoved = true;
    }
}

// ==========================================
// EN PASSANT
// ==========================================

bool performEnPassant(int fromRow,
                      int fromCol,
                      int toRow,
                      int toCol,
                      bool whiteTurn) {

    if (toRow != enPassantRow ||
        toCol != enPassantCol)
        return false;

    if (whiteTurn &&
        board[fromRow][fromCol] == 'P' &&
        abs(toCol - fromCol) == 1 &&
        toRow == fromRow - 1 &&
        board[toRow][toCol] == '.') {

        int capturedRow = fromRow;
        int capturedCol = toCol;

        if (board[capturedRow][capturedCol] != 'p')
            return false;

        board[toRow][toCol] = 'P';
        board[fromRow][fromCol] = '.';
        board[capturedRow][capturedCol] = '.';

        return true;
    }

    if (!whiteTurn &&
        board[fromRow][fromCol] == 'p' &&
        abs(toCol - fromCol) == 1 &&
        toRow == fromRow + 1 &&
        board[toRow][toCol] == '.') {

        int capturedRow = fromRow;
        int capturedCol = toCol;

        if (board[capturedRow][capturedCol] != 'P')
            return false;

        board[toRow][toCol] = 'p';
        board[fromRow][fromCol] = '.';
        board[capturedRow][capturedCol] = '.';

        return true;
    }

    return false;
}

// ==========================================
// PAWN PROMOTION
// ==========================================

void promotePawn(int row, int col) {

    char pawn = board[row][col];

    if (pawn != 'P' &&
        pawn != 'p')
        return;

    if (pawn == 'P' && row == 0) {

        char choice;

        cout << "\nWHITE PAWN PROMOTION\n";
        cout << "Q - Queen\n";
        cout << "R - Rook\n";
        cout << "B - Bishop\n";
        cout << "N - Knight\n";

        do {

            cout << "Enter choice: ";
            cin >> choice;

            choice = toupper(choice);

        } while (choice != 'Q' &&
                 choice != 'R' &&
                 choice != 'B' &&
                 choice != 'N');

        board[row][col] = choice;
    }

    else if (pawn == 'p' && row == 7) {

        char choice;

        cout << "\nBLACK PAWN PROMOTION\n";
        cout << "Q - Queen\n";
        cout << "R - Rook\n";
        cout << "B - Bishop\n";
        cout << "N - Knight\n";

        do {

            cout << "Enter choice: ";
            cin >> choice;

            choice = toupper(choice);

        } while (choice != 'Q' &&
                 choice != 'R' &&
                 choice != 'B' &&
                 choice != 'N');

        if (choice == 'Q')
            board[row][col] = 'q';

        else if (choice == 'R')
            board[row][col] = 'r';

        else if (choice == 'B')
            board[row][col] = 'b';

        else
            board[row][col] = 'n';
    }
}

// ==========================================
// MOVE PIECE
// ==========================================

bool movePiece(string from,
               string to,
               bool whiteTurn) {

    int fromRow, fromCol;
    int toRow, toCol;

    if (!convertPosition(
            from, fromRow, fromCol) ||
        !convertPosition(
            to, toRow, toCol)) {

        cout << "Invalid position!\n";
        cout << "Use format like e2 e4.\n";

        return false;
    }

    char piece = board[fromRow][fromCol];
    char destination = board[toRow][toCol];

    if (piece == '.') {

        cout << "There is no piece at "
             << from << ".\n";

        return false;
    }

    if (whiteTurn &&
        isBlackPiece(piece)) {

        cout << "It is White's turn.\n";

        return false;
    }

    if (!whiteTurn &&
        isWhitePiece(piece)) {

        cout << "It is Black's turn.\n";

        return false;
    }

    if (whiteTurn &&
        isWhitePiece(destination)) {

        cout << "You cannot capture your own piece.\n";

        return false;
    }

    if (!whiteTurn &&
        isBlackPiece(destination)) {

        cout << "You cannot capture your own piece.\n";

        return false;
    }

    // Save state before move
    saveGameState(whiteTurn);

    // En Passant
    if ((piece == 'P' || piece == 'p') &&
        destination == '.' &&
        toRow == enPassantRow &&
        toCol == enPassantCol) {

        if (performEnPassant(
                fromRow,
                fromCol,
                toRow,
                toCol,
                whiteTurn)) {

            if (isKingInCheck(whiteTurn)) {

                undoMove(whiteTurn);

                cout << "Illegal En Passant!\n";

                return false;
            }

            enPassantRow = -1;
            enPassantCol = -1;

            return true;
        }
    }

    // Castling
    if ((piece == 'K' ||
         piece == 'k') &&
        abs(toCol - fromCol) == 2) {

        if (performCastling(
                fromRow,
                fromCol,
                toRow,
                toCol,
                whiteTurn)) {

            if (isKingInCheck(whiteTurn)) {

                undoMove(whiteTurn);

                cout << "Illegal castling!\n";

                return false;
            }

            enPassantRow = -1;
            enPassantCol = -1;

            return true;
        }

        history.pop_back();

        cout << "Invalid castling move.\n";

        return false;
    }

    // Normal move
    if (!makeBasicMove(
            fromRow,
            fromCol,
            toRow,
            toCol)) {

        history.pop_back();

        cout << "Invalid move for this piece.\n";

        return false;
    }

    // Prevent moving into check
    if (isKingInCheck(whiteTurn)) {

        undoMove(whiteTurn);

        cout << "\nIllegal move!\n";
        cout << "Your King would be in check.\n";

        return false;
    }

    updatePieceMovementStatus(
        piece,
        fromRow,
        fromCol
    );

    // En Passant target
    if (piece == 'P' &&
        fromRow == 6 &&
        toRow == 4) {

        enPassantRow = 5;
        enPassantCol = fromCol;
    }

    else if (piece == 'p' &&
             fromRow == 1 &&
             toRow == 3) {

        enPassantRow = 2;
        enPassantCol = fromCol;
    }

    else {

        enPassantRow = -1;
        enPassantCol = -1;
    }

    // Promotion
    promotePawn(toRow, toCol);

    return true;
}

// ==========================================
// CHECK FOR LEGAL MOVES
// ==========================================

bool hasLegalMove(bool whiteTurn) {

    GameState current;

    for (int row = 0; row < 8; row++) {

        for (int col = 0; col < 8; col++) {

            current.board[row][col] =
                board[row][col];
        }
    }

    current.whiteKingMoved =
        whiteKingMoved;

    current.blackKingMoved =
        blackKingMoved;

    current.whiteRookLeftMoved =
        whiteRookLeftMoved;

    current.whiteRookRightMoved =
        whiteRookRightMoved;

    current.blackRookLeftMoved =
        blackRookLeftMoved;

    current.blackRookRightMoved =
        blackRookRightMoved;

    current.enPassantRow =
        enPassantRow;

    current.enPassantCol =
        enPassantCol;

    current.whiteTurn =
        whiteTurn;

    for (int fromRow = 0;
         fromRow < 8;
         fromRow++) {

        for (int fromCol = 0;
             fromCol < 8;
             fromCol++) {

            char piece =
                board[fromRow][fromCol];

            if (piece == '.')
                continue;

            if (whiteTurn &&
                !isWhitePiece(piece))
                continue;

            if (!whiteTurn &&
                !isBlackPiece(piece))
                continue;

            for (int toRow = 0;
                 toRow < 8;
                 toRow++) {

                for (int toCol = 0;
                     toCol < 8;
                     toCol++) {

                    char destination =
                        board[toRow][toCol];

                    if (whiteTurn &&
                        isWhitePiece(destination))
                        continue;

                    if (!whiteTurn &&
                        isBlackPiece(destination))
                        continue;

                    if (makeBasicMove(
                            fromRow,
                            fromCol,
                            toRow,
                            toCol)) {

                        bool safe =
                            !isKingInCheck(
                                whiteTurn);

                        for (int r = 0; r < 8; r++) {

                            for (int c = 0; c < 8; c++) {

                                board[r][c] =
                                    current.board[r][c];
                            }
                        }

                        if (safe) {

                            whiteKingMoved =
                                current.whiteKingMoved;

                            blackKingMoved =
                                current.blackKingMoved;

                            whiteRookLeftMoved =
                                current.whiteRookLeftMoved;

                            whiteRookRightMoved =
                                current.whiteRookRightMoved;

                            blackRookLeftMoved =
                                current.blackRookLeftMoved;

                            blackRookRightMoved =
                                current.blackRookRightMoved;

                            enPassantRow =
                                current.enPassantRow;

                            enPassantCol =
                                current.enPassantCol;

                            return true;
                        }
                    }
                }
            }
        }
    }

    for (int row = 0; row < 8; row++) {

        for (int col = 0; col < 8; col++) {

            board[row][col] =
                current.board[row][col];
        }
    }

    whiteKingMoved =
        current.whiteKingMoved;

    blackKingMoved =
        current.blackKingMoved;

    whiteRookLeftMoved =
        current.whiteRookLeftMoved;

    whiteRookRightMoved =
        current.whiteRookRightMoved;

    blackRookLeftMoved =
        current.blackRookLeftMoved;

    blackRookRightMoved =
        current.blackRookRightMoved;

    enPassantRow =
        current.enPassantRow;

    enPassantCol =
        current.enPassantCol;

    return false;
}

// ==========================================
// INSTRUCTIONS
// ==========================================

void showInstructions() {

    system("cls");

    cout << "=========================================\n";
    cout << "             CHESS INSTRUCTIONS\n";
    cout << "=========================================\n\n";

    cout << "1. HOW TO MOVE\n";
    cout << "-----------------------------------------\n";
    cout << "Enter the starting and ending squares.\n";
    cout << "Example:\n";
    cout << "e2 e4\n\n";

    cout << "2. PIECES\n";
    cout << "-----------------------------------------\n";
    cout << "P/p = Pawn\n";
    cout << "R/r = Rook\n";
    cout << "N/n = Knight\n";
    cout << "B/b = Bishop\n";
    cout << "Q/q = Queen\n";
    cout << "K/k = King\n\n";

    cout << "Uppercase pieces = White\n";
    cout << "Lowercase pieces = Black\n\n";

    cout << "3. COMMANDS\n";
    cout << "-----------------------------------------\n";
    cout << "undo  = Undo the previous move\n";
    cout << "save  = Save the current game\n";
    cout << "load  = Load the saved game\n";
    cout << "reset = Restart the game\n";
    cout << "exit  = Exit the game\n\n";

    cout << "4. SPECIAL MOVES\n";
    cout << "-----------------------------------------\n";
    cout << "Castling is supported.\n";
    cout << "En Passant is supported.\n";
    cout << "Pawn Promotion is supported.\n\n";

    cout << "5. GAME RULES\n";
    cout << "-----------------------------------------\n";
    cout << "Check, Checkmate and Stalemate are detected.\n";
    cout << "Illegal moves that expose your King to check\n";
    cout << "are not allowed.\n\n";

    cout << "Press ENTER to return to the main menu...";

    cin.ignore();
    cin.get();
}

// ==========================================
// PLAY GAME
// ==========================================

void startGame() {

    initializeBoard();

    bool whiteTurn = true;

    while (true) {

        system("cls");

        displayBoard();

        if (isKingInCheck(whiteTurn)) {

            cout << "\nCHECK! ";

            if (whiteTurn)
                cout << "White King is in check.\n";
            else
                cout << "Black King is in check.\n";
        }

        if (!hasLegalMove(whiteTurn)) {

            if (isKingInCheck(whiteTurn)) {

                cout << "\n=================================\n";
                cout << "           CHECKMATE!\n";
                cout << "=================================\n";

                if (whiteTurn)
                    cout << "Black wins!\n";
                else
                    cout << "White wins!\n";
            }

            else {

                cout << "\n=================================\n";
                cout << "            STALEMATE!\n";
                cout << "=================================\n";

                cout << "The game is a draw.\n";
            }

            cout << "\nPress ENTER to return to menu...";

            cin.ignore();
            cin.get();

            break;
        }

        if (whiteTurn)
            cout << "\nWhite's turn\n";
        else
            cout << "\nBlack's turn\n";

        cout << "\nCommands: undo | save | load | reset | exit\n";

        string from;

        cout << "Enter move: ";
        cin >> from;

        if (from == "undo") {

            undoMove(whiteTurn);

            cout << "\nPress ENTER to continue...";

            cin.ignore();
            cin.get();

            continue;
        }

        if (from == "save") {
            if (saveToFile(whiteTurn))
                cout << "\nGame saved successfully to chess_save.txt.";
            else
                cout << "\nCould not save the game.";
            cout << "\nPress ENTER to continue...";
            cin.ignore();
            cin.get();
            continue;
        }

        if (from == "load") {
            if (loadFromFile(whiteTurn))
                cout << "\nGame loaded successfully from chess_save.txt.";
            else
                cout << "\nNo valid saved game found.";
            cout << "\nPress ENTER to continue...";
            cin.ignore();
            cin.get();
            continue;
        }

        if (from == "reset") {

            initializeBoard();

            whiteTurn = true;

            cout << "\nGame restarted!";

            cout << "\nPress ENTER to continue...";

            cin.ignore();
            cin.get();

            continue;
        }

        if (from == "exit") {

            cout << "\nReturning to main menu...";

            cout << "\nPress ENTER to continue...";

            cin.ignore();
            cin.get();

            break;
        }

        string to;

        cin >> to;

        if (movePiece(
                from,
                to,
                whiteTurn)) {

            whiteTurn = !whiteTurn;
        }
        else {

            cout << "\nPress ENTER to continue...";

            cin.ignore();
            cin.get();
        }
    }
}

// ==========================================
// MAIN MENU
// ==========================================

void mainMenu() {

    while (true) {

        system("cls");

        cout << "=========================================\n";
        cout << "               CHESS GAME\n";
        cout << "=========================================\n\n";

        cout << "              MAIN MENU\n\n";

        cout << "1. Start Game\n";
        cout << "2. Instructions\n";
        cout << "3. Exit\n\n";

        cout << "=========================================\n";

        int choice;

        cout << "Enter your choice: ";
        cin >> choice;

        if (choice == 1) {

            startGame();
        }

        else if (choice == 2) {

            showInstructions();
        }

        else if (choice == 3) {

            cout << "\nThank you for playing!\n";

            break;
        }

        else {

            cout << "\nInvalid choice!\n";

            cout << "Press ENTER to try again...";

            cin.ignore();
            cin.get();
        }
    }
}

// ==========================================
// MAIN
// ==========================================

int main() {

    mainMenu();

    return 0;
}