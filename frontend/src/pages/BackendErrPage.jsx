import React, { useEffect, useState } from "react";
import "../css/BackendErrPage.css";

const worlds = {
  fantasy: {
    name: "Fantasy Realm",
    description:
      "Hutan elf, lingkaran sihir, slime imut, dan pedang jatuh dari langit!",
    bgClass: "world-fantasy",
    icon: "🧙‍♂️",
  },
  scifi: {
    name: "Cyberpunk Sci-Fi",
    description:
      "Neon city, hologram server, dan backend tersedot wormhole futuristik.",
    bgClass: "world-scifi",
    icon: "🚀",
  },
  apocalypse: {
    name: "Post-Apocalypse",
    description:
      "Dunia gurun gelap, kabel putus, server tumbang, robot tinggal rangka.",
    bgClass: "world-apocalypse",
    icon: "☢️",
  },
  paradise: {
    name: "Programmer Heaven",
    description:
      "RGB keyboard, kopi panas, dan backend hidup selamanya tanpa error.",
    bgClass: "world-paradise",
    icon: "💻",
  },
};

const BackendErrPage = ({ message, onRetry }) => {
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [easterEvent, setEasterEvent] = useState(null);

  useEffect(() => {
    const r = Math.random() * 100;
    if (r < 1) setEasterEvent("ultra");
    else if (r < 6) setEasterEvent("truck");
    else if (r < 16) setEasterEvent("slime");
    else setEasterEvent("normal");
  }, []);

  // ✅ Jika belum pilih dunia → tampilkan UI pilihan
  if (!selectedWorld) {
    return (
      <div className="isekai-select-wrapper">
        <h2 className="select-title">🌌 Pilih Dunia Isekai Kamu</h2>
        <p className="select-sub">
          Backend tersedot ke alam lain… kamu mau masuk ke dunia mana?
        </p>

        <div className="world-grid">
          {Object.entries(worlds).map(([key, world]) => (
            <div
              key={key}
              className="world-card"
              onClick={() => setSelectedWorld(key)}>
              <div className="world-icon">{world.icon}</div>
              <h3 className="world-name">{world.name}</h3>
              <p className="world-desc">{world.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ WORLD SELECTED → tampilkan halaman isekai error tema sesuai dunia
  const world = worlds[selectedWorld];

  return (
    <div className={`isekai-wrapper ${world.bgClass}`}>
      <div className="isekai-portal"></div>

      {easterEvent === "truck" && <div className="truckkun">🚚💨</div>}
      {easterEvent === "slime" && <div className="slime">🟦</div>}
      {easterEvent === "ultra" && (
        <div className="ultra-rare-hero">
          <div className="hero-silhouette"></div>
          <p className="ultra-title">🔥 ULTRA RARE ISEKAI EVENT 🔥</p>
        </div>
      )}

      <div className="isekai-card animate_card">
        <div className="isekai-icon floaty">{world.icon}</div>

        <h2 className="isekai-title">{world.name}</h2>
        <p className="isekai-message">{world.description}</p>

        <div className="chibi-backend">
          (╯︵╰,) <br />
          <span>Backend menghilang ke dunia {world.name}…</span>
        </div>

        <p className="isekai-message mt-2">
          {message || "Backend tidak merespon."}
        </p>

        <button className="retry-btn" onClick={onRetry}>
          🔄 Coba Panggil Backend Lagi
        </button>
      </div>

      <div className="falling-sword">🗡</div>
    </div>
  );
};

export default BackendErrPage;
