const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Email transporter (placeholder - replace with real credentials)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bhavuk8743@gmail.com', // Updated email
        pass: 'your-app-password' // Replace with app password
    }
});

// Data files
const applicationsFile = 'applications.json';
const membersFile = 'members.json';
const suggestionsFile = 'suggestions.json';
const investorsFile = 'investors.json';
const postsFile = 'posts.json';
const incomeFile = 'income.json';
const profitFile = 'profit.json';
const chatFile = 'chat.json';
const offersFile = 'offers.json';
const visitorsFile = 'visitors.json';
const reviewsFile = 'reviews.json';

// Initialize files if not exist
[applicationsFile, membersFile, suggestionsFile, investorsFile, postsFile, incomeFile, profitFile, offersFile, chatFile, visitorsFile, reviewsFile].forEach(file => {
    if (!fs.existsSync(file)) {
        const initial = file === profitFile ? JSON.stringify({ total: 0 }) : JSON.stringify([]);
        fs.writeFileSync(file, initial);
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/hr', (req, res) => {
    res.sendFile(path.join(__dirname, 'hr.html'));
});

app.get('/pnl', (req, res) => {
    res.sendFile(path.join(__dirname, 'pnl.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/members', (req, res) => {
    res.sendFile(path.join(__dirname, 'members.html'));
});

app.get('/memberpage', (req, res) => {
    res.sendFile(path.join(__dirname, 'memberpage.html'));
});

app.get('/go-member', (req, res) => {
    res.redirect('/memberpage');
});

// Handle join form
app.post('/join', (req, res) => {
    const { name, phone, email, qualifications, role } = req.body;
    const application = { id: Date.now(), name, phone, email, qualifications, role, approved: false };

    // Save application
    const applications = JSON.parse(fs.readFileSync(applicationsFile));
    applications.push(application);
    fs.writeFileSync(applicationsFile, JSON.stringify(applications, null, 2));

    // Send notification email (placeholder)
    const mailOptions = {
        from: 'bhavuk8743@gmail.com',
        to: 'bhavuk8743@gmail.com', // Owner's email
        subject: 'New Join Request',
        text: `New application from ${name}: ${email}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log('Email sent: ' + info.response);
    });

    // Redirect to profile page
    res.redirect('/profile?id=' + application.id);
});

// Handle profile form
app.post('/profile', (req, res) => {
    const { id, about, salary } = req.body;
    const applications = JSON.parse(fs.readFileSync(applicationsFile));
    const app = applications.find(a => a.id == id);
    if (app) {
        app.about = about;
        app.salary = salary;
        fs.writeFileSync(applicationsFile, JSON.stringify(applications, null, 2));
    }
    res.send('Profile updated. Wait for approval.');
});

// Handle suggestion
app.post('/suggest', (req, res) => {
    const { suggestion, type } = req.body; // type: product or contract
    const suggestions = JSON.parse(fs.readFileSync(suggestionsFile));
    suggestions.push({ id: Date.now(), suggestion, type });
    fs.writeFileSync(suggestionsFile, JSON.stringify(suggestions, null, 2));
    res.send('Suggestion submitted.');
});

// Handle investor form
app.post('/invest', (req, res) => {
    const { 
        amount, 
        investmentType, 
        expectation, 
        equity, 
        investorType, 
        returnTimeline, 
        returnType, 
        experience, 
        helpAdvice, 
        helpConnections, 
        helpMarketing, 
        exitPlan, 
        location 
    } = req.body;
    const investors = JSON.parse(fs.readFileSync(investorsFile));
    const inv = { 
        id: Date.now(), 
        amount: Number(amount), 
        investmentType,
        expectation,
        equity,
        investorType,
        returnTimeline,
        returnType,
        experience,
        helpAdvice: helpAdvice || 'no',
        helpConnections: helpConnections || 'no',
        helpMarketing: helpMarketing || 'no',
        exitPlan,
        location
    };
    investors.push(inv);
    fs.writeFileSync(investorsFile, JSON.stringify(investors, null, 2));

    // Add investment amount to profit
    const profitData = JSON.parse(fs.readFileSync(profitFile));
    profitData.total = (profitData.total || 0) + Number(amount);
    fs.writeFileSync(profitFile, JSON.stringify(profitData, null, 2));

    res.send('Investment interest submitted and profit updated.');
});

app.get('/api/profit', (req, res) => {
    const profitData = JSON.parse(fs.readFileSync(profitFile));
    res.json(profitData);
});

// Admin approve
app.post('/approve', (req, res) => {
    const { id } = req.body;
    const applications = JSON.parse(fs.readFileSync(applicationsFile));
    const members = JSON.parse(fs.readFileSync(membersFile));
    const app = applications.find(a => a.id == id);
    if (app) {
        app.approved = true;
        members.push(app);
        fs.writeFileSync(applicationsFile, JSON.stringify(applications, null, 2));
        fs.writeFileSync(membersFile, JSON.stringify(members, null, 2));

        // Send notification email to applicant
        const mailOptions = {
            from: 'bhavuk8743@gmail.com',
            to: app.email,
            subject: 'Application Approved - BK Group',
            text: `Congratulations ${app.name}! Your application to join BK Group has been approved. You are now a member.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log(error);
            else console.log('Approval email sent: ' + info.response);
        });
    }
    res.send('Approved.');
});

// Get members (for approved users)
app.get('/api/members', (req, res) => {
    const members = JSON.parse(fs.readFileSync(membersFile));
    res.json(members);
});

// Get applications for admin
app.get('/api/applications', (req, res) => {
    const applications = JSON.parse(fs.readFileSync(applicationsFile));
    res.json(applications);
});

// Get investors
app.get('/api/investors', (req, res) => {
    const investors = JSON.parse(fs.readFileSync(investorsFile));
    res.json(investors);
});

// Track visitor count and source
app.post('/track-visit', (req, res) => {
    const { source, referrer, pathname, userAgent } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const visitors = JSON.parse(fs.readFileSync(visitorsFile));
    visitors.push({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        source: source || 'direct',
        referrer: referrer || 'none',
        pathname: pathname || '/',
        userAgent: userAgent || 'unknown',
        ip
    });
    fs.writeFileSync(visitorsFile, JSON.stringify(visitors, null, 2));
    res.send('Tracked');
});

app.get('/api/visitors', (req, res) => {
    const visitors = JSON.parse(fs.readFileSync(visitorsFile));
    res.json(visitors);
});

// AI advice endpoint
app.post('/ai-advice', (req, res) => {
    const { query } = req.body;
    const lower = query.toLowerCase();
    let advice = 'AI assistant: ';

    if (lower.includes('assign') || lower.includes('role')) {
        advice += 'Review open posts and member qualifications. Assign roles that match skills to maximize productivity.';
    } else if (lower.includes('hire') || lower.includes('application')) {
        advice += 'Check applications for matching qualifications. Hire based on experience and fit for available posts.';
    } else if (lower.includes('task') || lower.includes('work')) {
        advice += 'Define tasks based on post descriptions. For example, assign coding tasks to developers, marketing to marketers.';
    } else if (lower.includes('member') || lower.includes('staff')) {
        advice += 'Monitor member performance and adjust roles as needed. Use the change post feature for reassignments.';
    } else if (lower.includes('profit') || lower.includes('income')) {
        advice += 'Track investments and member contributions. Update incomes based on performance and company profits.';
    } else {
        advice += 'I can help with role assignment, hiring decisions, task management, and site operations. Ask about specific topics!';
    }

    res.send(advice);
});

// Create post
app.post('/create-post', (req, res) => {
    const { title, description, requiredQualifications, numOpenings } = req.body;
    const accessCode = Math.random().toString(36).slice(2, 10).toUpperCase();
    const posts = JSON.parse(fs.readFileSync(postsFile));
    const newPost = {
        id: Date.now(),
        title,
        description,
        requiredQualifications,
        numOpenings: Number(numOpenings) || 1,
        filled: false,
        assignedTo: null,
        accessCode
    };
    posts.push(newPost);
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));

    // send access code email to owner/admin for distribution
    const mailOptions = {
        from: 'bhavuk8743@gmail.com',
        to: 'bhavuk8743@gmail.com',
        subject: `New post created: ${title}`,
        text: `Post: ${title}\nAccess code for post holder login: ${accessCode}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log('Post access code email sent: ' + info.response);
    });

    res.send(`Post created. Access code for holders: ${accessCode}`);
});

// Assign post
app.post('/assign-post', (req, res) => {
    const { postId, memberId } = req.body;
    const members = JSON.parse(fs.readFileSync(membersFile));
    const member = members.find(m => m.id == memberId);
    const posts = JSON.parse(fs.readFileSync(postsFile));
    const post = posts.find(p => p.id == postId);
    if (post && member) {
        // Unassign any previous post
        const previousPost = posts.find(p => p.assignedTo == memberId);
        if (previousPost) {
            previousPost.filled = false;
            previousPost.assignedTo = null;
        }
        // Assign new post
        post.filled = true;
        post.assignedTo = memberId;
        member.role = post.title;
        fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
        fs.writeFileSync(membersFile, JSON.stringify(members, null, 2));
        res.send('Post assigned.');
    } else {
        res.status(400).send('Post or member not found.');
    }
});

// Fire member
app.post('/fire-member', (req, res) => {
    const { memberId } = req.body;
    const members = JSON.parse(fs.readFileSync(membersFile));
    const posts = JSON.parse(fs.readFileSync(postsFile));
    const index = members.findIndex(m => m.id == memberId);
    if (index !== -1) {
        const member = members[index];
        const post = posts.find(p => p.assignedTo == memberId);
        if (post) {
            post.filled = false;
            post.assignedTo = null;
        }
        members.splice(index, 1);
        fs.writeFileSync(membersFile, JSON.stringify(members, null, 2));
        fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
    }
    res.send('Member fired.');
});

// Update income + notify member for acceptance
app.post('/update-income', (req, res) => {
    const { memberId, income } = req.body;
    const incomes = JSON.parse(fs.readFileSync(incomeFile));
    const existing = incomes.find(i => i.memberId == memberId);
    if (existing) {
        existing.income = income;
    } else {
        incomes.push({ memberId, income });
    }
    fs.writeFileSync(incomeFile, JSON.stringify(incomes, null, 2));

    // create offer message
    const offers = JSON.parse(fs.readFileSync(offersFile));
    const offer = {
        id: Date.now(),
        memberId,
        income,
        status: 'pending',
        response: null
    };
    offers.push(offer);
    fs.writeFileSync(offersFile, JSON.stringify(offers, null, 2));

    // (Optional) email owner notification placeholder
    const mailOptions = {
        from: 'bhavuk8743@gmail.com',
        to: 'bhavuk8743@gmail.com',
        subject: 'Income update offer created',
        text: `Requested income offer of ${income} for member ${memberId}.`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log(error);
        else console.log('Email sent: ' + info.response);
    });

    res.send('Income updated and offer created.');
});

app.post('/respond-offer', (req, res) => {
    const { offerId, accept } = req.body;
    const offers = JSON.parse(fs.readFileSync(offersFile));
    const offer = offers.find(o => o.id == offerId);
    if (offer) {
        offer.status = accept ? 'accepted' : 'rejected';
        offer.response = accept ? 'Yes' : 'No';
        fs.writeFileSync(offersFile, JSON.stringify(offers, null, 2));

        // notify owner
        const mailOptions = {
            from: 'bhavuk8743@gmail.com',
            to: 'bhavuk8743@gmail.com',
            subject: `Offer ${offer.status} by member ${offer.memberId}`,
            text: `Member ${offer.memberId} has ${offer.status} the income offer ${offer.income}.`,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log(error);
            else console.log('Email sent: ' + info.response);
        });

        res.send('Offer response tracking updated.');
    } else {
        res.status(404).send('Offer not found.');
    }
});

app.get('/api/offers', (req, res) => {
    const offers = JSON.parse(fs.readFileSync(offersFile));
    res.json(offers);
});

// Post-specific page and access control
app.get('/post/:id', (req, res) => {
    const { id } = req.params;
    const key = req.query.key || '';
    const posts = JSON.parse(fs.readFileSync(postsFile));
    const post = posts.find(p => p.id == id);
    if (!post) {
        return res.status(404).send('Post not found');
    }

    const adminKeys = ['admin123', 'owner456'];
    const allowed = adminKeys.includes(key) || key === post.accessCode;

    if (!allowed) {
        return res.send(`
            <!DOCTYPE html>
            <html><head><title>Post Access</title></head><body>
            <h2>Enter access code for post: ${post.title}</h2>
            <p>Check your email for the code.</p>
            <form method="GET" action="/post/${id}">
                <input name="key" type="password" placeholder="Access code" required />
                <button type="submit">Enter</button>
            </form>
            </body></html>
        `);
    }

    const isAdminOrOwner = adminKeys.includes(key);
    const instruction = isAdminOrOwner ?
        'As Owner/Admin, you can visit any post and check status.' :
        'Do your assigned task based on post description and communicate updates with your employer.';

    res.send(`
        <!DOCTYPE html>
        <html><head><title>${post.title}</title></head><body>
        <h1>${post.title}</h1>
        <p><strong>Description:</strong> ${post.description}</p>
        <p><strong>Required Qualifications:</strong> ${post.requiredQualifications}</p>
        <p><strong>Number of openings:</strong> ${post.numOpenings}</p>
        <p><strong>Assigned To:</strong> ${post.assignedTo || 'Not assigned'}</p>
        <hr />
        <h2>Work Instructions</h2>
        <p>Welcome to your post page. This page is only for authorized post-holders (with post code), Owner, or Admin.</p>
        <p>${instruction}</p>
        </body></html>
    `);
});

// Get posts
app.get('/api/posts', (req, res) => {
    const posts = JSON.parse(fs.readFileSync(postsFile));
    res.json(posts);
});

// Get income
app.get('/api/income', (req, res) => {
    const incomes = JSON.parse(fs.readFileSync(incomeFile));
    res.json(incomes);
});

// Get chat history
app.get('/api/chat', (req, res) => {
    const chat = JSON.parse(fs.readFileSync(chatFile));
    res.json(chat);
});

app.post('/chat', (req, res) => {
    const { member, message } = req.body;
    if (!member || !message) {
        return res.status(400).send('Member and message required');
    }
    const chat = JSON.parse(fs.readFileSync(chatFile));
    const entry = { id: Date.now(), member, message, timestamp: new Date().toISOString() };
    chat.push(entry);
    fs.writeFileSync(chatFile, JSON.stringify(chat, null, 2));
    res.send('Message sent');
});

// Get reviews
app.get('/api/reviews', (req, res) => {
    const reviews = JSON.parse(fs.readFileSync(reviewsFile));
    res.json(reviews);
});

// Submit review
app.post('/review', (req, res) => {
    const { name, email, rating, comment } = req.body;
    if (!name || !email || !rating || !comment) {
        return res.status(400).send('All fields are required');
    }
    const reviews = JSON.parse(fs.readFileSync(reviewsFile));
    const review = { id: Date.now(), name, email, rating: Number(rating), comment, timestamp: new Date().toISOString() };
    reviews.push(review);
    fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2));
    res.send('Review submitted successfully');
});

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(PORT, () => {
    console.log(`Secure server running on https://localhost:${PORT}`);
});