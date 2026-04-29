import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const MENU = [
  { id: 1, name: "Classic Lemonade", price: 5.0, emoji: "🍋", desc: "Fresh squeezed, ice cold, pure perfection.", gradient: "linear-gradient(135deg, #FFE135 0%, #FF9500 100%)", tag: null },
  { id: 2, name: "Dragon Fruit Lemonade", price: 7.0, emoji: "🐉", desc: "Dragon fruit syrup with fresh pieces on top. Bold & beautiful.", gradient: "linear-gradient(135deg, #FF6B9D 0%, #C44F8A 100%)", tag: "FAN FAV" },
  { id: 3, name: "Do You Billieve?", price: 7.0, emoji: "🏈", desc: "Mystery flavor every week. Have faith. Just trust it. #BillsMafia", gradient: "linear-gradient(135deg, #00338D 0%, #4F7FD4 100%)", tag: "MYSTERY" },
  { id: 4, name: "Prickly Pear Lemonade", price: 7.0, emoji: "🌵", desc: "Sweet, stunning, naturally pink. Gram-worthy every single pour.", gradient: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)", tag: "NEW" },
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
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "No response";
      setResponse(text);
    } catch (e) {
      setResponse("Couldn't connect to AI right now. Try again!");
    }
    setLoading(false);
  }, []);

  return { ask, loading, response };
}

