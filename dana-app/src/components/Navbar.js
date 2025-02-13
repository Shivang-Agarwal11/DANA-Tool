import React, { useState } from "react";
import { AppBar, Toolbar, Tabs, Tab, Menu, MenuItem, IconButton, Box, Button, useTheme } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link } from "react-router-dom";
import { apiService } from "../services/apiServices";

const Navbar = ({ isAuthenticated, setAuth }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [value, setValue] = useState(0);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const logoutUser = await apiService.logout();
    localStorage.removeItem("authToken");
    setAuth(false);
    handleMenuClose();
  };

  const handleProfileUpdate = () => {
    // Handle profile update logic
    handleMenuClose();
  };

  const theme = useTheme();

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#212121", boxShadow: 3 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {/* Navigation Tabs */}
        <Box sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}>
          <Tabs
            value={value}
            onChange={(e, newValue) => setValue(newValue)}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{
              "& .MuiTab-root": {
                fontSize: "1rem",
                fontWeight: 600,
                color: "#fff",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#FF4081", // Pink indicator
              },
            }}
          >
            <Tab label="GitHub Stats" component={Link} to="/github" />
            <Tab label="Analyze Pipeline" component={Link} to="/analyze"/>
            <Tab label="Jenkins Stats" component={Link} to="/jenkins"/>
            <Tab label="SonarQube Stats" />
            <Tab label="Build Script" />
          </Tabs>
        </Box>

        {/* User Profile */}
        {isAuthenticated && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton edge="end" onClick={handleMenuOpen} sx={{ color: "white" }}>
              <AccountCircleIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem onClick={handleProfileUpdate}>Update Details</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        )}

        {/* Sign In / Sign Up Buttons for guests */}
        {!isAuthenticated && (
          <Box>
            <Button variant="outlined" color="inherit" sx={{ marginRight: 2 }} component={Link} to="/login">
              Login
            </Button>
            <Button variant="contained" color="secondary" component={Link} to="/signup">
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
