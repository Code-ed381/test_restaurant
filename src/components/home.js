import { Outlet } from "react-router-dom";
import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { mainListItems, secondaryListItems } from './listItems';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Receipt from './receipt';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import Avatar from '@mui/material/Avatar';
import { createClient } from '@supabase/supabase-js';
import image from '../assets/image5.jpeg'
const PROJECT_URI = 'https://jzgrowofybjstbasfcpq.supabase.co'
const PROJECT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z3Jvd29meWJqc3RiYXNmY3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0ODYxNjcsImV4cCI6MjA0NDA2MjE2N30.VAbfV_ChT5carGQWro2eCyx5H1Dj8HXb1H-7jIQ7DcE'

const supabase = createClient(PROJECT_URI, PROJECT_ANON)


function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      {/* <Link color="inherit" href="https://fullgospel.com/">
        Full Gospel
      </Link>{'-'} */}
      <Link color="inherit" href="https://cyaneltechnologies.com/">
        Powered by Addai Johnson Exploration Technologies (AJxT) 
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
  })(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const mdTheme = createTheme();

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
  },
});



const Layout = () => {
  const [open, setOpen] = React.useState(false);
  const [employee, setEmployee] = useState([]);
  const [profile, setProfile] = useState('');
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const user= localStorage.getItem('employee');
  const parsed = JSON.parse(user);


  console.log(parsed)
  
  useEffect(() => {
    const controller = new AbortController();
    var isMounted = true

    const getEmployee = async ()=> {
      try {
        let { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', parsed[0]?.id)
                
        isMounted && setEmployee(employees[0])
      } catch (error) {
        console.log(error)
      }
    }
    getEmployee();

    return ()=> {
        isMounted = false
        controller.abort();
    }
  }, [])

  const navigate = useNavigate(); 

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
 

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const logout = async ()=> {
    localStorage.clear()

    navigate('/')
  }

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
        <CssBaseline />
        <ThemeProvider theme={darkTheme}>
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: '20px', // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '30px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Annys Restaurant & Pub
            </Typography>
            <IconButton color="inherit">
              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt="Remy Sharp" src={employee.image} />
                </IconButton>
                </Tooltip>
                <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                    keepMounted
                    transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu} 
                >
                  <MenuItem onClick={()=> {handleCloseUserMenu(); navigate('dashboard')}}>
                  <Typography textAlign="center">Dashboard</Typography>
                  </MenuItem>
                  {parsed[0].status != 'admin' ? (
                    ''
                  ) : (
                    <MenuItem onClick={handleCloseUserMenu} component="a" href="/signup">
                    <Typography textAlign="center">Register</Typography>
                    </MenuItem>
                  )}
                  <MenuItem onClick={logout}>
                  <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </Box>
            </IconButton>
          </Toolbar>
        </AppBar>
        </ThemeProvider>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            {mainListItems}
            <Divider sx={{ my: 1 }} />
            {parsed[0].status != 'admin' ? (
              ''
            ) : (
              <>{secondaryListItems}</>
            )}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundImage: `url(${image})`,
            flexGrow: 1,
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Box sx={{ flexGrow: 1 }} sx={{minHeight: '90vh', padding: '20px'}}>
            <Outlet />
            {/* <Container>
            </Container> */}
          </Box>
          {/* <Receipt/> */}
          <Copyright sx={{ pt: 4 }} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Layout


