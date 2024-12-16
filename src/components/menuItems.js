import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Backdrop from '@mui/material/Backdrop';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
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
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

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
    const [drinks, setDrinks] = useState([]);
    const [employee, setEmployee] = useState('');
    const [name, setName] = useState('');
    const [drink, setDrink] = useState('');
    const [unit, setUnit] = useState('');
    const [bottle, setBottle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [categoryDrinks, setCategoryDrinks] = useState('');
    const [openAvailable, setOpenAvailable] = useState(false);
    const [open, setOpen] = useState(false);
    const [personName, setPersonName] = useState([]); 
    const theme = useTheme();
    const [role, setRole] = useState('waiter');
    const [edit, setEdit] = useState([]);
    const [search, setSearch] = useState('');
    const [searchDrinks, setSearchDrinks] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [filteredDrinks, setFilteredDrinks] = useState([]);
    const [isDrink, setIsDrink] = useState(false);

    const handleError = (error) => {
      Swal.fire({ title: "Failed", text: error.message, icon: "error" })
    }

    const handleOpen = async (item) => {
      try {
        let { data: menuItems, error } = await supabase
        .from('menuItems')
        .select('*')
        .eq('id', item.id);

        setEdit(menuItems[0]);
        setName(menuItems[0].item_name);
        setDescription(menuItems[0].description);
        setPrice(menuItems[0].price);
        setCategory(menuItems[0].category); // Set the category state
        setIsDrink(false); // Indicate that this is a food item

        setOpen(true);

      } catch (error) {
        handleError(error)
      }
    };


    const handleOpenDrinks = async (item) => {
      try {
        let { data: drinks, error } = await supabase
        .from('drinks')
        .select('*')
        .eq('id', item.id);

        setEdit(drinks[0]);
        setDrink(drinks[0].name);
        setUnit(drinks[0].unit);
        setBottle(drinks[0].bottle);
        setCategoryDrinks(drinks[0].category);
        setIsDrink(true); // Indicate that this is a drink item
      
        setOpen(true);

      } catch (error) {
        handleError(error)
      }
    };


    const handleClose = () => setOpen(false);

    const handleChange = (event) => {
      setCategory(event.target.value);
    };

    const handleChangeDrinks = (event) => {
      setCategoryDrinks(event.target.value);
    };
    
    useEffect(() => {
      const controller = new AbortController();
      var isMounted = true

      const getEmployees = async ()=> {  
          let { data: menuItems, error } = await supabase
          .from('menuItems')
          .select('*')
      
          isMounted && setEmployees(menuItems)
      }

      const getDrinks = async ()=> {  
        let { data: drinks, error } = await supabase
        .from('drinks')
        .select('*')
    
        isMounted && setDrinks(drinks)
      }


      getDrinks();
      getEmployees();

      return ()=> {
          isMounted = false
          controller.abort();
      }
    
    }, [])

    useEffect(() => {
      const filterData = () => {
        if (search === '') {
          setFilteredData(employees); // If no input, use the main array
        } else {
          const filteredArray = employees.filter((item) => {
            // Get an array of all values in the item object
            const values = Object.values(item);
    
            // Check if any value includes the search term (case-sensitive)
            const found = values.some((value) => {
            if (typeof value === 'string') {
                return value.includes(search); // No toLowerCase() for case-sensitive search
              }
              return false;
            });
    
            return found;
          });
    
          setFilteredData(filteredArray);
        }
      };
    
      filterData();
    }, [employees, search]); 


    useEffect(() => {
      const filterData = () => {
        if (searchDrinks === '') {
          setFilteredDrinks(drinks); // If no input, use the main array
        } else {
          const filteredArray = drinks.filter((item) => {
            // Get an array of all values in the item object
            const values = Object.values(item);
    
            // Check if any value includes the search term (case-sensitive)
            const found = values.some((value) => {
              if (typeof value === 'string') {
                return value.includes(searchDrinks); // No toLowerCase() for case-sensitive search
              }
              return false;
            });
    
            return found;
          });
    
          setFilteredDrinks(filteredArray);
        }
      };
    
      filterData();
    }, [drinks, searchDrinks]); 

    const getMenuItems = async ()=> { 
      try {
        let { data: menuItems, error } = await supabase
        .from('menuItems')
        .select('*')
    
        setEmployees(menuItems)
        
      } catch (error) {
        handleError(error)
      } 
    }

    const getDrinkItems = async ()=> { 
      try {
        let { data: drinks, error } = await supabase
        .from('drinks')
        .select('*')
    
        setDrinks(drinks)
        
      } catch (error) {
        handleError(error)
      } 
    }


  
    const handleSubmit = async ()=> {
      try {
        const { data, error } = await supabase
        .from('menuItems')
        .insert([
        { item_name: name, description: description, price:  price, category: category},
        ])
        .select()
        
        Swal.fire({
            title: "Success!",
            text: "New item added",
            icon: "success"
        });

        getMenuItems();
        setName('');
        setDescription('');
        setPrice(''); 
        setCategory(''); 

      } catch (error) {
        handleError(error)
      }
    }

    const handleSubmitDrinks = async ()=> {
      try {
        const { data, error } = await supabase
        .from('drinks')
        .insert([
        { name: drink,  unit: unit === '' ? null : unit, bottle: bottle === '' ? null : bottle, category: categoryDrinks},
        ])
        .select()
        
        Swal.fire({
            title: "Success!",
            text: "Drink added",
            icon: "success"
        });

        getDrinkItems();

        setDrink('');
        setUnit('');
        setBottle(''); 
        setCategoryDrinks(''); 

      } catch (error) {
        handleError(error)
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
              .from('menuItems')
              .delete()
              .eq('id', item.id)
            
              Swal.fire({
                  title: "Deleted!",
                  text: "Item has been deleted.",
                  icon: "success"
              });

              getMenuItems();
            } catch (error) {
              handleError(error);
            }
          }
      });
    }

    const handleDeleteDrinks = async (item)=> {
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
              .from('drinks')
              .delete()
              .eq('id', item.id)
            
              Swal.fire({
                  title: "Deleted!",
                  text: "Item has been deleted.",
                  icon: "success"
              });

              getDrinkItems();
            } catch (error) {
              handleError(error);
            }
          }
      });
    }

    const handleUpdate = async ()=> {
      try {
        const { data, error } = await supabase
        .from('menuItems')
        .update({ 
            item_name: name, 
            description: description,
            price: price,
            category: category,
        })
        .eq('id', edit.id)
        .select()
        
        Swal.fire({
            title: "Updated!",
            text: "Item details has been updated.",
            icon: "success"
        });

        getMenuItems();
        setName('');
        setDescription('');
        setPrice(''); 
        setCategory(''); 

      } catch (error) {
        handleError(error)
      }


      handleClose();
    }

    const handleUpdateDrinks = async ()=> {
      try {
        const { data, error } = await supabase
        .from('drinks')
        .update({ 
            name: drink, 
            unit: unit === '' ? null : unit, // Set to null if empty
            bottle: bottle === '' ? null : bottle, // Set to null if empty
            category: categoryDrinks,
        })
        .eq('id', edit.id)
        .select()
        
        Swal.fire({
            title: "Updated!",
            text: "Item details has been updated.",
            icon: "success"
        });

        getDrinkItems();
        setDrink('');
        setUnit('');
        setBottle(''); 
        setCategoryDrinks(''); 

      } catch (error) {
        handleError(error)
      }

      handleClose();
    }

    return(
        <Container>
            <div class="card">
              <div class="card-header">
                <Typography variant='button' component='h5'>Menu Items</Typography>
              </div>
              <div class="card-body">
                <Accordion>
                    <AccordionSummary
                    expandIcon={<ArrowDownwardIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    >
                    <Typography variant="h5">Meals</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Typography>Add New Meal</Typography>
                        <Stack direction="row" spacing={2}>
                            <TextField fullWidth size="small" value={name} onChange={(e)=> setName(e.target.value)} id="outlined-basic" label="Name" variant="outlined" />
                            <TextField  fullWidth size="small" value={description} onChange={(e)=> setDescription(e.target.value)} id="outlined-basic" label="Description" variant="outlined" />
                            <TextField  fullWidth size="small" value={price} onChange={(e)=> setPrice(e.target.value)} id="outlined-basic" label="Price" variant="outlined" />
                            <FormControl size="small" fullWidth>
                                <InputLabel id="demo-simple-select-label">Category</InputLabel>
                                <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={category}
                                label="Role"
                                onChange={handleChange}
                                >
                                <MenuItem value="traditional">Traditional</MenuItem>
                                <MenuItem value="main meal">Main Meal</MenuItem>
                                <MenuItem value="soups only">Soups Only</MenuItem>
                                <MenuItem value="extras/sides">Extras/Sides</MenuItem>
                                <MenuItem value="desserts">Desserts</MenuItem>
                                <MenuItem value="starters">Starters</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" onClick={handleSubmit}>Submit</Button>
                        </Stack>
                <Box>
                    <TextField 
                      sx={{backgroundColor: '#fff', borderColor: '#fff'}} 
                      size="small" 
                      onChange={(e)=> setSearch(e.target.value)}
                      label="Search menu..." 
                      id="fullWidth" 
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
                    <Grid container spacing={2}>
                        {filteredData?.map((employee, i)=> 
                            <Grid size={4}>
                              <div class="card text-center">
                                <div class="card-header">
                                {employee.category}
                                </div>
                                <div class="card-body">
                                  <h5 class="card-title">{employee.item_name} <small>{employee.description}</small></h5>
                                  <p class="card-text">&#163;{employee.price}</p>
                                </div>
                                <div class="card-footer text-body-secondary">
                                <Button size="small" onClick={()=> handleOpen(employee)}>Edit</Button>
                                <Button size="small" color="error" onClick={()=> handleDelete(employee)}>Delete</Button>
                                </div>
                              </div>
                              {/* <Card sx={{ maxWidth: 345 }}>
                                <CardContent>
                                  <Typography variant="button" color="warning">
                                    {employee.category}
                                  </Typography>
                                  <hr/>
                                  <Typography gutterBottom variant="body2" component="div">
                                    {employee.item_name} 
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {employee.description}
                                  </Typography>
                                  <Typography variant="h6" mt={1} sx={{ color: 'text.secondary' }}>
                                    &#163;{employee.price}
                                  </Typography>
                                </CardContent>
                                <CardActions>
                                  <Button size="small" onClick={()=> handleOpen(employee)}>Edit</Button>
                                  <Button size="small" color="error" onClick={()=> handleDelete(employee)}>Delete</Button>
                                </CardActions>
                              </Card> */}
                            </Grid>
                        )}
                    </Grid>
                </Box>
                    </AccordionDetails>
                </Accordion>
                <Accordion>
                    <AccordionSummary
                    expandIcon={<ArrowDownwardIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    >
                    <Typography variant="h5">Drink</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <Typography>Add New Drink</Typography>
                        <Stack direction="row" spacing={2}>
                            <TextField fullWidth size="small" value={drink} onChange={(e)=> setDrink(e.target.value)} id="outlined-basic" label="Name" variant="outlined" />
                            <TextField  fullWidth size="small" value={unit} onChange={(e)=> setUnit(e.target.value)} id="outlined-basic" label="Shot price" variant="outlined" />
                            <TextField  fullWidth size="small" value={bottle} onChange={(e)=> setBottle(e.target.value)} id="outlined-basic" label="Bottle price" variant="outlined" />
                            <FormControl size="small" fullWidth>
                                <InputLabel id="demo-simple-select-label">Category</InputLabel>
                                <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={categoryDrinks}
                                label="Drinks"
                                onChange={handleChangeDrinks}
                                >
                                <MenuItem value="spirits">Spirit</MenuItem>
                                <MenuItem value="wine">Wine</MenuItem>
                                <MenuItem value="champagne">Champagne</MenuItem>
                                <MenuItem value="cocktails (alcohol free)">Cocktails - No alcohol</MenuItem>
                                <MenuItem value="cocktails (alcohol)">Cocktails - Alcohol</MenuItem>
                                <MenuItem value="local">Local drinks</MenuItem>
                                <MenuItem value="soft drinks">Soft drinks</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" onClick={handleSubmitDrinks}>Submit</Button>
                        </Stack>
                        <Box>
                    <TextField 
                      sx={{backgroundColor: '#fff', borderColor: '#fff'}} 
                      size="small" 
                      onChange={(e)=> setSearchDrinks(e.target.value)}
                      label="Search drinks..." 
                      id="fullWidth" 
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
                    <Grid container spacing={2}>
                        {filteredDrinks?.map((drink, i)=> 
                            <Grid size={4}>
                              <div class="card text-center">
                                <div class="card-header">
                                {drink.category}
                                </div>
                                <div class="card-body">
                                  <h5 class="card-title">{drink.name}</h5>
                                  <p class="card-text">Shot: &#163;{drink.unit}</p>
                                  <p class="card-text">Bottle: &#163;{drink.bottle}</p>
                                </div>
                                <div class="card-footer text-body-secondary">
                                <Button size="small" onClick={()=> handleOpenDrinks(drink)}>Edit</Button>
                                <Button size="small" color="error" onClick={()=> handleDeleteDrinks(drink)}>Delete</Button> 
                                </div>
                              </div>
                              {/* <Card sx={{ maxWidth: 345 }}>
                                <CardContent>
                                  <Typography variant="button" color="warning">
                                    {employee.category}
                                  </Typography>
                                  <hr/>
                                  <Typography gutterBottom variant="body2" component="div">
                                    {employee.item_name} 
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {employee.description}
                                  </Typography>
                                  <Typography variant="h6" mt={1} sx={{ color: 'text.secondary' }}>
                                    &#163;{employee.price}
                                  </Typography>
                                </CardContent>
                                <CardActions>
                                  <Button size="small" onClick={()=> handleOpen(employee)}>Edit</Button>
                                  <Button size="small" color="error" onClick={()=> handleDelete(employee)}>Delete</Button>
                                </CardActions>
                              </Card> */}
                            </Grid>
                        )}
                    </Grid>
                </Box>
                    </AccordionDetails>
                </Accordion>
                
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
                    {isDrink ? (
                <>
                    <TextField
                        id="outlined-required"
                        label="Name"
                        defaultValue={edit.name}
                        gutterBottom
                        fullWidth
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        id="outlined-required"
                        label="Unit Price"
                        defaultValue={edit.unit}
                        fullWidth
                        onChange={(e) => setUnit(e.target.value)}
                    />
                    <TextField
                        id="outlined-required"
                        label="Bottle Price"
                        defaultValue={edit.bottle}
                        fullWidth
                        onChange={(e) => setBottle(e.target.value)}
                    />
                    <FormControl size="small" fullWidth>
                        <InputLabel id="demo-simple-select-label">Category</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={categoryDrinks}
                            label="Drinks"
                            onChange={handleChangeDrinks}
                        >
                            <MenuItem value="spirits">Spirit</MenuItem>
                            <MenuItem value="wine">Wine</MenuItem>
                            <MenuItem value="champagne">Champagne</MenuItem>
                            <MenuItem value="cocktails (alcohol free)">Cocktails - No alcohol</MenuItem>
                            <MenuItem value="cocktails (alcohol)">Cocktails - Alcohol</MenuItem>
                            <MenuItem value="local">Local drinks</MenuItem>
                            <MenuItem value="soft drinks">Soft drinks</MenuItem>
                        </Select>
                    </FormControl>
                    <Button variant="contained" onClick={handleUpdateDrinks}>Update Drink</Button>
                </>
            ) : (
                <>
                        <TextField
                            id="outlined-required"
                            label="Name"
                            defaultValue={edit.item_name}
                            gutterBottom
                            fullWidth
                            onChange={(e)=> setName(e.target.value)}
                        />

                        <TextField
                            id="outlined-required"
                            label="Description"
                            defaultValue={edit.description}
                            fullWidth
                            onChange={(e)=> setDescription(e.target.value)}
                        />

                        <TextField
                            id="outlined-required"
                            label="Price"
                            defaultValue={edit.price}
                            fullWidth
                            onChange={(e)=> setPrice(e.target.value)}
                        />
                        <FormControl size="small" fullWidth>
                            <InputLabel id="demo-simple-select-label">Category</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={category}
                                label="Role"
                                onChange={handleChange}
                            >
                                <MenuItem value="traditional">Traditional</MenuItem>
                                <MenuItem value="main meal">Main Meal</MenuItem>
                                <MenuItem value="soups only">Soups Only</MenuItem>
                                <MenuItem value="extras/ sides">Extras/Sides</MenuItem>
                                <MenuItem value="desserts">Desserts</MenuItem>
                                <MenuItem value="starters">Starters</MenuItem>
                            </Select>
                        </FormControl>
                        <Button variant="contained" onClick={handleUpdate}>Update</Button>
                        </>
            )}
                    </Stack>
                </Box>
            </Modal>

        </Container>
    )
}
export default Employees; 