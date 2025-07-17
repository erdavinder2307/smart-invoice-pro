# Smart Invoice Pro

Smart Invoice Pro is a React-based invoicing and financial dashboard application. It provides a clean, modern UI for managing products, customers, invoices, stock adjustments, and generating PDF invoices via a backend API.

## Features
- Secure login page and session management
- Dashboard with key metrics: revenue, stock summary, recent invoices, weekly and monthly stats
- Customer management: view list, search, and filter
- Product management: add/edit products, track stock, adjust inventory
- Invoice management: create, edit, list, and search invoices
- PDF export: generate invoice PDFs using the Smart Invoice Pro API
- Responsive layout with sidebar navigation

## Prerequisites
- Node.js 16+ and npm
- Backend API running and accessible (see Smart Invoice Pro API repository)

## Setup
1. Clone this repository:
   ```bash
   git clone <repo-url>
   cd smart-invoice-pro
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create environment file:
   ```bash
   cp .env.example .env
   ```
4. In `.env`, set the API base URL:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```

## Available Scripts
In the project directory, you can run:

### `npm start`
Runs the app in development mode with live reloading. Open http://localhost:3000 in your browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder. Bundles React in production mode and optimizes the build for best performance.

## Configuration
The API base URL is centralized in `src/config/api.js`. Change `REACT_APP_API_BASE_URL` in your `.env` to point to the production backend.

## Deployment
- Host the contents of the `build` folder on any static web server or CDN.
- Ensure the backend API is reachable from the deployed URL.

## Contributing
Feel free to open issues or submit pull requests for new features, bug fixes, or improvements.

## License
MIT © Smart Invoice Pro Team
