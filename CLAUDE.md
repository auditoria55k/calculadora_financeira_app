# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a financial pricing calculator for an AI credit-based service called "Auditor.IA". It's a standalone HTML/CSS/JavaScript application that allows users to model pricing strategies, user growth, and financial projections for a SaaS platform that charges users in credits for AI services.

## Project Structure

- `calculadora_auditor_ia.html` - Main application file (single-page HTML with embedded CSS/JS)
- `script.js` - Core application logic and calculations
- `styles.css` - Additional styling (though most styles are embedded in HTML)
- `readme_calculadora_auditor_ia.md` - Executive documentation for business parameters
- `cenarios/` - Directory containing scenario configuration files
  - `README.md` - Documentation for scenario system
  - `*.json` - Built-in scenario configurations (default, startup_conservador, crescimento_agressivo)

## Architecture

The application follows a **single-page architecture** with:

1. **Sidebar Configuration Panel** - Left panel with all input controls for business parameters
2. **Dashboard Visualization** - Right panel with charts (Chart.js) and results tables
3. **Scenario Management System** - Save/load different business configurations
4. **Real-time Calculation Engine** - Updates all metrics as parameters change

### Key Components

- **Parameter Management**: Functions like `getParameters()` collect all form inputs
- **Financial Calculations**: 
  - `calculateCosts()` - Computes per-credit costs including USD/BRL conversion and IOF
  - `calculateRevenue()` - Models subscription and one-time credit sales revenue
  - `calculateKPIs()` - Business metrics (MRR, ARR, LTV, ROI, margin, break-even, payback)
- **Growth Simulation**: `simulateGrowth()` projects user base over time
- **Visualization**: Chart.js integration for user evolution and financial trends
- **Scenario System**: JSON-based configuration save/load with localStorage persistence

## Key Business Logic

The calculator models a **credit-based AI service** with:
- Multiple subscription tiers (Free, Basic, Pro, Max)
- Pay-as-you-go credit purchases
- OpenAI API cost modeling (token costs, TTS/STT)
- User growth projections
- Churn and retention modeling
- Break-even analysis

## Development Notes

- **No Build Process**: This is a standalone HTML application - open `calculadora_auditor_ia.html` directly in browser
- **No Package Manager**: All dependencies (Chart.js, html2pdf.js) are loaded via CDN
- **Local Development**: Simply open the HTML file in any modern browser
- **Testing**: Manual testing only - modify parameters and verify calculations match expected business logic

## Common Tasks

- **Run the application**: Open `calculadora_auditor_ia.html` in a web browser
- **Modify business logic**: Edit calculation functions in `script.js`
- **Update UI**: Modify the embedded CSS in the HTML file or add to `styles.css`
- **Add new scenarios**: Create new JSON files in `cenarios/` directory
- **Debug calculations**: Use browser dev tools console to inspect calculation intermediate values

## Important Implementation Details

- The application uses **localStorage** for scenario persistence
- **Chart.js** is used for data visualization with dark theme styling
- **Real-time updates** are implemented with debounced input listeners
- **Responsive design** with resizable sidebar and mobile-friendly layout
- **Export functionality** includes PDF generation using html2pdf.js library

## Scenario System

The app includes a sophisticated scenario management system that allows users to:
- Save current configurations as named scenarios
- Load built-in or custom scenarios
- Set default configurations that auto-load
- Export/import scenarios as JSON files

Built-in scenarios include conservative, aggressive, and default growth models.