import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';

const PROJECT_URI = 'https://jzgrowofybjstbasfcpq.supabase.co'
const PROJECT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z3Jvd29meWJqc3RiYXNmY3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0ODYxNjcsImV4cCI6MjA0NDA2MjE2N30.VAbfV_ChT5carGQWro2eCyx5H1Dj8HXb1H-7jIQ7DcE'

const supabase = createClient(PROJECT_URI, PROJECT_ANON)

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
    'Oliver Hansen',
    'Van Henry',
    'April Tucker',
    'Ralph Hubbard',
    'Omar Alexander',
    'Carlos Abbott',
    'Miriam Wagner',
    'Bradley Wilkerson',
    'Virginia Andrews',
    'Kelly Snyder',
  ];
  
  function getStyles(name, personName, theme) {
    return {
      fontWeight: personName.includes(name)
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular,
    };
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

const Tables = ()=> {
    const [tables, setTables] = useState([]);
    const [availableTables, setAvailableTables] = useState([]);
    const [occupiedTables, setOccupiedTables] = useState([]);
    const [dirtyTables, setDirtyTables] = useState([]);
    const [table, setTable] = useState([]);
    const [items, setItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [order, setOrder] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [employee, setEmployee] = useState('');
    const [tableStatus, setTableStatus] = useState('all');
    const [openAvailable, setOpenAvailable] = useState(false);
    const [open, setOpen] = useState(false);
    const [personName, setPersonName] = useState([]);
    const [totalQty, setTotalQty] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const theme = useTheme();

    const handleError = (error) => {
        Swal.fire({ title: "Failed", text: error.message, icon: "error" })
    }
    
    useEffect(() => {
        const controller = new AbortController();
        var isMounted = true

        const getTables = async ()=> {
            try {
                let { data: tables, error } = await supabase
                .from('tables')
                .select('*') 
                .order('table_no', { ascending: true }); 
                        
                isMounted && setTables(tables)
                
            } catch (error) {
                handleError(error)
            }
        }

        const getEmployees = async ()=> {  
            try {
                let { data: employees, error } = await supabase
                .from('employees')
                .select('*')
                .order("id", { ascending: true })
            
                isMounted && setEmployees(employees)
                
            } catch (error) {
                handleError(error)
            }
        }

        getTables();
        getEmployees();

        return ()=> {
            isMounted = false
            controller.abort();
        }
    
    }, [])
  
    const handleChange = async (event) => {
        setEmployee(event.target.value);
        console.log(event.target.value);
    };

    const handleOpenAvailable = (item) => {
        setOpenAvailable(true)

        setTable(item)
        console.log(item)
    };

    const handleOpenOccupied = async (item) => {
        setTable(item)
        setOpen(true)

        console.log(item)
        let { data: orders, error } = await supabase
        .from('orders')
        .select(`*, waiter(*)`)
        .eq('table', item.id)

        setOrder(orders[0])

        if(error) {console.log(error)}
        else {
            if(orders.length === 0) {
                console.log('no order placed')
                setItems([])
            }
            else {
                let { data: ordersItems, error } = await supabase
                .from('ordersItems')
                .select(`*, menuItems(*), drinks(*), orders(*, waiter(*), table(*))`)
                .eq('order_no', orders[0].id)
    
                setItems(ordersItems)
                
                const totalQuantity = ordersItems.reduce((acc, cur) => acc + cur.quantity, 0);
                const total = ordersItems.reduce((acc, cur) => acc + cur.total, 0);
                setTotalQty(totalQuantity)
                setTotalPrice(total)
                
                console.log(ordersItems)
            }
        }

        

        // const newOrder = async ()=> {
        //     try {
        //         let { data: orders, error } = await supabase
        //         .from('orders')
        //         .select('*')
        //         .eq('table', item.table_no)
    
        //         console.log(orders[0])
    
        //         return orders[0]
                
        //     } catch (error) {
        //         handleError(error)
        //     }
        // }

        // try {
        //     let { data: ordersItems, error } = await supabase
        //     .from('ordersItems')
        //     .select('*')
        //     .eq('order_no', newOrder.id)
    
        //     console.log(ordersItems)
            
        //     
    
        //     console.log(item)
        
        // } catch (error) {
        //     handleError(error)
        // }

    };

    const handleClose = () => setOpen(false);
    const handleCloseAvailable = () => setOpenAvailable(false);

    useEffect(() => {
        const controller = new AbortController();
        var isMounted = true

        const getTables = async ()=> {
            if(tableStatus === 'all') {
                try {
                    let { data: tables, error } = await supabase
                    .from('tables')
                    .select('*') 
                    .order('table_no', { ascending: true });
                            
                    isMounted && setTables(tables)
                    
                } catch (error) {
                    handleError(error)
                }
            }
            else {
                try {
                    let { data: tables, error } = await supabase
                    .from('tables')
                    .select('*') 
                    .eq('status', tableStatus)
                    .order('table_no', { ascending: true });
                            
                    setTables(tables)
                    
                } catch (error) {
                    handleError(error)
                }
            }
        }

        getTables();

        return () => {
            isMounted = false
            controller.abort();
        }
    }, [tableStatus])

    const getTables = async ()=> {
        try {
            let { data: tables, error } = await supabase
            .from('tables')
            .select('*') 
            .order('table_no', { ascending: true });
                    
            setTables(tables)
            
        } catch (error) {
            handleError(error)
        }
    }

    const handleAssign = async ()=> {
        if(table.status === 'available' && employee != ''){
            try {
                const { data: tables, error: tablesError } = await supabase
                .from('tables')
                .update(
                    { 
                        status: 'occupied',
                        assign: employee.id
                    }
                )
                .eq('table_no', table.table_no)
                .select()

                if (tablesError) console.error(tablesError)
    
                try {
                    const { data: orders, error} = await supabase
                    .from('orders')
                    .insert([
                    { table: table.id, waiter: employee.id },
                    ])
                    .select()
                    
                    console.log(orders)
                    
                } catch (error) {
                    handleError(error)
                }

                Swal.fire({
                    title: `TABLE ASSIGNED TO ${employee.name}`,
                    icon: "success"
                });

                setEmployee(null)
                getTables();
                handleCloseAvailable();
                
                
            } catch (error) {
                handleError(error)
            }

        }
        else {
            Swal.fire({
                title: `SELECT A WAITER`,
                icon: "error"
            });

            handleCloseAvailable();
        }
    }

    const handleDirtyTables = async (item)=> {
        try {
            const { data, error: tableError } = await supabase
            .from('tables')
            .update(
                { 
                    status: 'available',
                    assign: null,
                }
            )
            .eq('table_no', table.table_no)
            .select()


            const { error: ordersError } = await supabase
            .from('orders')
            .delete()
            .eq('table', table.table_no)
        

            getTables();

            Swal.fire({
                title: "TABLE AVAILABLE NOW!",
                icon: "success"
            });
            
        } catch (error) {
            handleError(error)
        }
    }

    const handleClearState = ()=> {
        setOrder([]);
        setItems([])
    }


    return(
        <>
            <div class="card text-center">
                <div class="card-header">
                    <Typography variant='button' component='h5' >Tables</Typography>
                </div>
                <div class="card-body">
                    <Box my={1} sx={{backgroundColor: '#fff', padding: 3, borderRadius: 4}}>
                    <FormControl>
                        <FormLabel id="demo-row-radio-buttons-group-label">Select table status</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                            defaultValue="all"
                            onChange={(e)=> setTableStatus(e.target.value)}
                        >
                            <FormControlLabel value="all" control={<Radio />} label="All" />
                            <FormControlLabel value="available" control={<Radio />} label="Available" />
                            <FormControlLabel value="occupied" control={<Radio />} label="Occupied" />
                            {/* <FormControlLabel value="dirty" control={<Radio />} label="Dirty" /> */}
                        </RadioGroup>
                    </FormControl>
                    </Box>
                    <Grid container spacing={2}>
                        {tables?.map((table, i)=>
                            <Grid key={i} size={3}>
                                
                                { table.status === 'available' ? (
                                        <div class="card text-bg-success text-center mb-3" style={{width: "18rem"}}>
                                            <div class="card-body">
                                                <h4 class="card-title">TABLE</h4>
                                                <h1 class="card-title">{table.table_no}</h1>
                                                <button onClick={()=> handleOpenAvailable(table)} class="btn btn-light">ASSIGN TABLE</button>
                                            </div>
                                        </div>
                                        // <Button variant="contained" onClick={()=> handleOpenAvailable(table)} size="large" sx={{padding: 4}} color="success">Table {table.table_no}</Button>
                                    )
                                    : table.status === 'occupied' ? (
                                        <div class="card text-bg-warning text-center mb-3" style={{width: "18rem"}}>
                                            <div class="card-body">
                                                <h4 class="card-title">TABLE</h4>
                                                <h1 class="card-title">{table.table_no}</h1>
                                                <button data-bs-toggle="modal" data-bs-target="#staticBackdrop" onClick={()=> handleOpenOccupied(table)} class="btn btn-light">VIEW ORDER</button>
                                            </div>
                                        </div>
                                        // <Button variant="contained" data-bs-toggle="modal" data-bs-target="#staticBackdrop" onClick={()=> handleOpenOccupied(table)} sx={{padding: 4}} size="large" p={5} color="warning">Table {table.table_no}</Button>
                                    )
                                    : (
                                        <div class="card text-bg-danger text-center mb-3" style={{width: "18rem"}}>
                                            <div class="card-body">
                                                <h4 class="card-title">TABLE</h4>
                                                <h1 class="card-title">{table.table_no}</h1>
                                                <button onClick={()=> handleDirtyTables(table)} class="btn btn-light">CLEAN TABLE</button>
                                            </div>
                                        </div>
                                        // <Button variant="contained" size="large" sx={{padding: 4}} onClick={()=> handleDirtyTables(table)} color="error">Table {table.table_no}</Button>
                                    ) 
                                }

                            </Grid>
                        )}
                    </Grid>
                </div>
            
                <div class="card-footer text-body-secondary">
                    Clean dirty tables ASAP!
                </div>
            </div>

            {/* Modal for available */}
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={openAvailable}
                onClose={handleCloseAvailable}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                backdrop: {
                    timeout: 500,
                },
                }}
            >
                <Fade in={openAvailable}>
                <Box sx={style}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="demo-simple-select-label">Assign table to waiter</InputLabel>
                        <Select
                            size="small"
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={employee}
                            label="Select table to show order"
                            onChange={handleChange}
                        >
                            {employees?.map((employee)=>
                                <MenuItem value={employee}>{employee.name}</MenuItem>
                            )}
                        
                        </Select>
                    </FormControl>
                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={handleAssign} size="large" fullWidth>Assign</Button>
                        <Button variant="contained" size="large" fullWidth color="error" onClick={handleCloseAvailable}>cancel</Button>
                    </Stack>
                </Box>
                </Fade>
            </Modal>  


            {/* Modal for occupied */}
            <div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                    <div class="modal-header">
                        <div class="hstack gap-3">
                            <div class="p-2">
                                <h1 class="modal-title fs-5" id="staticBackdropLabel">ORDER NO. {order?.id}</h1> 
                            </div>
                            <div class="p-2 ms-auto">
                                <h1 class="modal-title fs-5" id="staticBackdropLabel">SERVED BY {order?.waiter?.name}</h1> 
                            </div>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={handleClearState}></button>
                    </div>
                    <div class="modal-body p-2">
                        {items.length > 0 ? (
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
                                    {items?.map((item, index)=>
                                        <tr key={index}>
                                            <th scope="row">{index + 1}</th>
                                            {item?.item > 0 ? (
                                                <>
                                                    <td>{item.menuItems.item_name} {item.menuItems.description}</td>
                                                    <td>&#163; {item.menuItems.price}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>&#163; {item.menuItems.price * item.quantity}</td> 
                                                </>
                                            ) : (
                                                <>
                                                    <td>{item.drinks.name.toUpperCase()}</td>
                                                    <td>&#163; {item.drinks.price}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>&#163; {item.total}</td> 
                                                </>
                                            ) } 
                                        </tr>
                                    )}
                                    <tr>
                                    <td colspan="3"><h6>Total</h6></td>
                                    <td><strong>{totalQty}</strong></td>
                                    <td><strong>&#163; {totalPrice}</strong></td>
                                    </tr>
                                    <tr>
                                    <td colspan="4"><h6>Discount</h6></td>
                                    <td>0</td>
                                    </tr>
                                    <tr>
                                    <td colspan="4"><h6>Grand Total</h6></td>
                                    <td><strong>&#163; {totalPrice}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        ) : (
                            <div class="text-center">
                                <p><em><strong>NOTHING ORDERED YET</strong></em></p>
                                <button type="button" class="btn btn-danger" data-bs-dismiss="modal" onClick={handleDirtyTables}>Close Table</button>
                            </div>
                        )}
                    </div>
                    <div class="modal-footer">
                        {/* <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button> */}
                        {/* <button type="button" class="btn btn-primary">PRINT FOR KITCHEN</button>
                        <button type="button" class="btn btn-success">MAKE PAYMENT</button> */}
                    </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Tables; 