import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import "./Sidebar.css";

const navItems = [
  { text: "Home", icon: <HomeIcon />, path: "/dashboard" },
  { text: "Customers", icon: <PeopleIcon />, path: "/customers" },
  { text: "Invoices", icon: <ReceiptIcon />, path: "/invoices" },
  { text: "Products", icon: <Inventory2Icon />, path: "/products" },
  { text: "Stock Adjustment", icon: <SyncAltIcon />, path: "/stock-adjustment" },
];

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
      }}
    >
      <Box>
        <Box
          sx={{
            p: 2,
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 22,
            bgcolor: "#a5c8ff",
          }}
        >
          Smart Invoice Pro
        </Box>
        <Divider />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          sx={{ mt: 2 }}
          className="signout"
        >
          Sign out
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
