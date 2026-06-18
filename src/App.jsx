import { useState, useEffect, useRef, useCallback, Component } from "react";

// Firebase loaded via CDN in index.html
let db = null;
let firebaseRef = null;
let firebasePush = null;
let firebaseOnValue = null;
let firebaseRemove = null;
let firebaseSet = null;

async function initFirebase() {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
    const { getDatabase, ref, push, onValue, remove, set } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
    const firebaseConfig = {
      apiKey: "AIzaSyC9Tg50cZLO_xui_KNw0AtVemMneiewiEA",
      authDomain: "riverside-squeeze.firebaseapp.com",
      databaseURL: "https://riverside-squeeze-default-rtdb.firebaseio.com",
      projectId: "riverside-squeeze",
      storageBucket: "riverside-squeeze.firebasestorage.app",
      messagingSenderId: "242171656806",
      appId: "1:242171656806:web:9c26973a01524757e40ba7"
    };
    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    firebaseRef = ref;
    firebasePush = push;
    firebaseOnValue = onValue;
    firebaseRemove = remove;
    firebaseSet = set;
    return true;
  } catch(e) {
    console.error("Firebase init failed", e);
    return false;
  }
}

// ─── MUSIC PLAYER WITH FUZZY SEARCH ──────────────────────────────────────────
function MusicPlayer({ songOfDay }) {
  const [playing, setPlaying] = useState(false);

  const query = songOfDay?.title && songOfDay?.artist ? `${songOfDay.title} ${songOfDay.artist}` : "lemonade vibes";
  const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
  const youtubeUrl = `https://music.youtube.com/search?q=${encodeURIComponent(query)}`;

  return (
    <div style={{ marginBottom: 12 }}>
      {!playing ? (
        <button className="music-btn" onClick={() => setPlaying(true)}>🎵 Play Today's Song</button>
      ) : (
        <div>
          <button className="music-btn music-btn-playing" onClick={() => setPlaying(false)}>⏹ Close Player</button>
          <div className="music-player-bar">
            <div className="music-player-info">
              <div className="music-equalizer"><span/><span/><span/><span/></div>
              <div>
                <div className="music-song-title">{songOfDay?.title || "Today's Vibe"}</div>
                <div className="music-song-artist">{songOfDay?.artist || "Riverside Squeeze"}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={spotifyUrl} target="_blank" rel="noreferrer" className="music-open-btn music-spotify">Spotify</a>
              <a href={youtubeUrl} target="_blank" rel="noreferrer" className="music-open-btn music-youtube">YouTube</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FRUIT BACKGROUND ────────────────────────────────────────────────────────
const FRUIT_EMOJIS = ["🍋","🫐","🍍","🍏","🍋","🍊","🫐","🍍","🍏","🍋","🍋‍🟩","🍊","🍓","🍒","🍋","🫐","🍍","🍏","🍊","🍓"];
function FruitBackground() {
  const fruits = useRef(
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      emoji: FRUIT_EMOJIS[i % FRUIT_EMOJIS.length],
      left: 5 + (i % 6) * 18 + Math.random() * 8,
      top: 3 + Math.floor(i / 6) * 26 + Math.random() * 10,
      size: 28 + Math.random() * 24,
      opacity: 0.55 + Math.random() * 0.3,
      rotate: Math.random() * 30 - 15,
      duration: 5 + Math.random() * 6,
      delay: Math.random() * 4,
    }))
  ).current;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {fruits.map(f => (
        <div key={f.id} style={{
          position: "absolute",
          left: `${f.left}%`, top: `${f.top}%`,
          fontSize: f.size,
          opacity: f.opacity,
          transform: `rotate(${f.rotate}deg)`,
          animation: `fruitDrift${f.id % 3} ${f.duration}s ease-in-out infinite ${f.delay}s alternate`,
          userSelect: "none",
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
          willChange: "transform",
        }}>{f.emoji}</div>
      ))}
    </div>
  );
}

// ─── DEFAULT MENU ─────────────────────────────────────────────────────────────
const DEFAULT_MENU = [
  { id: 1, name: "Classic Lemonade", price: 3.0, emoji: "🍋", desc: "Fresh squeezed, ice cold, pure perfection.", gradient: "linear-gradient(135deg, #FFF033 0%, #FFB800 100%)", tag: null, sizes: ["Kid Size 12oz","Regular Size 24oz"], sizePrices: [3.0, 5.0], soldOut: false },
  { id: 2, name: "Dragon Fruit Lemonade", price: 5.0, emoji: "🐉", desc: "Dragon fruit syrup with fresh pieces on top. Bold & beautiful.", gradient: "linear-gradient(135deg, #FF3D8A 0%, #E0118C 100%)", tag: "FAN FAV", sizes: ["Kid Size 12oz","Regular Size 24oz"], sizePrices: [5.0, 7.0], soldOut: false },
  { id: 3, name: "Do You Billieve?", price: 5.0, emoji: "🏈", desc: "Mystery flavor every week. Have faith. Just trust it. #BillsMafia", gradient: "linear-gradient(135deg, #0046FF 0%, #2D7FFF 100%)", tag: "MYSTERY", sizes: ["Kid Size 12oz","Regular Size 24oz"], sizePrices: [5.0, 7.0], soldOut: false },
  { id: 4, name: "Prickly Pear Lemonade", price: 5.0, emoji: "🌵", desc: "Sweet, stunning, naturally pink. Gram-worthy every single pour.", gradient: "linear-gradient(135deg, #C13DFF 0%, #8B14E8 100%)", tag: "NEW", sizes: ["Kid Size 12oz","Regular Size 24oz"], sizePrices: [5.0, 7.0], soldOut: false },
];

const DEFAULT_SPECIALS = [
  { id: 1, name: "Buy 3 Get 1 FREE", desc: "Add any 4 drinks — cheapest one is FREE automatically!", emoji: "🎉", active: true },
];

const LOCATIONS = [
  { id: "football", name: "Football Field", emoji: "🏈", color: "#00338D" },
  { id: "baseball", name: "Baseball Diamond", emoji: "⚾", color: "#1AE85C" },
  { id: "basketball", name: "Basketball Courts", emoji: "🏀", color: "#FF7A00" },
  { id: "entrance", name: "Park Entrance", emoji: "🌳", color: "#B026FF" },
  { id: "playground", name: "Playground", emoji: "🛝", color: "#FF6B9D" },
];

const SAMPLE_LOCATION_DATA = [
  { locationId: "football", date: "Tue Apr 22", event: "Night Football Game", sales: 187, orders: 28, weather: "72°F Clear" },
  { locationId: "baseball", date: "Sat Apr 19", event: "Weekend Baseball", sales: 143, orders: 21, weather: "78°F Sunny" },
  { locationId: "basketball", date: "Sun Apr 20", event: "Sunday Courts", sales: 98, orders: 15, weather: "68°F Cloudy" },
  { locationId: "entrance", date: "Fri Apr 18", event: "Friday Afternoon", sales: 65, orders: 10, weather: "74°F Clear" },
  { locationId: "football", date: "Tue Apr 15", event: "Night Football Game", sales: 201, orders: 30, weather: "65°F Clear" },
  { locationId: "baseball", date: "Sat Apr 12", event: "Tournament Day", sales: 221, orders: 33, weather: "80°F Sunny" },
];

// ─── GLITTER TIERS ────────────────────────────────────────────────────────────
const GLITTER_TIERS = [
  { id: "rookie", label: "🏈 Rookie", desc: "1 color + sticker", price: 0.50 },
  { id: "allpro", label: "🏆 All Pro", desc: "2 colors + sticker", price: 1.00 },
  { id: "hof", label: "👑 Hall of Fame", desc: "All colors + sticker", price: 2.00 },
];

// ─── BLEACHER SECTIONS ────────────────────────────────────────────────────────
const BLEACHER_SECTIONS = {
  football: ["Section 1", "Section 2", "Section 3", "Section 4"],
  baseball: ["1st Base Side", "3rd Base Side", "Home Plate", "Outfield"],
  basketball: ["North Side", "South Side", "East Bleachers", "West Bleachers"],
  entrance: ["Main Gate", "Side Gate"],
  playground: ["Picnic Area", "Main Playground"],
};

// ─── DAILY GOAL STORAGE ───────────────────────────────────────────────────────
const DAILY_GOAL_KEY = "rs_daily_goal";
function getDailyGoal() { try { return parseFloat(localStorage.getItem(DAILY_GOAL_KEY) || "200"); } catch { return 200; } }
function saveDailyGoal(g) { try { localStorage.setItem(DAILY_GOAL_KEY, String(g)); } catch {} }

// ─── TRUSTED DEVICE STORAGE ───────────────────────────────────────────────────
const TRUSTED_KEY = "rs_trusted_device";
const BACKUP_CODE_KEY = "rs_backup_code";
function isTrustedDevice() { try { return localStorage.getItem(TRUSTED_KEY) === "true"; } catch { return false; } }
function trustDevice() { try { localStorage.setItem(TRUSTED_KEY, "true"); } catch {} }
function getBackupCode() { try { return localStorage.getItem(BACKUP_CODE_KEY) || null; } catch { return null; } }
function saveBackupCode(c) { try { localStorage.setItem(BACKUP_CODE_KEY, c); } catch {} }

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
async function requestPushPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const perm = await Notification.requestPermission();
  return perm === "granted";
}
function sendPushNotification(title, body, icon = "🍋") {
  try {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico", badge: "/favicon.ico" });
    }
  } catch(e) {}
}

// ─── CASH LOG STORAGE ─────────────────────────────────────────────────────────
const CASH_LOG_KEY = "rs_cash_log";
function getCashLog() { try { return JSON.parse(localStorage.getItem(CASH_LOG_KEY) || "[]"); } catch { return []; } }
function addCashLog(entry) { try { const log = getCashLog(); log.push(entry); localStorage.setItem(CASH_LOG_KEY, JSON.stringify(log.slice(-100))); } catch {} }


const OWNER_PIN_KEY = "rs_owner_pin";
const OWNER_SESSION_KEY = "rs_owner_session";
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

function getStoredPin() {
  try { return localStorage.getItem(OWNER_PIN_KEY) || null; } catch { return null; }
}
function savePin(pin) {
  try { localStorage.setItem(OWNER_PIN_KEY, pin); } catch {}
}
function isSessionValid() {
  try {
    const ts = localStorage.getItem(OWNER_SESSION_KEY);
    if (!ts) return false;
    return (Date.now() - parseInt(ts)) < SESSION_DURATION;
  } catch { return false; }
}
function startSession() {
  try { localStorage.setItem(OWNER_SESSION_KEY, String(Date.now())); } catch {}
}
function clearSession() {
  try { localStorage.removeItem(OWNER_SESSION_KEY); } catch {}
}

// ─── STRIPE LINK STORAGE ─────────────────────────────────────────────────────
const STRIPE_LINK_KEY = "rs_stripe_link";
function getStripeLink() {
  try { return localStorage.getItem(STRIPE_LINK_KEY) || ""; } catch { return ""; }
}
function saveStripeLink(link) {
  try { localStorage.setItem(STRIPE_LINK_KEY, link); } catch {}
}

// ─── CUSTOMER PROFILE STORAGE (FIREBASE + LOCAL CACHE) ───────────────────────
function getProfileKey(phone) { return `rs_profile_${phone.replace(/\D/g, "")}`; }

// Local cache read - instant, used for fast initial render
function loadProfileLocal(phone) {
  try {
    const raw = localStorage.getItem(getProfileKey(phone));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Save to both Firebase (source of truth across devices) and local cache (fast reads)
function saveProfile(phone, profile) {
  const digits = phone.replace(/\D/g, "");
  const withTimestamp = { ...profile, lastSeen: Date.now() };
  try { localStorage.setItem(getProfileKey(phone), JSON.stringify(withTimestamp)); } catch {}
  if (db && firebaseSet && firebaseRef) {
    firebaseSet(firebaseRef(db, `profiles/${digits}`), withTimestamp);
  }
}

// Async load - checks Firebase first (cross-device truth), falls back to local cache if offline
async function loadProfile(phone) {
  const digits = phone.replace(/\D/g, "");
  if (db && firebaseRef) {
    try {
      const { get } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js");
      const snapshot = await get(firebaseRef(db, `profiles/${digits}`));
      const val = snapshot.val();
      if (val) {
        // Keep local cache in sync
        try { localStorage.setItem(getProfileKey(phone), JSON.stringify(val)); } catch {}
        return val;
      }
    } catch (e) {
      console.error("Firebase profile load failed, using local cache", e);
    }
  }
  return loadProfileLocal(phone);
}

function createProfile(phone, name) {
  return { phone: phone.replace(/\D/g, ""), name, punches: 0, totalOrders: 0, totalSpent: 0, orderHistory: [], favoriteItems: {}, firstVisit: Date.now(), lastSeen: Date.now() };
}
function getFavorites(profile, menu) {
  if (!profile?.favoriteItems) return [];
  return Object.entries(profile.favoriteItems)
    .sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([id, count]) => { const item = menu.find(m => String(m.id) === String(id)); return item ? { ...item, orderCount: count } : null; })
    .filter(Boolean);
}
function formatPhone(raw) {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}

// ─── AI HOOK ──────────────────────────────────────────────────────────────────
function useAI() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const ask = useCallback(async (prompt) => {
    setLoading(true); setResponse("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      setResponse(data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "No response");
    } catch { setResponse("Couldn't connect to AI right now. Try again!"); }
    setLoading(false);
  }, []);
  return { ask, loading, response };
}

