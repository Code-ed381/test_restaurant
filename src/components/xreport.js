import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid2'; 
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from "react";
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Swal from 'sweetalert2';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CardActionArea from '@mui/material/CardActionArea';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CurrencyPoundIcon from '@mui/icons-material/CurrencyPound';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const PROJECT_URI = 'https://jzgrowofybjstbasfcpq.supabase.co'
const PROJECT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z3Jvd29meWJqc3RiYXNmY3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0ODYxNjcsImV4cCI6MjA0NDA2MjE2N30.VAbfV_ChT5carGQWro2eCyx5H1Dj8HXb1H-7jIQ7DcE'

const supabase = createClient(PROJECT_URI, PROJECT_ANON);

const theme = createTheme({
    typography: {
      fontFamily: 'Inter',
    },
});


const Xreceipt = ()=> {
    const [data, setData] = useState([]);
    const [traditional, setTraditional] = useState([]);
    const [mainmeal, setMainMeal] = useState([]);
    const [soups, setSoups] = useState([]);
    const [extras, setExtras] = useState([]);
    const [desserts, setDesserts] = useState([]);
    const [starters, setStarters] = useState([]);
    const [orders, setOrders] = useState([]);
    const [order, setOrder] = useState([]);
    const [pending, setPending] = useState([]);
    const [ready, setReady] = useState([]);
    const [served, setServed] = useState([]);
    const [date, setDate] = useState([]);
    const [report, setReport] = useState('xreport');
    const [filterType, setFilterType] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedDate, setSelectedDate] = useState([]);
    const [employee, setEmployee] = useState(''); 
    const [cash, setCash] = useState(0);
    const [cashs, setCashs] = useState(0);
    const [card, setCard] = useState(0);
    const [cards, setCards] = useState(0);
    const [total, setTotal] = useState(0);
    const [totals, setTotals] = useState(0);
    const [alignment, setAlignment] = useState('table');
    const [filtered, setFiltered] = useState('false');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const convertDate = (dateString) => {
        // Create a new Date object from the input string
        const date = new Date(dateString);
    
        // Format the date as "18 Jun 2022, 15:20"
        const options = { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false // Use 24-hour format
        };
    
        const formattedDate = date.toLocaleDateString('en-GB', options);
    
        return formattedDate;
    };
    
    const formatNumber = (number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    };

    const handleError = (error) => {
        Swal.fire({ title: "Failed", text: error.message, icon: "error" })
    }

    const handleChangeAlignment = (event, newAlignment) => {
        setAlignment(newAlignment);
    };
    
    const getOrders = async ()=> {
        try {
            let { data: orders, error } = await supabase
            .from('orders')
            .select(`*, waiter(*)`)
            .order('id', { ascending: true }); 

            const cash = orders.reduce((acc, cur) => acc + cur.cash, 0);
            const card = orders.reduce((acc, cur) => acc + cur.card, 0);
            const total = orders.reduce((acc, cur) => acc + cur.total, 0)

            setCash(formatNumber(cash.toFixed(2)));
            setCard(formatNumber(card.toFixed(2)));
            setTotal(formatNumber(total.toFixed(2))); 
            setOrders(orders)
            
        } catch (error) {
            handleError(error)
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        var isMounted = true

        const getEmployees = async ()=> {
            try {
                let { data: employees, error } = await supabase
                .from('employees')
                .select('*')
    
                isMounted && setEmployees(employees)        
                
            } catch (error) {
                handleError(error)
            }
        }
  
        const getMenuItems = async ()=> { 
            try {
                let { data: menuItems, error } = await supabase
                .from('menuItems')
                .select('*')
            
                isMounted && setData(menuItems)
                
                setStarters(menuItems.filter(item => item.category === "starters"));
                setTraditional(menuItems.filter(item => item.category === "traditional"));
                setMainMeal(menuItems.filter(item => item.category === "main meal"));
                setSoups(menuItems.filter(item => item.category === "soups only"));
                setDesserts(menuItems.filter(item => item.category === "desserts (STA)"));
                setExtras(menuItems.filter(item => item.category === "extras/ sides"));
                
            } catch (error) {
                handleError(error)
            } 
        }

        const getOrdersNow = async ()=> {
            try {
                let { data: orders, error } = await supabase
                .from('orders')
                .select(`*, waiter(*)`)
                .order('id', { ascending: true }); 
    
                const cash = orders.reduce((acc, cur) => acc + cur.cash, 0);
                const card = orders.reduce((acc, cur) => acc + cur.card, 0);
                const total = orders.reduce((acc, cur) => acc + cur.total, 0)
    
                setCash(formatNumber(cash.toFixed(2)));
                setCard(formatNumber(card.toFixed(2)));
                setTotal(formatNumber(total.toFixed(2)));   
                isMounted && setOrders(orders)
                
            } catch (error) {
                handleError(error)
            }
        }

  
        getEmployees();
        getMenuItems();
        getOrdersNow();
  
        return ()=> {
            isMounted = false
            controller.abort();
        }
      
    }, [])

    const handleChange = async (e)=> {
        try {
            let { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('waiter', e.target.value)
            .order('id', { ascending: true }); 
    
            setOrders(orders)
            const cash = orders.reduce((acc, cur) => acc + cur.cash, 0);
            const card = orders.reduce((acc, cur) => acc + cur.card, 0);
            const total = orders.reduce((acc, cur) => acc + cur.total, 0);
    
            setCash(cash);
            setCard(card);
            setTotal(total);             
        } catch (error) {
            handleError(error)
            setOrder([]);
        }
    }
    
    // Helper function to extract the day, month, and year from a date
    const getDayMonthYear = (date) => ({
        day: date.getUTCDate(),
        month: date.getUTCMonth() + 1, // Months are zero-indexed, so add 1
        year: date.getUTCFullYear(),
    });

    const handleFilter = async () => {
        setFiltered('true')
        let filteredItems = [];
        
        if (filterType === 'range') {
            // Ensure both start and end dates are selected
            if (!startDate || !endDate) {
                console.error("Both start and end dates must be selected for range filtering.");
                return;
            }

            // console.log(`Filtering items between ${startDate.toISOString()} and ${endDate.toISOString()}`);
            
            // Filter items based on range
            filteredItems = orders.filter((item) => {
                const itemDate = new Date(item.created_at);
                return itemDate >= startDate && itemDate <= endDate;
            });

            const cash = filteredItems.reduce((acc, cur) => acc + cur.cash, 0);
            const card = filteredItems.reduce((acc, cur) => acc + cur.card, 0);
            const total = filteredItems.reduce((acc, cur) => acc + cur.total, 0)

            setCash(formatNumber(cash.toFixed(2)));
            setCard(formatNumber(card.toFixed(2)));
            setTotal(formatNumber(total.toFixed(2))); 
            setOrders(filteredItems); // Logs the filtered items

            // console.log(filteredItems); // Logs the filtered items
        } 
        else if (filterType === 'single') {
            // Ensure a single date is selected
            if (!selectedDate) {
                console.error("A date must be selected for single-day filtering.");
                return;
            }

            const item_date = new Date(startDate);
            const selectedDayMonthYear = getDayMonthYear(item_date);
            console.log(selectedDayMonthYear);
            console.log(item_date);

            
            // Filter items based on the created_at date matching the selected date
            const filteredItems = orders.filter((item) => {
                const itemDate = new Date(item.created_at);
                const itemDayMonthYear = getDayMonthYear(itemDate);

                // Compare day, month, and year
                return (
                    itemDayMonthYear.day === selectedDayMonthYear.day &&
                    itemDayMonthYear.month === selectedDayMonthYear.month &&
                    itemDayMonthYear.year === selectedDayMonthYear.year
                );
            });

            console.table(filteredItems);
            const cash = filteredItems.reduce((acc, cur) => acc + cur.cash, 0);
            const card = filteredItems.reduce((acc, cur) => acc + cur.card, 0);
            const total = filteredItems.reduce((acc, cur) => acc + cur.total, 0)

            setCash(formatNumber(cash.toFixed(2)));
            setCard(formatNumber(card.toFixed(2)));
            setTotal(formatNumber(total.toFixed(2))); 
            setOrders(filteredItems); // Logs the filtered items
        }

    };

    const handleReportChange = async (e)=> {
        setFilterType('')
        getOrders();
        setReport(e.target.value);
    };

    const handleClearFilter = ()=> {
        setFiltered('false');
        getOrders();
    }

    
    return(
        <>
            <div class="row">
                <div class="col-10">
                    <div class="card text-center" style={{height: 1000}}>
                        <div class="card-header">
                            Select a report
                        </div>
                        <div class="card-body">
                            <ThemeProvider theme={theme}>
                                <FormControl sx={{backgroundColor: '#fff', padding: 2, borderRadius: 4}} class="text-center">
                                    {/* <FormLabel id="demo-row-radio-buttons-group-label">Select Report</FormLabel> */}
                                    <RadioGroup
                                        row
                                        aria-labelledby="demo-row-radio-buttons-group-label"
                                        name="row-radio-buttons-group"
                                        defaultValue="xreport"
                                        onChange={handleReportChange}
                                        class="text-center"
                                    >
                                        <FormControlLabel value="xreport" control={<Radio />} mx={4} label="X Report" />
                                        <FormControlLabel value="zreport" control={<Radio />} label="Z Report" />
                                    </RadioGroup>
                                </FormControl>
                                <hr/>
                            </ThemeProvider>
                            {report === 'xreport' ? (
                                <Box sx={{backgroundColor: '#fff', padding: 2, borderRadius: 4, height: 400}}>
                                    {/* <Typography variant='h6' component='h5' my={1}>X Report</Typography> */}
                                    <Stack direction="row" spacing={2}>
                                        <div >
                                            <div class="form-check ">
                                                <input class="form-check-input" type="radio" name="flexRadioDefault" onClick={(e)=> setFilterType(e.target.value)} id="flexRadioDefault1" value="single"/>
                                                <label class="form-check-label" for="flexRadioDefault1">
                                                    FILTER DATE
                                                </label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="flexRadioDefault" onClick={(e)=> setFilterType(e.target.value)} id="flexRadioDefault2" value="range"/>
                                                <label class="form-check-label" for="flexRadioDefault2">
                                                    FILTER START DATE & END DATE
                                                </label>
                                            </div>
                                        </div>

                                        {filterType === 'range' ? (
                                            <>
                                                <Stack direction="row" spacing={1}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker 
                                                            label="Start Date"
                                                            onChange={(date)=> setStartDate(date)}
                                                        /> 
                                                    </LocalizationProvider>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker 
                                                            label="End Date"
                                                            // selected={selectedDate}
                                                            onChange={(date)=> setEndDate(date)}
                                                            dateFormat="yyyy-MM-dd" // Customize the date format if needed
                                                            isClearable // Adds a clear button
                                                            placeholderText="Choose a date"
                                                        /> 
                                                    </LocalizationProvider>
                                                    {filtered === 'false' ? (
                                                        <button type="button" class="btn btn-primary" onClick={handleFilter}>Filter</button>
                                                    ) : (
                                                        <button type="button" class="btn btn-danger" onClick={handleClearFilter}>Clear Filter</button>
                                                    )}
                                                </Stack>
                                            </>
                                        ) : filterType === 'single' ? (
                                            <>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePicker 
                                                        label="Start Date"
                                                        onChange={(date)=> setStartDate(date)}
                                                    /> 
                                                </LocalizationProvider>
                                                {filtered === 'false' ? (
                                                    <button type="button" class="btn btn-primary" onClick={handleFilter}>Filter</button>
                                                ) : (
                                                    <button type="button" class="btn btn-danger" onClick={handleClearFilter}>Clear Filter</button>
                                                )}
                                            </>
                                        ) :('')}
                                    </Stack>
                                    <Box mt={2}>
                                        <div 
                                            style={{ 
                                                overflowY: 'scroll', 
                                                height: 600,
                                                scrollbarWidth: '5px',
                                                scrollbarColor: '#fff #fff',
                                            }}
                                            class="table-responsive"

                                        >
                                            <table class="table table-light table-sm table-striped">
                                                <thead class="table-dark">
                                                    <tr>
                                                    <th scope="col">Order No</th>
                                                    <th scope="col">Date</th>
                                                    <th scope="col">Waiter</th>
                                                    <th scope="col">Card <CreditCardIcon fontSize="small"/></th>
                                                    <th scope="col">Cash <CurrencyPoundIcon fontSize="small"/></th>
                                                    <th scope="col">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders?.map((order, i)=>
                                                        <tr key={i}>
                                                            <th scope="row">{order.id}</th>
                                                            <td>{convertDate(order.created_at)}</td>
                                                            <td>{order.waiter.name}</td>
                                                            <td>{order.card}</td>
                                                            <td>{order.cash}</td>
                                                            <td>{order.total}</td>
                                                        </tr>
                                                    )}
                                                    <tr class="table-dark">
                                                        <th scope="row"></th>
                                                        <td colspan="2">Total</td>
                                                        <td>{card}</td>
                                                        <td>{cash}</td>
                                                        <td>{total}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </Box>
                                    
                                </Box>
                            ) : (
                                <Box sx={{backgroundColor: '#fff', padding: 2, borderRadius: 4, height: 400}}>
                                    <div class="row">
                                        <div class="col-3">
                                            <select class="form-select" onChange={handleChange} aria-label="Default select example">
                                                <option selected>Select waiter</option>
                                                {employees?.map((employee)=>
                                                    <option value={employee.id}>{employee.name}</option>
                                                )}
                                            </select>
                                        </div>
                                        <div class="col-9">
                                            <Stack direction="row" spacing={1}>
                                                <div >
                                                    <div class="form-check ">
                                                        <input class="form-check-input" type="radio" name="flexRadioDefault" onClick={(e)=> setFilterType(e.target.value)} id="flexRadioDefault1" value="single"/>
                                                        <label class="form-check-label" for="flexRadioDefault1">
                                                            FILTER DATE
                                                        </label>
                                                    </div>
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="radio" name="flexRadioDefault" onClick={(e)=> setFilterType(e.target.value)} id="flexRadioDefault2" value="range"/>
                                                        <label class="form-check-label" for="flexRadioDefault2">
                                                            FILTER START DATE & END DATE
                                                        </label>
                                                    </div>
                                                </div>

                                                {filterType === 'range' ? (
                                                    <>
                                                        <Stack direction="row" spacing={1}>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <DatePicker 
                                                                    label="Start Date"
                                                                    onChange={(date)=> setStartDate(date)}
                                                                /> 
                                                            </LocalizationProvider>
                                                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                <DatePicker 
                                                                    label="End Date"
                                                                    // selected={selectedDate}
                                                                    onChange={(date)=> setEndDate(date)}
                                                                    dateFormat="yyyy-MM-dd" // Customize the date format if needed
                                                                    isClearable // Adds a clear button
                                                                    placeholderText="Choose a date"
                                                                /> 
                                                            </LocalizationProvider>
                                                            {filtered === 'false' ? (
                                                                <button type="button" class="btn btn-primary" onClick={handleFilter}>Filter</button>
                                                            ) : (
                                                                <button type="button" class="btn btn-danger" onClick={handleClearFilter}>Clear Filter</button>
                                                            )}
                                                        </Stack>
                                                    </>
                                                ) : filterType === 'single' ? (
                                                    <>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker 
                                                                label="Start Date"
                                                                onChange={(date)=> setStartDate(date)}
                                                            /> 
                                                        </LocalizationProvider>
                                                        {filtered === 'false' ? (
                                                            <button type="button" class="btn btn-primary" onClick={handleFilter}>Filter</button>
                                                        ) : (
                                                            <button type="button" class="btn btn-danger" onClick={handleClearFilter}>Clear Filter</button>
                                                        )}
                                                    </>
                                                ) :('')}
                                            </Stack>
                                        </div>
                                    </div>
                                    
                                    <Box mt={2}>
                                        <div 
                                            style={{ 
                                                overflowY: 'scroll', 
                                                height: 600,
                                                scrollbarWidth: '5px',
                                                scrollbarColor: '#fff #fff',
                                            }}
                                            class="table-responsive"

                                        >
                                            <table class="table table-light table-sm table-striped">
                                                <thead class="table-dark">
                                                    <tr>
                                                    <th scope="col">Order No</th>
                                                    <th scope="col">Date</th>
                                                    <th scope="col">Card <CreditCardIcon fontSize="small"/></th>
                                                    <th scope="col">Cash <CurrencyPoundIcon fontSize="small"/></th>
                                                    <th scope="col">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orders?.map((order)=>
                                                        <tr>
                                                            <th scope="row">{order.id}</th>
                                                            <td>{convertDate(order.created_at)}</td>
                                                            <td>{(order.card)}</td>
                                                            <td>{(order.cash)}</td>
                                                            <td>{(order.cash + order.card)}</td>
                                                        </tr>
                                                    )}
                                                    <tr class="table-dark">
                                                        <th scope="row"></th>
                                                        <td colspan="1">Total</td>
                                                        <td>{card}</td>
                                                        <td>{cash}</td>
                                                        <td>{total}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </Box>
                                    
                                </Box>
                            )}

                            
                        </div>
                        <div class="card-footer text-body-secondary">
                            Reports
                        </div>
                    </div>
                </div>
                <div class="col-2">
                    <div class="position-relative">
                        <div class="card text-bg-primary mb-3 position-sticky" >
                            <div class="card-header"><h4 class="card-title">CASH <CurrencyPoundIcon /></h4></div>
                            <div class="card-body">
                                <h5 class="card-title">&#163; {cash}</h5>
                            </div>
                        </div>
                        <div class="card text-bg-secondary mb-3 position-sticky" >
                            <div class="card-header"><h4 class="card-title">CARD<CreditCardIcon /></h4></div>
                            <div class="card-body">
                                <h5 class="card-title">&#163; {card}</h5>
                            </div>
                        </div>
                        <div class="card text-bg-success mb-3 position-sticky" >
                            <div class="card-header"><h4 class="card-title">TOTAL</h4></div>
                            <div class="card-body">
                                <h5 class="card-title">&#163; {total}</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Xreceipt; 