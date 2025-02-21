import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Contact: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false); // ゲーム開始状態を管理
  const navigate = useNavigate(); // useNavigateフックを呼び出し

  // ボタンがクリックされたときに遷移先を決定する関数
  const handleGoBack = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonId = event.currentTarget.id;

    // ボタンがクリックされたときに遷移先を決定
    if (buttonId === "start") {
      setGameStarted(true); // ゲーム開始
    } else if (buttonId === "back") {
      navigate("/"); // ホーム画面に戻る
    }
  };

  return (
    <div>
      <h1>マルチ ゲーム</h1>

      {gameStarted ? (
        <div>{/* xxxxxxxxxxxx */}</div>
      ) : (
        <div>
          <button id="start" onClick={handleGoBack}>
            始める
          </button>{" "}
          {/* ゲームを開始するボタン */}
          <button id="back" onClick={handleGoBack}>
            戻る
          </button>{" "}
          {/* ホームに戻るボタン */}
        </div>
      )}
    </div>
  );
};
