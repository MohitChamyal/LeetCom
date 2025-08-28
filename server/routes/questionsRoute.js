const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Question = require('../models/Questions'); // Fixed: Changed from Questions to Question

const router = express.Router();

// Configure secure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `questions-${uniqueSuffix}.csv`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Validate file type
    const allowedMimes = ['text/csv', 'application/vnd.ms-excel'];
    const hasValidExtension = file.originalname.toLowerCase().endsWith('.csv');
    
    if (allowedMimes.includes(file.mimetype) || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Please upload a valid CSV file'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

// Normalize difficulty values
const normalizeDifficulty = (difficulty) => {
  if (!difficulty) return 'Medium';
  
  const difficultyMap = {
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard'
  };
  
  return difficultyMap[difficulty.toLowerCase().trim()] || 'Medium';
};

// Validate and sanitize question data
const validateQuestion = (question) => {
  return (
    question.title && 
    question.title.trim().length > 0 &&
    question.link && 
    question.link.trim().length > 0 &&
    /^https?:\/\//.test(question.link)
  );
};

const addUniqueQuestions = async (company, newQuestions) => {
  try {
    // Get existing question titles for this company
    const existingQuestions = await Question.find({ company }).select('title');
    const existingTitles = new Set(existingQuestions.map(q => q.title.toLowerCase().trim()));

    // Filter out questions that already exist
    const uniqueQuestions = newQuestions.filter(question => {
      const questionTitle = question.title.toLowerCase().trim();
      return !existingTitles.has(questionTitle);
    });

    // Insert only unique questions
    let insertedCount = 0;
    if (uniqueQuestions.length > 0) {
      const insertResult = await Question.insertMany(uniqueQuestions, { 
        ordered: false // Continue inserting even if some fail
      });
      insertedCount = insertResult.length;
    }

    return {
      newQuestions: insertedCount,
      duplicatesSkipped: newQuestions.length - insertedCount,
      totalExisting: existingQuestions.length,
      totalAfter: existingQuestions.length + insertedCount
    };

  } catch (error) {
    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      // Some duplicates were found at DB level, extract successful inserts
      const successfulInserts = error.result?.nInserted || 0;
      return {
        newQuestions: successfulInserts,
        duplicatesSkipped: newQuestions.length - successfulInserts,
        totalExisting: 0,
        totalAfter: successfulInserts
      };
    }
    throw error;
  }
};

// POST: Upload CSV file and store questions
router.post('/upload', upload.single('csvFile'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please select a CSV file to upload'
      });
    }

    const { companyName } = req.body;
    if (!companyName?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Company name is required'
      });
    }

    // Validate company name format
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(companyName.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Company name contains invalid characters'
      });
    }

    const company = companyName.trim().toLowerCase();
    const questions = [];
    tempFilePath = req.file.path;

    // Parse CSV file with error handling
    const parsePromise = new Promise((resolve, reject) => {
      const stream = fs.createReadStream(tempFilePath);
      
      stream
        .pipe(csvParser({ skipEmptyLines: true }))
        .on('data', (row) => {
          try {
            const topicsArray = row.Topics ? 
              row.Topics.split(',')
                .map(topic => topic.trim())
                .filter(topic => topic.length > 0 && topic.length <= 50)
                .slice(0, 10) : // Limit topics to 10
              [];

            const question = {
              company: company,
              difficulty: normalizeDifficulty(row.Difficulty),
              title: row.Title?.trim().substring(0, 200) || '', // Limit title length
              frequency: Math.min(Math.max(parseInt(row.Frequency) || 0, 0), 100),
              acceptanceRate: row['Acceptance Rate']?.trim() || '0%',
              link: row.Link?.trim() || '',
              topics: topicsArray
            };

            if (validateQuestion(question)) {
              questions.push(question);
            }
          } catch (error) {
            // Skip invalid rows
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    await parsePromise;

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid questions found. Please check your CSV format and ensure it contains valid data.'
      });
    }

    const result = await addUniqueQuestions(company, questions);

    res.json({
      success: true,
      message: `Successfully processed ${questions.length} questions for ${companyName}`,
      details: {
        questionsInCSV: questions.length,
        newQuestionsAdded: result.newQuestions,
        duplicatesSkipped: result.duplicatesSkipped,
        totalQuestionsNow: result.totalAfter
      }
    });

  } catch (error) {
    // Handle specific multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size allowed is 5MB.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process the CSV file. Please check your file format and try again.'
    });
  } finally {
    // Clean up uploaded file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        // File cleanup failed, but don't affect the response
      }
    }
  }
});

// GET: Retrieve questions for a specific company
router.get('/:companyName', async (req, res) => {
  try {
    const companyName = req.params.companyName?.toLowerCase().trim();
    
    if (!companyName || companyName.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Invalid company name'
      });
    }

    const questions = await Question.find({ company: companyName })
      .sort({ frequency: -1, title: 1 })
      .limit(1000) // Reasonable limit
      .lean()
      .exec();

    res.json({
      success: true,
      company: companyName,
      count: questions.length,
      questions: questions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to retrieve questions at this time'
    });
  }
});

// GET: Get all companies with question counts
router.get('/', async (req, res) => {
  try {
    const companies = await Question.aggregate([
      {
        $group: {
          _id: '$company',
          count: { $sum: 1 },
          difficulties: { $addToSet: '$difficulty' },
          lastUpdated: { $max: '$updatedAt' }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $limit: 100 // Reasonable limit for companies
      }
    ]);

    const formattedCompanies = companies.map(comp => ({
      name: comp._id,
      count: comp.count,
      difficulties: comp.difficulties,
      lastUpdated: comp.lastUpdated
    }));

    res.json({
      success: true,
      companies: formattedCompanies
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to retrieve companies at this time'
    });
  }
});

module.exports = router;
