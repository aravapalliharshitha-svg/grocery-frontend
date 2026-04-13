import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [groupCode, setGroupCode] = useState(null); 
  const [tempCode, setTempCode] = useState('');
  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('Pieces'); 
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('token');
  const config = { headers: { 'x-auth-token': token } };

  useEffect(() => {
    const fetchItems = async () => {
      if (!isLoggedIn || !groupCode) return;
      try {
        // FIXED: URL changed to Render cloud link
        const res = await axios.get(`https://grocery-api-bkjp.onrender.com/api/items/${groupCode}`, config);
        setItems(res.data);
      } catch (err) { console.error("Fetch failed", err); }
    };
    fetchItems();
  }, [isLoggedIn, groupCode]);
  
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // FIXED: URL changed to Render cloud link
      const res = await axios.post('https://grocery-api-bkjp.onrender.com/api/auth/register', { 
        name: "User", 
        email: username.toLowerCase(), 
        password 
      });
      alert(res.data.message); 
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || "Error"));
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    // FIXED: URL changed to Render cloud link
    const res = await axios.post('https://grocery-api-bkjp.onrender.com/api/auth/login', { 
      email: username.toLowerCase(), 
      password 
    });
    
    localStorage.setItem('token', res.data.token);
    setIsLoggedIn(true);

    // Keep your specific logic: save to tempCode to show in the input box
    if (res.data.groupCode) {
      setTempCode(res.data.groupCode); 
    }
    
  } catch (err) { 
    alert("Login failed! Check your credentials."); 
  }
};

  const saveGroupToProfile = async (code) => {
  try {
    const currentToken = localStorage.getItem('token');
    
    // Keeping your fresh config logic
    const freshConfig = { 
      headers: { 'x-auth-token': currentToken } 
    };

    // FIXED: URL changed from localhost to live Render cloud link
    const response = await axios.post(
      'https://grocery-api-bkjp.onrender.com/api/auth/update-group', 
      { groupCode: code }, 
      freshConfig
    );

    console.log("Server Response:", response.data);
    setGroupCode(code); 
  } catch (err) {
    console.error("Sync Error Details:", err.response?.data || err.message);
    alert("Could not sync group to your account.");
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setGroupCode(null);
  };

  const saveItem = async () => {
    if (!newName.trim() || !newCategory) return alert("Fill all fields!");
    const fullQuantity = `${quantity} ${unit}`;
    const itemData = { name: newName, category: newCategory, quantity: fullQuantity, groupCode };

    try {
      if (editingId) {
        // FIXED: URL changed for Updating an item
        const res = await axios.put(`https://grocery-api-bkjp.onrender.com/api/items/${editingId}`, itemData, config);
        setItems(items.map(i => i._id === editingId ? res.data : i));
        setEditingId(null);
      } else {
        // FIXED: URL changed for Adding a new item
        const res = await axios.post('https://grocery-api-bkjp.onrender.com/api/items', itemData, config);
        setItems([...items, res.data]);
      }
      setNewName(''); setNewCategory(''); setQuantity('1'); setUnit('Pieces');
    } catch (err) { alert("Action failed!"); }
  };

  const toggleComplete = async (item) => {
    try {
      // FIXED: URL changed to Render cloud link
      const res = await axios.patch(`https://grocery-api-bkjp.onrender.com/api/items/${item._id}`, 
        { isCompleted: !item.isCompleted }, config);
      setItems(items.map(i => i._id === item._id ? res.data : i));
    } catch (err) { console.error("Toggle failed", err); }
  };

 const startEdit = (item) => {
    setEditingId(item._id);
    setNewName(item.name);
    setNewCategory(item.category);
    const parts = item.quantity.split(' ');
    setQuantity(parts[0]);
    setUnit(parts[1] || 'Pieces');
  };

  const deleteItem = async (id) => {
    try {
      // FIXED: URL changed to Render cloud link
      await axios.delete(`https://grocery-api-bkjp.onrender.com/api/items/${id}`, config);
      setItems(items.filter(i => i._id !== id));
    } catch (err) { console.error("Delete failed", err); }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '35px 40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)' }}>
          <h1 style={{ color: '#2d3748', marginTop: '0', marginBottom: '30px', fontSize: '28px', fontWeight: '800', letterSpacing: '-1px' }}>
            WELCOME TO GROCERY LIST MANAGER 🛒
          </h1>
          <input type="text" placeholder="Email" value={username} onChange={(e) => setUsername(e.target.value)} style={{ display: 'block', width: '280px', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '16px', background: '#f7fafc' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: 'block', width: '280px', padding: '15px', marginBottom: '25px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontSize: '16px', background: '#f7fafc' }} />

          <button onClick={handleLogin} style={{ width: '100%', padding: '15px', background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 15px rgba(0, 242, 254, 0.4)' }}>Login Securely</button>
          <button onClick={handleRegister} style={{ width: '100%', padding: '15px', background: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' }}>Register New Account</button>
        </div>
      </div>
    );
  }

 // --- VIEW 2: THE GROUP GATE (ALWAYS SHOWN AFTER LOGIN) ---
  if (isLoggedIn && !groupCode) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '50px 40px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxWidth: '400px', width: '90%', backdropFilter: 'blur(10px)' }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>🏠</div>
          <h2 style={{ color: '#2d3748', fontSize: '28px', marginBottom: '10px', fontWeight: '800' }}>Group Sync</h2>
          
          <p style={{ color: '#718096', marginBottom: '25px', lineHeight: '1.6' }}>
            {tempCode ? `Saved Group: ${tempCode}. You can continue or enter a new one.` : "Start a fresh list or join an existing family group."}
          </p>
          
          <button 
            onClick={() => {
              const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
              saveGroupToProfile(newCode); 
            }} 
            style={{ width: '100%', padding: '16px', background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', color: 'white', border: 'none', borderRadius: '12px', marginBottom: '30px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0, 242, 254, 0.3)' }}
          >
            + Generate New Group
          </button>
          
          <div style={{ position: 'relative', marginBottom: '30px' }}>
            <div style={{ height: '2px', background: '#e2e8f0', width: '100%' }}></div>
            <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 15px', color: '#a0aec0', fontSize: '14px', fontWeight: 'bold' }}>OR JOIN/CONTINUE</span>
          </div>

          <form onSubmit={(e) => { 
            e.preventDefault(); 
            if(tempCode.length === 6) {
              saveGroupToProfile(tempCode.toUpperCase()); 
            } else {
              alert("Enter a 6-digit code");
            }
          }}>
            <input 
              type="text" 
              placeholder="6-DIGIT CODE" 
              maxLength="6" 
              value={tempCode} 
              onChange={(e) => setTempCode(e.target.value)} 
              style={{ width: '100%', padding: '15px', boxSizing: 'border-box', marginBottom: '15px', textAlign: 'center', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '20px', letterSpacing: '4px', outline: 'none', background: '#f7fafc', color: '#2d3748', fontWeight: 'bold' }} 
            />
            <button type="submit" style={{ width: '100%', padding: '16px', background: 'linear-gradient(to right, #f6d365 0%, #fda085 100%)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 15px rgba(253, 160, 133, 0.4)' }}>
              Confirm & Enter
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#fc8181', cursor: 'pointer', fontWeight: 'bold' }}>← Logout</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: '50px' }}>
      <div style={{ padding: '20px', maxWidth: '850px', margin: 'auto', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px 25px', borderRadius: '16px', marginBottom: '25px', alignItems: 'center', boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)' }}>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>👤 {username}</span>
          <span style={{ fontWeight: '800', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', letterSpacing: '1px' }}>CODE: {groupCode}</span>
          <div style={{ display: 'flex', gap: '10px' }}>
          {/* 1. The Switch Group Button */}
          <button 
            onClick={() => setGroupCode(null)} 
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🔄 Switch Group
          </button>

          {/* 2. Your existing Logout Button */}
          <button 
            onClick={handleLogout} 
            style={{ background: 'white', color: '#764ba2', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            Logout
          </button>
        </div>
      </div> { /* This closes the header div on line 215 */ }

        <div style={{ background: '#ffffff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '30px', border: '1px solid #edf2f7' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            
            <div style={{ flex: '2', minWidth: '220px' }}>
              <label style={{ fontSize: '13px', color: '#a0aec0', display: 'block', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Item Name</label>
              <input type="text" placeholder="What do you need?" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ width: '100%', padding: '14px', boxSizing: 'border-box', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f7fafc', outline: 'none', fontSize: '15px' }} />
            </div>
            
            <div style={{ flex: '1', minWidth: '160px' }}>
              <label style={{ fontSize: '13px', color: '#a0aec0', display: 'block', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</label>
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f7fafc', outline: 'none', fontSize: '15px' }}>
                <option value="" disabled>Select</option>
                <option value="Dairy">Dairy</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Snacks">Snacks</option>
                <option value="Meat">Meat</option>
                <option value="Household">Household</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div style={{ flex: '1', minWidth: '220px' }}>
              <label style={{ fontSize: '13px', color: '#a0aec0', display: 'block', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Quantity</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: '70px', padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f7fafc', outline: 'none', fontSize: '15px' }} />
                <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '2px solid #e2e8f0', background: '#f7fafc', outline: 'none', fontSize: '15px' }}>
                  <option value="Pieces">Pieces</option>
                  <option value="Packets">Packets</option>
                  <option value="Kilograms">Kilograms</option>
                  <option value="Grams">Grams</option>
                  <option value="Liters">Liters</option>
                  <option value="Milliliters">Milliliters</option>
                </select>
              </div>
            </div>

            <button onClick={saveItem} style={{ alignSelf: 'flex-end', background: editingId ? 'linear-gradient(to right, #f6d365 0%, #fda085 100%)' : 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)', color: editingId ? 'white' : '#2d3748', border: 'none', padding: '14px 30px', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', height: '52px', fontSize: '16px', boxShadow: editingId ? '0 4px 15px rgba(253, 160, 133, 0.4)' : '0 4px 15px rgba(67, 233, 123, 0.4)', transition: '0.2s' }}>
              {editingId ? 'UPDATE ITEM' : '+ ADD ITEM'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 10px' }}>
          <h3 style={{ color: '#4a5568', margin: 0, fontSize: '20px' }}>Your Shopping List</h3>
          <div style={{ display: 'flex', gap: '15px' }}>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', background: 'white', color: '#4a5568', fontWeight: '600', outline: 'none', cursor: 'pointer' }}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '10px 15px', borderRadius: '10px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', background: 'white', color: '#4a5568', fontWeight: '600', outline: 'none', cursor: 'pointer' }}>
              <option value="all">All Categories</option>
              <option value="Dairy">Dairy</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Snacks">Snacks</option>
              <option value="Meat">Meat</option>
              <option value="Household">Household</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items
            .filter(i => filterStatus === 'all' ? true : (filterStatus === 'completed' ? i.isCompleted : !i.isCompleted))
            .filter(i => categoryFilter === 'all' ? true : i.category === categoryFilter)
            .sort((a, b) => a.category.localeCompare(b.category))
            .map(item => (
              <li key={item._id} style={{ display: 'flex', padding: '20px', background: 'white', marginBottom: '15px', borderRadius: '16px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', alignItems: 'center', borderLeft: item.isCompleted ? '6px solid #cbd5e0' : '6px solid #667eea', transition: 'all 0.2s ease' }}>
                <input type="checkbox" checked={item.isCompleted} onChange={() => toggleComplete(item)} style={{ transform: 'scale(1.5)', cursor: 'pointer', accentColor: '#667eea' }} />
                <div style={{ flex: 1, marginLeft: '25px', textDecoration: item.isCompleted ? 'line-through' : 'none', color: item.isCompleted ? '#a0aec0' : '#2d3748' }}>
                  <strong style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>{item.name}</strong>
                  <span style={{ fontSize: '14px', color: item.isCompleted ? '#cbd5e0' : '#718096', fontWeight: '600' }}>{item.quantity}</span>
                  <span style={{ marginLeft: '15px', fontSize: '11px', background: item.isCompleted ? '#f7fafc' : '#ebf4ff', color: item.isCompleted ? '#a0aec0' : '#4299e1', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.category}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => startEdit(item)} style={{ background: '#fefcbf', color: '#d69e2e', border: 'none', width: '40px', height: '40px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>✏️</button>
                  <button onClick={() => deleteItem(item._id)} style={{ background: '#fed7d7', color: '#e53e3e', border: 'none', width: '40px', height: '40px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}>🗑️</button>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export default App;