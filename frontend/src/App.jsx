import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Resume from './components/Resume';
import Login from './components/Login'; // Assuming you have a Login component

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/login" element={<Login />} />
          
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
