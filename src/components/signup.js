import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
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
// import useAuth from '../../hooks/useAuth';
import Alert from '@mui/material/Alert';
import Image from '../assets/restaurant.jpg';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import Swal from 'sweetalert2';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('waiter');
  const [errMsg, setErrMsg] = useState('');
  const [succMsg, setSuccMsg] = useState('');
  const [gallery, setGallery] = useState([])
  const [checked, setChecked] = useState(false)
  const navigate = useNavigate();

  const handleError = (error) => {
    Swal.fire({ title: "Failed", text: error.message, icon: "error" })
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const { data, error } = await supabase
      .from('employees')
      .insert([
        { name: username, password: password, status: role },
      ])
      .select()

      Swal.fire({ title: "Success", text: "Added new employee", icon: "success" })

    } catch (error) {
      handleError(error)
    }
  };

  const handleChange = ()=> {
    if(checked === false) {
        setChecked(true);
        setRole('admin');
    }
    else {
        setChecked(false);
        setRole('waiter');
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
            backgroundImage: '../assets/restaurant.jpg',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
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
            <Typography component="body2" variant="h5">
              Add New Employee
            </Typography>
            { errMsg ? 
              <Alert variant="filled" severity="error" sx={{ width: '100%' }}>
                {errMsg}
              </Alert> :
              ""          
            }
            { succMsg ? 
              <Alert variant="filled" severity="success" sx={{ width: '100%' }}>
                {succMsg}
              </Alert> :
              ""          
            }
            <Box sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                onChange={(e)=> setUsername(e.target.value)}
                required
                fullWidth
                id="email"
                label="Username"
                name="email"
                autoComplete="email"
                autoFocus
              />
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
              />
                <FormControlLabel
                onClick={handleChange}
                control={<Checkbox value="admin" color="primary" />}
                label="Admin"
              />
              
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleSubmit} 
              >
                Sign Up
              </Button>

              <Button size="small" startIcon={<KeyboardBackspaceIcon/>} onClick={()=> navigate('/app/menu')}>Back</Button>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
