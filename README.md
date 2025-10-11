# 💊 Sanjeevani – Your AI-Powered Health Companion

Sanjeevani is an intelligent medication and healthcare management platform that helps users manage medicines, compare prices, locate nearby pharmacies or hospitals, and receive AI-powered reminders and insights — all in one place.

---

## 🚀 The Problem Sanjeevani Solves

Managing health routines, remembering medicines, and finding trusted medical services can be overwhelming — especially for patients managing chronic conditions.  
Sanjeevani bridges this gap by offering:

- 💊 **Smart Reminders** – Never miss your medicines again.
- 💰 **Price Comparison** – Find the most affordable pharmacies online.
- 🏥 **Nearby Services** – Instantly locate hospitals, pharmacies, and diagnostics.
- 🤖 **AI Chatbot** – Get instant health-related assistance.
- 📄 **Health Summarizer** – Summarize long prescriptions or chat data instantly.
- 👨‍⚕️ **Profile & Analytics** – Track your routine and missed doses.

---

## ⚙️ Technologies Used

- **Frontend:** React.js, TailwindCSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Mongoose ORM)  
- **Authentication:** JWT + Cookies  
- **Real-Time Communication:** Socket.io  
- **AI Integration:** Custom AI & LSTM model  
- **APIs Used:** Google Maps API (for nearby healthcare), PharmEasy / Apollo APIs (for price comparison)

---

## 🧠 Key Features (with Screenshots)

---

### 🏠 Homepage

- Central dashboard to access all modules.
- Displays user summary, upcoming reminders, and navigation links.
- Clean, modern UI for better usability.

![Homepage](https://i.postimg.cc/Vkgb0x91/0f1944ac-493d-4b43-9be2-72f8a3bda48e.jpg)

---

### 🔐 Login Page

- Secure authentication with proper validation.
- Cookie-based sessions for smooth login persistence.
- Responsive design across devices.

![Login Page](https://i.postimg.cc/GmXHmkRK/2bfbc477-0d7a-43db-8a70-df94c21d4bee.jpg)

---

### 💰 Medicine Price Comparison

- Compare medicine prices from multiple pharmacies.
- Integrated with APIs for real-time cost and availability.
- Saves users time and money.

![Medicine Price Comparison](https://i.postimg.cc/c4mJFQvB/93e6b575-1aa3-49c7-b501-e6107d94f4f2.jpg)

---

### 💊 Manage Medicines (Add / Edit / Delete / Mark Taken or Missed)

- Add medicines with dosage, frequency, and time.
- Track daily intake — mark doses as *Taken* or *Missed*.
- AI learns from your behavior to send adaptive reminders.
- Simple table + modal interface for ease of use.

![Manage Medication](https://i.postimg.cc/yNYgBLSb/0d4c64b2-ed94-4726-9d32-40f4d4d3b5a5.jpg)


---

### 📍 Locate Nearby Pharmacies & Hospitals

- Choose based on your preference (hospital, clinic, pharmacy).
- Uses Google Maps API to show distance & directions.
- Filters available for rating and specialty.

![Nearby Pharmacy & Hospital](https://i.postimg.cc/qqWxY9bc/efd73cac-3185-461b-a131-bc4300d7b981.jpg)
![Nearby Healthcare](https://i.postimg.cc/G2yFDMhs/58b686ae-9dc5-40fd-a1d8-d3752ab9c1fc.jpg)
![Particular Medical Services](https://i.postimg.cc/fLmdyJBL/55f5c7af-335a-4832-9275-c9dbbfc28b14.jpg)
![Medical Facilities](https://i.postimg.cc/hPPJWyWj/50c882fe-08d4-43be-ba47-97b84608783c.jpg)

---

### 🤖 AI Chatbot

- Chatbot trained on medical-related data to assist users.
- Helps with dosage queries, prescription help, and health guidance.
- Learns user intent to provide personalized support.

![AI Chatbot](https://i.postimg.cc/Mpfpqgsc/896b6d7b-3f83-4f29-b33e-0ed2353af20a.jpg)

---

### 🧾 Health Summarizer

- Summarizes prescription or conversation data.
- Uses AI models for key insight extraction.
- Provides short, actionable summaries.

![Summarizer](https://i.postimg.cc/5t1dTrTG/8c450c9b-a6b1-4d00-bbfa-cb0ee211a34e.jpg)

---

### 💬 Chat History

- Stores user’s chat with the AI securely.
- Users can revisit old medical conversations anytime.

![Chat History](https://i.postimg.cc/nLzbnmcx/f02af477-7555-479f-abab-8a6adb5fdbf9.jpg)

---

### 👤 Profile Page

- User details, preferences, and reminder history.
- Simple design for profile updates and overview.

![Profile Page](https://i.postimg.cc/nLM5yt0V/21d3fb54-3b80-424f-8caa-757fc42178d1.jpg)

---

### 🧬 Predictive Reminder System (AI-LSTM Model)

- LSTM model trained on previous 7 days of user data.
- Predicts probability of missing medicine.
- Sends *extra reminders* to users who frequently skip doses.

![Model Training 1](https://i.postimg.cc/fb0C7WB6/0ecfa2ce-5cba-4c03-a1e7-9656f8fd28f0.jpg)
![Model Training 2](https://i.postimg.cc/x8FNFMCT/e0d2a9c9-0875-42d1-abbd-fc291be2b74a.jpg)

---

## ⚡ Challenges We Faced

- Difficulty in finding a reliable free AI API with robust features.  
- Implementing Socket.io for real-time updates and concurrent editing.  
- CORS and cookie issues between frontend and backend during deployment.  
- DOM-to-PDF conversion challenges (experimented with multiple libraries).  
- Creating concurrent edit lock functionality for multi-user operations.  
- Choosing the best way to upload and store stories efficiently.  
- Designing LSTM-based logic for predictive reminders.  
- Selecting correct parameters and behavior for the AI chatbot.

---

## 🔮 Future Enhancements

- Integrate wearable data (Fitbit / Smartwatch) for better tracking.  
- Voice-based medicine reminders.  
- Enhanced chatbot with multilingual medical support.  
- Community health forum for user interaction.  

---

## 💻 Project Setup

### Clone Repository
```bash
git clone https://github.com/BhaskarChhabra/Sanjeevani.git
cd Sanjeevani
