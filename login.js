document.addEventListener('DOMContentLoaded', () => {
    const guestLoginBtn = document.getElementById('guest-login-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');

    // --- IndexedDB Setup for Login ---
    let db;
    const DB_NAME = 'NumberForgeDB';
    const USERS_STORE = 'users';

    function openDB() {
        return new Promise((resolve, reject) => {
            // Use the latest version (4) to match other game files.
            const request = indexedDB.open(DB_NAME, 4);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(USERS_STORE)) {
                    db.createObjectStore(USERS_STORE, { keyPath: 'username' });
                }
            };
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // --- Crypto Functions ---
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // --- Form Toggle Logic ---
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
    });

    guestLoginBtn.addEventListener('click', () => {
        // Generate a unique ID for the guest session
        const guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Store it in sessionStorage so it persists only for the browser tab session
        sessionStorage.setItem('currentUserId', guestId);
        window.location.href = 'game-select.html';
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById('signup-username');
        const passwordInput = document.getElementById('signup-password'); // Already defined
        const confirmPasswordInput = document.getElementById('signup-password-confirm');
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!username || !password) {
            alert('Username and password cannot be empty.');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            passwordInput.value = '';
            confirmPasswordInput.value = '';
            return;
        }

        // Password complexity validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{5,}$/;
        if (!passwordRegex.test(password)) {
            alert('Password must be at least 5 characters long and include at least one uppercase letter, one lowercase letter, and one number or symbol.');
            return;
        }

        const hashedPassword = await hashPassword(password);
        const transaction = db.transaction(USERS_STORE, 'readwrite');
        const store = transaction.objectStore(USERS_STORE);

        // Check if user already exists
        const getRequest = store.get(username);
        getRequest.onsuccess = () => {
            if (getRequest.result) {
                alert('Username already exists. Please choose another.');
            } else {
                // Add new user
                store.add({ username, password: hashedPassword });
                alert('Account created successfully! Please log in.');
                usernameInput.value = ''; // Clear username field
                passwordInput.value = ''; // Clear password field
                confirmPasswordInput.value = ''; // Clear confirm password field
                showLoginLink.click(); // Switch to login form
            }
        };
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            alert('Please enter a username and password.');
            return;
        }

        const transaction = db.transaction(USERS_STORE, 'readonly');
        const store = transaction.objectStore(USERS_STORE);
        const getRequest = store.get(username);

        getRequest.onsuccess = async () => {
            const user = getRequest.result;
            if (!user) {
                alert('Invalid username or password.');
                return;
            }

            const hashedPassword = await hashPassword(password);
            if (hashedPassword === user.password) {
                sessionStorage.setItem('currentUserId', user.username);
                window.location.href = 'game-select.html';
            } else {
                alert('Invalid username or password.');
            }
        };
    });

    // --- Live Password Validation ---
    const passwordInput = document.getElementById('signup-password');
    const requirementsContainer = document.getElementById('password-requirements');
    const reqs = {
        length: document.getElementById('req-length'),
        lower: document.getElementById('req-lower'),
        upper: document.getElementById('req-upper'),
        symbol: document.getElementById('req-symbol')
    };

    passwordInput.addEventListener('focus', () => {
        requirementsContainer.style.display = 'block';
    });

    passwordInput.addEventListener('blur', () => {
        requirementsContainer.style.display = 'none';
    });

    passwordInput.addEventListener('input', () => {
        const value = passwordInput.value;
        // Check length
        reqs.length.classList.toggle('valid', value.length >= 5);
        // Check for lowercase letter
        reqs.lower.classList.toggle('valid', /[a-z]/.test(value));
        // Check for uppercase letter
        reqs.upper.classList.toggle('valid', /[A-Z]/.test(value));
        // Check for number or symbol
        reqs.symbol.classList.toggle('valid', /[\d\W]/.test(value));
    });


    openDB().catch(err => console.error('Failed to open DB for login:', err));
});