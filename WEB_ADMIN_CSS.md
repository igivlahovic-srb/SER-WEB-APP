### 6️⃣ views/services.ejs

```html
<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Servisi - Water Service Admin</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <%- include('partials/navbar', { active: 'services', user }) %>

    <div class="container">
        <div class="page-header">
            <h1>📋 Pregled servisa</h1>
        </div>

        <% if (tickets.length === 0) { %>
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>Nema servisnih naloga</h3>
                <p>Još uvek nema evidentiranih servisa u sistemu.</p>
            </div>
        <% } else { %>
            <div class="tickets-grid">
                <% tickets.forEach(ticket => { %>
                    <div class="ticket-card">
                        <div class="ticket-header">
                            <h3>🔧 <%= ticket.deviceCode %></h3>
                            <span class="badge <%= ticket.status === 'completed' ? 'badge-success' : 'badge-warning' %>">
                                <%= ticket.status === 'completed' ? 'Završeno' : 'U toku' %>
                            </span>
                        </div>

                        <div class="ticket-info">
                            <p><strong>Serviser:</strong> <%= ticket.technicianName %></p>
                            <p><strong>Početak:</strong> <%= new Date(ticket.startTime).toLocaleString('sr-RS') %></p>
                            <% if (ticket.endTime) { %>
                                <p><strong>Završetak:</strong> <%= new Date(ticket.endTime).toLocaleString('sr-RS') %></p>
                            <% } %>
                        </div>

                        <% if (ticket.operations && ticket.operations.length > 0) { %>
                            <div class="ticket-section">
                                <h4>Operacije:</h4>
                                <ul class="operation-list">
                                    <% ticket.operations.forEach(op => { %>
                                        <li>✓ <%= op.name %></li>
                                    <% }); %>
                                </ul>
                            </div>
                        <% } %>

                        <% if (ticket.spareParts && ticket.spareParts.length > 0) { %>
                            <div class="ticket-section">
                                <h4>Rezervni delovi:</h4>
                                <ul class="parts-list">
                                    <% ticket.spareParts.forEach(part => { %>
                                        <li><%= part.quantity %>x <%= part.name %></li>
                                    <% }); %>
                                </ul>
                            </div>
                        <% } %>
                    </div>
                <% }); %>
            </div>
        <% } %>
    </div>

    <script src="/script.js"></script>
</body>
</html>
```

### 7️⃣ views/partials/navbar.ejs

```html
<nav class="navbar">
    <div class="nav-container">
        <div class="nav-brand">
            <span class="logo">💧</span>
            <span class="brand-text">Water Service Admin</span>
        </div>

        <div class="nav-menu">
            <a href="/" class="nav-link <%= active === 'dashboard' ? 'active' : '' %>">
                📊 Dashboard
            </a>
            <a href="/users" class="nav-link <%= active === 'users' ? 'active' : '' %>">
                👥 Korisnici
            </a>
            <a href="/services" class="nav-link <%= active === 'services' ? 'active' : '' %>">
                📋 Servisi
            </a>
        </div>

        <div class="nav-user">
            <span class="user-name"><%= user.name %></span>
            <a href="/logout" class="btn btn-sm btn-outline">Odjava</a>
        </div>
    </div>
</nav>
```

---

## 🎨 CSS Styling

### 8️⃣ public/style.css

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background-color: #f3f4f6;
    color: #1f2937;
    line-height: 1.6;
}

/* Navbar */
.navbar {
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    color: white;
    padding: 1rem 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
}

.logo {
    font-size: 1.5rem;
}

.nav-menu {
    display: flex;
    gap: 1.5rem;
}

.nav-link {
    color: rgba(255, 255, 255, 0.9);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    transition: all 0.2s;
}

.nav-link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.nav-link.active {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    font-weight: 600;
}

.nav-user {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-name {
    font-weight: 500;
}

/* Container */
.container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 2rem;
}

/* Page Header */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 2rem;
    color: #1f2937;
}

.page-header p {
    color: #6b7280;
    margin-top: 0.25rem;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
}

.stat-icon {
    font-size: 2.5rem;
}

