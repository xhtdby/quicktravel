# 🚀 Quick Reset & Test Guide

## **CRITICAL: Clear Cache First!**

The browser's Service Worker is caching old files. You MUST clear it before testing.

---

## 1️⃣ Open DevTools (F12)

---

## 2️⃣ Clear Service Worker & Cache

### **Application Tab** (Chrome/Edge):
1. Click **"Service Workers"** (left sidebar)
2. Click **"Unregister"** 
3. Click **"Storage"** (left sidebar)
4. Click **"Clear site data"** button

---

## 3️⃣ Hard Reload
Press **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)

---

## 4️⃣ Test This Route

**Input:**
- Start: `don gratton house`
- Destination: `paddington`

**Click:** "Find Best Route"

---

## ✅ SUCCESS = You See This:

### Console Output:
```
🚀 NEW ENGINE: Finding routes from "don gratton house" to "paddington"
✅ Generated 4 routes:
```

### Route Cards (NO "legacy marketing" labels!):
```
⭐ Best Route
🚴🚇 Hybrid: Bike + Rail (Santander)
26 mins · transfers: 2 · £4.65

🚇 Rail-Biased Transit
29 mins · transfers: 1 · £2.70

🚌 Bus-Biased Transit
38 mins · transfers: 1 · £1.75

🚴 Direct Bike (Santander)
42 mins · transfers: 0 · £1.95
```

---

## ❌ FAILURE = You See:

- "legacy marketing Route" labels
- "Eco Route" labels  
- "legacy fastest label" labels
- 404 errors in console

**→ Go back to Step 2, clear cache again**

---

## 🧪 Other Test Cases

All these locations now work:

| Start | Destination |
|-------|-------------|
| don gratton | paddington |
| green park | old kent road |
| whitechapel | oxford circus |
| liverpool street | bank |
| king's cross | victoria |

---

## 🆘 Still Not Working?

**Nuclear option:**

1. Close ALL browser tabs
2. DevTools → Application → Storage → **Check ALL boxes**
3. Click **"Clear site data"**
4. Close browser completely
5. Reopen, go to `localhost:8000`
6. Press Ctrl+Shift+R

---

**If you see the new route cards with emoji titles, YOU'RE DONE! 🎉**

Read `FIXES_APPLIED.md` for full details of what changed.


