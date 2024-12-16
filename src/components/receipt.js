import * as React from 'react';
import { useEffect, useState } from "react";
import { Stack, Box, Container, Typography, Grid2, Button, IconButton,
    InputLabel, MenuItem, FormControl, Select, Modal, TextField,
    Radio, RadioGroup, FormControlLabel
} from '@mui/material';
import { Cancel as CancelIcon} 
from '@mui/icons-material';
import Swal from 'sweetalert2';
import { createClient } from '@supabase/supabase-js';
import logo from '../assets/logo.jpeg'


const PROJECT_URI = 'https://jzgrowofybjstbasfcpq.supabase.co'
const PROJECT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z3Jvd29meWJqc3RiYXNmY3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0ODYxNjcsImV4cCI6MjA0NDA2MjE2N30.VAbfV_ChT5carGQWro2eCyx5H1Dj8HXb1H-7jIQ7DcE'

const supabase = createClient(PROJECT_URI, PROJECT_ANON)

function formatDate(date) {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear()   
   % 100; // Get the last two digits of the year
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const amOrPm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;   
  
  
    return `${day} ${month} ${year}, ${formattedHours}:${minutes}${amOrPm}`;
}
  

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

const Receipt = ()=> {
    const [table, setTable] = useState('');
    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [tables, setTables] = useState([]);
    const [cash, setCash] = useState(null);
    const [card, setCard] = useState(null);
    const [total, setTotal] = useState(0);
    const [balance, setBalance] = useState(0);
    const [open, setOpen] = React.useState(false);
    const [openCard, setOpenCard] = useState(false);
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false); // State for payment dialog
    const [paymentType, setPaymentType] = useState(null);
    const [isPaymentSubmitted, setIsPaymentSubmitted] = useState(false);
    const [shouldPoll, setShouldPoll] = useState(true);
    const [subtotal] = useState(0); // Initialize subtotal
    const [tax] = useState(0); // Initialize tax
    const [key, setKey] = useState(0);    
    const [change, setChange] = useState(0); // initial change
    const handleCloseCard = () => setOpenCard(false);
    const handleClose = () => setOpen(false);
    const [isPrinting, setIsPrinting] = useState(false); // Track printing status
    const [isPaymentMade, setIsPaymentMade] = useState(false); // Track payment status


    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);  

    const handleError = (error) => {
        Swal.fire({ title: "Failed", text: error.message, icon: "error" })
    }

    const getOccupiedTables = async ()=> {
        try {
            let { data: tables, error } = await supabase
            .from('tables')
            .select('*')
            .eq('status', 'occupied')
                    
            setTables(tables)
            
        } catch (error) {
            handleError(error)
        }
    }

    useEffect(() => {
        async function fetchInitialTotal() {
          const response = await fetch('/api/get-initial-total');
          const data = await response.json();
          setTotal(data.total); // Initialize total with the fetched value
        }
        fetchInitialTotal();
    }, []);


    useEffect(() => {
        const intervalId = setInterval(() => {
          getOccupiedTables(); 
          let show = localStorage.getItem('key')
          setKey(show)
        }, 1000);
      
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        var isMounted = true

        const getOccupiedTables = async ()=> {
            try {
                let { data: tables, error } = await supabase
                .from('tables')
                .select('*')
                .eq('status', 'occupied')
                        
                isMounted && setTables(tables)
            } catch (error) {
                handleError(error)
            }
        }
        getOccupiedTables();

        return ()=> {
            isMounted = false
            controller.abort();
        }

    }, [])

    const fetchOrderItems = async (orderId) => {
        try {
            const { data: orderItems, error } = await supabase
                .from('ordersItems')
                .select(`*, menuItems(*), drinks(*)`)
                .eq('order_no', orderId);
            if (error) throw error;
            setItems(orderItems);
            const totalPrice = orderItems.reduce((acc, cur) => acc + cur.total, 0);
            setTotal(totalPrice);
        } catch (error) {
            handleError(error)
        }
      };

      useEffect(() => {
        const intervalId = setInterval(() => {
            if (order && shouldPoll) {
                fetchOrderItems(order.id); // Fetch updated items for the current order
            }
        }, 5000); // Poll every 5 seconds
    
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [order, shouldPoll]); // Add shouldPoll as a dependency

    const handleOpenPaymentDialog = () => setOpenPaymentDialog(true);
    const handleClosePaymentDialog = () => setOpenPaymentDialog(false);


    const pollOrderItems = async () => {
        if (!order) return; // Exit if no order is present

        let { data: ordersItems, error } = await supabase
            .from('ordersItems')
            .select(`*,
                menuItems(*),
                orders(*),
                drinks(*)
            `)
            .eq('order_no', order.id);
    
        if (error) {
            console.error("Error fetching order items:", error);
            return; // Exit if there's an error
        }
    
        // Update items state
        setItems(ordersItems);
    
        // Calculate new total based on fetched items
        const totalPrice = ordersItems.reduce((acc, cur) => acc + cur.total, 0);
    
        // Only update total if payment has not been submitted
        if (!isPaymentSubmitted) {
            // Update total only if it has changed
            if (totalPrice !== total) {
                setTotal(totalPrice); // Update total to the new calculated total
                console.log("Updated total:", totalPrice);
            } else {
                console.log("Total remains unchanged:", total);
            }
        } else {
            console.log("Payment has been submitted; total remains:", total);
        }
    
    };

    // Polling effect
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (!isPaymentSubmitted) {
                pollOrderItems(); // Only poll if payment hasn't been submitted
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [isPaymentSubmitted]); // Add dependency to stop polling when payment is submitted
   


    const handleChange = async (event) => {
        const selectedTable = event.target.value;

        try {
            if (selectedTable === "none") {
                // Reset states when no table is selected
                setOrder(null);
                setTable(0);
                setItems([]); // Clear items
                localStorage.setItem('key', 0);
                setTotal(0)
            } else {
                setTable(selectedTable);
                localStorage.setItem('key', selectedTable);
        
                let { data: orders, error } = await supabase
                    .from('orders')
                    .select(`*,
                        tables(*),
                        employees(*)    
                    `)
                    .eq('table', selectedTable);
        
                // Check if orders is not null and is an array
                if (error) {
                    console.error("Error fetching orders:", error);
                    setItems([]); // Clear items if there's an error
                    setTotal(0); // Reset total if there's an error
                    return; // Exit the function early
                }
        
                if (orders && Array.isArray(orders) && orders.length > 0) {
                    setOrder(orders[0]);
                    localStorage.setItem('order', JSON.stringify(orders[0]));
        
                    // Fetch order items immediately after setting the order
                    fetchOrderItems(orders[0].id);
                } else {
                    console.log("No orders found for the selected table.");
                    setItems([]); // Clear items if no orders found
                    setTotal(0); // Reset total if no orders found
                }
            }
            
        } catch (error) {
            handleError(error)
        }
     
    };

    // useEffect(() => {
    //     console.log("Initial total:", total);
    // }, []);

    // const handleOrder = ()=> {
    //     Swal.fire({
    //         title: "Submit your Github username",
    //         input: "text",
    //         inputAttributes: {
    //           autocapitalize: "off"
    //         },
    //         showCancelButton: true,
    //         confirmButtonText: "Look up",
    //         showLoaderOnConfirm: true,
    //         preConfirm: async (login) => {
    //           try {
    //             const githubUrl = `
    //               https://api.github.com/users/${login}
    //             `;
    //             const response = await fetch(githubUrl);
    //             if (!response.ok) {
    //               return Swal.showValidationMessage(`
    //                 ${JSON.stringify(await response.json())}
    //               `);
    //             }
    //             return response.json();
    //           } catch (error) {
    //             Swal.showValidationMessage(`
    //               Request failed: ${error}
    //             `);
    //           }
    //         },
    //         allowOutsideClick: () => !Swal.isLoading()
    //       }).then((result) => {
    //         if (result.isConfirmed) {
    //           Swal.fire({
    //             title: `${result.value.login}'s avatar`,
    //             imageUrl: result.value.avatar_url
    //           });
    //         }
    //       });
    // }

    const handleDeleteItem = async (item)=> {
        if (isPrinting || isPaymentMade) return; // Prevent deletion if printing or payment has been made
        try {
            const { error } = await supabase
            .from('ordersItems')
            .delete()
            .eq('id', item.id)
            if (error) throw error;
        } catch (error) {
            handleError(error)
        }
    }

    const handleCash = async () => {
        setShouldPoll(false); // Disable polling during payment
        handleClosePaymentDialog()

        // Validate cash input
        if (cash <= 0) {
            Swal.fire({
                title: "Invalid amount!",
                text: "Cash amount must be greater than 0.",
                icon: "warning"
            });
            return; // Exit if the amount is invalid
        }

        // Validate cash input
        if (cash < total) {
            Swal.fire({
                title: "Invalid amount!",
                text: "Cash amount must be equal to total.",
                icon: "warning"
            });
            return; // Exit if the amount is invalid
        }

        const newBalance = cash - total; // Calculate the change (cash - total)
        setBalance(newBalance); // Update state for balance

        handleClosePaymentDialog(); // Close payment dialog

        // Check if the cash provided is sufficient
        if (newBalance >= 0) {
            const change = cash - total; // Calculate change
            setChange(change); // Store change for later use

            // Proceed with payment logic
            const tableId = order?.tables?.id;

            const { data, error } = await supabase
                .from('orders')
                .update({
                    table: null,
                    total: total, // Update total to 0 in the database
                    cash: cash,
                    balance: change, // Update balance to 0
                    status: 'served'
                })
                .eq('id', order.id)
                .select();

            if (error) {
                Swal.fire({
                    title: "Payment failed!",
                    icon: "error"
                });
                console.log(error);
                return; // Exit if payment fails
            }
            setIsPaymentMade(true);

            // Update the table status in the database
            const { data: tableData, error: tableError } = await supabase
                .from('tables')
                .update({ status: 'dirty', assign: null })
                .eq('id', tableId)
                .select();

            if (tableError) {
                Swal.fire({
                    title: "Table update failed!",
                    icon: "error"
                });
                console.log(tableError);
                return; // Exit if table update fails
            }

            // Reset total after payment is completed
            setTotal(0); // Reset total after payment is completed

            // Display the payment received message
            Swal.fire({
                title: "Payment Received!",
                icon: "success"
            }).then(() => {
                // Print receipt with the calculated change
                handlePrint(change); 
                handleClose(); // Close print dialog
                getOccupiedTables(); // Refresh occupied tables
                setOrder(null); // Clear order
                setTable(0); // Reset table selection
                window.location.reload(); // Refresh browser after OK is clicked
                localStorage.setItem('key', 0);
            });
        } else {
            // Show warning if cash is insufficient
            Swal.fire({
                title: "Insufficient cash!",
                text: `You need to provide £ ${Math.abs(newBalance).toFixed(2)} more.`,
                icon: "warning",
                allowOutsideClick: false,
                backdrop: true
            });

            handleCloseCard()
            handleClose()
        }
    };

    const handleCard = async () => {
        handleClosePaymentDialog()
        setShouldPoll(false); // Disable polling during payment

        // Validate cash input
        if (card <= 0) {
            Swal.fire({
                title: "Invalid amount!",
                text: "Card amount must be greater than 0.",
                icon: "warning"
            });
            return; // Exit if the amount is invalid
        }

        // Validate card input
        if (card < total) {
            Swal.fire({
                title: "Invalid amount!",
                text: "Card amount must be equal to total.",
                icon: "warning"
            });
            return; // Exit if the amount is invalid
        }

        const newBalance = card - total; // Calculate the change (card - total)
        setBalance(newBalance); // Update state for balance

        handleClosePaymentDialog(); // Close payment dialog

        // Check if the card provided is sufficient
        if (newBalance >= 0) {
            const change = card - total; // Calculate change
            setChange(change); // Store change for later use

            // Proceed with payment logic
            const tableId = order?.tables?.id;

            const { data, error } = await supabase
                .from('orders')
                .update({
                    table: null,
                    total: total, // Update total to 0 in the database
                    card: card,
                    balance: change, // Update balance to 0
                    status: 'served'
                })
                .eq('id', order.id)
                .select();

            if (error) {
                Swal.fire({
                    title: "Payment failed!",
                    icon: "error"
                });
                console.log(error);
                return; // Exit if payment fails
            }

            // Update the table status in the database
            const { data: tableData, error: tableError } = await supabase
                .from('tables')
                .update({ status: 'dirty', assign: null })
                .eq('id', tableId)
                .select();

            if (tableError) {
                Swal.fire({
                    title: "Table update failed!",
                    icon: "error"
                });
                console.log(tableError);
                return; // Exit if table update fails
            }

            // Reset total after payment is completed
            setTotal(0); // Reset total after payment is completed

            // Display the payment received message
            Swal.fire({
                title: "Payment Received!",
                icon: "success"
            }).then(() => {
                // Print receipt with the calculated change
                handlePrint(change); 
                handleClose(); // Close print dialog
                getOccupiedTables(); // Refresh occupied tables
                setOrder(null); // Clear order
                setTable(0); // Reset table selection
                window.location.reload(); // Refresh browser after OK is clicked
                localStorage.setItem('key', 0);
            });
        } else {
            // Show warning if card is insufficient
            Swal.fire({
                title: "Insufficient card!",
                text: `You need to provide £ ${Math.abs(newBalance).toFixed(2)} more.`,
                icon: "warning",
                allowOutsideClick: false,
                backdrop: true
            });
        }
    };

    const handleBoth = async () => {
        handleClosePaymentDialog();
        setShouldPoll(false); // Disable polling during payment

        if (card + cash !== total) {
            Swal.fire({
                title: "Invalid amount!",
                text: "Card plus cash amount must be equal to total.",
                icon: "warning"
            });
            // setErrMsg("Card plus cash amount must be equal to total.")
            return; // Exit if the amount is invalid
        }

        
        handleClosePaymentDialog(); // Close payment dialog

        // Check if the cash provided is sufficient
        if (card + cash === total) {
            const change = card + cash - total; // Calculate change
            setChange(change); // Store change for later use

            // Proceed with payment logic
            const tableId = order?.tables?.id;

            const { data, error } = await supabase
                .from('orders')
                .update({
                    table: null,
                    total: total, // Update total to 0 in the database
                    cash: cash,
                    card: card,
                    balance: change, // Update balance to 0
                    status: 'served'
                })
                .eq('id', order.id)
                .select();

            if (error) {
                Swal.fire({
                    title: "Payment failed!",
                    icon: "error"
                });
                console.log(error);
                return; // Exit if payment fails
            }

            // Update the table status in the database
            const { data: tableData, error: tableError } = await supabase
                .from('tables')
                .update({ status: 'dirty', assign: null })
                .eq('id', tableId)
                .select();

            if (tableError) {
                Swal.fire({
                    title: "Table update failed!",
                    icon: "error"
                });
                console.log(tableError);
                return; // Exit if table update fails
            }

            // Reset total after payment is completed
            setTotal(0); // Reset total after payment is completed

            // Display the payment received message
            Swal.fire({
                title: "Payment Received!",
                icon: "success"
            }).then(() => {
                // Print receipt with the calculated change
                handlePrint(change); 
                handleClose(); // Close print dialog
                getOccupiedTables(); // Refresh occupied tables
                setOrder(null); // Clear order
                setTable(0); // Reset table selection
                window.location.reload(); // Refresh browser after OK is clicked
                localStorage.setItem('key', 0);
            });
        } else {
            // Show warning if cash is insufficient
            Swal.fire({
                title: "Insufficient payment amount!",
                text: `You need to provide cash or card`,
                icon: "warning",
                allowOutsideClick: false,
                backdrop: true
            });
        }
    };

    const handlePrint = ()=> {
        setIsPrinting(true); // Set printing state to true
        if (!order || items.length === 0) {
            Swal.fire({
                title: "No items to print!",
                icon: "warning",
            });
            return;
        }

        const change = total - cash + card

        // Calculate the dynamic window height based on items and extra details
        const baseHeight = 300; // Height for header, footer, and extra details after table
        const itemHeight = 30; // Estimated height per item row
        const calculatedHeight = baseHeight + items.length * itemHeight;
    
        // Print receipt
        
        let printWindow = window.open('', '', `width=315,height=${calculatedHeight}`);
        printWindow.document.write('<html><head><title>Print Order</title>');
        printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<div class="text-center"><img src="${logo}" alt="Your Logo" width="150" height="150" ></div>`); 
        printWindow.document.write(`<h4 class="text-center"><strong>Annys Restaurant & Bar</strong></h4>`);
        printWindow.document.write(`<p><strong>Order No: ${order.id}<br/> Waiter: ${order?.employees?.name}<br/>Table: ${order.tables?.table_no || 'N/A'}</strong></p>`);
        // printWindow.document.write(`<p><strong>Waiter: ${order?.employees?.name}</strong></p>`);
        // printWindow.document.write(`<p><strong>Table: ${order.tables?.table_no || 'N/A'}</strong></p>`); // Use optional chaining
        printWindow.document.write(`<table style="border: 2px solid black; width: 100%; text-align: left;">`);
        printWindow.document.write('<thead><tr style="background-color: #f2f2f2;"><th style="border: 1px solid black">Item</th><th style="border: 1px solid black">Qty</th><th style="border: 1px solid black">Price(£)</th><th style="border: 1px solid black">Total(£)</th></tr></thead>');
    
        items.forEach(item => {
            printWindow.document.write('<tbody><tr >');
            
            // Check if menuItems exists
            if (item.menuItems) {
                printWindow.document.write(`<td style="border: 1px solid black"><strong>${item.menuItems.item_name + ' ' + item.menuItems.description}</strong></td>`);
                printWindow.document.write(`<td style="border: 1px solid black"><strong>${item.quantity}</strong></td>`);
                printWindow.document.write(`<td style="border: 1px solid black"><strong>${item.menuItems.price}</strong></td>`);
                printWindow.document.write(`<td style="border: 1px solid black"><strong>${(item.total)}</strong></td>`);
            } 
            // Check if drinks exists
            else if (item.drinks) {
                const drinkPrice = item.drinks.bottle !== null ? item.drinks.bottle : item.drinks.unit; // Use bottle price if available, otherwise unit price
                printWindow.document.write(`<td style="border: 1px solid black"><strong>${item.drinks.name}</strong></td>`);
                printWindow.document.write(`<td style="border: 1px solid black"><strong>${item.quantity}</strong></td>`);
                printWindow.document.write(`<td style="border: 1px solid black"><strong>${drinkPrice !== undefined ? drinkPrice : 'N/A'}</strong></td>`); // Handle undefined price
                printWindow.document.write(`<td style="border: 1px solid black"><strong>${(item.total)}</strong></td>`);
            } else {
                printWindow.document.write(`<td colspan="5" style="border: 1px solid black">Item data is missing</td>`);
            }
            
            printWindow.document.write('</tr>');
        });
    
        printWindow.document.write('</table>');
        printWindow.document.write(`<p style="padding-top: 2px"><strong>Subtotal: £ ${total + tax}<br/>Tax: £ ${tax}<br/>Total: £ ${total}<br/>`);
        if(cash !== null && card !== null) {
            printWindow.document.write(`Cash paid: £ ${cash}<br/>`);
            printWindow.document.write(`Card paid: £ ${card}</strong></p>`);
            printWindow.document.write(`<p>Change: £ ${(cash + card) - total}</p>`);
        }
        else if (cash !== null && card === null) {
            printWindow.document.write(`Cash paid: £ ${cash}</strong></p>`);
            printWindow.document.write(`<p><strong>Change: £ ${cash - total}</strong></p>`);
        }
        else if (cash === null && card !== null) {
            printWindow.document.write(`Card paid: £ ${card}</strong></p>`);
            printWindow.document.write(`<p><strong>Change: £ ${card - total}</strong></p>`);
        }
        printWindow.document.write('</body></html>');
        printWindow.print();
        printWindow.close(); 

        //setIsPrinting(false); // Reset printing state after printing
    }

    const handleKitchenPrint = ()=> {
        setIsPrinting(true); // Set printing state to true
        if (!order || items.length === 0) {
            Swal.fire({
                title: "No items to print!",
                icon: "warning",
            });
            return;
        }

        // Dynamically calculate the window height
        const baseHeight = 200; // Base height for header, footer, etc.
        const itemHeight = 30; // Estimated height per item
        const calculatedHeight = baseHeight + items.length * itemHeight;
    
        // Print receipt
        
        let printWindow = window.open('', '', `width=315,height=${calculatedHeight}`);
        printWindow.document.write('<html><head><title>Print Order</title>');
        printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">');
        printWindow.document.write('</head><body>');
        printWindow.document.write(`<div class="text-center"><img src="${logo}" alt="Your Logo" width="150" height="150" ></div>`); 
        printWindow.document.write(`<h4 class="text-center"><strong>Annys Restaurant & Bar</strong></h4>`);
        printWindow.document.write(`<p><strong>Order No: ${order.id}<br/> Waiter: ${order?.employees?.name}<br/>Table: ${order.tables?.table_no || 'N/A'}</strong></p>`);
        // printWindow.document.write(`<p><strong>Waiter: ${order?.employees?.name}</strong></p>`);
        // printWindow.document.write(`<p><strong>Table: ${order.tables?.table_no || 'N/A'}</strong></p>`); // Use optional chaining
        printWindow.document.write(`<table style="border: 2px solid black; width: 100%; text-align: left;">`);
        printWindow.document.write('<thead><tr style="background-color: #f2f2f2;"><th style="border: 1px solid black">Item</th><th style="border: 1px solid black">Qty</th></tr></thead>');
    
        items.forEach(item => {
            printWindow.document.write('<tbody><tr >');
            
            // Check if menuItems exists
            if (item.menuItems) {
                printWindow.document.write(`<td style="border: 1px solid black"><strong>${item.menuItems.item_name + ' ' + item.menuItems.description}</strong></td>`);
                printWindow.document.write(`<td style="border: 1px solid black"><strong>${item.quantity}</strong></td>`);
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
        //setIsPrinting(false); // Reset printing state after printing
    }

    // const handleKitchenPrint = (change)=> {
    //     if (!order || items.length === 0) {
    //         Swal.fire({
    //             title: "No items to print!",
    //             icon: "warning",
    //         });
    //         return;
    //     }
    
    //     // Print receipt
    //     let printWindow = window.open('', '', 'width=315', 'height=600');
    //     printWindow.document.write('<html><head><title>Print Order</title>');
    //     printWindow.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">');
    //     printWindow.document.write('</head><body>');
    //     printWindow.document.write(`<img src="${logo}" alt="Your Logo" width="200" height="200">`);
    //     printWindow.document.write(`<h4 class="text-center"><strong>Annys Restaurant & Bar</strong></h4>`);
    //     printWindow.document.write(`<p><strong>Order No: ${order.id}</strong></p>`);
    //     printWindow.document.write(`<p><strong>Waiter: ${order?.employees?.name}</strong></p>`);
    //     printWindow.document.write(`<p><strong>Table: ${order.tables?.table_no || 'N/A'}</strong></p>`); // Use optional chaining
    //     printWindow.document.write('<table class="table table-bordered table-sm" style={{width="100%}}>');
    //     printWindow.document.write('<thead class="table-dark"><tr><th>Item</th><th>Description</th><th>Quantity</th></tr></thead>');
    
    //     items.forEach(item => {
    //         printWindow.document.write('<tbody><tr>');
            
    //         // Check if menuItems exists
    //         if (item.drinks === null) {
    //             printWindow.document.write(`<td><strong>${item.menuItems.item_name}</strong></td>`);
    //             printWindow.document.write(`<td><strong>${item.menuItems.description}</strong></td>`);
    //             printWindow.document.write(`<td><strong>${item.quantity}</strong></td>`);
    //         } else {
    //             printWindow.document.write(`<td colspan="5">Item data is missing</td>`);
    //         }
            
    //         printWindow.document.write('</tr>');
    //     });
    
    //     printWindow.document.write('</table>');
    //     printWindow.document.write('</body></html>');
    //     printWindow.print();
    //     // printWindow.close();
    // }


    return (
        <>
            <Container>
                <Stack spacing={1}>
                    <Box sx={{ minWidth: 160, paddingTop: 1}}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Select table to show order</InputLabel>
                            <Select
                                size="small"
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={table}
                                label="Select table to show order"
                                onChange={handleChange}
                            >
                                <MenuItem value="none">
                                    <em>None</em>
                                </MenuItem>
                                {tables?.map((table)=>
                                    <MenuItem value={table.table_no}>Table {table.table_no}</MenuItem>
                                )}
                            
                            </Select>
                        </FormControl>
                    </Box>
                    <hr/>
                    <Box> 
                        <Typography variant='button' component='h2'>Annys Restaurant & Pub </Typography>
                        {order === null ? (
                            ''
                        ) : (
                            <>
                                <Typography variant='caption' component='h2'>Order No: {order?.id} <span style={{float: 'right'}}>{formattedDate}</span></Typography>
                                <Typography variant='caption' component='h2'>Employee: {order?.employees?.name} <span style={{float: 'right'}}>Table {order?.tables?.table_no}</span></Typography>
                            </>
                        )}
                        {/* <Typography variant='caption' component='h2'>Receipt <span style={{float: 'right'}}>16th September 2024, 11:04am</span></Typography> */}
                    </Box>
                    <hr/>
                    <Box> 
                        <div 
                            style={{ 
                                overflowY: 'scroll', 
                                height: 350,
                                scrollbarWidth: '5px',
                                scrollbarColor: '#fff #fff',
                            }}
                        >
                            {order ? (<>
                                {items?.map((item, i)=>
                                    <Box sx={{borderColor: '#dce6df', borderBottom: 'solid 1px #dce6df'}}>
                                        <Grid2 container >
                                            <Grid2 size={10}>
                                                {item?.menuItems?.item_name ? (
                                                    <p><strong>{item.menuItems.item_name} </strong>{item.menuItems.description}</p>
                                                ):(
                                                    <p><strong>{item.drinks.name}</strong></p>
                                                )}
                                            </Grid2>
                                            <Grid2 size={2}>
                                            {!isPrinting && !isPaymentMade && (
                                                <IconButton onClick={()=> handleDeleteItem(item)} aria-label="delete" color="error"  disabled={isPrinting}>
                                                    <CancelIcon />
                                                </IconButton>
                                            )}
                                            </Grid2>
                                        </Grid2>
                                        <Grid2 container spacing={1}>
                                            <Grid2 size={3}>
                                                {item?.type === "food" ? (
                                                   <Typography variant="button" component="h6">Qty: {item.quantity}</Typography>
                                                ) : item?.drinks.bottle > 0 ? (
                                                    <Typography variant="button" component="h6">Qty:  {item.quantity}</Typography>
                                                ) : (
                                                    <Typography variant="button" component="h6">Qty:  {item.quantity}</Typography>
                                                )}
                                            </Grid2>
                                            <Grid2 size={6}>
                                                &#163; {item?.total}
                                            </Grid2>
                                        </Grid2>
                                    </Box>
                                )}
                            </>
                            ) : (
                                <Typography variant="button" component="h5">No Order</Typography>
                            )}
                        </div>
                    </Box>

                    <Box sx={{ backgroundColor: "#f2f5f3", padding: 2, borderRadius: 2}}> 
                        <Typography variant="h6" component="h2">
                            <span>Total</span>
                            <span style={{float: 'right'}}>&#163;  {total.toFixed(2)}</span>
                        </Typography>
                    </Box>
                    {key > 0  ? (
                        <>
                        {total > 0 ? (
                            <>
                                <Stack direction="row" spacing={1}>
                                    <Button id="pay-button" fullWidth onClick={handlePrint}>Print</Button>
                                    <Button id="pay-button" variant="contained" fullWidth onClick={handleKitchenPrint}>Print for kitchen</Button>
                                </Stack>
                                <Button variant="outlined" size="large" fullWidth onClick={handleOpenPaymentDialog} id="print-button">
                                Pay
                                </Button>
                            </>
                        ) : ('')}
                        </>
                    ) : (
                        <h5 class="text-center mt-3">Select an order to pay</h5>
                    )}
                </Stack>
            </Container>

            {/* Modal for payment options */}
            <Modal open={openPaymentDialog} onClose={handleClosePaymentDialog} aria-labelledby="modal-title" aria-describedby="modal-description" disableAutoFocus={true}>
                <Box sx={style}>
                    <Typography id="modal-title" variant="h6" component="h2" style={{ textAlign: 'center' }}>
                        Select Payment Method
                    </Typography>

                    {/* {errMsg ? <Alert variant="filled" severity="error">{errMsg}</Alert> : ''} */}

                    <FormControl>
                        {/* <FormLabel id="demo-row-radio-buttons-group-label">Select table status</FormLabel> */}
                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                            // defaultValue="all"
                            onChange={(e)=> setPaymentType(e.target.value)}
                        >
                            <FormControlLabel value="cash" control={<Radio />} label="Cash" />
                            <FormControlLabel value="card" control={<Radio />} label="Card" />
                            <FormControlLabel value="both" control={<Radio />} label="Cash & Card" />
                        </RadioGroup>
                    </FormControl>

                                
                    {paymentType === 'cash' && (
                        <div>
                            <h3>Cash Payment</h3>
                            <TextField
                                type="number"
                                id="outlined-basic"
                                placeholder="Enter amount in cash"
                                fullWidth 
                                label="Cash amount"
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value); // Parse to float
                                    setCash(value >= 0 ? value : 0); // Ensure value is non-negative
                                }}
                                variant="outlined"
                                value={cash}
                            />

                            <Button 
                            variant="contained" 
                            fullWidth mt={2} 
                            onClick={handleCash}
                            
                            >Submit</Button>
                        </div>
                    )}

                    {paymentType === 'card' && (
                        <div>
                            <h3>Credit Payment</h3>
                            <TextField
                                type="number"
                                id="outlined-basic"
                                placeholder="Enter card amount"
                                fullWidth 
                                label="Card amount"
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value); // Parse to float
                                    setCard(value >= 0 ? value : 0); // Ensure value is non-negative
                                }}
                                variant="outlined"
                                value={card}
                            />
                            <Button
                                variant="contained"
                                fullWidth
                                style={{ marginTop: '16px' }} // Using inline style for margin
                                onClick={handleCard}
                            >
                            Submit
                            </Button>
                        </div>
                    )}

                    {paymentType === 'both' && (
                        <>
                            <div>
                                <h3>Cash Payment</h3>
                                <TextField
                                    type="number"
                                    id="outlined-basic"
                                    placeholder="Enter amount in cash"
                                    fullWidth 
                                    label="Cash amount"
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value); // Parse to float
                                        setCash(value >= 0 ? value : 0); // Ensure value is non-negative
                                    }}
                                    variant="outlined"
                                    value={cash}
                                    mb={2}
                                />

                                <h3>Card Payment</h3>
                                <TextField
                                    type="number"
                                    id="outlined-basic"
                                    placeholder="Enter card amount"
                                    fullWidth 
                                    label="Card amount"
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value); // Parse to float
                                        setCard(value >= 0 ? value : 0); // Ensure value is non-negative
                                    }}
                                    variant="outlined"
                                    value={card}
                                    
                                />
                            </div>
                            <Button
                                variant="contained"
                                fullWidth
                                style={{ marginTop: '16px' }} // Using inline style for margin
                                onClick={handleBoth} 
                            >
                            Submit
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>
            
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Total: &#163; {total}
                </Typography>
                <hr/> 
                <TextField id="outlined-basic" fullWidth type="number" onChange={(e)=> setCash(e.target.value)} label="Cash amount" variant="outlined" />
                <Button variant="contained" fullWidth mt={2} onClick={handleCash}>Submit</Button>
                </Box>
            </Modal>

            <Modal
                open={openCard}
                onClose={handleCloseCard}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Total: &#163; {total}
                </Typography>
                <hr/>
                <TextField id="outlined-basic" fullWidth type="number" onChange={(e)=> setCash(e.target.value)} label="Card amount" variant="outlined" />
                <Button variant="contained" fullWidth mt={2} onClick={handleCard}>Submit</Button>
                </Box>
            </Modal>
        </>
    )
}
 
export default Receipt;