import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal'; 
import Fade from '@mui/material/Fade';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CardActions from '@mui/material/CardActions';

const PROJECT_URI = 'https://jzgrowofybjstbasfcpq.supabase.co'
const PROJECT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z3Jvd29meWJqc3RiYXNmY3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0ODYxNjcsImV4cCI6MjA0NDA2MjE2N30.VAbfV_ChT5carGQWro2eCyx5H1Dj8HXb1H-7jIQ7DcE'

const supabase = createClient(PROJECT_URI, PROJECT_ANON);

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

const Employees = ()=> {
    const [tables, setTables] = useState([]);
    const [availableTables, setAvailableTables] = useState([]);
    const [occupiedTables, setOccupiedTables] = useState([]);
    const [dirtyTables, setDirtyTables] = useState([]);
    const [table, setTable] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [employee, setEmployee] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [openAvailable, setOpenAvailable] = useState(false);
    const [open, setOpen] = useState(false);
    const [personName, setPersonName] = useState([]);
    const theme = useTheme();
    const [role, setRole] = useState('waiter');
    const [edit, setEdit] = useState([]);
    const user= localStorage.getItem('employee');
    const parsed = JSON.parse(user);

    const handleOpen = async (item) => {
        try {
            let { data: employees, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', item.id);

            if(error) {console.log(error)}
    
            setEdit(employees[0]);  
    
            setOpen(true);

        } catch (error) {
            Swal.fire({
                title: "Failed!",
                text: "Employees could not load.",
                icon: "error"
            });
        }
    };

    const handleClose = () => setOpen(false);

    const handleChange = (event) => {
      setRole(event.target.value);
    };
    
    useEffect(() => {
        const controller = new AbortController();
        var isMounted = true

        const getEmployees = async ()=> {  
            try {
                let { data: employees, error } = await supabase
                .from('employees')
                .select('*')
            
                if(error) {console.log(error)}
                isMounted && setEmployees(employees)
                
            } catch (error) {
                Swal.fire({
                    title: "Failed!",
                    text: "Employees could not load.",
                    icon: "error"
                });
            }
        }

        getEmployees();

        return ()=> {
            isMounted = false
            controller.abort();
        }
    
    }, [])

    const getEmployees = async ()=> {  
        let { data: employees, error } = await supabase
        .from('employees')
        .select('*')
    
        setEmployees(employees)
    }
  
    const handleSubmit = async ()=> {
        try {
            const { data, error } = await supabase
            .from('employees')
            .insert([
            { name: username, status: role, password:  password},
            ])
            .select()
    
            if (error) {console.log(error)}
    
            Swal.fire({
                title: "Success!",
                text: "New employee added",
                icon: "success"
            });
    
            getEmployees();
            setUsername('');
            setPassword('');
            setRole(''); 
            
        } catch (error) {
            Swal.fire({
                title: "Failed!",
                text: "Employee could not added.",
                icon: "error"
            });
        }
    }

    const handleDelete = async (item)=> {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
          }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { error } = await supabase
                    .from('employees')
                    .delete()
                    .eq('id', item.id)
    
                    if (error) {console.log(error)}
    
                    Swal.fire({
                        title: "Deleted!",
                        text: "Employee has been deleted.",
                        icon: "success"
                    });
    
                    getEmployees();
                    
                } catch (error) {
                    Swal.fire({
                        title: "Failed!",
                        text: "Employee could not be deleted.",
                        icon: "error"
                    });
                }
            }
        });
        
        
    }

    const handleUpdate = async ()=> {
        try {
            const { data, error } = await supabase
            .from('employees')
            .update({ 
                name: username, 
                password: password,
                status: role
            })
            .eq('id', edit.id)
            .select()
    
            if (error) {console.log(error)}
    
            Swal.fire({
                title: "Deleted!",
                text: "Employee's details has been updated.",
                icon: "success"
            });
    
            getEmployees();
            
        } catch (error) {
            Swal.fire({
                title: "Failed!",
                text: "Employees details could not be updated.",
                icon: "error"
            });
        }
        
    }

    return(
        <Container>
            <div class="card text-center">
                <div class="card-header">
                    <Typography variant='button' component='h5'>Employees</Typography>
                </div>
                <div class="card-body">
                    <Box sx={{backgroundColor: '#fff', padding: 2, borderRadius: 4}}>

                        <Accordion>
                            <AccordionSummary
                            expandIcon={<ArrowDownwardIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                            >
                            <Typography>Add New Employee</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Stack direction="row" spacing={2}>
                                    <TextField fullWidth size="small" value={username} onChange={(e)=> setUsername(e.target.value)} id="outlined-basic" label="Username" variant="outlined" />
                                    <TextField  fullWidth size="small" value={password} onChange={(e)=> setPassword(e.target.value)} id="outlined-basic" label="Password" variant="outlined" />
                                    <FormControl size="small" fullWidth>
                                        <InputLabel id="demo-simple-select-label">Role</InputLabel>
                                        <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={role}
                                        label="Role"
                                        onChange={handleChange}
                                        >
                                        <MenuItem value="waiter">Waiter</MenuItem>
                                        <MenuItem value="admin">Admin</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Button variant="contained" onClick={handleSubmit}>Submit</Button>
                                </Stack>
                            </AccordionDetails>
                        </Accordion>
                    </Box>

                    <Box my={1}>
                        <Grid container spacing={2}>
                            {employees?.map((employee, i)=> 
                                <Grid size={4}>
                                    <div class="card" >
                                        <img src={employee.image} class="card-img-top" alt="employee" />
                                        <div class="card-body">
                                            <h5 class="card-title">{employee.name}</h5>
                                            <p class="card-text">Role: {employee.status}</p>
                                            <p class="card-text">Password: {employee.password}</p>
                                        </div>
                                        <div class="card-footer">
                                            <Button size="small" onClick={()=> handleOpen(employee)}>Edit</Button>
                                            <Button size="small" color="error" onClick={()=> handleDelete(employee)}>Delete</Button>
                                        </div>
                                    </div>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </div>
                <div class="card-footer text-body-secondary">
                    Admin
                </div>
            </div>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Stack spacing={2}>
                        <TextField
                            id="outlined-required"
                            label="Name"
                            defaultValue={edit.name}
                            gutterBottom
                            fullWidth
                            onChange={(e)=> setUsername(e.target.value)}
                        />

                        <TextField
                            id="outlined-required"
                            label="Password"
                            defaultValue={edit.password}
                            fullWidth
                            onChange={(e)=> setPassword(e.target.value)}
                        />
                        <FormControl size="small" fullWidth>
                            <InputLabel id="demo-simple-select-label">Role</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={edit.status}
                                label="Role"
                                onChange={handleChange}
                            >
                                <MenuItem value="waiter">Waiter</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="contained" onClick={handleUpdate}>Update</Button>
                    </Stack>
                

                </Box>
            </Modal>
        </Container>
    )
}
export default Employees; 