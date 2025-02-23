import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { quizQuestions } from "../../public/quiz/quizData"; // クイズデータをインポート
import "../styles.css"; //cssをインポート

export const About: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false); // ゲーム開始状態
  const [numbers, setNumbers] = useState<number[][]>([]); // 数字の状態
  const [colors, setColors] = useState<string[][]>([]); // 色の状態
  const [quizVisible, setQuizVisible] = useState(false); // クイズが表示されているか
  const [answeredQuizzes, setAnsweredQuizzes] = useState<Set<number>>(
    new Set()
  ); // すでに答えたクイズのインデックス
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null); // クリックされたセル
  const [currentQuiz, setCurrentQuiz] = useState<{
    question: string;
    options: string[];
    correctAnswer: string; // 文字列型に変更
    image: string | null; // 画像のURLも追加
  } | null>(null); // 現在のクイズ
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null); // ユーザーが選んだ答え
  const [answerMessage, setAnswerMessage] = useState<{
    message: string;
    className: string;
  } | null>(null); // メッセージとクラス名
  const [noMoreQuizzes, setNoMoreQuizzes] = useState(false); // クイズがなくなったかどうか
  const [bingo, setBingo] = useState(false); // ビンゴが成立したかどうか
  const [bingoMessage, setBingoMessage] = useState(""); // ビンゴメッセージ
  const [gameFinished, setGameFinished] = useState(false); // ゲーム終了状態
  const [isWaitingForNextQuiz, setIsWaitingForNextQuiz] = useState(false); // 次のクイズを待っている状態

  const navigate = useNavigate(); // useNavigateフック

  useEffect(() => {
    // 1〜75の数字をランダムにシャッフルしてから5x5の配列に分ける
    const numbersArray = Array.from({ length: 75 }, (_, i) => i + 1); // [1, 2, 3, ..., 75]

    // シャッフルする関数
    const shuffle = (array: number[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 要素を入れ替え
      }
    };

    shuffle(numbersArray); // 数字をシャッフル

    // シャッフルした数字を5x5の配列に分ける
    const initialNumbers = Array.from({ length: 5 }, (_, i) =>
      numbersArray.slice(i * 5, i * 5 + 5)
    );

    // 色の初期状態（白色）
    const initialColors = Array(5)
      .fill(null)
      .map(() => Array(5).fill("white"));

    setNumbers(initialNumbers); // 数字を設定
    setColors(initialColors); // 色を初期化
  }, []);

  useEffect(() => {
    // すべてのクイズに答えた場合
    if (answeredQuizzes.size === quizQuestions.length) {
      setNoMoreQuizzes(true); // クイズがなくなった状態にする
    } else {
      setNoMoreQuizzes(false); // クイズが残っている状態に戻す
    }
  }, [answeredQuizzes]);

  const handleCellClick = (row: number, col: number): void => {
    if (noMoreQuizzes || bingo || isWaitingForNextQuiz) {
      return; // クイズがなくなった場合やビンゴ成立後、メッセージが表示されている間は処理をしない
    }

    // セルをクリックしたときに、そのセルの位置を保存してクイズを表示する
    setSelectedCell({ row, col });
    setQuizVisible(true);

    // ランダムにクイズを選ぶ
    const randomQuizIndex = Math.floor(Math.random() * quizQuestions.length);

    // すでに答えたクイズなら新しいクイズを選び直す
    if (answeredQuizzes.has(randomQuizIndex)) {
      handleCellClick(row, col); // 再帰的に新しいクイズを選ぶ
      return;
    }

    setCurrentQuiz(quizQuestions[randomQuizIndex]);
  };

  const handleAnswerClick = (answer: string): void => {
    // クイズの回答を判定
    setSelectedAnswer(answer); // 選んだ答えを保存

    const isCorrect = answer === currentQuiz?.correctAnswer;
    const { row, col } = selectedCell!;

    if (isCorrect) {
      // 正解した場合、選択したセルの色を変える
      const newColors = [...colors];
      newColors[row][col] = "green"; // 正解したセルの色を変更
      setColors(newColors); // 色を更新

      // ビンゴチェック
      if (checkBingo(newColors)) {
        setBingo(true); // ビンゴ成立
        setBingoMessage("おめでとうございます！ビンゴ達成！！"); // ビンゴメッセージ
        setGameFinished(true); // ゲーム終了状態にする
      }
    }

    // すでに答えたクイズを answeredQuizzes に追加
    if (currentQuiz) {
      setAnsweredQuizzes(
        new Set(answeredQuizzes.add(quizQuestions.indexOf(currentQuiz)))
      );
    }

    // 正解/不正解メッセージとクラス名を設定
    setAnswerMessage({
      message: isCorrect ? "正解!" : "不正解",
      className: isCorrect ? "correct" : "incorrect",
    });

    // 次のクイズを待つ状態にする
    setIsWaitingForNextQuiz(true);

    // 2秒後に次のクイズに進む
    setTimeout(() => {
      setAnswerMessage(null); // メッセージを非表示
      setQuizVisible(false); // クイズを非表示
      setIsWaitingForNextQuiz(false); // 次のクイズを待たない状態に戻す
    }, 2000);
  };

  const checkBingo = (colors: string[][]): boolean => {
    // ビンゴ判定
    // 横のチェック
    for (let row = 0; row < 5; row++) {
      if (colors[row].every((color) => color === "green")) {
        return true; // 横一列が緑ならビンゴ
      }
    }

    // 縦のチェック
    for (let col = 0; col < 5; col++) {
      if (colors.every((row) => row[col] === "green")) {
        return true; // 縦一列が緑ならビンゴ
      }
    }

    // 斜めのチェック
    if (colors.every((row, i) => row[i] === "green")) {
      return true; // 斜め（左上から右下）が緑ならビンゴ
    }
    if (colors.every((row, i) => row[4 - i] === "green")) {
      return true; // 斜め（右上から左下）が緑ならビンゴ
    }

    return false; // ビンゴではない
  };

  const handleGoBack = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonId = event.currentTarget.id;
    if (buttonId === "start") {
      setGameStarted(true); // ゲーム開始
      setGameFinished(false); // ゲーム終了状態をリセット
      setBingo(false); // ビンゴをリセット
      setBingoMessage(""); // ビンゴメッセージをリセット
      setAnsweredQuizzes(new Set()); // クイズをリセット
    } else if (buttonId === "back") {
      navigate("/"); // ホーム画面に戻る
    }
  };

  return (
    <div>
      <main className="main">
        <h1>関西セルフビンゴ</h1>

        {gameStarted ? (
          <div style={{ display: "flex" }}>
            {/* ビンゴボードの部分 */}
            <div
              className="bingoboard"
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(5, 50px)",
                gap: "10px",
                border: "2px solid #000",
                padding: "10px",
              }}
            >
              {numbers.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: colors[rowIndex][colIndex], // 色を設定
                      border: "1px solid #ccc", // 各ボタンの枠線
                      cursor: "pointer",
                    }}
                  >
                    {cell}
                  </button>
                ))
              )}
            </div>

            {/* クイズの部分 */}
            <div style={{ marginLeft: "20px", width: "300px" }}>
              {quizVisible && currentQuiz && (
                <div>
                  <p>{currentQuiz.question}</p>
                  {/* 画像がある場合のみ表示 */}
                  {currentQuiz.image && (
                    <img
                      src={currentQuiz.image}
                      alt="Quiz"
                      style={{
                        width: "100%",
                        height: "auto",
                        maxHeight: "200px",
                        objectFit: "cover",
                        marginBottom: "10px",
                      }}
                    />
                  )}
                  <div>
                    {currentQuiz.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerClick(option)} // 答えをクリックしたときの処理
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <button id="start" onClick={handleGoBack}>
              始める
            </button>
            <button id="back" onClick={handleGoBack}>
              戻る
            </button>
          </div>
        )}

        {/* 正解/不正解メッセージ */}
        {answerMessage && (
          <p className={answerMessage.className}>{answerMessage.message}</p>
        )}

        {gameFinished && (
          <div>
            <p className="bingo">{bingoMessage}</p>
            <button onClick={() => navigate("/")}>最初から</button>
          </div>
        )}
      </main>
    </div>
  );
};
