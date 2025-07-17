# Environment Configuration for Smart Invoice Pro

This React application is configured to use different API endpoints based on the environment:

## Development Environment
- Uses `http://127.0.0.1:5000` as the API base URL
- Configured in `.env` file
- Used when running `npm start`

## Production Environment
- Uses `https://smartinvoicepro-e8ekfnf4b4abfvhx.centralindia-01.azurewebsites.net` as the API base URL
- Configured in `.env.production` file
- Used when running `npm run build`

## How it Works

1. **API Configuration**: The `/src/config/api.js` file centralizes API URL management
2. **Environment Variables**: React automatically loads the appropriate `.env` file based on the build mode
3. **Dynamic URLs**: All API calls use the `createApiUrl()` helper function to construct full URLs

## Files Updated

- **Services**: All service files (`invoiceService.js`, `productService.js`, `authService.js`) now use centralized API config
- **Components**: All components with direct API calls now use `createApiUrl()` helper
  - `AddEditInvoice.jsx` - Invoice creation/editing API calls
  - `InvoiceList.jsx` - Invoice listing and PDF generation API calls
  - `CustomerList.jsx` - Customer CRUD operations API calls
  - `StockAdjustment.jsx` - Stock management API calls
  - `ProductStockSummary.jsx` - Product stock summary API calls
  - `AddEditProduct.jsx` - Product creation/editing API calls
- **Pages**: All pages with direct API calls now use `createApiUrl()` helper
  - `Dashboard.jsx` - Dashboard summary, low stock, and revenue chart API calls
- **Environment Files**: Added `.env` and `.env.production` for different environments

## Usage

- **Development**: `npm start` - Uses local backend at `http://127.0.0.1:5000`
- **Production**: `npm run build` - Uses Azure backend at `https://smartinvoicepro-e8ekfnf4b4abfvhx.centralindia-01.azurewebsites.net`

The application will automatically use the correct API endpoint based on the build environment.
