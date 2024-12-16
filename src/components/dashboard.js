import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid2'; 
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from "react";
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Swal from 'sweetalert2';
import { createTheme, ThemeProvider } from '@mui/material/styles';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import CurrencyPoundIcon from '@mui/icons-material/CurrencyPound';
// import CreditCardIcon from '@mui/icons-material/CreditCard';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

dayjs.extend(utc);

const PROJECT_URI = 'https://jzgrowofybjstbasfcpq.supabase.co'
const PROJECT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z3Jvd29meWJqc3RiYXNmY3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0ODYxNjcsImV4cCI6MjA0NDA2MjE2N30.VAbfV_ChT5carGQWro2eCyx5H1Dj8HXb1H-7jIQ7DcE'

const supabase = createClient(PROJECT_URI, PROJECT_ANON);

const theme = createTheme({
    typography: {
      fontFamily: 'Inter',
    },
    backgroundColor: '#fff'
});


const Dashboard = ()=> {
    const [data, setData] = useState([]);
    const [traditional, setTraditional] = useState([]);
    const [mainmeal, setMainMeal] = useState([]);
    const [soups, setSoups] = useState([]);
    const [extras, setExtras] = useState([]);
    const [desserts, setDesserts] = useState([]);
    const [starters, setStarters] = useState([]);
    const [ordersItems, setOrdersItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [pending, setPending] = useState([]);
    const [ready, setReady] = useState([]);
    const [served, setServed] = useState([]);
    const [date, setDate] = useState([]);
    const [report, setReport] = useState('xreport');
    const [cash, setCash] = useState(0);
    const [card, setCard] = useState(0);
    const [total, setTotal] = useState(0);
    const [alignment, setAlignment] = useState('table');

    const getOrders = async ()=> {
        try {
            let { data: ordersItems, error } = await supabase
            .from('ordersItems')
            .select(`*,
                menuItems(*),
                orders(*)
            `)

            if(error) {console.log(error)}
    
            setOrdersItems(ordersItems)
            
            setPending(ordersItems?.filter(item => item.status === "pending"));
            setReady(ordersItems?.filter(item => item.status === "ready"));
            setServed(ordersItems?.filter(item => item.status === "served"));

        } catch (error) {
            Swal.fire({
                title: "Failed!",
                text: "Orders could not load.",
                icon: "error"
            });
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        var isMounted = true
  
        const getMenuItems = async ()=> {
            try {
                let { data: menuItems, error } = await supabase
                .from('menuItems')
                .select('*')
            
                if (error) {console.log(error)}

                isMounted && setData(menuItems)

                setStarters(menuItems.filter(item => item.category === "starters"));
                setTraditional(menuItems.filter(item => item.category === "traditional"));
                setMainMeal(menuItems.filter(item => item.category === "main meal"));
                setSoups(menuItems.filter(item => item.category === "soups only"));
                setDesserts(menuItems.filter(item => item.category === "desserts (STA)"));
                setExtras(menuItems.filter(item => item.category === "extras/ sides"));
            
            } catch (error) {
                Swal.fire({
                    title: "Failed!",
                    text: "Menu items could not load.",
                    icon: "error"
                });
            }
        }

        const getOrderItems = async ()=> {
            try {
                let { data: ordersItems, error } = await supabase
                .from('ordersItems')
                .select(`*,
                    menuItems(*),
                    orders(*,
                    employees(*))
                `)
                .eq("orders")

                if(error) {console.log(error)};
    
                isMounted && setOrdersItems(ordersItems)
                console.log(ordersItems)
    
                
                setReady(ordersItems?.filter(item => item.status === "ready"));
            } catch (error) {
                Swal.fire({
                    title: "Failed!",
                    text: "Order items could not load.",
                    icon: "error"
                });
            }
        }

        const getOrders = async ()=> {
            try {
                let { data: orders, error } = await supabase
                .from('orders')
                .select(`*, employees(*)`)

                if(error) {console.log(error)}
    
                const cash = orders.reduce((acc, cur) => acc + cur.cash, 0);
                const card = orders.reduce((acc, cur) => acc + cur.card, 0);
                const total = orders.reduce((acc, cur) => acc + cur.total, 0);
    
                setCash(cash);
                setCard(card);
                setTotal(total);  
                isMounted && setOrders(orders)
                setPending(orders?.filter(item => item.status === "pending"));
                
            } catch (error) {
                Swal.fire({
                    title: "Failed!",
                    text: "Orders could not load.",
                    icon: "error"
                });
            }

        }
  
        getOrders()
        getOrderItems();
        getMenuItems();
  
        return ()=> {
            isMounted = false
            controller.abort();
        }
      
    }, [])

    // const handleClick = async (item)=> {
    //     Swal.fire({
    //         title: "Are you sure?",
    //         text: "Has the order been served?!",
    //         icon: "warning",
    //         showCancelButton: true,
    //         confirmButtonColor: "#3085d6",
    //         cancelButtonColor: "#d33",
    //         confirmButtonText: "Yes!"
    //     }).then(async (result) => {
    //         if (result.isConfirmed) {
    //         const { data, error } = await supabase
    //         .from('ordersItems')
    //         .update({ status: 'served' })
    //         .eq('id', item.id)
    //         .select()

    //         getOrders();                    
    //         }
    //     });
        
    // }

    const handleDate = (date)=> {
        setDate(date)

        console.log(date)
    }

    return(
        <Container>
            <ThemeProvider theme={theme}>
                <Typography variant='h6' component='h5' my={2}>Dashboard</Typography>
            </ThemeProvider>
            <hr/>
            


            <Box mt={4}>
                <Box mb={5}>
                    <Grid container spacing={2} >
                        <Grid size={6}>
                            <Box sx={{backgroundColor: '#fff', padding: 2, borderRadius: 4, height: 400}}>
                                <Stack spacing={2}>
                                    <Typography variant="button" component="h5" color="warning"><Chip label="pending orders" fullWidth avatar={<Avatar>{pending.length}</Avatar>} color="warning" /> </Typography>
                                    {/* <LinearProgress color="warning" /> */}
                                </Stack>
                                <div
                                    style={{ 
                                        overflowY: 'scroll', 
                                        height: 300,
                                        scrollbarWidth: '5px',
                                        scrollbarColor: '#fff #fff',
                                        paddingTop: 3
                                    }}
                                >
                                
                                    <Stack spacing={1} mt={2}>
                                        {pending.map((item)=> 
                                            <>
                                            {/* <Typography variant="caption" component="h5" >{item.menuItems.item_name + ' ' +item.menuItems.description}</Typography> */}
                                            <div class="hstack gap-5">
                                                <div class="p-2">
                                                    <strong>Order No. :</strong>{item.id}
                                                    {/* <Typography variant='caption' component='h2'>Order No: {item.order_no} <span style={{float: 'right'}}></span></Typography> */}
                                                </div>
                                                <div class="p-2"><strong>Table :</strong>{item.table}</div>
                                            </div>
                                            <hr/>
                                            </>
                                        )}
                                    </Stack>
                                </div>
                            </Box>
                        </Grid>
                        {/* <Grid size={6}>
                            <Box sx={{backgroundColor: '#fff', padding: 2, borderRadius: 4, height: 400}}>
                                <Stack spacing={2}>
                                    <Typography variant="button" component="h5" color="success"><Chip label="ready orders" color="success" avatar={<Avatar>{ready.length}</Avatar>}/> </Typography>
                                </Stack>
                                <div
                                    style={{ 
                                        overflowY: 'scroll', 
                                        height: 300,
                                        scrollbarWidth: '5px',
                                        scrollbarColor: '#fff #fff',
                                        paddingTop: 3
                                    }}
                                >
                                    <Stack spacing={1} mt={2}>
                                        {ready.map((item)=> 
                                            <>
                                            <Typography variant="caption" component="h5" >{item.menuItems.item_name + ' ' +item.menuItems.description}</Typography>
                                            <Typography variant='caption' component='h2'>Order No: {item.order_no} <span style={{float: 'right'}}>{item.orders.employees.name}</span></Typography>
                                            <hr/>
                                            </>
                                        )}
                                    </Stack>
                                </div>
                            </Box>
                        </Grid> */}
                    </Grid>
                </Box>
                {/* <Divider textAlign="left"> 
                    <Chip label={data.length} size="small" />
                </Divider> */}
                <Grid container spacing={2} mt={2}>
                    <Grid size={4}>
                        <div class="card text-bg-primary mb-3" style={{maxWidth: "18rem"}}>
                            <div class="card-header"><h5>Traditional</h5></div>
                            <div class="card-body">
                                <h3>{traditional.length}</h3>
                                <p class="card-text"></p>
                            </div>
                        </div>
                    </Grid>

                    <Grid size={4}>
                        <div class="card text-bg-warning mb-3" style={{maxWidth: "18rem"}}>
                            <div class="card-header"><h5>Main meal</h5></div>
                            <div class="card-body">
                                <h3>{mainmeal.length}</h3>
                                <p class="card-text"></p>
                            </div>
                        </div>
                    </Grid>

                    <Grid size={4}>
                        <div class="card text-bg-danger mb-3" style={{maxWidth: "18rem"}}>
                            <div class="card-header"><h5>Starters</h5></div>
                            <div class="card-body">
                                <h3>{starters.length}</h3>
                                <p class="card-text"></p>
                            </div>
                        </div>
                    </Grid>

                    <Grid size={4}>
                        <div class="card text-bg-light mb-3" style={{maxWidth: "18rem"}}>
                            <div class="card-header"><h5>Desserts</h5></div>
                            <div class="card-body">
                                <h3>{desserts.length}</h3>
                                <p class="card-text"></p>
                            </div>
                        </div>
                    </Grid>

                    <Grid size={4}>
                        <div class="card text-bg-dark mb-3" style={{maxWidth: "18rem"}}>
                            <div class="card-header"><h5>Soups Only</h5></div>
                            <div class="card-body">
                                <h3>{soups.length}</h3>
                                <p class="card-text"></p>
                            </div>
                        </div>
                    </Grid>

                    <Grid size={4}>
                        <div class="card text-bg-success mb-3" style={{maxWidth: "18rem"}}>
                            <div class="card-header"><h5>Extras/Sides</h5></div>
                            <div class="card-body">
                                <h3>{extras.length}</h3>
                                <p class="card-text"></p>
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </Box>

        </Container>
    )
}
export default Dashboard; 