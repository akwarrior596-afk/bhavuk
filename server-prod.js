require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(err => console.error('MongoDB connection error:', err));

// Email transporter - using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Database Schemas
const applicationSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    qualifications: String,
    role: String,
    approved: { type: Boolean, default: false },
    about: String,
    salary: String,
    createdAt: { type: Date, default: Date.now }
});

const memberSchema = new mongoose.Schema({
    name: String,
    phone: String,
    email: String,
    qualifications: String,
    role: String,
    approved: { type: Boolean, default: true },
    about: String,
    salary: String,
    createdAt: { type: Date, default: Date.now }
});

const investorSchema = new mongoose.Schema({
    amount: Number,
    investmentType: String,
    expectation: String,
    equity: String,
    investorType: String,
    returnTimeline: String,
    returnType: String,
    experience: String,
    helpAdvice: String,
    helpConnections: String,
    helpMarketing: String,
    exitPlan: String,
    location: String,
    createdAt: { type: Date, default: Date.now }
});

const suggestionSchema = new mongoose.Schema({
    suggestion: String,
    type: String,
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    title: String,
    description: String,
    requiredQualifications: String,
    numOpenings: Number,
    filled: { type: Boolean, default: false },
    assignedTo: mongoose.Schema.Types.ObjectId,
    accessCode: String,
    createdAt: { type: Date, default: Date.now }
});

const incomeSchema = new mongoose.Schema({
    memberId: mongoose.Schema.Types.ObjectId,
    income: String,
    createdAt: { type: Date, default: Date.now }
});

const offerSchema = new mongoose.Schema({
    memberId: mongoose.Schema.Types.ObjectId,
    income: String,
    status: String,
    response: String,
    createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
    member: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});

