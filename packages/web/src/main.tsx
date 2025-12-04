import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import InvoicesPage from './pages/InvoicesPage';
import CompaniesPage from './pages/CompaniesPage';
import CustomersPage from './pages/CustomersPage';
import ServicesPage from './pages/ServicesPage';
import NewInvoicePage from './pages/NewInvoicePage';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<InvoicesPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/invoices/new" element={<NewInvoicePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>,
);
