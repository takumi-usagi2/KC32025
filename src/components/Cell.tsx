// Cell.tsx: 盤面上の1セルを表すコンポーネントです。
// ・セル内に石（ディスク）が存在する場合は、対応する色（黒または白）のディスクを描画します。
// ・セルクリック時に、上位コンポーネントへクリックイベントを伝達します。

import React from 'react';

type CellProps = {
  value: 'B' | 'W' | null; // セル内の状態（'B'：黒、'W'：白、null：空）
  onClick: () => void;      // クリックイベントのハンドラ
};

const Cell: React.FC<CellProps> = ({ value, onClick }) => {
  return (
    <div className="cell" onClick={onClick}>
      {/* 値がある場合のみディスクを描画 */}
      {value && <div className={`disc ${value === 'B' ? 'black' : 'white'}`}></div>}
    </div>
  );
};

export default Cell;
