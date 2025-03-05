import { useState, useEffect } from "react";
import { Box, Button, TextField, Paper, Typography, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { apiService } from "../../services/apiServices";
import { tokens } from "../../theme";

const Profile = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await apiService.getUserDetails();
        response.data.data.user.githubToken="";
        response.data.data.user.sonarToken="";
        response.data.data.user.jenkinsToken="";
        setUserData(response.data.data.user);

        console.log(response.data)
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };
    fetchUserDetails();
  }, []);

  const handleFormSubmit = async (values) => {
    try {
      const response = await apiService.updateUserDetails(values); // Assume update API exists
      console.log("Update response:", response);
    } catch (err) {
      console.log("Error updating user details:", err);
    }
  };

  if (!userData) return <Typography>Loading...</Typography>;

  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={2}>
      <Paper elevation={3} sx={{ p: 4, width: "100%", backgroundColor:colors.primary[900] }}>
        <Header title="Profile" subtitle="Manage your profile details" />

        <Formik initialValues={userData} onSubmit={handleFormSubmit} enableReinitialize>
          {({ values, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Box display="flex" flexDirection="column" gap="20px">
                <TextField fullWidth variant="filled" label="First Name" name="firstName" value={values.firstName} onChange={handleChange} />
                <TextField fullWidth variant="filled" label="Last Name" name="lastName" value={values.lastName} onChange={handleChange} />
                <TextField fullWidth variant="filled" label="Email" name="email" value={values.email} onChange={handleChange} />
                <TextField fullWidth variant="filled" label="Username" name="username" value={values.username} onChange={handleChange} />
                <TextField fullWidth variant="filled" label="Jenkins URL" name="jenkinsUrl" value={values.jenkinsUrl} onChange={handleChange} />
                <TextField fullWidth variant="filled" label="Jenkins User" name="jenkinsUser" value={values.jenkinsUser} onChange={handleChange} />
                <TextField fullWidth variant="filled" label="Jenkins API Token" name="jenkinsToken" value={values.jenkinsToken} onChange={handleChange} type="password"/>
                <TextField fullWidth variant="filled" label="SonarQube URL" name="sonarURL" value={values.sonarURL} onChange={handleChange} />
                <TextField fullWidth variant="filled" label="SonarQube ProjectName" name="sonarProject" value={values.sonarProject} onChange={handleChange} />
                <TextField fullWidth variant="filled" label="SonarQube API Token" name="sonarToken" value={values.sonarToken} onChange={handleChange} type="password"/>
                <TextField fullWidth variant="filled" label="GitHub Repository" name="githubURL" value={values.githubURL} onChange={handleChange} />
                <TextField fullWidth variant="filled" label="GitHub User" name="githubUser" value={values.githubUser} onChange={handleChange} />
                <TextField fullWidth variant="filled" label="Github API Token" name="githubToken" value={values.githubToken} onChange={handleChange} type="password"/>
              </Box>
              <Box display="flex" justifyContent="center" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  Save Changes
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default Profile;
