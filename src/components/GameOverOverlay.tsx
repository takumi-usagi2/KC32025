// GameOverOverlay.tsx: ゲーム終了時に最終結果と再スタートボタンを表示するオーバーレイコンポーネント
// ・最終スコアに基づき勝者または引き分けを表示し、再度ゲームを始めるためのボタンを表示する

import React from 'react';

type GameOverOverlayProps = {
  blackScore: number;   // 黒の最終スコア
  whiteScore: number;   // 白の最終スコア
  onRestart: () => void; // 再スタートボタン押下時のコールバック
};

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ blackScore, whiteScore, onRestart }) => {
  let result = '';
  // スコアを比較して勝者または引き分けの結果を決定
  if (blackScore > whiteScore) {
    result = '黒の勝ち！';
  } else if (whiteScore > blackScore) {
    result = '白の勝ち！';
  } else {
    result = '引き分け！';
  }

  return (
    <div className="overlay">
      <div className="overlay-content">
        <h2>ゲーム終了</h2>
        <p>最終結果</p>
        <p>黒: {blackScore}　白: {whiteScore}</p>
        <h3>{result}</h3>
        {/* ゲーム再開用のボタン */}
        <button onClick={onRestart}>再スタート</button>
      </div>
    </div>
  );
};

export default GameOverOverlay;
