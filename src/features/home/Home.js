import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import PrintIcon from '@mui/icons-material/Print';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Grid } from "@mui/material";
import "./home.css";

function Home() {

  let vyapari_bills = [1, 2, 3, 4, 5];
  let kisan_bills = [1, 2, 3, 4, 5];

  return (
    <>
      <Grid container>
        <Grid item xs={6}>
          <Box sx={{ flexGrow: 1, maxWidth: 700 }} p={3}>
          <Paper elevation={3} className='paper-heading'><div p={2}>TODAY`S PENDING VYAPARI BILLS</div></Paper>
            <Paper elevation={3}>
              <List>
                {vyapari_bills.map((row, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete">
                        <PrintIcon/>
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary="Single-line item"
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ flexGrow: 1, maxWidth: 700 }} p={3}>
          <Paper elevation={3} className='paper-heading'>TODAY`S PENDING KISAN BILLS</Paper>
            <Paper elevation={3}>
              <List>
                {kisan_bills.map((row, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete">
                        <PrintIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary="Single-line item"
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default Home;