const visitorSchema = new mongoose.Schema({
    source: String,
    referrer: String,
    pathname: String,
    userAgent: String,
    ip: String,
    timestamp: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema({
    name: String,
    email: String,
    rating: Number,
    comment: String,
    timestamp: { type: Date, default: Date.now }
});

const profitSchema = new mongoose.Schema({
    total: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

// Models
const Application = mongoose.model('Application', applicationSchema);
const Member = mongoose.model('Member', memberSchema);
const Investor = mongoose.model('Investor', investorSchema);
const Suggestion = mongoose.model('Suggestion', suggestionSchema);
const Post = mongoose.model('Post', postSchema);
const Income = mongoose.model('Income', incomeSchema);
const Offer = mongoose.model('Offer', offerSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Visitor = mongoose.model('Visitor', visitorSchema);
const Review = mongoose.model('Review', reviewSchema);
const Profit = mongoose.model('Profit', profitSchema);

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
app.post('/join', async (req, res) => {
    try {
        const { name, phone, email, qualifications, role } = req.body;
        const application = new Application({ name, phone, email, qualifications, role });
        await application.save();

        // Send notification email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.OWNER_EMAIL || process.env.EMAIL_USER,
            subject: 'New Join Request',
            text: `New application from ${name}: ${email}`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log('Email error:', error);
            else console.log('Email sent: ' + info.response);
        });

        res.redirect('/profile?id=' + application._id);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error submitting application');
    }
});

// Handle profile form
app.post('/profile', async (req, res) => {
    try {
        const { id, about, salary } = req.body;
        await Application.findByIdAndUpdate(id, { about, salary });
        res.send('Profile updated. Wait for approval.');
    } catch (error) {
        res.status(500).send('Error updating profile');
    }
});

// Handle suggestion
app.post('/suggest', async (req, res) => {
    try {
        const { suggestion, type } = req.body;
        const newSuggestion = new Suggestion({ suggestion, type });
        await newSuggestion.save();
        res.send('Suggestion submitted.');
    } catch (error) {
        res.status(500).send('Error submitting suggestion');
    }
});

// Handle investor form
app.post('/invest', async (req, res) => {
    try {
        const { 
            amount, investmentType, expectation, equity, investorType, returnTimeline, 
            returnType, experience, helpAdvice, helpConnections, helpMarketing, exitPlan, location 
        } = req.body;
        
        const investor = new Investor({ 
            amount: Number(amount), investmentType, expectation, equity, investorType, returnTimeline,
            returnType, experience, helpAdvice: helpAdvice || 'no', helpConnections: helpConnections || 'no',
            helpMarketing: helpMarketing || 'no', exitPlan, location
        });
        await investor.save();

        // Update profit
        let profit = await Profit.findOne();
        if (!profit) profit = new Profit({ total: 0 });
        profit.total = (profit.total || 0) + Number(amount);
        profit.updatedAt = new Date();
        await profit.save();

        res.send('Investment interest submitted and profit updated.');
    } catch (error) {
        res.status(500).send('Error submitting investment');
    }
});

app.get('/api/profit', async (req, res) => {
    try {
        let profit = await Profit.findOne();
        if (!profit) profit = { total: 0 };
        res.json(profit);
    } catch (error) {
        res.status(500).send('Error fetching profit');
    }
});

// Admin approve
app.post('/approve', async (req, res) => {
    try {
        const { id } = req.body;
        const application = await Application.findById(id);
        if (!application) {
            return res.status(404).send('Application not found.');
        }

        application.approved = true;
        await application.save();

        // Create member
        const member = new Member({
            name: application.name,
            phone: application.phone,
            email: application.email,
            qualifications: application.qualifications,
            role: application.role,
            about: application.about,
            salary: application.salary
        });
        await member.save();

        // Send notification email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: application.email,
            subject: 'Application Approved - BK Group',
            text: `Congratulations ${application.name}! Your application to join BK Group has been approved. You are now a member.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log(error);
            else console.log('Approval email sent: ' + info.response);
        });

        res.send('Approved.');
    } catch (error) {
        res.status(500).send('Error approving application');
    }
});

// Get members
app.get('/api/members', async (req, res) => {
    try {
        const members = await Member.find();
        res.json(members);
    } catch (error) {
        res.status(500).send('Error fetching members');
    }
});

// Get applications for admin
app.get('/api/applications', async (req, res) => {
    try {
        const applications = await Application.find();
        res.json(applications);
    } catch (error) {
        res.status(500).send('Error fetching applications');
    }
});

// Get investors
app.get('/api/investors', async (req, res) => {
    try {
        const investors = await Investor.find();
        res.json(investors);
    } catch (error) {
        res.status(500).send('Error fetching investors');
    }
});

// Track visitor
app.post('/track-visit', async (req, res) => {
    try {
        const { source, referrer, pathname, userAgent } = req.body;
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const visitor = new Visitor({ source: source || 'direct', referrer: referrer || 'none', pathname: pathname || '/', userAgent: userAgent || 'unknown', ip });
        await visitor.save();
        res.send('Tracked');
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).send('Error tracking visit');
    }
});

app.get('/api/visitors', async (req, res) => {
    try {
        const visitors = await Visitor.find();
        res.json(visitors);
    } catch (error) {
        res.status(500).send('Error fetching visitors');
    }
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
app.post('/create-post', async (req, res) => {
    try {
        const { title, description, requiredQualifications, numOpenings } = req.body;
        const accessCode = Math.random().toString(36).slice(2, 10).toUpperCase();
        const post = new Post({ title, description, requiredQualifications, numOpenings: Number(numOpenings) || 1, accessCode });
        await post.save();

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.OWNER_EMAIL || process.env.EMAIL_USER,
            subject: `New post created: ${title}`,
            text: `Post: ${title}\nAccess code for post holder login: ${accessCode}`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log(error);
            else console.log('Post access code email sent: ' + info.response);
        });

        res.send(`Post created. Access code for holders: ${accessCode}`);
    } catch (error) {
        res.status(500).send('Error creating post');
    }
});

// Assign post
app.post('/assign-post', async (req, res) => {
    try {
        const { postId, memberId } = req.body;
        const member = await Member.findById(memberId);
        const post = await Post.findById(postId);
        
        if (!post || !member) {
            return res.status(400).send('Post or member not found.');
        }

        // Unassign previous post
        const previousPost = await Post.findOne({ assignedTo: memberId });
        if (previousPost) {
            previousPost.filled = false;
            previousPost.assignedTo = null;
            await previousPost.save();
        }

        // Assign new post
        post.filled = true;
        post.assignedTo = memberId;
        member.role = post.title;
        await post.save();
        await member.save();

        res.send('Post assigned.');
    } catch (error) {
        res.status(500).send('Error assigning post');
    }
});

// Fire member
app.post('/fire-member', async (req, res) => {
    try {
        const { memberId } = req.body;
        const post = await Post.findOne({ assignedTo: memberId });
        if (post) {
            post.filled = false;
            post.assignedTo = null;
            await post.save();
        }
        await Member.findByIdAndDelete(memberId);
        res.send('Member fired.');
    } catch (error) {
        res.status(500).send('Error firing member');
    }
});

// Update income
app.post('/update-income', async (req, res) => {
    try {
        const { memberId, income } = req.body;
        let incomeRecord = await Income.findOne({ memberId });
        if (incomeRecord) {
            incomeRecord.income = income;
        } else {
            incomeRecord = new Income({ memberId, income });
        }
        await incomeRecord.save();

        // Create offer
        const offer = new Offer({ memberId, income, status: 'pending', response: null });
        await offer.save();

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.OWNER_EMAIL || process.env.EMAIL_USER,
            subject: 'Income update offer created',
            text: `Requested income offer of ${income} for member ${memberId}.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log(error);
            else console.log('Email sent: ' + info.response);
        });

        res.send('Income updated and offer created.');
    } catch (error) {
        res.status(500).send('Error updating income');
    }
});

app.post('/respond-offer', async (req, res) => {
    try {
        const { offerId, accept } = req.body;
        const offer = await Offer.findById(offerId);
        if (!offer) {
            return res.status(404).send('Offer not found.');
        }

        offer.status = accept ? 'accepted' : 'rejected';
        offer.response = accept ? 'Yes' : 'No';
        await offer.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.OWNER_EMAIL || process.env.EMAIL_USER,
            subject: `Offer ${offer.status} by member ${offer.memberId}`,
            text: `Member ${offer.memberId} has ${offer.status} the income offer ${offer.income}.`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log(error);
            else console.log('Email sent: ' + info.response);
        });

        res.send('Offer response tracking updated.');
    } catch (error) {
        res.status(500).send('Error responding to offer');
    }
});

