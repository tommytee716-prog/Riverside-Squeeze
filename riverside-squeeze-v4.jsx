import { useState, useEffect, useRef, useCallback } from "react";

// ─── FRUIT BACKGROUND ────────────────────────────────────────────────────────
const FRUIT_EMOJIS = ["🍋","🫐","🍍","🍏","🍋","🍊","🫐","🍍","🍏","🍋","🍋‍🟩","🍊","🍓","🍒","🍋","🫐","🍍","🍏","🍊","🍓"];
function FruitBackground() {
  const fruits = useRef(
    Array.from({ length: 42 }, (_, i) => ({
      id: i,
      emoji: FRUIT_EMOJIS[i % FRUIT_EMOJIS.length],
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 24 + Math.random() * 36,
      opacity: 0.18 + Math.random() * 0.22,
      rotate: Math.random() * 360,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 6,
      xDrift: (Math.random() - 0.5) * 40,
      yDrift: (Math.random() - 0.5) * 50,
    }))
  ).current;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {fruits.map(f => (
        <div key={f.id} style={{
          position: "absolute",
          left: `${f.left}%`, top: `${f.top}%`,
          fontSize: f.size, opacity: f.opacity,
          transform: `rotate(${f.rotate}deg)`,
          animation: `fruitDrift${f.id % 3} ${f.duration}s ease-in-out infinite ${f.delay}s alternate`,
          userSelect: "none",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
        }}>{f.emoji}</div>
      ))}
    </div>
  );
}

