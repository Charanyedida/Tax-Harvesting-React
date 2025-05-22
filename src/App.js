import React, { useState, useMemo, useEffect } from 'react';
import { Upload, Info, ChevronDown, ChevronRight, Moon, Sun, X, HelpCircle } from 'lucide-react';
import Papa from 'papaparse';
import _ from 'lodash';
import './App.css'; // Import the CSS file

export default function TaxLossHarvestingApp() {
  const [csvData, setCsvData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDisclaimers, setShowDisclaimers] = useState(false);
  const [selectedHoldings, setSelectedHoldings] = useState(['ETH']);
  const [showAllHoldings, setShowAllHoldings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Load theme preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('tax-harvesting-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  // Save theme preference to localStorage
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('tax-harvesting-theme', newTheme ? 'dark' : 'light');
  };

  const portfolioHoldings = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      icon: '₿',
      quantity: 0.63776,
      avgBuyPrice: 55320.15,
      currentPrice: 53800,
      totalValue: 34326.95,
      shortTermChange: -1200,
      shortTermQuantity: '0.0348 BTC',
      longTermChange: 2400,
      longTermQuantity: '0.300 BTC'
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      icon: 'Ξ',
      quantity: 5.6736,
      avgBuyPrice: 1643.05,
      currentPrice: 1600,
      totalValue: 9077.76,
      shortTermChange: -244.32,
      shortTermQuantity: '2.332 ETH',
      longTermChange: -139.73,
      longTermQuantity: '3.245 ETH'
    },
    {
      symbol: 'USDT',
      name: 'Tether',
      icon: 'T',
      quantity: 3096.54,
      avgBuyPrice: 1.01,
      currentPrice: 1.00,
      totalValue: 3096.54,
      shortTermChange: -20.12,
      shortTermQuantity: '2011.23 USDT',
      longTermChange: -9.02,
      longTermQuantity: '902.47 USDT'
    },
    {
      symbol: 'MATIC',
      name: 'Polygon',
      icon: 'Ⓜ',
      quantity: 2210,
      avgBuyPrice: 2.11,
      currentPrice: 2.00,
      totalValue: 4420.00,
      shortTermChange: -88.44,
      shortTermQuantity: '804 MATIC',
      longTermChange: -66.22,
      longTermQuantity: '602 MATIC'
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      icon: '₳',
      quantity: 1500,
      avgBuyPrice: 1.20,
      currentPrice: 1.10,
      totalValue: 1650.00,
      shortTermChange: -75.00,
      shortTermQuantity: '500 ADA',
      longTermChange: -100.00,
      longTermQuantity: '1000 ADA'
    },
    {
      symbol: 'DOT',
      name: 'Polkadot',
      icon: '●',
      quantity: 300,
      avgBuyPrice: 25.50,
      currentPrice: 24.00,
      totalValue: 7200.00,
      shortTermChange: -225.00,
      shortTermQuantity: '150 DOT',
      longTermChange: -225.00,
      longTermQuantity: '150 DOT'
    }
  ];

  // Base pre-harvesting data
  const preHarvestingData = {
    shortTerm: {
      profits: 1540,
      losses: 743,
      netCapitalGains: 797
    },
    longTerm: {
      profits: 1200,
      losses: 650,
      netCapitalGains: 550
    },
    realisedCapitalGains: 1347
  };

  // Calculate dynamic post-harvesting data based on selected holdings
  const postHarvestingData = useMemo(() => {
    const selectedLosses = portfolioHoldings
      .filter(holding => selectedHoldings.includes(holding.symbol))
      .reduce((acc, holding) => {
        const shortTermLoss = holding.shortTermChange < 0 ? Math.abs(holding.shortTermChange) : 0;
        const longTermLoss = holding.longTermChange < 0 ? Math.abs(holding.longTermChange) : 0;
        
        return {
          shortTerm: acc.shortTerm + shortTermLoss,
          longTerm: acc.longTerm + longTermLoss
        };
      }, { shortTerm: 0, longTerm: 0 });

    const newShortTermLosses = preHarvestingData.shortTerm.losses + selectedLosses.shortTerm;
    const newLongTermLosses = preHarvestingData.longTerm.losses + selectedLosses.longTerm;
    
    const newShortTermGains = preHarvestingData.shortTerm.profits - newShortTermLosses;
    const newLongTermGains = preHarvestingData.longTerm.profits - newLongTermLosses;
    
    const effectiveCapitalGains = newShortTermGains + newLongTermGains;
    const savings = Math.max(0, preHarvestingData.realisedCapitalGains - effectiveCapitalGains) * 0.35; // Assuming 35% tax rate

    return {
      shortTerm: {
        profits: preHarvestingData.shortTerm.profits,
        losses: newShortTermLosses,
        netCapitalGains: newShortTermGains
      },
      longTerm: {
        profits: preHarvestingData.longTerm.profits,
        losses: newLongTermLosses,
        netCapitalGains: newLongTermGains
      },
      effectiveCapitalGains,
      savings: Math.round(savings)
    };
  }, [selectedHoldings]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length) {
          setError("Error parsing CSV file");
          setIsLoading(false);
          return;
        }
        
        const formattedData = results.data.map(row => {
          return {
            symbol: row.symbol?.trim(),
            quantity: parseFloat(row.quantity) || 0,
            purchasePrice: parseFloat(row.purchase_price) || 0,
            purchaseDate: row.purchase_date,
          };
        }).filter(row => row.symbol && row.quantity && row.purchasePrice);
        
        setCsvData(formattedData);
        setIsLoading(false);
      },
      error: (error) => {
        setError("Failed to parse CSV file: " + error.message);
        setIsLoading(false);
      }
    });
  };

  const toggleHolding = (symbol) => {
    if (selectedHoldings.includes(symbol)) {
      setSelectedHoldings(selectedHoldings.filter(s => s !== symbol));
    } else {
      setSelectedHoldings([...selectedHoldings, symbol]);
    }
  };

  const formatCurrency = (value) => {
    const absValue = Math.abs(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(absValue);
  };

  const displayedHoldings = showAllHoldings ? portfolioHoldings : portfolioHoldings.slice(0, 4);

  // How It Works Modal Component
  const HowItWorksModal = () => {
    if (!showHowItWorks) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowHowItWorks(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">How Tax Loss Harvesting Works</h2>
            <button 
              className="modal-close"
              onClick={() => setShowHowItWorks(false)}
            >
              <X size={20} />
            </button>
          </div>
          <div className="modal-body">
            <div className="how-it-works-section">
              <h3 className="section-title">What is Tax Loss Harvesting?</h3>
              <p className="section-content">
                Tax loss harvesting is a strategy that involves selling investments at a loss to offset capital gains taxes on other investments. This can help reduce your overall tax liability while maintaining your investment portfolio's allocation.
              </p>
            </div>

            <div className="how-it-works-section">
              <h3 className="section-title">How Our Tool Works</h3>
              <p className="section-content">
                1. <strong>Review Your Holdings:</strong> The tool displays your current cryptocurrency portfolio with unrealized gains and losses.
              </p>
              <p className="section-content">
                2. <strong>Select Assets for Harvesting:</strong> Choose which assets with losses you want to sell for tax benefits.
              </p>
              <p className="section-content">
                3. <strong>See Tax Impact:</strong> View how harvesting losses will affect your overall tax situation.
              </p>
              <p className="section-content">
                4. <strong>Calculate Savings:</strong> Understand potential tax savings from the harvesting strategy.
              </p>
            </div>

            <div className="how-it-works-section">
              <h3 className="section-title">Benefits of Tax Loss Harvesting</h3>
              <ul className="benefits-list">
                <li>Offset capital gains with capital losses to reduce taxable income</li>
                <li>Lower your overall tax burden legally and strategically</li>
                <li>Maintain portfolio diversification while optimizing tax efficiency</li>
                <li>Carry forward unused losses to future tax years</li>
                <li>Maximize after-tax returns on your investments</li>
              </ul>
            </div>

            <div className="how-it-works-section">
              <h3 className="section-title">Short-term vs Long-term</h3>
              <p className="section-content">
                <strong>Short-term gains/losses:</strong> Assets held for less than one year, taxed at ordinary income rates (up to 37%).
              </p>
              <p className="section-content">
                <strong>Long-term gains/losses:</strong> Assets held for more than one year, taxed at preferential rates (0%, 15%, or 20%).
              </p>
            </div>

            <div className="warning-box">
              <div className="warning-title">⚠️ Important Considerations</div>
              <p className="warning-text">
                Be aware of the wash sale rule: You cannot claim a loss if you buy the same or substantially identical asset within 30 days before or after the sale. Always consult with a tax professional before implementing any tax strategy.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            KoinX<sup className="logo-sup">TM</sup>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Tax Harvesting</h1>
          <div className="header-controls">
            <button 
              className="theme-toggle"
              onClick={toggleTheme}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              {isDarkMode ? 'Light' : 'Dark'}
            </button>
            <button 
              onClick={() => setShowHowItWorks(true)}
              className="how-it-works-link"
            >
              <HelpCircle size={16} style={{ marginRight: '0.25rem' }} />
              How it works?
            </button>
          </div>
        </div>
        
        {/* Disclaimers */}
        <div className="card">
          <div 
            className="disclaimers-toggle"
            onClick={() => setShowDisclaimers(!showDisclaimers)}
          >
            <div className="disclaimers-header">
              <Info className="disclaimers-icon" />
              <span className="disclaimers-title">Important Notes & Disclaimers</span>
            </div>
            {showDisclaimers ? <ChevronDown className="disclaimers-icon" /> : <ChevronRight className="disclaimers-icon" />}
          </div>
          
          {showDisclaimers && (
            <div className="disclaimers-content">
              <ul className="disclaimers-list">
                <li>This tool is for educational purposes only and does not constitute tax advice.</li>
                <li>Always consult with a qualified tax professional before making investment decisions.</li>
                <li>Tax laws vary by jurisdiction and are subject to change.</li>
                <li>The wash sale rule prohibits claiming a loss on a security if a "substantially identical" security was purchased within 30 days before or after the sale.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Pre and Post Harvesting Comparison */}
        <div className="harvesting-grid">
          {/* Pre Harvesting */}
          <div className="pre-harvesting">
            <div className="harvesting-header">
              <h2>Pre Harvesting</h2>
            </div>
            <div className="harvesting-content">
              <div className="term-headers">
                <div className="term-header">Short-term</div>
                <div className="term-header">Long-term</div>
              </div>
              
              <div className="data-row">
                <div className="data-cell-left">
                  <span>Profits</span>
                  <span className="data-value profit-value">{formatCurrency(preHarvestingData.shortTerm.profits)}</span>
                </div>
                <div className="data-cell-right">
                  <span className="data-value profit-value">{formatCurrency(preHarvestingData.longTerm.profits)}</span>
                </div>
              </div>
              
              <div className="data-row">
                <div className="data-cell-left">
                  <span>Losses</span>
                  <span className="data-value loss-value">- {formatCurrency(preHarvestingData.shortTerm.losses)}</span>
                </div>
                <div className="data-cell-right">
                  <span className="data-value loss-value">- {formatCurrency(preHarvestingData.longTerm.losses)}</span>
                </div>
              </div>
              
              <div className="data-row">
                <div className="data-cell-left">
                  <span>Net Capital Gains</span>
                  <span className="data-value">{formatCurrency(preHarvestingData.shortTerm.netCapitalGains)}</span>
                </div>
                <div className="data-cell-right">
                  <span className="data-value">{formatCurrency(preHarvestingData.longTerm.netCapitalGains)}</span>
                </div>
              </div>
              
              <div className="summary-section">
                <div className="summary-row">
                  <div className="summary-label">Realised Capital Gains:</div>
                  <div className="summary-value">{formatCurrency(preHarvestingData.realisedCapitalGains)}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Post Harvesting */}
          <div className="post-harvesting">
            <div className="harvesting-header">
              <h2>After Harvesting</h2>
            </div>
            <div className="harvesting-content">
              <div className="term-headers">
                <div className="term-header">Short-term</div>
                <div className="term-header">Long-term</div>
              </div>
              
              <div className="data-row">
                <div className="data-cell-left">
                  <span>Profits</span>
                  <span className="data-value">{formatCurrency(postHarvestingData.shortTerm.profits)}</span>
                </div>
                <div className="data-cell-right">
                  <span className="data-value">{formatCurrency(postHarvestingData.longTerm.profits)}</span>
                </div>
              </div>
              
              <div className="data-row">
                <div className="data-cell-left">
                  <span>Losses</span>
                  <span className="data-value">- {formatCurrency(postHarvestingData.shortTerm.losses)}</span>
                </div>
                <div className="data-cell-right">
                  <span className="data-value">- {formatCurrency(postHarvestingData.longTerm.losses)}</span>
                </div>
              </div>
              
              <div className="data-row">
                <div className="data-cell-left">
                  <span>Net Capital Gains</span>
                  <span className="data-value">
                    {postHarvestingData.shortTerm.netCapitalGains >= 0 ? '' : '- '}
                    {formatCurrency(postHarvestingData.shortTerm.netCapitalGains)}
                  </span>
                </div>
                <div className="data-cell-right">
                  <span className="data-value">
                    {postHarvestingData.longTerm.netCapitalGains >= 0 ? '' : '- '}
                    {formatCurrency(postHarvestingData.longTerm.netCapitalGains)}
                  </span>
                </div>
              </div>
              
              <div className="summary-section">
                <div className="summary-row">
                  <div className="summary-label">Effective Capital Gains:</div>
                  <div className="summary-value">
                    {postHarvestingData.effectiveCapitalGains >= 0 ? '' : '- '}
                    {formatCurrency(postHarvestingData.effectiveCapitalGains)}
                  </div>
                </div>
                <div className="savings-highlight">
                  <span className="savings-icon">⚡</span>
                  <span>You are going to save upto ${postHarvestingData.savings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Section */}
        <div className="card">
          <div className="card-header">
            <h2>Holdings</h2>
          </div>
          
          <div className="table-container">
            <table className="holdings-table">
              <thead className="table-header">
                <tr>
                  <th></th>
                  <th>Asset <span className="table-subheader">Current Market Rate</span></th>
                  <th>Total Current Value</th>
                  <th>Short-term</th>
                  <th>Long-Term</th>
                  <th>Amount to Sell</th>
                </tr>
              </thead>
              <tbody>
                {displayedHoldings.map((holding) => (
                  <tr key={holding.symbol} className="table-row">
                    <td className="table-cell checkbox-cell">
                      <input 
                        type="checkbox" 
                        checked={selectedHoldings.includes(holding.symbol)} 
                        onChange={() => toggleHolding(holding.symbol)}
                        className="checkbox"
                      />
                    </td>
                    <td className="table-cell">
                      <div className="asset-info">
                        <div className="asset-icon">
                          {holding.icon}
                        </div>
                        <div>
                          <div className="asset-name">{holding.name}</div>
                          <div className="asset-symbol">{holding.symbol}</div>
                          <div className="asset-details">
                            {holding.quantity} {holding.symbol} 
                            <span className="asset-separator">•</span>
                            ${holding.avgBuyPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}/{holding.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell value-cell">
                      $ {holding.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td className={`table-cell value-cell ${holding.shortTermChange > 0 ? 'change-positive' : 'change-negative'}`}>
                      {holding.shortTermChange > 0 ? '+' : ''}${holding.shortTermChange.toLocaleString()}
                      <div className="change-details">{holding.shortTermQuantity}</div>
                    </td>
                    <td className={`table-cell value-cell ${holding.longTermChange > 0 ? 'change-positive' : 'change-negative'}`}>
                      {holding.longTermChange > 0 ? '+' : ''}${holding.longTermChange.toLocaleString()}
                      <div className="change-details">{holding.longTermQuantity}</div>
                    </td>
                    <td className="table-cell amount-to-sell">
                      {selectedHoldings.includes(holding.symbol) ? (
                        <span className="amount-selected">{holding.quantity} {holding.symbol}</span>
                      ) : (
                        <span className="amount-not-selected">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="view-all-container">
            <button 
              onClick={() => setShowAllHoldings(!showAllHoldings)}
              className="view-all-button"
            >
              {showAllHoldings ? 'Show less' : 'View all'}
            </button>
          </div>
        </div>
        
        {/* File Upload Section */}
        <div className="card">
          <div className="card-header">
            <h2>Import Portfolio</h2>
          </div>
          <div className="card-content">
            <label className="file-upload-label">
              <Upload className="upload-icon" />
              <span className="upload-text">Upload CSV file</span>
              <span className="upload-subtext">Supports .CSV files</span>
              <input 
                type="file" 
                accept=".csv" 
                className="file-input" 
                onChange={handleFileUpload} 
              />
            </label>
            
            {isLoading && <div className="loading-text">Processing file...</div>}
            {error && <div className="error-text">{error}</div>}
            
            {csvData.length > 0 && (
              <div className="imported-data">
                <h3 className="imported-data-title">Imported Data:</h3>
                <div className="table-container">
                  <table className="holdings-table">
                    <thead className="table-header">
                      <tr>
                        <th>Symbol</th>
                        <th>Quantity</th>
                        <th>Purchase Price</th>
                        <th>Purchase Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.map((row, index) => (
                        <tr key={index} className="table-row">
                          <td className="table-cell">{row.symbol}</td>
                          <td className="table-cell value-cell">{row.quantity}</td>
                          <td className="table-cell value-cell">${row.purchasePrice.toFixed(2)}</td>
                          <td className="table-cell">{row.purchaseDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-cancel">
            Cancel
          </button>
          <button className="btn-apply">
            Apply Tax Loss Harvesting
          </button>
        </div>
      </main>

      {/* How It Works Modal */}
      <HowItWorksModal />

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>KoinX Tax Loss Harvesting Tool - For educational purposes only</p>
          <p>This tool does not provide tax, legal, or accounting advice. Consult a professional advisor.</p>
        </div>
      </footer>
    </div>
  );
}