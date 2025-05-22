# Tax Loss Harvesting Tool



## Overview

A React-based web application that helps cryptocurrency investors optimize their tax strategy through tax loss harvesting. The tool allows users to visualize their portfolio holdings, select assets with losses, and see the potential tax savings from harvesting those losses.

**Live Demo:** [https://tax-harvesting-react.vercel.app/](https://tax-harvesting-react.vercel.app/)

## Features

- **Portfolio Visualization**: View all cryptocurrency holdings with current values and unrealized gains/losses
- **Tax Impact Comparison**: Side-by-side comparison of pre-harvesting and post-harvesting tax scenarios
- **Interactive Selection**: Toggle assets to include in tax loss harvesting strategy
- **Savings Calculation**: Automatic calculation of potential tax savings
- **CSV Import**: Import your portfolio data via CSV file
- **Dark/Light Mode**: Toggle between color themes for comfortable viewing
- **Educational Resources**: Detailed "How it works" modal explaining tax loss harvesting concepts

## Technologies Used

- **React**: Frontend JavaScript library
- **CSS Modules**: For component styling
- **Papa Parse**: For CSV file parsing
- **Lodash**: Utility functions
- **Lucide React**: Icon library
- **Vercel**: Deployment platform

## Installation

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tax-harvesting-tool.git
   ```

2. Install dependencies:
   ```bash
   cd tax-harvesting-tool
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## How to Use

1. **View Your Portfolio**: The app displays sample cryptocurrency holdings with their current values and unrealized gains/losses.

2. **Select Assets**: Check the boxes next to assets you want to include in your tax loss harvesting strategy.

3. **See Tax Impact**: The "After Harvesting" section updates automatically to show the potential tax savings.

4. **Import Your Data**: Click "Upload CSV file" to import your own portfolio data (sample CSV format provided below).

5. **Learn More**: Click "How it works?" for detailed information about tax loss harvesting strategies.

## CSV Format

To import your portfolio, use a CSV file with the following columns:
- `symbol`: The cryptocurrency symbol (e.g., BTC, ETH)
- `quantity`: The amount held
- `purchase_price`: The price per unit when purchased
- `purchase_date`: The date of purchase (YYYY-MM-DD format)

Example:
```csv
symbol,quantity,purchase_price,purchase_date
BTC,0.5,45000,2022-01-15
ETH,10,3000,2021-11-20
```

## Disclaimer

This tool is for educational purposes only and does not constitute tax, legal, or financial advice. Always consult with a qualified professional before making tax-related decisions. The calculations provided are estimates and may not reflect your actual tax situation.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For questions or feedback, please contact the developer at [your-email@example.com](mailto:your-email@example.com).