// ─── DEFAULT MENU ─────────────────────────────────────────────────────────────
const DEFAULT_MENU = [
  { id: 1, name: "Classic Lemonade", price: 5.0, emoji: "🍋", desc: "Fresh squeezed, ice cold, pure perfection.", gradient: "linear-gradient(135deg, #FFE135 0%, #FF9500 100%)", tag: null, sizes: ["12oz","16oz","24oz"], sizePrices: [5.0, 6.5, 8.0] },
  { id: 2, name: "Dragon Fruit Lemonade", price: 7.0, emoji: "🐉", desc: "Dragon fruit syrup with fresh pieces on top. Bold & beautiful.", gradient: "linear-gradient(135deg, #FF6B9D 0%, #C44F8A 100%)", tag: "FAN FAV", sizes: ["12oz","16oz","24oz"], sizePrices: [7.0, 8.5, 10.0] },
  { id: 3, name: "Do You Billieve?", price: 7.0, emoji: "🏈", desc: "Mystery flavor every week. Have faith. Just trust it. #BillsMafia", gradient: "linear-gradient(135deg, #00338D 0%, #4F7FD4 100%)", tag: "MYSTERY", sizes: ["12oz","16oz","24oz"], sizePrices: [7.0, 8.5, 10.0] },
  { id: 4, name: "Prickly Pear Lemonade", price: 7.0, emoji: "🌵", desc: "Sweet, stunning, naturally pink. Gram-worthy every single pour.", gradient: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", tag: "NEW", sizes: ["12oz","16oz","24oz"], sizePrices: [7.0, 8.5, 10.0] },
];

const DEFAULT_SPECIALS = [
  { id: 1, name: "Buy 3 Get 1 FREE", desc: "Add any 4 drinks — cheapest one is FREE automatically!", emoji: "🎉", active: true },
];

const LOCATIONS = [
  { id: "football", name: "Football Field", emoji: "🏈", color: "#00338D" },
  { id: "baseball", name: "Baseball Diamond", emoji: "⚾", color: "#22c55e" },
  { id: "basketball", name: "Basketball Courts", emoji: "🏀", color: "#FF9500" },
  { id: "entrance", name: "Park Entrance", emoji: "🌳", color: "#A855F7" },
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

// ─── AI HOOK ─────────────────────────────────────────────────────────────────
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

// ─── PUNCH CARD HOOK ──────────────────────────────────────────────────────────
function usePunchCard(customerId) {
  const key = `punchcard_${customerId}`;
  const [punches, setPunches] = useState(() => {
    try { return parseInt(localStorage.getItem(key) || "0"); } catch { return 0; }
  });
  const addPunch = (count = 1) => {
    setPunches(p => {
      const newVal = (p + count) % 6;
      try { localStorage.setItem(key, String(newVal)); } catch {}
      return newVal;
    });
  };
  const isFree = punches === 5;
  return { punches, addPunch, isFree };
}

// ─── ORDER SYSTEM ─────────────────────────────────────────────────────────────
function useOrders() {
  const [orders, setOrders] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [sales, setSales] = useState(SAMPLE_LOCATION_DATA.map(d => ({ ...d, isSample: true })));
  const [currentLocation, setCurrentLocation] = useState(LOCATIONS[0]);

  const placeOrder = (items, glitter, customerName) => {
    const num = Math.floor(Math.random() * 89) + 10;
    // Buy 3 get 1 free: find cheapest item if 4+ items
    let discount = 0;
    let freeItem = null;
    if (items.length >= 4) {
      const sorted = [...items].sort((a, b) => a.price - b.price);
      freeItem = sorted[0];
      discount = freeItem.price;
    }
    const subtotal = items.reduce((s, i) => s + i.price, 0) + (glitter ? 0.25 : 0);
    const total = Math.max(0, subtotal - discount);
    const order = { id: Date.now(), number: num, items, glitter, total, discount, freeItem, status: "pending", time: new Date(), location: currentLocation, customerName: customerName || "Guest" };
    setOrders(p => [...p, order]);
    return order;
  };

  const completeOrder = (id) => {
    setOrders(p => {
      const o = p.find(x => x.id === id);
      if (o) {
        setSales(s => [...s, { locationId: currentLocation.id, date: new Date().toDateString(), event: currentLocation.name, sales: o.total, orders: 1, weather: "Live", isSample: false, orderId: o.id }]);
        setCompleted(c => [...c, { ...o, status: "ready" }]);
      }
      return p.filter(x => x.id !== id);
    });
  };

  const totalToday = sales.filter(s => !s.isSample).reduce((acc, s) => acc + s.sales, 0);
  const totalOrders = sales.filter(s => !s.isSample).reduce((acc, s) => acc + s.orders, 0);
  const locationStats = LOCATIONS.map(loc => {
    const locSales = sales.filter(s => s.locationId === loc.id);
    return { ...loc, totalSales: locSales.reduce((a, s) => a + s.sales, 0), totalOrders: locSales.reduce((a, s) => a + s.orders, 0), sessions: locSales.length, best: locSales.sort((a, b) => b.sales - a.sales)[0] };
  }).sort((a, b) => b.totalSales - a.totalSales);

  return { orders, completed, sales, placeOrder, completeOrder, totalToday, totalOrders, locationStats, currentLocation, setCurrentLocation };
}

// ─── PUNCH CARD DISPLAY ───────────────────────────────────────────────────────
function PunchCardDisplay({ punches, small }) {
  return (
    <div className={`punch-card ${small ? "punch-small" : ""}`}>
      {!small && <div className="punch-title">☕ Loyalty Punch Card</div>}
      <div className="punch-row">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`punch-dot ${i < punches ? "punched" : ""}`}>
            {i < punches ? "🍋" : "○"}
          </div>
        ))}
        <div className={`punch-dot free-dot ${punches >= 5 ? "active" : ""}`}>🎁</div>
      </div>
      {!small && (
        <p className="punch-sub">
          {punches >= 5
            ? "🎉 FREE drink ready! Show this at the stand!"
            : `${5 - punches} more drink${5 - punches !== 1 ? "s" : ""} until your FREE one!`}
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

// ─── MENU EDITOR (OWNER ONLY) ─────────────────────────────────────────────────
function MenuEditor({ menu, setMenu, specials, setSpecials, songOfDay, setSongOfDay }) {
  const [editItem, setEditItem] = useState(null);
  const [editSpecial, setEditSpecial] = useState(null);
  const [form, setForm] = useState({});
  const [specialForm, setSpecialForm] = useState({});
  const [tab, setTab] = useState("menu");

  const openEdit = (item) => { setEditItem(item); setForm({ ...item, sizePrices: item.sizePrices?.join(",") || "5,6.5,8" }); };
  const openAdd = () => { setEditItem("new"); setForm({ name: "", price: "", emoji: "🍋", desc: "", tag: "", gradient: "linear-gradient(135deg, #FFE135 0%, #FF9500 100%)", sizePrices: "5,6.5,8" }); };
  const saveItem = () => {
    const item = { ...form, id: editItem === "new" ? Date.now() : form.id, price: parseFloat(form.price) || 0, sizePrices: form.sizePrices.split(",").map(Number), sizes: ["12oz","16oz","24oz"] };
    if (editItem === "new") setMenu(m => [...m, item]);
    else setMenu(m => m.map(x => x.id === item.id ? item : x));
    setEditItem(null);
  };
  const deleteItem = (id) => setMenu(m => m.filter(x => x.id !== id));

  const openSpecialEdit = (s) => { setEditSpecial(s); setSpecialForm({ ...s }); };
  const openSpecialAdd = () => { setEditSpecial("new"); setSpecialForm({ name: "", desc: "", emoji: "🎉", active: true }); };
  const saveSpecial = () => {
    const s = { ...specialForm, id: editSpecial === "new" ? Date.now() : specialForm.id };
    if (editSpecial === "new") setSpecials(arr => [...arr, s]);
    else setSpecials(arr => arr.map(x => x.id === s.id ? s : x));
    setEditSpecial(null);
  };
  const deleteSpecial = (id) => setSpecials(arr => arr.filter(x => x.id !== id));

  return (
    <div className="menu-editor">
      <div className="editor-tabs">
        {["menu","specials","song"].map(t => (
          <button key={t} className={`editor-tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>
            {t==="menu"?"🍋 Menu":t==="specials"?"🎉 Specials":"🎵 Song of Day"}
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
                  <div className="editor-row-price">${item.price.toFixed(2)} (12oz)</div>
                </div>
              </div>
              <div className="editor-row-actions">
                <button className="edit-btn" onClick={() => openEdit(item)}>✏️</button>
                <button className="del-btn" onClick={() => deleteItem(item.id)}>🗑️</button>
              </div>
            </div>
          ))}
          {editItem && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3 className="modal-title">{editItem==="new"?"Add Drink":"Edit Drink"}</h3>
                {[["name","Name"],["emoji","Emoji"],["price","Base Price (12oz)"],["desc","Description"],["tag","Tag (optional)"],["sizePrices","Size Prices (12oz,16oz,24oz)"]].map(([k,label]) => (
                  <div key={k} className="modal-field">
                    <label className="modal-label">{label}</label>
                    <input className="modal-input" value={form[k]||""} onChange={e => setForm(f => ({...f,[k]:e.target.value}))} />
                  </div>
                ))}
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
              <div className="editor-row-info">
                <span style={{fontSize:22}}>{s.emoji}</span>
                <div>
                  <div className="editor-row-name">{s.name}</div>
                  <div className="editor-row-price" style={{color:s.active?"#4ade80":"#f87171"}}>{s.active?"● Active":"○ Inactive"}</div>
                </div>
              </div>
              <div className="editor-row-actions">
                <button className="edit-btn" onClick={() => openSpecialEdit(s)}>✏️</button>
                <button className="del-btn" onClick={() => deleteSpecial(s.id)}>🗑️</button>
              </div>
            </div>
          ))}
          {editSpecial && (
            <div className="modal-overlay">
              <div className="modal-box">
                <h3 className="modal-title">{editSpecial==="new"?"Add Special":"Edit Special"}</h3>
                {[["name","Name"],["emoji","Emoji"],["desc","Description"]].map(([k,label]) => (
                  <div key={k} className="modal-field">
                    <label className="modal-label">{label}</label>
                    <input className="modal-input" value={specialForm[k]||""} onChange={e => setSpecialForm(f => ({...f,[k]:e.target.value}))} />
                  </div>
                ))}
                <label className="glitter-toggle" style={{marginTop:8}}>
                  <input type="checkbox" checked={!!specialForm.active} onChange={e => setSpecialForm(f => ({...f,active:e.target.checked}))} />
                  <span style={{marginLeft:8,fontSize:14}}>Active (show to customers)</span>
                </label>
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <button className="modal-save" onClick={saveSpecial}>Save</button>
                  <button className="modal-cancel" onClick={() => setEditSpecial(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "song" && (
        <div className="song-editor">
          <p className="song-hint">Set the Song of the Day — customers will see this on the menu!</p>
          <div className="modal-field">
            <label className="modal-label">🎵 Song Title</label>
            <input className="modal-input" value={songOfDay.title} onChange={e => setSongOfDay(s => ({...s,title:e.target.value}))} placeholder="e.g. Started From the Bottom" />
          </div>
          <div className="modal-field">
            <label className="modal-label">🎤 Artist</label>
            <input className="modal-input" value={songOfDay.artist} onChange={e => setSongOfDay(s => ({...s,artist:e.target.value}))} placeholder="e.g. Drake" />
          </div>
          <div className="modal-field">
            <label className="modal-label">😎 Vibe Note (optional)</label>
            <input className="modal-input" value={songOfDay.vibe} onChange={e => setSongOfDay(s => ({...s,vibe:e.target.value}))} placeholder="e.g. It's a banger today" />
          </div>
          <div style={{marginTop:8,padding:"10px 14px",background:"rgba(255,225,53,0.08)",borderRadius:12,border:"1px solid rgba(255,225,53,0.2)"}}>
            <div style={{fontSize:13,color:"#FFE135",fontWeight:600}}>Preview:</div>
            <div style={{fontSize:14,color:"#ccc",marginTop:4}}>🎵 {songOfDay.title || "Song Title"} — {songOfDay.artist || "Artist"}</div>
            {songOfDay.vibe && <div style={{fontSize:12,color:"#888",marginTop:2}}>{songOfDay.vibe}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CUSTOMER VIEW ────────────────────────────────────────────────────────────
function CustomerView({ placeOrder, completed, isOpen, menu, specials, songOfDay }) {
  const [screen, setScreen] = useState("menu");
  const [cart, setCart] = useState([]);
  const [glitter, setGlitter] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [nameEntered, setNameEntered] = useState(false);
  const [showPunchCard, setShowPunchCard] = useState(false);
  const [payMethod, setPayMethod] = useState(null);
  const prevCompleted = useRef([]);
  const customerId = useRef("cust_" + Math.random().toString(36).slice(2));
  const { punches, addPunch } = usePunchCard(customerId.current);

  useEffect(() => {
    if (!activeOrder) return;
    const found = completed.find(o => o.id === activeOrder.id);
    if (found && !prevCompleted.current.find(o => o.id === found.id)) {
      if (navigator.vibrate) navigator.vibrate([400,100,400,100,800]);
      addPunch(activeOrder.items.length);
      setScreen("ready");
    }
    prevCompleted.current = completed;
  }, [completed, activeOrder]);

  const cartWithPrices = cart.map(item => ({ ...item, chosenSize: "12oz" }));
  let subtotal = cartWithPrices.reduce((s, i) => s + i.price, 0) + (glitter ? 0.25 : 0);
  let discount = 0;
  let freeItemName = null;
  const activeSpecial = specials.find(s => s.active && s.name.toLowerCase().includes("buy 3"));
  if (activeSpecial && cartWithPrices.length >= 4) {
    const sorted = [...cartWithPrices].sort((a, b) => a.price - b.price);
    freeItemName = sorted[0].name;
    discount = sorted[0].price;
  }
  const total = Math.max(0, subtotal - discount);

  const handleOrder = () => {
    if (!cart.length || !nameEntered) return;
    const order = placeOrder(cartWithPrices, glitter, customerName);
    setActiveOrder(order);
    setScreen("waiting");
  };

  if (!nameEntered && screen === "menu") return (
    <div className="name-screen">
      <div className="name-logo">🍋</div>
      <h2 className="name-title">Welcome to<br/>Riverside Squeeze</h2>
      <p className="name-sub">Enter your name so we can call your order!</p>
      <input className="name-input" placeholder="Your name..." value={customerName} onChange={e => setCustomerName(e.target.value)} maxLength={30} />
      <button className="btn-primary" onClick={() => { if (customerName.trim()) setNameEntered(true); }} disabled={!customerName.trim()}>
        Let's Go 🍋
      </button>
    </div>
  );

  if (screen === "waiting") return (
    <div className="full-screen waiting-screen">
      <div className="waiting-glow" />
      <div className="waiting-content">
        <div className="waiting-rings"><div /><div /><div /></div>
        <div className="order-num-big">{activeOrder?.number}</div>
        <p className="waiting-name">Hey {activeOrder?.customerName}!</p>
        <p className="waiting-label">YOUR ORDER NUMBER</p>
        <p className="waiting-msg">Go enjoy the game — we'll buzz you when it's ready! 🍋</p>
        <div style={{marginTop:24}}><PunchCardDisplay punches={punches} small /></div>
      </div>
    </div>
  );

  if (screen === "ready") return (
    <div className="full-screen ready-screen">
      <div className="ready-burst">🍋</div>
      <h2 className="ready-title">YOUR SQUEEZE IS READY!</h2>
      <p style={{color:"#aaa",fontSize:16,marginBottom:4}}>{activeOrder?.customerName}</p>
      <div className="ready-num">{activeOrder?.number}</div>
      <p className="ready-sub">Show this number at the stand!</p>
      <div style={{margin:"16px 0"}}><PunchCardDisplay punches={punches} /></div>
      <button className="btn-primary" onClick={() => { setScreen("menu"); setCart([]); setGlitter(false); setActiveOrder(null); }}>Order Again 🍋</button>
    </div>
  );

  if (screen === "pay") return (
    <div className="inner-screen">
      <div className="inner-header">
        <button className="back-btn" onClick={() => setScreen("cart")}>← Back</button>
        <h2 className="inner-title">Pay</h2>
      </div>
      <div style={{padding:"0 16px"}}>
        <div className="pay-total">Total: <span>${total.toFixed(2)}</span></div>
        <p style={{color:"#888",fontSize:13,marginBottom:16,textAlign:"center"}}>Choose your payment method</p>
        <div className="pay-options">
          <button className="pay-btn apple" onClick={() => setPayMethod("apple")}>
            <span>🍎</span> Apple Pay
            <span className="pay-badge">Wallet</span>
          </button>
          <button className="pay-btn google" onClick={() => setPayMethod("google")}>
            <span>🔵</span> Google Pay
            <span className="pay-badge">Wallet</span>
          </button>
          <button className="pay-btn card" onClick={() => setPayMethod("card")}>
            <span>💳</span> Credit / Debit Card
          </button>
          <button className="pay-btn cash" onClick={() => setPayMethod("cash")}>
            <span>💵</span> Pay at Stand (Cash/Card)
          </button>
        </div>
        {payMethod && (
          <div className="pay-confirm">
            <div style={{fontSize:32,marginBottom:8}}>
              {payMethod==="apple"?"🍎":payMethod==="google"?"🔵":payMethod==="card"?"💳":"💵"}
            </div>
            <p style={{color:"#ccc",fontSize:14,marginBottom:4}}>
              {payMethod==="cash" ? "You'll pay at the stand when your order is ready." : `${payMethod==="apple"?"Apple Pay":payMethod==="google"?"Google Pay":"Card"} — tap below to confirm your order.`}
            </p>
            <button className="btn-primary" onClick={handleOrder} style={{marginTop:8}}>
              Confirm Order 🍋
            </button>
          </div>
        )}
        <div className="secure-badge">
          <span>🔒</span>
          <span>Your payment is secure & encrypted</span>
        </div>
      </div>
    </div>
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
            {cartWithPrices.map((item, i) => (
              <div key={i} className="cart-row">
                <span>{item.emoji} {item.name}</span>
                <div className="cart-row-right">
                  <span className="cart-price">${item.price.toFixed(2)}</span>
                  <button className="remove-btn" onClick={() => setCart(c => { const copy=[...c]; copy.splice(i,1); return copy; })}>✕</button>
                </div>
              </div>
            ))}
            <label className="glitter-toggle">
              <input type="checkbox" checked={glitter} onChange={e => setGlitter(e.target.checked)} />
              <span className="glitter-custom" />
              <span>✨ Edible Glitter +$0.25</span>
            </label>
            {activeSpecial && cart.length >= 4 && (
              <div className="special-applied">
                🎉 Buy 3 Get 1 FREE applied! <strong>{freeItemName}</strong> is FREE (−${discount.toFixed(2)})
              </div>
            )}
            {activeSpecial && cart.length < 4 && (
              <div className="special-hint">
                🎉 Add {4 - cart.length} more drink{4-cart.length!==1?"s":""} to unlock Buy 3 Get 1 FREE!
              </div>
            )}
            <div className="cart-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </>
        )}
      </div>
      <button className="btn-primary" onClick={() => setScreen("pay")} disabled={!cart.length}>
        Proceed to Pay 🍋
      </button>
    </div>
  );

  return (
    <div className="customer-screen">
      <div className="c-hero">
        <div className="c-hero-orbs"><div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/></div>
        <div className="c-hero-content">
          <div className="c-logo">🍋</div>
          <h1 className="c-brand">Riverside<br/>Squeeze</h1>
          <p className="c-tagline">Buffalo Born · Park Fresh · Always Cold</p>
          <div className={`status-badge ${isOpen?"open":"closed"}`}>
            <span className="status-dot"/>{isOpen?"We're OPEN":"We're CLOSED"}
          </div>
        </div>
      </div>

      {songOfDay.title && (
        <div className="song-strip">
          <span>🎵 Song of the Day: <strong>{songOfDay.title}</strong> — {songOfDay.artist}</span>
          {songOfDay.vibe && <span className="song-vibe">{songOfDay.vibe}</span>}
        </div>
      )}

      <div className="location-strip">
        <span>📍 Riverside Park, Buffalo NY</span>
        <span className="mobile-tag">Mobile Stand</span>
      </div>

      {specials.filter(s => s.active).length > 0 && (
        <div className="specials-bar">
          {specials.filter(s => s.active).map(s => (
            <div key={s.id} className="special-pill">{s.emoji} {s.name}</div>
          ))}
        </div>
      )}

      <div className="menu-top">
        <h2 className="section-title">The Menu</h2>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button className="punch-btn" onClick={() => setShowPunchCard(p => !p)}>🎟️ Card</button>
          <button className="cart-pill" onClick={() => setScreen("cart")}>
            🛒 Order {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
          </button>
        </div>
      </div>

      {showPunchCard && <div style={{padding:"0 16px 8px"}}><PunchCardDisplay punches={punches} /></div>}

      <div className="menu-list">
        {menu.map((item, idx) => (
          <div key={item.id} className="menu-card" style={{"--grad":item.gradient, animationDelay:`${idx*0.08}s`}}>
            {item.tag && <div className="card-tag">{item.tag}</div>}
            <div className="card-left"><div className="card-emoji">{item.emoji}</div></div>
            <div className="card-body">
              <h3 className="card-name">{item.name}</h3>
              <p className="card-desc">{item.desc}</p>
              <div className="card-bottom">
                <span className="card-price">${item.price.toFixed(2)}</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.6)",fontWeight:600}}>12oz</span>
                  <button className="add-btn" onClick={() => setCart(c => [...c, item])}>+ Add</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glitter-banner">✨ Add Edible Glitter to any drink for just $0.25</div>

      <div className="qr-banner">
        <div className="qr-text">
          <div className="qr-title">📱 Find Us on Google Play</div>
          <div className="qr-sub">Search "Riverside Squeeze" or scan our stand QR code</div>
        </div>
        <div className="qr-box">▦</div>
      </div>

      <div className="c-footer"><p>In memory of Popa 🙏</p><p>Made with love in Buffalo, NY</p></div>
    </div>
  );
}

// ─── OWNER VIEW ───────────────────────────────────────────────────────────────
function OwnerView({ orders, completeOrder, totalToday, totalOrders, locationStats, sales, isOpen, setIsOpen, currentLocation, setCurrentLocation, menu, setMenu, specials, setSpecials, songOfDay, setSongOfDay }) {
  const [tab, setTab] = useState("orders");
  const { weather, loading: weatherLoading, refetch } = useWeather();
  const isPC = window.innerWidth > 768;

  return (
    <div className="owner-screen">
      <div className="owner-top">
        <div>
          <h2 className="owner-brand">🍋 Riverside Squeeze</h2>
          <p className="owner-sub">Owner Dashboard {isPC ? "· PC Mode" : "· Mobile"}</p>
        </div>
        <button className={`open-toggle ${isOpen?"on":"off"}`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen?"● OPEN":"○ CLOSED"}
        </button>
      </div>

      <div style={{padding:"0 16px 8px"}}>
        <WeatherCard weather={weather} loading={weatherLoading} refetch={refetch} />
      </div>

      <div className="loc-selector">
        <div className="loc-label">📍 I'm currently at:</div>
        <div className="loc-pills">
          {LOCATIONS.map(loc => (
            <button key={loc.id} className={`loc-pill ${currentLocation.id===loc.id?"active":""}`}
              style={{"--loc-color":loc.color}} onClick={() => setCurrentLocation(loc)}>
              {loc.emoji} {loc.name}
            </button>
          ))}
        </div>
      </div>

      <div className="owner-stats">
        <div className="stat-box"><span className="stat-val">${totalToday.toFixed(2)}</span><span className="stat-lbl">Today</span></div>
        <div className="stat-box"><span className="stat-val">{totalOrders}</span><span className="stat-lbl">Orders</span></div>
        <div className="stat-box"><span className="stat-val">{orders.length}</span><span className="stat-lbl">Pending</span></div>
      </div>

      <div className="owner-tabs">
        {["orders","locations","editor","advisor","banking"].map(t => (
          <button key={t} className={`owner-tab ${tab===t?"active":""}`} onClick={() => setTab(t)}>
            {t==="orders"?"🧾":t==="locations"?"📍":t==="editor"?"✏️":t==="advisor"?"🤖":"🏦"}
            <span style={{display:"block",fontSize:10}}>{t==="orders"?"Orders":t==="locations"?"Spots":t==="editor"?"Edit":"advisor"===t?"AI":"Bank"}</span>
            {t==="orders" && orders.length>0 && <span className="tab-badge">{orders.length}</span>}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="orders-panel">
          {orders.length === 0 ? (
            <div className="empty-panel"><div style={{fontSize:48}}>🍋</div><p>No pending orders</p><p className="empty-sub">Customers order from their phone</p></div>
          ) : orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-num">#{order.number}</div>
              <div className="order-info">
                <div className="order-customer-name">👤 {order.customerName}</div>
                {order.items.map((item, i) => <div key={i} className="order-line">{item.emoji} {item.name} {item.chosenSize && <span style={{fontSize:11,color:"#777"}}>({item.chosenSize})</span>}</div>)}
                {order.glitter && <div className="order-line">✨ Glitter</div>}
                {order.freeItem && <div className="order-line" style={{color:"#4ade80"}}>🎉 FREE: {order.freeItem.name}</div>}
                <div className="order-price">${order.total.toFixed(2)}</div>
              </div>
              <button className="done-btn" onClick={() => completeOrder(order.id)}>DONE ✓</button>
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

      {tab === "editor" && (
        <div style={{padding:"12px 16px"}}>
          <MenuEditor menu={menu} setMenu={setMenu} specials={specials} setSpecials={setSpecials} songOfDay={songOfDay} setSongOfDay={setSongOfDay} />
        </div>
      )}

      {tab === "advisor" && (
        <div className="advisor-panel">
          <AIAdvisor locationStats={locationStats} weather={weather} sales={sales} currentLocation={currentLocation} />
        </div>
      )}

      {tab === "banking" && (
        <div style={{padding:"16px"}}>
          <div className="banking-card">
            <div className="banking-title">🏦 Direct Deposit & Payments</div>
            <div className="banking-section">
              <div className="banking-label">Payment Methods (Customer-facing)</div>
              <div className="banking-row"><span>🍎 Apple Pay</span><span className="coming-soon">Setup →</span></div>
              <div className="banking-row"><span>🔵 Google Pay</span><span className="coming-soon">Setup →</span></div>
              <div className="banking-row"><span>💳 Stripe Card Payments</span><span className="coming-soon">Setup →</span></div>
            </div>
            <div className="banking-section">
              <div className="banking-label">Owner Payouts</div>
              <div className="banking-row"><span>🏦 Bank Account (Direct Deposit)</span><span className="coming-soon">Link →</span></div>
              <div className="banking-row"><span>💸 Instant Payout</span><span className="coming-soon">Coming Soon</span></div>
            </div>
            <div className="banking-note">
              🔒 Payments are processed securely via Stripe. Your bank details are encrypted and never stored on this device. Connect your Stripe account to enable card payments and direct deposit.
            </div>
            <button className="stripe-btn">Connect Stripe Account →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("customer");
  const [isOpen, setIsOpen] = useState(true);
  const [menu, setMenu] = useState(DEFAULT_MENU);
  const [specials, setSpecials] = useState(DEFAULT_SPECIALS);
  const [songOfDay, setSongOfDay] = useState({ title: "Started From the Bottom", artist: "Drake", vibe: "Buffalo vibes only 🏈" });
  const { orders, completed, sales, placeOrder, completeOrder, totalToday, totalOrders, locationStats, currentLocation, setCurrentLocation } = useOrders();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060f; font-family: 'Outfit', sans-serif; }

        @keyframes fruitDrift0 { 0%{transform:translateY(0) rotate(0deg) scale(1)} 100%{transform:translateY(-45px) translateX(20px) rotate(25deg) scale(1.1)} }
        @keyframes fruitDrift1 { 0%{transform:translateY(0) rotate(0deg) scale(1)} 50%{transform:translateY(-30px) translateX(-25px) rotate(-15deg) scale(1.08)} 100%{transform:translateY(-50px) translateX(15px) rotate(20deg) scale(0.95)} }
        @keyframes fruitDrift2 { 0%{transform:translateY(0) rotate(0deg) scale(1)} 33%{transform:translateY(-20px) translateX(30px) rotate(10deg) scale(1.12)} 66%{transform:translateY(-40px) translateX(-10px) rotate(-20deg) scale(0.9)} 100%{transform:translateY(-55px) translateX(20px) rotate(30deg) scale(1.05)} }

        .app-root { max-width: 430px; margin: 0 auto; min-height: 100vh; background: #06060f; color: #f0ede6; position: relative; overflow-x: hidden; z-index: 1; }

        /* NAME SCREEN */
        .name-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px 24px; text-align: center; gap: 16px; }
        .name-logo { font-size: 72px; animation: levitate 3s ease-in-out infinite; }
        .name-title { font-family: 'Bebas Neue', sans-serif; font-size: 42px; letter-spacing: 2px; background: linear-gradient(135deg, #FFE135, #FF9500, #A855F7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; }
        .name-sub { font-size: 14px; color: #777; max-width: 280px; }
        .name-input { width: 100%; max-width: 320px; padding: 14px 18px; background: #0f0f1a; border: 1.5px solid #2a2a3e; border-radius: 14px; color: #fff; font-size: 16px; font-family: 'Outfit', sans-serif; outline: none; text-align: center; }
        .name-input:focus { border-color: #FFE135; }

        /* CUSTOMER */
        .customer-screen { padding-bottom: 90px; }
        .c-hero { position: relative; padding: 52px 24px 36px; text-align: center; overflow: hidden; }
        .c-hero-orbs { position: absolute; inset: 0; pointer-events: none; }
        .orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.35; }
        .orb1 { width: 200px; height: 200px; background: #FFE135; top: -60px; left: -40px; animation: drift 8s ease-in-out infinite; }
        .orb2 { width: 160px; height: 160px; background: #A855F7; top: 20px; right: -30px; animation: drift 10s ease-in-out infinite reverse; }
        .orb3 { width: 120px; height: 120px; background: #22c55e; bottom: -20px; left: 40%; animation: drift 7s ease-in-out infinite 2s; }
        @keyframes drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,20px)} }
        .c-hero-content { position: relative; z-index: 1; }
        .c-logo { font-size: 56px; display: block; margin-bottom: 10px; animation: levitate 3s ease-in-out infinite; }
        @keyframes levitate { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .c-brand { font-family: 'Bebas Neue', sans-serif; font-size: 52px; line-height: 0.95; letter-spacing: 3px; background: linear-gradient(135deg, #FFE135 0%, #FF9500 40%, #A855F7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px; }
        .c-tagline { font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #777; margin-bottom: 16px; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 7px 18px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 1px; }
        .status-badge.open { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
        .status-badge.closed { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.3); }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .song-strip { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: linear-gradient(135deg, #0d0d1a, #1a0d2e); border-top: 1px solid rgba(168,85,247,0.2); border-bottom: 1px solid rgba(168,85,247,0.2); font-size: 12px; color: #d8b4fe; gap: 8px; flex-wrap: wrap; }
        .song-vibe { color: #888; font-size: 11px; }

        .location-strip { display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background: #0d0d1a; border-top: 1px solid #1a1a2e; border-bottom: 1px solid #1a1a2e; font-size: 12px; color: #888; }
        .mobile-tag { color: #A855F7; font-weight: 600; }

        .specials-bar { display: flex; gap: 8px; padding: 10px 16px; overflow-x: auto; scrollbar-width: none; background: linear-gradient(135deg, rgba(255,225,53,0.05), rgba(255,149,0,0.05)); border-bottom: 1px solid rgba(255,225,53,0.1); }
        .specials-bar::-webkit-scrollbar { display: none; }
        .special-pill { flex-shrink: 0; padding: 6px 14px; background: rgba(255,225,53,0.1); border: 1px solid rgba(255,225,53,0.25); border-radius: 999px; font-size: 12px; color: #FFE135; font-weight: 600; white-space: nowrap; }

        .menu-top { display: flex; justify-content: space-between; align-items: center; padding: 20px 16px 10px; }
        .section-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; color: #FFE135; }
        .punch-btn { background: #1a1a2e; border: 1px solid #2a2a40; color: #d8b4fe; padding: 8px 12px; border-radius: 999px; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .cart-pill { position: relative; background: linear-gradient(135deg, #FFE135, #FF9500); color: #1a1a1a; border: none; padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .cart-count { position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border-radius: 999px; width: 18px; height: 18px; font-size: 10px; display: flex; align-items: center; justify-content: center; }

        .menu-list { padding: 0 16px; display: flex; flex-direction: column; gap: 12px; }
        .menu-card { background: var(--grad); border-radius: 20px; display: flex; overflow: hidden; position: relative; animation: slideIn 0.4s ease both; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
        .menu-card:active { transform: scale(0.97); }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .card-tag { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.3); color: white; font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 999px; letter-spacing: 1.5px; }
        .card-left { width: 75px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); flex-shrink: 0; }
        .card-emoji { font-size: 36px; }
        .card-body { padding: 14px 14px 14px 0; flex: 1; }
        .card-name { font-family: 'Bebas Neue', sans-serif; font-size: 21px; letter-spacing: 1px; color: white; margin-bottom: 4px; text-shadow: 0 1px 4px rgba(0,0,0,0.3); }
        .card-desc { font-size: 12px; color: rgba(255,255,255,0.85); margin-bottom: 8px; line-height: 1.4; }
        .secure-badge { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 16px; padding: 10px; background: rgba(74,222,128,0.07); border: 1px solid rgba(74,222,128,0.18); border-radius: 10px; font-size: 12px; color: #4ade80; font-weight: 500; }
        .size-row { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
        .size-btn { padding: 4px 9px; border-radius: 999px; border: 1.5px solid rgba(255,255,255,0.4); background: rgba(0,0,0,0.15); color: rgba(255,255,255,0.8); font-size: 10px; cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 600; transition: all 0.15s; white-space: nowrap; }
        .size-btn.active { background: rgba(255,255,255,0.9); color: #1a1a1a; border-color: white; }
        .card-bottom { display: flex; justify-content: space-between; align-items: center; }
        .card-price { font-size: 22px; font-weight: 700; color: white; text-shadow: 0 1px 4px rgba(0,0,0,0.3); }
        .add-btn { background: rgba(255,255,255,0.25); color: white; border: 2px solid rgba(255,255,255,0.5); padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'Outfit', sans-serif; backdrop-filter: blur(4px); transition: background 0.15s; }
        .add-btn:active { background: rgba(255,255,255,0.4); }

        .glitter-banner { margin: 16px; padding: 12px 16px; background: linear-gradient(135deg, #1a0a2e, #2d1069); border: 1px solid rgba(168,85,247,0.3); border-radius: 14px; font-size: 13px; color: #d8b4fe; text-align: center; box-shadow: 0 0 20px rgba(168,85,247,0.15); }
        .qr-banner { margin: 0 16px 16px; padding: 16px; background: linear-gradient(135deg, #0a1a2e, #0d2d4a); border: 1px solid rgba(59,130,246,0.3); border-radius: 14px; display: flex; align-items: center; gap: 14px; }
        .qr-text { flex: 1; }
        .qr-title { font-size: 13px; font-weight: 700; color: #60a5fa; margin-bottom: 4px; }
        .qr-sub { font-size: 11px; color: #666; }
        .qr-box { font-size: 36px; color: #60a5fa; }
        .c-footer { text-align: center; padding: 20px; color: #444; font-size: 12px; line-height: 2; }

        /* PUNCH CARD */
        .punch-card { background: linear-gradient(135deg, #0f0f1a, #1a1040); border: 1px solid rgba(255,225,53,0.25); border-radius: 16px; padding: 14px 16px; margin-bottom: 4px; }
        .punch-small { padding: 10px 14px; }
        .punch-title { font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 1px; color: #FFE135; margin-bottom: 10px; }
        .punch-row { display: flex; gap: 8px; justify-content: center; }
        .punch-dot { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #2a2a40; display: flex; align-items: center; justify-content: center; font-size: 18px; background: #0f0f1a; transition: all 0.3s; }
        .punch-dot.punched { background: rgba(255,225,53,0.15); border-color: #FFE135; }
        .free-dot { border-color: rgba(168,85,247,0.4); }
        .free-dot.active { background: rgba(168,85,247,0.2); border-color: #A855F7; animation: blink 1.5s infinite; }
        .punch-sub { font-size: 12px; color: #888; text-align: center; margin-top: 10px; }

        /* SPECIAL NOTICES */
        .special-applied { background: rgba(74,222,128,0.1); border: 1px solid rgba(74,222,128,0.25); border-radius: 10px; padding: 10px 14px; margin: 10px 0; font-size: 13px; color: #4ade80; }
        .special-hint { background: rgba(255,225,53,0.08); border: 1px solid rgba(255,225,53,0.2); border-radius: 10px; padding: 10px 14px; margin: 10px 0; font-size: 13px; color: #FFE135; }

        /* PAY SCREEN */
        .pay-total { font-family: 'Bebas Neue', sans-serif; font-size: 32px; text-align: center; margin: 16px 0; color: #ccc; }
        .pay-total span { color: #FFE135; }
        .pay-options { display: flex; flex-direction: column; gap: 10px; }
        .pay-btn { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 14px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; position: relative; transition: opacity 0.2s; }
        .pay-btn.apple { background: #1a1a2e; color: #fff; border: 1px solid #2a2a40; }
        .pay-btn.google { background: #0d1a2e; color: #fff; border: 1px solid #1a2a40; }
        .pay-btn.card { background: #0f1a10; color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
        .pay-btn.cash { background: #1a1410; color: #FFE135; border: 1px solid rgba(255,225,53,0.2); }
        .pay-badge { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 10px; padding: 3px 8px; border-radius: 999px; background: rgba(255,255,255,0.1); color: #aaa; font-weight: 400; }
        .pay-confirm { margin-top: 16px; text-align: center; padding: 16px; background: #0f0f1a; border-radius: 14px; border: 1px solid #1a1a2e; }

        /* CART */
        .inner-screen { min-height: 100vh; padding-bottom: 90px; }
        .inner-header { display: flex; align-items: center; gap: 12px; padding: 20px 16px 10px; }
        .back-btn { background: none; border: none; color: #FFE135; font-size: 14px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .inner-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; color: #FFE135; }
        .cart-body { padding: 0 16px; }
        .cart-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #1a1a2e; font-size: 15px; }
        .cart-row-right { display: flex; align-items: center; gap: 10px; }
        .cart-price { color: #FFE135; font-weight: 600; }
        .remove-btn { background: #1a1a2e; border: none; color: #f87171; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 12px; }
        .glitter-toggle { display: flex; align-items: center; gap: 10px; padding: 14px 0; border-bottom: 1px solid #1a1a2e; cursor: pointer; font-size: 14px; }
        .glitter-toggle input { accent-color: #FFE135; width: 18px; height: 18px; }
        .cart-total { display: flex; justify-content: space-between; padding: 16px 0; font-size: 22px; font-weight: 700; color: #FFE135; }
        .empty-msg { color: #555; text-align: center; padding: 32px; }

        .btn-primary { display: block; width: calc(100% - 32px); margin: 20px auto 0; padding: 16px; border: none; border-radius: 14px; background: linear-gradient(135deg, #FFE135, #FF9500); color: #1a1a1a; font-size: 18px; font-weight: 700; font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; cursor: pointer; transition: opacity 0.2s; box-shadow: 0 4px 20px rgba(255,225,53,0.3); }
        .btn-primary:disabled { opacity: 0.35; }

        /* WAITING / READY */
        .full-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; text-align: center; }
        .waiting-screen { background: radial-gradient(ellipse at center, #0d1a0d 0%, #06060f 70%); position: relative; overflow: hidden; flex-direction: column; }
        .waiting-glow { position: absolute; width: 300px; height: 300px; background: #FFE135; border-radius: 50%; filter: blur(120px); opacity: 0.06; }
        .waiting-content { position: relative; z-index: 1; }
        .waiting-rings { position: absolute; top: 50%; left: 50%; }
        .waiting-rings div { position: absolute; border-radius: 50%; border: 2px solid #FFE135; animation: ring 2.5s ease-out infinite; }
        .waiting-rings div:nth-child(1) { width: 180px; height: 180px; top: -90px; left: -90px; animation-delay: 0s; }
        .waiting-rings div:nth-child(2) { width: 240px; height: 240px; top: -120px; left: -120px; animation-delay: 0.6s; }
        .waiting-rings div:nth-child(3) { width: 300px; height: 300px; top: -150px; left: -150px; animation-delay: 1.2s; }
        @keyframes ring { 0%{transform:scale(0.3);opacity:0.8} 100%{transform:scale(1.2);opacity:0} }
        .order-num-big { font-family: 'Bebas Neue', sans-serif; font-size: 130px; line-height: 1; background: linear-gradient(135deg, #FFE135, #FF9500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .waiting-name { font-size: 20px; color: #FFE135; font-weight: 600; margin-bottom: 4px; }
        .waiting-label { font-size: 11px; letter-spacing: 3px; color: #555; margin-bottom: 16px; }
        .waiting-msg { font-size: 16px; color: #ccc; max-width: 260px; margin: 0 auto; }
        .ready-screen { background: radial-gradient(ellipse at center, #0a2010 0%, #06060f 70%); flex-direction: column; gap: 12px; }
        .ready-burst { font-size: 80px; animation: pop 0.5s cubic-bezier(0.36,0.07,0.19,0.97); }
        @keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
        .ready-title { font-family: 'Bebas Neue', sans-serif; font-size: 34px; letter-spacing: 2px; color: #4ade80; }
        .ready-num { font-family: 'Bebas Neue', sans-serif; font-size: 110px; color: #4ade80; line-height: 1; }
        .ready-sub { color: #888; font-size: 15px; margin-bottom: 12px; }

        /* OWNER */
        .owner-screen { min-height: 100vh; padding-bottom: 90px; background: #06060f; }
        .owner-top { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 16px 14px; background: linear-gradient(180deg, #0d0d1a 0%, transparent 100%); border-bottom: 1px solid #1a1a2e; }
        .owner-brand { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 2px; color: #FFE135; }
        .owner-sub { font-size: 11px; color: #555; letter-spacing: 1px; }
        .open-toggle { padding: 9px 18px; border-radius: 999px; border: none; font-weight: 700; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; letter-spacing: 1px; }
        .open-toggle.on { background: rgba(74,222,128,0.15); color: #4ade80; border: 1px solid rgba(74,222,128,0.4); }
        .open-toggle.off { background: rgba(248,113,113,0.15); color: #f87171; border: 1px solid rgba(248,113,113,0.4); }

        /* WEATHER */
        .weather-card { background: linear-gradient(135deg, #0d1a2e, #1a0d2e); border: 1px solid rgba(96,165,250,0.2); border-radius: 16px; padding: 14px 16px; margin-bottom: 4px; }
        .weather-card.loading { display: flex; align-items: center; gap: 12px; color: #555; font-size: 13px; }
        .weather-spinner { width: 20px; height: 20px; border: 2px solid #333; border-top-color: #60a5fa; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .weather-main { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .weather-icon { font-size: 32px; }
        .weather-temp { font-family: 'Bebas Neue', sans-serif; font-size: 30px; color: #60a5fa; }
        .weather-desc { font-size: 12px; color: #888; }
        .weather-refresh { margin-left: auto; background: none; border: none; color: #555; font-size: 18px; cursor: pointer; }
        .weather-details { display: flex; gap: 12px; font-size: 12px; color: #777; align-items: center; flex-wrap: wrap; }
        .weather-verdict { color: #FFE135; font-weight: 600; margin-left: auto; }
        .weather-fallback { font-size: 11px; color: #555; margin-top: 8px; text-align: center; }

        /* LOCATION */
        .loc-selector { padding: 10px 16px 6px; }
        .loc-label { font-size: 11px; color: #555; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        .loc-pills { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .loc-pills::-webkit-scrollbar { display: none; }
        .loc-pill { flex-shrink: 0; padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.1); background: #0f0f1a; color: #888; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; white-space: nowrap; transition: all 0.2s; }
        .loc-pill.active { background: var(--loc-color); color: white; border-color: transparent; font-weight: 600; }

        /* STATS */
        .owner-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: #1a1a2e; border-top: 1px solid #1a1a2e; border-bottom: 1px solid #1a1a2e; }
        .stat-box { background: #06060f; padding: 16px 12px; text-align: center; }
        .stat-val { display: block; font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #FFE135; }
        .stat-lbl { font-size: 10px; color: #555; letter-spacing: 1px; text-transform: uppercase; }

        /* TABS */
        .owner-tabs { display: flex; border-bottom: 1px solid #1a1a2e; }
        .owner-tab { flex: 1; padding: 10px 4px; background: none; border: none; color: #555; font-size: 18px; cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 500; border-bottom: 2px solid transparent; transition: all 0.2s; position: relative; }
        .owner-tab.active { color: #FFE135; border-bottom-color: #FFE135; }
        .tab-badge { position: absolute; top: 6px; right: 4px; background: #ef4444; color: white; border-radius: 999px; width: 16px; height: 16px; font-size: 9px; display: flex; align-items: center; justify-content: center; }

        /* ORDERS */
        .orders-panel { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
        .order-card { background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 14px; padding: 14px; display: flex; align-items: center; gap: 14px; }
        .order-num { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: #FFE135; min-width: 52px; text-align: center; }
        .order-info { flex: 1; }
        .order-customer-name { font-size: 13px; color: #A855F7; font-weight: 600; margin-bottom: 4px; }
        .order-line { font-size: 13px; color: #bbb; margin-bottom: 2px; }
        .order-price { font-size: 16px; font-weight: 700; color: #FFE135; margin-top: 6px; }
        .done-btn { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; padding: 10px 14px; border-radius: 10px; font-weight: 700; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; letter-spacing: 0.5px; }
        .empty-panel { text-align: center; padding: 48px 20px; color: #444; }
        .empty-sub { font-size: 12px; color: #333; margin-top: 6px; }

        /* HEATMAP */
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
        .sessions-title { font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 1px; color: #FFE135; padding: 12px 14px 8px; }
        .session-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-top: 1px solid #1a1a2e; }
        .session-emoji { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .session-info { flex: 1; }
        .session-name { font-size: 13px; font-weight: 500; }
        .session-date { font-size: 11px; color: #555; }
        .session-sales { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #22c55e; }

        /* AI */
        .advisor-panel { padding: 16px; }
        .ai-advisor { background: linear-gradient(135deg, #0d0d1a, #1a0d2e); border: 1px solid rgba(168,85,247,0.3); border-radius: 20px; padding: 20px; box-shadow: 0 0 40px rgba(168,85,247,0.1); }
        .ai-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .ai-icon { font-size: 32px; }
        .ai-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; color: #d8b4fe; }
        .ai-sub { font-size: 11px; color: #666; }
        .ai-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(135deg, #A855F7, #7C3AED); color: white; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; letter-spacing: 0.5px; box-shadow: 0 4px 20px rgba(168,85,247,0.3); transition: opacity 0.2s; }
        .ai-btn:active { opacity: 0.85; }
        .ai-loading { text-align: center; padding: 20px; }
        .ai-dots { display: flex; justify-content: center; gap: 6px; margin-bottom: 10px; }
        .ai-dots span { width: 8px; height: 8px; background: #A855F7; border-radius: 50%; animation: dot 1.2s ease-in-out infinite; }
        .ai-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ai-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        .ai-loading p { font-size: 13px; color: #666; }
        .ai-response p { font-size: 14px; color: #d8b4fe; line-height: 1.7; white-space: pre-wrap; }
        .ai-refresh { margin-top: 14px; background: none; border: 1px solid rgba(168,85,247,0.3); color: #A855F7; padding: 8px 16px; border-radius: 999px; font-size: 13px; cursor: pointer; font-family: 'Outfit', sans-serif; }

        /* MENU EDITOR */
        .menu-editor { }
        .editor-tabs { display: flex; gap: 6px; margin-bottom: 14px; }
        .editor-tab { flex: 1; padding: 8px 6px; background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 10px; color: #666; font-size: 11px; cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 600; transition: all 0.2s; }
        .editor-tab.active { background: rgba(255,225,53,0.1); border-color: rgba(255,225,53,0.3); color: #FFE135; }
        .add-new-btn { width: 100%; padding: 12px; background: rgba(74,222,128,0.1); border: 1px dashed rgba(74,222,128,0.3); border-radius: 12px; color: #4ade80; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; margin-bottom: 10px; }
        .editor-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 12px; margin-bottom: 8px; }
        .editor-row-info { display: flex; align-items: center; gap: 10px; }
        .editor-row-name { font-size: 14px; font-weight: 600; color: #f0ede6; }
        .editor-row-price { font-size: 12px; color: #888; margin-top: 2px; }
        .editor-row-actions { display: flex; gap: 8px; }
        .edit-btn, .del-btn { background: #1a1a2e; border: none; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-size: 14px; }

        /* MODAL */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal-box { background: #0f0f1a; border: 1px solid #2a2a3e; border-radius: 20px; padding: 20px; width: 100%; max-width: 380px; max-height: 90vh; overflow-y: auto; }
        .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 1px; color: #FFE135; margin-bottom: 14px; }
        .modal-field { margin-bottom: 10px; }
        .modal-label { display: block; font-size: 11px; color: #777; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .modal-input { width: 100%; padding: 10px 14px; background: #06060f; border: 1px solid #2a2a3e; border-radius: 10px; color: #fff; font-size: 14px; font-family: 'Outfit', sans-serif; outline: none; }
        .modal-input:focus { border-color: #FFE135; }
        .modal-save { padding: 10px 20px; background: linear-gradient(135deg, #FFE135, #FF9500); border: none; border-radius: 10px; color: #1a1a1a; font-weight: 700; font-size: 14px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .modal-cancel { padding: 10px 20px; background: #1a1a2e; border: 1px solid #2a2a3e; border-radius: 10px; color: #888; font-size: 14px; cursor: pointer; font-family: 'Outfit', sans-serif; }

        /* SONG EDITOR */
        .song-editor { display: flex; flex-direction: column; gap: 10px; }
        .song-hint { font-size: 13px; color: #888; margin-bottom: 4px; line-height: 1.5; }

        /* BANKING */
        .banking-card { background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 20px; padding: 20px; }
        .banking-title { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 1px; color: #FFE135; margin-bottom: 16px; }
        .banking-section { margin-bottom: 16px; }
        .banking-label { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .banking-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #1a1a2e; font-size: 14px; color: #ccc; }
        .coming-soon { font-size: 12px; color: #A855F7; font-weight: 600; }
        .banking-note { font-size: 12px; color: #555; line-height: 1.6; padding: 12px; background: rgba(96,165,250,0.05); border: 1px solid rgba(96,165,250,0.1); border-radius: 10px; margin-bottom: 14px; }
        .stripe-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #635bff, #8b5cf6); border: none; border-radius: 12px; color: white; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; }

        /* NAV */
        .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: rgba(6,6,15,0.95); border-top: 1px solid #1a1a2e; display: flex; z-index: 100; backdrop-filter: blur(12px); }
        .nav-btn { flex: 1; padding: 14px 8px; background: none; border: none; color: #444; font-size: 11px; cursor: pointer; font-family: 'Outfit', sans-serif; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: color 0.2s; position: relative; }
        .nav-btn.active { color: #FFE135; }
        .nav-btn span:first-child { font-size: 22px; }
        .pending-badge { position: absolute; top: 8px; background: #ef4444; color: white; border-radius: 999px; padding: 2px 6px; font-size: 10px; font-weight: 700; }
      `}</style>

      <FruitBackground />
      <div className="app-root">
        {view === "customer"
          ? <CustomerView placeOrder={placeOrder} completed={completed} isOpen={isOpen} menu={menu} specials={specials} songOfDay={songOfDay} />
          : <OwnerView
              orders={orders} completeOrder={completeOrder}
              totalToday={totalToday} totalOrders={totalOrders}
              locationStats={locationStats} sales={sales}
              isOpen={isOpen} setIsOpen={setIsOpen}
              currentLocation={currentLocation} setCurrentLocation={setCurrentLocation}
              menu={menu} setMenu={setMenu}
              specials={specials} setSpecials={setSpecials}
              songOfDay={songOfDay} setSongOfDay={setSongOfDay}
            />
        }
        <nav className="bottom-nav">
          <button className={`nav-btn ${view==="customer"?"active":""}`} onClick={() => setView("customer")}>
            <span>🍋</span><span>Menu</span>
          </button>
          <button className={`nav-btn ${view==="owner"?"active":""}`} onClick={() => setView("owner")} style={{position:"relative"}}>
            <span>📊</span><span>Owner</span>
            {orders.length > 0 && <span className="pending-badge">{orders.length}</span>}
          </button>
        </nav>
      </div>
    </>
  );
}
