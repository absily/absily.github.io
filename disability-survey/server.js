const express = require('express');
const bodyParser = require('body-parser');
const svgCaptcha = require('svg-captcha');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session-like storage for captchas (simple in-memory for this demo)
// In production, use express-session or similar
const captchaStore = {};

// Generate Captcha
app.get('/captcha', (req, res) => {
    const captcha = svgCaptcha.create({
        size: 5,
        noise: 3,
        color: true,
        background: '#f0f0f0'
    });

    // Store the text with a simple client-generated ID or just send it back encrypted
    // For simplicity here, we'll rely on a client-provided ID to map it, 
    // or better yet, use a cookie if we could. 
    // Let's use a simple token approach for this stateless demo.
    const token = Math.random().toString(36).substring(7);
    captchaStore[token] = captcha.text.toLowerCase();

    // Clean up old captchas after 5 mins
    setTimeout(() => delete captchaStore[token], 300000);

    res.type('json').send({
        svg: captcha.data,
        token: token
    });
});

// Submit Form
app.post('/submit', (req, res) => {
    const { name, email, disability_type, captcha, token } = req.body;

    // Validate Captcha
    if (!token || !captchaStore[token] || captchaStore[token] !== captcha.toLowerCase()) {
        return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح' });
    }

    // Validate Fields
    if (!name || !email || !disability_type) {
        return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
    }

    // Insert into Database
    const sql = `INSERT INTO surveys (name, email, disability_type) VALUES (?, ?, ?)`;
    db.run(sql, [name, email, disability_type], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
        }

        // Clear used captcha
        delete captchaStore[token];

        res.json({ success: true, message: 'تم إرسال البيانات بنجاح' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
