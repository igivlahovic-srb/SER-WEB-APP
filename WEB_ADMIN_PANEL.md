# 🌐 Water Service - Web Admin Panel

Kompletan web admin panel za Water Service aplikaciju.

## 📁 Struktura projekta

```
water-service-admin/
├── server.js              # Node.js Express server
├── package.json           # Dependencies
├── views/                 # EJS templates
│   ├── login.ejs
│   ├── dashboard.ejs
│   ├── users.ejs
│   └── services.ejs
└── public/                # Static files
    ├── style.css
    └── script.js
```

## 🚀 Instalacija i pokretanje

```bash
# 1. Kreirajte folder
mkdir water-service-admin
cd water-service-admin

# 2. Kopirajte sve fajlove iz ovog dokumenta

# 3. Instalirajte dependencies
npm install

# 4. Pokrenite server
npm start
```

Server će biti dostupan na: **http://localhost:3000**

## 🔐 Pristupni podaci

**Username:** `admin`
**Password:** `admin123`

---

## 📄 Fajlovi

### 1️⃣ package.json

\`\`\`json
{
  "name": "water-service-admin-panel",
  "version": "1.0.0",
  "description": "Web admin panel for Water Service App",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "ejs": "^3.1.9"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
\`\`\`

### 2️⃣ server.js

\`\`\`javascript
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// In-memory database (matching mobile app structure)
let users = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    name: "Administrator",
    role: "super_user",
    isActive: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: "2",
    username: "marko",
    password: "marko123",
    name: "Marko Petrović",
    role: "technician",
    isActive: true,
    createdAt: new Date("2024-01-15")
  },
  {
    id: "3",
    username: "jovan",
    password: "jovan123",
    name: "Jovan Nikolić",
    role: "technician",
    isActive: true,
    createdAt: new Date("2024-02-01")
  }
];

let serviceTickets = [];
let currentSession = null;

// Routes
app.get('/', (req, res) => {
  if (!currentSession) {
    return res.redirect('/login');
  }

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    inactiveUsers: users.filter(u => !u.isActive).length,
    totalTickets: serviceTickets.length,
    activeTickets: serviceTickets.filter(t => t.status === 'in_progress').length,
    completedTickets: serviceTickets.filter(t => t.status === 'completed').length
  };

  res.render('dashboard', { user: currentSession, stats });
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u =>
    u.username === username &&
    u.password === password &&
    u.role === 'super_user' &&
    u.isActive
  );

  if (user) {
    currentSession = { ...user };
    delete currentSession.password;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Neispravni pristupni podaci ili nemate admin ovlašćenja' });
  }
});

app.get('/logout', (req, res) => {
  currentSession = null;
  res.redirect('/login');
});

// User Management Routes
app.get('/users', (req, res) => {
  if (!currentSession) {
    return res.redirect('/login');
  }
  res.render('users', { users, currentUser: currentSession });
});

app.post('/api/users', (req, res) => {
  if (!currentSession) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { username, password, name, role } = req.body;

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Korisničko ime već postoji' });
  }

  const newUser = {
    id: \`\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`,
    username,
    password,
    name,
    role,
    isActive: true,
    createdAt: new Date()
  };

  users.push(newUser);
  res.json({ success: true, user: newUser });
});

app.put('/api/users/:id', (req, res) => {
  if (!currentSession) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const updates = req.body;

  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Korisnik nije pronađen' });
  }

  users[userIndex] = { ...users[userIndex], ...updates };
  res.json({ success: true, user: users[userIndex] });
});

app.delete('/api/users/:id', (req, res) => {
  if (!currentSession) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  if (id === currentSession.id) {
    return res.status(400).json({ error: 'Ne možete obrisati svoj nalog' });
  }

  users = users.filter(u => u.id !== id);
  res.json({ success: true });
});

app.post('/api/users/:id/toggle-active', (req, res) => {
  if (!currentSession) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;

  if (id === currentSession.id) {
    return res.status(400).json({ error: 'Ne možete deaktivirati svoj nalog' });
  }

  const user = users.find(u => u.id === id);
  if (user) {
    user.isActive = !user.isActive;
    res.json({ success: true, user });
  } else {
    res.status(404).json({ error: 'Korisnik nije pronađen' });
  }
});

// Service Tickets Routes
app.get('/services', (req, res) => {
  if (!currentSession) {
    return res.redirect('/login');
  }
  res.render('services', { tickets: serviceTickets, users });
});

app.get('/api/services', (req, res) => {
  if (!currentSession) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ tickets: serviceTickets });
});

// Start server
app.listen(PORT, () => {
  console.log(\`✅ Water Service Admin Panel running on http://localhost:\${PORT}\`);
  console.log(\`📱 Admin credentials: admin / admin123\`);
});
\`\`\`

---

## 🎨 Frontend fajlovi

Sledi u sledećim porukama...
