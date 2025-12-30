# Food Inventory

A modern web application that helps you manage your fridge inventory, track meal costs, and analyze your cooking and shopping habits. Built with React, TypeScript, and powered by OpenAI for intelligent receipt scanning.

## 🎯 Overview

Food Inventory is a comprehensive food management system that allows you to:
- **Track fridge items** with cost, calories, and remaining quantity
- **Calculate meal costs** by tracking ingredients used from your fridge
- **Scan receipts** using AI-powered image recognition
- **Analyze spending patterns** with interactive statistics and charts
- **Manage shopping events** and track your food purchases

All data is stored locally in your browser for privacy and security.

## ✨ Features

### 📦 Fridge Management
- View all items in your fridge with cost, calories, and percentage remaining
- Add items manually or via receipt scanning
- Edit and delete items (CRUD operations)
- Track item usage as you cook meals

### 🍳 Meal Tracking
- Create meals by selecting items from your fridge
- Calculate total meal cost and calories based on ingredients used
- Track portions cooked and portions remaining
- Reuse previous meal recipes
- Meals are immutable after creation to maintain accurate cost tracking

### 🛒 Shopping Events
- Record shopping trips with itemized lists
- Track listed prices vs. final prices (after tax and discounts)
- View shopping history and statistics
- Automatically add purchased items to your fridge

### 📊 Statistics & Analytics
- Interactive charts showing meal and shopping costs over time
- Filter by date range and granularity (day/week)
- View detailed breakdowns by hovering over data points
- Navigate directly to meals or shopping events from charts
- Currency-aware formatting based on your settings

### 🤖 AI-Powered Receipt Scanning
- Upload or take a photo of your receipt
- Automatically extract items, prices, and calories using OpenAI Vision API
- Review and edit recognized items before saving
- Supports multiple currencies and formats

### ⚙️ Settings & Data Management
- Set your preferred currency (USD, EUR, GBP, and more)
- Configure OpenAI API key for receipt scanning
- Export all data as JSON for backup
- Import data from previously exported JSON files
- Clear all data with confirmation
- **Important**: Data is stored locally - clearing browser data will delete your information

## 📱 Progressive Web App (PWA)

This app is a Progressive Web App! You can install it on your device for a native app-like experience with offline support. See [PWA.md](./docs/PWA.md) for installation instructions and details.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- OpenAI API key (optional, for receipt scanning feature)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd FoodInventory
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Testing on Mobile Devices

To test the application on your mobile device while developing locally, see [MOBILE_TESTING.md](./docs/MOBILE_TESTING.md) for detailed instructions on exposing the development server on your local network.

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## 📖 How to Use

### Adding Items to Your Fridge

#### Option 1: Manual Entry
1. Go to the **Fridge** page
2. Click **"Add Item"**
3. Enter item name, cost, and estimated calories
4. Click **"Add Item"** to save

#### Option 2: Scan Receipt (AI)
1. Go to the **Fridge** or **Shopping** page
2. Click **"Scan Receipt"**
3. If prompted, enter your OpenAI API key (get one from [OpenAI](https://platform.openai.com/api-keys))
4. Upload or take a photo of your receipt
5. Review the recognized items in the table
6. Edit any items if needed (prices, calories, names)
7. Click **"Save to Fridge"** to add items

#### Option 3: Add Shopping Event
1. Go to the **Shopping** page
2. Click **"Add Shopping Event"**
3. Add items manually with listed price, final price, and calories
4. Click **"Save"** to create the event and add items to fridge

### Cooking a Meal

1. Go to the **Cooking** page
2. Click **"Cook Meal"**
3. Choose to cook from scratch or reuse a previous meal
4. Enter a meal name
5. Select items from your fridge to use
6. Set the percentage of each item used (0-100% of what's available)
7. Set the number of portions cooked
8. Click **"Save Meal"**

The meal cost and calories are calculated automatically based on the items and percentages used. Your fridge will be updated to reflect the items consumed.

### Consuming Meal Portions

- From the **Cooking** page: Click **"Consume Portion"** on any active meal card
- From the **Meal** detail page: Click **"Consume Portion"** button

When all portions are consumed, the meal moves to the "Completed Meals" section.

### Viewing Statistics

1. Go to the **Statistics** page
2. Adjust the date range using the date picker
3. Select granularity: **Day** or **Week**
4. Choose data type: **Meals** or **Shopping Events**
5. Hover over data points to see detailed breakdowns
6. Click on items in the tooltip to navigate to their detail pages

### Managing Settings

1. Go to the **Settings** page
2. **OpenAI API Key**: Enter your API key for receipt scanning
3. **Currency**: Select your preferred currency (affects all price displays)
4. **Export Data**: Download all your data as a JSON file
5. **Import Data**: Upload a previously exported JSON file to restore data
6. **Wipe Data**: Permanently delete all data (with confirmation)

## 🛠️ Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Recharts** - Interactive charts
- **OpenAI API** - Receipt image recognition
- **Vitest** - Unit testing
- **Playwright** - End-to-end testing
- **localStorage** - Client-side data persistence

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run End-to-End Tests
```bash
npm run test:e2e
```

### Run E2E Tests with UI
```bash
npm run test:e2e:ui
```

## 📁 Project Structure

```
FoodInventory/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── services/       # Business logic and API calls
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── styles/         # Global styles
├── tests/
│   └── e2e/            # End-to-end tests
├── docs/               # Documentation
└── spec/               # Specification documents
```

## 🔒 Privacy & Data

- All data is stored **locally in your browser** using localStorage
- No data is sent to any server except OpenAI (for receipt scanning)
- Your OpenAI API key is stored locally and never shared
- You can export your data at any time for backup
- Clearing browser data will delete all your information

## ⚠️ Important Notes

- **Data Persistence**: This app uses browser localStorage. Clearing your browser data will delete all your information. Always export your data regularly for backup.
- **OpenAI API**: Receipt scanning requires a valid OpenAI API key. You'll need to provide your own key in Settings.
- **Meal Immutability**: Once a meal is created, it cannot be edited. This ensures accurate cost tracking. If you need to change a meal, delete it and create a new one.
- **Item Identification**: Items are uniquely identified by ID, not by name. This allows you to have multiple items with the same name.

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📝 License

[Add your license here]

## 🙏 Acknowledgments

- OpenAI for the Vision API
- Recharts for the charting library
- The React and TypeScript communities

---

**Happy cooking and happy tracking! 🍳📊**

