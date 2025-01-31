import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { saveAllKisanBill } from "../../gateway/kisan-bill-apis";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const navItems = [
  // { name: '', label: 'Home' },
  { name: "kisan-bill", label: "Kisan Bill" },
  { name: "vyapari-bill", label: "vyapari bill" },
  { name: "ledger", label: "Ledger" },
  { name: "kisan-bill-summry", label: "Kisan Bill Summry" },
  { name: "vyapari-vasuli-sheet", label: "Vyapari Vasuli Sheet" },
];
const remNavItems = [
  { name: "item-master", label: "ITEM MASTER" },
  { name: "party-master", label: "PARTY MASTER" },
  // { name: 'saveKisanBill', label: 'SAVE ALL KISAN BILL' },
  { name: "auction-entry", label: "AUCTION ENTRIES" },
  { name: "vasuli-list", label: "VASULI LIST" },
  { name: "device-control", label: "DEVICE CONTROL" },
];
const drawerWidth = 240;

function NavBar(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertData, setAlertData] = useState({});
  const [label, setLabel] = useState("");

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const labelChange = (name) => {
    setLabel(name);
  };

  const saveKisanBill = async () => {
    const response = await saveAllKisanBill();
    if (response?.responseCode === "200") {
      setAlertData({
        open: true,
        alertType: "success",
        alertMsg: `All Kisan Bill Saved Successfully`,
      });
    } else {
      setAlertData({
        open: true,
        alertType: "error",
        alertMsg: `Error in saving Kisan Bill`,
      });
    }
  };

  const handleClose = (event, reason) => {
    setAnchorEl(null);
    if (reason === "clickaway") {
      return;
    }
    setAlertData({
      open: false,
      alertType: "",
      alertMsg: "",
    });
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        MANDI
      </Typography>
      <Divider />
      <List>
        {navItems.map((item, index) => (
          <Link to={item.name} key={index}>
            <ListItem
              key={item.name}
              disablePadding
              onClick={() => labelChange(item.name)}
            >
              <ListItemButton sx={{ textAlign: "left" }}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar component="nav">
        <Toolbar sx={{ display: { xs: "none", sm: "flex" } }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            NAVBAR
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navItems.map((item, index) => (
              <Link to={item.name} key={index}>
                <Button key={item.name} sx={{ color: "#fff" }}>
                  {item.label}
                </Button>
              </Link>
            ))}
            <Button
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
              sx={{ color: "#fff" }}
            >
              MORE
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              {remNavItems.map((item, index) => (
                <MenuItem key={index} onClick={handleClose}>
                  <Link to={item.name} key={index}>
                    <Button key={item.name}>{item.label}</Button>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
        <Toolbar
          sx={{ display: { sm: "none" }, justifyContent: "space-between" }}
        >
          <div style={{ fontWeight: 600, fontSize: "25px" }}>
            {label.toUpperCase()}
          </div>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <div>
        <Snackbar
          open={alertData.open}
          autoHideDuration={2000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity={alertData.alertType}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {alertData.alertMsg}
          </Alert>
        </Snackbar>
      </div>
    </Box>
  );
}

export default NavBar;