// ─── WEATHER HOOK ─────────────────────────────────────────────────────────────
function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetch_weather = useCallback(async () => {
    setLoading(true);
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 }));
      const { latitude: lat, longitude: lon } = pos.coords;
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,precipitation&temperature_unit=fahrenheit&windspeed_unit=mph`);
      const d = await r.json();
      const c = d.current; const code = c.weathercode;
      let icon = "☀️", desc = "Clear";
      if (code === 0) { icon = "☀️"; desc = "Clear"; }
      else if (code <= 3) { icon = "⛅"; desc = "Partly Cloudy"; }
      else if (code <= 48) { icon = "🌫️"; desc = "Foggy"; }
      else if (code <= 67) { icon = "🌧️"; desc = "Rainy"; }
      else if (code <= 77) { icon = "❄️"; desc = "Snowy"; }
      else if (code <= 82) { icon = "🌦️"; desc = "Showers"; }
      else { icon = "⛈️"; desc = "Stormy"; }
      const selling = code <= 3 ? "🔥 Great day to sell!" : code <= 48 ? "😐 Decent, stay out" : "⚠️ Tough conditions";
      setWeather({ temp: Math.round(c.temperature_2m), desc, icon, wind: Math.round(c.windspeed_10m), rain: c.precipitation, selling });
    } catch {
      setWeather({ temp: 72, desc: "Clear", icon: "☀️", wind: 8, rain: 0, selling: "🔥 Great day to sell!", fallback: true });
    }
    setLoading(false);
  }, []);
  useEffect(() => { fetch_weather(); }, []);
  return { weather, loading, refetch: fetch_weather };
}

// ─── ORDER SYSTEM (FIREBASE REALTIME) ────────────────────────────────────────
function useOrders() {
  const [orders, setOrders] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [sales, setSales] = useState(SAMPLE_LOCATION_DATA.map(d => ({ ...d, isSample: true })));
  const [currentLocation, setCurrentLocationState] = useState(LOCATIONS[0]);

  // Sync location changes to Firebase
  const setCurrentLocation = (loc) => {
    setCurrentLocationState(loc);
    if (db && firebaseSet && firebaseRef) {
      firebaseSet(firebaseRef(db, "status/location"), loc);
    }
  };
  const [fbReady, setFbReady] = useState(false);

  useEffect(() => {
    initFirebase().then(ok => {
      if (ok) setFbReady(true);
    });
  }, []);

  const prevOrderCount = useRef(0);

  useEffect(() => {
    if (!fbReady || !db) return;
    const ordersRef = firebaseRef(db, "orders");
    const unsub = firebaseOnValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.entries(data)
          .map(([key, val]) => ({ ...val, firebaseKey: key }))
          .filter(o => o.status === "pending")
          .sort((a, b) => a.id - b.id);
        // Play ding if new order came in
        if (loaded.length > prevOrderCount.current) {
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            // Ding sound: two pleasant tones
            [0, 0.15].forEach((delay, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = i === 0 ? 880 : 1100;
              osc.type = "sine";
              gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
              osc.start(ctx.currentTime + delay);
              osc.stop(ctx.currentTime + delay + 0.4);
            });
            // Vibrate on mobile
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          } catch(e) {}
        }
        prevOrderCount.current = loaded.length;
        setOrders(loaded);
      } else {
        prevOrderCount.current = 0;
        setOrders([]);
      }
    });
    return () => unsub();
  }, [fbReady]);

  useEffect(() => {
    if (!fbReady || !db) return;
    const completedRef = firebaseRef(db, "completed");
    const unsub = firebaseOnValue(completedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.entries(data).map(([key, val]) => ({ ...val, firebaseKey: key }));
        setCompleted(loaded);
        // Housekeeping: remove completed orders older than 24 hours so the list doesn't grow forever
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        loaded.forEach(o => {
          const orderTime = new Date(o.time || 0).getTime();
          if (orderTime && orderTime < oneDayAgo && o.firebaseKey) {
            firebaseRemove(firebaseRef(db, `completed/${o.firebaseKey}`));
          }
        });
      } else { setCompleted([]); }
    });
    return () => unsub();
  }, [fbReady]);

  const placeOrder = async (items, glitterTier, customerName, phone, note, bleacherSection) => {
    // Avoid handing out a number that's already showing on another pending order today
    const pendingNumbers = new Set(orders.map(o => o.number));
    let num;
    let attempts = 0;
    do {
      num = Math.floor(Math.random() * 89) + 10;
      attempts++;
    } while (pendingNumbers.has(num) && attempts < 50);
    let discount = 0, freeItem = null;
    if (items.length >= 4) {
      const sorted = [...items].sort((a, b) => a.price - b.price);
      freeItem = sorted[0]; discount = freeItem.price;
    }
    const glitterPrice = glitterTier ? (GLITTER_TIERS.find(t => t.id === glitterTier)?.price || 0) : 0;
    const subtotal = items.reduce((s, i) => s + i.price, 0) + glitterPrice;
    const total = Math.max(0, subtotal - discount);
    const order = {
      id: Date.now(), number: num, items, glitter: glitterTier || null, total, discount,
      freeItem: freeItem || null, status: "pending",
      time: new Date().toISOString(), location: currentLocation,
      customerName: customerName || "Guest", phone: phone || "",
      note: note || "", bleacherSection: bleacherSection || ""
    };
    if (fbReady && db) {
      const newRef = await firebasePush(firebaseRef(db, "orders"), order);
      return { ...order, firebaseKey: newRef.key };
    }
    setOrders(p => [...p, order]);
    return order;
  };

  const completeOrder = async (id, firebaseKey) => {
    const order = orders.find(x => x.id === id);
    if (!order) return;
    if (fbReady && db) {
      await firebasePush(firebaseRef(db, "completed"), { ...order, status: "ready" });
      await firebaseRemove(firebaseRef(db, `orders/${firebaseKey}`));
    } else {
      setOrders(p => p.filter(x => x.id !== id));
      setCompleted(c => [...c, { ...order, status: "ready" }]);
    }
    setSales(s => [...s, {
      locationId: currentLocation.id, date: new Date().toDateString(),
      event: currentLocation.name, sales: order.total, orders: 1,
      weather: "Live", isSample: false
    }]);
  };

  const totalToday = sales.filter(s => !s.isSample).reduce((acc, s) => acc + s.sales, 0);
  const totalOrders = sales.filter(s => !s.isSample).reduce((acc, s) => acc + s.orders, 0);
  const locationStats = LOCATIONS.map(loc => {
    const locSales = sales.filter(s => s.locationId === loc.id);
    return { ...loc, totalSales: locSales.reduce((a, s) => a + s.sales, 0), totalOrders: locSales.reduce((a, s) => a + s.orders, 0), sessions: locSales.length };
  }).sort((a, b) => b.totalSales - a.totalSales);

  return { orders, completed, sales, placeOrder, completeOrder, totalToday, totalOrders, locationStats, currentLocation, setCurrentLocation };
}

// ─── PIN GATE ─────────────────────────────────────────────────────────────────
function PinGate({ onSuccess, onCancel }) {
  const storedPin = getStoredPin();
  const isSetup = !storedPin;
  const [digits, setDigits] = useState([]);
  const [confirmDigits, setConfirmDigits] = useState([]);
  const [step, setStep] = useState(isSetup ? "create" : "enter"); // create | confirm | enter
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");

  const addDigit = (d) => {
    if (step === "confirm") {
      if (confirmDigits.length >= 6) return;
      const next = [...confirmDigits, d];
      setConfirmDigits(next);
      if (next.length === 6) {
        if (next.join("") === digits.join("")) {
          savePin(next.join(""));
          startSession();
          onSuccess();
        } else {
          setShake(true);
          setError("PINs don't match. Try again.");
          setTimeout(() => { setShake(false); setConfirmDigits([]); setError(""); }, 700);
        }
      }
    } else {
      if (digits.length >= 6) return;
      const next = [...digits, d];
      setDigits(next);
      if (next.length === 6) {
        if (step === "create") {
          setStep("confirm");
        } else {
          // verify
          if (next.join("") === storedPin) {
            startSession();
            onSuccess();
          } else {
            setShake(true);
            setError("Wrong PIN. Try again.");
            setTimeout(() => { setShake(false); setDigits([]); setError(""); }, 700);
          }
        }
      }
    }
  };

  const del = () => {
    if (step === "confirm") setConfirmDigits(c => c.slice(0, -1));
    else setDigits(d => d.slice(0, -1));
  };

  const current = step === "confirm" ? confirmDigits : digits;

  return (
    <div className="pin-overlay">
      <div className="pin-box">
        <div className="pin-logo">🍋</div>
        <div className="pin-title">
          {step === "create" ? "Create Owner PIN" : step === "confirm" ? "Confirm PIN" : "Owner Access"}
        </div>
        <div className="pin-sub">
          {step === "create" ? "Set a 6-digit PIN to protect your dashboard" :
           step === "confirm" ? "Enter your PIN one more time" :
           "Enter your 6-digit PIN"}
        </div>

        <div className={`pin-dots ${shake ? "shake" : ""}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`pin-dot ${i < current.length ? "filled" : ""}`} />
          ))}
        </div>

        {error && <div className="pin-error">{error}</div>}

        <div className="pin-pad">
          {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
            <button
              key={i}
              className={`pin-key ${k === "" ? "pin-key-empty" : ""}`}
              onClick={() => { if (k === "⌫") del(); else if (k !== "") addDigit(String(k)); }}
              disabled={k === ""}
            >{k}</button>
          ))}
        </div>

        <button className="pin-cancel" onClick={onCancel}>← Back to Menu</button>
      </div>
    </div>
  );
}

// ─── PUNCH CARD ───────────────────────────────────────────────────────────────
function PunchCardDisplay({ punches, small }) {
  return (
    <div className={`punch-card ${small ? "punch-small" : ""}`}>
      {!small && <div className="punch-title">☕ Loyalty Punch Card</div>}
      <div className="punch-row">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`punch-dot ${i < punches ? "punched" : ""}`}>{i < punches ? "🍋" : "○"}</div>
        ))}
        <div className={`punch-dot free-dot ${punches >= 5 ? "active" : ""}`}>🎁</div>
      </div>
      {!small && (
        <p className="punch-sub">
          {punches >= 5 ? "🎉 FREE drink ready! Show this at the stand!" : `${5 - punches} more drink${5 - punches !== 1 ? "s" : ""} until your FREE one!`}
        </p>
      )}
    </div>
  );
}

// ─── WEATHER CARD ─────────────────────────────────────────────────────────────
function WeatherCard({ weather, loading, refetch }) {
  if (loading) return <div className="weather-card loading"><div className="weather-spinner" /><span>Getting weather...</span></div>;
  if (!weather) return null;
  return (
    <div className="weather-card">
      <div className="weather-main">
        <span className="weather-icon">{weather.icon}</span>
        <div><div className="weather-temp">{weather.temp}°F</div><div className="weather-desc">{weather.desc}</div></div>
        <button className="weather-refresh" onClick={refetch}>↻</button>
      </div>
      <div className="weather-details">
        <span>💨 {weather.wind}mph</span><span>🌧️ {weather.rain}"</span>
        <span className="weather-verdict">{weather.selling}</span>
      </div>
      {weather.fallback && <div className="weather-fallback">📍 Enable location for live weather</div>}
    </div>
  );
}

