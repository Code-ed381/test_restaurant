import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Swal from 'sweetalert2';
import Alert from '@mui/material/Alert';
import Image from '../assets/restaurant.jpg';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import image from '../assets/image5.jpeg'

const PROJECT_URI = 'https://jzgrowofybjstbasfcpq.supabase.co'
const PROJECT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z3Jvd29meWJqc3RiYXNmY3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0ODYxNjcsImV4cCI6MjA0NDA2MjE2N30.VAbfV_ChT5carGQWro2eCyx5H1Dj8HXb1H-7jIQ7DcE'

const supabase = createClient(PROJECT_URI, PROJECT_ANON)

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://cyaneltechnologies.com/">
        Powered by Addai Johnson Exploration Technologies - AJxT
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();

export default function SignInSide() {
  const [focus, setFocus] = useState('false');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [gallery, setGallery] = useState([])
  const [employees, setEmployees] = useState([])
  const [employee, setEmployee] = useState([])
//   const { setAuth } = useAuth();
  const navigate = useNavigate();
  
    
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
        Swal.fire({ title: "Error", text: error.message , icon: "error" });
      }
    }
    getEmployees();

    return ()=> {
      isMounted = false
      controller.abort();
    }
      
  }, [])

  // const randomIndex = Math.floor(Math.random() * gallery?.length);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      let { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .eq('name', username)
      
      if(error) {Swal.fire({ title: "Failed", text: error.message, icon: "error" });}
      else {
        if (employees[0]?.password === password && employees[0]?.name === username) {
          localStorage.setItem('employee', JSON.stringify(employees));
          navigate('/app/menu')
        }
        else{
          Swal.fire({ title: "Failed", text: 'Incorrect password', icon: "error" });
        }
      }
    
    } catch (error) {
      Swal.fire({ title: "Network Error", text: 'Please check your internet and try again' , icon: "error" });
    }
    
      
  };

  const handleUser = async (user)=> {
    try {
      let { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', user.id)
      
      if(error) {Swal.fire({ title: "Failed", text: error.message, icon: "error" })}

      console.log(employees)
      setUsername(employees[0].name)
      setEmployee(employees[0])
      setFocus('true')
      setErrMsg('')

    } catch (error) {
      Swal.fire({ title: "Failed", text: error.message, icon: "error" })
    }


  }


  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: image,
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          }}
        >
          <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundImage: `url(${image})`}}>
            <Box sx={{width: 500, marginTop: 20}}>
                {employees?.map((employee)=>
                  <Button variant="contained" color="secondary" sx={{margin: 2}} onClick={()=> handleUser(employee)}>
                    <Stack spacing={1}>
                      <Avatar alt={employee.name} src={employee.image} sx={{width: 100, height: 100, border: 'solid 5px'}}/>
                      <Typography>{employee.name}</Typography> 
                    </Stack>
                  </Button>
                )}
            </Box>
          </div>
        </Grid>
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            { errMsg ? 
              <Alert variant="filled" severity="error" sx={{ width: '100%' }}>
                {errMsg}
              </Alert> :
              ""          
            }
            <Box sx={{ mt: 1 }}>
              <Stack>
                {employee.name ? (
                  <Button disabled sx={{margin: 2}}>
                    <Stack spacing={1}>
                      <Avatar alt={employee.name} src={employee.image} sx={{width: 100, height: 100, border: 'solid 5px'}}/>
                      <Typography>{employee.name}</Typography> 
                    </Stack>
                  </Button>
                ) : (
                  <Button disabled sx={{margin: 2}}>
                    <Stack spacing={1}>
                      <Avatar alt="Select User"sx={{width: 100, height: 100, border: 'solid 5px'}}/>
                      <Typography>Select User</Typography> 
                    </Stack>
                  </Button>
                )}
              </Stack>
              {employee.name ? (
                <>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    onChange={(e)=> setPassword(e.target.value)}
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    focused={focus}
                    autoFocus="true"
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={handleSubmit} 
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                ''
              )}
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
