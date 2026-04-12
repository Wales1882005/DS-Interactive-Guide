# DS-Interactive-Guide: Ultimate Data Structures & Algorithms 🚀

A comprehensive, single-page interactive learning platform designed to help students visualize, understand, and practice core Computer Science data structures. 

This project was developed as an interactive study tool and practical implementation for **BIT1083 / DIT1034**.

## ✨ Key Features

This application consolidates 8 major educational modules into a single, cohesive dashboard:

* **Interactive Simulators:** Push and pop elements in real-time to understand Stack (LIFO) and Queue (FIFO) access mechanisms.
* **Dynamic Graph Visualizer:** Interactive graph canvas mapped to a live Adjacency Matrix. Hovering over matrix cells highlights the corresponding directed edges.
* **Animated Tree Traversals:** Step-by-step visual animations for Breadth-First (BFT) and Depth-First (In-Order, Pre-Order, Post-Order) tree traversals.
* **Algorithm Complexity Charts:** Visual comparisons of search algorithm efficiencies (Linear vs. Binary Search) using Chart.js.
* **Expression Parsing & Spanning Trees:** Postfix evaluation walkthroughs and interactive Minimum Spanning Tree extractors.
* **Practice & Exams Module:** Built-in tracing questions and mock exams for test preparation.
* **🤖 Integrated Gemini AI Tutor:** A contextual, slide-out AI assistant powered by the `@google/genai` SDK.
  * Context-aware prompt suggestions based on the current module.
  * Real-time Markdown parsing for clean code blocks and tables.
  * **AI Graph Generator:** Type a natural language prompt (e.g., *"Alice follows Bob"*), and the AI automatically extracts the nodes/edges and draws a functional graph on the canvas!

## 🛠️ Tech Stack

* **Frontend:** HTML5, Vanilla JavaScript
* **Styling:** Tailwind CSS (via CDN for rapid prototyping)
* **Visualizations:** HTML `<canvas>` API, Chart.js
* **AI Integration:** Google Gemini API (`@google/genai` SDK)
* **Markdown Parsing:** Marked.js

## 🚀 Getting Started (Local Development)

Because this application uses advanced API requests (CORS), it **cannot** be run simply by double-clicking the HTML file. It must be hosted on a local web server.

### Prerequisites
1. A modern code editor like [VS Code](https://code.visualstudio.com/).
2. The **Live Server** extension installed in VS Code.
3. A free API key from [Google AI Studio](https://aistudio.google.com/).

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YourUsername/DS-Interactive-Guide.git](https://github.com/YourUsername/DS-Interactive-Guide.git)


## Troubleshooting & Common API Issues

If you are cloning this project or setting up your own Gemini API key, you might run into Google's strict serverless routing rules. Here are the fixes for the most common errors:

**1. Vercel logs show `TypeError: Request with GET/HEAD method cannot have body`**
* **The Cause:** The `fetch()` request is missing the POST declaration. By default, Vercel will attempt a `GET` request, which crashes instantly when trying to send chat data.
* **The Fix:** Ensure `method: 'POST'` is explicitly defined inside the fetch options block.

**2. Google API returns `404 Not Found` for the model name**
* **The Cause:** Google frequently updates model access. Your specific API key might be locked to newer generation models (like `gemini-2.5-flash`) and will reject older model names (like `gemini-1.5-flash` or `gemini-pro`).
* **The Fix:** Do not guess the model name. Open your browser and go to `https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY` to see the exact list of models your key is authorized to use, and update the backend code to match.

**3. Google API returns `503 Service Unavailable`**
* **The Cause:** Google's inference servers are experiencing a temporary high-demand spike. 
* **The Fix:** This project implements a multi-model fallback loop. If the primary model returns a 503, the backend will automatically cycle to the next available model in the `MODEL_PRIORITY` array. If all models are overloaded, wait 60 seconds and try again.