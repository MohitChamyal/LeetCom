import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import './CompanyQuestions.css';
import { adminAPI } from '../../services/api';

const CompanyQuestions = () => {
  const { companyName } = useParams();
  const navigate = useNavigate();
  
  const [difficulty, setDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('frequency');
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Scroll to top when component mounts or company changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [companyName]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError('');
        
        const data = await adminAPI.getQuestions(companyName);

        if (data.success && data.questions) {
          setProblems(data.questions);
        } else {
          setProblems([]);
        }
      } catch (error) {
        setError('Unable to load questions for this company');
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    if (companyName) {
      fetchQuestions();
    }
  }, [companyName]);

  useEffect(() => {
    let filtered = [...problems];

    if (difficulty && difficulty !== '') {
      filtered = filtered.filter(problem => problem.difficulty === difficulty);
    }

    switch (sortBy) {
      case 'frequency':
        filtered.sort((a, b) => b.frequency - a.frequency);
        break;
      case 'name-az':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-za':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'acceptance':
        filtered.sort((a, b) => {
          const aRate = parseFloat(a.acceptanceRate) || 0;
          const bRate = parseFloat(b.acceptanceRate) || 0;
          return bRate - aRate;
        });
        break;
      default:
        filtered.sort((a, b) => b.frequency - a.frequency);
    }

    setFilteredProblems(filtered);
  }, [problems, difficulty, sortBy]);

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return '';
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className='company-questions-container'>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading {companyName} questions...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className='company-questions-container'>
      <div className="company-header">
        <button className="back-btn" onClick={handleGoBack}>
          ← Back to Companies
        </button>
        <h1 className="company-title">
          {companyName ? companyName.charAt(0).toUpperCase() + companyName.slice(1) : 'Company'} Questions
        </h1>
        <div className="stats">
          <span className="total-problems">{filteredProblems.length} Problems</span>
        </div>
      </div>

      {error && (
        <div className="error-container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      )}

      {!error && (
        <>
          <div className="sortBy">
            <div className="filter-section">
              <div className="sortByDifficulty">
                <label>Filter by Difficulty:</label>
                <select value={difficulty} onChange={handleDifficultyChange}>
                  <option value="">All</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
             
              <div className="sortByOptions">
                <label>Sort by:</label>
                <select value={sortBy} onChange={handleSortChange}>
                  <option value="frequency">Frequency</option>
                  <option value="name-az">Name (A-Z)</option>
                  <option value="name-za">Name (Z-A)</option>
                  <option value="acceptance">Acceptance Rate</option>
                </select>
              </div>
            </div>
          </div>

          <div className="problems">
            <div className="problems-header">
              <div className="header-item">Title</div>
              <div className="header-item">Difficulty</div>
              <div className="header-item">Frequency</div>
              <div className="header-item">Acceptance</div>
              <div className="header-item">Topics</div>
              <div className="header-item">Action</div>
            </div>

            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem, index) => (
                <div key={problem._id || index} className="problem-item">
                  <div className="problem-title">
                    <span className="problem-name">{problem.title}</span>
                  </div>
                  <div className={`problem-difficulty ${getDifficultyClass(problem.difficulty)}`}>
                    {problem.difficulty}
                  </div>
                  <div className="problem-frequency">
                    <div className="frequency-bar">
                      <div
                        className="frequency-fill"
                        style={{ width: `${Math.min(problem.frequency, 100)}%` }}
                      ></div>
                    </div>
                    <span className="frequency-text">{problem.frequency}%</span>
                  </div>
                  <div className="problem-acceptance">
                    {problem.acceptanceRate}
                  </div>
                  <div className="problem-topics">
                    {problem.topics && problem.topics.length > 0 ? (
                      problem.topics.map((topic, topicIndex) => (
                        <span key={topicIndex} className="topic-tag">
                          {topic}
                        </span>
                      ))
                    ) : (
                      <span className="topic-tag">No topics</span>
                    )}
                  </div>
                  <div className="problem-action">
                    <a
                      href={problem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="solve-btn"
                    >
                      Solve
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-problems">
                <p>
                  {problems.length === 0 
                    ? `No questions available for ${companyName} yet. Please contact admin to upload questions.`
                    : 'No problems found matching your criteria.'
                  }
                </p>
              </div>
            )}
          </div>
        </>
      )}
     
      <Footer />
    </div>
  );
};

export default CompanyQuestions;
