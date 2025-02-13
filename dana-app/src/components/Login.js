import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, Typography, TextField, Button } from "@mui/material";
import { apiService } from "../services/apiServices";

const Login = (props) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.login(formData); // Call the login API
      props.setAuth(true);
      navigate("/github");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen"
      style={{
        background: "linear-gradient(to right, #f6d365, #fda085)", 
        fontFamily: '"Roboto", sans-serif',
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
        margin: "0",
      }}
    >
      <Card sx={{ 
        maxWidth: 380, 
        padding: 3, 
        boxShadow: 6, 
        borderRadius: 6, 
        bgcolor: "#fff", 
        transition: "transform 0.3s ease-in-out",
        '&:hover': { transform: "scale(1.03)" }
      }}>
        <CardHeader 
          title={<Typography variant="h5" align="center" fontWeight="bold" color="#333">Login</Typography>} 
          sx={{ paddingBottom: 1 }} 
        />
        <CardContent>
          {error && <Typography color="error" align="center" variant="body2" mb={1}>{error}</Typography>}
          <form onSubmit={handleSubmit}>
            <TextField 
              fullWidth 
              label="Username" 
              name="username" 
              variant="outlined" 
              margin="normal" 
              onChange={handleChange} 
              sx={{ marginBottom: 2 }}
            //   InputProps={{
            //     style: { borderRadius: 12, height: "40px", fontSize: "14px" },
            //   }}
            />
            <TextField 
              fullWidth 
              label="Password" 
              name="password" 
              type="password" 
              variant="outlined" 
              margin="normal" 
              onChange={handleChange} 
              sx={{ marginBottom: 2 }}
            //   InputProps={{
            //     style: { borderRadius: 12, height: "40px", fontSize: "14px" },
            //   }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ 
                bgcolor: "#1976D2", 
                '&:hover': { bgcolor: "#115293" },
                // borderRadius: 12,
                padding: "10px 0",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              Login
            </Button>
          </form>
          <Typography align="center" variant="body2" mt={2}>
            No account? 
            <Button 
              onClick={() => navigate("/signup")} 
              sx={{ textTransform: 'none', color: "#1976D2", fontWeight: "bold", fontSize: "14px" }}
            >
              Sign Up
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
