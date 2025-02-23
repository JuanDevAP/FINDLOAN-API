const express = require('express');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname)));

const DATA_FILE = 'users.json';

// Helper function to read users from the JSON file
const readUsersFromFile = () => {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    }
    return [];
};

// Helper function to write users to the JSON file
const writeUsersToFile = (users) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
};

let users = readUsersFromFile();

// Helper function to generate a unique token
const generateToken = () => {
    return crypto.randomBytes(16).toString('hex');
};

// Validation functions (unchanged)
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidLastname = (lastname) => {
    const nameRegex = /^[A-Za-z]+$/;
    return nameRegex.test(lastname);
};

const isValidSSN = (ssn) => {
    const ssnRegex = /^\d{4}$/;
    return ssnRegex.test(ssn);
};

// API Endpoints
app.post('/api/users', (req, res) => {
    const { ssn, lastname, email } = req.body;

    if (!isValidSSN(ssn)) {
        return res.status(400).json({ error: 'Invalid SSN. Must be exactly 4 digits.' });
    }

    if (!isValidLastname(lastname)) {
        return res.status(400).json({ error: 'Invalid lastname. Must contain only alphabetic characters.' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email. Must be a valid email address.' });
    }

    const existingUser = users.find(user => user.ssn === ssn && user.lastname === lastname && user.email === email);

    if (existingUser) {
        return res.status(409).json({ error: 'User already in system.' });
    }

    const token = generateToken();

    const user = {
        id: users.length + 1,
        ssn: ssn,
        lastname: lastname,
        email: email,
        token: token,
        createdAt: new Date()
    };

    users.push(user);
    writeUsersToFile(users); // Save to file
    res.status(201).json({ user, token });
});


app.get('/api/users', (req, res) => {
    res.json(users);
});

app.get('/api/users/:id', (req, res) => {
    const user = users.find(p => p.id === parseInt(req.params.id, 10));
    if (!user) return res.status(404).send('User not found');
    res.json(user);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
