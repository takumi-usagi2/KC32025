// Othello.tsx: クイズとオセロを組み合わせたゲームの主要ロジックおよび表示を管理するコンポーネント
// ・盤面の初期化、合法手の計算、石の反転、ターンの切り替え、クイズ処理などを担当する

import React, { useEffect, useState } from 'react';
import Board from './Board';
import { useNavigate } from 'react-router-dom';
import QuizOverlay from './QuizOverlay';
import GameOverOverlay from './GameOverOverlay';

// プレイヤーは 'B'（黒） または 'W'（白） の2種類
type Player = 'B' | 'W';
// セルの状態はプレイヤーの石か空（null）
type CellValue = Player | null;

// クイズの問題・回答・画像情報を保持する型を定義
export type QuizQuestion = {
  id: string;
  question: string;
  answer: string;
  image: string;
};

const BOARD_SIZE = 8; // オセロ盤は8×8のマス目
// 8方向（上下左右および斜め）への移動を定義（石を裏返す方向を探索するために使用）
const directions = [
  { dx: -1, dy: 0 },
  { dx: -1, dy: 1 },
  { dx: 0, dy: 1 },
  { dx: 1, dy: 1 },
  { dx: 1, dy: 0 },
  { dx: 1, dy: -1 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: -1 },
];

// 初期盤面を作成する関数
// 盤面は2次元配列で、中央に初期の4つの石を配置
const initializeBoard = (): CellValue[][] => {
  const board: CellValue[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null)
  );
  const mid = BOARD_SIZE / 2;
  board[mid - 1][mid - 1] = 'W';
  board[mid][mid] = 'W';
  board[mid - 1][mid] = 'B';
  board[mid][mid - 1] = 'B';
  return board;
};

// ユーザーがクリックしたセルの情報と、クイズの問題情報を含む型
type PendingMove = {
  row: number;
  col: number;
  flips: [number, number][]; // 裏返す石の座標の配列
  quiz: QuizQuestion;
};