// ─── LOCATION HEATMAP ─────────────────────────────────────────────────────────
function LocationHeatmap({ locationStats }) {
  const max = Math.max(...locationStats.map(l => l.totalSales), 1);
  return (
    <div className="heatmap">
      {locationStats.map((loc, i) => {
        const pct = (loc.totalSales / max) * 100;
        const heat = pct > 75 ? "hot" : pct > 40 ? "warm" : "cool";
        return (
          <div key={loc.id} className={`heatmap-row ${heat}`}>
            <div className="heatmap-rank">#{i + 1}</div>
            <div className="heatmap-info">
              <div className="heatmap-name">{loc.emoji} {loc.name}</div>
              <div className="heatmap-bar-wrap"><div className="heatmap-bar" style={{ width: `${pct}%`, background: loc.color }} /></div>
              <div className="heatmap-stats">${loc.totalSales.toFixed(0)} • {loc.sessions} sessions</div>
            </div>
            <div className="heatmap-badge" style={{ background: loc.color }}>{heat === "hot" ? "🔥" : heat === "warm" ? "⚡" : "❄️"}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AI ADVISOR ───────────────────────────────────────────────────────────────
function AIAdvisor({ locationStats, weather, sales, currentLocation }) {
  const { ask, loading, response } = useAI();
  const [asked, setAsked] = useState(false);
  const getAdvice = () => {
    setAsked(true);
    const topLoc = locationStats[0];
    ask(`You are a friendly business advisor for "Riverside Squeeze", a mobile lemonade stand in Buffalo NY's Riverside Park. Current weather: ${weather?.temp || 72}°F, ${weather?.desc || "Clear"}. Current location: ${currentLocation.name}. Top performing location: ${topLoc?.name} with $${topLoc?.totalSales?.toFixed(0)} across ${topLoc?.sessions} sessions. Give 3 SHORT actionable tips for maximizing sales today. Be casual, encouraging. Use emojis. Under 120 words.`);
  };
  return (
    <div className="ai-advisor">
      <div className="ai-header"><div className="ai-icon">🤖</div><div><div className="ai-title">AI Sales Advisor</div><div className="ai-sub">Powered by Claude</div></div></div>
      {!asked ? <button className="ai-btn" onClick={getAdvice}>✨ Get Today's Strategy</button>
        : loading ? <div className="ai-loading"><div className="ai-dots"><span /><span /><span /></div><p>Analyzing your sales data...</p></div>
        : <div className="ai-response"><p>{response}</p><button className="ai-refresh" onClick={getAdvice}>↻ Ask Again</button></div>}
    </div>
  );
}

// ─── AI QUICK ORDER ───────────────────────────────────────────────────────────
function AIQuickOrder({ profile, menu, onAddToCart }) {
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const asked = useRef(false);

  useEffect(() => {
    if (!profile || profile.totalOrders === 0 || asked.current) return;
    asked.current = true;
    setLoading(true);
    const favs = getFavorites(profile, menu);
    const historyDesc = favs.length > 0 ? favs.map(f => `${f.name} (ordered ${f.orderCount}x)`).join(", ") : "no previous orders";
    const prompt = `You are an AI order assistant for Riverside Squeeze lemonade stand. Customer "${profile.name}" has ordered: ${historyDesc}. Total orders: ${profile.totalOrders}. Available drinks: ${menu.map(m => m.name).join(", ")}. Suggest the ONE drink they most likely want today. Reply ONLY with a JSON object like: {"name":"Dragon Fruit Lemonade","reason":"Your go-to! You've had it 3 times 🐉","emoji":"🐉"}. No other text.`;
    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 200, messages: [{ role: "user", content: prompt }] }),
    }).then(r => r.json()).then(data => {
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setSuggestion(parsed);
    }).catch(() => {
      const favs = getFavorites(profile, menu);
      if (favs[0]) setSuggestion({ name: favs[0].name, reason: "Your most ordered drink!", emoji: favs[0].emoji });
    }).finally(() => setLoading(false));
  }, [profile]);

  if (!profile || profile.totalOrders === 0) return null;
  const suggestedItem = suggestion ? menu.find(m => m.name === suggestion.name) : null;

  return (
    <div className="quick-order-card">
      <div className="quick-order-label">⚡ AI Quick Order</div>
      {loading && !suggestion ? (
        <div className="quick-loading"><div className="ai-dots"><span /><span /><span /></div></div>
      ) : suggestion && suggestedItem ? (
        <div className="quick-suggestion">
          <div className="quick-left">
            <span className="quick-emoji">{suggestion.emoji}</span>
            <div><div className="quick-name">{suggestion.name}</div><div className="quick-reason">{suggestion.reason}</div></div>
          </div>
          <button className="quick-add-btn" onClick={() => onAddToCart(suggestedItem)}>+ Add</button>
        </div>
      ) : null}
    </div>
  );
}

// ─── CUSTOMER PROFILE CARD ────────────────────────────────────────────────────
function CustomerProfileCard({ profile, menu, onAddToCart }) {
  const [expanded, setExpanded] = useState(false);
  const favorites = getFavorites(profile, menu);
  const tier = profile.totalOrders >= 20 ? { label: "VIP 👑", color: "#FFEE00" } : profile.totalOrders >= 10 ? { label: "Regular ⭐", color: "#B026FF" } : profile.totalOrders >= 3 ? { label: "Fan 🍋", color: "#1AE85C" } : { label: "Newcomer 🌱", color: "#3D9CFF" };
  return (
    <div className="profile-card">
      <div className="profile-header" onClick={() => setExpanded(e => !e)}>
        <div className="profile-avatar">{profile.name.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <div className="profile-name">{profile.name}</div>
          <div className="profile-meta">
            <span className="profile-tier" style={{ color: tier.color }}>{tier.label}</span>
            <span className="profile-dot">·</span>
            <span className="profile-visits">{profile.totalOrders} order{profile.totalOrders !== 1 ? "s" : ""}</span>
            <span className="profile-dot">·</span>
            <span className="profile-spent">${profile.totalSpent.toFixed(2)} spent</span>
          </div>
        </div>
        <div className="profile-chevron">{expanded ? "▲" : "▼"}</div>
      </div>
      {expanded && (
        <div className="profile-expanded">
          <PunchCardDisplay punches={profile.punches} />
          {favorites.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-title">🏆 Your Favorites</div>
              <div className="fav-list">
                {favorites.map(item => (
                  <div key={item.id} className="fav-row">
                    <span className="fav-emoji">{item.emoji}</span>
                    <div className="fav-info"><div className="fav-name">{item.name}</div><div className="fav-count">Ordered {item.orderCount}x</div></div>
                    <button className="fav-add-btn" onClick={() => onAddToCart(item)}>+ Add</button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {profile.orderHistory?.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-title">📋 Recent Orders</div>
              <div className="history-list">
                {profile.orderHistory.slice(-3).reverse().map((order, i) => (
                  <div key={i} className="history-row">
                    <div className="history-items">{(order.items||[]).map(it => it.emoji).join(" ")}</div>
                    <div className="history-detail">
                      <div className="history-names">{(order.items||[]).map(it => it.name).join(", ")}</div>
                      <div className="history-date">{order.date} · {order.location}</div>
                    </div>
                    <div className="history-price">${(order.total||0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PHONE LOGIN ──────────────────────────────────────────────────────────────
function PhoneLoginScreen({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState("phone");
  const [existingProfile, setExistingProfile] = useState(null);
  const [checking, setChecking] = useState(false);

  const handlePhoneSubmit = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return;
    setChecking(true);
    const profile = await loadProfile(digits);
    setChecking(false);
    if (profile) { setExistingProfile(profile); setStep("returning"); }
    else setStep("name");
  };

  const handleNew = () => {
    if (!name.trim()) return;
    const digits = phone.replace(/\D/g, "");
    const np = createProfile(digits, name.trim());
    saveProfile(digits, np);
    onLogin(np, digits);
  };

  return (
    <div className="name-screen">
      <div className="name-logo">🍋</div>
      <h2 className="name-title">Welcome to<br />Riverside Squeeze</h2>
      {step === "phone" && (
        <>
          <p className="name-sub">Enter your phone number to access your loyalty card & profile</p>
          <div className="phone-input-wrap">
            <span className="phone-flag">📱</span>
            <input className="name-input phone-input" placeholder="(716) 555-0100" value={formatPhone(phone)} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" maxLength={14} />
          </div>
          <button className="btn-primary" onClick={handlePhoneSubmit} disabled={phone.replace(/\D/g, "").length < 10 || checking}>{checking ? "Checking..." : "Continue 🍋"}</button>
          <p className="phone-privacy">🔒 Stored only on your device. Never shared.</p>
        </>
      )}
      {step === "name" && (
        <>
          <p className="name-sub">First time here? What should we call you?</p>
          <input className="name-input" placeholder="Your name..." value={name} onChange={e => setName(e.target.value)} maxLength={30} autoFocus />
          <button className="btn-primary" onClick={handleNew} disabled={!name.trim()}>Let's Go 🍋</button>
          <button className="back-link" onClick={() => setStep("phone")}>← Different number</button>
        </>
      )}
      {step === "returning" && existingProfile && (
        <>
          <div className="returning-card">
            <div className="returning-avatar">{existingProfile.name.charAt(0).toUpperCase()}</div>
            <div className="returning-name">Welcome back,<br /><strong>{existingProfile.name}</strong>!</div>
            <div className="returning-stats">
              <div className="ret-stat"><span className="ret-val">{existingProfile.totalOrders}</span><span className="ret-lbl">Orders</span></div>
              <div className="ret-stat"><span className="ret-val">{existingProfile.punches}/5</span><span className="ret-lbl">Punches</span></div>
              <div className="ret-stat"><span className="ret-val">${existingProfile.totalSpent.toFixed(0)}</span><span className="ret-lbl">Spent</span></div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => onLogin(existingProfile, existingProfile.phone)}>That's me! 🍋</button>
          <button className="back-link" onClick={() => { setStep("phone"); setPhone(""); setExistingProfile(null); }}>← Not me</button>
        </>
      )}
    </div>
  );
}

// ─── STRIPE CHECKOUT SCREEN ───────────────────────────────────────────────────
function StripeCheckoutScreen({ total, cart, glitter, onBack, onConfirm }) {
  const stripeLink = getStripeLink();
  const [payMethod, setPayMethod] = useState(null);

  const handleStripeClick = () => {
    if (!stripeLink) {
      alert("Payment link not configured yet. Owner needs to set up Stripe in the dashboard.");
      return;
    }
    // Build Stripe Payment Link with pre-filled amount note
    // Stripe Payment Links support ?prefilled_email and custom params
    const url = stripeLink.includes("?")
      ? `${stripeLink}&client_reference_id=order_${Date.now()}`
      : `${stripeLink}?client_reference_id=order_${Date.now()}`;
    window.open(url, "_blank");
    // After redirect we show confirmation
    onConfirm("stripe");
  };

  return (
    <div className="inner-screen">
      <div className="inner-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2 className="inner-title">Checkout</h2>
      </div>
      <div style={{ padding: "0 16px" }}>
        {/* Order Summary */}
        <div className="checkout-summary">
          <div className="checkout-summary-title">Order Summary</div>
          {cart.map((item, i) => (
            <div key={i} className="checkout-line">
              <span>{item.emoji} {item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))}
          {glitter && <div className="checkout-line"><span>✨ Edible Glitter</span><span>$0.25</span></div>}
          <div className="checkout-total-line">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>

        <p style={{ color: "#888", fontSize: 13, margin: "16px 0 12px", textAlign: "center" }}>How would you like to pay?</p>

        <div className="pay-options">
          {/* Stripe Card / Apple Pay / Google Pay — all via Stripe link */}
          <button className="pay-btn stripe-pay" onClick={handleStripeClick}>
            <span>💳</span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div>Pay Online</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 400, marginTop: 2 }}>Card · Apple Pay · Google Pay</div>
            </div>
            <div className="stripe-secured-badge">🔒 Stripe</div>
          </button>

          <button className="pay-btn cash" onClick={() => setPayMethod("cash")}>
            <span>💵</span> Pay at Stand (Cash / Card Reader)
          </button>
        </div>

        {payMethod === "cash" && (
          <div className="pay-confirm" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💵</div>
            <p style={{ color: "#ccc", fontSize: 14, marginBottom: 4 }}>
              You'll pay ${total.toFixed(2)} directly at the stand when your order is called.
            </p>
            <button className="btn-primary" onClick={() => onConfirm("cash")} style={{ marginTop: 8 }}>
              Confirm Order 🍋
            </button>
          </div>
        )}

        {/* Trust badges */}
        <div className="trust-row">
          <div className="trust-badge"><span>🔒</span><span>256-bit SSL</span></div>
          <div className="trust-badge"><span>🏦</span><span>Stripe Payments</span></div>
          <div className="trust-badge"><span>✅</span><span>PCI Compliant</span></div>
        </div>

        <div className="stripe-note">
          Online payments are processed securely by <strong>Stripe</strong>. Your card info never touches our servers. Funds deposit directly to the Riverside Squeeze business account.
        </div>
      </div>
    </div>
  );
}

// ─── BANKING / STRIPE SETUP TAB ───────────────────────────────────────────────
function BankingTab() {
  const [stripeLink, setStripeLinkState] = useState(getStripeLink());
  const [editLink, setEditLink] = useState(false);
  const [draft, setDraft] = useState(stripeLink);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveStripeLink(draft.trim());
    setStripeLinkState(draft.trim());
    setEditLink(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ padding: "16px" }}>
      {/* Setup Guide */}
      <div className="setup-guide">
        <div className="setup-guide-title">🏦 Connect Stripe → Your Credit Union</div>
        <div className="setup-steps">
          {[
            { n: "1", title: "Create free Stripe account", desc: "Go to stripe.com → Sign Up. Use your business email.", action: { label: "Open Stripe →", url: "https://stripe.com" } },
            { n: "2", title: "Add your credit union account", desc: "In Stripe dashboard: Settings → Bank accounts → Add bank account. Enter your routing & account number.", action: null },
            { n: "3", title: "Create a Payment Link", desc: "Stripe Dashboard → Payment Links → Create. Set product name 'Riverside Squeeze Order', price $1 (customers will see actual total). Copy the link.", action: null },
            { n: "4", title: "Paste your Payment Link below", desc: "Customers tap 'Pay Online' and are sent to your Stripe checkout. Money deposits to your credit union in 2 business days.", action: null },
          ].map(step => (
            <div key={step.n} className="setup-step">
              <div className="setup-step-num">{step.n}</div>
              <div className="setup-step-body">
                <div className="setup-step-title">{step.title}</div>
                <div className="setup-step-desc">{step.desc}</div>
                {step.action && (
                  <a href={step.action.url} target="_blank" rel="noreferrer" className="setup-step-link">{step.action.label}</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Link Input */}
      <div className="banking-card" style={{ marginTop: 16 }}>
        <div className="banking-title">⚡ Your Stripe Payment Link</div>
        {!editLink ? (
          <div>
            {stripeLink ? (
              <div className="stripe-link-display">
                <div className="stripe-link-label">✅ Payment link saved</div>
                <div className="stripe-link-url">{stripeLink}</div>
                <button className="edit-link-btn" onClick={() => { setEditLink(true); setDraft(stripeLink); }}>✏️ Edit Link</button>
              </div>
            ) : (
              <div>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>No payment link set yet. Follow the steps above, then paste your Stripe Payment Link here.</p>
                <button className="add-new-btn" onClick={() => setEditLink(true)}>+ Add Payment Link</button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="modal-field">
              <label className="modal-label">Stripe Payment Link URL</label>
              <input
                className="modal-input"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="https://buy.stripe.com/..."
                autoFocus
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="modal-save" onClick={handleSave}>Save Link</button>
              <button className="modal-cancel" onClick={() => setEditLink(false)}>Cancel</button>
            </div>
          </div>
        )}
        {saved && <div className="save-toast">✅ Payment link saved!</div>}

        <div className="banking-section" style={{ marginTop: 20 }}>
          <div className="banking-label">Accepted via Stripe Checkout</div>
          <div className="banking-row"><span>💳 Visa / Mastercard / Amex</span><span style={{ color: "#3DFF8F", fontSize: 12 }}>✓ Ready</span></div>
          <div className="banking-row"><span>🍎 Apple Pay</span><span style={{ color: "#3DFF8F", fontSize: 12 }}>✓ Ready</span></div>
          <div className="banking-row"><span>🔵 Google Pay</span><span style={{ color: "#3DFF8F", fontSize: 12 }}>✓ Ready</span></div>
          <div className="banking-row"><span>🏦 Direct to Your Credit Union</span><span style={{ color: "#3DFF8F", fontSize: 12 }}>✓ 2-day deposit</span></div>
        </div>

        <div className="banking-note">
          🔒 Stripe handles all card data. You never see raw card numbers. Stripe charges ~2.9% + $0.30 per transaction, then deposits the remainder directly to your linked credit union account on a rolling 2-day basis.
        </div>
      </div>
    </div>
  );
}

// ─── MENU EDITOR ─────────────────────────────────────────────────────────────
function MenuEditor({ menu, setMenu, specials, setSpecials, songOfDay, setSongOfDay }) {
  const [editItem, setEditItem] = useState(null);
  const [editSpecial, setEditSpecial] = useState(null);
  const [form, setForm] = useState({});
  const [specialForm, setSpecialForm] = useState({});
  const [tab, setTab] = useState("menu");
  const [songSearch, setSongSearch] = useState("");
  const [songResults, setSongResults] = useState([]);
  const { ask: askSong, loading: songSearching, response: songResponse } = useAI();

  // Live search-as-you-type, debounced like a normal search engine
  useEffect(() => {
    if (!songSearch.trim() || songSearch.trim().length < 2) { setSongResults([]); return; }
    const timer = setTimeout(() => {
      askSong(`The user is typing this search into a music search box (may be incomplete or misspelled): "${songSearch}". Guess what artist or song they mean, then list up to 5 matching songs. Reply ONLY with a JSON array like: [{"title":"song name","artist":"correct artist name"},...] No other text.`);
    }, 400);
    return () => clearTimeout(timer);
  }, [songSearch]);

  useEffect(() => {
    if (!songResponse) return;
    try {
      const clean = songResponse.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed)) setSongResults(parsed);
    } catch {}
  }, [songResponse]);

  const pickSong = (song) => {
    setSongOfDay(s => ({ ...s, title: song.title, artist: song.artist }));
    setSongSearch("");
    setSongResults([]);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      ...item,
      kidPrice: item.sizePrices?.[0] != null ? String(item.sizePrices[0]) : "",
      regularPrice: item.sizePrices?.[1] != null ? String(item.sizePrices[1]) : "",
      kidLabel: item.sizes?.[0] || "Kid Size 12oz",
      regularLabel: item.sizes?.[1] || "Regular Size 24oz",
    });
  };
  const openAdd = () => {
    setEditItem("new");
    setForm({
      name: "", emoji: "🍋", desc: "", tag: "",
      gradient: "linear-gradient(135deg, #FFEE00 0%, #FF7A00 100%)",
      kidPrice: "3", regularPrice: "5",
      kidLabel: "Kid Size 12oz", regularLabel: "Regular Size 24oz",
    });
  };
  const saveItem = () => {
    const kidP = parseFloat(form.kidPrice) || 0;
    const regP = parseFloat(form.regularPrice) || 0;
    const item = {
      name: form.name, emoji: form.emoji, desc: form.desc, tag: form.tag || null,
      gradient: form.gradient,
      id: editItem === "new" ? Date.now() : form.id,
      price: kidP, // base/display price defaults to kid price
      sizes: [form.kidLabel || "Kid Size", form.regularLabel || "Regular Size"],
      sizePrices: [kidP, regP],
      soldOut: form.soldOut || false,
    };
    if (editItem === "new") setMenu(m => [...m, item]);
    else setMenu(m => m.map(x => x.id === item.id ? item : x));
    setEditItem(null);
  };

  const openSpecialEdit = (s) => { setEditSpecial(s); setSpecialForm({ ...s }); };
  const openSpecialAdd = () => { setEditSpecial("new"); setSpecialForm({ name: "", desc: "", emoji: "🎉", active: true }); };
  const saveSpecial = () => {
    const s = { ...specialForm, id: editSpecial === "new" ? Date.now() : specialForm.id };
    if (editSpecial === "new") setSpecials(arr => [...arr, s]);
    else setSpecials(arr => arr.map(x => x.id === s.id ? s : x));
    setEditSpecial(null);
  };

  return (
    <div className="menu-editor">
      <div className="editor-tabs">
        {["menu","specials","song"].map(t => (
          <button key={t} className={`editor-tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>
            {t==="menu"?"🍋 Menu":t==="specials"?"🎉 Specials":"🎵 Song"}
          </button>
        ))}
      </div>
      {tab === "menu" && (
        <div>
          <button className="add-new-btn" onClick={openAdd}>+ Add New Drink</button>
          {menu.map(item => (
            <div key={item.id} className="editor-row">
              <div className="editor-row-info">
                <span style={{fontSize:22}}>{item.emoji}</span>
                <div>
                  <div className="editor-row-name">{item.name}</div>
                  <div className="editor-row-price">
                    {item.sizes?.[0] || "Kid"}: ${item.sizePrices?.[0]?.toFixed(2) ?? item.price.toFixed(2)} · {item.sizes?.[1] || "Regular"}: ${item.sizePrices?.[1]?.toFixed(2) ?? item.price.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="editor-row-actions">
                <button className="edit-btn" onClick={() => openEdit(item)}>✏️</button>
                <button className="del-btn" onClick={() => setMenu(m => m.filter(x => x.id !== item.id))}>🗑️</button>
              </div>
            </div>
          ))}
          {editItem && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3 className="modal-title">{editItem==="new"?"Add Drink":"Edit Drink"}</h3>
                {[["name","Name"],["emoji","Emoji"],["desc","Description"],["tag","Tag (optional)"]].map(([k,label]) => (
                  <div key={k} className="modal-field">
                    <label className="modal-label">{label}</label>
                    <input className="modal-input" value={form[k]||""} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} />
                  </div>
                ))}

                <div style={{ background: "rgba(255,225,53,0.05)", border: "1px solid rgba(255,225,53,0.15)", borderRadius: 12, padding: 12, marginTop: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: "#FFEE00", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>💰 PRICING</div>
                  <div className="modal-field">
                    <label className="modal-label">Kid Size Label</label>
                    <input className="modal-input" value={form.kidLabel||""} onChange={e => setForm(f => ({...f,kidLabel:e.target.value}))} placeholder="Kid Size 12oz" />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Kid Size Price ($)</label>
                    <input className="modal-input" value={form.kidPrice||""} onChange={e => setForm(f => ({...f,kidPrice:e.target.value}))} placeholder="3.00" inputMode="decimal" />
                  </div>
                  <div className="modal-field">
                    <label className="modal-label">Regular Size Label</label>
                    <input className="modal-input" value={form.regularLabel||""} onChange={e => setForm(f => ({...f,regularLabel:e.target.value}))} placeholder="Regular Size 24oz" />
                  </div>
                  <div className="modal-field" style={{marginBottom:0}}>
                    <label className="modal-label">Regular Size Price ($)</label>
                    <input className="modal-input" value={form.regularPrice||""} onChange={e => setForm(f => ({...f,regularPrice:e.target.value}))} placeholder="5.00" inputMode="decimal" />
                  </div>
                </div>

                <div className="modal-field">
                  <label className="modal-label">Gradient CSS</label>
                  <input className="modal-input" value={form.gradient||""} onChange={e => setForm(f => ({...f,gradient:e.target.value}))} />
                </div>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button className="modal-save" onClick={saveItem}>Save</button>
                  <button className="modal-cancel" onClick={() => setEditItem(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "specials" && (
        <div>
          <button className="add-new-btn" onClick={openSpecialAdd}>+ Add Special</button>
          {specials.map(s => (
            <div key={s.id} className="editor-row">
              <div className="editor-row-info"><span style={{fontSize:22}}>{s.emoji}</span><div><div className="editor-row-name">{s.name}</div><div className="editor-row-price" style={{color:s.active?"#3DFF8F":"#FF5252"}}>{s.active?"● Active":"○ Inactive"}</div></div></div>
              <div className="editor-row-actions">
                <button className="edit-btn" onClick={() => openSpecialEdit(s)}>✏️</button>
                <button className="del-btn" onClick={() => setSpecials(arr => arr.filter(x => x.id !== s.id))}>🗑️</button>
              </div>
            </div>
          ))}
          {editSpecial && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3 className="modal-title">{editSpecial==="new"?"Add Special":"Edit Special"}</h3>
                {[["name","Name"],["emoji","Emoji"],["desc","Description"]].map(([k,label]) => (
                  <div key={k} className="modal-field"><label className="modal-label">{label}</label><input className="modal-input" value={specialForm[k]||""} onChange={e => setSpecialForm(f => ({...f,[k]:e.target.value}))} /></div>
                ))}
                <label className="glitter-toggle" style={{marginTop:8}}><input type="checkbox" checked={!!specialForm.active} onChange={e => setSpecialForm(f => ({...f,active:e.target.checked}))} /><span style={{marginLeft:8,fontSize:14}}>Active (show to customers)</span></label>
                <div style={{display:"flex",gap:8,marginTop:12}}><button className="modal-save" onClick={saveSpecial}>Save</button><button className="modal-cancel" onClick={() => setEditSpecial(null)}>Cancel</button></div>
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "song" && (
        <div className="song-editor">
          <p className="song-hint">Set the Song of the Day — customers will see this on the menu!</p>

          <div className="modal-field">
            <label className="modal-label">🔍 Search for a song or artist</label>
            <input
              className="modal-input"
              value={songSearch}
              onChange={e => setSongSearch(e.target.value)}
              placeholder="Start typing... (typos ok!)"
            />
          </div>
          {songSearching && <div className="quick-loading"><div className="ai-dots"><span/><span/><span/></div></div>}
          {songResults.length > 0 && (
            <div className="music-results" style={{marginBottom:12}}>
              {songResults.map((song, i) => (
                <button key={i} className="music-result-row" style={{width:"100%",border:"none",cursor:"pointer",textAlign:"left",fontFamily:"'Outfit', sans-serif",background:"#06060f"}} onClick={() => pickSong(song)}>
                  <div className="music-result-info">
                    <div className="music-result-title">{song.title}</div>
                    <div className="music-result-artist">{song.artist}</div>
                  </div>
                  <span style={{color:"#FFEE00",fontSize:12,fontWeight:700}}>Use →</span>
                </button>
              ))}
            </div>
          )}

          {[["title","🎵 Song Title","e.g. Started From the Bottom"],["artist","🎤 Artist","e.g. Drake"],["vibe","😎 Vibe Note (optional)","e.g. It's a banger today"]].map(([k,label,ph]) => (
            <div key={k} className="modal-field"><label className="modal-label">{label}</label><input className="modal-input" value={songOfDay[k]} onChange={e => setSongOfDay(s => ({...s,[k]:e.target.value}))} placeholder={ph} /></div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OWNER PROFILES PANEL (UPGRADED) ─────────────────────────────────────────
function OwnerProfilesPanel({ menu }) {
  const [profiles, setProfiles] = useState([]);
  const [search, setSearch] = useState("");
  const [fbConnected, setFbConnected] = useState(false);

  const loadProfilesLocal = () => {
    const found = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("rs_profile_")) {
        try { const p = JSON.parse(localStorage.getItem(key)); if (p) found.push(p); } catch {}
      }
    }
    found.sort((a, b) => b.totalSpent - a.totalSpent);
    setProfiles(found);
  };

  useEffect(() => {
    let unsub = null;
    let pollId = null;
    let cancelled = false;

    const attachLiveListener = () => {
      if (cancelled) return;
      const profilesRef = firebaseRef(db, "profiles");
      unsub = firebaseOnValue(profilesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const found = Object.values(data).sort((a, b) => (b.totalSpent||0) - (a.totalSpent||0));
          setProfiles(found);
        } else {
          setProfiles([]);
        }
      });
    };

    const waitForFirebase = () => {
      if (cancelled) return;
      if (db && firebaseRef && firebaseOnValue) {
        setFbConnected(true);
        attachLiveListener();
      } else {
        // Firebase still initializing — show local cache meanwhile, keep checking
        loadProfilesLocal();
        pollId = setTimeout(waitForFirebase, 500);
      }
    };
    waitForFirebase();

    return () => { cancelled = true; if (unsub) unsub(); if (pollId) clearTimeout(pollId); };
  }, []);

  const deleteCustomer = (phone) => {
    if (!window.confirm("Delete this customer?")) return;
    try { localStorage.removeItem(`rs_profile_${phone}`); } catch {}
    if (db && firebaseRemove && firebaseRef) {
      firebaseRemove(firebaseRef(db, `profiles/${phone}`));
    }
  };

  const filtered = profiles.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search.replace(/\D/g, ""))
  );
  const totalRevenue = profiles.reduce((s, p) => s + p.totalSpent, 0);

  return (
    <div className="profiles-panel">
      {!fbConnected && <div className="special-hint" style={{marginBottom:10}}>📡 Connecting to live customer data...</div>}
      <div className="profiles-stats">
        <div className="pstat"><span className="pstat-val">{profiles.length}</span><span className="pstat-lbl">Customers</span></div>
        <div className="pstat"><span className="pstat-val">{profiles.reduce((s,p) => s+p.totalOrders,0)}</span><span className="pstat-lbl">Orders</span></div>
        <div className="pstat"><span className="pstat-val">${totalRevenue.toFixed(0)}</span><span className="pstat-lbl">Revenue</span></div>
      </div>
      <input className="modal-input" placeholder="🔍 Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} style={{margin:"10px 0",width:"100%"}} />
      {filtered.length === 0 ? (
        <div className="empty-panel"><div style={{fontSize:40}}>👥</div><p>No customer profiles yet</p><p className="empty-sub">Profiles are created when customers order</p></div>
      ) : (
        <div className="owner-profile-list" style={{maxHeight:"60vh",overflowY:"auto"}}>
          {filtered.map((p, i) => {
            const tier = p.totalOrders >= 20 ? { label: "VIP 👑", color: "#FFEE00" } : p.totalOrders >= 10 ? { label: "Regular ⭐", color: "#B026FF" } : p.totalOrders >= 3 ? { label: "Fan 🍋", color: "#1AE85C" } : { label: "Newcomer 🌱", color: "#3D9CFF" };
            const favs = getFavorites(p, menu);
            return (
              <div key={i} className="owner-profile-row">
                <div className="opr-avatar">{p.name.charAt(0).toUpperCase()}</div>
                <div className="opr-info">
                  <div className="opr-name">{p.name} <span className="opr-tier" style={{color:tier.color}}>{tier.label}</span></div>
                  <div className="opr-phone">📱 ({p.phone.slice(0,3)}) {p.phone.slice(3,6)}-{p.phone.slice(6)}</div>
                  <div className="opr-stats">{p.totalOrders} orders · ${p.totalSpent.toFixed(2)} · {p.punches}/5 punches</div>
                  {favs.length > 0 && <div className="opr-favs">Loves: {favs.map(f => `${f.emoji} ${f.name}`).join(", ")}</div>}
                </div>
                <button className="del-btn" onClick={() => deleteCustomer(p.phone)} title="Delete customer">🗑️</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── DAILY GOAL TRACKER ───────────────────────────────────────────────────────
function DailyGoalTracker({ totalToday }) {
  const [goal, setGoal] = useState(getDailyGoal());
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(goal));
  const pct = Math.min(100, (totalToday / goal) * 100);
  const color = pct >= 100 ? "#3DFF8F" : pct >= 60 ? "#FFEE00" : "#FF7A00";

  const saveGoal = () => {
    const val = parseFloat(draft) || 200;
    setGoal(val);
    saveDailyGoal(val);
    setEditing(false);
  };

  return (
    <div className="goal-tracker">
      <div className="goal-header">
        <div className="goal-title">🎯 Daily Goal</div>
        {!editing ? (
          <button className="goal-edit-btn" onClick={() => { setEditing(true); setDraft(String(goal)); }}>
            ${goal.toFixed(0)} ✏️
          </button>
        ) : (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input className="goal-input" value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && saveGoal()} autoFocus />
            <button className="modal-save" style={{ padding: "4px 10px", fontSize: 12 }} onClick={saveGoal}>✓</button>
          </div>
        )}
      </div>
      <div className="goal-bar-wrap">
        <div className="goal-bar" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="goal-stats">
        <span style={{ color }}>${totalToday.toFixed(2)}</span>
        <span style={{ color: "#555" }}>/ ${goal.toFixed(0)}</span>
        <span style={{ marginLeft: "auto", color: pct >= 100 ? "#3DFF8F" : "#888" }}>
          {pct >= 100 ? "🎉 GOAL HIT!" : `${pct.toFixed(0)}%`}
        </span>
      </div>
    </div>
  );
}

// ─── CASH PAYMENT LOG ─────────────────────────────────────────────────────────
function CashLogPanel() {
  const [log, setLog] = useState(getCashLog());
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const addEntry = () => {
    if (!amount) return;
    const entry = { amount: parseFloat(amount), note: note || "Cash sale", date: new Date().toLocaleTimeString(), id: Date.now() };
    addCashLog(entry);
    setLog(getCashLog());
    setAmount(""); setNote("");
  };

  const total = log.reduce((s, e) => s + e.amount, 0);

  return (
    <div style={{ padding: "0 16px" }}>
      <div className="cash-log-header">
        <div className="cash-log-title">💵 Cash Log</div>
        <div className="cash-log-total">${total.toFixed(2)}</div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input className="modal-input" placeholder="$0.00" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: 80 }} inputMode="decimal" />
        <input className="modal-input" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} style={{ flex: 1 }} />
        <button className="modal-save" onClick={addEntry} style={{ padding: "8px 14px" }}>+ Add</button>
      </div>
      <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
        {log.slice().reverse().map((e, i) => (
          <div key={i} className="cash-log-row">
            <div className="cash-log-note">{e.note}</div>
            <div className="cash-log-time">{e.date}</div>
            <div className="cash-log-amount">${e.amount.toFixed(2)}</div>
          </div>
        ))}
        {log.length === 0 && <p style={{ color: "#555", fontSize: 13, textAlign: "center", padding: 20 }}>No cash logged yet</p>}
      </div>
    </div>
  );
}

// ─── SOLD OUT TOGGLE (used in MenuEditor) ────────────────────────────────────
// (integrated into MenuEditor below)

// ─── PUSH NOTIFICATION PANEL ──────────────────────────────────────────────────
function PushNotifPanel({ currentLocation }) {
  const [permGranted, setPermGranted] = useState(() => {
    try { return ("Notification" in window) && Notification.permission === "granted"; } catch { return false; }
  });
  const [sent, setSent] = useState(false);

  const requestPerm = async () => {
    const ok = await requestPushPermission();
    setPermGranted(ok);
  };

  const sendLive = () => {
    sendPushNotification(
      "🍋 Riverside Squeeze is LIVE!",
      `We're at ${currentLocation?.name || "Riverside Park"} — come get your squeeze! 🏈`,
    );
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <div className="banking-card">
        <div className="banking-title">🔔 Push Notifications</div>
        {!permGranted ? (
          <div>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Enable notifications so customers can get alerts when you go live.</p>
            <button className="stripe-btn" onClick={requestPerm}>Enable Notifications</button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: "#3DFF8F", marginBottom: 12 }}>✅ Notifications enabled!</p>
            <button className="stripe-btn" onClick={sendLive} style={{ background: "linear-gradient(135deg, #1AE85C, #16a34a)" }}>
              {sent ? "✅ Sent!" : `📣 Send "We're Live!" Alert`}
            </button>
            <p style={{ fontSize: 11, color: "#555", marginTop: 10 }}>Sends an alert to anyone who has your app open with notifications enabled.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ORDER BANNER (persistent while waiting) ─────────────────────────────────
function OrderBanner({ activeOrder, onTap, onDismiss }) {
  if (!activeOrder) return null;
  return (
    <div className="order-banner" onClick={onTap}>
      <div className="order-banner-left">
        <div className="order-banner-num">#{activeOrder.number}</div>
        <div className="order-banner-text">
          <div style={{ fontSize: 12, fontWeight: 700, color: "#FFEE00" }}>Your order is being made!</div>
          <div style={{ fontSize: 10, color: "#888" }}>Tap for full screen • {activeOrder.items?.length} item{activeOrder.items?.length !== 1 ? "s" : ""}</div>
        </div>
      </div>
      <div className="order-banner-ping" />
    </div>
  );
}

// ─── 2FA COMPONENT ────────────────────────────────────────────────────────────
function TwoFactorSetup({ onVerified, onCancel }) {
  const [step, setStep] = useState("choose"); // choose | backup | verify
  const [backupCode] = useState(() => {
    const existing = getBackupCode();
    if (existing) return existing;
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    saveBackupCode(code);
    return code;
  });
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleVerify = () => {
    if (input.toUpperCase() === backupCode) {
      trustDevice();
      onVerified();
    } else {
      setError("Wrong code. Try again.");
      setInput("");
    }
  };

  if (step === "choose") return (
    <div className="pin-overlay">
      <div className="pin-box">
        <div className="pin-logo">🔐</div>
        <div className="pin-title">2FA Verification</div>
        <div className="pin-sub">Extra security for your dashboard</div>
        <div style={{ background: "#0f0f1a", border: "1px solid #2a2a3e", borderRadius: 14, padding: 16, margin: "16px 0", width: "100%" }}>
          <div style={{ fontSize: 11, color: "#FFEE00", fontWeight: 700, marginBottom: 8 }}>YOUR BACKUP CODE</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: 4, textAlign: "center", fontFamily: "monospace" }}>{backupCode}</div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 8, textAlign: "center" }}>Save this somewhere safe!</div>
        </div>
        <button className="btn-primary" onClick={() => setStep("verify")}>I saved it — Continue</button>
        <button className="pin-cancel" style={{ marginTop: 12 }} onClick={onCancel}>← Back</button>
      </div>
    </div>
  );

  return (
    <div className="pin-overlay">
      <div className="pin-box">
        <div className="pin-logo">🔐</div>
        <div className="pin-title">Enter Backup Code</div>
        <div className="pin-sub">Enter your 6-character backup code to verify</div>
        <input
          className="name-input"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          placeholder="XXXXXX"
          maxLength={6}
          style={{ textAlign: "center", letterSpacing: 4, fontFamily: "monospace", fontSize: 20, marginTop: 16 }}
          autoFocus
        />
        {error && <div className="pin-error">{error}</div>}
        <button className="btn-primary" onClick={handleVerify} disabled={input.length < 6} style={{ marginTop: 12 }}>Verify →</button>
        <button className="pin-cancel" style={{ marginTop: 12 }} onClick={onCancel}>← Back</button>
      </div>
    </div>
  );
}

// ─── MENU CARD WITH SIZE/FLAVOR TIERS ────────────────────────────────────────
function MenuCard({ item, idx, onAddToCart }) {
  const hasTiers = item.sizes && item.sizePrices && item.sizes.length > 1;
  const [selectedTier, setSelectedTier] = useState(0);

  const displayPrice = hasTiers ? item.sizePrices[selectedTier] : item.price;
  const displayLabel = hasTiers ? item.sizes[selectedTier] : null;

  const handleAdd = () => {
    if (item.soldOut) return;
    const chosen = hasTiers
      ? { ...item, price: item.sizePrices[selectedTier], chosenSize: item.sizes[selectedTier] }
      : item;
    onAddToCart(chosen);
  };

  return (
    <div className={`menu-card ${item.soldOut ? "sold-out" : ""}`} style={{"--grad":item.gradient, animationDelay:`${idx*0.08}s`}}>
      {item.soldOut && <div className="sold-out-overlay">SOLD OUT</div>}
      {item.tag && <div className="card-tag">{item.tag}</div>}
      <div className="card-left"><div className="card-emoji">{item.emoji}</div></div>
      <div className="card-body">
        <h3 className="card-name">{item.name}</h3>
        <p className="card-desc">{item.desc}</p>

        {hasTiers && (
          <div className="tier-select-row">
            {item.sizes.map((sizeLabel, i) => (
              <button
                key={i}
                className={`tier-select-btn ${selectedTier === i ? "active" : ""}`}
                onClick={(e) => { e.stopPropagation(); setSelectedTier(i); }}
                disabled={item.soldOut}
              >
                {sizeLabel} · ${item.sizePrices[i].toFixed(2)}
              </button>
            ))}
          </div>
        )}

        <div className="card-bottom">
          <span className="card-price">${displayPrice.toFixed(2)}</span>
          <button className="add-btn" onClick={handleAdd} disabled={item.soldOut}>{item.soldOut ? "Sold Out" : "+ Add"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOMER VIEW ────────────────────────────────────────────────────────────
function getActiveOrderKey(phone) { return `rs_active_order_${phone.replace(/\D/g, "")}`; }

function CustomerView({ placeOrder, completed, isOpen, menu, specials, songOfDay, currentLocation }) {
  const [screen, setScreen] = useState("login");
  const [cart, setCart] = useState([]);
  const [glitterTier, setGlitterTier] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null); // loaded only after we know which phone is logged in
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [bleacherSection, setBleacherSection] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [showWaitingFullscreen, setShowWaitingFullscreen] = useState(false);
  const prevCompleted = useRef([]);

  // Once a phone number is known, load that phone's own active order (scoped key) — never another customer's
  useEffect(() => {
    if (!phone) return;
    try {
      const s = localStorage.getItem(getActiveOrderKey(phone));
      const restored = s ? JSON.parse(s) : null;
      // Safety check: only restore if it's not already marked completed in Firebase
      if (restored && completed.find(o => o.id === restored.id)) {
        // This order was already completed previously — don't show it as pending again
        try { localStorage.removeItem(getActiveOrderKey(phone)); } catch {}
        setActiveOrder(null);
      } else {
        setActiveOrder(restored);
      }
    } catch { setActiveOrder(null); }
  }, [phone]);

  useEffect(() => {
    if (!phone) return; // never write to a global key — always scoped to the logged-in phone
    if (activeOrder) try { localStorage.setItem(getActiveOrderKey(phone), JSON.stringify(activeOrder)); } catch {}
    else try { localStorage.removeItem(getActiveOrderKey(phone)); } catch {}
  }, [activeOrder, phone]);

  useEffect(() => {
    if (!phone) return;
    const digits = phone.replace(/\D/g, "");
    let unsub = null;
    let fallbackInterval = null;

    const attachListener = () => {
      if (db && firebaseRef && firebaseOnValue) {
        const profileRef = firebaseRef(db, `profiles/${digits}`);
        unsub = firebaseOnValue(profileRef, (snapshot) => {
          const val = snapshot.val();
          if (val) {
            try { localStorage.setItem(getProfileKey(phone), JSON.stringify(val)); } catch {}
            setProfile(prev => JSON.stringify(prev) !== JSON.stringify(val) ? val : prev);
          }
        });
      } else {
        // Firebase not ready yet, fall back to local polling until it is
        fallbackInterval = setInterval(() => {
          const latest = loadProfileLocal(phone);
          if (latest) setProfile(prev => JSON.stringify(prev) !== JSON.stringify(latest) ? latest : prev);
          if (db) { clearInterval(fallbackInterval); attachListener(); }
        }, 1000);
      }
    };
    attachListener();

    return () => { if (unsub) unsub(); if (fallbackInterval) clearInterval(fallbackInterval); };
  }, [phone]);

  useEffect(() => {
    if (!activeOrder || !profile || !phone) return;
    // Safety check: never process an order that doesn't belong to the currently logged-in phone
    const activeOrderPhone = (activeOrder.phone || "").replace(/\D/g, "");
    const currentPhone = phone.replace(/\D/g, "");
    if (activeOrderPhone && activeOrderPhone !== currentPhone) {
      console.warn("Active order phone mismatch — clearing stale order");
      setActiveOrder(null);
      return;
    }
    const found = completed.find(o => o.id === activeOrder.id);
    if (found && !prevCompleted.current.find(o => o.id === found.id)) {
      if (navigator.vibrate) navigator.vibrate([400,100,400,100,800]);
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [0, 0.2, 0.4].forEach((delay, i) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = [523, 659, 784][i]; osc.type = "sine";
          gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.5);
          osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.5);
        });
      } catch {}
      const orderItems = activeOrder.items || [];
      const newPunches = (profile.punches + orderItems.length) % 6;
      const newFavorites = { ...profile.favoriteItems };
      orderItems.forEach(item => { newFavorites[String(item.id)] = (newFavorites[String(item.id)] || 0) + 1; });
      const updated = { ...profile, punches: newPunches, totalOrders: profile.totalOrders + 1, totalSpent: profile.totalSpent + (activeOrder.total || 0), favoriteItems: newFavorites, orderHistory: [...(profile.orderHistory || []), { items: orderItems.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, price: i.price })), total: activeOrder.total || 0, date: new Date().toLocaleDateString(), location: activeOrder.location?.name || "Park" }].slice(-20) };
      saveProfile(phone, updated); setProfile(updated);
      setScreen("ready"); setShowWaitingFullscreen(false);
    }
    prevCompleted.current = completed;
  }, [completed, activeOrder, profile, phone]);

  const glitterPrice = glitterTier ? (GLITTER_TIERS.find(t => t.id === glitterTier)?.price || 0) : 0;
  let subtotal = cart.reduce((s, i) => s + i.price, 0) + glitterPrice;
  let discount = 0, freeItemName = null;
  const activeSpecial = specials.find(s => s.active && s.name.toLowerCase().includes("buy 3"));
  if (activeSpecial && cart.length >= 4) { const sorted = [...cart].sort((a,b) => a.price-b.price); freeItemName = sorted[0].name; discount = sorted[0].price; }
  const total = Math.max(0, subtotal - discount);
  const addToCart = (item) => { if (!item.soldOut) setCart(c => [...c, item]); };
  const reorder = (historyOrder) => { const items = historyOrder.items.map(hi => menu.find(m => m.id === hi.id)).filter(Boolean); if (items.length) { setCart(items); setScreen("cart"); } };
  const availableSections = BLEACHER_SECTIONS[currentLocation?.id] || [];

  if (screen === "login") return <PhoneLoginScreen onLogin={(p, ph) => {
    // Fresh login — wipe any leftover state from a previous customer on this device
    setActiveOrder(null);
    setCart([]);
    setGlitterTier(null);
    setOrderNote("");
    setBleacherSection("");
    setShowWaitingFullscreen(false);
    setShowBanner(true);
    prevCompleted.current = [];
    setProfile(p);
    setPhone(ph);
    setScreen("menu");
  }} />;

  if (showWaitingFullscreen && activeOrder) return (
    <div className="full-screen waiting-screen">
      <div className="waiting-glow" />
      <div className="waiting-content">
        <div className="waiting-rings"><div /><div /><div /></div>
        <div className="order-num-big">{activeOrder?.number}</div>
        <p className="waiting-name">Hey {profile?.name}!</p>
        <p className="waiting-label">YOUR ORDER NUMBER</p>
        <p className="waiting-msg">Go enjoy the game — we'll buzz you when it's ready! 🍋</p>
        {bleacherSection && <p style={{ color: "#B026FF", fontSize: 13, marginTop: 8 }}>📍 {bleacherSection}</p>}
        <div style={{marginTop:24}}><PunchCardDisplay punches={profile?.punches||0} small /></div>
        <button className="back-link" style={{ marginTop: 16, color: "#555", fontSize: 12 }} onClick={() => setShowWaitingFullscreen(false)}>← Back to Menu</button>
      </div>
    </div>
  );

  if (screen === "ready") return (
    <div className="full-screen ready-screen">
      <div className="ready-burst">🍋</div>
      <h2 className="ready-title">YOUR SQUEEZE IS READY!</h2>
      <p style={{color:"#aaa",fontSize:16,marginBottom:4}}>{profile?.name}</p>
      <div className="ready-num">{activeOrder?.number}</div>
      <p className="ready-sub">Show this number at the stand!</p>
      <div style={{margin:"16px 0"}}><PunchCardDisplay punches={profile?.punches||0} /></div>
      <button className="btn-primary" onClick={() => { setScreen("menu"); setCart([]); setGlitterTier(null); setActiveOrder(null); setOrderNote(""); setBleacherSection(""); setShowBanner(true); }}>Order Again 🍋</button>
    </div>
  );

  if (screen === "checkout") return (
    <StripeCheckoutScreen total={total} cart={cart} glitter={glitterTier} glitterPrice={glitterPrice}
      onBack={() => setScreen("cart")}
      onConfirm={async (method) => {
        const order = await placeOrder(cart, glitterTier, profile.name, phone, orderNote, bleacherSection);
        setActiveOrder(order); setShowBanner(true); setCart([]); setGlitterTier(null); setOrderNote("");
        setShowWaitingFullscreen(true); // show big number immediately after placing order
      }}
    />
  );

  if (screen === "cart") return (
    <div className="inner-screen">
      <div className="inner-header">
        <button className="back-btn" onClick={() => setScreen("menu")}>← Menu</button>
        <h2 className="inner-title">Your Order</h2>
      </div>
      <div className="cart-body">
        {cart.length === 0 ? <p className="empty-msg">Nothing added yet!</p> : (
          <>
            {cart.map((item, i) => (
              <div key={i} className="cart-row">
                <span>{item.emoji} {item.name}</span>
                <div className="cart-row-right"><span className="cart-price">${item.price.toFixed(2)}</span><button className="remove-btn" onClick={() => setCart(c => { const copy=[...c]; copy.splice(i,1); return copy; })}>✕</button></div>
              </div>
            ))}
            {/* Glitter Tiers */}
            <div style={{ padding: "12px 0", borderBottom: "1px solid #1a1a2e" }}>
              <div style={{ fontSize: 11, color: "#B026FF", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>✨ ADD EDIBLE GLITTER</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[{ id: null, label: "No Glitter", desc: "", price: 0 }, ...GLITTER_TIERS].map(tier => (
                  <button key={tier.id || "none"} className={`glitter-tier-btn ${glitterTier === tier.id ? "active" : ""}`} onClick={() => setGlitterTier(tier.id)}>
                    <span>{tier.label || "No Glitter"}</span>
                    {tier.desc && <span className="glitter-tier-desc">{tier.desc}</span>}
                    <span className="glitter-tier-price">{tier.price > 0 ? `+$${tier.price.toFixed(2)}` : "Free"}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Bleacher Selector */}
            {availableSections.length > 0 && (
              <div style={{ padding: "12px 0", borderBottom: "1px solid #1a1a2e" }}>
                <div style={{ fontSize: 11, color: "#3D9CFF", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>📍 WHERE ARE YOU SITTING?</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{availableSections.map(sec => (<button key={sec} className={`bleacher-btn ${bleacherSection === sec ? "active" : ""}`} onClick={() => setBleacherSection(sec)}>{sec}</button>))}</div>
              </div>
            )}
            {/* Order Notes */}
            <div style={{ padding: "12px 0", borderBottom: "1px solid #1a1a2e" }}>
              <div style={{ fontSize: 11, color: "#888", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>📝 ORDER NOTES (OPTIONAL)</div>
              <input className="modal-input" placeholder="e.g. light ice, extra sweet..." value={orderNote} onChange={e => setOrderNote(e.target.value)} />
            </div>
            {activeSpecial && cart.length >= 4 && <div className="special-applied">🎉 Buy 3 Get 1 FREE! <strong>{freeItemName}</strong> is FREE (−${discount.toFixed(2)})</div>}
            {activeSpecial && cart.length < 4 && <div className="special-hint">🎉 Add {4-cart.length} more to unlock Buy 3 Get 1 FREE!</div>}
            <div className="cart-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </>
        )}
      </div>
      <button className="btn-primary" onClick={() => setScreen("checkout")} disabled={!cart.length}>Proceed to Pay 🍋</button>
    </div>
  );

  return (
    <div className="customer-screen">
      {/* Persistent Order Banner */}
      {activeOrder && showBanner && (
        <div className="order-banner" onClick={() => setShowWaitingFullscreen(true)}>
          <div className="order-banner-left">
            <div className="order-banner-num">#{activeOrder.number}</div>
            <div className="order-banner-text">
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FFEE00" }}>Your order is being made!</div>
              <div style={{ fontSize: 10, color: "#888" }}>Tap to see full order number</div>
            </div>
          </div>
          <div className="order-banner-ping" />
        </div>
      )}
      <div className="c-hero">
        <div className="c-hero-orbs"><div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/></div>
        <div className="c-hero-content">
          <div className="c-logo">🍋</div>
          <h1 className="c-brand">Riverside<br/>Squeeze</h1>
          <p className="c-tagline">Buffalo Born · Park Fresh · Always Cold</p>
          <MusicPlayer songOfDay={songOfDay} />
          <div className={`status-badge ${isOpen?"open":"closed"}`}><span className="status-dot"/>{isOpen?"We're OPEN":"We're CLOSED"}</div>
        </div>
      </div>
      {songOfDay.title && (
        <div className="song-strip"><span>🎵 Song of the Day: <strong>{songOfDay.title}</strong> — {songOfDay.artist}</span>{songOfDay.vibe && <span className="song-vibe">{songOfDay.vibe}</span>}</div>
      )}
      <div className="location-strip"><span>📍 {currentLocation?.name || "Riverside Park"} · Buffalo NY</span><span className="mobile-tag">Mobile Stand</span></div>
      {specials.filter(s=>s.active).length > 0 && (
        <div className="specials-bar">{specials.filter(s=>s.active).map(s => <div key={s.id} className="special-pill">{s.emoji} {s.name}</div>)}</div>
      )}
      {profile && <div style={{padding:"12px 16px 0"}}><CustomerProfileCard profile={profile} menu={menu} onAddToCart={addToCart} /></div>}
      {profile && <div style={{padding:"8px 16px 0"}}><AIQuickOrder profile={profile} menu={menu} onAddToCart={addToCart} /></div>}

      {/* Reorder Button for returning customers */}
      {profile && profile.orderHistory?.length > 0 && (
        <div style={{ padding: "8px 16px 0" }}>
          <button className="reorder-btn" onClick={() => reorder(profile.orderHistory[profile.orderHistory.length - 1])}>
            🔄 Reorder Last: {profile.orderHistory[profile.orderHistory.length - 1]?.items?.map(i => i.emoji).join("")}
          </button>
        </div>
      )}

      <div className="menu-top">
        <h2 className="section-title">The Menu</h2>
        <button className="cart-pill" onClick={() => setScreen("cart")}>🛒 Order {cart.length > 0 && <span className="cart-count">{cart.length}</span>}</button>
      </div>
      <div className="menu-list">
        {menu.map((item, idx) => (
          <MenuCard key={item.id} item={item} idx={idx} onAddToCart={addToCart} />
        ))}
      </div>
      <div className="glitter-banner">✨ Add Edible Glitter — Rookie $0.50 · All Pro $1.00 · Hall of Fame $2.00</div>
      <div className="qr-banner">
        <div className="qr-text"><div className="qr-title">📱 Find Us on Google Play</div><div className="qr-sub">Search "Riverside Squeeze" or scan our stand QR code</div></div>
        <div className="qr-box">▦</div>
      </div>
      <div style={{padding:"12px 16px 4px"}}><button className="back-link" style={{fontSize:12,color:"#555"}} onClick={() => setScreen("login")}>🔄 Switch account</button></div>
      <div className="c-footer"><p>In memory of Popa 🙏</p><p>Made with love in Buffalo, NY</p></div>
    </div>
  );
}

// ─── OWNER VIEW ───────────────────────────────────────────────────────────────
function OwnerView({ orders, completeOrder, totalToday, totalOrders, locationStats, sales, isOpen, setIsOpen, currentLocation, setCurrentLocation, menu, setMenu, specials, setSpecials, songOfDay, setSongOfDay, onLock }) {
  const [tab, setTab] = useState("orders");
  const { weather, loading: weatherLoading, refetch } = useWeather();
  return (
    <div className="owner-screen">
      <div className="owner-top">
        <div><h2 className="owner-brand">🍋 Riverside Squeeze</h2><p className="owner-sub">Owner Dashboard</p></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button className={`open-toggle ${isOpen?"on":"off"}`} onClick={() => setIsOpen(!isOpen)}>{isOpen?"● OPEN":"○ CLOSED"}</button>
          <button className="lock-btn" onClick={onLock} title="Lock dashboard">🔒</button>
        </div>
      </div>
      <div style={{padding:"0 16px 8px"}}>
        <WeatherCard weather={weather} loading={weatherLoading} refetch={refetch} />
        <DailyGoalTracker totalToday={totalToday} />
      </div>
      <div className="loc-selector">
        <div className="loc-label">📍 I'm currently at:</div>
        <div className="loc-pills">
          {LOCATIONS.map(loc => (
            <button key={loc.id} className={`loc-pill ${currentLocation.id===loc.id?"active":""}`} style={{"--loc-color":loc.color}} onClick={() => setCurrentLocation(loc)}>{loc.emoji} {loc.name}</button>
          ))}
        </div>
      </div>
      <div className="owner-stats">
        <div className="stat-box"><span className="stat-val">${totalToday.toFixed(2)}</span><span className="stat-lbl">Today</span></div>
        <div className="stat-box"><span className="stat-val">{totalOrders}</span><span className="stat-lbl">Orders</span></div>
        <div className="stat-box"><span className="stat-val">{orders.length}</span><span className="stat-lbl">Pending</span></div>
      </div>
      <div className="owner-tabs">
        {["orders","menu","locations","customers","editor","advisor","banking"].map(t => (
          <button key={t} className={`owner-tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>
            {t==="orders"?"🧾":t==="menu"?"🍋":t==="locations"?"📍":t==="customers"?"👥":t==="editor"?"✏️":t==="advisor"?"🤖":"🏦"}
            <span style={{display:"block",fontSize:9,marginTop:2}}>{t==="orders"?"Orders":t==="menu"?"Menu":t==="locations"?"Spots":t==="customers"?"CRM":t==="editor"?"Edit":t==="advisor"?"AI":"Bank"}</span>
            {t==="orders" && orders.length>0 && <span className="tab-badge">{orders.length}</span>}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="orders-panel">
          {orders.length === 0 ? <div className="empty-panel"><div style={{fontSize:48}}>🍋</div><p>No pending orders</p><p className="empty-sub">Customers order from their phone</p></div>
          : orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-num">#{order.number}</div>
              <div className="order-info">
                <div className="order-customer-name">👤 {order.customerName}</div>
                {order.phone && <div style={{fontSize:11,color:"#555",marginBottom:2}}>📱 ···{String(order.phone).slice(-4)}</div>}
                {order.items?.map((item, i) => <div key={i} className="order-line">{item.emoji} {item.name}</div>)}
                {order.glitter && <div className="order-line">✨ Glitter — {GLITTER_TIERS.find(t=>t.id===order.glitter)?.label || order.glitter}</div>}
                {order.freeItem && <div className="order-line" style={{color:"#3DFF8F"}}>🎉 FREE: {order.freeItem.name}</div>}
                {order.bleacherSection && <div className="order-line" style={{color:"#3D9CFF"}}>📍 {order.bleacherSection}</div>}
                {order.note && <div className="order-line" style={{color:"#FFEE00"}}>📝 {order.note}</div>}
                <div className="order-price">${order.total?.toFixed(2)}</div>
              </div>
              <button className="done-btn" onClick={() => completeOrder(order.id, order.firebaseKey)}>DONE ✓</button>
            </div>
          ))}
          {/* Cash log quick add */}
          <div style={{marginTop:8,padding:"12px 0",borderTop:"1px solid #1a1a2e"}}>
            <div style={{fontSize:11,color:"#555",marginBottom:8,letterSpacing:1}}>💵 LOG CASH PAYMENT</div>
            <CashLogPanel />
          </div>
        </div>
      )}

      {tab === "menu" && (
        <div style={{padding:"12px 16px"}}>
          <div style={{fontSize:13,color:"#888",marginBottom:12}}>Toggle sold out to hide items from customers. Edit names, descriptions & prices in the ✏️ Edit tab.</div>
          {menu.map(item => (
            <div key={item.id} className="editor-row">
              <div className="editor-row-info">
                <span style={{fontSize:22,opacity:item.soldOut?0.4:1}}>{item.emoji}</span>
                <div>
                  <div className="editor-row-name" style={{opacity:item.soldOut?0.5:1}}>{item.name}</div>
                  <div className="editor-row-price">
                    {item.sizes?.[0] || "Kid"}: ${item.sizePrices?.[0]?.toFixed(2) ?? item.price.toFixed(2)} · {item.sizes?.[1] || "Regular"}: ${item.sizePrices?.[1]?.toFixed(2) ?? item.price.toFixed(2)}
                  </div>
                </div>
              </div>
              <button
                className={`soldout-toggle ${item.soldOut?"sold":""}`}
                onClick={() => setMenu(m => m.map(x => x.id === item.id ? {...x, soldOut: !x.soldOut} : x))}
              >
                {item.soldOut ? "🔴 Sold Out" : "🟢 Available"}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "locations" && (
        <div className="locations-panel">
          <p className="panel-hint">Based on your sales history — here's where the money is 💰</p>
          <LocationHeatmap locationStats={locationStats} />
          <div className="sessions-list">
            <h3 className="sessions-title">Recent Sessions</h3>
            {SAMPLE_LOCATION_DATA.slice(0,4).map((s,i) => {
              const loc = LOCATIONS.find(l => l.id === s.locationId);
              return (
                <div key={i} className="session-row">
                  <div className="session-emoji" style={{background:loc?.color+"33"}}>{loc?.emoji}</div>
                  <div className="session-info"><div className="session-name">{s.event}</div><div className="session-date">{s.date} · {s.weather}</div></div>
                  <div className="session-sales">${s.sales}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customers panel stays mounted always so its live Firebase listener never disconnects */}
      <div style={{padding:"12px 16px", display: tab === "customers" ? "block" : "none"}}><OwnerProfilesPanel menu={menu} /></div>
      {tab === "editor" && <div style={{padding:"12px 16px"}}><MenuEditor menu={menu} setMenu={setMenu} specials={specials} setSpecials={setSpecials} songOfDay={songOfDay} setSongOfDay={setSongOfDay} /></div>}
      {tab === "advisor" && <div className="advisor-panel"><AIAdvisor locationStats={locationStats} weather={weather} sales={sales} currentLocation={currentLocation} /></div>}
      {tab === "banking" && (
        <div>
          <BankingTab />
          <PushNotifPanel currentLocation={currentLocation} />
        </div>
      )}
    </div>
  );
}

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────
// Catches any unexpected crash so the app shows a recoverable screen instead of going blank
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("Riverside Squeeze crash:", error, info); }
  handleReload = () => { this.setState({ hasError: false, error: null }); window.location.reload(); };
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", background: "#06060f", color: "#fff",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: 24, fontFamily: "'Outfit', sans-serif", textAlign: "center"
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🍋</div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Oops, something glitched!</h2>
          <p style={{ fontSize: 14, color: "#888", marginBottom: 20, maxWidth: 320 }}>
            No worries — your order info is safe. Tap below to reload the app.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: "12px 28px", background: "linear-gradient(135deg, #FFEE00, #FF7A00)",
              border: "none", borderRadius: 999, color: "#1a1a1a", fontWeight: 700,
              fontSize: 15, cursor: "pointer", fontFamily: "'Outfit', sans-serif"
            }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}

function AppInner() {
  const [view, setView] = useState("customer");
  const [ownerUnlocked, setOwnerUnlocked] = useState(() => isSessionValid());
  const [showPinGate, setShowPinGate] = useState(false);
  const [isOpen, setIsOpenState] = useState(true);
  const [menu, setMenu] = useState(DEFAULT_MENU);
  const [specials, setSpecials] = useState(DEFAULT_SPECIALS);
  const [songOfDay, setSongOfDay] = useState({ title: "Started From the Bottom", artist: "Drake", vibe: "Buffalo vibes only 🏈" });
  const { orders, completed, sales, placeOrder, completeOrder, totalToday, totalOrders, locationStats, currentLocation, setCurrentLocation } = useOrders();

  // Sync isOpen status to Firebase so customers see it in real time
  useEffect(() => {
    let unsub = null;
    let unsubLoc = null;
    const listenForStatus = async () => {
      if (!db) {
        await new Promise(r => setTimeout(r, 2000));
      }
      if (!db) return;
      // Listen for open/closed
      const statusRef = firebaseRef(db, "status/isOpen");
      unsub = firebaseOnValue(statusRef, (snapshot) => {
        const val = snapshot.val();
        if (val !== null) setIsOpenState(val);
      });
      // Listen for location changes
      const locationRef = firebaseRef(db, "status/location");
      unsubLoc = firebaseOnValue(locationRef, (snapshot) => {
        const val = snapshot.val();
        if (val) setCurrentLocationState(val);
      });
    };
    listenForStatus();
    return () => { if (unsub) unsub(); if (unsubLoc) unsubLoc(); };
  }, []);

  const setIsOpen = (val) => {
    setIsOpenState(val);
    if (db && firebaseSet && firebaseRef) {
      firebaseSet(firebaseRef(db, "status/isOpen"), val);
    }
  };

  // Secret tap counter on nav owner button — 3 taps to open pin gate
  const ownerTapCount = useRef(0);
  const ownerTapTimer = useRef(null);
  const [show2FA, setShow2FA] = useState(false);

  const handleOwnerNavTap = () => {
    if (ownerUnlocked && view === "owner") return;
    if (ownerUnlocked) { setView("owner"); return; }
    ownerTapCount.current += 1;
    clearTimeout(ownerTapTimer.current);
    ownerTapTimer.current = setTimeout(() => { ownerTapCount.current = 0; }, 1500);
    if (ownerTapCount.current >= 3) {
      ownerTapCount.current = 0;
      setShowPinGate(true);
    }
  };

  const handlePinSuccess = () => {
    setShowPinGate(false);
    // If device is not trusted, require 2FA
    if (!isTrustedDevice() && getBackupCode()) {
      setShow2FA(true);
    } else {
      startSession();
      setOwnerUnlocked(true);
      setView("owner");
    }
  };

  const handle2FAVerified = () => {
    setShow2FA(false);
    startSession();
    setOwnerUnlocked(true);
    setView("owner");
  };

  const handleLock = () => {
    clearSession();
    setOwnerUnlocked(false);
    setView("customer");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060f; font-family: 'Outfit', sans-serif; }

        @keyframes fruitDrift0 { 0%{transform:translateY(0) rotate(0deg) scale(1)} 100%{transform:translateY(-45px) translateX(20px) rotate(25deg) scale(1.1)} }
        @keyframes fruitDrift1 { 0%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-30px) translateX(-25px) rotate(-15deg)} 100%{transform:translateY(-50px) translateX(15px) rotate(20deg)} }
        @keyframes fruitDrift2 { 0%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-20px) translateX(30px) rotate(10deg)} 66%{transform:translateY(-40px) translateX(-10px) rotate(-20deg)} 100%{transform:translateY(-55px) translateX(20px) rotate(30deg)} }

        .app-root { max-width: 430px; margin: 0 auto; min-height: 100vh; background: #06060f; color: #f0ede6; position: relative; overflow-x: hidden; z-index: 1; }

        /* ── PIN GATE ── */
        .pin-overlay { position: fixed; inset: 0; background: rgba(4,4,12,0.97); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 24px; backdrop-filter: blur(8px); }
        .pin-box { width: 100%; max-width: 340px; text-align: center; }
        .pin-logo { font-size: 52px; margin-bottom: 12px; animation: levitate 3s ease-in-out infinite; }
        .pin-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 2px; color: #FFEE00; margin-bottom: 6px; }
        .pin-sub { font-size: 13px; color: #666; margin-bottom: 28px; }
        .pin-dots { display: flex; justify-content: center; gap: 12px; margin-bottom: 10px; }
        .pin-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #2a2a40; background: transparent; transition: all 0.2s; }
        .pin-dot.filled { background: #FFEE00; border-color: #FFEE00; transform: scale(1.1); }
        .pin-error { font-size: 13px; color: #FF5252; margin-bottom: 16px; min-height: 20px; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }
        .shake { animation: shake 0.5s ease; }
        .pin-pad { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 20px; }
        .pin-key { height: 60px; border-radius: 14px; background: #0f0f1a; border: 1px solid #1a1a2e; color: #f0ede6; font-size: 24px; font-family: 'Outfit', sans-serif; font-weight: 500; cursor: pointer; transition: all 0.15s; }
        .pin-key:active { background: #1a1a2e; transform: scale(0.95); }
        .pin-key-empty { opacity: 0; pointer-events: none; }
        .pin-cancel { background: none; border: none; color: #555; font-size: 13px; cursor: pointer; font-family: 'Outfit', sans-serif; text-decoration: underline; }

        /* ── PHONE LOGIN ── */
        .name-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; text-align: center; gap: 16px; }
        .name-logo { font-size: 72px; animation: levitate 3s ease-in-out infinite; }
        .name-title { font-family: 'Bebas Neue', sans-serif; font-size: 42px; letter-spacing: 2px; background: linear-gradient(135deg, #FFEE00, #FF7A00, #B026FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; }
        .name-sub { font-size: 14px; color: #777; max-width: 280px; }
        .phone-input-wrap { position: relative; width: 100%; max-width: 320px; display: flex; align-items: center; }
        .phone-flag { position: absolute; left: 14px; font-size: 18px; }
        .name-input { width: 100%; max-width: 320px; padding: 14px 18px; background: #0f0f1a; border: 1.5px solid #2a2a3e; border-radius: 14px; color: #fff; font-size: 16px; font-family: 'Outfit', sans-serif; outline: none; text-align: center; }
        .phone-input { padding-left: 44px; text-align: left; }
        .name-input:focus { border-color: #FFEE00; }
        .phone-privacy { font-size: 11px; color: #444; }
        .back-link { background: none; border: none; color: #555; font-size: 13px; cursor: pointer; font-family: 'Outfit', sans-serif; text-decoration: underline; }
        .returning-card { background: linear-gradient(135deg, #0f0f1a, #1a1040); border: 1px solid rgba(255,225,53,0.2); border-radius: 20px; padding: 20px 24px; width: 100%; max-width: 320px; }
        .returning-avatar { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #FFEE00, #FF7A00); display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; color: #1a1a1a; margin: 0 auto 10px; }
        .returning-name { font-size: 16px; color: #ccc; margin-bottom: 14px; line-height: 1.5; }
        .returning-name strong { color: #FFEE00; font-size: 20px; }
        .returning-stats { display: flex; gap: 0; border-top: 1px solid #2a2a3e; padding-top: 12px; }
        .ret-stat { flex: 1; text-align: center; }
        .ret-val { display: block; font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #FFEE00; }
        .ret-lbl { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; }

        /* ── STRIPE CHECKOUT ── */
        .checkout-summary { background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 14px; padding: 14px 16px; margin-bottom: 4px; }
        .checkout-summary-title { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .checkout-line { display: flex; justify-content: space-between; font-size: 14px; color: #ccc; padding: 5px 0; border-bottom: 1px solid #1a1a2e; }
        .checkout-line:last-of-type { border-bottom: none; }
        .checkout-total-line { display: flex; justify-content: space-between; font-size: 20px; font-weight: 700; color: #FFEE00; padding-top: 10px; margin-top: 4px; border-top: 1px solid #2a2a3e; }
        .pay-btn.stripe-pay { background: linear-gradient(135deg, #635bff22, #8b5cf622); color: #a5b4fc; border: 1px solid rgba(99,91,255,0.4); }
        .stripe-secured-badge { font-size: 11px; background: rgba(99,91,255,0.2); color: #818cf8; padding: 4px 10px; border-radius: 999px; white-space: nowrap; }
        .trust-row { display: flex; gap: 8px; margin-top: 16px; justify-content: center; flex-wrap: wrap; }
        .trust-badge { display: flex; align-items: center; gap: 5px; background: #0f0f1a; border: 1px solid #1a1a2e; padding: 6px 10px; border-radius: 999px; font-size: 11px; color: #666; }
        .stripe-note { margin-top: 14px; font-size: 12px; color: #555; text-align: center; line-height: 1.6; padding: 10px 14px; background: rgba(99,91,255,0.05); border: 1px solid rgba(99,91,255,0.15); border-radius: 10px; }

        /* ── BANKING / SETUP ── */
        .setup-guide { background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 18px; padding: 18px; }
        .setup-guide-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; color: #FFEE00; margin-bottom: 16px; }
        .setup-steps { display: flex; flex-direction: column; gap: 14px; }
        .setup-step { display: flex; gap: 12px; align-items: flex-start; }
        .setup-step-num { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #FFEE00, #FF7A00); color: #1a1a1a; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; }
        .setup-step-body { flex: 1; }
        .setup-step-title { font-size: 14px; font-weight: 600; color: #f0ede6; margin-bottom: 3px; }
        .setup-step-desc { font-size: 12px; color: #777; line-height: 1.5; }
        .setup-step-link { display: inline-block; margin-top: 6px; font-size: 12px; color: #635bff; text-decoration: underline; }
        .stripe-link-display { background: rgba(74,222,128,0.07); border: 1px solid rgba(74,222,128,0.2); border-radius: 10px; padding: 12px 14px; }
        .stripe-link-label { font-size: 11px; color: #3DFF8F; font-weight: 700; margin-bottom: 4px; }
        .stripe-link-url { font-size: 12px; color: #888; word-break: break-all; margin-bottom: 8px; }
        .edit-link-btn { background: #1a1a2e; border: 1px solid #2a2a3e; color: #ccc; padding: 6px 14px; border-radius: 8px; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .save-toast { margin-top: 10px; padding: 8px 14px; background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25); border-radius: 8px; font-size: 13px; color: #3DFF8F; text-align: center; }
        .lock-btn { background: #1a1a2e; border: 1px solid #2a2a3e; color: #888; padding: 8px 12px; border-radius: 10px; font-size: 16px; cursor: pointer; }

        /* ── PROFILE CARD ── */
        .profile-card { background: linear-gradient(135deg, #0f0f1a, #150d20); border: 1px solid rgba(168,85,247,0.25); border-radius: 16px; overflow: hidden; }
        .profile-header { display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer; }
        .profile-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #B026FF, #6A0DDB); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: white; flex-shrink: 0; }
        .profile-info { flex: 1; }
        .profile-name { font-size: 15px; font-weight: 700; color: #f0ede6; }
        .profile-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
        .profile-tier { font-size: 11px; font-weight: 700; }
        .profile-dot { color: #333; font-size: 10px; }
        .profile-visits, .profile-spent { font-size: 11px; color: #666; }
        .profile-chevron { color: #555; font-size: 12px; }
        .profile-expanded { padding: 0 14px 14px; border-top: 1px solid rgba(255,255,255,0.05); }
        .profile-section { margin-top: 12px; }
        .profile-section-title { font-size: 11px; color: #B026FF; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        .fav-list { display: flex; flex-direction: column; gap: 6px; }
        .fav-row { display: flex; align-items: center; gap: 10px; background: #0a0a15; border-radius: 10px; padding: 8px 12px; }
        .fav-emoji { font-size: 22px; }
        .fav-info { flex: 1; }
        .fav-name { font-size: 13px; font-weight: 600; color: #f0ede6; }
        .fav-count { font-size: 11px; color: #555; }
        .fav-add-btn { background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); color: #d8b4fe; padding: 5px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .history-list { display: flex; flex-direction: column; gap: 4px; }
        .history-row { display: flex; align-items: center; gap: 10px; background: #0a0a15; border-radius: 10px; padding: 8px 12px; }
        .history-items { font-size: 20px; min-width: 32px; }
        .history-detail { flex: 1; }
        .history-names { font-size: 12px; color: #ccc; }
        .history-date { font-size: 10px; color: #555; margin-top: 2px; }
        .history-price { font-size: 13px; font-weight: 700; color: #FFEE00; }

        /* ── QUICK ORDER ── */
        .quick-order-card { background: linear-gradient(135deg, #0a1a0a, #0d2010); border: 1px solid rgba(74,222,128,0.25); border-radius: 14px; padding: 12px 14px; }
        .quick-order-label { font-size: 10px; color: #3DFF8F; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px; }
        .quick-loading { display: flex; justify-content: center; padding: 4px 0; }
        .quick-suggestion { display: flex; align-items: center; gap: 10px; }
        .quick-left { display: flex; align-items: center; gap: 10px; flex: 1; }
        .quick-emoji { font-size: 28px; }
        .quick-name { font-size: 14px; font-weight: 700; color: #f0ede6; }
        .quick-reason { font-size: 11px; color: #3DFF8F; margin-top: 2px; }
        .quick-add-btn { background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.3); color: #3DFF8F; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Outfit', sans-serif; }

        /* ── CUSTOMER ── */
        .customer-screen { padding-bottom: 90px; }
        .c-hero { position: relative; padding: 52px 24px 36px; text-align: center; overflow: hidden; }
        .c-hero-orbs { position: absolute; inset: 0; pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.35; }
        .orb1 { width: 200px; height: 200px; background: #FFEE00; top: -60px; left: -40px; animation: drift 8s ease-in-out infinite; }
        .orb2 { width: 160px; height: 160px; background: #B026FF; top: 20px; right: -30px; animation: drift 10s ease-in-out infinite reverse; }
        .orb3 { width: 120px; height: 120px; background: #1AE85C; bottom: -20px; left: 40%; animation: drift 7s ease-in-out infinite 2s; }
        @keyframes drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,20px)} }
        .c-hero-content { position: relative; z-index: 1; }
        .c-logo { font-size: 56px; display: block; margin-bottom: 10px; animation: levitate 3s ease-in-out infinite; }
        @keyframes levitate { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .c-brand { font-family: 'Bebas Neue', sans-serif; font-size: 52px; line-height: 0.95; letter-spacing: 3px; background: linear-gradient(135deg, #FFEE00 0%, #FF7A00 40%, #B026FF 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px; }
        .c-tagline { font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #777; margin-bottom: 16px; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 7px 18px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 1px; }
        .status-badge.open { background: rgba(26,232,92,0.15); color: #3DFF8F; border: 1.5px solid rgba(61,255,143,0.5); }
        .status-badge.closed { background: rgba(255,45,45,0.15); color: #FF5252; border: 1.5px solid rgba(255,82,82,0.5); }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .song-strip { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: linear-gradient(135deg, #0d0d1a, #1a0d2e); border-top: 1px solid rgba(168,85,247,0.2); border-bottom: 1px solid rgba(168,85,247,0.2); font-size: 12px; color: #d8b4fe; gap: 8px; flex-wrap: wrap; }
        .song-vibe { color: #888; font-size: 11px; }
        .location-strip { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background: #0d0d1a; border-top: 1px solid #1a1a2e; border-bottom: 1px solid #1a1a2e; font-size: 12px; color: #888; }
        .mobile-tag { color: #B026FF; font-weight: 600; }
        .specials-bar { display: flex; gap: 8px; padding: 10px 16px; overflow-x: auto; scrollbar-width: none; background: linear-gradient(135deg, rgba(255,225,53,0.05), rgba(255,149,0,0.05)); border-bottom: 1px solid rgba(255,225,53,0.1); }
        .specials-bar::-webkit-scrollbar { display: none; }
        .special-pill { flex-shrink: 0; padding: 6px 14px; background: rgba(255,238,0,0.12); border: 1.5px solid rgba(255,238,0,0.4); border-radius: 999px; font-size: 12px; color: #FFEE00; font-weight: 700; white-space: nowrap; }
        .menu-top { display: flex; justify-content: space-between; align-items: center; padding: 20px 16px 10px; }
        .section-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; color: #FFEE00; }
        .cart-pill { position: relative; background: linear-gradient(135deg, #FFEE00, #FF7A00); color: #1a1a1a; border: none; padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .cart-count { position: absolute; top: -5px; right: -5px; background: #FF2D2D; color: white; border-radius: 999px; width: 18px; height: 18px; font-size: 10px; display: flex; align-items: center; justify-content: center; }
        .menu-list { padding: 0 16px; display: flex; flex-direction: column; gap: 12px; }
        .menu-card { background: var(--grad); border-radius: 20px; display: flex; overflow: hidden; position: relative; animation: slideIn 0.4s ease both; cursor: pointer; transition: transform 0.15s; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        .menu-card:active { transform: scale(0.97); }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .card-tag { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.45); color: white; font-size: 9px; font-weight: 800; padding: 3px 8px; border-radius: 999px; letter-spacing: 1.5px; backdrop-filter: blur(2px); }
        .card-left { width: 75px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); flex-shrink: 0; }
        .card-emoji { font-size: 36px; }
        .card-body { padding: 14px 14px 14px 0; flex: 1; }
        .card-name { font-family: 'Bebas Neue', sans-serif; font-size: 21px; letter-spacing: 1px; color: white; margin-bottom: 4px; text-shadow: 0 1px 4px rgba(0,0,0,0.3); }
        .card-desc { font-size: 12px; color: rgba(255,255,255,0.85); margin-bottom: 8px; line-height: 1.4; }
        .card-bottom { display: flex; justify-content: space-between; align-items: center; }
        .card-price { font-size: 22px; font-weight: 700; color: white; }
        .add-btn { background: rgba(255,255,255,0.25); color: white; border: 2px solid rgba(255,255,255,0.5); padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'Outfit', sans-serif; backdrop-filter: blur(4px); }
        .tier-select-row { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
        .tier-select-btn { padding: 5px 10px; border-radius: 999px; border: 1.5px solid rgba(255,255,255,0.45); background: rgba(0,0,0,0.2); color: rgba(255,255,255,0.85); font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; white-space: nowrap; transition: all 0.15s; }
        .tier-select-btn.active { background: rgba(255,255,255,0.95); color: #1a1a1a; border-color: white; }
        .tier-select-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .glitter-banner { margin: 16px; padding: 12px 16px; background: linear-gradient(135deg, #1a0a2e, #2d1069); border: 1px solid rgba(168,85,247,0.3); border-radius: 14px; font-size: 13px; color: #d8b4fe; text-align: center; }
        .qr-banner { margin: 0 16px 16px; padding: 16px; background: linear-gradient(135deg, #0a1a2e, #0d2d4a); border: 1px solid rgba(59,130,246,0.3); border-radius: 14px; display: flex; align-items: center; gap: 14px; }
        .qr-text { flex: 1; }
        .qr-title { font-size: 13px; font-weight: 700; color: #3D9CFF; margin-bottom: 4px; }
        .qr-sub { font-size: 11px; color: #666; }
        .qr-box { font-size: 36px; color: #3D9CFF; }
        .c-footer { text-align: center; padding: 20px; color: #444; font-size: 12px; line-height: 2; }

        /* ── PUNCH CARD ── */
        .music-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.4); border-radius: 999px; color: #d8b4fe; font-size: 12px; font-weight: 600; text-decoration: none; letter-spacing: 1px; transition: all 0.2s; margin-bottom: 8px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .music-btn:active { background: rgba(168,85,247,0.3); }
        .music-btn-playing { background: rgba(248,113,113,0.15); border-color: rgba(248,113,113,0.4); color: #fca5a5; }
        .music-player-bar { background: linear-gradient(135deg, #1a0d2e, #0d0d1a); border: 1px solid rgba(168,85,247,0.3); border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; box-shadow: 0 0 20px rgba(168,85,247,0.15); }
        .music-player-info { display: flex; align-items: center; gap: 10px; flex: 1; }
        .music-song-title { font-size: 13px; font-weight: 700; color: #f0ede6; }
        .music-song-artist { font-size: 11px; color: #888; margin-top: 1px; }
        .music-open-btn { font-size: 11px; padding: 5px 10px; border-radius: 999px; text-decoration: none; white-space: nowrap; font-weight: 600; }
        .music-spotify { color: #1DB954; border: 1px solid rgba(29,185,84,0.3); background: rgba(29,185,84,0.08); }
        .music-youtube { color: #ff4444; border: 1px solid rgba(255,68,68,0.3); background: rgba(255,68,68,0.08); }
        .music-equalizer { display: flex; align-items: flex-end; gap: 2px; height: 20px; }
        .music-equalizer span { width: 3px; background: #B026FF; border-radius: 2px; animation: eq 0.8s ease-in-out infinite alternate; }
        .music-equalizer span:nth-child(1) { height: 8px; animation-delay: 0s; }
        .music-equalizer span:nth-child(2) { height: 14px; animation-delay: 0.2s; }
        .music-equalizer span:nth-child(3) { height: 10px; animation-delay: 0.4s; }
        .music-equalizer span:nth-child(4) { height: 16px; animation-delay: 0.1s; }
        @keyframes eq { 0%{transform:scaleY(0.4)} 100%{transform:scaleY(1)} }
        .punch-card { background: linear-gradient(135deg, #0f0f1a, #1a1040); border: 1px solid rgba(255,225,53,0.25); border-radius: 16px; padding: 14px 16px; margin-bottom: 4px; }
        .punch-small { padding: 10px 14px; }
        .punch-title { font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 1px; color: #FFEE00; margin-bottom: 10px; }
        .punch-row { display: flex; gap: 8px; justify-content: center; }
        .punch-dot { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #2a2a40; display: flex; align-items: center; justify-content: center; font-size: 18px; background: #0f0f1a; transition: all 0.3s; }
        .punch-dot.punched { background: rgba(255,225,53,0.15); border-color: #FFEE00; }
        .free-dot { border-color: rgba(168,85,247,0.4); }
        .free-dot.active { background: rgba(168,85,247,0.2); border-color: #B026FF; animation: blink 1.5s infinite; }
        .punch-sub { font-size: 12px; color: #888; text-align: center; margin-top: 10px; }
        .special-applied { background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25); border-radius: 10px; padding: 10px 14px; margin: 10px 0; font-size: 13px; color: #3DFF8F; }
        .special-hint { background: rgba(255,225,53,0.08); border: 1px solid rgba(255,225,53,0.2); border-radius: 10px; padding: 10px 14px; margin: 10px 0; font-size: 13px; color: #FFEE00; }

        /* ── PAY / CART ── */
        .pay-total { font-family: 'Bebas Neue', sans-serif; font-size: 32px; text-align: center; margin: 16px 0; color: #ccc; }
        .pay-total span { color: #FFEE00; }
        .pay-options { display: flex; flex-direction: column; gap: 10px; }
        .pay-btn { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 14px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; position: relative; transition: opacity 0.2s; }
        .pay-btn.cash { background: #1a1410; color: #FFEE00; border: 1px solid rgba(255,225,53,0.2); }
        .pay-confirm { text-align: center; padding: 16px; background: #0f0f1a; border-radius: 14px; border: 1px solid #1a1a2e; }
        .inner-screen { min-height: 100vh; padding-bottom: 90px; }
        .inner-header { display: flex; align-items: center; gap: 12px; padding: 20px 16px 10px; }
        .back-btn { background: none; border: none; color: #FFEE00; font-size: 14px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .inner-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; color: #FFEE00; }
        .cart-body { padding: 0 16px; }
        .cart-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #1a1a2e; font-size: 15px; }
        .cart-row-right { display: flex; align-items: center; gap: 10px; }
        .cart-price { color: #FFEE00; font-weight: 600; }
        .remove-btn { background: #1a1a2e; border: none; color: #FF5252; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 12px; }
        .glitter-toggle { display: flex; align-items: center; gap: 10px; padding: 14px 0; border-bottom: 1px solid #1a1a2e; cursor: pointer; font-size: 14px; }
        .glitter-toggle input { accent-color: #FFEE00; width: 18px; height: 18px; }
        .cart-total { display: flex; justify-content: space-between; padding: 16px 0; font-size: 22px; font-weight: 700; color: #FFEE00; }
        .empty-msg { color: #555; text-align: center; padding: 32px; }
        .btn-primary { display: block; width: calc(100% - 32px); margin: 20px auto 0; padding: 16px; border: none; border-radius: 14px; background: linear-gradient(135deg, #FFEE00, #FF7A00); color: #1a1a1a; font-size: 18px; font-weight: 700; font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 4px 20px rgba(255,225,53,0.3); }
        .btn-primary:disabled { opacity: 0.35; }

        /* ── WAITING / READY ── */
        .full-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; text-align: center; }
        .waiting-screen { background: radial-gradient(ellipse at center, #0d1a0d 0%, #06060f 70%); position: relative; overflow: hidden; flex-direction: column; }
        .waiting-glow { position: absolute; width: 300px; height: 300px; background: #FFEE00; border-radius: 50%; filter: blur(120px); opacity: 0.06; }
        .waiting-content { position: relative; z-index: 1; }
        .waiting-rings { position: absolute; top: 50%; left: 50%; }
        .waiting-rings div { position: absolute; border-radius: 50%; border: 2px solid #FFEE00; animation: ring 2.5s ease-out infinite; }
        .waiting-rings div:nth-child(1) { width: 180px; height: 180px; top: -90px; left: -90px; }
        .waiting-rings div:nth-child(2) { width: 240px; height: 240px; top: -120px; left: -120px; animation-delay: 0.6s; }
        .waiting-rings div:nth-child(3) { width: 300px; height: 300px; top: -150px; left: -150px; animation-delay: 1.2s; }
        @keyframes ring { 0%{transform:scale(0.3);opacity:0.8} 100%{transform:scale(1.2);opacity:0} }
        .order-num-big { font-family: 'Bebas Neue', sans-serif; font-size: 130px; line-height: 1; background: linear-gradient(135deg, #FFEE00, #FF7A00); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .waiting-name { font-size: 20px; color: #FFEE00; font-weight: 600; margin-bottom: 4px; }
        .waiting-label { font-size: 11px; letter-spacing: 3px; color: #555; margin-bottom: 16px; }
        .waiting-msg { font-size: 16px; color: #ccc; max-width: 260px; margin: 0 auto; }
        .ready-screen { background: radial-gradient(ellipse at center, #0a2010 0%, #06060f 70%); flex-direction: column; gap: 12px; }
        .ready-burst { font-size: 80px; animation: pop 0.5s cubic-bezier(0.36,0.07,0.19,0.97); }
        @keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
        .ready-title { font-family: 'Bebas Neue', sans-serif; font-size: 34px; letter-spacing: 2px; color: #3DFF8F; }
        .ready-num { font-family: 'Bebas Neue', sans-serif; font-size: 110px; color: #3DFF8F; line-height: 1; }
        .ready-sub { color: #888; font-size: 15px; margin-bottom: 12px; }

        /* ── OWNER ── */
        .owner-screen { min-height: 100vh; padding-bottom: 90px; background: #06060f; }
        .owner-top { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 16px 14px; background: linear-gradient(180deg, #0d0d1a 0%, transparent 100%); border-bottom: 1px solid #1a1a2e; }
        .owner-brand { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 2px; color: #FFEE00; }
        .owner-sub { font-size: 11px; color: #555; letter-spacing: 1px; }
        .open-toggle { padding: 9px 18px; border-radius: 999px; border: none; font-weight: 700; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; letter-spacing: 1px; }
        .open-toggle.on { background: rgba(74,222,128,0.15); color: #3DFF8F; border: 1px solid rgba(74,222,128,0.4); }
        .open-toggle.off { background: rgba(248,113,113,0.15); color: #FF5252; border: 1px solid rgba(248,113,113,0.4); }
        .weather-card { background: linear-gradient(135deg, #0d1a2e, #1a0d2e); border: 1px solid rgba(96,165,250,0.2); border-radius: 16px; padding: 14px 16px; margin-bottom: 4px; }
        .weather-card.loading { display: flex; align-items: center; gap: 12px; color: #555; font-size: 13px; }
        .weather-spinner { width: 20px; height: 20px; border: 2px solid #333; border-top-color: #3D9CFF; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .weather-main { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .weather-icon { font-size: 32px; }
        .weather-temp { font-family: 'Bebas Neue', sans-serif; font-size: 30px; color: #3D9CFF; }
        .weather-desc { font-size: 12px; color: #888; }
        .weather-refresh { margin-left: auto; background: none; border: none; color: #555; font-size: 18px; cursor: pointer; }
        .weather-details { display: flex; gap: 12px; font-size: 12px; color: #777; align-items: center; flex-wrap: wrap; }
        .weather-verdict { color: #FFEE00; font-weight: 600; margin-left: auto; }
        .weather-fallback { font-size: 11px; color: #555; margin-top: 8px; text-align: center; }
        .loc-selector { padding: 10px 16px 6px; }
        .loc-label { font-size: 11px; color: #555; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        .loc-pills { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .loc-pills::-webkit-scrollbar { display: none; }
        .loc-pill { flex-shrink: 0; padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.1); background: #0f0f1a; color: #888; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; white-space: nowrap; transition: all 0.2s; }
        .loc-pill.active { background: var(--loc-color); color: white; border-color: transparent; font-weight: 600; }
        .owner-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: #1a1a2e; border-top: 1px solid #1a1a2e; border-bottom: 1px solid #1a1a2e; }
        .stat-box { background: #06060f; padding: 16px 12px; text-align: center; }
        .stat-val { display: block; font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #FFEE00; }
        .stat-lbl { font-size: 10px; color: #555; letter-spacing: 1px; text-transform: uppercase; }
        .owner-tabs { display: flex; border-bottom: 1px solid #1a1a2e; }
        .owner-tab { flex: 1; padding: 10px 4px; background: none; border: none; color: #555; font-size: 16px; cursor: pointer; font-family: 'Outfit', sans-serif; border-bottom: 2px solid transparent; transition: all 0.2s; position: relative; }
        .owner-tab.active { color: #FFEE00; border-bottom-color: #FFEE00; }
        .tab-badge { position: absolute; top: 6px; right: 4px; background: #FF2D2D; color: white; border-radius: 999px; width: 16px; height: 16px; font-size: 9px; display: flex; align-items: center; justify-content: center; }
        .orders-panel { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
        .order-card { background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 14px; padding: 14px; display: flex; align-items: center; gap: 14px; }
        .order-num { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: #FFEE00; min-width: 52px; text-align: center; }
        .order-info { flex: 1; }
        .order-customer-name { font-size: 13px; color: #B026FF; font-weight: 600; margin-bottom: 4px; }
        .order-line { font-size: 13px; color: #bbb; margin-bottom: 2px; }
        .order-price { font-size: 16px; font-weight: 700; color: #FFEE00; margin-top: 6px; }
        .done-btn { background: linear-gradient(135deg, #1AE85C, #16a34a); color: white; border: none; padding: 10px 14px; border-radius: 10px; font-weight: 700; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .empty-panel { text-align: center; padding: 48px 20px; color: #444; }
        .empty-sub { font-size: 12px; color: #333; margin-top: 6px; }
        .locations-panel { padding: 12px 16px; }
        .panel-hint { font-size: 12px; color: #555; margin-bottom: 12px; }
        .heatmap { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .heatmap-row { display: flex; align-items: center; gap: 12px; background: #0f0f1a; border-radius: 12px; padding: 12px; border: 1px solid #1a1a2e; }
        .heatmap-row.hot { border-color: rgba(255,165,0,0.3); background: rgba(255,165,0,0.05); }
        .heatmap-row.warm { border-color: rgba(168,85,247,0.2); }
        .heatmap-rank { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #444; min-width: 24px; }
        .heatmap-info { flex: 1; }
        .heatmap-name { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
        .heatmap-bar-wrap { height: 6px; background: #1a1a2e; border-radius: 999px; overflow: hidden; margin-bottom: 4px; }
        .heatmap-bar { height: 100%; border-radius: 999px; transition: width 1s ease; }
        .heatmap-stats { font-size: 11px; color: #555; }
        .heatmap-badge { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .sessions-list { background: #0f0f1a; border-radius: 14px; overflow: hidden; border: 1px solid #1a1a2e; }
        .sessions-title { font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 1px; color: #FFEE00; padding: 12px 14px 8px; }
        .session-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-top: 1px solid #1a1a2e; }
        .session-emoji { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .session-info { flex: 1; }
        .session-name { font-size: 13px; font-weight: 500; }
        .session-date { font-size: 11px; color: #555; }
        .session-sales { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #1AE85C; }
        .advisor-panel { padding: 16px; }
        .ai-advisor { background: linear-gradient(135deg, #0d0d1a, #1a0d2e); border: 1px solid rgba(168,85,247,0.3); border-radius: 20px; padding: 20px; }
        .ai-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .ai-icon { font-size: 32px; }
        .ai-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; color: #d8b4fe; }
        .ai-sub { font-size: 11px; color: #666; }
        .ai-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(135deg, #B026FF, #6A0DDB); color: white; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .ai-loading { text-align: center; padding: 20px; }
        .ai-dots { display: flex; justify-content: center; gap: 6px; margin-bottom: 10px; }
        .ai-dots span { width: 8px; height: 8px; background: #B026FF; border-radius: 50%; animation: dot 1.2s ease-in-out infinite; }
        .ai-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ai-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        .ai-loading p { font-size: 13px; color: #666; }
        .ai-response p { font-size: 14px; color: #d8b4fe; line-height: 1.7; white-space: pre-wrap; }
        .ai-refresh { margin-top: 14px; background: none; border: 1px solid rgba(168,85,247,0.3); color: #B026FF; padding: 8px 16px; border-radius: 999px; font-size: 13px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .menu-editor { }
        .editor-tabs { display: flex; gap: 6px; margin-bottom: 14px; }
        .editor-tab { flex: 1; padding: 8px 6px; background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 10px; color: #666; font-size: 11px; cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 600; transition: all 0.2s; }
        .editor-tab.active { background: rgba(255,225,53,0.1); border-color: rgba(255,225,53,0.3); color: #FFEE00; }
        .add-new-btn { width: 100%; padding: 12px; background: rgba(74,222,128,0.1); border: 1px dashed rgba(74,222,128,0.3); border-radius: 12px; color: #3DFF8F; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; margin-bottom: 10px; }
        .editor-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 12px; margin-bottom: 8px; }
        .editor-row-info { display: flex; align-items: center; gap: 10px; }
        .editor-row-name { font-size: 14px; font-weight: 600; color: #f0ede6; }
        .editor-row-price { font-size: 12px; color: #888; margin-top: 2px; }
        .editor-row-actions { display: flex; gap: 8px; }
        .edit-btn, .del-btn { background: #1a1a2e; border: none; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 14px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-box { background: #0f0f1a; border: 1px solid #2a2a3e; border-radius: 20px; padding: 20px; width: 100%; max-width: 380px; max-height: 90vh; overflow-y: auto; }
        .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 1px; color: #FFEE00; margin-bottom: 14px; }
        .modal-field { margin-bottom: 10px; }
        .modal-label { display: block; font-size: 11px; color: #777; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .modal-input { width: 100%; padding: 10px 14px; background: #06060f; border: 1px solid #2a2a3e; border-radius: 10px; color: #fff; font-size: 14px; font-family: 'Outfit', sans-serif; outline: none; }
        .modal-input:focus { border-color: #FFEE00; }
        .modal-save { padding: 10px 20px; background: linear-gradient(135deg, #FFEE00, #FF7A00); border: none; border-radius: 10px; color: #1a1a1a; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .modal-cancel { padding: 10px 20px; background: #1a1a2e; border: 1px solid #2a2a3e; border-radius: 10px; color: #888; font-size: 14px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .song-editor { display: flex; flex-direction: column; gap: 10px; }
        .song-hint { font-size: 13px; color: #888; margin-bottom: 4px; line-height: 1.5; }
        .banking-card { background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 20px; padding: 20px; }
        .banking-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 1px; color: #FFEE00; margin-bottom: 16px; }
        .banking-section { margin-bottom: 16px; }
        .banking-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .banking-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #1a1a2e; font-size: 14px; color: #ccc; }
        .banking-note { font-size: 12px; color: #555; line-height: 1.6; padding: 12px; background: rgba(96,165,250,0.05); border: 1px solid rgba(96,165,250,0.1); border-radius: 10px; }
        .profiles-panel { }
        .profiles-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 12px; }
        .pstat { background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 12px; padding: 12px; text-align: center; }
        .pstat-val { display: block; font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: #FFEE00; }
        .pstat-lbl { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1px; }
        .owner-profile-list { display: flex; flex-direction: column; gap: 8px; }
        .owner-profile-row { background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 14px; padding: 12px; display: flex; align-items: flex-start; gap: 12px; }
        .opr-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #B026FF, #6A0DDB); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: white; flex-shrink: 0; }
        .opr-info { flex: 1; }
        .opr-name { font-size: 14px; font-weight: 700; color: #f0ede6; }
        .opr-tier { font-size: 11px; margin-left: 6px; }
        .opr-phone { font-size: 12px; color: #555; margin-top: 2px; }
        .opr-stats { font-size: 12px; color: #888; margin-top: 2px; }
        .opr-favs { font-size: 11px; color: #B026FF; margin-top: 3px; }

        /* ── NAV ── */
        .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: rgba(6,6,15,0.95); border-top: 1px solid #1a1a2e; display: flex; z-index: 100; backdrop-filter: blur(12px); }
        .nav-btn { flex: 1; padding: 14px 8px; background: none; border: none; color: #444; font-size: 11px; cursor: pointer; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: color 0.2s; position: relative; }
        .nav-btn.active { color: #FFEE00; }
        .nav-btn span:first-child { font-size: 22px; }
        .pending-badge { position: absolute; top: 8px; background: #FF2D2D; color: white; border-radius: 999px; padding: 2px 6px; font-size: 10px; font-weight: 700; }

        /* ── GLITTER TIERS ── */
        .glitter-tier-btn { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #0f0f1a; border: 1.5px solid #2a2a3e; border-radius: 12px; color: #ccc; font-size: 13px; font-family: 'Outfit', sans-serif; cursor: pointer; width: 100%; text-align: left; transition: all 0.2s; }
        .glitter-tier-btn.active { background: rgba(168,85,247,0.15); border-color: #B026FF; color: #d8b4fe; }
        .glitter-tier-desc { font-size: 11px; color: #666; flex: 1; }
        .glitter-tier-price { font-size: 12px; font-weight: 700; color: #FFEE00; margin-left: auto; }

        /* ── BLEACHER SELECTOR ── */
        .bleacher-btn { padding: 7px 12px; background: #0f0f1a; border: 1.5px solid #2a2a3e; border-radius: 10px; color: #888; font-size: 12px; font-family: 'Outfit', sans-serif; cursor: pointer; transition: all 0.2s; }
        .bleacher-btn.active { background: rgba(96,165,250,0.15); border-color: #3D9CFF; color: #3D9CFF; font-weight: 600; }

        /* ── ORDER BANNER ── */
        .order-banner { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: linear-gradient(135deg, #1a1000, #2a1a00); border-bottom: 2px solid rgba(255,225,53,0.4); cursor: pointer; position: sticky; top: 0; z-index: 50; }
        .order-banner-left { display: flex; align-items: center; gap: 12px; }
        .order-banner-num { font-family: 'Bebas Neue', sans-serif; font-size: 32px; color: #FFEE00; line-height: 1; }
        .order-banner-text { flex: 1; }
        .order-banner-ping { width: 10px; height: 10px; border-radius: 50%; background: #FFEE00; animation: blink 1.2s infinite; }

        /* ── SOLD OUT ── */
        .menu-card.sold-out { filter: grayscale(0.6); }
        .sold-out-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 3px; color: #FF5252; border-radius: 20px; z-index: 5; }

        /* ── REORDER BUTTON ── */
        .reorder-btn { width: 100%; padding: 12px 16px; background: linear-gradient(135deg, rgba(168,85,247,0.1), rgba(99,91,255,0.1)); border: 1px solid rgba(168,85,247,0.3); border-radius: 14px; color: #d8b4fe; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; text-align: left; }

        /* ── DAILY GOAL ── */
        .goal-tracker { background: linear-gradient(135deg, #0a1a0a, #0d200d); border: 1px solid rgba(74,222,128,0.2); border-radius: 14px; padding: 12px 14px; margin-bottom: 8px; }
        .goal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .goal-title { font-size: 12px; font-weight: 700; color: #3DFF8F; letter-spacing: 1px; }
        .goal-edit-btn { background: none; border: none; color: #3DFF8F; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .goal-input { width: 80px; padding: 4px 8px; background: #0f0f1a; border: 1px solid #2a2a3e; border-radius: 8px; color: #fff; font-size: 13px; font-family: 'Outfit', sans-serif; outline: none; }
        .goal-bar-wrap { height: 8px; background: #1a1a2e; border-radius: 999px; overflow: hidden; margin-bottom: 6px; }
        .goal-bar { height: 100%; border-radius: 999px; transition: width 0.8s ease; }
        .goal-stats { display: flex; gap: 8px; font-size: 12px; font-weight: 600; }

        /* ── CASH LOG ── */
        .cash-log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .cash-log-title { font-family: 'Bebas Neue', sans-serif; font-size: 18px; color: #FFEE00; letter-spacing: 1px; }
        .cash-log-total { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #3DFF8F; }
        .cash-log-row { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #1a1a2e; }
        .cash-log-note { flex: 1; font-size: 13px; color: #ccc; }
        .cash-log-time { font-size: 10px; color: #555; }
        .cash-log-amount { font-size: 14px; font-weight: 700; color: #3DFF8F; }

        /* ── SOLD OUT TOGGLE ── */
        .soldout-toggle { padding: 8px 12px; border-radius: 10px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; background: rgba(74,222,128,0.1); color: #3DFF8F; border: 1px solid rgba(74,222,128,0.3); }
        .soldout-toggle.sold { background: rgba(248,113,113,0.1); color: #FF5252; border-color: rgba(248,113,113,0.3); }

        /* ── MUSIC SEARCH ── */
        .music-search-box { background: linear-gradient(135deg, #0d0d1a, #1a0d2e); border: 1px solid rgba(168,85,247,0.3); border-radius: 14px; padding: 12px; }
        .music-search-input { flex: 1; padding: 10px 14px; background: #06060f; border: 1px solid #2a2a3e; border-radius: 10px; color: #fff; font-size: 14px; font-family: 'Outfit', sans-serif; outline: none; }
        .music-search-input:focus { border-color: #B026FF; }
        .music-search-go { padding: 10px 16px; background: linear-gradient(135deg, #B026FF, #6A0DDB); border: none; border-radius: 10px; color: white; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .music-results { display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px; }
        .music-result-row { display: flex; align-items: center; gap: 10px; background: #06060f; border-radius: 10px; padding: 8px 10px; }
        .music-result-info { flex: 1; }
        .music-result-title { font-size: 13px; font-weight: 600; color: #f0ede6; }
        .music-result-artist { font-size: 11px; color: #666; }

      `}</style>

      <FruitBackground />

      {showPinGate && (
        <PinGate onSuccess={handlePinSuccess} onCancel={() => setShowPinGate(false)} />
      )}

      {show2FA && (
        <TwoFactorSetup onVerified={handle2FAVerified} onCancel={() => setShow2FA(false)} />
      )}

      <div className="app-root">
        {view === "customer"
          ? <CustomerView placeOrder={placeOrder} completed={completed} isOpen={isOpen} menu={menu} specials={specials} songOfDay={songOfDay} currentLocation={currentLocation} />
          : ownerUnlocked
            ? <OwnerView
                orders={orders} completeOrder={completeOrder}
                totalToday={totalToday} totalOrders={totalOrders}
                locationStats={locationStats} sales={sales}
                isOpen={isOpen} setIsOpen={setIsOpen}
                currentLocation={currentLocation} setCurrentLocation={setCurrentLocation}
                menu={menu} setMenu={setMenu}
                specials={specials} setSpecials={setSpecials}
                songOfDay={songOfDay} setSongOfDay={setSongOfDay}
                onLock={handleLock}
              />
            : <CustomerView placeOrder={placeOrder} completed={completed} isOpen={isOpen} menu={menu} specials={specials} songOfDay={songOfDay} currentLocation={currentLocation} />
        }

        <nav className="bottom-nav">
          <button className={`nav-btn ${view==="customer"?"active":""}`} onClick={() => setView("customer")}>
            <span>🍋</span><span>Menu</span>
          </button>
          {/* Owner tab — invisible to customers, only shows when unlocked or after 3 taps */}
          <button
            className={`nav-btn ${view==="owner" && ownerUnlocked?"active":""}`}
            onClick={handleOwnerNavTap}
            style={{ position: "relative", opacity: ownerUnlocked ? 1 : 0, minWidth: 60 }}
            aria-hidden={!ownerUnlocked}
          >
            <span style={{visibility: ownerUnlocked ? "visible" : "hidden"}}>📊</span>
            <span style={{visibility: ownerUnlocked ? "visible" : "hidden"}}>Owner</span>
            {ownerUnlocked && orders.length > 0 && <span className="pending-badge">{orders.length}</span>}
          </button>
        </nav>
      </div>
    </>
  );
}