// ─── WEATHER HOOK ────────────────────────────────────────────────────────────
function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch_weather = useCallback(async () => {
    setLoading(true);
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,precipitation&temperature_unit=fahrenheit&windspeed_unit=mph`
      );
      const d = await r.json();
      const c = d.current;
      const code = c.weathercode;
      let icon = "☀️", desc = "Clear";
      if (code === 0) { icon = "☀️"; desc = "Clear"; }
      else if (code <= 3) { icon = "⛅"; desc = "Partly Cloudy"; }
      else if (code <= 48) { icon = "🌫️"; desc = "Foggy"; }
      else if (code <= 67) { icon = "🌧️"; desc = "Rainy"; }
      else if (code <= 77) { icon = "❄️"; desc = "Snowy"; }
      else if (code <= 82) { icon = "🌦️"; desc = "Showers"; }
      else { icon = "⛈️"; desc = "Stormy"; }

      const selling = code <= 3 ? "🔥 Great day to sell!" : code <= 48 ? "😐 Decent, stay out" : "⚠️ Tough conditions";
      setWeather({
        temp: Math.round(c.temperature_2m),
        desc,
        icon,
        wind: Math.round(c.windspeed_10m),
        rain: c.precipitation,
        selling,
      });
    } catch {
      setWeather({ temp: 72, desc: "Clear", icon: "☀️", wind: 8, rain: 0, selling: "🔥 Great day to sell!", fallback: true });
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch_weather(); }, []);

  return { weather, loading, refetch: fetch_weather };
}

// ─── ORDER SYSTEM ─────────────────────────────────────────────────────────────
function useOrders() {
  const [orders, setOrders] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [sales, setSales] = useState(SAMPLE_LOCATION_DATA.map(d => ({ ...d, isSample: true })));
  const [currentLocation, setCurrentLocation] = useState(LOCATIONS[0]);

  const placeOrder = (items, glitter) => {
    const num = Math.floor(Math.random() * 89) + 10;
    const order = { id: Date.now(), number: num, items, glitter, total: items.reduce((s, i) => s + i.price, 0) + (glitter ? 0.25 : 0), status: "pending", time: new Date(), location: currentLocation };
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

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function WeatherCard({ weather, loading, refetch }) {
  if (loading) return <div className="weather-card loading"><div className="weather-spinner" /><span>Getting weather...</span></div>;
  if (!weather) return null;
  return (
    <div className="weather-card">
      <div className="weather-main">
        <span className="weather-icon">{weather.icon}</span>
        <div>
          <div className="weather-temp">{weather.temp}°F</div>
          <div className="weather-desc">{weather.desc}</div>
        </div>
        <button className="weather-refresh" onClick={refetch}>↻</button>
      </div>
      <div className="weather-details">
        <span>💨 {weather.wind}mph</span>
        <span>🌧️ {weather.rain}"</span>
        <span className="weather-verdict">{weather.selling}</span>
      </div>
      {weather.fallback && <div className="weather-fallback">📍 Enable location for live weather</div>}
    </div>
  );
}

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
              <div className="heatmap-bar-wrap">
                <div className="heatmap-bar" style={{ width: `${pct}%`, background: loc.color }} />
              </div>
              <div className="heatmap-stats">${loc.totalSales.toFixed(0)} • {loc.sessions} sessions</div>
            </div>
            <div className="heatmap-badge" style={{ background: loc.color }}>
              {heat === "hot" ? "🔥" : heat === "warm" ? "⚡" : "❄️"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AIAdvisor({ locationStats, weather, sales, currentLocation }) {
  const { ask, loading, response } = useAI();
  const [asked, setAsked] = useState(false);

  const getAdvice = () => {
    setAsked(true);
    const topLoc = locationStats[0];
    const prompt = `You are a friendly business advisor for "Riverside Squeeze", a mobile lemonade stand in Buffalo NY's Riverside Park run by a first-time entrepreneur. 

Current weather: ${weather?.temp || 72}°F, ${weather?.desc || "Clear"}, ${weather?.selling || "good conditions"}
Current location: ${currentLocation.name}
Top performing location: ${topLoc?.name} with $${topLoc?.totalSales?.toFixed(0)} in sales across ${topLoc?.sessions} sessions
Location data: ${JSON.stringify(locationStats.map(l => ({ name: l.name, sales: l.totalSales, sessions: l.sessions })))}
Recent sales: ${sales.slice(-5).map(s => `${s.event} at ${s.locationId}: $${s.sales}`).join(", ")}

Give 3 SHORT, specific, actionable tips for where to position the stand today and how to maximize sales. Be encouraging, casual, and reference real details from the data. Use emojis. Keep it under 120 words total.`;
    ask(prompt);
  };

  return (
    <div className="ai-advisor">
      <div className="ai-header">
        <div className="ai-icon">🤖</div>
        <div>
          <div className="ai-title">AI Sales Advisor</div>
          <div className="ai-sub">Powered by Claude</div>
        </div>
      </div>
      {!asked ? (
        <button className="ai-btn" onClick={getAdvice}>
          ✨ Get Today's Strategy
        </button>
      ) : loading ? (
        <div className="ai-loading">
          <div className="ai-dots"><span /><span /><span /></div>
          <p>Analyzing your sales data...</p>
        </div>
      ) : (
        <div className="ai-response">
          <p>{response}</p>
          <button className="ai-refresh" onClick={getAdvice}>↻ Ask Again</button>
        </div>
      )}
    </div>
  );
}

// ─── CUSTOMER VIEW ────────────────────────────────────────────────────────────
function CustomerView({ placeOrder, completed, isOpen }) {
  const [screen, setScreen] = useState("menu");
  const [cart, setCart] = useState([]);
  const [glitter, setGlitter] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const prevCompleted = useRef([]);

  useEffect(() => {
    if (!activeOrder) return;
    const found = completed.find(o => o.id === activeOrder.id);
    if (found && !prevCompleted.current.find(o => o.id === found.id)) {
      if (navigator.vibrate) navigator.vibrate([400, 100, 400, 100, 800]);
      setScreen("ready");
    }
    prevCompleted.current = completed;
  }, [completed, activeOrder]);

  const total = cart.reduce((s, i) => s + i.price, 0) + (glitter ? 0.25 : 0);

  const handleOrder = () => {
    if (!cart.length) return;
    const order = placeOrder(cart, glitter);
    setActiveOrder(order);
    setScreen("waiting");
  };

  if (screen === "waiting") return (
    <div className="full-screen waiting-screen">
      <div className="waiting-glow" />
      <div className="waiting-content">
        <div className="waiting-rings"><div /><div /><div /></div>
        <div className="order-num-big">{activeOrder?.number}</div>
        <p className="waiting-label">YOUR ORDER NUMBER</p>
        <p className="waiting-msg">Go enjoy the game — we'll buzz you when it's ready! 🍋</p>
      </div>
    </div>
  );

  if (screen === "ready") return (
    <div className="full-screen ready-screen">
      <div className="ready-burst">🍋</div>
      <h2 className="ready-title">YOUR SQUEEZE IS READY!</h2>
      <div className="ready-num">{activeOrder?.number}</div>
      <p className="ready-sub">Show this number at the stand!</p>
      <button className="btn-primary" onClick={() => { setScreen("menu"); setCart([]); setGlitter(false); setActiveOrder(null); }}>Order Again 🍋</button>
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
            {cart.map((item, i) => (
              <div key={i} className="cart-row">
                <span>{item.emoji} {item.name}</span>
                <div className="cart-row-right">
                  <span className="cart-price">${item.price.toFixed(2)}</span>
                  <button className="remove-btn" onClick={() => setCart(c => { const copy = [...c]; copy.splice(i, 1); return copy; })}>✕</button>
                </div>
              </div>
            ))}
            <label className="glitter-toggle">
              <input type="checkbox" checked={glitter} onChange={e => setGlitter(e.target.checked)} />
              <span className="glitter-custom" />
              <span>✨ Edible Glitter +$0.25</span>
            </label>
            <div className="cart-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
      <button className="btn-primary" onClick={handleOrder} disabled={!cart.length}>Place Order 🍋</button>
    </div>
  );

  return (
    <div className="customer-screen">
      {/* Hero */}
      <div className="c-hero">
        <div className="c-hero-orbs">
          <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
        </div>
        <div className="c-hero-content">
          <div className="c-logo">🍋</div>
          <h1 className="c-brand">Riverside<br />Squeeze</h1>
          <p className="c-tagline">Buffalo Born · Park Fresh · Always Cold</p>
          <div className={`status-badge ${isOpen ? "open" : "closed"}`}>
            <span className="status-dot" />{isOpen ? "We're OPEN" : "We're CLOSED"}
          </div>
        </div>
      </div>

      {/* Location Strip */}
      <div className="location-strip">
        <span>📍 Riverside Park, Buffalo NY</span>
        <span className="mobile-tag">Mobile Stand</span>
      </div>

      {/* Menu Header */}
      <div className="menu-top">
        <h2 className="section-title">The Menu</h2>
        <button className="cart-pill" onClick={() => setScreen("cart")}>
          🛒 Order {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
        </button>
      </div>

      {/* Cards */}
      <div className="menu-list">
        {MENU.map((item, idx) => (
          <div key={item.id} className="menu-card" style={{ "--grad": item.gradient, animationDelay: `${idx * 0.08}s` }}>
            {item.tag && <div className="card-tag">{item.tag}</div>}
            <div className="card-left">
              <div className="card-emoji">{item.emoji}</div>
            </div>
            <div className="card-body">
              <h3 className="card-name">{item.name}</h3>
              <p className="card-desc">{item.desc}</p>
              <div className="card-bottom">
                <span className="card-price">${item.price.toFixed(2)}</span>
                <button className="add-btn" onClick={() => setCart(c => [...c, item])}>+ Add</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Glitter Banner */}
      <div className="glitter-banner">✨ Add Edible Glitter to any drink for just $0.25</div>

      {/* QR Banner */}
      <div className="qr-banner">
        <div className="qr-text">
          <div className="qr-title">📱 Find Us on Google Play</div>
          <div className="qr-sub">Search "Riverside Squeeze" or scan our stand QR code</div>
        </div>
        <div className="qr-box">▦</div>
      </div>

      <div className="c-footer">
        <p>In memory of Popa 🙏</p>
        <p>Made with love in Buffalo, NY</p>
      </div>
    </div>
  );
}

// ─── OWNER VIEW ───────────────────────────────────────────────────────────────
function OwnerView({ orders, completeOrder, totalToday, totalOrders, locationStats, sales, isOpen, setIsOpen, currentLocation, setCurrentLocation }) {
  const [tab, setTab] = useState("orders");
  const { weather, loading: weatherLoading, refetch } = useWeather();

  return (
    <div className="owner-screen">
      {/* Owner Header */}
      <div className="owner-top">
        <div>
          <h2 className="owner-brand">🍋 Riverside Squeeze</h2>
          <p className="owner-sub">Owner Dashboard</p>
        </div>
        <button className={`open-toggle ${isOpen ? "on" : "off"}`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "● OPEN" : "○ CLOSED"}
        </button>
      </div>

      {/* Weather */}
      <div style={{ padding: "0 16px 8px" }}>
        <WeatherCard weather={weather} loading={weatherLoading} refetch={refetch} />
      </div>

      {/* Current Location */}
      <div className="loc-selector">
        <div className="loc-label">📍 I'm currently at:</div>
        <div className="loc-pills">
          {LOCATIONS.map(loc => (
            <button key={loc.id} className={`loc-pill ${currentLocation.id === loc.id ? "active" : ""}`}
              style={{ "--loc-color": loc.color }} onClick={() => setCurrentLocation(loc)}>
              {loc.emoji} {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="owner-stats">
        <div className="stat-box">
          <span className="stat-val">${totalToday.toFixed(2)}</span>
          <span className="stat-lbl">Today</span>
        </div>
        <div className="stat-box">
          <span className="stat-val">{totalOrders}</span>
          <span className="stat-lbl">Orders</span>
        </div>
        <div className="stat-box">
          <span className="stat-val">{orders.length}</span>
          <span className="stat-lbl">Pending</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="owner-tabs">
        {["orders", "locations", "advisor"].map(t => (
          <button key={t} className={`owner-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "orders" ? "🧾" : t === "locations" ? "📍" : "🤖"} {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "orders" && orders.length > 0 && <span className="tab-badge">{orders.length}</span>}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="orders-panel">
          {orders.length === 0 ? (
            <div className="empty-panel">
              <div style={{ fontSize: 48 }}>🍋</div>
              <p>No pending orders</p>
              <p className="empty-sub">Customers order from their phone</p>
            </div>
          ) : orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-num">#{order.number}</div>
              <div className="order-info">
                {order.items.map((item, i) => <div key={i} className="order-line">{item.emoji} {item.name}</div>)}
                {order.glitter && <div className="order-line">✨ Glitter</div>}
                <div className="order-price">${order.total.toFixed(2)}</div>
              </div>
              <button className="done-btn" onClick={() => completeOrder(order.id)}>DONE ✓</button>
            </div>
          ))}
        </div>
      )}

      {/* Locations Tab */}
      {tab === "locations" && (
        <div className="locations-panel">
          <p className="panel-hint">Based on your sales history — here's where the money is 💰</p>
          <LocationHeatmap locationStats={locationStats} />
          <div className="sessions-list">
            <h3 className="sessions-title">Recent Sessions</h3>
            {SAMPLE_LOCATION_DATA.slice(0, 4).map((s, i) => {
              const loc = LOCATIONS.find(l => l.id === s.locationId);
              return (
                <div key={i} className="session-row">
                  <div className="session-emoji" style={{ background: loc?.color + "33" }}>{loc?.emoji}</div>
                  <div className="session-info">
                    <div className="session-name">{s.event}</div>
                    <div className="session-date">{s.date} · {s.weather}</div>
                  </div>
                  <div className="session-sales">${s.sales}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Advisor Tab */}
      {tab === "advisor" && (
        <div className="advisor-panel">
          <AIAdvisor locationStats={locationStats} weather={weather} sales={sales} currentLocation={currentLocation} />
        </div>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("customer");
  const [isOpen, setIsOpen] = useState(true);
  const { orders, completed, sales, placeOrder, completeOrder, totalToday, totalOrders, locationStats, currentLocation, setCurrentLocation } = useOrders();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060f; font-family: 'Outfit', sans-serif; }

        .app-root {
          max-width: 430px;
          margin: 0 auto;
          min-height: 100vh;
          background: #06060f;
          color: #f0ede6;
          position: relative;
          overflow-x: hidden;
        }

        /* ── CUSTOMER ── */
        .customer-screen { padding-bottom: 90px; }

        .c-hero {
          position: relative;
          padding: 52px 24px 36px;
          text-align: center;
          overflow: hidden;
        }
        .c-hero-orbs { position: absolute; inset: 0; pointer-events: none; }
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.35;
        }
        .orb1 { width: 200px; height: 200px; background: #FFE135; top: -60px; left: -40px; animation: drift 8s ease-in-out infinite; }
        .orb2 { width: 160px; height: 160px; background: #A855F7; top: 20px; right: -30px; animation: drift 10s ease-in-out infinite reverse; }
        .orb3 { width: 120px; height: 120px; background: #22c55e; bottom: -20px; left: 40%; animation: drift 7s ease-in-out infinite 2s; }
        @keyframes drift { 0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,20px)} }

        .c-hero-content { position: relative; z-index: 1; }
        .c-logo { font-size: 56px; display: block; margin-bottom: 10px; animation: levitate 3s ease-in-out infinite; }
        @keyframes levitate { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        .c-brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 52px;
          line-height: 0.95;
          letter-spacing: 3px;
          background: linear-gradient(135deg, #FFE135 0%, #FF9500 40%, #A855F7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }
        .c-tagline { font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; color: #777; margin-bottom: 16px; }

        .status-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 18px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 1px;
        }
        .status-badge.open { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
        .status-badge.closed { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.3); }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .location-strip {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 20px; background: #0d0d1a;
          border-top: 1px solid #1a1a2e; border-bottom: 1px solid #1a1a2e;
          font-size: 12px; color: #888;
        }
        .mobile-tag { color: #A855F7; font-weight: 600; }

        .menu-top { display: flex; justify-content: space-between; align-items: center; padding: 20px 16px 10px; }
        .section-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; color: #FFE135; }

        .cart-pill {
          position: relative;
          background: linear-gradient(135deg, #FFE135, #FF9500);
          color: #1a1a1a; border: none; padding: 8px 16px; border-radius: 999px;
          font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'Outfit', sans-serif;
        }
        .cart-count {
          position: absolute; top: -5px; right: -5px;
          background: #ef4444; color: white; border-radius: 999px;
          width: 18px; height: 18px; font-size: 10px;
          display: flex; align-items: center; justify-content: center;
        }

        .menu-list { padding: 0 16px; display: flex; flex-direction: column; gap: 12px; }

        .menu-card {
          background: var(--grad);
          border-radius: 20px;
          display: flex;
          overflow: hidden;
          position: relative;
          animation: slideIn 0.4s ease both;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .menu-card:active { transform: scale(0.97); }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        .card-tag {
          position: absolute; top: 10px; right: 10px;
          background: rgba(0,0,0,0.3); color: white; font-size: 9px; font-weight: 700;
          padding: 3px 8px; border-radius: 999px; letter-spacing: 1.5px;
        }
        .card-left {
          width: 75px; display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.2); flex-shrink: 0;
        }
        .card-emoji { font-size: 36px; }
        .card-body { padding: 14px 14px 14px 0; flex: 1; }
        .card-name { font-family: 'Bebas Neue', sans-serif; font-size: 21px; letter-spacing: 1px; color: white; margin-bottom: 4px; text-shadow: 0 1px 4px rgba(0,0,0,0.3); }
        .card-desc { font-size: 12px; color: rgba(255,255,255,0.85); margin-bottom: 10px; line-height: 1.4; }
        .card-bottom { display: flex; justify-content: space-between; align-items: center; }
        .card-price { font-size: 22px; font-weight: 700; color: white; text-shadow: 0 1px 4px rgba(0,0,0,0.3); }
        .add-btn {
          background: rgba(255,255,255,0.25); color: white; border: 2px solid rgba(255,255,255,0.5);
          padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 13px;
          cursor: pointer; font-family: 'Outfit', sans-serif; backdrop-filter: blur(4px);
          transition: background 0.15s;
        }
        .add-btn:active { background: rgba(255,255,255,0.4); }

        .glitter-banner {
          margin: 16px; padding: 12px 16px;
          background: linear-gradient(135deg, #1a0a2e, #2d1069);
          border: 1px solid rgba(168,85,247,0.3); border-radius: 14px;
          font-size: 13px; color: #d8b4fe; text-align: center;
          box-shadow: 0 0 20px rgba(168,85,247,0.15);
        }

        .qr-banner {
          margin: 0 16px 16px;
          padding: 16px;
          background: linear-gradient(135deg, #0a1a2e, #0d2d4a);
          border: 1px solid rgba(59,130,246,0.3); border-radius: 14px;
          display: flex; align-items: center; gap: 14px;
        }
        .qr-text { flex: 1; }
        .qr-title { font-size: 13px; font-weight: 700; color: #60a5fa; margin-bottom: 4px; }
        .qr-sub { font-size: 11px; color: #666; }
        .qr-box { font-size: 36px; color: #60a5fa; }

        .c-footer { text-align: center; padding: 20px; color: #444; font-size: 12px; line-height: 2; }

        /* ── CART / INNER SCREENS ── */
        .inner-screen { min-height: 100vh; padding-bottom: 90px; }
        .inner-header { display: flex; align-items: center; gap: 12px; padding: 20px 16px 10px; }
        .back-btn { background: none; border: none; color: #FFE135; font-size: 14px; cursor: pointer; font-family: 'Outfit', sans-serif; }
        .inner-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; color: #FFE135; }
        .cart-body { padding: 0 16px; }
        .cart-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 0; border-bottom: 1px solid #1a1a2e; font-size: 15px;
        }
        .cart-row-right { display: flex; align-items: center; gap: 10px; }
        .cart-price { color: #FFE135; font-weight: 600; }
        .remove-btn { background: #1a1a2e; border: none; color: #f87171; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 12px; }
        .glitter-toggle { display: flex; align-items: center; gap: 10px; padding: 14px 0; border-bottom: 1px solid #1a1a2e; cursor: pointer; font-size: 14px; }
        .glitter-toggle input { accent-color: #FFE135; width: 18px; height: 18px; }
        .cart-total { display: flex; justify-content: space-between; padding: 16px 0; font-size: 22px; font-weight: 700; color: #FFE135; }
        .empty-msg { color: #555; text-align: center; padding: 32px; }

        .btn-primary {
          display: block; width: calc(100% - 32px); margin: 20px auto 0;
          padding: 16px; border: none; border-radius: 14px;
          background: linear-gradient(135deg, #FFE135, #FF9500);
          color: #1a1a1a; font-size: 18px; font-weight: 700; font-family: 'Bebas Neue', sans-serif;
          letter-spacing: 2px; cursor: pointer; transition: opacity 0.2s;
          box-shadow: 0 4px 20px rgba(255,225,53,0.3);
        }
        .btn-primary:disabled { opacity: 0.35; }

        /* ── WAITING / READY ── */
        .full-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; text-align: center; }
        .waiting-screen { background: radial-gradient(ellipse at center, #0d1a0d 0%, #06060f 70%); position: relative; overflow: hidden; }
        .waiting-glow { position: absolute; width: 300px; height: 300px; background: #FFE135; border-radius: 50%; filter: blur(120px); opacity: 0.06; }
        .waiting-content { position: relative; z-index: 1; }
        .waiting-rings { position: absolute; top: 50%; left: 50%; }
        .waiting-rings div {
          position: absolute; border-radius: 50%; border: 2px solid #FFE135;
          animation: ring 2.5s ease-out infinite;
        }
        .waiting-rings div:nth-child(1) { width: 180px; height: 180px; top: -90px; left: -90px; animation-delay: 0s; }
        .waiting-rings div:nth-child(2) { width: 240px; height: 240px; top: -120px; left: -120px; animation-delay: 0.6s; }
        .waiting-rings div:nth-child(3) { width: 300px; height: 300px; top: -150px; left: -150px; animation-delay: 1.2s; }
        @keyframes ring { 0%{transform:scale(0.3);opacity:0.8} 100%{transform:scale(1.2);opacity:0} }
        .order-num-big {
          font-family: 'Bebas Neue', sans-serif; font-size: 130px; line-height: 1;
          background: linear-gradient(135deg, #FFE135, #FF9500); -webkit-background-clip: text;
          -webkit-text-fill-color: transparent; background-clip: text;
        }
        .waiting-label { font-size: 11px; letter-spacing: 3px; color: #555; margin-bottom: 16px; }
        .waiting-msg { font-size: 16px; color: #ccc; max-width: 260px; margin: 0 auto; }

        .ready-screen { background: radial-gradient(ellipse at center, #0a2010 0%, #06060f 70%); flex-direction: column; gap: 12px; }
        .ready-burst { font-size: 80px; animation: pop 0.5s cubic-bezier(0.36,0.07,0.19,0.97); }
        @keyframes pop { 0%{transform:scale(0)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
        .ready-title { font-family: 'Bebas Neue', sans-serif; font-size: 34px; letter-spacing: 2px; color: #4ade80; }
        .ready-num { font-family: 'Bebas Neue', sans-serif; font-size: 110px; color: #4ade80; line-height: 1; }
        .ready-sub { color: #888; font-size: 15px; margin-bottom: 12px; }

        /* ── OWNER ── */
        .owner-screen { min-height: 100vh; padding-bottom: 90px; background: #06060f; }
        .owner-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 24px 16px 14px;
          background: linear-gradient(180deg, #0d0d1a 0%, transparent 100%);
          border-bottom: 1px solid #1a1a2e;
        }
        .owner-brand { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 2px; color: #FFE135; }
        .owner-sub { font-size: 11px; color: #555; letter-spacing: 1px; }
        .open-toggle {
          padding: 9px 18px; border-radius: 999px; border: none;
          font-weight: 700; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; letter-spacing: 1px;
        }
        .open-toggle.on { background: rgba(74,222,128,0.15); color: #4ade80; border: 1px solid rgba(74,222,128,0.4); }
        .open-toggle.off { background: rgba(248,113,113,0.15); color: #f87171; border: 1px solid rgba(248,113,113,0.4); }

        /* WEATHER */
        .weather-card {
          background: linear-gradient(135deg, #0d1a2e, #1a0d2e);
          border: 1px solid rgba(96,165,250,0.2); border-radius: 16px;
          padding: 14px 16px; margin-bottom: 4px;
        }
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

        /* LOCATION SELECTOR */
        .loc-selector { padding: 10px 16px 6px; }
        .loc-label { font-size: 11px; color: #555; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
        .loc-pills { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .loc-pills::-webkit-scrollbar { display: none; }
        .loc-pill {
          flex-shrink: 0; padding: 6px 12px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1); background: #0f0f1a;
          color: #888; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif;
          white-space: nowrap; transition: all 0.2s;
        }
        .loc-pill.active { background: var(--loc-color); color: white; border-color: transparent; font-weight: 600; }

        /* STATS */
        .owner-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: #1a1a2e; border-top: 1px solid #1a1a2e; border-bottom: 1px solid #1a1a2e; }
        .stat-box { background: #06060f; padding: 16px 12px; text-align: center; }
        .stat-val { display: block; font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #FFE135; }
        .stat-lbl { font-size: 10px; color: #555; letter-spacing: 1px; text-transform: uppercase; }

        /* TABS */
        .owner-tabs { display: flex; border-bottom: 1px solid #1a1a2e; }
        .owner-tab {
          flex: 1; padding: 12px 6px; background: none; border: none; color: #555;
          font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif; font-weight: 500;
          border-bottom: 2px solid transparent; transition: all 0.2s; position: relative;
        }
        .owner-tab.active { color: #FFE135; border-bottom-color: #FFE135; }
        .tab-badge {
          position: absolute; top: 6px; right: 6px;
          background: #ef4444; color: white; border-radius: 999px;
          width: 16px; height: 16px; font-size: 9px;
          display: flex; align-items: center; justify-content: center;
        }

        /* ORDERS PANEL */
        .orders-panel { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
        .order-card {
          background: #0f0f1a; border: 1px solid #1a1a2e; border-radius: 14px;
          padding: 14px; display: flex; align-items: center; gap: 14px;
        }
        .order-num { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: #FFE135; min-width: 52px; text-align: center; }
        .order-info { flex: 1; }
        .order-line { font-size: 13px; color: #bbb; margin-bottom: 2px; }
        .order-price { font-size: 16px; font-weight: 700; color: #FFE135; margin-top: 6px; }
        .done-btn {
          background: linear-gradient(135deg, #22c55e, #16a34a); color: white;
          border: none; padding: 10px 14px; border-radius: 10px;
          font-weight: 700; font-size: 12px; cursor: pointer; font-family: 'Outfit', sans-serif;
          letter-spacing: 0.5px;
        }
        .empty-panel { text-align: center; padding: 48px 20px; color: #444; }
        .empty-sub { font-size: 12px; color: #333; margin-top: 6px; }

        /* HEATMAP */
        .locations-panel { padding: 12px 16px; }
        .panel-hint { font-size: 12px; color: #555; margin-bottom: 12px; }
        .heatmap { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .heatmap-row {
          display: flex; align-items: center; gap: 12px;
          background: #0f0f1a; border-radius: 12px; padding: 12px;
          border: 1px solid #1a1a2e;
        }
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

        /* AI ADVISOR */
        .advisor-panel { padding: 16px; }
        .ai-advisor {
          background: linear-gradient(135deg, #0d0d1a, #1a0d2e);
          border: 1px solid rgba(168,85,247,0.3); border-radius: 20px; padding: 20px;
          box-shadow: 0 0 40px rgba(168,85,247,0.1);
        }
        .ai-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .ai-icon { font-size: 32px; }
        .ai-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; color: #d8b4fe; }
        .ai-sub { font-size: 11px; color: #666; }
        .ai-btn {
          width: 100%; padding: 14px; border: none; border-radius: 12px;
          background: linear-gradient(135deg, #A855F7, #7C3AED);
          color: white; font-size: 15px; font-weight: 600; cursor: pointer;
          font-family: 'Outfit', sans-serif; letter-spacing: 0.5px;
          box-shadow: 0 4px 20px rgba(168,85,247,0.3); transition: opacity 0.2s;
        }
        .ai-btn:active { opacity: 0.85; }
        .ai-loading { text-align: center; padding: 20px; }
        .ai-dots { display: flex; justify-content: center; gap: 6px; margin-bottom: 10px; }
        .ai-dots span { width: 8px; height: 8px; background: #A855F7; border-radius: 50%; animation: dot 1.2s ease-in-out infinite; }
        .ai-dots span:nth-child(2) { animation-delay: 0.2s; }
        .ai-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        .ai-loading p { font-size: 13px; color: #666; }
        .ai-response { }
        .ai-response p { font-size: 14px; color: #d8b4fe; line-height: 1.7; white-space: pre-wrap; }
        .ai-refresh { margin-top: 14px; background: none; border: 1px solid rgba(168,85,247,0.3); color: #A855F7; padding: 8px 16px; border-radius: 999px; font-size: 13px; cursor: pointer; font-family: 'Outfit', sans-serif; }

        /* NAV */
        .bottom-nav {
          position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 430px;
          background: rgba(6,6,15,0.95); border-top: 1px solid #1a1a2e;
          display: flex; z-index: 100; backdrop-filter: blur(12px);
        }
        .nav-btn {
          flex: 1; padding: 14px 8px; background: none; border: none; color: #444;
          font-size: 11px; cursor: pointer; font-family: 'Outfit', sans-serif;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          transition: color 0.2s; position: relative;
        }
        .nav-btn.active { color: #FFE135; }
        .nav-btn span:first-child { font-size: 22px; }
        .pending-badge {
          position: absolute; top: 8px;
          background: #ef4444; color: white; border-radius: 999px;
          padding: 2px 6px; font-size: 10px; font-weight: 700;
        }
      `}</style>

      <div className="app-root">
        {view === "customer"
          ? <CustomerView placeOrder={placeOrder} completed={completed} isOpen={isOpen} />
          : <OwnerView
              orders={orders} completeOrder={completeOrder}
              totalToday={totalToday} totalOrders={totalOrders}
              locationStats={locationStats} sales={sales}
              isOpen={isOpen} setIsOpen={setIsOpen}
              currentLocation={currentLocation} setCurrentLocation={setCurrentLocation}
            />
        }

        <nav className="bottom-nav">
          <button className={`nav-btn ${view === "customer" ? "active" : ""}`} onClick={() => setView("customer")}>
            <span>🍋</span><span>Menu</span>
          </button>
          <button className={`nav-btn ${view === "owner" ? "active" : ""}`} onClick={() => setView("owner")} style={{ position: "relative" }}>
            <span>📊</span><span>Owner</span>
            {orders.length > 0 && <span className="pending-badge">{orders.length}</span>}
          </button>
        </nav>
      </div>
    </>
  );
}
