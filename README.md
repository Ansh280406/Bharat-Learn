<div align="center">
  
# 🚀 Bharat-Learn: AR Classroom Companion
**Empowering Practical Classroom Demonstrations with AI and Augmented Reality.**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-saffron.svg)](https://ai.google.dev/)

</div>

---

## 🎯 The Problem: Abstract Education at Scale
In modern classrooms, especially in developing regions, teaching abstract concepts (like heart anatomy, chemical bonds, or light refraction) relies heavily on static 2D textbook images. Purchasing physical models for every classroom is expensive and unscalable. Furthermore, practical demonstrations are often limited to a few students clustered around a teacher's desk.

## 💡 Our Innovation: The Solution
**Bharat-Learn** bridges the gap between static textbooks and expensive physical labs. It is a highly optimized, browser-based AR companion that turns any textbook page into a living, interactive 3D demonstration. 

### Key Features (Hackathon Highlights)
- **Teacher Broadcast Mode (Novelty & Scale):** Teachers can project an AR model on their primary device, and students can join via a "Broadcast Code." This solves the scalability problem, allowing practical demonstrations to reach a classroom of 50+ students instantly.
- **Interactive Physics Lab (Usability):** Not just viewing—*interacting*. The Optics/Prism AR module allows students and teachers to dynamically change light angles to see real-time refraction and spectrum dispersion. 
- **Multilingual Voice AI (Accessibility):** Integrates the Web Speech API and Gemini AI to provide dynamic, localized explanations in English, Hindi, and Gujarati, solving the language barrier in Indian education.
- **No-App-Required Architecture:** Built as a Progressive Web App (PWA) using React and Vite, it requires zero app store installations, running smoothly even on budget classroom tablets.

---

## 🛠 Tech Stack & Architecture
- **Frontend:** React + TypeScript + Vite. Chosen for blazing fast HMR and optimized production builds suitable for low-end mobile devices.
- **Styling:** Custom CSS Glassmorphism Engine. We completely avoided heavy CSS frameworks (like Tailwind or Bootstrap) to create a bespoke, premium "Deep Space Indian-Tech" aesthetic that renders efficiently without bloating the bundle.
- **AI Vision:** Google Gemini API integration for analyzing textbook pages via camera feeds and extracting context (e.g., math equations, historical battles).
- **Voice Synthesis:** Native `window.speechSynthesis` mapped to localized voices for zero-latency audio guides.

---

## 🚀 How to Run Locally

1. **Clone & Install Dependencies:**
   ```bash
   git clone https://github.com/Ansh280406/Bharat-Learn.git
   cd Bharat-Learn
   npm install
   ```

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```

3. **Explore the Features:**
   - **Login:** Use the demo credentials (Username: `demo`, Password: `0`).
   - **Sandbox Mode:** Since you may not have the specific textbook, go to the Scanner tab and click the **Sandbox Simulator** buttons to instantly launch the AR overlays (Heart, Water Cycle, Physics Lab).
   - **Broadcast Mode:** Go to the Profile tab to toggle "Classroom Host Mode" and see your unique broadcast code.

---

## 🎨 New Insights & Justifications
**Why Glassmorphism?** 
Education apps often look childish or clinical. We utilized `backdrop-filter: blur` and deep CSS gradients to create a mature, "premium" feel. This psychological shift encourages older students (Class 8-12) to take the learning material seriously.

**Why Localized Voice?**
Reading long paragraphs of text on a screen reduces retention. By utilizing the Web Speech API, we provide immediate auditory reinforcement while the student's eyes remain on the AR demonstration.

---
*Built for the Future of Indian Classrooms.* 🇮🇳