const Game: React.FC = () => {
  const navigate = useNavigate();
  // 各種状態管理用のuseStateフック
  const [board, setBoard] = useState<CellValue[][]>(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('B');
  const [message, setMessage] = useState<string>(''); // ユーザーへのメッセージ表示用
  const [showOverlay, setShowOverlay] = useState<boolean>(false); // クイズオーバーレイの表示状態
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null); // 現在処理中の手
  const [quizAttemptCount, setQuizAttemptCount] = useState<number>(0); // クイズの試行回数
  const [correctAnswers, setCorrectAnswers] = useState<number>(0); // 正答数
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]); // クイズ問題のリスト
  const [quizMapping, setQuizMapping] = useState<{ [key: string]: QuizQuestion }>({}); // 各セルに対するクイズを記憶
  const [gameOver, setGameOver] = useState<boolean>(false); // ゲーム終了フラグ
  const [finalScores, setFinalScores] = useState<{ black: number; white: number }>({ black: 0, white: 0 });

  // 3回不正解した後に正解を表示するかどうかのフラグ
  const [showCorrectAnswer, setShowCorrectAnswer] = useState<boolean>(false);
  // 3回不正解時に表示する正解のテキスト
  const [revealedAnswer, setRevealedAnswer] = useState<string>('');

  // コンポーネントの初回レンダリング時にCSVファイルからクイズ問題を取得
  useEffect(() => {
    fetch('/quiz/othello_quiz.csv')
      .then((res) => res.text())
      .then((csvText) => {
        const lines = csvText.trim().split('\n');
        const dataLines = lines.slice(1); // ヘッダー行を除く
        const qs: QuizQuestion[] = dataLines.map((line) => {
          const [id, q, a, image] = line.split(',');
          return { id, question: q, answer: a, image };
        });
        setQuizQuestions(qs);
      })
      .catch((error) => {
        console.error('CSVの読み込みに失敗', error);
      });
  }, []);

  // 指定されたプレイヤーが置ける合法手を取得する関数
  const getValidMovesForPlayer = (board: CellValue[][], player: Player) => {
    // 有効な手とその手で裏返す石の座標を保存するオブジェクト
    const valid: { [key: string]: [number, number][] } = {};
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const flips = getFlips(board, i, j, player);
        if (flips.length > 0) {
          valid[`${i}-${j}`] = flips;
        }
      }
    }
    return valid;
  };

  // 現在のプレイヤーの合法手を取得
  const getValidMoves = () => getValidMovesForPlayer(board, currentPlayer);

  // 指定された座標が盤面内かどうかを判定する関数
  const isOnBoard = (x: number, y: number): boolean =>
    x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;

  // 指定したセルに置いた場合に裏返せる石の座標を計算する関数
  const getFlips = (board: CellValue[][], row: number, col: number, player: Player) => {
    // すでに石が置かれているセルでは手を打てないので空の場合のみ続行
    if (board[row][col] !== null) return [];
    let flips: [number, number][] = [];
    // 8方向それぞれについて調査
    for (const { dx, dy } of directions) {
      let x = row + dx;
      let y = col + dy;
      let potential: [number, number][] = [];
      // 相手の石が連続している間はその方向に進む
      while (isOnBoard(x, y) && board[x][y] === getOpponent(player)) {
        potential.push([x, y]);
        x += dx;
        y += dy;
      }
      // 自分の石にぶつかった場合、途中の相手の石が裏返せる石となる
      if (isOnBoard(x, y) && board[x][y] === player && potential.length > 0) {
        flips = flips.concat(potential);
      }
    }
    return flips;
  };

  // 相手のプレイヤーを返す関数（'B'なら'W'、'W'なら'B'）
  const getOpponent = (player: Player): Player => (player === 'B' ? 'W' : 'B');

  // 現在の盤面のスコアを数える関数
  const countScores = (board: CellValue[][]) => {
    let black = 0;
    let white = 0;
    board.forEach(row => {
      row.forEach(cell => {
        if (cell === 'B') black++;
        if (cell === 'W') white++;
      });
    });
    return { black, white };
  };

  // ターン交代時に合法手の有無をチェックし、必要に応じてゲーム終了処理を行う関数
  const switchTurn = (currentBoard: CellValue[][], current: Player) => {
    const next = getOpponent(current);
    const nextValidMoves = getValidMovesForPlayer(currentBoard, next);

    if (Object.keys(nextValidMoves).length === 0) {
      // 次のプレイヤーが置ける手がない場合
      const currentValidMoves = getValidMovesForPlayer(currentBoard, current);
      if (Object.keys(currentValidMoves).length === 0) {
        // 両者ともに置ける手がない → ゲーム終了
        const { black, white } = countScores(currentBoard);
        setFinalScores({ black, white });
        setGameOver(true);
      } else {
        // 相手が置けない → 現在のプレイヤーが連続で手を打つ
        setMessage('相手に有効手がないため、手番を続行します。');
      }
    } else {
      // 次のプレイヤーに交代
      setCurrentPlayer(next);
    }

    // 盤面がすべて埋まっていた場合もゲーム終了
    if (currentBoard.flat().every(cell => cell !== null)) {
      const { black, white } = countScores(currentBoard);
      setFinalScores({ black, white });
      setGameOver(true);
    }
  };

  // セルがクリックされたときの処理
  const handleCellClick = (row: number, col: number) => {
    if (gameOver) return; // ゲーム終了時は何もしない
    const validMoves = getValidMoves();
    const key = `${row}-${col}`;
    if (!validMoves[key]) return; // クリックされたセルが合法手でない場合は無視

    // 同じセルが既にpendingになっている場合はクイズオーバーレイを表示
    if (pendingMove && pendingMove.row === row && pendingMove.col === col) {
      setShowOverlay(true);
      return;
    }

    // クイズの試行回数をリセット
    setQuizAttemptCount(0);
    let quiz = quizMapping[key];
    // まだクイズが割り当てられていない場合はランダムに選択
    if (!quiz) {
      if (quizQuestions.length > 0) {
        quiz = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
        // 選んだクイズをそのセルに記録
        setQuizMapping(prev => ({ ...prev, [key]: quiz }));
      } else {
        return;
      }
    }
    // pendingMoveに、クリックされたセル情報と裏返す石、クイズをセット
    setPendingMove({ row, col, flips: validMoves[key], quiz });
    setShowOverlay(true);
    setMessage('');
  };

  // クイズに正解した場合、実際に盤面へ石を配置・裏返しを行う関数
  const applyMove = () => {
    if (!pendingMove) return;
    // 盤面の新しいコピーを作成
    const newBoard = board.map(row => row.slice());
    // クリックしたセルに現在のプレイヤーの石を配置
    newBoard[pendingMove.row][pendingMove.col] = currentPlayer;
    // 裏返すべき石をすべて反転
    pendingMove.flips.forEach(([x, y]) => {
      newBoard[x][y] = currentPlayer;
    });
    setBoard(newBoard);
    // pendingMoveやオーバーレイ、試行回数、クイズマッピングをリセット
    setPendingMove(null);
    setQuizMapping({});
    setShowOverlay(false);
    setQuizAttemptCount(0);
    // 正答数を更新
    setCorrectAnswers(prev => prev + 1);

    // 次のターンに切り替え
    switchTurn(newBoard, currentPlayer);
  };

  // クイズに不正解だった場合の処理
  const handleWrongAnswer = () => {
    const newAttempt = quizAttemptCount + 1;
    setQuizAttemptCount(newAttempt);

    if (newAttempt >= 3) {
      // 3回不正解なら正解を表示するための状態に変更
      if (pendingMove) {
        setRevealedAnswer(pendingMove.quiz.answer);
      }
      setShowCorrectAnswer(true);
      // この時点では手は適用せず、ユーザーがOKボタンを押すのを待つ
    }
  };

  // 3回不正解後、ユーザーがOKボタンを押したときの処理（手番を飛ばす）
  const handleRevealOk = () => {
    setPendingMove(null);
    setQuizMapping({});
    setShowOverlay(false);
    setQuizAttemptCount(0);
    setMessage('3回不正解のため、手番が飛ばされました。');

    // 正解表示の状態をリセット
    setShowCorrectAnswer(false);
    setRevealedAnswer('');

    // ターンを次に移行（石は配置せずにパス）
    switchTurn(board, currentPlayer);
  };

  // クイズオーバーレイの「キャンセル」ボタンを押したときの処理
  const handleCancelQuiz = () => {
    setShowOverlay(false);
  };

  // ゲームのリスタート処理
  const restartGame = () => {
    setBoard(initializeBoard());
    setCurrentPlayer('B');
    setMessage('');
    setShowOverlay(false);
    setPendingMove(null);
    setQuizAttemptCount(0);
    setCorrectAnswers(0);
    setQuizMapping({});
    setGameOver(false);

    // 正解表示状態のリセット
    setShowCorrectAnswer(false);
    setRevealedAnswer('');
  };

  return (
    <div className="app">
      {/* ルート画面に戻る */}
      <button onClick={() => navigate("/")}>戻る</button>
      {/* ゲームが終了していない場合 */}
      {!gameOver ? (
        <>
          <div className="game-container">
            <div className="board-container">
              {/* 盤面を表示するBoardコンポーネント */}
              <Board board={board} onCellClick={handleCellClick} />
            </div>
            <div className="info-panel">
              <h2>ゲーム情報</h2>
              {/* 現在の手番と正答数の表示 */}
              <p>現在の手番: {currentPlayer === 'B' ? '黒' : '白'}</p>
              <p>正答数: {correctAnswers}</p>
              {message && <p className="message">{message}</p>}
            </div>
          </div>
          {/* クイズオーバーレイが表示される場合 */}
          {showOverlay && pendingMove && (
            <QuizOverlay
              moveKey={`${pendingMove.row}-${pendingMove.col}`}
              quiz={pendingMove.quiz}
              onSuccess={applyMove}
              onWrongAnswer={handleWrongAnswer}
              onCancel={handleCancelQuiz}
              attemptCount={quizAttemptCount}
              showCorrectAnswer={showCorrectAnswer}
              revealedAnswer={revealedAnswer}
              onRevealOk={handleRevealOk}
            />
          )}
        </>
      ) : (
        // ゲーム終了時のオーバーレイ呼び出し
        <GameOverOverlay
          blackScore={finalScores.black}
          whiteScore={finalScores.white}
          onRestart={restartGame}
        />
      )}
    </div>
  );
};

export default Game;