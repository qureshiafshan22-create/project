📊 Pulse — Real-Time Analytics Dashboard

A data-driven analytics dashboard that visualizes real-time traffic, clicks, and engagement metrics. Built with vanilla JavaScript to demonstrate efficient client-side data processing at scale — no backend required.

Live Demo · Report Bug · Request Feature


✨ Features

Real-time metrics — live traffic, clicks, engagement rate, and average session duration, updating dynamically without a page reload
Client-side data aggregation — totals, rates, and date/source-wise grouping computed on the fly using array reduction, keeping the server-side footprint at zero
Filtering — filter records by date range, traffic source, and page search, all processed instantly in the browser
Sorting — click any table column to sort the dataset in ascending or descending order
Interactive charts — traffic trend (line chart) and source-wise distribution (doughnut chart), built with Chart.js
Responsive UI — works cleanly across desktop and mobile viewports


🖥️ Tech Stack

Structure:HTML5 ,Styling:CSS3 (custom properties, CSS Grid/Flexbox),Logic:Vanilla JavaScript (ES6+),Charts:Chart.js, Fonts:Google Fonts

No frameworks, no build step, no dependencies to install — pure client-side implementation.

📁 Project Structure

├── index.html      # Page structure and layout
├── style.css       # Styling and theme
├── script.js       # Data generation, filtering, sorting, aggregation, charts
└── README.md

🚀 Getting Started

No installation needed — this is a static site.


Clone the repository


bash   git clone https://github.com/<qureshiafshan22-create>/<project>.git


Open index.html directly in your browser
or serve it locally for a cleaner experience:


bash   npx serve .

⚙️ How It Works


Data: The dashboard generates a mock dataset client-side (simulating traffic/clicks/engagement records) so the project runs fully standalone. In a production setup, this layer would be replaced by an API call to a real analytics backend.
Aggregation: Filtered records are reduced into KPI totals (Array.reduce) and grouped by date/source for the charts.
Filtering & Sorting: Implemented with native Array.filter and Array.sort — no external libraries — to keep the reporting experience fast even as the dataset grows.
Live updates: A setInterval loop periodically appends new data points, simulating a live feed.


🔮 Future Improvements


Connect to a real analytics API (e.g. Google Analytics API) for live production data
Add pagination for very large datasets
Export filtered data to CSV
Add user authentication for multi-account dashboards


📄 License

This project is open source and available under the MIT License.


Built by Afshan
