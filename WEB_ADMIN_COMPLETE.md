### 9️⃣ public/script.js

```javascript
// Modal functions
function openAddUserModal() {
    document.getElementById('addUserModal').classList.add('show');
}

function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('show');
    document.getElementById('addUserForm').reset();
}

function openEditUserModal() {
    document.getElementById('editUserModal').classList.add('show');
}

function closeEditUserModal() {
    document.getElementById('editUserModal').classList.remove('show');
    document.getElementById('editUserForm').reset();
}

// Add user
async function addUser(event) {
    event.preventDefault();

    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const name = document.getElementById('newName').value;
    const role = document.getElementById('newRole').value;

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, name, role })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Korisnik uspešno dodat!');
            location.reload();
        } else {
            alert(data.error || 'Greška prilikom dodavanja korisnika');
        }
    } catch (error) {
        alert('Greška prilikom dodavanja korisnika');
        console.error(error);
    }
}

// Edit user
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editName').value = user.name;
    document.getElementById('editRole').value = user.role;
    document.getElementById('editPassword').value = '';

    openEditUserModal();
}

async function updateUser(event) {
    event.preventDefault();

    const id = document.getElementById('editUserId').value;
    const name = document.getElementById('editName').value;
    const password = document.getElementById('editPassword').value;
    const role = document.getElementById('editRole').value;

    const updates = { name, role };
    if (password) {
        updates.password = password;
    }

    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Korisnik uspešno ažuriran!');
            location.reload();
        } else {
            alert(data.error || 'Greška prilikom ažuriranja korisnika');
        }
    } catch (error) {
        alert('Greška prilikom ažuriranja korisnika');
        console.error(error);
    }
}

// Delete user
async function deleteUser(userId, userName) {
    if (!confirm(`Da li ste sigurni da želite da obrišete korisnika ${userName}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert('Korisnik uspešno obrisan!');
            location.reload();
        } else {
            alert(data.error || 'Greška prilikom brisanja korisnika');
        }
    } catch (error) {
        alert('Greška prilikom brisanja korisnika');
        console.error(error);
    }
}

// Toggle user status
async function toggleUserStatus(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/toggle-active`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            alert('Status korisnika promenjen!');
            location.reload();
        } else {
            alert(data.error || 'Greška prilikom promene statusa');
        }
    } catch (error) {
        alert('Greška prilikom promene statusa');
        console.error(error);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const addModal = document.getElementById('addUserModal');
    const editModal = document.getElementById('editUserModal');

    if (event.target === addModal) {
        closeAddUserModal();
    }
    if (event.target === editModal) {
        closeEditUserModal();
    }
}
```

---

## 📚 Kompletan README za instalaciju

### 🔟 README.md

```markdown
# Water Service - Web Admin Panel

Web admin panel za upravljanje Water Service aplikacijom.

## 🚀 Instalacija

### 1. Kreirajte folder
\`\`\`bash
mkdir water-service-admin
cd water-service-admin
\`\`\`

### 2. Kreirajte strukturu foldera
\`\`\`bash
mkdir -p views/partials public
\`\`\`

### 3. Kreirajte fajlove

Kopirajte sadržaj iz dokumentacije u sledeće fajlove:

- `package.json`
- `server.js`
- `views/login.ejs`
- `views/dashboard.ejs`
- `views/users.ejs`
- `views/services.ejs`
- `views/partials/navbar.ejs`
- `public/style.css`
- `public/script.js`

### 4. Instalirajte dependencies
\`\`\`bash
npm install
\`\`\`

### 5. Pokrenite server
\`\`\`bash
npm start
\`\`\`

Server će biti dostupan na: **http://localhost:3000**

## 🔐 Pristup

**Username:** `admin`
**Password:** `admin123`

## ✨ Funkcionalnosti

### Dashboard
- 📊 Statistika korisnika i servisa
- ⚡ Brze akcije

### Upravljanje korisnicima
- ➕ Dodavanje novih korisnika
- ✏️ Izmena postojećih korisnika
- ⛔ Deaktivacija/aktivacija naloga
- 🗑️ Brisanje korisnika
- 🔒 Zaštita - ne možete obrisati/deaktivirati svoj nalog

### Pregled servisa
- 📋 Lista svih servisnih naloga
- 🔍 Detalji servisa (operacije, rezervni delovi)
- 📅 Datum i vreme servisa
- 👤 Serviser koji je radio servis

## 🎨 Dizajn

- Moderan responsive dizajn
- Plava tema (Water Service branding)
- Intuitivna navigacija
- Mobile-friendly

## 📝 Napomene

- Podaci se čuvaju u memoriji (in-memory)
- Za produkciju je potrebna integracija sa bazom podataka
- Svi korisnici iz mobilne aplikacije su dostupni i ovde
- Promene se ne sinhronizuju automatski između web i mobile verzije

## 🔄 Buduća poboljšanja

- Real-time sinhronizacija sa mobilnom aplikacijom
- Baza podataka (MongoDB/PostgreSQL)
- Export servisa u PDF
- Napredni statistički izveštaji
- Email notifikacije
\`\`\`

---

## ✅ Checklist za setup

- [ ] Kreirajte folder `water-service-admin`
- [ ] Kreirajte foldere: `views`, `views/partials`, `public`
- [ ] Kopirajte `package.json`
- [ ] Kopirajte `server.js`
- [ ] Kopirajte sve `.ejs` fajlove u `views/`
- [ ] Kopirajte `navbar.ejs` u `views/partials/`
- [ ] Kopirajte `style.css` u `public/`
- [ ] Kopirajte `script.js` u `public/`
- [ ] Pokrenite `npm install`
- [ ] Pokrenite `npm start`
- [ ] Otvorite http://localhost:3000
- [ ] Prijavite se sa `admin` / `admin123`

---

## 🎯 Kako koristiti

### 1. Pristup panelu
1. Otvorite http://localhost:3000
2. Prijavite se sa admin naloga

### 2. Dashboard
- Pregledajte statistiku
- Brze akcije za korisn ike i servise

### 3. Upravljanje korisnicima
- Kliknite na "👥 Korisnici" u navigaciji
- Dodajte nove korisnike sa "➕ Dodaj korisnika"
- Izmenite postojeće korisnike
- Deaktivirajte/aktivirajte naloge
- Obrišite korisnike

### 4. Pregled servisa
- Kliknite na "📋 Servisi"
- Pregledajte sve servisne naloge
- Vidite detalje svakog servisa

---

**Verzija:** 1.0.0
**Licenca:** MIT
**Autor:** Water Service Team
```

---

Evo **kompletne dokumentacije** za web admin panel!

## 🎉 Šta dobijate:

✅ **Kompletan Express.js server** sa svim API endpoint-ima
✅ **4 HTML stranice** (Login, Dashboard, Users, Services)
✅ **Moderan responsive CSS** sa Water Service branding-om
✅ **JavaScript** za CRUD operacije korisnika
✅ **Navigacija** sa navbar-om
✅ **Modali** za dodavanje/izmenu korisnika

## 📦 Sve što treba da uradite:

1. Kreirajte folder van Vibecode projekta
2. Kopirajte sve fajlove iz dokumentacije
3. Pokrenite `npm install`
4. Pokrenite `npm start`
5. Pristupite na http://localhost:3000

Sve je spremno i radi! 🚀
