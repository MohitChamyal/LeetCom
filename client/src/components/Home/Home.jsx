import { useState, useEffect } from 'react';
import CompanyTab from '../Company/CompanyTab';
import Footer from '../Footer/Footer';
import './Home.css';

const Home = ({ listCompany }) => {
  const [filteredCompany, setFilteredCompany] = useState(listCompany);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (query) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredCompany(listCompany);
    } else {
      const filtered = listCompany.filter((company) =>
        company.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCompany(filtered);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCompany(listCompany);
    } else {
      const filtered = listCompany.filter((company) =>
        company.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompany(filtered);
    }
  }, [listCompany, searchQuery]);

  return (
    <div className="home-container">
      <div className="heading">
        <h1>LeetCom</h1>
      </div>
     
      <div className="content">
        <div className="searchBar">
          <input
            type="text"
            placeholder='Search for a company...'
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
       
        <div className="contain-company">
          {filteredCompany.length > 0 ? (
            filteredCompany.map((com, index) => (
              <CompanyTab key={index} name={com} />
            ))
          ) : (
            <div className="no-companies">
              {listCompany.length === 0 ? (
                <div className="empty-state">
                  <h3>No Companies Available</h3>
                  <p>No companies have been added yet. Please contact an administrator to upload company question data.</p>
                </div>
              ) : (
                <p className="no-results">No companies found matching "{searchQuery}"</p>
              )}
            </div>
          )}
        </div>
      </div>
     
      <Footer />
    </div>
  );
};

export default Home;
