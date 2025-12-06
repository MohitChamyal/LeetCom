const express = require('express');
const bcrypt = require('bcryptjs');
const { getSupabase } = require('../db');
const config = require('../config');

const router = express.Router();

// Signup (Admin registration)
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, secretKey } = req.body;

        // Validation
        if (!name?.trim() || !email?.trim() || !password || !secretKey) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields are required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false, 
                error: 'Password must be at least 6 characters' 
            });
        }

        if (secretKey !== config.ADMIN_SECRET_KEY) {
            return res.status(403).json({ 
                success: false, 
                error: 'Invalid secret key' 
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid email format' 
            });
        }

        const supabase = getSupabase();

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', cleanEmail)
            .single();

        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email already registered' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
                name: name.trim(),
                email: cleanEmail,
                password: hashedPassword,
                role: 'admin'
            }])
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to create account',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        res.status(201).json({
            success: true,
            message: 'Admin account created successfully',
            admin: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            error: 'Registration failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and password required' 
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const supabase = getSupabase();

        // Find user
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', cleanEmail)
            .eq('role', 'admin')
            .single();

        if (error || !user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            admin: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Login failed' 
        });
    }
});

module.exports = router;