app.get('/api/offers', async (req, res) => {
    try {
        const offers = await Offer.find();
        res.json(offers);
    } catch (error) {
        res.status(500).send('Error fetching offers');
    }
});

// Post-specific page and access control
app.get('/post/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const key = req.query.key || '';
        const post = await Post.findById(id);
        
        if (!post) {
            return res.status(404).send('Post not found');
        }

        const adminKeys = [process.env.ADMIN_KEY || 'admin123', process.env.OWNER_KEY || 'owner456'];
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
    } catch (error) {
        res.status(500).send('Error fetching post');
    }
});

// Get posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        res.status(500).send('Error fetching posts');
    }
});

// Get income
app.get('/api/income', async (req, res) => {
    try {
        const incomes = await Income.find();
        res.json(incomes);
    } catch (error) {
        res.status(500).send('Error fetching income');
    }
});

// Get chat history
app.get('/api/chat', async (req, res) => {
    try {
        const chat = await Chat.find();
        res.json(chat);
    } catch (error) {
        res.status(500).send('Error fetching chat');
    }
});

app.post('/chat', async (req, res) => {
    try {
        const { member, message } = req.body;
        if (!member || !message) {
            return res.status(400).send('Member and message required');
        }
        const entry = new Chat({ member, message });
        await entry.save();
        res.send('Message sent');
    } catch (error) {
        res.status(500).send('Error sending message');
    }
});

// Get reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find();
        res.json(reviews);
    } catch (error) {
        res.status(500).send('Error fetching reviews');
    }
});

// Submit review
app.post('/review', async (req, res) => {
    try {
        const { name, email, rating, comment } = req.body;
        if (!name || !email || !rating || !comment) {
            return res.status(400).send('All fields are required');
        }
        const review = new Review({ name, email, rating: Number(rating), comment });
        await review.save();
        res.send('Review submitted successfully');
    } catch (error) {
        res.status(500).send('Error submitting review');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`BK Group site running on port ${PORT}`);
});
