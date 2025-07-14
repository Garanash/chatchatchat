import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Main from "./pages/Main";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import ModelTest from "./pages/ModelTest";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Main />} />
        <Route path="/chat/:model" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/test" element={<ModelTest />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
