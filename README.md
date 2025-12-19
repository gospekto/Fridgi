# Mobile Application Supporting Home Inventory Management Using Barcode Scanning and Product Rating Mechanism

> Mobilny system wspomagający zarządzanie domowymi zapasami z wykorzystaniem skanowania kodów kreskowych oraz mechanizmu ocen produktów

---

## 📱 Opis projektu
Celem projektu jest opracowanie oraz implementacja mobilnej aplikacji wspierającej użytkownika w zarządzaniu domowymi zapasami produktów spożywczych i codziennego użytku. System umożliwia szybkie rejestrowanie produktów znajdujących się w gospodarstwie domowym poprzez skanowanie kodów kreskowych za pomocą urządzenia mobilnego.

Aplikacja pozwala na dodawanie, usuwanie oraz przeglądanie produktów znajdujących się w wirtualnym magazynie domowym. Istotnym elementem systemu jest funkcja oceniania produktów oraz możliwość zapisywania własnych notatek i opinii dotyczących ich jakości, smaku lub przydatności. Zgromadzone oceny mogą być wykorzystane podczas zakupów — użytkownik, skanując produkt w sklepie, uzyskuje dostęp do swoich wcześniejszych opinii, co wspiera podejmowanie świadomych decyzji zakupowych.

---

## 🛠️ Technologie
### Frontend (mobile)
- React Native
- Expo
- JavaScript

### Backend
- Node.js
- Express.js
- REST API

### Baza danych
- MySQL

---

## ✨ Funkcjonalności
- 📦 Dodawanie produktów do domowych zapasów
- 🗑️ Usuwanie produktów z zapasów
- 📷 Skanowanie kodów kreskowych przy użyciu aparatu telefonu
- ⭐ Ocenianie produktów
- 📝 Dodawanie notatek i opinii do produktów
- 🛒 Podgląd opinii o produkcie podczas zakupów

---

## 🚀 Instalacja i uruchomienie

### Wymagania
- Node.js (22.12.0 recommended)
- npm
- Expo CLI
- Emulator Android / iOS lub fizyczne urządzenie mobilne

### Klonowanie repozytorium
```bash
git clone https://github.com/gospekto/Fridgi.git
cd fridgi
```

### Frontend (Expo)
```bash
cd fridgi
npm install
npx expo start
```

### Backend (Node.js)
```bash
cd backend
npm install
node index.js
```

---

## 🔧 Konfiguracja
Aplikacja backendowa wymaga pliku `.env` zawierającego m.in.:
```env
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...

JWT_SECRET=...
JWT_REFRESH_SECRET=...
PORT=...
```
W przypadku braku pliku `.env` backend odpali się z danymi przykładowymi zawartymi w config.js

---

## 📖 Przykładowe użycie
1. Uruchom aplikację mobilną na emulatorze lub telefonie
2. Zeskanuj kod kreskowy produktu
3. Dodaj produkt do zapasów domowych
4. Oceń produkt i dodaj notatkę
5. Podczas zakupów zeskanuj produkt, aby sprawdzić swoją opinię

---

## 📖 Zrzuty ekranu
<img width="313" height="676" alt="image" src="https://github.com/user-attachments/assets/ed227b4e-11f0-4543-9a22-b68349c2dd43" />
<img width="313" height="676" alt="image" src="https://github.com/user-attachments/assets/a64e6910-e07a-449d-aaaa-5a2c85d9e6fe" />
<img width="313" height="676" alt="image" src="https://github.com/user-attachments/assets/9e3acb6c-47de-42eb-b2f3-da4691c3e68e" />
<img width="313" height="676" alt="image" src="https://github.com/user-attachments/assets/e7cc6e79-d324-4586-850f-6218ecb1da3d" />
<img width="313" height="676" alt="image" src="https://github.com/user-attachments/assets/3cf93eec-1b85-4ddd-b84b-ca211d6adc5e" />
<img width="313" height="676" alt="image" src="https://github.com/user-attachments/assets/1ff65507-e0f0-484c-9a0a-b38b1c1ae236" />

---

## 👤 Autor

Autor: *MateuszBudziak*  

