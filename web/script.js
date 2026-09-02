// ============================================================
// CHESS GAME - COMPLETE SCRIPT
// ============================================================
// Includes:
// - All piece movements
// - Capturing
// - Turn system
// - Check detection
// - Illegal move protection
// - Castling
// - En Passant
// - Pawn promotion
// - Checkmate
// - Stalemate
// - Undo
// - Save / Load
// - New Game
// - Move history
// ============================================================


// ============================================================
// DOM ELEMENTS
// ============================================================

const chessboard = document.querySelector(".chessboard");
const turnDisplay = document.querySelector(".turn-card strong");
const message = document.querySelector(".message");
const movesContainer = document.querySelector(".moves");


// ============================================================
// GAME VARIABLES
// ============================================================

let selectedSquare = null;
let whiteTurn = true;
let gameOver = false;

let moveNumber = 1;


// ============================================================
// CASTLING TRACKING
// ============================================================

let whiteKingMoved = false;
let blackKingMoved = false;

let whiteKingsideRookMoved = false;
let whiteQueensideRookMoved = false;

let blackKingsideRookMoved = false;
let blackQueensideRookMoved = false;


// ============================================================
// EN PASSANT TRACKING
// ============================================================

let enPassantRow = -1;
let enPassantCol = -1;

let enPassantPawnRow = -1;
let enPassantPawnCol = -1;


// ============================================================
// MOVE HISTORY FOR UNDO
// ============================================================

let moveHistory = [];


// ============================================================
// PIECES
// ============================================================

const pieces = {

    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    p: "♟",

    R: "♖",
    N: "♘",
    B: "♗",
    Q: "♕",
    K: "♔",
    P: "♙"
};


// ============================================================
// STARTING BOARD
// ============================================================

let board = [

    ["r", "n", "b", "q", "k", "b", "n", "r"],

    ["p", "p", "p", "p", "p", "p", "p", "p"],

    [".", ".", ".", ".", ".", ".", ".", "."],

    [".", ".", ".", ".", ".", ".", ".", "."],

    [".", ".", ".", ".", ".", ".", ".", "."],

    [".", ".", ".", ".", ".", ".", ".", "."],

    ["P", "P", "P", "P", "P", "P", "P", "P"],

    ["R", "N", "B", "Q", "K", "B", "N", "R"]
];


// ============================================================
// CREATE BOARD
// ============================================================

function createBoard() {

    chessboard.innerHTML = "";

    for (let row = 0; row < 8; row++) {

        for (let col = 0; col < 8; col++) {

            const square = document.createElement("div");

            square.classList.add("square");

            if ((row + col) % 2 === 0) {
                square.classList.add("light");
            } else {
                square.classList.add("dark");
            }

            square.dataset.row = row;
            square.dataset.col = col;

            const piece = board[row][col];

            // ----------------------------------------------------
            // DISPLAY PIECE
            // ----------------------------------------------------

            if (piece !== ".") {
                square.textContent = pieces[piece];
            }

            // ----------------------------------------------------
            // SELECTED PIECE
            // ----------------------------------------------------

            if (
                selectedSquare &&
                selectedSquare.row === row &&
                selectedSquare.col === col
            ) {
                square.classList.add("selected");
            }

            // ----------------------------------------------------
            // LEGAL MOVE INDICATORS
            // ----------------------------------------------------

            if (selectedSquare) {

                const selectedPiece =
                    board[
                        selectedSquare.row
                    ][
                        selectedSquare.col
                    ];

                const targetPiece =
                    board[row][col];

                const sameColor =
                    (
                        isWhite(selectedPiece) &&
                        isWhite(targetPiece)
                    ) ||
                    (
                        isBlack(selectedPiece) &&
                        isBlack(targetPiece)
                    );

                if (!sameColor) {

                    const legal =
                        isMoveActuallyLegal(
                            selectedSquare.row,
                            selectedSquare.col,
                            row,
                            col,
                            whiteTurn
                        );

                    if (legal) {

                        if (targetPiece === ".") {

                            square.classList.add(
                                "legal-move"
                            );

                        } else {

                            square.classList.add(
                                "legal-capture"
                            );
                        }
                    }
                }
            }

            // ----------------------------------------------------
            // CLICK EVENT
            // ----------------------------------------------------

            square.addEventListener(
                "click",
                squareClicked
            );

            chessboard.appendChild(square);
        }
    }

    highlightKingInCheck();
}

// ============================================================
// CLICK SQUARE
// ============================================================

function squareClicked(event) {

    if (gameOver) {
        return;
    }

    const square = event.currentTarget;

    const row = Number(square.dataset.row);
    const col = Number(square.dataset.col);

    const piece = board[row][col];


    // --------------------------------------------------------
    // SELECT PIECE
    // --------------------------------------------------------

    if (selectedSquare === null) {

        if (piece === ".") {
            return;
        }


        if (whiteTurn && isBlack(piece)) {

            message.textContent =
                "It's White's turn.";

            return;
        }


        if (!whiteTurn && isWhite(piece)) {

            message.textContent =
                "It's Black's turn.";

            return;
        }


        selectedSquare = {
    row: row,
    col: col
};

createBoard();

message.textContent =
    "Piece selected. Choose a destination.";

return;
}


    // --------------------------------------------------------
    // CLICK SAME SQUARE
    // --------------------------------------------------------

    if (
        selectedSquare.row === row &&
        selectedSquare.col === col
    ) {

        selectedSquare = null;

        createBoard();

        updateMessage();

        return;
    }


    // --------------------------------------------------------
    // ATTEMPT MOVE
    // --------------------------------------------------------

    attemptMove(
        selectedSquare.row,
        selectedSquare.col,
        row,
        col
    );
}


