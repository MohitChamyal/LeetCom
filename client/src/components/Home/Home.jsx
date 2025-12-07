import { useState, useEffect } from 'react';
import CompanyTab from '../Company/CompanyTab';
import Footer from '../Footer/Footer';
import './Home.css';

const Home = ({ listCompany }) => {
  const [filteredCompany, setFilteredCompany] = useState(listCompany);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCount, setDisplayedCount] = useState(9);
  const ITEMS_PER_PAGE = 9;

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setDisplayedCount(9); // Reset to initial count on search

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
    setDisplayedCount(9); // Reset when listCompany changes
    if (searchQuery.trim() === "") {
      setFilteredCompany(listCompany);
    } else {
      const filtered = listCompany.filter((company) =>
        company.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompany(filtered);
    }
  }, [listCompany, searchQuery]);

  const handleLoadMore = () => {
    const remaining = filteredCompany.length - displayedCount;
    const toAdd = remaining < ITEMS_PER_PAGE ? remaining : ITEMS_PER_PAGE;
    setDisplayedCount(prev => prev + toAdd);
  };

  const displayedCompanies = filteredCompany.slice(0, displayedCount);
  const hasMore = displayedCount < filteredCompany.length;

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
          {displayedCompanies.length > 0 ? (
            <>
              {displayedCompanies.map((com, index) => (
                <CompanyTab key={index} name={com} />
              ))}
            </>
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

        {hasMore && (
          <div className="load-more-container">
            <button className="load-more-btn" onClick={handleLoadMore}>
              Load More Companies ({filteredCompany.length - displayedCount} remaining)
            </button>
          </div>
        )}
      </div>
     
      <Footer />
    </div>
  );
};

export default Home;
