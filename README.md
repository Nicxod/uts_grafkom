# Ball vs Ball: Random Arena (2D Arcade Fighting Game)

Game 2D pertarungan bola arcade lokal 2-pemain (*local multiplayer on one keyboard*) berbasis HTML5 Canvas, CSS3, dan JavaScript Vanilla (100% Offline & Self-Contained).

---

## 📚 Referensi Resmi (Non-AI Documentation Reference)

Proyek ini dibuat secara mandiri (*self-contained*) tanpa pustaka/library pihak ketiga (*zero third-party dependencies*), dengan berpedoman pada standar resmi dan literatur akademis non-AI berikut:

1. **W3C HTML5 Specification & WHATWG HTML Living Standard — Canvas 2D Context**
   - *Dokumentasi Resmi:* [WHATWG HTML Living Standard - 2D Context](https://html.spec.whatwg.org/multipage/canvas.html#2dcontext)
   - *Penggunaan:* Standar API grafika 2D browser (`CanvasRenderingContext2D`): penggambaran bentuk kurva (`arc`), jalur vektor (`beginPath`, `closePath`, `fill`, `stroke`), efek gradien radial dan linear (`createRadialGradient`, `createLinearGradient`), manipulasi state kanvas (`save`, `restore`), serta pembersihan frame (`clearRect`).

2. **Mozilla Developer Network (MDN) Web Docs — Canvas API & Animation Loop**
   - *Dokumentasi Resmi:* [MDN Web Docs - Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
   - *Dokumentasi Resmi:* [MDN Web Docs - window.requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
   - *Penggunaan:* Implementasi game loop berbasis `requestAnimationFrame` untuk refresh rate 60 FPS yang tersinkronisasi dengan display hardware, perhitungan delta time (`dt`), serta penanganan state input keyboard secara simultan (`keydown`/`keyup`).

3. **W3C Web Audio API Recommendation & MDN Web Docs — Web Audio API**
   - *Dokumentasi Resmi:* [W3C Web Audio API Specification](https://www.w3.org/TR/webaudio/)
   - *Dokumentasi Resmi:* [MDN Web Docs - Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
   - *Penggunaan:* Sintesis efek suara arcade (SFX) retro secara prosedural melalui `AudioContext`, `OscillatorNode` (gelombang sine, square, sawtooth, triangle), dan `GainNode` secara 100% offline tanpa mengunduh file audio eksternal.

4. **Literatur Akademik Komputasi Fisika 2D (Momentum & Elastic Collision)**
   - *Referensi Buku Teks:* Halliday, D., Resnick, R., & Walker, J. (2014). *Fundamentals of Physics* (10th ed.). John Wiley & Sons. Bab 9: *Center of Mass and Linear Momentum: Elastic Collisions in Two Dimensions*.
   - *Penggunaan:* Deteksi tumbukan dua lingkaran berdasarkan jarak Euclidean ($d \le r_1 + r_2$), normalisasi vektor tabrakan, dan pemisahan posisi objek untuk mencegah bola saling bertumpuk (*positional separation*).

---

## 🎮 Kontrol Permainan

| Pemain | Arah Gerak | Tombol Gerak | Tombol Skill |
| :--- | :--- | :--- | :--- |
| **Pemain 1 (Biru)** | Atas, Kiri, Bawah, Kanan | `W`, `A`, `S`, `D` | `F` |
| **Pemain 2 (Merah)** | Atas, Kiri, Bawah, Kanan | `Arrow Up`, `Arrow Left`, `Arrow Down`, `Arrow Right` | `Enter` |

---

## ⚔️ Daftar Bola & Skill

Setiap pemain mendapatkan 3 bola acak sebelum pertarungan dimulai. Setiap bola memiliki 100 HP:
1. **Fire Ball** (*Fire Blast*): Menembakkan proyektil bola api berdaya ledak tinggi (25 DMG, Cooldown 4s).
2. **Ice Ball** (*Ice Freeze*): Menembakkan pecahan es yang membekukan dan memperlambat musuh 55% selama 2s (10 DMG, Cooldown 6s).
3. **Thunder Ball** (*Lightning Strike*): Sambaran kilat petir instan berkecepatan tinggi (20 DMG, Cooldown 3s).
4. **Shield Ball** (*Energy Shield*): Perisai energi pelindung yang mereduksi semua damage masuk sebesar 50% selama 2s (Cooldown 6s).
5. **Poison Ball** (*Toxic Burst*): Ledakan racun beracun yang memberikan damage berkala (total 20 DMG / 4 tick, Cooldown 5s).
6. **Dash Ball** (*Power Dash*): Menerjang kencang ke arah hadap bola; memberikan 15 DMG dan knockback jika menabrak lawan (Cooldown 3s).
7. **Heal Ball** (*Healing Pulse*): Gelombang regenerasi yang memulihkan 15 HP sendiri (maks. 100 HP, Cooldown 7s).
8. **Shadow Ball** (*Shadow Strike*): Tebasan bayangan gelap berkecepatan tinggi menembus musuh (18 DMG, Cooldown 4s).

---

## 🚀 Cara Menjalankan
Buka file `index.html` langsung menggunakan browser modern apa saja (Google Chrome, Microsoft Edge, Mozilla Firefox) tanpa perlu instalasi server atau framework tambahan.
