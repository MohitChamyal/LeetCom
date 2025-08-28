import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CompanyTab.css';
import { adminAPI } from '../../services/api';

const CompanyTab = ({ name }) => {
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionCount = async () => {
      try {
        const response = await adminAPI.getQuestions(name);
        if (response.success) {
          setQuestionCount(response.questions.length);
        }
      } catch (error) {
        setQuestionCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionCount();
  }, [name]);
 
  const handleCompanyClick = () => {
    navigate(`/company/${name}`);
  };

  return (
    <div className="company-tab-card" onClick={handleCompanyClick}>
      <div className="company-tab-header">
        <h3 className="company-name">{name}</h3>
      </div>
      <div className="company-tab-body">
        <p className="company-description">
          Click to view {name} coding questions
        </p>
        <div className="company-tab-stats">
          <span className="question-count">
            {loading ? 'Loading...' : `${questionCount} Questions`}
          </span>
          <span className="difficulty-badge">All Levels</span>
        </div>
      </div>
      <div className="company-tab-footer">
        <button className="view-questions-btn">
          View Questions →
        </button>
      </div>
    </div>
  );
};

export default CompanyTab;
