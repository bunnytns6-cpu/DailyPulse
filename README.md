# DailyPulse 🌅

DailyPulse is a modern, premium, and highly interactive daily task monitoring web dashboard designed for personal productivity. It completely replaces the traditional "to-do list" with a smart, auto-rolling, and visually dynamic focus board.

## 🚀 Features

- **Smart Daily Rollover**: Incomplete tasks automatically carry over to the next day as "Pending" to maintain accountability without manual effort.
- **Dynamic Task Aging**: Pending tasks visually escalate in urgency the longer they are ignored:
  - **1 Day Old**: Yellow/Amber outline
  - **2 Days Old**: Deep Orange (Urgent) styling
  - **3+ Days Old**: Crimson Red background and border (Critical)
- **Time Framing**: Optionally attach specific time windows (e.g., "10AM - 11AM") directly to tasks.
- **Archival Completion**: Checked-off items transition to a sleek, greyed-out, dashed-border style to visually declutter your active tasks.
- **Dynamic Weather Background**: Uses your local geolocation (via Open-Meteo API) to fetch real-time weather and sets a stunning, premium aesthetic background image (Clear Skies, Rain, Snow, Clouds) covered by an Apple-like "frosted glass" overlay.
- **Local Privacy**: 100% of your data is stored securely in your browser's `localStorage`. No databases or accounts are required.

## 🛠️ The Process of Making

DailyPulse was built with a strict focus on **Vanilla Web Technologies** (HTML5, CSS3, Vanilla JavaScript) to guarantee an ultra-fast, dependency-free experience. 

Instead of relying on heavy frameworks like React, Vite, or bulky CSS libraries like Tailwind, everything—including the complex UI states, CSS variables, glassmorphism (`backdrop-filter`) rendering, and `localStorage` algorithms—was written exactly from scratch. This guarantees exceptional performance and zero-configuration usability right out of the box.

## 💻 How to Use

Because DailyPulse is built completely dependency-free, running it is incredibly simple:

1. Clone or download this repository to your local machine:
   ```bash
   git clone https://github.com/bunnytns6-cpu/DailyPulse.git
   ```
2. Navigate into the cloned folder.
3. Double-click the `index.html` file to open it in your preferred web browser.

That's it! No `npm install`, no build steps, and no development servers required. Just open it and start tracking your day.