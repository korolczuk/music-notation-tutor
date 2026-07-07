# Zagraj z Nut! – Interactive Music Education Tool

An interactive, responsive frontend application designed to help children learn how to read musical notation, understand rhythms, and master key signatures. 

**🤖 AI-Assisted Development:** This project was developed with the strategic integration of Artificial Intelligence (AI). Large Language Models (LLMs) were utilized during the architectural planning and implementation phases to optimize musical mathematics (such as tactical value validation), accelerate layout design with CSS variables, and streamline the integration of complex SVG rendering via the VexFlow library.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Core Technologies** | HTML5, CSS3, JavaScript (Vanilla JS) |
| **Music Rendering** | VexFlow Library (via CDN) |
| **Typography** | Google Fonts ('Fredoka One', 'Nunito') |
| **Layout & Styling** | CSS Flexbox, Custom Keyframe Animations |

---

## 🧠 Core Features & Functionality

The application allows users to dynamically generate sheet music fragments based on customized parameters, offering a flexible learning environment tailored to the student's current skill level:

* **Clef Selection:** Immediate toggle between Treble (Wiolinowy) and Bass (Basowy) clefs to practice different instrument registers.
* **Versatile Game Modes:**
  * *Single Note (Pojedyncze nuty):* Displays a single random note for quick identification.
  * *Full Melody Line (Cała linia):* Generates a complete measure forming a logical, random sequence.
  * *Rhythmic Pattern (Rytmy):* Locks all notes to a single pitch, allowing the student to isolate and focus entirely on rhythm execution.
* **Time Signature Customization (Metrum):** Supports standard musical meters including 4/4, 3/4, 2/2 (2/4), and Common Time (C).
* **Rhythmic Note Values:** Toggleable options to include Whole notes (całe nuty), Half notes (półnuty), Quarter notes (ćwierćnuty), and Eighth notes (ósemki).
* **Advanced Musical Modifiers:** Optional integration of accidental signs (sharps `#`, flats `♭`), rests (pauzy), and dotted notes (nuty z kropką).
* **Smart Educational Hints (Podpowiedzi):** * Displays traditional Polish note names (e.g., *C, D, Fis, Ges, H*) directly beneath the staff.
  * For rhythmic exercises, it dynamically switches to rhythmic solfège syllables (e.g., *"Ta"*, *"Ti"*, or *"Sza"* for rests) to assist with vocalization.

---

## 🏗️ Technical Architecture & Implementation

To ensure maximum performance and zero overhead, the application bypasses heavy modern frameworks in favor of a clean, lightweight Vanilla architecture:

* **Mathematical Music Logic (`script.js`):** Features a custom algorithmic engine ensuring strict adherence to musical theory rules. When generating full measures, the engine mathematically validates note values to ensure the sum of durations precisely matches the selected time signature (e.g., preventing overflow in a 4/4 bar).
* **Dynamic Notation Rendering (VexFlow Integration):** Leverages the power of the *VexFlow* library to programmatically draw professional-grade vector (SVG) musical notation. The JavaScript layer translates randomized data arrays into crisp, scalable staves, clefs, accidentals, and beams.
* **Child-Friendly UX/UI (`style.css`):** Built with a vibrant, modern aesthetic tailored for young learners.
  * Implements **CSS Variables** for centralized theme and color palette management.
  * Utilizes **CSS Flexbox** for a fully responsive, adaptive control panel layout.
  * Incorporates lightweight custom animations (such as the `popIn` keyframe effect) to make hints feel tactile and engaging.

---

## ⚙️ How to Run

Because this is a pure, client-side frontend application, it requires no compilation, server setup, or database initializations.

1. Clone the repository to your local machine:
    ```bash
    git clone [https://github.com/korolczuk/music-notation-tutor.git](https://github.com/korolczuk/music-notation-tutor.git)
    ```

2. Navigate to the project directory:
    ```bash
    cd music-notation-tutor
    ```

3. Open the application:
    * Simply double-click the `index.html` file to open it in any modern web browser.
    * *Alternatively*, run it using a local development server extension (like Live Server in VS Code) for the best experience.

4. Set your preferred parameters and click **"🎵 Losuj Nuty! 🎵"** to begin practicing!
