import { Box, Button, TextField, Paper, Accordion, AccordionSummary, AccordionDetails, Typography, useTheme } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../../services/apiServices";
import { tokens } from "../../theme";
const SignUp = (props) => {
  const navigate = useNavigate();
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const handleFormSubmit = async (values) => {
    try {
      const response = await apiService.signup(values)// Call the login API
      props.setAuth(true);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" p={2}>
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 500 }}>
        <Header title="Register" subtitle="Enjoy DANA by Signing up!!" />

        <Formik onSubmit={handleFormSubmit} initialValues={initialValues} validationSchema={checkoutSchema}>
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              {sections.map((section) => (
                <Accordion key={section.title} sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">{section.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box display="flex" flexDirection="column" gap="20px">
                      {section.fields.map((field) => (
                        <TextField
                          key={field.name}
                          fullWidth
                          variant="filled"
                          type={field.type}
                          label={field.label}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={values[field.name]}
                          name={field.name}
                          error={!!touched[field.name] && !!errors[field.name]}
                          helperText={touched[field.name] && errors[field.name]}
                        />
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
              <Box display="flex" justifyContent="center" mt="20px">
                <Button type="submit" color="primary" variant="contained">
                  Register
                </Button>
              </Box>
              <Box display="flex" justifyContent="center" mt={2}>
                <Typography variant="h5" color={colors.grey[300]}>
                  Already a User? <Link to="/login" style={{ textDecoration: "None", color: colors.blueAccent[400] }}>Login Here!!</Link>
                </Typography>
              </Box>
            </form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

const sections = [
  {
    title: "User Details",
    fields: [
      { name: "firstName", label: "First Name", type: "text" },
      { name: "lastName", label: "Last Name", type: "text" },
      { name: "email", label: "Email", type: "email" },
      { name: "username", label: "Username", type: "text" },
      { name: "password", label: "Password", type: "password" },
    ],
  },
  {
    title: "GitHub Details",
    fields: [
      { name: "githubURL", label: "GitHub Repo Name", type: "text" },
      { name: "githubToken", label: "GitHub Token", type: "password" },
      { name: "githubUser", label: "GitHub Username", type: "text" },
    ],
  },
  {
    title: "Jenkins Details",
    fields: [
      { name: "jenkinsUrl", label: "Jenkins URL", type: "url" },
      { name: "jenkinsToken", label: "Jenkins Token", type: "password" },
    ],
  },
  {
    title: "SonarQube Details",
    fields: [
      { name: "sonarURL", label: "SonarQube URL", type: "url" },
      { name: "sonarToken", label: "SonarQube Token", type: "password" },
      { name: "sonarProject", label: "SonarQube Project Name", type: "text" },
    ],
  },
];

const checkoutSchema = yup.object().shape({
  firstName: yup.string().required("Required"),
  lastName: yup.string().required("Required"),
  email: yup.string().email("Invalid email").required("Required"),
  username: yup.string().required("Required"),
  password: yup.string().required("Required"),
});

const initialValues = {
  firstName: "",
  lastName: "",
  username: "",
  password: "",
  email: "",
  jenkinsUrl: "",
  jenkinsToken: "",
  sonarURL: "",
  sonarToken: "",
  sonarProject: "",
  githubURL: "",
  githubToken: "",
  githubUser: "",
};

export default SignUp;
