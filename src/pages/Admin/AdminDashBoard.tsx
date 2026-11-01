import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Toolbar,
  AppBar,
  Typography,
  Button,
} from "@mui/material";
import { Link, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../redux/store";
import { logout } from "../../redux/auth/authSlice";

const drawerWidth = 240;

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login", { replace: true });
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Admin Panel</Typography>

          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: { width: drawerWidth },
        }}
      >
        <Toolbar />
        <List>
          <ListItemButton component={Link} to="overview">
            <ListItemText primary="Overview" />
          </ListItemButton>

          <ListItemButton component={Link} to="products">
            <ListItemText primary="Products" />
          </ListItemButton>

          <ListItemButton component={Link} to="create-product">
            <ListItemText primary="Create Product" />
          </ListItemButton>

          <ListItemButton component={Link} to="orders">
            <ListItemText primary="Orders" />
          </ListItemButton>

          <ListItemButton component={Link} to="categories">
            <ListItemText primary="Categories" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
