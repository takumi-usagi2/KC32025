import React, { useEffect, useState } from 'react';
import { QuizQuestion } from './Othello';

type QuizOverlayProps = {
  moveKey: string;
  quiz: QuizQuestion;
  onSuccess: () => void;
  onWrongAnswer: () => void;
  onCancel: () => void;
  attemptCount: number;
  showCorrectAnswer: boolean;
  revealedAnswer: string;
  onRevealOk: () => void;
};

const QuizOverlay: React.FC<QuizOverlayProps> = ({
  moveKey,
  quiz,
  onSuccess,
  onWrongAnswer,
  onCancel,
  attemptCount,
  showCorrectAnswer,
  revealedAnswer,
  onRevealOk,
}) => {
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setUserAnswer('');
    setErrorMessage('');
  }, [moveKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswer.trim() === '') return;
    if (userAnswer.trim() === quiz.answer.trim()) {
      onSuccess();
    } else {
      onWrongAnswer();
      setErrorMessage(`不正解です。残り試行回数：${3 - (attemptCount + 1)}`);
    }
  };

  return (
    <div className="overlay">
      <div className="overlay-content">
        {/* クイズの問題文を表示 */}
        <h2>{quiz.question}</h2>

        {/* まだ正解を表示していない場合は通常のフォームを表示 */}
        {!showCorrectAnswer && (
          <>
            <p>残り試行回数: {3 - attemptCount}</p>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="回答を入力"
                autoFocus
              />
              <div style={{ marginTop: '10px' }}>
                <button type="submit">回答する</button>
                <button type="button" onClick={onCancel} style={{ marginLeft: '10px' }}>
                  キャンセル
                </button>
              </div>
            </form>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
          </>
        )}

        {/* showCorrectAnswer が true なら正解を表示してOKボタンだけにする */}
        {showCorrectAnswer && (
          <>
            <p style={{ color: 'red', marginBottom: '1em' }}>
              3回間違えました。正解は「{revealedAnswer}」です。
            </p>
            <button onClick={onRevealOk}>OK</button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizOverlay;
