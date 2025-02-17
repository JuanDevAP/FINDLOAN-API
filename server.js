const express = require('express');
const path = require('path');
const cors = require('cors'); // Import CORS

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); // Allow all origins

// Serve static files (including index.html)
app.use(express.static(path.join(__dirname)));

// Mock data
let loans = [];

// Helper function to validate email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to validate lastname (only alphabetic characters)
const isValidLastname = (lastname) => {
    const nameRegex = /^[A-Za-z]+$/;
    return nameRegex.test(lastname);
};

// Helper function to validate SSN (exactly 4 digits)
const isValidSSN = (ssn) => {
    const ssnRegex = /^\d{4}$/;
    return ssnRegex.test(ssn);
};

// API Endpoints
app.post('/api/loans', (req, res) => {
    const { ssn, lastname, email } = req.body;

    // Validate SSN (must be exactly 4 digits)
    if (!isValidSSN(ssn)) {
        return res.status(400).json({ error: 'Invalid SSN. Must be exactly 4 digits.' });
    }

    // Validate Lastname (must be a string with only alphabetic characters)
    if (!isValidLastname(lastname)) {
        return res.status(400).json({ error: 'Invalid lastname. Must contain only alphabetic characters.' });
    }

    // Validate Email
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email. Must be a valid email address with a proper domain and no spaces.' });
    }

    const loan = {
        id: loans.length + 1,
        ssn: ssn,
        lastname: lastname,
        email: email,
        status: 'pending',
        createdAt: new Date()
    };

    loans.push(loan);
    res.status(201).json(loan);
});

app.get('/api/loans', (req, res) => {
    res.json(loans);
});

app.get('/api/loans/:id', (req, res) => {
    const loan = loans.find(p => p.id === parseInt(req.params.id, 10));
    if (!loan) return res.status(404).send('Loan not found');
    res.json(loan);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});