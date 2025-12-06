const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { getSupabase } = require('../db');

const router = express.Router();

// Configure multer for CSV upload - use /tmp for serverless
const upload = multer({
    dest: '/tmp/uploads/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files allowed'));
        }
    }
});

// Upload questions via CSV
router.post('/upload', upload.single('csvFile'), async (req, res) => {
    let filePath = null;

    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No CSV file uploaded' 
            });
        }

        const { companyName } = req.body;
        if (!companyName?.trim()) {
            return res.status(400).json({ 
                success: false, 
                error: 'Company name required' 
            });
        }

        const company = companyName.trim().toLowerCase();
        filePath = req.file.path;
        const questions = [];

        // Parse CSV
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csvParser({ skipEmptyLines: true }))
                .on('data', (row) => {
                    const topics = row.Topics ? 
                        row.Topics.split(',').map(t => t.trim()).filter(t => t) : 
                        [];

                    // Normalize difficulty
                    let difficulty = 'Medium';
                    const diff = row.Difficulty?.trim().toLowerCase();
                    if (diff === 'easy') difficulty = 'Easy';
                    else if (diff === 'medium') difficulty = 'Medium';
                    else if (diff === 'hard') difficulty = 'Hard';

                    // Parse and format acceptance rate
                    let acceptanceRate = '0.00%';
                    const rate = row['Acceptance Rate']?.trim();
                    if (rate) {
                        // Remove % if present and parse
                        const numRate = parseFloat(rate.replace('%', ''));
                        if (!isNaN(numRate)) {
                            // If rate is already a percentage (> 1), use as is
                            // If rate is a decimal (< 1), multiply by 100
                            const finalRate = numRate > 1 ? numRate : numRate * 100;
                            acceptanceRate = finalRate.toFixed(2) + '%';
                        }
                    }

                    questions.push({
                        company,
                        difficulty,
                        title: row.Title?.trim() || '',
                        frequency: parseInt(row.Frequency) || 0,
                        acceptance_rate: acceptanceRate,
                        link: row.Link?.trim() || '',
                        topics
                    });
                })
                .on('end', resolve)
                .on('error', reject);
        });

        if (questions.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'No valid questions in CSV' 
            });
        }

        const supabase = getSupabase();

        // Get existing questions
        const { data: existing } = await supabase
            .from('questions')
            .select('title')
            .eq('company', company);

        const existingTitles = new Set(
            (existing || []).map(q => q.title.toLowerCase())
        );

        // Filter unique questions
        const uniqueQuestions = questions.filter(
            q => q.title && q.link && !existingTitles.has(q.title.toLowerCase())
        );

        console.log(`📊 CSV Stats: Total=${questions.length}, Unique=${uniqueQuestions.length}, Existing=${existingTitles.size}`);

        // Insert questions
        let inserted = 0;
        if (uniqueQuestions.length > 0) {
            const { data, error } = await supabase
                .from('questions')
                .insert(uniqueQuestions)
                .select();

            if (error) {
                console.error('❌ Insert error:', error);
                return res.status(500).json({ 
                    success: false, 
                    error: `Database error: ${error.message}`,
                    details: error.hint || error.details
                });
            } else {
                inserted = data?.length || 0;
                console.log(`✅ Inserted ${inserted} questions for ${company}`);
            }
        }

        res.json({
            success: true,
            message: `Processed ${questions.length} questions`,
            details: {
                total: questions.length,
                inserted,
                duplicates: questions.length - inserted
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Upload failed' 
        });
    } finally {
        // Cleanup
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
});

// Get questions by company
router.get('/:companyName', async (req, res) => {
    try {
        const company = req.params.companyName?.toLowerCase().trim();

        if (!company) {
            return res.status(400).json({ 
                success: false, 
                error: 'Company name required' 
            });
        }

        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('company', company)
            .order('frequency', { ascending: false })
            .order('title', { ascending: true })
            .limit(1000);

        if (error) {
            console.error('Query error:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch questions' 
            });
        }

        // Format response
        const questions = (data || []).map(q => ({
            id: q.id,
            company: q.company,
            difficulty: q.difficulty,
            title: q.title,
            frequency: q.frequency,
            acceptanceRate: q.acceptance_rate,
            link: q.link,
            topics: q.topics || [],
            createdAt: q.created_at,
            updatedAt: q.updated_at
        }));

        res.json({
            success: true,
            company,
            count: questions.length,
            questions
        });

    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve questions' 
        });
    }
});

// Get all companies
router.get('/', async (req, res) => {
    try {
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('questions')
            .select('company, difficulty, updated_at');

        if (error) {
            console.error('Query error:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch companies' 
            });
        }

        // Aggregate by company
        const companyMap = new Map();
        (data || []).forEach(q => {
            if (!companyMap.has(q.company)) {
                companyMap.set(q.company, {
                    name: q.company,
                    count: 0,
                    difficulties: new Set(),
                    lastUpdated: q.updated_at
                });
            }
            const company = companyMap.get(q.company);
            company.count++;
            company.difficulties.add(q.difficulty);
            if (new Date(q.updated_at) > new Date(company.lastUpdated)) {
                company.lastUpdated = q.updated_at;
            }
        });

        const companies = Array.from(companyMap.values())
            .map(c => ({
                name: c.name,
                count: c.count,
                difficulties: Array.from(c.difficulties),
                lastUpdated: c.lastUpdated
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        res.json({
            success: true,
            companies
        });

    } catch (error) {
        console.error('Get companies error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to retrieve companies' 
        });
    }
});

module.exports = router;
