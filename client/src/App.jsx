import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginSignUp from './components/Login/LoginSignUp.jsx';
import Home from './components/Home/Home.jsx';
import Admin from './components/Admin/Admin.jsx';
import CompanyQuestions from './components/Company/CompanyQuestions.jsx';
import { useState, useEffect } from 'react';
import { adminAPI } from './services/api.js';
import NotFound from './components/NotFound/NotFound.jsx';

const App = () => {
  const [listCompany, setListCompany] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [adminDetail, setAdminDetail] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        
        const response = await adminAPI.getAllCompanies();
        
        if (response.success) {
          const companyNames = response.companies.map(company => company.name);
          setListCompany(companyNames);
        } else {
          setListCompany([]);
        }
      } catch (error) {
        // If API fails, start with empty array - admin can add companies
        setListCompany([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin) {
      try {
        const adminData = JSON.parse(storedAdmin);
        if (adminData.role === 'admin') {
          setAdminDetail(adminData);
        }
      } catch (error) {
        localStorage.removeItem('admin');
      }
    }
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading companies...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path='/login' 
          element={
            adminDetail.email ? (
              <Navigate to="/admin" replace />
            ) : (
              <LoginSignUp setAdminDetail={setAdminDetail} />
            )
          } 
        />
        
        <Route 
          path='/' 
          element={<Home listCompany={listCompany} />} 
        />
        
        <Route 
          path='/admin' 
          element={
            adminDetail.email ? (
              <Admin 
                adminDetail={adminDetail} 
                setAdminDetail={setAdminDetail} 
                setListCompany={setListCompany} 
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        <Route path='/company/:companyName' element={<CompanyQuestions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
