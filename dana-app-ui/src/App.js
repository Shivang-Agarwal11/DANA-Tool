import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard/githubdashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form/login";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import ProtectedRoute from "./components/ProtectedRoute";
import JenkinsDashboard from "./scenes/dashboard/jenkinsdashboard";
import AnalyzePipeline from "./scenes/analyze/AnalyzePipeline";
import SonarDashboard from "./scenes/dashboard/sonarqubedashboard";
import SignUp from "./scenes/form/SingnUp";
import Profile from "./scenes/profile/Profile";
import AgenticAI from "./scenes/agenticAI/agenticai";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("danaAuthToken") !== null);
  return (
    <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            {/* <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Sidebar isSidebar={isSidebar} />
          </ProtectedRoute> */}
            {isAuthenticated && <ProtectedRoute isAuthenticated={isAuthenticated}><Sidebar isSidebar={isSidebar} isAuthenticated={isAuthenticated} /></ProtectedRoute>}
            <main className="content">
              <Routes>
                <Route path="/" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard />
                </ProtectedRoute>} />
                <Route path="/jenkins" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <JenkinsDashboard />
                </ProtectedRoute>} />
                <Route path="/analyze" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AnalyzePipeline />
                </ProtectedRoute>} />
                <Route path="/sonar" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <SonarDashboard />
                </ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Profile />
                </ProtectedRoute>} />
                <Route path="/agenticAI" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <AgenticAI />
                </ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Invoices />
                </ProtectedRoute>} />
                <Route path="/login" element={
                  <Form setAuth={setIsAuthenticated} />}
                />
                <Route path="/register" element={
                  <SignUp setAuth={setIsAuthenticated} />}
                />

                <Route path="/bar" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Bar />
                </ProtectedRoute>} />
                <Route path="/pie" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Pie />
                </ProtectedRoute>} />
                <Route path="/line" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Line />
                </ProtectedRoute>} />
                <Route path="/faq" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <FAQ />
                </ProtectedRoute>} />
                <Route path="/calendar" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Calendar />
                </ProtectedRoute>} />
                <Route path="/geography" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Geography />
                </ProtectedRoute>} />
                <Route path="/team" element={<ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Team type_table="issues"/>
                </ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
