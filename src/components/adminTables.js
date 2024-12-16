import CardActions from '@mui/material/CardActions';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from "react";
import Swal from 'sweetalert2';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

const PROJECT_URI = 'https://jzgrowofybjstbasfcpq.supabase.co'
const PROJECT_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6Z3Jvd29meWJqc3RiYXNmY3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg0ODYxNjcsImV4cCI6MjA0NDA2MjE2N30.VAbfV_ChT5carGQWro2eCyx5H1Dj8HXb1H-7jIQ7DcE'

const supabase = createClient(PROJECT_URI, PROJECT_ANON)

const AdminTables = ()=> {
    const [tables, setTables] = useState([]);
    const [edit, setEdit] = useState([]);
    const [open, setOpen] = useState(false);
    const [table_no, setTable_no] = useState('');
    const [table_status, setTable_Status] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editTable, setEditTable] = useState({table_no: '', status: ''});
    const [openEditModal, setOpenEditModal] = useState(false);


    const handleError = (error) => {
        Swal.fire({ title: "Failed", text: error.message, icon: "error" })
    }

    const handleUpdateTable = async () => {
        try {
            // Check if the new table number already exists
            const { data: existingTables, error: fetchError } = await supabase
                .from('tables')
                .select('table_no')
                .eq('table_no', editTable.table_no)
                .neq('id', editTable.id); // Ensure we don't check the current table
    
            if (fetchError) {
                console.error("Fetch error:", fetchError);
                Swal.fire({
                    title: "Failed!",
                    text: "Could not check for existing table numbers.",
                    icon: "error"
                });
                return;
            }
    
            if (existingTables.length > 0) {
                setOpenEditModal(false);
                Swal.fire({
                    
                    title: "Duplicate Table Number!",
                    text: "The table number already exists. Please choose a different number.",
                    icon: "error"
                });
                return; // Exit if the table number is not unique
            }
    
            // Proceed to update the table
            const { data, error } = await supabase
                .from('tables')
                .update({
                    table_no: editTable.table_no,
                    status: editTable.status
                })
                .eq('id', editTable.id);
    
            if (data) {
                setOpenEditModal(false); // Close the modal before showing the success message
                Swal.fire({
                    title: "Success!",
                    text: "Table updated successfully",
                    icon: "success"
                });
                getTables(); // Refresh the table list
                setOpenEditModal(false); // Close the modal
                setEditTable({ table_no: '', status: '', id: null }); // Reset editTable state
            }
            if (error) {
                console.log(error);
            }
    
        } catch (error) {
            handleError(error);
        }
    };

    
    
    const getTables = async ()=> {  
        try {
            let { data: tables, error } = await supabase
                .from('tables')
                .select('*');
    
            if (error) {
                console.error("Fetch error:", error);
            } else {
                setTables(tables); // Update the state with the fetched tables
            }
        } catch (error) {
            Swal.fire({
                title: "Failed to load tables!",
                text: "Check your internet connection",
                icon: "error"
            });
        }
    }

    const handleEdit = (table) => {
        setEditTable({
            id: table.id, 
            table_no: table.table_no,
            status: table.status
        });
    };

    const handleOpenTable = async (table) => {
        try {
            let { data: tables, error } = await supabase
                .from('tables')
                .select('*')
                .eq('id', table.id);
    
            handleEdit(tables[0]);
            setTable_no(tables[0].table_no);
            setTable_Status(tables[0].status);
    
            setOpenEditModal(true); // Open the modal
        } catch (error) {
            handleError(error);
        }
    };

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
                if(error) {console.log(error)}
            } catch (error) {
                Swal.fire({
                    title: "Failed to load tables!",
                    text: "Check your internet connection",
                    icon: "error"
                });
            }
        }
    
        getTables();

        return ()=> {
            isMounted = false
            controller.abort();
        }
    
    }, [])

    const handleDelete = async (table)=> {
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
                    .from('tables')
                    .delete()
                    .eq('id', table.id)

                    if (!error) {
                        Swal.fire({
                            title: "Success!",
                            text: "New table created",
                            icon: "success"
                        });
                        getTables();
                    }
                } catch (error) {
                    Swal.fire({
                      title: "Failed!",
                      text: "Table could not deleted.",
                      icon: "error"
                    });
                }
            }
        });
    }

    const handleSubmit = async ()=> {
      // Check if the table number is empty
        if (!table_no.trim()) {
            Swal.fire({
                title: "Validation Error!",
                text: "Table number cannot be left empty.",
                icon: "error"
            });
            return; // Exit if the input is empty
        }

        try {
            // Check if the table number already exists
            const { data: existingTables, error: fetchError } = await supabase
                .from('tables')
                .select('table_no')
                .eq('table_no', table_no);

            if (fetchError) {
                console.error("Fetch error:", fetchError);
                Swal.fire({
                    title: "Failed!",
                    text: "Could not check for existing table numbers.",
                    icon: "error"
                });
                return;
            }

            if (existingTables.length > 0) {
                Swal.fire({
                    title: "Duplicate Table Number!",
                    text: "The table number already exists. Please choose a different number.",
                    icon: "error"
                });
                return; // Exit if the table number is not unique
            }

            // Proceed to insert the new table
            
            const { data, error } = await supabase
            .from('tables')
            .insert([
            { table_no: table_no },
            ])
            .select()
            

            if (data) {
                Swal.fire({
                    title: "Success!",
                    text: "New table created",
                    icon: "success"
                });
                getTables();
            }
            if (error) {
                console.log(error);
            }

        } catch (error) {
            Swal.fire({
                title: "Failed!",
                text: "Table could not be added.",
                icon: "error"
            });
        }
    }


    return(

        <Container>
            <div class="card text-center">
                <div class="card-header">
                    <Typography variant='button' component='h5'>Manage Tables</Typography>
                </div>
                <div class="card-body">
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ArrowDownwardIcon />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                        <Typography>Add New Table</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack direction="row" spacing={2}>
                                <TextField  size="small" id="outlined-basic" onChange={(e)=> setTable_no(e.target.value)} label="Table number" variant="outlined" defaultValue={table_no}/>

                                <Button variant="contained" onClick={handleSubmit}>Add new table</Button>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                    {isEditing && (
                    <Stack direction="row" spacing={2} my={2}>
                       <TextField
                        id="outlined-required"
                        label="Table Number"
                        value={editTable.table_no || ''}
                        fullWidth
                        onChange={(e) => setEditTable({ ...editTable, table_no: e.target.value })} // Convert to number
                    />
                    <TextField
                        id="outlined-required"
                        label="Table Status"
                        value={editTable.status}
                        fullWidth
                        onChange={(e) => setTable_Status(e.target.value)}
                    />
                    </Stack>
                )}
                    <Grid container spacing={2} my={3}>
                        {tables?.map((table, i)=> 
                            <Grid size={4}>
                                <Card sx={{ maxWidth: 345 }}>
                                    <CardContent>
                                        <Typography gutterBottom variant="h5" component="div">
                                            {table.name}
                                        </Typography>
                                        <Typography variant="h5" >
                                            {table.table_no}
                                        </Typography>
                                        <Typography variant="button" sx={{ color: 'text.secondary' }}>
                                            Status: {table.status}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ width: '100%' }}>
                                    <Button size="small" onClick={() =>  handleOpenTable(table)}>Edit</Button>
                                    <Button size="small" onClick={() => handleDelete(table)} color="error">Delete</Button>
                                    </Stack>
                                    </CardActions>
                                </Card>
                            </Grid>
                        )}
                    </Grid>

                    <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)}>
                    <DialogTitle>Edit Table</DialogTitle>
                    <DialogContent>
                    <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
            <TextField
                id="outlined-required"
                label="Table Number"
                value={editTable.table_no}
                fullWidth
                onChange={(e) => setEditTable({ ...editTable, table_no: e.target.value })}
            />
            <TextField
                id="outlined-required"
                label="Table Status"
                value={editTable.status}
                fullWidth
                onChange={(e) => setEditTable({ ...editTable, status: e.target.value })}
            />
        </Stack>
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setOpenEditModal(false)} color="primary">
            Cancel
        </Button>
        <Button onClick={handleUpdateTable} color="primary">
            Update
        </Button>
    </DialogActions>
</Dialog>
                    
                </div>
                <div class="card-footer text-body-secondary">
                    Admin
                </div>
            </div>
        </Container>
    )
}
export default AdminTables; 