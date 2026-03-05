import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

// Set the base URL for API calls
axios.defaults.baseURL = 'http://localhost:5000/api';

function App() {
  const [skinAnalysis, setSkinAnalysis] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Mock user data for demonstration
  const [user, setUser] = useState({
    name: 'Sarah',
    skinScore: 78,
    skinType: 'combination',
    skinConcerns: ['dehydration', 'texture']
  });
  
  useEffect(() => {
    // Load data when component mounts
    fetchRoutines();
    fetchProducts();
  }, []);
  
  const fetchRoutines = async () => {
    try {
      // This would be a real API call when authentication is implemented
      setRoutines([
        {
          id: 1,
          name: 'AM Routine',
          items: [
            { id: 1, name: 'Gentle Cleanser', completed: false },
            { id: 2, name: 'Vitamin C Serum', completed: true },
            { id: 3, name: 'Moisturizer', completed: false },
            { id: 4, name: 'SPF 30', completed: false },
          ],
          completedCount: 1,
          totalCount: 4,
        },
        {
          id: 2,
          name: 'PM Routine',
          items: [
            { id: 5, name: 'Oil Cleanser', completed: false },
            { id: 6, name: 'Exfoliating Toner', completed: false },
            { id: 7, name: 'Retinol Serum', completed: false },
            { id: 8, name: 'Night Cream', completed: false },
          ],
          completedCount: 0,
          totalCount: 4,
        }
      ]);
    } catch (error) {
      console.error('Error fetching routines:', error);
    }
  };
  
  const fetchProducts = async () => {
    try {
      // This would be a real API call
      setProducts([
        { id: 1, name: 'Hydrating Serum', brand: 'Glow Labs', price: 45.99, image: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Retinol Cream', brand: 'Skin Science', price: 65.99, image: 'https://via.placeholder.com/150' },
        { id: 3, name: 'Eye Cream', brand: 'Pure Beauty', price: 35.99, image: 'https://via.placeholder.com/150' },
      ]);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  
  const toggleItemCompletion = (routineId, itemId) => {
    setRoutines(prevRoutines => 
      prevRoutines.map(routine => {
        if (routine.id === routineId) {
          const updatedItems = routine.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          );
          
          const completedCount = updatedItems.filter(item => item.completed).length;
          
          return {
            ...routine,
            items: updatedItems,
            completedCount,
          };
        }
        return routine;
      })
    );
  };
  
  return (
    <div className="App">
      <header className="App-header" style={{ background: '#4A5D5F', padding: '1rem', color: 'white' }}>
        <h1>GlowAI - Your AI Skin Care Consultant</h1>
      </header>
      
      <div className="app-container">
        <nav className="nav-tabs">
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'analysis' ? 'active' : ''}
            onClick={() => setActiveTab('analysis')}
          >
            Skin Analysis
          </button>
          <button 
            className={activeTab === 'routines' ? 'active' : ''}
            onClick={() => setActiveTab('routines')}
          >
            Routines
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
        </nav>
        
        <main className="main-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <div className="user-info">
                <h2>Welcome, {user.name}!</h2>
                <div className="skin-score">
                  <h3>Your Skin Score: <span style={{ color: '#8A9B68', fontWeight: 'bold' }}>{user.skinScore}/100</span></h3>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${user.skinScore}%`, backgroundColor: '#8A9B68', height: '10px', borderRadius: '5px' }}
                    ></div>
                  </div>
                  <p>Skin Type: {user.skinType}</p>
                  <p>Primary Concerns: {user.skinConcerns.join(', ')}</p>
                </div>
              </div>
              
              <div className="recommended-products">
                <h3>Recommended For You</h3>
                <div className="product-grid">
                  {products.map(product => (
                    <div key={product.id} className="product-card">
                      <img src={product.image} alt={product.name} />
                      <h4>{product.name}</h4>
                      <p>{product.brand}</p>
                      <p className="price">${product.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'analysis' && (
            <div className="analysis">
              <h2>Skin Analysis</h2>
              <div className="analysis-card">
                <h3>AI-Powered Skin Analysis</h3>
                <p>Upload a selfie to analyze your skin condition including hydration, oiliness, dark spots, and texture.</p>
                <button className="upload-btn">Upload Selfie for Analysis</button>
                
                <div className="analysis-results">
                  <h4>Your Analysis Results</h4>
                  <div className="metrics">
                    <div className="metric">
                      <h5>Hydration</h5>
                      <p>65%</p>
                    </div>
                    <div className="metric">
                      <h5>Oiliness</h5>
                      <p>45%</p>
                    </div>
                    <div className="metric">
                      <h5>Dark Spots</h5>
                      <p>20%</p>
                    </div>
                    <div className="metric">
                      <h5>Texture</h5>
                      <p>70%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'routines' && (
            <div className="routines">
              <h2>Your Routines</h2>
              
              {routines.map(routine => (
                <div key={routine.id} className="routine-card">
                  <h3>{routine.name}</h3>
                  <div className="progress">{routine.completedCount}/{routine.totalCount} completed</div>
                  
                  <div className="routine-items">
                    {routine.items.map(item => (
                      <div key={item.id} className="routine-item">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleItemCompletion(routine.id, item.id)}
                        />
                        <span className={item.completed ? 'completed' : ''}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'products' && (
            <div className="products">
              <h2>Shop Products</h2>
              <div className="product-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <img src={product.image} alt={product.name} />
                    <h4>{product.name}</h4>
                    <p>{product.brand}</p>
                    <p className="price">${product.price}</p>
                    <button className="add-to-cart-btn">Add to Cart</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;