.stat-content h3 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
}

.stat-content p {
    color: #6b7280;
    font-size: 0.875rem;
}

.stat-primary { border-left: 4px solid #3b82f6; }
.stat-success { border-left: 4px solid #10b981; }
.stat-warning { border-left: 4px solid #f59e0b; }
.stat-info { border-left: 4px solid #06b6d4; }
.stat-secondary { border-left: 4px solid #6b7280; }

/* Buttons */
.btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
}

.btn-secondary {
    background: #6b7280;
    color: white;
}

.btn-secondary:hover {
    background: #4b5563;
}

.btn-success {
    background: #10b981;
    color: white;
}

.btn-success:hover {
    background: #059669;
}

.btn-warning {
    background: #f59e0b;
    color: white;
}

.btn-warning:hover {
    background: #d97706;
}

.btn-danger {
    background: #ef4444;
    color: white;
}

.btn-danger:hover {
    background: #dc2626;
}

.btn-outline {
    background: transparent;
    border: 2px solid white;
    color: white;
}

.btn-outline:hover {
    background: white;
    color: #1e40af;
}

.btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

.btn-block {
    display: block;
    width: 100%;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Quick Actions */
.quick-actions {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quick-actions h2 {
    margin-bottom: 1rem;
}

.action-buttons {
    display: flex;
    gap: 1rem;
}

/* Users Grid */
.users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
}

.user-card {
    background: white;
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-card.inactive {
    opacity: 0.6;
}

.user-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 1rem;
}

.user-info h3 {
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
}

.username {
    color: #6b7280;
    font-size: 0.875rem;
}

.user-badges {
    display: flex;
    gap: 0.5rem;
}

.user-details {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 1rem;
}

.user-date {
    color: #9ca3af;
    font-size: 0.875rem;
}

.user-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
}

/* Badges */
.badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
}

.badge-admin {
    background: #ede9fe;
    color: #7c3aed;
}

.badge-tech {
    background: #dbeafe;
    color: #2563eb;
}

.badge-inactive {
    background: #f3f4f6;
    color: #6b7280;
}

.badge-self {
    background: #dbeafe;
    color: #2563eb;
}

.badge-success {
    background: #d1fae5;
    color: #065f46;
}

.badge-warning {
    background: #fef3c7;
    color: #92400e;
}

/* Tickets Grid */
.tickets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1.5rem;
}

.ticket-card {
    background: white;
    padding: 1.5rem;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.ticket-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.ticket-info {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
}

.ticket-info p {
    margin-bottom: 0.5rem;
    color: #4b5563;
}

.ticket-section {
    margin-top: 1rem;
}

.ticket-section h4 {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.operation-list,
.parts-list {
    list-style: none;
}

.operation-list li,
.parts-list li {
    padding: 0.5rem 0;
    color: #374151;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.empty-state h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.empty-state p {
    color: #6b7280;
}

/* Login Page */
.login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
}

.login-container {
    width: 100%;
    max-width: 400px;
    padding: 2rem;
}

.login-card {
    background: white;
    padding: 2rem;
    border-radius: 1.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.login-header {
    text-align: center;
    margin-bottom: 2rem;
}

.logo-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.login-header h1 {
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
}

.login-header p {
    color: #6b7280;
}

.login-form {
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #374151;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #3b82f6;
}

.login-footer {
    text-align: center;
}

.demo-info {
    color: #6b7280;
    font-size: 0.875rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.5rem;
}

.alert {
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
}

.alert-error {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fecaca;
}

/* Modal */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    overflow: auto;
}

.modal.show {
    display: block;
}

.modal-content {
    background: white;
    margin: 5% auto;
    padding: 0;
    border-radius: 1rem;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
    font-size: 1.5rem;
}

.close {
    font-size: 2rem;
    font-weight: 700;
    color: #9ca3af;
    cursor: pointer;
    transition: color 0.2s;
}

.close:hover {
    color: #1f2937;
}

.modal-content form {
    padding: 1.5rem;
}
```

Nastavljam sa JavaScript fajlom...
