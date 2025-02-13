import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import LoginPage from "./components/Login";
import SignupPage from "./components/Signup";
import GitHubStatsDashboard from "./components/GitHubStatsDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import JenkinsDashboard from "./components/JenkinsStatsDashboard";
import Navbar from "./components/Navbar";
import AnalyzeAndChat from "./components/AnalyzeAndChat";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("authToken") !== null);

  return (
    <div style={{backgroundColor: "#e3e7e7", height:"100%"}}>
    <Router>
      {isAuthenticated && <Navbar isAuthenticated={isAuthenticated} setAuth={setIsAuthenticated} />}
      <Routes>
        <Route path="/login" element={<LoginPage setAuth={setIsAuthenticated} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/github"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <GitHubStatsDashboard />
            </ProtectedRoute>
          }
        />
         <Route
          path="/jenkins"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <JenkinsDashboard />
            </ProtectedRoute>
          }
        />
          <Route
          path="/analyze"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AnalyzeAndChat />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/github" : "/login"} />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