// ============================================================
// ATTEMPT MOVE
// ============================================================

function attemptMove(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    const piece = board[fromRow][fromCol];

    const destination = board[toRow][toCol];


    // --------------------------------------------------------
    // CANNOT CAPTURE OWN PIECE
    // --------------------------------------------------------

    if (
        (isWhite(piece) && isWhite(destination)) ||
        (isBlack(piece) && isBlack(destination))
    ) {

        message.textContent =
            "You cannot capture your own piece.";

        return;
    }


    // --------------------------------------------------------
    // CHECK SPECIAL MOVE
    // --------------------------------------------------------

    let castling = null;

    let enPassant = false;


    if (
        piece === "K" ||
        piece === "k"
    ) {

        castling = getCastlingType(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }


    enPassant =
        isValidEnPassant(
            piece,
            fromRow,
            fromCol,
            toRow,
            toCol
        );


    // --------------------------------------------------------
    // NORMAL MOVE VALIDATION
    // --------------------------------------------------------

    if (
        !isValidMove(
            piece,
            fromRow,
            fromCol,
            toRow,
            toCol
        ) &&
        castling === null &&
        !enPassant
    ) {

        message.textContent =
            "Illegal move for this piece.";

        return;
    }


    // --------------------------------------------------------
    // CASTLING VALIDATION
    // --------------------------------------------------------

    if (castling !== null) {

        if (
            !canCastle(
                piece,
                castling
            )
        ) {

            message.textContent =
                "Castling is not allowed.";

            return;
        }
    }


    // --------------------------------------------------------
    // SAVE STATE BEFORE MOVE
    // --------------------------------------------------------

    const previousState =
        saveCurrentState();


    // --------------------------------------------------------
    // CAPTURED PIECE
    // --------------------------------------------------------

    let capturedPiece =
        board[toRow][toCol];


    // --------------------------------------------------------
    // NORMAL MOVE
    // --------------------------------------------------------

    board[fromRow][fromCol] = ".";

    board[toRow][toCol] = piece;


    // --------------------------------------------------------
    // EN PASSANT CAPTURE
    // --------------------------------------------------------

    if (enPassant) {

        capturedPiece =
            board[
                enPassantPawnRow
            ][
                enPassantPawnCol
            ];

        board[
            enPassantPawnRow
        ][
            enPassantPawnCol
        ] = ".";
    }


    // --------------------------------------------------------
    // CASTLING ROOK MOVE
    // --------------------------------------------------------

    if (castling !== null) {

        const rook =
            board[
                castling.rookFromRow
            ][
                castling.rookFromCol
            ];


        board[
            castling.rookFromRow
        ][
            castling.rookFromCol
        ] = ".";


        board[
            castling.rookToRow
        ][
            castling.rookToCol
        ] = rook;
    }


    // --------------------------------------------------------
    // CHECK OWN KING
    // --------------------------------------------------------

    const movingWhite =
        isWhite(piece);


    if (
        isKingInCheck(movingWhite)
    ) {

        restoreState(previousState);

        selectedSquare = null;

        createBoard();

        message.textContent =
            "Illegal move! Your king is in check.";

        return;
    }


    // --------------------------------------------------------
    // UPDATE CASTLING RIGHTS
    // --------------------------------------------------------

    updatePieceMovementHistory(
        piece,
        fromRow,
        fromCol
    );


    // If a rook is captured on its original square,
    // its castling right is also removed.

    updateCapturedRookRights(
        capturedPiece,
        toRow,
        toCol
    );


    // --------------------------------------------------------
    // UPDATE EN PASSANT
    // --------------------------------------------------------

    enPassantRow = -1;
    enPassantCol = -1;

    enPassantPawnRow = -1;
    enPassantPawnCol = -1;


    if (
        piece === "P" &&
        fromRow === 6 &&
        toRow === 4
    ) {

        enPassantRow = 5;
        enPassantCol = fromCol;

        enPassantPawnRow = toRow;
        enPassantPawnCol = toCol;
    }


    if (
        piece === "p" &&
        fromRow === 1 &&
        toRow === 3
    ) {

        enPassantRow = 2;
        enPassantCol = fromCol;

        enPassantPawnRow = toRow;
        enPassantPawnCol = toCol;
    }


    // --------------------------------------------------------
    // SAVE MOVE FOR UNDO
    // --------------------------------------------------------

    moveHistory.push(previousState);


    // --------------------------------------------------------
    // MOVE HISTORY DISPLAY
    // --------------------------------------------------------

    addMove(
        fromRow,
        fromCol,
        toRow,
        toCol,
        castling,
        enPassant,
        capturedPiece
    );


    // --------------------------------------------------------
    // PAWN PROMOTION
    // --------------------------------------------------------

    if (
        piece === "P" &&
        toRow === 0
    ) {

        promotePawn(
            toRow,
            toCol,
            true
        );

        return;
    }


    if (
        piece === "p" &&
        toRow === 7
    ) {

        promotePawn(
            toRow,
            toCol,
            false
        );

        return;
    }


    // --------------------------------------------------------
    // FINISH MOVE
    // --------------------------------------------------------

    finishMove();
}


// ============================================================
// FINISH MOVE
// ============================================================

function finishMove() {

    selectedSquare = null;

    whiteTurn = !whiteTurn;

    moveNumber++;

    createBoard();

    updateTurn();

    checkGameState();
}


// ============================================================
// CHECK GAME STATE
// ============================================================

function checkGameState() {

    const currentPlayer =
        whiteTurn;


    const inCheck =
        isKingInCheck(currentPlayer);


    const hasMove =
        playerHasLegalMove(currentPlayer);


    // --------------------------------------------------------
    // CHECKMATE
    // --------------------------------------------------------

    if (
        inCheck &&
        !hasMove
    ) {

        gameOver = true;

        const winner =
            currentPlayer
                ? "Black"
                : "White";


        message.textContent =
            `Checkmate! ${winner} wins!`;

        updateTurn();

        return;
    }


    // --------------------------------------------------------
    // STALEMATE
    // --------------------------------------------------------

    if (
        !inCheck &&
        !hasMove
    ) {

        gameOver = true;

        message.textContent =
            "Stalemate! The game is a draw.";

        return;
    }


    // --------------------------------------------------------
    // CHECK
    // --------------------------------------------------------

    if (inCheck) {

        if (currentPlayer) {

            message.textContent =
                "White is in check!";

        } else {

            message.textContent =
                "Black is in check!";
        }

        return;
    }


    updateMessage();
}


// ============================================================
// CHECK IF PLAYER HAS ANY LEGAL MOVE
// ============================================================

function playerHasLegalMove(white) {

    for (let fromRow = 0; fromRow < 8; fromRow++) {

        for (let fromCol = 0; fromCol < 8; fromCol++) {

            const piece =
                board[fromRow][fromCol];


            if (piece === ".") {
                continue;
            }


            if (
                white &&
                !isWhite(piece)
            ) {
                continue;
            }


            if (
                !white &&
                !isBlack(piece)
            ) {
                continue;
            }


            for (
                let toRow = 0;
                toRow < 8;
                toRow++
            ) {

                for (
                    let toCol = 0;
                    toCol < 8;
                    toCol++
                ) {

                    if (
                        isMoveActuallyLegal(
                            fromRow,
                            fromCol,
                            toRow,
                            toCol,
                            white
                        )
                    ) {

                        return true;
                    }
                }
            }
        }
    }


    return false;
}


// ============================================================
// CHECK WHETHER A MOVE IS ACTUALLY LEGAL
// ============================================================

function isMoveActuallyLegal(
    fromRow,
    fromCol,
    toRow,
    toCol,
    white
) {

    const piece =
        board[fromRow][fromCol];

    const destination =
        board[toRow][toCol];


    if (piece === ".") {
        return false;
    }


    if (
        white !== isWhite(piece)
    ) {
        return false;
    }


    if (
        (isWhite(piece) && isWhite(destination)) ||
        (isBlack(piece) && isBlack(destination))
    ) {
        return false;
    }


    const castling =
        getCastlingType(
            fromRow,
            fromCol,
            toRow,
            toCol
        );


    const enPassant =
        isValidEnPassant(
            piece,
            fromRow,
            fromCol,
            toRow,
            toCol
        );


    if (
        !isValidMove(
            piece,
            fromRow,
            fromCol,
            toRow,
            toCol
        ) &&
        castling === null &&
        !enPassant
    ) {

        return false;
    }


    if (
        castling !== null &&
        !canCastle(
            piece,
            castling
        )
    ) {

        return false;
    }


    const state =
        saveCurrentState();


    board[fromRow][fromCol] = ".";

    board[toRow][toCol] = piece;


    if (enPassant) {

        board[
            enPassantPawnRow
        ][
            enPassantPawnCol
        ] = ".";
    }


    if (castling !== null) {

        const rook =
            board[
                castling.rookFromRow
            ][
                castling.rookFromCol
            ];


        board[
            castling.rookFromRow
        ][
            castling.rookFromCol
        ] = ".";


        board[
            castling.rookToRow
        ][
            castling.rookToCol
        ] = rook;
    }


    const legal =
        !isKingInCheck(white);


    restoreState(state);


    return legal;
}


// ============================================================
// VALIDATE PIECE MOVEMENT
// ============================================================

function isValidMove(
    piece,
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    if (piece === ".") {
        return false;
    }


    // ========================================================
    // WHITE PAWN
    // ========================================================

    if (piece === "P") {

        if (
            fromCol === toCol &&
            toRow === fromRow - 1 &&
            board[toRow][toCol] === "."
        ) {

            return true;
        }


        if (
            fromCol === toCol &&
            fromRow === 6 &&
            toRow === 4 &&
            board[5][fromCol] === "." &&
            board[4][fromCol] === "."
        ) {

            return true;
        }


        if (
            Math.abs(toCol - fromCol) === 1 &&
            toRow === fromRow - 1 &&
            isBlack(board[toRow][toCol])
        ) {

            return true;
        }


        return false;
    }


    // ========================================================
    // BLACK PAWN
    // ========================================================

    if (piece === "p") {

        if (
            fromCol === toCol &&
            toRow === fromRow + 1 &&
            board[toRow][toCol] === "."
        ) {

            return true;
        }


        if (
            fromCol === toCol &&
            fromRow === 1 &&
            toRow === 3 &&
            board[2][fromCol] === "." &&
            board[3][fromCol] === "."
        ) {

            return true;
        }


        if (
            Math.abs(toCol - fromCol) === 1 &&
            toRow === fromRow + 1 &&
            isWhite(board[toRow][toCol])
        ) {

            return true;
        }


        return false;
    }


    // ========================================================
    // KNIGHT
    // ========================================================

    if (
        piece === "N" ||
        piece === "n"
    ) {

        const dr =
            Math.abs(toRow - fromRow);

        const dc =
            Math.abs(toCol - fromCol);


        return (
            (dr === 2 && dc === 1) ||
            (dr === 1 && dc === 2)
        );
    }


    // ========================================================
    // BISHOP
    // ========================================================

    if (
        piece === "B" ||
        piece === "b"
    ) {

        const dr =
            Math.abs(toRow - fromRow);

        const dc =
            Math.abs(toCol - fromCol);


        if (
            dr !== dc ||
            dr === 0
        ) {

            return false;
        }


        return isPathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }


    // ========================================================
    // ROOK
    // ========================================================

    if (
        piece === "R" ||
        piece === "r"
    ) {

        if (
            fromRow !== toRow &&
            fromCol !== toCol
        ) {

            return false;
        }


        if (
            fromRow === toRow &&
            fromCol === toCol
        ) {

            return false;
        }


        return isPathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }


    // ========================================================
    // QUEEN
    // ========================================================

    if (
        piece === "Q" ||
        piece === "q"
    ) {

        const dr =
            Math.abs(toRow - fromRow);

        const dc =
            Math.abs(toCol - fromCol);


        const straight =
            fromRow === toRow ||
            fromCol === toCol;


        const diagonal =
            dr === dc;


        if (
            !straight &&
            !diagonal
        ) {

            return false;
        }


        return isPathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }


    // ========================================================
    // KING
    // ========================================================

    if (
        piece === "K" ||
        piece === "k"
    ) {

        const dr =
            Math.abs(toRow - fromRow);

        const dc =
            Math.abs(toCol - fromCol);


        return (
            dr <= 1 &&
            dc <= 1 &&
            dr + dc > 0
        );
    }


    return false;
}


// ============================================================
// PATH CLEAR
// ============================================================

function isPathClear(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    let rowStep = 0;
    let colStep = 0;


    if (toRow > fromRow) {
        rowStep = 1;
    }

    if (toRow < fromRow) {
        rowStep = -1;
    }

    if (toCol > fromCol) {
        colStep = 1;
    }

    if (toCol < fromCol) {
        colStep = -1;
    }


    let row =
        fromRow + rowStep;

    let col =
        fromCol + colStep;


    while (
        row !== toRow ||
        col !== toCol
    ) {

        if (
            board[row][col] !== "."
        ) {

            return false;
        }


        row += rowStep;
        col += colStep;
    }


    return true;
}


// ============================================================
// EN PASSANT
// ============================================================

function isValidEnPassant(
    piece,
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    if (
        piece !== "P" &&
        piece !== "p"
    ) {

        return false;
    }


    if (
        toRow !== enPassantRow ||
        toCol !== enPassantCol
    ) {

        return false;
    }


    if (
        Math.abs(toCol - fromCol) !== 1
    ) {

        return false;
    }


    if (
        piece === "P" &&
        toRow !== fromRow - 1
    ) {

        return false;
    }


    if (
        piece === "p" &&
        toRow !== fromRow + 1
    ) {

        return false;
    }


    if (
        board[enPassantPawnRow][enPassantPawnCol] !==
        (piece === "P" ? "p" : "P")
    ) {

        return false;
    }


    return true;
}


// ============================================================
// CASTLING
// ============================================================

function getCastlingType(
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    // White kingside
    if (
        fromRow === 7 &&
        fromCol === 4 &&
        toRow === 7 &&
        toCol === 6
    ) {

        return {

            type: "white-kingside",

            rookFromRow: 7,
            rookFromCol: 7,

            rookToRow: 7,
            rookToCol: 5
        };
    }


    // White queenside
    if (
        fromRow === 7 &&
        fromCol === 4 &&
        toRow === 7 &&
        toCol === 2
    ) {

        return {

            type: "white-queenside",

            rookFromRow: 7,
            rookFromCol: 0,

            rookToRow: 7,
            rookToCol: 3
        };
    }


    // Black kingside
    if (
        fromRow === 0 &&
        fromCol === 4 &&
        toRow === 0 &&
        toCol === 6
    ) {

        return {

            type: "black-kingside",

            rookFromRow: 0,
            rookFromCol: 7,

            rookToRow: 0,
            rookToCol: 5
        };
    }


    // Black queenside
    if (
        fromRow === 0 &&
        fromCol === 4 &&
        toRow === 0 &&
        toCol === 2
    ) {

        return {

            type: "black-queenside",

            rookFromRow: 0,
            rookFromCol: 0,

            rookToRow: 0,
            rookToCol: 3
        };
    }


    return null;
}


// ============================================================
// CAN CASTLE
// ============================================================

function canCastle(
    piece,
    castling
) {

    // ========================================================
    // WHITE
    // ========================================================

    if (piece === "K") {

        if (whiteKingMoved) {
            return false;
        }


        if (isKingInCheck(true)) {
            return false;
        }


        // ----------------------------------------------------
        // WHITE KINGSIDE
        // ----------------------------------------------------

        if (
            castling.type ===
            "white-kingside"
        ) {

            if (
                whiteKingsideRookMoved
            ) {

                return false;
            }


            if (
                board[7][7] !== "R"
            ) {

                return false;
            }


            if (
                board[7][5] !== "." ||
                board[7][6] !== "."
            ) {

                return false;
            }


            if (
                isSquareUnderAttack(
                    7,
                    5,
                    false
                )
            ) {

                return false;
            }


            if (
                isSquareUnderAttack(
                    7,
                    6,
                    false
                )
            ) {

                return false;
            }


            return true;
        }


        // ----------------------------------------------------
        // WHITE QUEENSIDE
        // ----------------------------------------------------

        if (
            castling.type ===
            "white-queenside"
        ) {

            if (
                whiteQueensideRookMoved
            ) {

                return false;
            }


            if (
                board[7][0] !== "R"
            ) {

                return false;
            }


            if (
                board[7][1] !== "." ||
                board[7][2] !== "." ||
                board[7][3] !== "."
            ) {

                return false;
            }


            if (
                isSquareUnderAttack(
                    7,
                    3,
                    false
                )
            ) {

                return false;
            }


            if (
                isSquareUnderAttack(
                    7,
                    2,
                    false
                )
            ) {

                return false;
            }


            return true;
        }
    }


    // ========================================================
    // BLACK
    // ========================================================

    if (piece === "k") {

        if (blackKingMoved) {
            return false;
        }


        if (isKingInCheck(false)) {
            return false;
        }


        // ----------------------------------------------------
        // BLACK KINGSIDE
        // ----------------------------------------------------

        if (
            castling.type ===
            "black-kingside"
        ) {

            if (
                blackKingsideRookMoved
            ) {

                return false;
            }


            if (
                board[0][7] !== "r"
            ) {

                return false;
            }


            if (
                board[0][5] !== "." ||
                board[0][6] !== "."
            ) {

                return false;
            }


            if (
                isSquareUnderAttack(
                    0,
                    5,
                    true
                )
            ) {

                return false;
            }


            if (
                isSquareUnderAttack(
                    0,
                    6,
                    true
                )
            ) {

                return false;
            }


            return true;
        }


        // ----------------------------------------------------
        // BLACK QUEENSIDE
        // ----------------------------------------------------

        if (
            castling.type ===
            "black-queenside"
        ) {

            if (
                blackQueensideRookMoved
            ) {

                return false;
            }


            if (
                board[0][0] !== "r"
            ) {

                return false;
            }


            if (
                board[0][1] !== "." ||
                board[0][2] !== "." ||
                board[0][3] !== "."
            ) {

                return false;
            }


            if (
                isSquareUnderAttack(
                    0,
                    3,
                    true
                )
            ) {

                return false;
            }


            if (
                isSquareUnderAttack(
                    0,
                    2,
                    true
                )
            ) {

                return false;
            }


            return true;
        }
    }


    return false;
}


// ============================================================
// FIND KING
// ============================================================

function findKing(white) {

    const king =
        white ? "K" : "k";


    for (
        let row = 0;
        row < 8;
        row++
    ) {

        for (
            let col = 0;
            col < 8;
            col++
        ) {

            if (
                board[row][col] === king
            ) {

                return {
                    row: row,
                    col: col
                };
            }
        }
    }


    return null;
}


// ============================================================
// KING IN CHECK
// ============================================================

function isKingInCheck(white) {

    const king =
        findKing(white);


    if (king === null) {
        return false;
    }


    return isSquareUnderAttack(
        king.row,
        king.col,
        !white
    );
}


// ============================================================
// SQUARE UNDER ATTACK
// ============================================================

function isSquareUnderAttack(
    row,
    col,
    byWhite
) {

    for (
        let r = 0;
        r < 8;
        r++
    ) {

        for (
            let c = 0;
            c < 8;
            c++
        ) {

            const piece =
                board[r][c];


            if (piece === ".") {
                continue;
            }


            if (
                byWhite &&
                !isWhite(piece)
            ) {

                continue;
            }


            if (
                !byWhite &&
                !isBlack(piece)
            ) {

                continue;
            }


            if (
                canPieceAttackSquare(
                    piece,
                    r,
                    c,
                    row,
                    col
                )
            ) {

                return true;
            }
        }
    }


    return false;
}


// ============================================================
// PIECE ATTACK DETECTION
// ============================================================

function canPieceAttackSquare(
    piece,
    fromRow,
    fromCol,
    toRow,
    toCol
) {

    // ========================================================
    // PAWN
    // ========================================================

    if (piece === "P") {

        return (
            Math.abs(
                toCol - fromCol
            ) === 1 &&
            toRow === fromRow - 1
        );
    }


    if (piece === "p") {

        return (
            Math.abs(
                toCol - fromCol
            ) === 1 &&
            toRow === fromRow + 1
        );
    }


    // ========================================================
    // KNIGHT
    // ========================================================

    if (
        piece === "N" ||
        piece === "n"
    ) {

        const dr =
            Math.abs(
                toRow - fromRow
            );

        const dc =
            Math.abs(
                toCol - fromCol
            );


        return (
            (dr === 2 && dc === 1) ||
            (dr === 1 && dc === 2)
        );
    }


    // ========================================================
    // BISHOP
    // ========================================================

    if (
        piece === "B" ||
        piece === "b"
    ) {

        const dr =
            Math.abs(
                toRow - fromRow
            );

        const dc =
            Math.abs(
                toCol - fromCol
            );


        if (
            dr !== dc ||
            dr === 0
        ) {

            return false;
        }


        return isPathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }


    // ========================================================
    // ROOK
    // ========================================================

    if (
        piece === "R" ||
        piece === "r"
    ) {

        if (
            fromRow !== toRow &&
            fromCol !== toCol
        ) {

            return false;
        }


        return isPathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }


    // ========================================================
    // QUEEN
    // ========================================================

    if (
        piece === "Q" ||
        piece === "q"
    ) {

        const dr =
            Math.abs(
                toRow - fromRow
            );

        const dc =
            Math.abs(
                toCol - fromCol
            );


        const straight =
            fromRow === toRow ||
            fromCol === toCol;


        const diagonal =
            dr === dc;


        if (
            !straight &&
            !diagonal
        ) {

            return false;
        }


        return isPathClear(
            fromRow,
            fromCol,
            toRow,
            toCol
        );
    }


    // ========================================================
    // KING
    // ========================================================

    if (
        piece === "K" ||
        piece === "k"
    ) {

        const dr =
            Math.abs(
                toRow - fromRow
            );

        const dc =
            Math.abs(
                toCol - fromCol
            );


        return (
            dr <= 1 &&
            dc <= 1 &&
            dr + dc > 0
        );
    }


    return false;
}


// ============================================================
// COLORS
// ============================================================

function isWhite(piece) {

    return (
        piece >= "A" &&
        piece <= "Z"
    );
}


function isBlack(piece) {

    return (
        piece >= "a" &&
        piece <= "z"
    );
}


// ============================================================
// CASTLING HISTORY
// ============================================================

function updatePieceMovementHistory(
    piece,
    fromRow,
    fromCol
) {

    if (piece === "K") {

        whiteKingMoved = true;
    }


    if (piece === "k") {

        blackKingMoved = true;
    }


    if (
        piece === "R" &&
        fromRow === 7 &&
        fromCol === 7
    ) {

        whiteKingsideRookMoved = true;
    }


    if (
        piece === "R" &&
        fromRow === 7 &&
        fromCol === 0
    ) {

        whiteQueensideRookMoved = true;
    }


    if (
        piece === "r" &&
        fromRow === 0 &&
        fromCol === 7
    ) {

        blackKingsideRookMoved = true;
    }


    if (
        piece === "r" &&
        fromRow === 0 &&
        fromCol === 0
    ) {

        blackQueensideRookMoved = true;
    }
}


// ============================================================
// UPDATE CASTLING RIGHTS WHEN ROOK IS CAPTURED
// ============================================================

function updateCapturedRookRights(
    capturedPiece,
    row,
    col
) {

    if (
        capturedPiece === "R" &&
        row === 7 &&
        col === 7
    ) {

        whiteKingsideRookMoved = true;
    }


    if (
        capturedPiece === "R" &&
        row === 7 &&
        col === 0
    ) {

        whiteQueensideRookMoved = true;
    }


    if (
        capturedPiece === "r" &&
        row === 0 &&
        col === 7
    ) {

        blackKingsideRookMoved = true;
    }


    if (
        capturedPiece === "r" &&
        row === 0 &&
        col === 0
    ) {

        blackQueensideRookMoved = true;
    }
}


// ============================================================
// PAWN PROMOTION
// ============================================================

function promotePawn(
    row,
    col,
    white
) {

    let choice =
        prompt(
            "Pawn promotion!\n" +
            "Choose: Q = Queen, R = Rook, B = Bishop, N = Knight"
        );


    if (choice === null) {
        choice = "Q";
    }


    choice =
        choice.toUpperCase();


    if (
        !["Q", "R", "B", "N"].includes(choice)
    ) {

        choice = "Q";
    }


    board[row][col] =
        white
            ? choice
            : choice.toLowerCase();


    createBoard();

    finishMove();
}


// ============================================================
// SAVE CURRENT STATE
// ============================================================

function saveCurrentState() {

    return {

        board:
            board.map(
                row => [...row]
            ),

        whiteTurn:
            whiteTurn,

        gameOver:
            gameOver,

        moveNumber:
            moveNumber,

        whiteKingMoved:
            whiteKingMoved,

        blackKingMoved:
            blackKingMoved,

        whiteKingsideRookMoved:
            whiteKingsideRookMoved,

        whiteQueensideRookMoved:
            whiteQueensideRookMoved,

        blackKingsideRookMoved:
            blackKingsideRookMoved,

        blackQueensideRookMoved:
            blackQueensideRookMoved,

        enPassantRow:
            enPassantRow,

        enPassantCol:
            enPassantCol,

        enPassantPawnRow:
            enPassantPawnRow,

        enPassantPawnCol:
            enPassantPawnCol,

        movesHTML:
            movesContainer.innerHTML
    };
}


// ============================================================
// RESTORE STATE
// ============================================================

function restoreState(state) {

    board =
        state.board.map(
            row => [...row]
        );


    whiteTurn =
        state.whiteTurn;


    gameOver =
        state.gameOver;


    moveNumber =
        state.moveNumber;


    whiteKingMoved =
        state.whiteKingMoved;


    blackKingMoved =
        state.blackKingMoved;


    whiteKingsideRookMoved =
        state.whiteKingsideRookMoved;


    whiteQueensideRookMoved =
        state.whiteQueensideRookMoved;


    blackKingsideRookMoved =
        state.blackKingsideRookMoved;


    blackQueensideRookMoved =
        state.blackQueensideRookMoved;


    enPassantRow =
        state.enPassantRow;


    enPassantCol =
        state.enPassantCol;


    enPassantPawnRow =
        state.enPassantPawnRow;


    enPassantPawnCol =
        state.enPassantPawnCol;


    movesContainer.innerHTML =
        state.movesHTML;
}


// ============================================================
// UNDO
// ============================================================

function undoMove() {

    if (
        moveHistory.length === 0
    ) {

        message.textContent =
            "There are no moves to undo.";

        return;
    }


    const previousState =
        moveHistory.pop();


    restoreState(
        previousState
    );


    selectedSquare = null;

    createBoard();

    updateTurn();

    message.textContent =
        "Last move undone.";
}


// ============================================================
// SAVE GAME
// ============================================================

function saveGame() {

    const gameData = {

        board:
            board,

        whiteTurn:
            whiteTurn,

        gameOver:
            gameOver,

        moveNumber:
            moveNumber,

        whiteKingMoved:
            whiteKingMoved,

        blackKingMoved:
            blackKingMoved,

        whiteKingsideRookMoved:
            whiteKingsideRookMoved,

        whiteQueensideRookMoved:
            whiteQueensideRookMoved,

        blackKingsideRookMoved:
            blackKingsideRookMoved,

        blackQueensideRookMoved:
            blackQueensideRookMoved,

        enPassantRow:
            enPassantRow,

        enPassantCol:
            enPassantCol,

        enPassantPawnRow:
            enPassantPawnRow,

        enPassantPawnCol:
            enPassantPawnCol,

        moveHistory:
            moveHistory,

        movesHTML:
            movesContainer.innerHTML
    };


    localStorage.setItem(
        "chessGame",
        JSON.stringify(gameData)
    );


    message.textContent =
        "Game saved successfully.";
}


// ============================================================
// LOAD GAME
// ============================================================

function loadGame() {

    const saved =
        localStorage.getItem(
            "chessGame"
        );


    if (!saved) {

        message.textContent =
            "No saved game found.";

        return;
    }


    try {

        const gameData =
            JSON.parse(saved);


        board =
            gameData.board;


        whiteTurn =
            gameData.whiteTurn;


        gameOver =
            gameData.gameOver;


        moveNumber =
            gameData.moveNumber;


        whiteKingMoved =
            gameData.whiteKingMoved;


        blackKingMoved =
            gameData.blackKingMoved;


        whiteKingsideRookMoved =
            gameData.whiteKingsideRookMoved;


        whiteQueensideRookMoved =
            gameData.whiteQueensideRookMoved;


        blackKingsideRookMoved =
            gameData.blackKingsideRookMoved;


        blackQueensideRookMoved =
            gameData.blackQueensideRookMoved;


        enPassantRow =
            gameData.enPassantRow;


        enPassantCol =
            gameData.enPassantCol;


        enPassantPawnRow =
            gameData.enPassantPawnRow;


        enPassantPawnCol =
            gameData.enPassantPawnCol;


        moveHistory =
            gameData.moveHistory || [];


        movesContainer.innerHTML =
            gameData.movesHTML;


        selectedSquare = null;


        createBoard();

        updateTurn();

        message.textContent =
            "Game loaded successfully.";


        checkGameState();

    } catch (error) {

        message.textContent =
            "Could not load the saved game.";
    }
}


// ============================================================
// MOVE HISTORY DISPLAY
// ============================================================

// ============================================================
// MOVE HISTORY DISPLAY
// ============================================================

function addMove(
    fromRow,
    fromCol,
    toRow,
    toCol,
    castling,
    enPassant,
    capturedPiece
) {

    const files = "abcdefgh";

    const from =
        files[fromCol] +
        (8 - fromRow);

    const to =
        files[toCol] +
        (8 - toRow);

    // Remove "No moves yet"
    const empty =
        movesContainer.querySelector(".empty-moves");

    if (empty) {
        empty.remove();
    }

    // Create move row
    const moveElement =
        document.createElement("div");

    moveElement.classList.add("move-row");

    // Move number
    const numberElement =
        document.createElement("span");

    numberElement.classList.add("move-number");

    numberElement.textContent =
        `${moveNumber}.`;

    // Move notation
    const notationElement =
        document.createElement("span");

    notationElement.classList.add("move-notation");

    // --------------------------------------------------------
    // CASTLING
    // --------------------------------------------------------

    if (castling !== null) {

        if (
            castling.type === "white-kingside" ||
            castling.type === "black-kingside"
        ) {

            notationElement.textContent =
                "O-O";

        } else {

            notationElement.textContent =
                "O-O-O";
        }
    }

    // --------------------------------------------------------
    // EN PASSANT
    // --------------------------------------------------------

    else if (enPassant) {

        notationElement.textContent =
            `${from} × ${to} e.p.`;
    }

    // --------------------------------------------------------
    // CAPTURE
    // --------------------------------------------------------

    else if (capturedPiece !== ".") {

        notationElement.textContent =
            `${from} × ${to}`;
    }

    // --------------------------------------------------------
    // NORMAL MOVE
    // --------------------------------------------------------

    else {

        notationElement.textContent =
            `${from} → ${to}`;
    }

    // Add elements to row
    moveElement.appendChild(numberElement);
    moveElement.appendChild(notationElement);

    // Add row to move history
    movesContainer.appendChild(moveElement);

    // Automatically scroll to latest move
    movesContainer.scrollTop =
        movesContainer.scrollHeight;
}
    // --------------------------------------------------------
    // CASTLING
    // --------------------------------------------------------

    if (castling !== null) {

        if (
            castling.type ===
                "white-kingside" ||
            castling.type ===
                "black-kingside"
        ) {

            moveElement.textContent =
                `${moveNumber}. O-O`;

        } else {

            moveElement.textContent =
                `${moveNumber}. O-O-O`;
        }

    }

    // --------------------------------------------------------
    // EN PASSANT
    // --------------------------------------------------------

    else if (enPassant) {

        moveElement.textContent =
            `${moveNumber}. ${from} × ${to} e.p.`;
    }

    // --------------------------------------------------------
    // CAPTURE
    // --------------------------------------------------------

    else if (
        capturedPiece !== "."
    ) {

        moveElement.textContent =
            `${moveNumber}. ${from} × ${to}`;
    }

    // --------------------------------------------------------
    // NORMAL MOVE
    // --------------------------------------------------------

    else {

        moveElement.textContent =
            `${moveNumber}. ${from} → ${to}`;
    }


    moveElement.style.padding =
        "8px";


    moveElement.style.color =
        "#d5d8de";


    movesContainer.appendChild(
        moveElement
    );



// ============================================================
// UPDATE TURN
// ============================================================

function updateTurn() {

    if (
        gameOver
    ) {
        return;
    }


    if (whiteTurn) {

        turnDisplay.textContent =
            "White";

    } else {

        turnDisplay.textContent =
            "Black";
    }
}


// ============================================================
// UPDATE MESSAGE
// ============================================================

function updateMessage() {

    if (gameOver) {
        return;
    }


    if (whiteTurn) {

        message.textContent =
            "White's turn — Make your move.";

    } else {

        message.textContent =
            "Black's turn — Make your move.";
    }
}


// ============================================================
// HIGHLIGHT KING IN CHECK
// ============================================================

function highlightKingInCheck() {

    const whiteKing =
        findKing(true);


    const blackKing =
        findKing(false);


    if (
        whiteKing &&
        isKingInCheck(true)
    ) {

        highlightSquare(
            whiteKing.row,
            whiteKing.col
        );
    }


    if (
        blackKing &&
        isKingInCheck(false)
    ) {

        highlightSquare(
            blackKing.row,
            blackKing.col
        );
    }
}


// ============================================================
// HIGHLIGHT SQUARE
// ============================================================

function highlightSquare(
    row,
    col
) {

    const square =
        document.querySelector(
            `.square[data-row="${row}"][data-col="${col}"]`
        );


    if (square) {

        square.classList.add(
            "king-in-check"
        );
    }
}


// ============================================================
// NEW GAME
// ============================================================

function newGame() {

    board = [

        ["r", "n", "b", "q", "k", "b", "n", "r"],

        ["p", "p", "p", "p", "p", "p", "p", "p"],

        [".", ".", ".", ".", ".", ".", ".", "."],

        [".", ".", ".", ".", ".", ".", ".", "."],

        [".", ".", ".", ".", ".", ".", ".", "."],

        [".", ".", ".", ".", ".", ".", ".", "."],

        ["P", "P", "P", "P", "P", "P", "P", "P"],

        ["R", "N", "B", "Q", "K", "B", "N", "R"]
    ];


    selectedSquare = null;

    whiteTurn = true;

    gameOver = false;

    moveNumber = 1;


    // Reset castling
    whiteKingMoved = false;
    blackKingMoved = false;

    whiteKingsideRookMoved = false;
    whiteQueensideRookMoved = false;

    blackKingsideRookMoved = false;
    blackQueensideRookMoved = false;


    // Reset en passant
    enPassantRow = -1;
    enPassantCol = -1;

    enPassantPawnRow = -1;
    enPassantPawnCol = -1;


    // Reset undo history
    moveHistory = [];


    movesContainer.innerHTML =
        '<div class="empty-moves">No moves yet</div>';


    updateTurn();

    updateMessage();

    createBoard();
}


// ============================================================
// BUTTON CONNECTIONS
// ============================================================

// New Game
const newGameButton =
    document.querySelector(".game-button");

if (newGameButton) {

    newGameButton.addEventListener(
        "click",
        newGame
    );
}


// Undo button
const undoButton =
    document.querySelector(".undo-button");

if (undoButton) {

    undoButton.addEventListener(
        "click",
        undoMove
    );
}


// Save button
const saveButton =
    document.querySelector(".save-button");

if (saveButton) {

    saveButton.addEventListener(
        "click",
        saveGame
    );
}


// Load button
const loadButton =
    document.querySelector(".load-button");

if (loadButton) {

    loadButton.addEventListener(
        "click",
        loadGame
    );
}


// ============================================================
// START GAME
// ============================================================

createBoard();

updateTurn();

updateMessage();