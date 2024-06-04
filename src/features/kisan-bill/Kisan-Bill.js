import React, { useState } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { submitKisanBill } from '../../gateway/kisan-bill-apis';

function KisanBill() {

  const { register,handleSubmit,control, formState: { errors } } = useForm();
  // const [label, setLabel] = useState('Default Label');
  // const [value, setValue] = React.useState(null);

  const [fieldDefinitions, setFieldDefinitions] = useState([
    {
      name: 'mandi_kharch',
      label: 'Mandi Kharch',
      defaultValue: '1',
      validation: { required: 'Mandi Kharch is required' },
    },
    {
      name: 'hammali',
      label: 'Hammali',
      defaultValue: '1',
      validation: {
        required: 'Hammali is required',
      },
    },
    {
      name: 'nagar_palika_tax',
      label: 'Nagar Palika Tax',
      defaultValue: '1',
      validation: {
        required: 'Nagar Palika Tax is required',
      },
    },
    {
      name: 'bhada',
      label: 'Bhada',
      defaultValue: '1',
      validation: {
        required: 'Bhada is required',
      },
    },
    {
      name: 'driver_inaam',
      label: 'Driver Inaam',
      defaultValue: '1',
      validation: {
        required: 'Driver Inaam is required',
      },
    },
    {
      name: 'nagdi',
      label: 'Nagdi',
      defaultValue: '1',
      validation: {
        required: 'Nagdi is required',
      },
    },
    {
      name: 'commision',
      label: 'Commision',
      defaultValue: '1',
      validation: {
        required: 'Commision is required',
      },
    },

  ]);


  const rows = [
    { name: 'Frozen yoghurt', calories: 159, fat: 6.0, carbs: 24, protein: 4.0 },
    { name: 'Ice cream sandwich', calories: 237, fat: 9.0, carbs: 37, protein: 4.3 },
    { name: 'Eclair', calories: 262, fat: 16.0, carbs: 24, protein: 6.0 },
    { name: 'Cupcake', calories: 305, fat: 3.7, carbs: 67, protein: 4.3 },
    { name: 'Gingerbread', calories: 356, fat: 16.0, carbs: 49, protein: 3.9 },
  ];

  const onSubmit = async (data) => {
    const billDetails = {
      ...data,
      rows
    }
    console.log(billDetails);
    let a = await submitKisanBill(billDetails);
    console.log("a",a);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2} p={3}>
          <Grid item xs={4}>
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
            >
              {fieldDefinitions.map((fieldDef) => (
                <Controller
                  key={fieldDef.name}
                  name={fieldDef.name}
                  control={control}
                  defaultValue={fieldDef.defaultValue}
                  rules={fieldDef.validation}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={fieldDef.label}
                      variant="outlined"
                      sx={{ mb: 3 }}
                      fullWidth
                      error={!!errors[field.name]}
                      helperText={errors[field.name] ? errors[field.name].message : ''}
                      size="small"
                    />
                  )}
                />
              ))}
            </Grid>
          </Grid>
          <Grid item xs={8}>
            <Grid container paddingBottom={2}>
              <Grid item xs={6}>
                <TextField id="outlined-basic" label="Kisan Name" variant="outlined" />
              </Grid>
              <Grid item xs={6}>
                <TextField id="outlined-basic" type='date' variant="outlined" />
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
            <Grid container spacing={2} justifyContent="flex-end" p={2}>
              <Grid container item xs={12} spacing={2} justifyContent="flex-end">
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Kharcha Total"
                    variant="outlined"
                    {...register("kharcha_total", { required: "This field is required" })}
                    error={!!errors.kharcha_total}
                    helperText={errors.kharcha_total ? errors.kharcha_total.message : ""}
                    size="small"
                    sx={{ mb: 3 }}
                    defaultValue="1"
                  />
                </Grid>
                <Grid item xs={3}>
                <TextField
                    fullWidth
                    label="Pakki Bikri"
                    variant="outlined"
                    {...register("pakki_bikri", { required: "This field is required" })}
                    error={!!errors.pakki_bikri}
                    helperText={errors.pakki_bikri ? errors.pakki_bikri.message : ""}
                    size="small"
                    sx={{ mb: 3 }}
                    defaultValue="1"
                  />
                </Grid>
              </Grid>
              <Grid container item xs={12} spacing={2} justifyContent="flex-end">
                <Grid item xs={3}>
                  <Button variant="contained" color="success" type='submit' fullWidth>Save And Print</Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </div>
  );
}

export default KisanBill;
