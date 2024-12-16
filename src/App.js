import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home';
import Dashboard from './components/dashboard';
import Menu from './components/menu';
import Login from './components/login';
import SignUp from './components/signup';
import Tables from './components/tables';
import Employees from './components/employees';
import AdminTables from './components/adminTables';
import MenuItems from './components/menuItems';
import Receipt from './components/receipt';
import Xreport from './components/xreport';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const PROJECT_URI = 'https://jzgrowofybjstbasfcpq.supabase.co'
const PROJECT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z3Jvd29meWJqc3RiYXNmY3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0ODYxNjcsImV4cCI6MjA0NDA2MjE2N30.VAbfV_ChT5carGQWro2eCyx5H1Dj8HXb1H-7jIQ7DcE'

const supabase = createClient(PROJECT_URI, PROJECT_ANON)



function App() {

   // Shared state to hold orders
  const [orders, setOrders] = useState([]);

  // Function to fetch orders from Supabase
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders') // Adjust the table name if necessary
      .select('*');

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data);
    }
  };

  // Fetch orders when the component mounts
  useEffect(() => {
    fetchOrders();
  }, []);

  // Function to handle adding an order
  const handleAddOrder = (order) => {
    setOrders((prevOrders) => [...prevOrders, order]);
  };


  return (
    <Router>
      <Routes>
        <Route path="/">
          <Route index element={<Login />}/>
          <Route path="signup" element={<SignUp />}/>
        </Route>
        <Route path="/app/" element={<Home />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="menu" element={<Menu onAddOrder={handleAddOrder} fetchOrders={fetchOrders} />} />
          <Route path="tables" element={<Tables />} />
          <Route path="admin-tables" element={<AdminTables />} />
          <Route path="menu-items" element={<MenuItems />} />
          <Route path="employees" element={<Employees />} />
          <Route path="report" element={<Xreport />} />
          <Route path="receipt" element={<Receipt orders={orders} />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
