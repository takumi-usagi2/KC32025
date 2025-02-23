import React from "react";
import "../styles.css"; // CSSファイルをインポート
import { useNavigate } from "react-router-dom";

export const Home: React.FC = () => {
  const navigate = useNavigate(); // useNavigateフックを呼び出し

  // ボタンがクリックされたときに遷移先を決定する関数
  const handleNavigate = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonId = event.currentTarget.id;

    // ボタンがクリックされたときに遷移先を決定
    if (buttonId === "solo") {
      navigate("/about"); // 画面遷移: /about に遷移
    } else if (buttonId === "multi") {
      navigate("/contacts"); // 画面遷移: /contacts に遷移
    }
  }; //aaaaaa

  return (
    <main className="main">
      <div className="div">
        <p className="p">関西board</p>

        <section className="solosection">
          <h1 className="container">ソロゲーム</h1>
          <button id="solo" className="solobutton" onClick={handleNavigate}>
            solo
          </button>
        </section>

        <section className="multisection">
          <h1 className="container">マルチゲーム</h1>
          <button id="multi" className="multibutton" onClick={handleNavigate}>
            multi
          </button>
        </section>
      </div>
    </main>
  );
};