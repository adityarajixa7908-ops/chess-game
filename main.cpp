#include <iostream>
using namespace std;

char board[8][8];

void initializeBoard() {

    // Fill the board with empty squares
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
}

void displayBoard() {

    cout << "\n";

    for (int row = 0; row < 8; row++) {

        cout << 8 - row << "  ";

        for (int col = 0; col < 8; col++) {
            cout << board[row][col] << " ";
        }

        cout << endl;
    }

    cout << "\n   a b c d e f g h\n";
}

int main() {

    cout << "================================\n";
    cout << "          CHESS GAME\n";
    cout << "================================\n";

    initializeBoard();
    displayBoard();

    return 0;
}
