import React, { useState, useRef, useEffect } from "react";
import "./player.css";

export default function App() {
  const audioRef = useRef(null);

  const [songs, setSongs] = useState([
    { id: 1, title: "pikachu", url: "https://freepd.com/music/Battle%20Ready.mp3" }
  ]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [formData, setFormData] = useState({ title: "", url: "" });

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(Math.floor(audio.currentTime));
    const onLoaded = () => setDuration(Math.floor(audio.duration) || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentSong]);

  function formatTime(sec) {
    if (!sec && sec !== 0) return "00:00";
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  const handleAddSong = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) return;
    const newSong = { id: Date.now(), title: formData.title.trim(), url: formData.url.trim() };
    setSongs((prev) => [...prev, newSong]);
    setFormData({ title: "", url: "" });
    setShowAddMenu(false);
  };

  const playSong = (song) => {
    if (!audioRef.current) return;
    if (!song || !song.url) return;
    setCurrentSong(song);
    audioRef.current.pause();
    audioRef.current.src = song.url;
    audioRef.current.load();
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  };

  const togglePlay = () => {
    if (!currentSong || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const removeSong = (id, e) => {
    // evitar que haga play cuando se pulsa borrar
    if (e) e.stopPropagation();
    setSongs((prev) => prev.filter((s) => s.id !== id));
    if (currentSong && currentSong.id === id) {
      audioRef.current.pause();
      audioRef.current.src = "";
      setCurrentSong(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    }
  };

  const onSeek = (e) => {
    const val = Number(e.target.value);
    if (!audioRef.current) return;
    audioRef.current.currentTime = val;
    setCurrentTime(val);
  };

  const onVolume = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const playPrev = () => {
    if (!currentSong) return;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    const prevIdx = idx > 0 ? idx - 1 : songs.length - 1;
    playSong(songs[prevIdx]);
  };

  const playNext = () => {
    if (!currentSong) return;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    const nextIdx = idx < songs.length - 1 ? idx + 1 : 0;
    playSong(songs[nextIdx]);
  };

  return (
    <div className="mp3-wrap">
      {/* Header */}
      <div className="header">
        <h1 className="title">DASC UABCS - MP3 Player</h1>
        <button className="btn-add" onClick={() => setShowAddMenu(true)}>＋</button>
      </div>

      {/* Add Song Modal */}
      {showAddMenu && (
        <div className="overlay" onClick={() => setShowAddMenu(false)}>
          <div className="add-box" onClick={(e) => e.stopPropagation()}>
            <h2>Agregar Canción</h2>
            <form onSubmit={handleAddSong} className="form">
              <label>Título</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Nombre de la canción" />
              <label>URL del MP3</label>
              <input type="text" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." />
              <div className="form-actions">
                <button type="submit" className="btn submit">Agregar</button>
                <button type="button" className="btn cancel" onClick={() => setShowAddMenu(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Song List */}
      <div className="list">
        {songs.map((s) => (
          <div key={s.id} className={"row" + (currentSong && currentSong.id === s.id ? " active" : "")} onClick={() => playSong(s)}>
            <div className="left">
              <button className="play-small">▶</button>
              <div className="song-title">{s.title}</div>
            </div>
            <button className="trash" onClick={(e) => removeSong(s.id, e)}>🗑</button>
          </div>
        ))}
      </div>

      {/* Audio element (hidden) */}
      <audio ref={audioRef} />

      {/* Bottom Player */}
      <div className="player">
        <div className="controls-left">
          <button className="ctrl" onClick={playPrev}>⏮</button>
          <button className="ctrl big" onClick={togglePlay}>{isPlaying ? "⏸" : "▶"}</button>
          <button className="ctrl" onClick={playNext}>⏭</button>
        </div>

        <div className="progress-area">
          <div className="track-title">{currentSong ? currentSong.title : "Selecciona una canción"}</div>
          <input
            className="progress"
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={onSeek}
          />
          <div className="times">{formatTime(currentTime)} / {formatTime(duration)}</div>
        </div>

        <div className="right-controls">
          <div className="volume-wrap">
            <span>🔊</span>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={onVolume} />
          </div>
        </div>
      </div>
    </div>
  );
}
