import * as React from 'react';
import { Link } from 'react-router-dom';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import PaidIcon from '@mui/icons-material/Paid';
import ChurchIcon from '@mui/icons-material/Church';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RecommendIcon from '@mui/icons-material/Recommend';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import CollectionsIcon from '@mui/icons-material/Collections';
import PodcastsRoundedIcon from '@mui/icons-material/PodcastsRounded';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';


export const mainListItems = (
  <React.Fragment>
    <Link to='/app/dashboard' style={{ textDecoration: 'none', color: '#000' }}>
      <ListItemButton>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItemButton>
    </Link>
    <Link to='/app/menu' style={{ textDecoration: 'none', color: '#000'  }}>
      <ListItemButton>
        <ListItemIcon>
          <MenuBookIcon />
        </ListItemIcon>
        <ListItemText primary="Menu" />
      </ListItemButton>
    </Link>
    <Link to='/app/tables' style={{ textDecoration: 'none', color: '#000'  }}>
      <ListItemButton>
        <ListItemIcon>
          <TableRestaurantIcon />
        </ListItemIcon>
        <ListItemText primary="Tables" />
      </ListItemButton>
    </Link>
  </React.Fragment>
);

export const secondaryListItems = (
  <React.Fragment>
    <ListSubheader component="div" inset>
      Admin
    </ListSubheader>
    <Link to='/app/employees' style={{ textDecoration: 'none', color: '#000'  }}>
      <ListItemButton>
        <ListItemIcon>
          <PeopleAltIcon />
        </ListItemIcon>
        <ListItemText primary="Employees" />
      </ListItemButton>
    </Link>
    <Link to='/app/menu-items' style={{ textDecoration: 'none', color: '#000'  }}>
      <ListItemButton>
        <ListItemIcon>
          <MenuBookIcon />
        </ListItemIcon>
        <ListItemText primary="Menu Items" />
      </ListItemButton>
    </Link>
    <Link to='/app/admin-tables' style={{ textDecoration: 'none', color: '#000'  }}>
      <ListItemButton>
        <ListItemIcon>
          <TableRestaurantIcon />
        </ListItemIcon>
        <ListItemText primary="Tables" />
      </ListItemButton>
    </Link>

    <ListSubheader component="div" inset>
      Reports
    </ListSubheader>
    <Link to="/app/report" style={{ textDecoration: 'none', color: '#000'  }}>
      <ListItemButton>
        <ListItemIcon>
          <TrendingUpIcon />
        </ListItemIcon>
        <ListItemText primary="X-Z Report" />
      </ListItemButton>
    </Link>
    
    {/* <Link>
      <ListItemButton>
        <ListItemIcon>
          <AssignmentIcon />
        </ListItemIcon>
        <ListItemText primary="Year-end sale *" />
      </ListItemButton>
    </Link> */}
  </React.Fragment>
);
