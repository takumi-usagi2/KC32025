// Board.tsx: ゲーム盤全体を描画するコンポーネント
// ・盤面の2次元配列を受け取り、各セルをCellコンポーネントとして表示
// ・セルクリック時に、上位コンポーネントにその座標を渡す

import React from 'react';
import Cell from './Cell';

type BoardProps = {
  board: ('B' | 'W' | null)[][];  // 盤面の状態（各セルの石の状態）
  onCellClick: (row: number, col: number) => void; // セルがクリックされたときのコールバック
};

const Board: React.FC<BoardProps> = ({ board, onCellClick }) => {
  return (
    <div className="board">
      {/* 盤面配列を2重ループで回し、各セルを生成 */}
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell 
            key={`${rowIndex}-${colIndex}`} 
            value={cell} 
            onClick={() => onCellClick(rowIndex, colIndex)} 
          />
        ))
      )}
    </div>
  );
};

export default Board;
