import React from 'react';
import { Grid } from "@mui/material";
import { TextField, Button } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { submitVyapariBill } from '../../gateway/Viyapari-bill-apis';
import { useForm } from 'react-hook-form';

function VyapariBill() {

  const rows = [
    { name: 'Frozen yoghurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0 },
    { name: 'Ice cream sandwich', calories: 237, fat: 9.0, carbs: 37, protein: 4.3 },
    { name: 'Eclair', calories: 262, fat: 16.0, carbs: 24, protein: 6.0 },
    { name: 'Cupcake', calories: 305, fat: 3.7, carbs: 67, protein: 4.3 },
    { name: 'Gingerbread', calories: 356, fat: 16.0, carbs: 49, protein: 3.9 },
  ];

  const { register, handleSubmit, formState: { errors } } = useForm();


  const onSubmit = async (data) => {
    const billDetails = {
      ...data,
      rows
    };
    console.log("billDetails",billDetails);    
    let a = await submitVyapariBill(billDetails);
    console.log("A",a);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid item xs={8} p={3}>
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid container item xs={12} spacing={2} justifyContent="flex-end">
              <Grid item xs={3}>
                <TextField
                  {...register("vyapari_name", { required: "This field is required" })}
                  error={!!errors.vyapari_name}
                  helperText={errors.vyapari_name ? errors.vyapari_name.message : ""}
                  size="small"
                  sx={{ mb: 3 }}
                  defaultValue="1"
                  fullWidth
                  label="Vyapari Name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  {...register("vyapari_name", { required: "This field is required" })}
                  error={!!errors.vyapari_name}
                  helperText={errors.vyapari_name ? errors.vyapari_name.message : ""}
                  size="small"
                  sx={{ mb: 3 }}
                  defaultValue="1"
                  fullWidth
                  label="Vyapari Name"
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <Grid item xs={3}>
              <TextField
                {...register("previous_remaining", { required: "This field is required" })}
                error={!!errors.previous_remaining}
                helperText={errors.previous_remaining ? errors.previous_remaining.message : ""}
                size="small"
                sx={{ mb: 3 }}
                defaultValue="1"
                fullWidth
                label="Previous Remaining"
                variant="outlined"
              />
            </Grid>
          </Grid>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell align="right">Bag</TableCell>
                  <TableCell align="right">Rate&nbsp;(g)</TableCell>
                  <TableCell align="right">Quantity&nbsp;(g)</TableCell>
                  <TableCell align="right">Item Total&nbsp;(g)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.calories}</TableCell>
                    <TableCell align="right">{row.fat}</TableCell>
                    <TableCell align="right">{row.carbs}</TableCell>
                    <TableCell align="right">{row.protein}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Grid container spacing={2} paddingTop={2}>
            <Grid container item xs={12} spacing={2} justifyContent="flex-end">
              <Grid item xs={2}>
                <TextField
                  {...register("total", { required: "This field is required" })}
                  error={!!errors.total}
                  helperText={errors.total ? errors.total.message : ""}
                  size="small"
                  sx={{ mb: 3 }}
                  defaultValue="1"
                  fullWidth
                  label="Total"
                  variant="outlined"
                />
              </Grid>
            </Grid>
            <Grid container item xs={12} spacing={2} justifyContent="flex-end">
              <Grid item xs={2}>
                <Button variant="contained" color="success" type='submit' fullWidth>Save And Print</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}

export default VyapariBill;
