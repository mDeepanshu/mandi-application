import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Snackbar,
  Alert,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { saveAllKisanBill } from "../../gateway/kisan-bill-apis";
import { getAllPartyList, getItem } from "../../gateway/comman-apis";
import styles from "./nav-bar.module.css";

const kisanBillNavItems = [
  { name: "kisan-bill", label: "Kisan Bill" },
  { name: "kisan-bill-summry", label: "Kisan Bill Summary" },
];

const navItemsMain = [
  { name: "vyapari-bill", label: "Vyapari Bill" },
  { name: "ledger", label: "Ledger" },
  { name: "vyapari-vasuli-sheet", label: "Vyapari Vasuli Sheet" },
];

const remNavItems = [
  { name: "item-master", label: "ITEM MASTER" },
  { name: "party-master", label: "PARTY MASTER" },
  { name: "auction-entry", label: "AUCTION ENTRIES" },
  { name: "vasuli-list", label: "VASULI LIST" },
  { name: "device-control", label: "DEVICE CONTROL" },
];

const drawerWidth = 240;

function NavBar(props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertData, setAlertData] = useState({});
  const [label, setLabel] = useState("");
  const [navItems, setNavItems] = useState([]);
  const [showMoreMenu, setShowMoreMenu] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    switch (props.variant) {
      case "kisan-only":
        setNavItems(kisanBillNavItems);
        setShowMoreMenu(false);
        setLabel("KISAN BILL");
        break;
      case "main-app":
        setNavItems(navItemsMain);
        setShowMoreMenu(true);
        setLabel("MANDI APPLICATION");
        break;
      case "local":
        setNavItems([...kisanBillNavItems, ...navItemsMain]);
        setShowMoreMenu(true);
        setLabel("LOCAL TESTING");
        break;
      default:
        setNavItems(navItemsMain);
        setShowMoreMenu(true);
        setLabel("MANDI APPLICATION");
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event, reason) => {
    setAnchorEl(null);
    if (reason === "clickaway") return;
    setAlertData({ open: false, alertType: "", alertMsg: "" });
  };

  const handleMenuItemClick = (path) => {
    handleClose();
    setTimeout(() => navigate(path), 100);
  };

  const syncPartyItem = async () => {
    const [partyList, itemList] = await Promise.all([
      getAllPartyList("VYAPARI", false),
      getAllPartyList("KISAN", false),
      getItem(false),
    ]);

    if (partyList && itemList) {
      setAlertData({
        open: true,
        alertType: "success",
        alertMsg: "Party & Item Synced Successfully",
      });
      props.setSyncComplete(new Date().getTime().toString());
    } else {
      setAlertData({
        open: true,
        alertType: "error",
        alertMsg: "Error in Syncing Party & Item List",
      });
    }
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
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: "left" }}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}

        {showMoreMenu &&
          remNavItems.map((item, index) => (
            <Link to={item.name} key={index}>
              <ListItem disablePadding>
                <ListItemButton sx={{ textAlign: "left" }}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}

        {showMoreMenu && (
          <ListItem disablePadding onClick={syncPartyItem}>
            <ListItemButton sx={{ textAlign: "left" }}>
              <ListItemText primary="SYNC PARTY & ITEM LIST" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar component="nav">
        <Toolbar sx={{ display: { xs: "none", sm: "flex" } }} variant="dense">
          <Typography
            className={styles.navbarTitle}
            variant="h6"
            sx={{ flexGrow: 1 }}
          >
            NAVBAR
          </Typography>

          <Box>
            {navItems.map((item, index) => (
              <Link to={item.name} key={index}>
                <Button sx={{ color: "#fff" }}>{item.label}</Button>
              </Link>
            ))}

            {showMoreMenu && (
              <>
                <Button onClick={handleClick} sx={{ color: "#fff" }}>
                  MORE
                </Button>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                >
                  {remNavItems.map((item, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleMenuItemClick(item.name)}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      syncPartyItem();
                    }}
                  >
                    Sync Party & Item List
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>

        <Toolbar sx={{ display: { sm: "none" }, justifyContent: "space-between" }}>
          <div style={{ fontWeight: 600, fontSize: "25px" }}>
            {label.toUpperCase()}
          </div>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
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
    </Box>
  );
}

export default NavBar;