import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  // 1. ALL STATES 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [groupCode, setGroupCode] = useState(null); // RESTORED
  const [tempCode, setTempCode] = useState(''); // RESTORED
  const [existingCodes, setExistingCodes] = useState([]); // RESTORED

  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pieces');
  
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [editingId, setEditingId] = useState(null); 

  //  2. FETCH ITEMS 
  useEffect(() => {
    const fetchItems = async () => {
      // Now it fetches based on Group Code instead of just Username
      // so everyone in the group sees the same list!
      if (!isLoggedIn || !groupCode) return;
      try {
        const res = await axios.get('http://localhost:5000/api/items/' + groupCode);
        setItems(res.data);
      } catch (err) {
        console.error("Cloud fetch failed:", err);
      }
    };
    fetchItems();
  }, [groupCode, isLoggedIn]);

  //  3. AUTH FUNCTIONS 
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/login', { 
        username: username.toLowerCase(), 
        password 
      });
      setIsLoggedIn(true);
    } catch (err) { alert(err.response?.data?.message || "Login failed!"); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', { 
        username: username.toLowerCase(), 
        password 
      });
      alert(res.data.message);
    } catch (err) { alert(err.response?.data?.message || "Signup failed!"); }
  };

  //  4. GROUP FUNCTIONS 
  const handleCreateGroup = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGroupCode(code);
    setExistingCodes([...existingCodes, code]); 
  };

  const handleJoinGroup = (e) => {
    e.preventDefault();
    const upperCode = tempCode.trim().toUpperCase();
    // For now, we allow any 6-digit code for testing
    if (upperCode.length === 6) setGroupCode(upperCode);
    else alert("Please enter a valid 6-digit code!");
  };

  //  5. CRUD FUNCTIONS 
  const saveItem = async () => {
    if (!newName.trim() || !newCategory) return alert("Fill all fields!");

    if (editingId) {
      try {
        const res = await axios.put(`http://localhost:5000/api/items/${editingId}`, {
          name: newName,
          category: newCategory,
          quantity: `${quantity} ${unit}`
        });
        setItems(items.map(i => i._id === editingId ? res.data : i));
        setEditingId(null);
      } catch (err) { alert("Update failed!"); }
    } else {
      try {
        const res = await axios.post('http://localhost:5000/api/items', {
          name: newName, 
          category: newCategory, 
          quantity: `${quantity} ${unit}`, 
          user: groupCode, // Store under Group Code so all members see it!
          isCompleted: false
        });
        setItems([...items, res.data]);
      } catch (err) { alert("Add failed!"); }
    }
    setNewName(''); setNewCategory(''); setQuantity('1'); setUnit('pieces');
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setNewName(item.name);
    setNewCategory(item.category);
    const parts = item.quantity.split(' ');
    setQuantity(parts[0]);
    setUnit(parts[1] || 'pieces');
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete("http://localhost:5000/api/items/" + id);
      setItems(items.filter(i => i._id !== id));
    } catch (err) { console.error("Delete failed", err); }
  };

  const toggleComplete = async (item) => {
    try {
      const res = await axios.patch("http://localhost:5000/api/items/" + item._id, { 
        isCompleted: !item.isCompleted 
      });
      setItems(items.map(i => i._id === item._id ? res.data : i));
    } catch (err) { console.error("Toggle failed", err); }
  };

  //  6. FILTER LOGIC 
  const filteredItems = items.filter(item => {
    if (filterStatus === 'completed') return item.isCompleted;
    if (filterStatus === 'pending') return !item.isCompleted;
    return true;
  });

  //  7. VIEWS 

  // PAGE 1: LOGIN/SIGNUP
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <h1 style={{ color: '#4CAF50' }}>🛒 Grocery List</h1>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ display: 'block', width: '250px', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ display: 'block', width: '250px', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleLogin} style={{ flex: 1, padding: '12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
            <button onClick={handleSignup} style={{ flex: 1, padding: '12px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Sign Up</button>
          </div>
        </div>
      </div>
    );
  }

  // PAGE 2: GROUP SELECTION 
  if (isLoggedIn && !groupCode) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#e3f2fd', fontFamily: 'sans-serif' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
          <h2>Hello, {username}! 👋</h2>
          <p>Create or join a group to share your list</p>
          <button onClick={handleCreateGroup} style={{ width: '100%', padding: '15px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', marginBottom: '20px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>+ Create New Family Group</button>
          <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
            <form onSubmit={handleJoinGroup}>
              <input type="text" placeholder="Enter 6-digit Code" maxLength="6" value={tempCode} onChange={(e) => setTempCode(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '10px', textAlign: 'center', borderRadius: '8px', border: '1px solid #ddd', textTransform: 'uppercase' }} />
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#FF9800', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Join Group</button>
            </form>
          </div>
          <button onClick={() => setIsLoggedIn(false)} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}>Logout</button>
        </div>
      </div>
    );
  }

  // PAGE 3: THE MAIN LIST
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#333', color: 'white', padding: '15px', borderRadius: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <div>👤 {username}</div>
        <div style={{ fontWeight: 'bold', color: '#FFD700' }}>🏠 Group: {groupCode}</div>
        <button onClick={() => {setGroupCode(null); setIsLoggedIn(false);}} style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      </div>

      <h1 style={{ textAlign: 'center' }}>🛒 Shared Grocery List</h1>

      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <input type="text" placeholder="Item name..." value={newName} onChange={(e) => setNewName(e.target.value)} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd', flex: 1 }} />
          <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ padding: '10px', borderRadius: '5px' }}>
            <option value="" disabled>Category</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Dairy">Dairy</option>
            <option value="Snacks">Snacks</option>
            <option value="meat">Meat</option>
            <option value="fruits">Fruits</option>
            <option value="Other">Other</option>
          </select>
          <input type="number" style={{ width: '60px', padding: '10px' }} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ padding: '10px' }}>
            <option value="pieces">pieces</option>
            <option value="kg">kg</option>
            <option value="liters">liters</option>
            <option value="packets">packets</option>
            <option value="grams">grams</option>
            <option value="ml">ml</option>
          </select>
          <button onClick={saveItem} style={{ background: editingId ? '#FF9800' : '#4CAF50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editingId ? 'Update Item' : 'Add to List'}
          </button>
          {editingId && <button onClick={() => {setEditingId(null); setNewName(''); setNewCategory('');}} style={{background: '#9e9e9e', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer'}}>Cancel</button>}
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', background: '#fff9c4', borderRadius: '8px' }}>
        <strong>Filter List: </strong>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ marginLeft: '10px', padding: '5px' }}>
          <option value="all">Show All</option>
          <option value="pending">Pending</option>
          <option value="completed">Purchased</option>
        </select>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredItems.map(item => (
          <li key={item._id} style={{ display: 'flex', padding: '15px', borderBottom: '1px solid #eee', alignItems: 'center', background: item.isCompleted ? '#fdfdfd' : 'white' }}>
            <input type="checkbox" checked={item.isCompleted} onChange={() => toggleComplete(item)} style={{ cursor: 'pointer' }} />
            <div style={{ flex: 1, marginLeft: '15px', textDecoration: item.isCompleted ? 'line-through' : 'none', color: item.isCompleted ? '#aaa' : '#333' }}>
              <span style={{ fontSize: '18px', fontWeight: '500' }}>{item.name}</span>
              <span style={{ marginLeft: '10px', color: '#666' }}>— {item.quantity}</span>
            </div>
            <button onClick={() => startEdit(item)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', marginRight: '10px' }}>✏️</button>
            <button onClick={() => deleteItem(item._id)} style={{ border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;