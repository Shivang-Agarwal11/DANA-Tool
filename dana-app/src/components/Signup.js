import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, CardHeader, Typography, TextField, Button, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { apiService } from "../services/apiServices";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", username: "", password: "",
    jenkinsUrl: "", jenkinsUser: "", jenkinsToken: "",
    sonarURL: "", sonarToken: "", githubURL: "", githubToken: ""
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);
      const response = await apiService.signup(formData);
      console.log("SignUp successful:", response);
      navigate("/jenkins");
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
      <Card sx={{ maxWidth: 480, width: "100%", padding: 3, boxShadow: 5, borderRadius: 4, bgcolor: "#fff" }}>
        <CardHeader title={<Typography variant="h5" align="center" fontWeight="bold">Register</Typography>} />
        <CardContent>
          {error && <Typography color="error" align="center" variant="body2" mb={2}>{error}</Typography>}

          <form onSubmit={handleSubmit}>
            {/* Personal Info */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">Personal Info</Typography></AccordionSummary>
              <AccordionDetails>
                <TextField fullWidth label="First Name" name="firstName" variant="outlined" margin="dense" required onChange={handleChange} />
                <TextField fullWidth label="Last Name" name="lastName" variant="outlined" margin="dense" required onChange={handleChange} />
                <TextField fullWidth label="Email" name="email" type="email" variant="outlined" margin="dense" required onChange={handleChange} />
                <TextField fullWidth label="Username" name="username" variant="outlined" margin="dense" required onChange={handleChange} />
                <TextField fullWidth label="Password" name="password" type="password" variant="outlined" margin="dense" required onChange={handleChange} />
              </AccordionDetails>
            </Accordion>

            {/* Jenkins Credentials */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">Jenkins Credentials</Typography></AccordionSummary>
              <AccordionDetails>
                <TextField fullWidth label="Jenkins URL" name="jenkinsUrl" variant="outlined" margin="dense" onChange={handleChange} />
                <TextField fullWidth label="Jenkins Username" name="jenkinsUser" variant="outlined" margin="dense" onChange={handleChange} />
                <TextField fullWidth label="Jenkins Token" name="jenkinsToken" variant="outlined" margin="dense" onChange={handleChange} />
              </AccordionDetails>
            </Accordion>

            {/* SonarQube Credentials */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">SonarQube Credentials</Typography></AccordionSummary>
              <AccordionDetails>
                <TextField fullWidth label="SonarQube URL" name="sonarURL" variant="outlined" margin="dense" onChange={handleChange} />
                <TextField fullWidth label="SonarQube Token" name="sonarToken" variant="outlined" margin="dense" onChange={handleChange} />
              </AccordionDetails>
            </Accordion>

            {/* GitHub Credentials */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight="bold">GitHub Credentials</Typography></AccordionSummary>
              <AccordionDetails>
                <TextField fullWidth label="GitHub URL" name="githubURL" variant="outlined" margin="dense" onChange={handleChange} />
                <TextField fullWidth label="GitHub Token" name="githubToken" variant="outlined" margin="dense" onChange={handleChange} />
              </AccordionDetails>
            </Accordion>

            {/* Submit Button */}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Sign Up
            </Button>
          </form>

          <Typography align="center" variant="body2" mt={2}>
            Already have an account?{" "}
            <Button onClick={() => navigate("/login")} sx={{ textTransform: 'none', color: "#1976D2", fontWeight: "bold" }}>
              Log In
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupPage;
