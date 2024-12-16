import React, { useEffect, useState } from "react";
import { TextField, Accordion, AccordionSummary,
  AccordionDetails, Typography, Stack, Box,
  InputAdornment, IconButton,
  Card, CardContent, CardMedia, CardActionArea, CardActions
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { createClient } from '@supabase/supabase-js';
import Swal from 'sweetalert2';
import logo from '../assets/logo.jpeg'
import {
    ArrowDownward as ArrowDownwardIcon,
    Search as SearchIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';

const PROJECT_URI = 'https://jzgrowofybjstbasfcpq.supabase.co'
const PROJECT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z3Jvd29meWJqc3RiYXNmY3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0ODYxNjcsImV4cCI6MjA0NDA2MjE2N30.VAbfV_ChT5carGQWro2eCyx5H1Dj8HXb1H-7jIQ7DcE'

const supabase = createClient(PROJECT_URI, PROJECT_ANON)

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

function getCurrentDateTime() {
  const now = new Date();

  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2,   
 '0');
  const year = now.getFullYear().toString().slice(-2);
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2,   
 '0');

  const formattedDateTime = `${day}-${month}-${year}, ${hours}:${minutes}`;
  return formattedDateTime;   
}

const Menu = ({onAddOrder})=> {
  const [items, setItems] = useState(null);
  const [item, setItem] = useState([]);
  const [orders, setOrders] = useState([]);
  const [mainOrders, setMainOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [mainMeal, setMainMeal] = useState("outlined");
  const [desserts, setDesserts] = useState("outlined");
  const [soups, setSoups] = useState("outlined");
  const [traditional, setTraditional] = useState("outlined");
  const [extras, setExtras] = useState("outlined");
  const [drinks, setDrinks] = useState([]);
  const [starters, setStarters] = useState("outlined");
  const [all, setAll] = useState('contained');
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(false);
  const [quantity, setQuantity] = useState();
  const [menuQuantity, setMenuQuantity] = useState();
  const [note, setNote] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [searcher, setSearcher] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [filteredDrinks, setFilteredDrinks] = useState([]);
  const [key, setKey] = useState(0);
  const [totalQty, setTotalQty] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [price, setPrice] = useState(0);
  const [tableNo, setTableNo] = useState(0);
  const [cash, setCash] = useState(0);
  const [card, setCard] = useState(0);
  const [balance, setBalance] = useState(0);
  const [total, setTotal] = useState(0);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false); // State for payment dialog
  const [paymentType, setPaymentType] = useState('');
  const [openCard, setOpenCard] = useState(false);
  const [change, setChange] = useState(0); // initial change
  const [order, setOrder] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false); // Track printing status
  const [isPaymentMade, setIsPaymentMade] = useState(false); // Track payment status
  const [table, setTable] = useState('');
  const [waiterName, setWaiterName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#fff');
  const [color, setColor] = useState('#000');
  const [shouldPoll, setShouldPoll] = useState(true);
  const [selectedTableOrders, setSelectedTableOrders] = useState([])

  const handleOpenPaymentDialog = () => setOpenPaymentDialog(true);
  const handleClosePaymentDialog = () => setOpenPaymentDialog(false);
  const handleCloseCard = () => setOpenCard(false);

  useEffect(() => {
    const controller = new AbortController();
    var isMounted = true

    const getMenuItems = async ()=> {
      try {
        let { data: menuItems, error } = await supabase
        .from('menuItems')
        .select('*')
                  
        isMounted && setItems(menuItems)
        localStorage.setItem('meals', JSON.stringify(menuItems))
      
      } catch (error) {
        Swal.fire({ title: "Failed", text: 'Menu could not be fetched', icon: "error" })
      }
    }

    const getDrinks = async ()=> {
      try {
        let { data: drinks, error } = await supabase
          .from('drinks')
          .select('*')
                  
        isMounted && setDrinks(drinks)
        localStorage.setItem('drinks', JSON.stringify(drinks))
        
      } catch (error) {
        Swal.fire({ title: "Failed", text: 'Drinks could not be fetched', icon: "error" })
      }
    }

    const getOccupiedTables = async ()=> {
      try {
        let { data: tables, error } = await supabase
        .from('tables')
        .select(`*, assign(*)`)
        .eq('status', 'occupied')
        .order('id', { ascending: true }); 
                
        isMounted && setTables(tables)
        localStorage.setItem('tables', JSON.stringify(tables));
        
      } catch (error) {
        console.log(error)
      }
    }

    const getOrders = async ()=> {
      try {
        let { data: ordersItems, error } = await supabase
        .from('ordersItems')
        .select(`*, menuItems(*), drinks(*), orders!inner(*, waiter(*), table(*))`)
        .eq('orders.status', 'pending') // Filter orders by status
        .order('id', { ascending: true }); 
                
        isMounted && setOrders(ordersItems)
        console.log(ordersItems)

      } catch (error) {
        console.log(error)
      }
    } 

    const getAllOrders = async ()=> {
      try {
        let { data: orders, error } = await supabase
        .from('orders')
        .select(`*, waiter(*), table(*)`)
        .eq('status', 'pending')

        isMounted && setMainOrders(orders)
        
      } catch (error) {
        console.log(error)
      }
    }
    
    getAllOrders();
    getOrders()
    getOccupiedTables();
    getDrinks()
    getMenuItems();

    return ()=> {
        isMounted = false
        controller.abort();
    }
  }, [])

  const handleOpen = (meal) => {
    setOpen(true);
    //console.log(meal)
    setItem(meal)
  
  };
  
  const getOccupiedTables = async ()=> {
    try {
        let { data: tables, error } = await supabase
        .from('tables')
        .select('*')
        .eq('status', 'occupied')
                
        setTables(tables)
        
    } catch (error) {
        console.log(error)
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      let show = localStorage.getItem('key')
      setKey(show)
    }, 1000);
  
    return () => clearInterval(intervalId);
  }, []);
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const increment = () => {
    setCount(count + 1);
  };
  
  const decrement = () => {
      if (count > 0) {
        setCount(count - 1);
      }
  };
  

  const filterMenu = (category, color, backgroundColor)=> {
    const storedMenu = localStorage.getItem("meals");

    if (storedMenu) {
      const parsedMenu = JSON.parse(storedMenu);

      if(category === "fetch_all") {
        setFilteredData(parsedMenu)
        setBackgroundColor(backgroundColor)
        setColor(color)
      }
      else{
        const filteredItems = parsedMenu.filter((item) => item.category.toLowerCase() === category.toLowerCase());
  
        setFilteredData(filteredItems)
        setBackgroundColor(backgroundColor)
        setColor(color)
      }
    }
    else {
      console.log('No Menu Items Found')
    }
  }

  const filterDrinks = (category, color, backgroundColor)=> {
    const storedMenu = localStorage.getItem("drinks");

    if (storedMenu) {
      const parsedMenu = JSON.parse(storedMenu);

      if(category === "fetch_all") {
        setFilteredDrinks(parsedMenu)
        setBackgroundColor(backgroundColor)
        setColor(color)
      }
      else{
        const filteredItems = parsedMenu.filter((item) => item.category && item.category.toLowerCase() === category?.toLowerCase());
  
        setFilteredDrinks(filteredItems)
        setBackgroundColor(backgroundColor)
        setColor(color)
      }
    }
    else {
      console.log('No Menu Items Found')
    }
  }
  
  useEffect(() => {
      const filterData = () => {
        if (search === '') {
          setFilteredData(items); // If no input, use the main array
        } else {
          const filteredArray = items.filter((item) => {
            // Get an array of all values in the item object
            const values = Object.values(item);
    
            // Check if any value includes the search term
            const found = values.some((value) => {
              if (typeof value === 'string') {
                return value.toLowerCase().includes(search.toLowerCase());
              }
              return false;
            });
    
            return found;
          });
    
          setFilteredData(filteredArray);
        }
      };
    
      filterData();
  }, [items, search]); 
  
  useEffect(() => {
    const filterDrinks = () => {
      console.log(searcher)
      if (searcher === '') {
        setFilteredDrinks(drinks); // If no input, use the main array
      } else {
        const filteredArray = drinks?.filter((drink) => {
          // Get an array of all values in the drink object
          const values = Object.values(drink);
  
          // Check if any value includes the search term
          const found = values.some((value) => {
            if (typeof value === 'string') {
              return value.toLowerCase().includes(searcher.toLowerCase());
            }
            return false;
          });
  
          return found;
        });
        
        setFilteredDrinks(filteredArray);
      }
    };
  
    filterDrinks();
  }, [drinks, searcher]);
      
  // const handleReceipt = async (e)=> {
  //   const table_no = e.target.value
  //   setSelected(true)
  //   setTableNo(e.target.value)

  //   let { data: orders, error } = await supabase
  //   .from('orders')
  //   .select('*')
  //   .eq('table', table_no)

  //   const tablesOrders = orders

  //   // console.log(orders[0].id)
  //   if(error) {console.log(error)}
  //   else {
  //     if(tablesOrders.length > 0) {
  //       console.log(orders)
  //       let { data: ordersItems, error } = await supabase
  //       .from('ordersItems')
  //       .select(`*, menuItems(*), drinks(*), orders(*, waiter(*), table(*))`)
  //       .eq('order_no', orders[0].id)
  
  //       setOrders(ordersItems)
  //       const totalQuantity = ordersItems.reduce((acc, cur) => acc + cur.quantity, 0);
  //       const total = ordersItems.reduce((acc, cur) => acc + cur.total, 0);
  //       setTotalQty(totalQuantity)
  //       setTotalPrice(total.toFIxed(2))
  //       console.log(ordersItems)
  //     }
  //     else {
  //       console.log('No items added yet')
  //       setOrders([]);
  //       setTotalQty(0);
  //       setTotalPrice(0);
  //     }
  //   }
  // }

  const handleDelete = async (itemId) => {
    console.log(itemId)
    try {
      // Step 1: Remove item from selectedTableOrders state
      const updatedOrders = selectedTableOrders.filter((order) => order.id !== itemId?.id);
      const totalQuantity = updatedOrders.reduce((acc, cur) => acc + cur.quantity, 0);
      const total = updatedOrders.reduce((acc, cur) => acc + cur.total, 0);
      setSelectedTableOrders(updatedOrders);
      setTotalQty(totalQuantity)
      setTotalPrice(total.toFixed(2))
  
      // Step 2: Update local storage
      const allOrders = localStorage.getItem("orders");
      if (allOrders) {
        const parsedOrders = JSON.parse(allOrders);
        const updatedLocalOrders = parsedOrders.filter((order) => order.id !== itemId?.id);
        localStorage.setItem("orders", JSON.stringify(updatedLocalOrders));
      }
  
      // Step 3: Update Supabase
      const { data, error } = await supabase
        .from("ordersItems")
        .delete()
        .eq("id", itemId?.id); // Delete the specific item by ID
  
      if (error) {
        console.error("Error deleting item from Supabase:", error.message);
      } else {
        console.log("Item successfully deleted from Supabase:", data);
      }
    } catch (error) {
      console.error("Error handling delete:", error);
    }
  };

  const handlePrint = async ()=> {
    if (!selectedTableOrders || selectedTableOrders?.length === 0) {
        Swal.fire({
            title: "No items to print!",
            icon: "warning",
        });
        return;
    }

    const change = totalPrice - Number(cash) + Number(card)

    // Calculate the dynamic window height based on items and extra details
    const baseHeight = 300; // Height for header, footer, and extra details after table
    const itemHeight = 30; // Estimated height per item row
    const calculatedHeight = baseHeight + selectedTableOrders.length * itemHeight;

    // Print receipt
    
    let printWindow = window.open('', '', `width=315,height=${calculatedHeight}`);
    printWindow.document.write('<html><head><title>Print Bill</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<div class="text-center"><img src="${logo}" alt="Your Logo" width="150" height="150" ></div>`); 
    printWindow.document.write(`<h4 class="text-center"><strong>Annys Restaurant & Bar</strong></h4>`);
    printWindow.document.write(`<h6 class="text-center"><strong><em>CUSTOMER BILL</em></strong></h6>`);
    printWindow.document.write(`<p><strong>Order No: ${orderId}<br/> Waiter: ${waiterName}<br/>TABLE: ${tableNo || 'N/A'}</strong></p>`);
    printWindow.document.write(`<table class="table table-bordered border-dark">`);
    printWindow.document.write('<thead class="table-dark"><tr><th>Product</th><th>Price(£)</th><th>Qty</th><th>Total(£)</th></tr></thead>');

    selectedTableOrders.forEach(item => {
        printWindow.document.write('<tbody><tr >');
        
        // Check if menuItems exists
        if (item?.menuItems?.type === 'food' && !item?.menuItems?.description) {
          printWindow.document.write(`<td><strong>${item?.menuItems?.item_name.toUpperCase()}</strong></td>`);
          printWindow.document.write(`<td><strong>${item?.menuItems?.price}</strong></td>`);
          printWindow.document.write(`<td><strong>${item?.quantity}</strong></td>`);
          printWindow.document.write(`<td><strong>${(item?.total)}</strong></td>`);
        } 
        else if (item?.menuItems?.type === 'food' && item?.menuItems?.description) {
          printWindow.document.write(`<td><strong>${item?.menuItems?.item_name.toUpperCase() + ' ' + item?.menuItems?.description.toUpperCase()}</strong></td>`);
          printWindow.document.write(`<td><strong>${item?.menuItems?.price}</strong></td>`);
          printWindow.document.write(`<td><strong>${item?.quantity}</strong></td>`);
          printWindow.document.write(`<td><strong>${(item?.total)}</strong></td>`);
        }
        // Check if drinks exists
        else if (item?.drinks.type === 'drink') {
          printWindow.document.write(`<td><strong>${item?.drinks?.name.toUpperCase()}</strong></td>`);
          printWindow.document.write(`<td><strong>${item?.drinks?.price}</strong></td>`); 
          printWindow.document.write(`<td><strong>${item?.quantity}</strong></td>`);
          printWindow.document.write(`<td><strong>${(item?.total)}</strong></td>`);
        } else {
          printWindow.document.write(`<td colspan="5">Item data is missing</td>`);
        }
        
        printWindow.document.write('</tr>');
      });
      printWindow.document.write(`<tr><td colspan="2"><h6>Total</h6></td>`);
      printWindow.document.write(`<td><strong>${totalQty}</strong></td>`);
      printWindow.document.write(`<td><strong>&#163; ${(totalPrice)}</strong></td></tr>`);
      printWindow.document.write(`<tr><td colspan="3"><h6>Discount</h6></td>`);
      printWindow.document.write(`<td>0</td></tr>`);
      printWindow.document.write(`<tr><td colspan="3"><h6>Grand Total</h6></td>`);
      printWindow.document.write(`<td><strong>&#163; ${(totalPrice)}</strong></td></tr>`);

    printWindow.document.write('</table>');
    printWindow.document.write(`<p><small><em><strong>NB: THIS IS NOT AN OFFICIAL PAYMENT RECEIPT... PLEASE INSIST ON GETTING RECEIPT AFTER PAYMENT</strong></em></small></p>`);
    printWindow.document.write('</body></html>');

    printWindow.print();
    printWindow.close();

    // Step 1: Update locally in selectedTableOrders
    const updatedOrders = selectedTableOrders.map((item) => ({
      ...item,
      orders: {
        ...item.orders,
        printed: true, // Update the printed status
      },
    }));

    // Step 3: Update state
    setSelectedTableOrders(updatedOrders);

    // Step 4: Update Supabase for all matching orders
    const { data, error } = await supabase
    .from('orders')
    .update({ printed: true })
    .eq('id', orderId)
    .select()

    if (error) {
      console.error("Error updating Supabase:", error.message);
    } else {
      console.log("Supabase print update successful:", data);
    }
  }

  const handleReceiptPrint = async ()=> {
    if (!selectedTableOrders || selectedTableOrders?.length === 0) {
        Swal.fire({
            title: "No items to print!",
            icon: "warning",
        });
        return;
    }

    const change = totalPrice - (Number(cash) + Number(card))

    // Calculate the dynamic window height based on items and extra details
    const baseHeight = 300; // Height for header, footer, and extra details after table
    const itemHeight = 30; // Estimated height per item row
    const calculatedHeight = baseHeight + selectedTableOrders.length * itemHeight;

    // Print receipt
    
    let printWindow = window.open('', '', `width=315,height=${calculatedHeight}`);
    printWindow.document.write('<html><head><title>Official Receipt</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<div class="text-center"><img src="${logo}" alt="Your Logo" width="150" height="150" ></div>`); 
    printWindow.document.write(`<h4 class="text-center"><strong>Annys Restaurant & Bar</strong></h4>`);
    printWindow.document.write(`<h6 class="text-center"><strong><em>OFFICIAL RECEIPT</em></strong></h6>`);
    printWindow.document.write(`<p><strong>Order No: ${orderId}<br/> Waiter: ${waiterName}<br/>TABLE: ${tableNo || 'N/A'}</strong></p>`);
    printWindow.document.write(`<table class="table table-bordered border-dark">`);
    printWindow.document.write('<thead class="table-dark"><tr><th>Product</th><th>Price(£)</th><th>Qty</th><th>Total(£)</th></tr></thead>');

    selectedTableOrders.forEach(item => {
        printWindow.document.write('<tbody><tr >');
        
        // Check if menuItems exists
        if (item?.menuItems?.type === 'food' && !item?.menuItems?.description) {
          printWindow.document.write(`<td><strong>${item?.menuItems?.item_name.toUpperCase()}</strong></td>`);
          printWindow.document.write(`<td><strong>${item?.menuItems?.price}</strong></td>`);
          printWindow.document.write(`<td><strong>${item?.quantity}</strong></td>`);
          printWindow.document.write(`<td><strong>${(item?.total)}</strong></td>`);
        } 
        else if (item?.menuItems?.type === 'food' && item?.menuItems?.description) {
          printWindow.document.write(`<td><strong>${item?.menuItems?.item_name.toUpperCase() + ' ' + item?.menuItems?.description.toUpperCase()}</strong></td>`);
          printWindow.document.write(`<td><strong>${item?.menuItems?.price}</strong></td>`);
          printWindow.document.write(`<td><strong>${item?.quantity}</strong></td>`);
          printWindow.document.write(`<td><strong>${(item?.total)}</strong></td>`);
        }
        // Check if drinks exists
        else if (item?.drinks.type === 'drink') {
          printWindow.document.write(`<td><strong>${item?.drinks?.name.toUpperCase()}</strong></td>`);
          printWindow.document.write(`<td><strong>${item?.drinks?.price}</strong></td>`); 
          printWindow.document.write(`<td><strong>${item?.quantity}</strong></td>`);
          printWindow.document.write(`<td><strong>${(item?.total)}</strong></td>`);
        } else {
          printWindow.document.write(`<td colspan="5">Item data is missing</td>`);
        }
        
        printWindow.document.write('</tr>');
      });
      printWindow.document.write(`<tr><td colspan="2"><h6>Total</h6></td>`);
      printWindow.document.write(`<td><strong>${totalQty}</strong></td>`);
      printWindow.document.write(`<td><strong>&#163; ${(totalPrice)}</strong></td></tr>`);
      printWindow.document.write(`<tr><td colspan="3"><h6>Discount</h6></td>`);
      printWindow.document.write(`<td>0</td></tr>`);
      printWindow.document.write(`<tr><td colspan="3"><h6>Grand Total</h6></td>`);
      printWindow.document.write(`<td><strong>&#163; ${(totalPrice)}</strong></td></tr>`);
      printWindow.document.write(`<tr><td colspan="3"><h6>Cash Paid</h6></td>`);
      printWindow.document.write(`<td><strong>&#163; ${cash}</strong></td></tr>`);
      printWindow.document.write(`<tr><td colspan="3"><h6>Card Paid</h6></td>`);
      printWindow.document.write(`<td><strong>&#163; ${card}</strong></td></tr>`);
      printWindow.document.write(`<tr><td colspan="3"><h6>Balance</h6></td>`);
      printWindow.document.write(`<td><strong>&#163; 0</strong></td></tr>`);

    printWindow.document.write('</table>');
    printWindow.document.write(`<p><small><em><strong>THANK YOU. VISIT US AGAIN </strong></em></small></p>`);
    printWindow.document.write('</body></html>');

    printWindow.print();
    printWindow.close();
  }

  const handleKitchenPrint = async ()=> {
    if (!selectedTableOrders || selectedTableOrders.length === 0) {
        Swal.fire({
            title: "No items to print!",
            icon: "warning",
        });
        return;
    }

    // Dynamically calculate the window height
    const baseHeight = 200; // Base height for header, footer, etc.
    const itemHeight = 30; // Estimated height per item
    const calculatedHeight = baseHeight + selectedTableOrders.length * itemHeight;

    // Print receipt
    
    let printWindow = window.open('', '', `width=315,height=${calculatedHeight}`);
    printWindow.document.write('<html><head><title>Print Kitchen Orders</title>');
    printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<div class="text-center"><img src="${logo}" alt="Your Logo" width="150" height="150" ></div>`); 
    printWindow.document.write(`<h4 class="text-center"><strong>Annys Restaurant & Bar</strong></h4>`);
    printWindow.document.write(`<p><strong>ORDER NO: ${orderId}<br/> SERVED BY: ${waiterName}<br/>TABLE: ${tableNo || 'N/A'}</strong></p>`);
    printWindow.document.write(`<table class="table table-bordered border-dark">`);
    printWindow.document.write('<thead class="table-dark"><tr><th>Item</th><th >Qty</th></tr></thead>');

    selectedTableOrders.forEach(item => {
      printWindow.document.write('<tbody><tr >');
      
      // Check if menuItems exists and has a descripton
      if (item?.menuItems?.type === 'food' && !item?.menuItems?.description) {
        printWindow.document.write(`<td><strong>${item?.menuItems?.item_name.toUpperCase()}</strong></td>`);
        printWindow.document.write(`<td><strong>${item?.quantity}</strong></td>`);
      } 
      else if (item?.menuItems?.type === 'food' && item?.menuItems?.description) {
        printWindow.document.write(`<td><strong>${item?.menuItems?.item_name.toUpperCase() + ' ' + item?.menuItems?.description.toUpperCase()}</strong></td>`);
        printWindow.document.write(`<td><strong>${item?.quantity}</strong></td>`);
      } 
      else {
        printWindow.document.write(``);
      }
      
      printWindow.document.write('</tr>');
    });

    printWindow.document.write('</table>');
    printWindow.document.write('</body></html>');
    printWindow.print(); 
    printWindow.close();

    // Step 1: Update locally in selectedTableOrders
    const updatedOrders = selectedTableOrders.map((item) => ({
      ...item,
      orders: {
        ...item.orders,
        printed: true, // Update the printed status
      },
    }));

    // console.log(`Updated Items after kitchen print: ${updatedOrders}`)

    // Step 3: Update state
    setSelectedTableOrders(updatedOrders);

    // Step 4: Update Supabase for all matching orders
    const { data, error } = await supabase
    .from('orders')
    .update({ printed: true })
    .eq('id', orderId)
    .select()

    if (error) {
      console.error("Error updating Supabase:", error.message);
    } else {
      console.log("Supabase print update successful:", data);
    }
  }

  const handlePayment = async ()=> {
    if (paymentType === 'both') {
      const totalBoth = Number(card) + Number(cash)
      console.log(`Card plus Cash amount is ${totalBoth.toFixed(2)}`)

      const totalRoundedTo2DecimalPlaces = totalBoth.toFixed(2)
      
      if (totalRoundedTo2DecimalPlaces === totalPrice) {
        const { data, error } = await supabase
        .from('orders')
        .update({ 
          table: null,
          cash: cash,
          card: card,
          balance: 0,
          total: totalPrice,
          status: 'served',
          printed: true
        })
        .eq('id', orderId)
        .select()

        if(error) throw error
        else if (data) {
          const { data, error } = await supabase
          .from('tables')
          .update({ 
            status: 'available',
            assign: null
          })
          .eq('table_no', tableNo)
          .select()

          handleReceiptPrint();

          if (error) throw error.message;
          else {
            setCash(0);
            setCard(0);
            setTotalPrice(0);
            getOccupiedTables();
            setOrders([]);
            setTotalQty(0)
            setTableNo(0)
            setSelected(false)
          }
        }
        console.log('paid')
    
      } else {
        console.log('Cash plus card amounts should be equal to total price')
      }
    }
    else if (paymentType === 'card') {
      if (card == totalPrice) {
        const { data, error } = await supabase
        .from('orders')
        .update({ 
          table: null,
          cash: 0,
          card: card,
          balance: 0,
          total: totalPrice,
          status: 'served',
          printed: true
        })
        .eq('id', orderId)
        .select()

        if(error) throw error
        else if (data) {
          const { data, error } = await supabase
          .from('tables')
          .update({ 
            status: 'available',
            assign: null
          })
          .eq('table_no', tableNo)
          .select()

          handleReceiptPrint();

          if (error) throw error.message;
          else {
            setCash(0);
            setCard(0);
            setTotalPrice(0);
            getOccupiedTables();
            setOrders([]);
            setTotalQty(0)
            setTableNo(0)
            setSelected(false)
          }
        }
        console.log('paid')
      } else {
        console.log('Card amount should be equal to total price')
      }
    }
    else if (paymentType === 'cash') {
      if (cash == totalPrice) {
        const { data, error } = await supabase
        .from('orders')
        .update({ 
          table: null,
          cash: cash,
          card: 0,
          balance: 0,
          total: totalPrice,
          status: 'served',
          printed: true
        })
        .eq('id', orderId)
        .select()

        if(error) throw error
        else if (data) {
          const { data, error } = await supabase
          .from('tables')
          .update({ 
            status: 'available',
            assign: null
          })
          .eq('table_no', tableNo)
          .select()

          handleReceiptPrint();

          if (error) throw error.message;
          else {
            setCash(0);
            setCard(0);
            setTotalPrice(0);
            getOccupiedTables();
            setOrders([]);
            setTotalQty(0)
            setTableNo(0)
            setSelected(false)
          }
        }
        console.log('paid')
      } else {
        console.log('Cash amount should be equal to total price')
      }
    }
  }

  // Function to add or update an order item
  const addOrUpdateObject = async (orderItem) => {
    // Identify whether the item is a drink or food
    const isDrink = orderItem.type === 'drink';

    // Find existing item index in the selected table orders
    const existingIndex = selectedTableOrders.findIndex((item) => {
      return isDrink
        ? item.drinks && item.drinks.id === Number(orderItem.id)
        : item.menuItems && item.menuItems.id === Number(orderItem.id);
    });

    if (existingIndex !== -1) {
      // If the item already exists, update its quantity and total
      const updatedItems = [...selectedTableOrders];
      updatedItems[existingIndex].quantity += 1;
      updatedItems[existingIndex].total =
        updatedItems[existingIndex].quantity * (isDrink
          ? updatedItems[existingIndex].drinks.price
          : updatedItems[existingIndex].menuItems.price);

      // Update state
      setSelectedTableOrders(updatedItems);
      const totalQuantity = updatedItems.reduce((acc, cur) => acc + cur.quantity, 0);
      const totalPrice = updatedItems.reduce((acc, cur) => acc + cur.total, 0);
      setTotalQty(totalQuantity);
      setTotalPrice(totalPrice.toFixed(2));

      // Update Supabase
      const { data, error } = await supabase
        .from('ordersItems')
        .update({
          quantity: updatedItems[existingIndex].quantity,
          total: updatedItems[existingIndex].total.toFixed(2),
        })
        .eq('id', updatedItems[existingIndex].id)
        .select();

      if (error) {
        console.error('Error updating Supabase:', error.message);
      } else {
        console.log('Supabase update successful:', data);
      }
    } else {
      // If the item does not exist, create a new one
      const { data: lastItem, error: fetchError } = await supabase
        .from('ordersItems')
        .select('id')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (fetchError) {
        console.error('Error fetching last ID:', fetchError.message);
        return;
      }

      const nextId = lastItem ? lastItem.id + 1 : 1;

      const newItem = {
        id: nextId,
        created_at: new Date().toISOString(),
        drinks: isDrink ? orderItem : undefined,
        menuItems: !isDrink ? orderItem : undefined,
        order_no: orderId,
        quantity: 1,
        total: orderItem.price,
        status: 'pending',
        type: orderItem.type,
      };

      const updatedItems = [...selectedTableOrders, newItem];
      setSelectedTableOrders(updatedItems);
      const totalQuantity = updatedItems.reduce((acc, cur) => acc + cur.quantity, 0);
      const totalPrice = updatedItems.reduce((acc, cur) => acc + cur.total, 0);
      setTotalQty(totalQuantity);
      setTotalPrice(totalPrice.toFixed(2));

      // Add new item to Supabase
      const { data, error } = await supabase
        .from('ordersItems')
        .insert({
          item: orderItem.id, // Replace key names as per schema
          order_no: orderId,
          quantity: newItem.quantity,
          total: newItem.total,
          status: 'pending',
          type: orderItem.type,
        })
        .select();

      if (error) {
        console.error('Error inserting into Supabase:', error.message);
      } else {
        console.log('Supabase insert successful:', data);
      }
    }
  };

  // Function to handle table selection  
  const handleTableSelection = async (e) => {
    const table = e.target.value;
    setSelected(true);
    
    console.log("Selected Table ID: ", table); 
    console.table("Occupied tables: ", tables);
    // console.table(orders);
    // console.table(mainOrders);

    // Find the order from mainOrders that matches the selected table
    const matchingTable= tables.find((item) => item.id === Number(table));
    console.log("Selected Matching Table: ", matchingTable); 
    console.log("Selected Matching Table Number: ", matchingTable.table_no); 
    setTableNo(matchingTable.table_no);

    // Find the order from mainOrders that matches the selected table
    const matchingOrder = mainOrders.find((order) => order.table.id === Number(table));
    console.log('Order found in mainOrders state:', matchingOrder);

    if (matchingOrder) {

      // Extract waiter name and order ID
      setWaiterName(matchingOrder.waiter?.name || 'Unknown');
      setOrderId(matchingOrder.id);
    }
  
    // Check if the state already has orders for the selected table
    const matchingOrders = orders.filter((order) => order.orders.table.id === Number(table));
    console.log(matchingOrders)
  
    if (matchingOrders.length > 0) {
      console.log('Using preloaded state for table:', table);
  
      setOrder(matchingOrders[0]); // Use the first order for meta details like waiter
      console.log(`Waiters Name: ${matchingOrders[0].orders?.waiter?.name}`);
  
      // Combine all order items from multiple orders
      setSelectedTableOrders(matchingOrders);
  
      // Calculate total quantity and price
      const totalQuantity = matchingOrders.reduce((acc, cur) => acc + cur.quantity, 0);
      const totalPrice = matchingOrders.reduce((acc, cur) => acc + cur.total, 0);
      setTotalQty(totalQuantity);
      setTotalPrice(totalPrice.toFixed(2));
    } else {
      console.log('Fetching data for table:', table);
  
      // Fallback: Fetch data if preloaded state doesn't contain the table
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`*, waiter(*)`)
        .eq('table', table);
  
      if (error) {
        console.error('Error fetching orders:', error.message);
        return;
      }
  
      if (orders.length === 0) {
        console.log('No orders found');
        setOrder(null);
        setSelectedTableOrders([]);
        setTotalQty(0);
        setTotalPrice(0);
      } else {
        const currentOrder = orders[0];
        setOrder(currentOrder);
  
        // Fetch order items from Supabase
        const { data: orderItems, error: itemsError } = await supabase
          .from('ordersItems')
          .select(`*, menuItems(*), drinks(*), orders(*, waiter(*), table(*))`)
          .eq('order_no', currentOrder.id);
  
        if (itemsError) {
          console.error('Error fetching order items:', itemsError.message);
          return;
        }
  
        setSelectedTableOrders(orderItems);
  
        // Calculate total quantity and price
        const totalQuantity = orderItems.reduce((acc, cur) => acc + cur.quantity, 0);
        const totalPrice = orderItems.reduce((acc, cur) => acc + cur.total, 0);
        setTotalQty(totalQuantity);
        setTotalPrice(totalPrice.toFixed(2));
      }
    }
  };
  

  return(
    <>
      <div class="row">
          <div class="col-8">
            <div class="card text-center ">
              <div class="card-header">
                <h5>MENU</h5>
                
              </div>
              <div class="card-body">
                  {selected ? (
                    <>
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ArrowDownwardIcon />}
                          aria-controls="panel1-content"
                          id="panel1-header"
                        >
                          <Typography variant="button" sx={{fontSize: 20}}>Meals</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <div class="row">
                            <div class="col-2">
                              <Box sx={{ flexGrow: 1 }} >
                                <Stack spacing={1}>
                                  <Card sx={{ maxWidth: 150}}>
                                    <CardActionArea onClick={()=> filterMenu('fetch_all', '#000', '#fff')}  >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          ALL
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#ffe135' }}>
                                    <CardActionArea onClick={()=> filterMenu('main meal', '#000', '#ffe135')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          MAIN MEAL
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#327fa8', color: "#fff"  }}>
                                    <CardActionArea onClick={()=> filterMenu('traditional', "#fff", '#327fa8')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          TRADITIONAL
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#a83236', color: "#fff" }}>
                                    <CardActionArea onClick={()=> filterMenu('soups only', "#fff", '#a83236')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          SOUPS
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea> 
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#62a832', color: "#fff"}}>
                                    <CardActionArea onClick={()=> filterMenu('desserts (STA)', "#fff", '#62a832')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          DESSERTS
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#a85032', color: "#fff"}}>
                                    <CardActionArea onClick={()=> filterMenu('extras/ sides', "#fff", '#a85032')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          EXTRAS / SIDES
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#8932a8', color: "#fff"}}>
                                    <CardActionArea onClick={()=> filterMenu('starters', "#fff", '#8932a8')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          STARTERS
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>
                                </Stack>
                              </Box>
                            </div>
                            <div class="col-10">
                              <div class="row">
                                <TextField 
                                    sx={{backgroundColor: '#fff', borderColor: '#fff', my: 2}} 
                                    size="small" 
                                    onChange={(e)=> setSearch(e.target.value)}
                                    label="Search meal..." 
                                    id="fullWidth" 
                                    fullWidth
                                    margin="normal"
                                    slotProps={{
                                        input: {
                                          startAdornment: (
                                            <InputAdornment position="start">
                                              <SearchIcon /> 
                                            </InputAdornment>
                                          ),
                                        },
                                    }} 
                                />
                              </div>
                              <div class="row">
                                  {filteredData?.length === 0  ? (
                                      <Typography variant="button" component="h5">No Item(s) Found</Typography>
                                  ) : (
                                    <>
                                        {filteredData?.map((item, i)=>
                                          <div class="col-3 mb-3" key={i}>
                                            <Card sx={{ maxWidth: 345 , backgroundColor: backgroundColor, color: color}}>
                                              <CardActionArea onClick={()=> addOrUpdateObject(item)}>
                                                <CardContent>
                                                  <Typography gutterBottom variant="subtitle2">
                                                    {item.item_name?.toUpperCase()} {item.description?.toUpperCase()}  
                                                  </Typography>
                                                  <Typography variant="body2">
                                                    &#163; {item.price}  
                                                  </Typography>
                                                </CardContent>
                                              </CardActionArea>
                                            </Card>
                                          </div>


                                            // <Grid2 size={4}>
                                            //   <div class="card border-secondary text-center">
                                            //     <div class="card-header">
                                            //       {item.category}
                                            //     </div>
                                            //     <div class="card-body">
                                            //       <h6 class="card-title">{item.item_name} <small>{item.description}</small></h6>
                                            //       <p class="card-text"> &#163; {item.price} </p>
                                            //     </div>
                                            //     <div class="card-footer">
                                            //       <div class="hstack gap-1">
                                            //         <div class="p-2">
                                            //           <div class="form-floating mb-3">
                                            //             <input type="number" onChange={(e)=> setMenuQuantity(e.target.value)} class="form-control" id="floatingInput" placeholder="name@example.com"/>
                                            //             <label for="floatingInput">Quantity</label>
                                            //           </div>
                                            //         </div>
                                            //         <div class="p-2">
                                            //           <Button size="large" variant="contained" color="success" onClick={()=> addOrUpdateObject(item)} color='light'>Add to order</Button>
                                            //         </div>
                                            //       </div>
                                            //     </div>
                                            //   </div>
                                            // </Grid2>
                                            
                                        )}
                                    </>
                                  )}

                              </div>
                              {/* <Grid2 container spacing={2}>
                              </Grid2> */}
                            </div>
                          </div>
                        </AccordionDetails>
                      </Accordion>
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ArrowDownwardIcon />}
                          aria-controls="panel1-content"
                          id="panel1-header"
                        >
                          <Typography variant="button" sx={{fontSize: 20}}>DRINKS</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <div class="row">
                            <div class="col-2">
                              <Box sx={{ flexGrow: 1 }} >
                                <Stack spacing={1}>
                                  <Card sx={{ maxWidth: 150}}>
                                    <CardActionArea onClick={()=> filterDrinks('fetch_all', '#000', '#fff')}  >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          ALL
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#ffe135' }}>
                                    <CardActionArea onClick={()=> filterDrinks('wine', '#000', '#ffe135')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          WINE
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#327fa8', color: "#fff"  }}>
                                    <CardActionArea onClick={()=> filterDrinks('local', "#fff", '#327fa8')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          LOCAL
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#a83236', color: "#fff" }}>
                                    <CardActionArea onClick={()=> filterDrinks('spirits', "#fff", '#a83236')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          SPIRITS
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea> 
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#62a832', color: "#fff"}}>
                                    <CardActionArea onClick={()=> filterDrinks('champagne', "#fff", '#62a832')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          CHAMPAGNE
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#a85032', color: "#fff"}}>
                                    <CardActionArea onClick={()=> filterDrinks('cocktails (alcohol free)', "#fff", '#a85032')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          COCKTAILS (ALCOHOL FREE)
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#8932a8', color: "#fff"}}>
                                    <CardActionArea onClick={()=> filterDrinks('cocktails (alcohol)', "#fff", '#8932a8')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                        COCKTAILS (ALCOHOL)
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>

                                  <Card sx={{ maxWidth: 150, backgroundColor: '#12040b', color: "#fff"}}>
                                    <CardActionArea onClick={()=> filterDrinks('soft drinks', "#fff", '#12040b')} >
                                      <CardContent>
                                        <Typography gutterBottom variant="subtitle2" >
                                          SOFT DRINKS
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>
                                </Stack>
                              </Box>
                            </div>
                            <div class="col-10">
                              <div class="row">
                                <TextField 
                                  sx={{backgroundColor: '#fff', borderColor: '#fff', my: 2}} 
                                  size="small" 
                                  fullWidth
                                  onChange={(e)=> setSearcher(e.target.value)}
                                  label="Search drinks..." 
                                  id="other" 
                                  margin="normal"
                                  slotProps={{
                                      input: {
                                        startAdornment: (
                                          <InputAdornment position="start">
                                            <SearchIcon /> 
                                          </InputAdornment>
                                        ),
                                      },
                                  }} 
                                />
                              </div>
                              <div class="row">
                                  {filteredDrinks?.length === 0  ? (
                                      <Typography variant="button" component="h5">No Item(s) Found</Typography>
                                  ) : (
                                    <>
                                        {filteredDrinks?.map((item, i)=>
                                          <div class="col-3 mb-3" key={i}>
                                            <Card sx={{ maxWidth: 345 , backgroundColor: backgroundColor, color: color}}>
                                              <CardActionArea onClick={()=> addOrUpdateObject(item)}>
                                                <CardContent>
                                                  <Typography gutterBottom variant="subtitle2">
                                                    {item.name?.toUpperCase()} 
                                                  </Typography>
                                                  <Typography variant="body2">
                                                    &#163; {item.price}  
                                                  </Typography>
                                                </CardContent>
                                              </CardActionArea>
                                            </Card>
                                          </div>                                              
                                        )}
                                    </>
                                  )}

                              </div>
                              {/* <Grid2 container spacing={2}>
                              </Grid2> */}
                            </div>
                          </div>
                        </AccordionDetails>
                      </Accordion>
                    </>
                  ) : (
                    <h6><small><em>SELECT A TABLE IN RECEIPT TO OPEN MENU</em></small></h6>
                  )}
              </div>
              <div class="card-footer text-body-secondary">
            
              </div>
            </div>
          </div>
          <div class="col ">
            <div class="card text-bg-dark">
              <div class="card-header">
                <h5>RECEIPT <span style={{float: 'right'}}>{getCurrentDateTime()}</span></h5>
              </div>
              <div class="card-body">
                <select class="form-select" aria-label="Select table" onChange={handleTableSelection}>
                  <option selected disabled>Select table to view orders</option>
                  {tables?.map((table)=>
                    <option value={table.id}><small>Table {table.table_no}</small></option>
                  )}
                </select>
                {selected ? (
                  <>
                    <div class="hstack gap-3 mt-4">
                      <div class="p-2"><h6>ORDER NO: {orderId}</h6></div>
                      <div class="p-2 ms-auto"><h6>SERVED BY: {waiterName}</h6></div>
                    </div>
                    <table class="table table-bordered border-dark">
                      <thead class="table-dark">
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">Product</th>
                          <th scope="col">Price</th>
                          <th scope="col">Qty</th>
                          <th scope="col">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTableOrders?.map((item, index) => (
                          <tr key={index}>
                            <th scope="row">
                              {item?.orders?.printed ? '' : (
                                <IconButton onClick={() => handleDelete(item)} aria-label="delete" color="error">
                                  <CancelIcon />
                                </IconButton>
                              )}
                            </th>
                            {item?.menuItems ? (
                              <>
                                <td>{item.menuItems.item_name?.toUpperCase()} {item.menuItems.description?.toUpperCase()}</td>
                                <td>&#163; {item.menuItems.price?.toFixed(2)}</td>
                                <td>{item.quantity}</td>
                                <td>&#163; {(item.menuItems.price * item.quantity).toFixed(2)}</td>
                              </>
                            ) : item?.drinks ? (
                              <>
                                <td>{item.drinks.name?.toUpperCase()}</td>
                                <td>&#163; {item.drinks.price?.toFixed(2)}</td>
                                <td>{item.quantity}</td>
                                <td>&#163; {item.total?.toFixed(2)}</td>
                              </>
                            ) : (
                              <td colSpan="4">Invalid item</td>
                            )}
                          </tr>
                        ))}
                        <tr>
                          <td colspan="3"><h6>Total</h6></td>
                          <td><strong>{totalQty}</strong></td>
                          <td><strong>&#163; {(totalPrice)}</strong></td>
                        </tr>
                        <tr>
                          <td colspan="4"><h6>Discount</h6></td>
                          <td>0</td>
                        </tr>
                        <tr>
                          <td colspan="4"><h6>Grand Total</h6></td>
                          <td><strong>&#163; {(totalPrice)}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                    {totalPrice > 0 ? (
                      <div class="hstack gap-3 mt-4">
                        <button 
                          class="btn btn-success" 
                          data-bs-toggle="modal" 
                          data-bs-target="#staticBackdrop" 
                        >MAKE PAYMENT</button>
                        <button class="btn btn-primary p-2 ms-auto" onClick={handleKitchenPrint}>PRINT FOR KITCHEN</button>
                        <button class="btn btn-info" onClick={handlePrint}>PRINT BILL</button>
                      </div>
                    ) : ('')}
                  </>
                ) : ('')}
              </div>
              <div class="card-footer text-body-secondary">
                2 days ago
              </div>
            </div>
          </div>
      </div>

      {/* <!-- Modal --> */}
      <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="staticBackdropLabel">PAYMENT METHODS</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" onClick={(e)=> setPaymentType(e.target.value)} name="inlineRadioOptions" id="inlineRadio1" value="cash"/>
                <label class="form-check-label" for="inlineRadio1">CASH</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" onClick={(e)=> setPaymentType(e.target.value)} name="inlineRadioOptions" id="inlineRadio2" value="card"/>
                <label class="form-check-label" for="inlineRadio2">CARD</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" onClick={(e)=> setPaymentType(e.target.value)} name="inlineRadioOptions" id="inlineRadio3" value="both"/>
                <label class="form-check-label" for="inlineRadio3">CASH + CARD</label>
              </div>
              <div>
                {paymentType === 'cash' ? (
                  <div class="form-floating mt-3">
                    <input type="number" onChange={(e)=> setCash(e.target.value)} class="form-control" id="floatingInput" placeholder="name@example.com"/>
                    <label for="floatingInput">CASH AMOUNT</label>
                  </div>
                ) : paymentType === 'card' ? (
                  <div class="form-floating mt-3">
                    <input type="number" onChange={(e)=> setCard(e.target.value)}class="form-control" id="floatingPassword" placeholder="Password"/>
                    <label for="floatingPassword">CARD AMOUNT</label>
                  </div>
                ) : paymentType === 'both' ? (
                  <>
                    <div class="form-floating mt-3 mb-2">
                      <input type="number" onChange={(e)=> setCash(e.target.value)} class="form-control" id="floatingInput" placeholder="name@example.com"/>
                      <label for="floatingInput">CASH AMOUNT</label>
                    </div>
                    <div class="form-floating">
                      <input type="number" onChange={(e)=> setCard(e.target.value)} class="form-control" id="floatingPassword" placeholder="Password"/>
                      <label for="floatingPassword">CARD AMOUNT</label>
                    </div>
                  </>
                ) : (<p class="mt-3"><em><strong>SELECT A PAYMENT OPTION</strong></em></p>)}
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal" onClick={handlePayment}>Proceed</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Menu; 