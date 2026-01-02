import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import Fridge from './pages/Fridge';
import FridgeItem from './pages/FridgeItem';
import Cooking from './pages/Cooking';
import Meal from './pages/Meal';
import Shopping from './pages/Shopping';
import ShoppingEvent from './pages/ShoppingEvent';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Fridge />} />
              <Route path="/fridge/item/:id" element={<FridgeItem />} />
              <Route path="/cooking" element={<Cooking />} />
              <Route path="/cooking/meal/:id" element={<Meal />} />
              <Route path="/shopping" element={<Shopping />} />
              <Route path="/shopping/event/:id" element={<ShoppingEvent />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

