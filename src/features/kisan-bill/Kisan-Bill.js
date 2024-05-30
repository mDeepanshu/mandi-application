import React, { useState } from 'react';
import { Grid } from "@mui/material";
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button } from "@mui/material";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

function KisanBill() {

  const { handleSubmit, control, formState: { errors } } = useForm();
  const [label, setLabel] = useState('Default Label');
  const [value, setValue] = React.useState(null);

  const [fieldDefinitions, setFieldDefinitions] = useState([
    {
      name: 'mandi_kharch',
      label: 'Mandi Kharch',
      defaultValue: '',
      validation: { required: 'Mandi Kharch is required' },
    },
    {
      name: 'hammali',
      label: 'Hammali',
      defaultValue: '',
      validation: {
        required: 'Hammali is required',
      },
    },
    {
      name: 'nagar_palika_tax',
      label: 'Nagar Palika Tax',
      defaultValue: '',
      validation: {
        required: 'Nagar Palika Tax is required',
      },
    },
    {
      name: 'bhada',
      label: 'Bhada',
      defaultValue: '',
      validation: {
        required: 'Bhada is required',
      },
    },
    {
      name: 'driver_inaam',
      label: 'Driver Inaam',
      defaultValue: '',
      validation: {
        required: 'Driver Inaam is required',
      },
    },
    {
      name: 'nagdi',
      label: 'Nagdi',
      defaultValue: '',
      validation: {
        required: 'Nagdi is required',
      },
    },
    {
      name: 'commision',
      label: 'Commision',
      defaultValue: '',
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

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
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
                      margin="normal"
                      fullWidth
                      error={!!errors[field.name]}
                      helperText={errors[field.name] ? errors[field.name].message : ''}
                      size="small"
                    />
                  )}
                />
              ))}
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Submit
              </Button>
            </form>
          </Grid>
        </Grid>
        <Grid item xs={8}>
          <Grid container spacing={7}>
            <Grid item><TextField id="outlined-basic" label="Outlined" variant="outlined" /></Grid>
            <Grid item>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DatePicker']}>
                  <DatePicker value={value} onChange={(newValue) => setValue(newValue)} />
                </DemoContainer>
              </LocalizationProvider>
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
        </Grid>
      </Grid>
    </div>
  );
}

export default KisanBill;