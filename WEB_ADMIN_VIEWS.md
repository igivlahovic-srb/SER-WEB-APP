### 3️⃣ views/login.ejs

```html
<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prijava - Water Service Admin</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body class="login-page">
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <div class="logo-icon">💧</div>
                <h1>Water Service</h1>
                <p>Admin Panel</p>
            </div>

            <% if (error) { %>
                <div class="alert alert-error">
                    <%= error %>
                </div>
            <% } %>

            <form action="/login" method="POST" class="login-form">
                <div class="form-group">
                    <label for="username">Korisničko ime</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        autofocus
                        placeholder="Unesite korisničko ime"
                    >
                </div>

                <div class="form-group">
                    <label for="password">Lozinka</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        placeholder="Unesite lozinku"
                    >
                </div>

                <button type="submit" class="btn btn-primary btn-block">
                    Prijavite se
                </button>
            </form>

            <div class="login-footer">
                <p class="demo-info">Demo pristup: admin / admin123</p>
            </div>
        </div>
    </div>
</body>
</html>
```

### 4️⃣ views/dashboard.ejs

```html
<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Water Service Admin</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <%- include('partials/navbar', { active: 'dashboard', user: user }) %>

    <div class="container">
        <div class="page-header">
            <h1>📊 Kontrolna tabla</h1>
            <p>Dobrodošli nazad, <%= user.name %>!</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card stat-primary">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                    <h3><%= stats.totalUsers %></h3>
                    <p>Ukupno korisnika</p>
                </div>
            </div>

            <div class="stat-card stat-success">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                    <h3><%= stats.activeUsers %></h3>
                    <p>Aktivni korisnici</p>
                </div>
            </div>

            <div class="stat-card stat-warning">
                <div class="stat-icon">🔧</div>
                <div class="stat-content">
                    <h3><%= stats.totalTickets %></h3>
                    <p>Ukupno servisa</p>
                </div>
            </div>

            <div class="stat-card stat-info">
                <div class="stat-icon">⏳</div>
                <div class="stat-content">
                    <h3><%= stats.activeTickets %></h3>
                    <p>Servisi u toku</p>
                </div>
            </div>

            <div class="stat-card stat-success">
                <div class="stat-icon">✔️</div>
                <div class="stat-content">
                    <h3><%= stats.completedTickets %></h3>
                    <p>Završeni servisi</p>
                </div>
            </div>

            <div class="stat-card stat-secondary">
                <div class="stat-icon">⛔</div>
                <div class="stat-content">
                    <h3><%= stats.inactiveUsers %></h3>
                    <p>Neaktivni korisnici</p>
                </div>
            </div>
        </div>

        <div class="quick-actions">
            <h2>Brze akcije</h2>
            <div class="action-buttons">
                <a href="/users" class="btn btn-primary">
                    👥 Upravljanje korisnicima
                </a>
                <a href="/services" class="btn btn-secondary">
                    📋 Pregled servisa
                </a>
            </div>
        </div>
    </div>

    <script src="/script.js"></script>
</body>
</html>
```

### 5️⃣ views/users.ejs

```html
<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upravljanje korisnicima - Water Service Admin</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <%- include('partials/navbar', { active: 'users', user: currentUser }) %>

    <div class="container">
        <div class="page-header">
            <h1>👥 Upravljanje korisnicima</h1>
            <button class="btn btn-primary" onclick="openAddUserModal()">
                ➕ Dodaj korisnika
            </button>
        </div>

        <div class="users-grid">
            <% users.forEach(user => { %>
                <div class="user-card <%= !user.isActive ? 'inactive' : '' %>">
                    <div class="user-header">
                        <div class="user-info">
                            <h3><%= user.name %></h3>
                            <p class="username">@<%= user.username %></p>
                        </div>
                        <div class="user-badges">
                            <% if (!user.isActive) { %>
                                <span class="badge badge-inactive">Neaktivan</span>
                            <% } %>
                            <% if (user.id === currentUser.id) { %>
                                <span class="badge badge-self">Vi</span>
                            <% } %>
                        </div>
                    </div>

                    <div class="user-details">
                        <span class="badge <%= user.role === 'super_user' ? 'badge-admin' : 'badge-tech' %>">
                            <%= user.role === 'super_user' ? 'Administrator' : 'Serviser' %>
                        </span>
                        <span class="user-date">
                            <%= new Date(user.createdAt).toLocaleDateString('sr-RS') %>
                        </span>
                    </div>

                    <div class="user-actions">
                        <button
                            class="btn btn-sm btn-secondary"
                            onclick="editUser('<%= user.id %>')"
                        >
                            ✏️ Izmeni
                        </button>
                        <button
                            class="btn btn-sm <%= user.isActive ? 'btn-warning' : 'btn-success' %>"
                            onclick="toggleUserStatus('<%= user.id %>')"
                            <%= user.id === currentUser.id ? 'disabled' : '' %>
                        >
                            <%= user.isActive ? '⛔ Deaktiviraj' : '✅ Aktiviraj' %>
                        </button>
                        <button
                            class="btn btn-sm btn-danger"
                            onclick="deleteUser('<%= user.id %>', '<%= user.name %>')"
                            <%= user.id === currentUser.id ? 'disabled' : '' %>
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            <% }); %>
        </div>
    </div>

    <!-- Add User Modal -->
    <div id="addUserModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Dodaj korisnika</h2>
                <span class="close" onclick="closeAddUserModal()">&times;</span>
            </div>
            <form id="addUserForm" onsubmit="addUser(event)">
                <div class="form-group">
                    <label for="newUsername">Korisničko ime</label>
                    <input type="text" id="newUsername" required>
                </div>
                <div class="form-group">
                    <label for="newPassword">Lozinka</label>
                    <input type="password" id="newPassword" required>
                </div>
                <div class="form-group">
                    <label for="newName">Ime i prezime</label>
                    <input type="text" id="newName" required>
                </div>
                <div class="form-group">
                    <label for="newRole">Uloga</label>
                    <select id="newRole" required>
                        <option value="technician">Serviser</option>
                        <option value="super_user">Administrator</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Kreiraj korisnika</button>
            </form>
        </div>
    </div>

    <!-- Edit User Modal -->
    <div id="editUserModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>Izmeni korisnika</h2>
                <span class="close" onclick="closeEditUserModal()">&times;</span>
            </div>
            <form id="editUserForm" onsubmit="updateUser(event)">
                <input type="hidden" id="editUserId">
                <div class="form-group">
                    <label>Korisničko ime</label>
                    <input type="text" id="editUsername" disabled>
                </div>
                <div class="form-group">
                    <label for="editName">Ime i prezime</label>
                    <input type="text" id="editName" required>
                </div>
                <div class="form-group">
                    <label for="editPassword">Nova lozinka (opciono)</label>
                    <input type="password" id="editPassword" placeholder="Ostavite prazno ako ne menjate">
                </div>
                <div class="form-group">
                    <label for="editRole">Uloga</label>
                    <select id="editRole" required>
                        <option value="technician">Serviser</option>
                        <option value="super_user">Administrator</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Sačuvaj izmene</button>
            </form>
        </div>
    </div>

    <script>
        const users = <%- JSON.stringify(users) %>;
    </script>
    <script src="/script.js"></script>
</body>
</html>
```

Nastavljam sa ostalim fajlovima...
