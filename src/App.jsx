import { useState } from 'react'

function App() {
  // --- 1. ALL STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [groupCode, setGroupCode] = useState(null);
  const [tempCode, setTempCode] = useState('');
  
  // We use this to "remember" created codes for this session
  const [existingCodes, setExistingCodes] = useState([]); 

  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // --- 2. HELPER FUNCTIONS ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    } else {
      alert("Please enter a username");
    }
  };

  const handleCreateGroup = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGroupCode(code);
    setExistingCodes([...existingCodes, code]); // Save it to our "session database"
  };

  const handleJoinGroup = (e) => {
    e.preventDefault();
    const upperCode = tempCode.trim().toUpperCase();
    
    // Check if the code exists in our list
    if (existingCodes.includes(upperCode)) {
      setGroupCode(upperCode);
    } else {
      alert("Group Code not found! Please check the code or create a new group.");
    }
  };

  const addItem = () => {
    if (newName.trim() === '' || newCategory === '') {
      alert("Select a name and category!");
      return;
    }
    if (editingId) {
      setItems(items.map(item => item.id === editingId ? { ...item, name: newName, category: newCategory, quantity, unit } : item));
      setEditingId(null);
    } else {
      setItems([...items, { id: Date.now(), name: newName, category: newCategory, quantity, unit, purchased: false }]);
    }
    setNewName(''); setNewCategory(''); setQuantity('1'); setUnit('pieces');
  };

  const filteredItems = items.filter(item => {
    const statusMatch = filterStatus === 'all' ? true : (filterStatus === 'completed' ? item.purchased : !item.purchased);
    const categoryMatch = filterCategory === 'all' ? true : item.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  // --- 3. VIEWS ---

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h1 style={{ color: '#4CAF50' }}>🛒 Grocery</h1>
          <p>Login to start your shared list</p>
          <input 
            type="text" placeholder="Username" 
            value={username} onChange={(e) => setUsername(e.target.value)} 
            style={{ display: 'block', width: '250px', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' }} 
          />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  if (isLoggedIn && !groupCode) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#e3f2fd', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <h2>Hello, {username}! 👋</h2>
          <p>Choose an option to start collaborating:</p>
          
          <button onClick={handleCreateGroup} style={{ width: '100%', padding: '15px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', marginBottom: '20px', cursor: 'pointer', fontSize: '16px' }}>
            + Create New Family Group
          </button>

          <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
            <p>Already have a code? Join below:</p>
            <form onSubmit={handleJoinGroup}>
              <input 
                type="text" placeholder="6-digit Join Code" 
                maxLength="6"
                value={tempCode} onChange={(e) => setTempCode(e.target.value)} 
                style={{ width: '100%', padding: '12px', marginBottom: '10px', textAlign: 'center', borderRadius: '8px', border: '1px solid #ddd', textTransform: 'uppercase' }} 
              />
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#FF9800', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Join Group
              </button>
            </form>
          </div>
          <button onClick={() => setIsLoggedIn(false)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#333', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
        <div>👤 {username}</div>
        <div style={{ fontWeight: 'bold', color: '#FFD700' }}>🏠 Group: {groupCode}</div>
        <button onClick={() => {setGroupCode(null); setIsLoggedIn(false)}} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </div>

      <h1 style={{ textAlign: 'center' }}>🛒 Our Shared Grocery List</h1>

      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <input type="text" placeholder="Item name..." value={newName} onChange={(e) => setNewName(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', flex: 1 }} />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ padding: '10px', borderRadius: '5px' }}>
            <option value="" disabled>Select Category</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Dairy">Dairy</option>
            <option value="Snacks">Snacks</option>
            <option value="Fruits">Fruits</option>
            <option value="Meat">Meat</option>
            <option value="Household">Household</option>
            <option value="Other">Other</option>
          </select>
          <input type="number" step="0.1" style={{ width: '60px', padding: '10px' }} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ padding: '10px' }}>
            <option value="pieces">pieces</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="liters">liters</option>
            <option value="ml">ml</option>
            <option value="packets">packets</option>
          </select>
          <button onClick={addItem} style={{ background: editingId ? '#2196F3' : '#4CAF50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editingId ? 'Update' : 'Add to List'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', background: '#fff9c4', borderRadius: '10px', fontSize: '14px' }}>
        <span><strong>Filter Status:</strong> 
          <select onChange={(e) => setFilterStatus(e.target.value)} style={{ marginLeft: '5px' }}>
            <option value="all">Show All</option>
            <option value="pending">Pending</option>
            <option value="completed">Purchased</option>
          </select>
        </span>
        <span><strong>Filter Category:</strong> 
          <select onChange={(e) => setFilterCategory(e.target.value)} style={{ marginLeft: '5px' }}>
            <option value="all">All Categories</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Dairy">Dairy</option>
            <option value="Snacks">Snacks</option>
            <option value="Fruits">Fruits</option>
            <option value="Meat">Meat</option>
            <option value="Household">Household</option>
            <option value="Other">Other</option>
          </select>
        </span>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredItems.map(item => (
          <li key={item.id} style={{ display: 'flex', padding: '15px', borderBottom: '1px solid #eee', alignItems: 'center', background: item.purchased ? '#fdfdfd' : 'white' }}>
            <input type="checkbox" checked={item.purchased} onChange={() => setItems(items.map(i => i.id === item.id ? {...i, purchased: !i.purchased} : i))} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            <div style={{ flex: 1, marginLeft: '15px', textDecoration: item.purchased ? 'line-through' : 'none', color: item.purchased ? '#aaa' : '#333' }}>
              <span style={{ fontSize: '18px', fontWeight: '500' }}>{item.name}</span>
              <span style={{ marginLeft: '10px', color: '#666' }}>— {item.quantity} {item.unit}</span>
            </div>
            <span style={{ fontSize: '12px', background: '#e3f2fd', padding: '5px 12px', borderRadius: '15px', color: '#1976d2', marginRight: '15px' }}>
              {item.category}
            </span>
            <button onClick={() => {setEditingId(item.id); setNewName(item.name); setNewCategory(item.category); setQuantity(item.quantity); setUnit(item.unit);}} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✏️</button>
            <button onClick={() => setItems(items.filter(i => i.id !== item.id))} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;