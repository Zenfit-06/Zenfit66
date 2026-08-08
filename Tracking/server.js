const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const SESSION_FILE = path.join(__dirname, 'data', 'session.json');

// Helper to read users from JSON file
function getUsersFromFile() {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        const parsed = JSON.parse(data);
        return parsed.users || [];
    } catch (err) {
        console.error('Error reading users file:', err);
        return [];
    }
}

// Helper to write users to JSON file
function saveUsersToFile(users) {
    try {
        const dir = path.dirname(USERS_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 4), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing users file:', err);
        return false;
    }
}

// Helper to read session from JSON file
function getSessionFromFile() {
    try {
        if (!fs.existsSync(SESSION_FILE)) {
            return { currentUser: null };
        }
        const data = fs.readFileSync(SESSION_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading session file:', err);
        return { currentUser: null };
    }
}

// Helper to write session to JSON file
function saveSessionToFile(sessionData) {
    try {
        const dir = path.dirname(SESSION_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionData, null, 4), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing session file:', err);
        return false;
    }
}

// MIME types for static files
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;

    // --- API ENDPOINT: GET /api/users ---
    if (pathname === '/api/users' && req.method === 'GET') {
        const users = getUsersFromFile();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ users }));
        return;
    }

    // --- API ENDPOINT: GET /api/current-user ---
    if (pathname === '/api/current-user' && req.method === 'GET') {
        const session = getSessionFromFile();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ user: session.currentUser || null }));
        return;
    }

    // --- API ENDPOINT: POST /api/login ---
    if (pathname === '/api/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { email, password } = JSON.parse(body);

                if (!email || !password) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Email and password are required' }));
                    return;
                }

                const users = getUsersFromFile();
                const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

                if (userIndex === -1) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No account found with this email' }));
                    return;
                }

                if (users[userIndex].password !== password) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Incorrect password' }));
                    return;
                }

                const user = users[userIndex];
                user.lastLogin = new Date().toISOString();
                users[userIndex] = user;
                saveUsersToFile(users);

                saveSessionToFile({ currentUser: user, loggedInAt: new Date().toISOString() });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, user }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    // --- API ENDPOINT: POST /api/logout ---
    if (pathname === '/api/logout' && req.method === 'POST') {
        saveSessionToFile({ currentUser: null, loggedOutAt: new Date().toISOString() });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
        return;
    }

    // --- API ENDPOINT: POST /api/update-user ---
    if (pathname === '/api/update-user' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const updates = JSON.parse(body);
                const session = getSessionFromFile();
                if (!session.currentUser) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Not authenticated' }));
                    return;
                }

                const users = getUsersFromFile();
                const userIndex = users.findIndex(u => u.id === session.currentUser.id || u.email.toLowerCase() === session.currentUser.email.toLowerCase());

                if (userIndex !== -1) {
                    users[userIndex] = { ...users[userIndex], ...updates };
                    saveUsersToFile(users);
                    session.currentUser = users[userIndex];
                    saveSessionToFile(session);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, user: session.currentUser }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'User not found' }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    // --- API ENDPOINT: POST /api/signup ---
    if (pathname === '/api/signup' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { fullName, email, password } = JSON.parse(body);

                if (!fullName || !email || !password) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'All fields are required' }));
                    return;
                }

                const users = getUsersFromFile();
                const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (exists) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Email already registered' }));
                    return;
                }

                const newUser = {
                    id: users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1,
                    fullName,
                    email: email.toLowerCase(),
                    password,
                    createdTime: new Date().toISOString()
                };

                users.push(newUser);
                const saved = saveUsersToFile(users);

                if (saved) {
                    saveSessionToFile({ currentUser: newUser, loggedInAt: new Date().toISOString() });
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, user: newUser }));
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to write to users.json' }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    // --- STATIC FILE SERVING ---
    let filePath = path.join(__dirname, pathname === '/' ? 'login.html' : pathname);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`ZENFIT Backend Server running at http://localhost:${PORT}`);
    console.log(`Users file located at: ${USERS_FILE}`);
    console.log(`Session file located at: ${SESSION_FILE}`);
});

