// Simple Authentication System (No Firebase)
let currentUser = null;
let posts = [];

// Simple Auth Functions
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    currentUser = { 
        email: email, 
        uid: 'user_' + Date.now(),
        name: email.split('@')[0]
    };
    
    showAppScreen();
    alert('Login successful! Welcome ' + currentUser.email);
}

function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    currentUser = { 
        email: email, 
        uid: 'user_' + Date.now(),
        name: email.split('@')[0]
    };
    
    showAppScreen();
    alert('Account created successfully! Welcome to TinyBook.');
}

function logout() {
    currentUser = null;
    showLoginScreen();
}

// Screen Management
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
}

function showAppScreen() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    loadPosts();
}

// Post Functions
function createPost() {
    if (!currentUser) {
        alert('Please login first!');
        return;
    }
    
    const postContent = document.getElementById('postContent').value;
    
    if (postContent.trim() === '') {
        alert('Please write something first!');
        return;
    }

    const newPost = {
        content: postContent,
        timestamp: new Date().toLocaleString(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        id: Date.now()
    };

    // Save to local storage
    posts.unshift(newPost);
    savePostsToStorage();
    
    document.getElementById('postContent').value = '';
    displayPosts();
    
    alert('Post created successfully!');
}

function loadPosts() {
    // Load from local storage
    const savedPosts = localStorage.getItem('tinybook_posts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    }
    displayPosts();
}

function savePostsToStorage() {
    localStorage.setItem('tinybook_posts', JSON.stringify(posts));
}

function displayPosts() {
    const wall = document.getElementById('wall');
    wall.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <strong>${post.userEmail}</strong>
                <span class="timestamp">${post.timestamp}</span>
            </div>
            <p>${post.content}</p>
        `;
        wall.appendChild(postElement);
    });
}

// Check if user is already logged in
function checkAuthState() {
    const savedUser = localStorage.getItem('tinybook_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showAppScreen();
    } else {
        showLoginScreen();
    }
}

// Save user to storage when logging in
function saveUserToStorage() {
    if (currentUser) {
        localStorage.setItem('tinybook_user', JSON.stringify(currentUser));
    }
}

// Update login and signup functions to save user
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    currentUser = { 
        email: email, 
        uid: 'user_' + Date.now(),
        name: email.split('@')[0]
    };
    
    saveUserToStorage();
    showAppScreen();
}

function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email.includes('@')) {
        alert('Please enter a valid email address');
        return;
    }
    
    currentUser = { 
        email: email, 
        uid: 'user_' + Date.now(),
        name: email.split('@')[0]
    };
    
    saveUserToStorage();
    showAppScreen();
    alert('Account created successfully! Welcome to TinyBook.');
}

// Initial load
checkAuthState();
loadPosts();    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showAppScreen();
        })
        .catch((error) => {
            alert('Signup failed: ' + error.message);
        });
}

function logout() {
    auth.signOut();
    showLoginScreen();
}

// Screen Management
function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
}

function showAppScreen() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    loadPosts();
}

// Check auth state
auth.onAuthStateChanged((user) => {
    if (user) {
        showAppScreen();
    } else {
        showLoginScreen();
    }
});

// Post Functions
function createPost() {
    const user = auth.currentUser;
    const postContent = document.getElementById('postContent').value;
    
    if (!user) {
        alert('Please login first!');
        return;
    }
    
    if (postContent.trim() === '') {
        alert('Please write something first!');
        return;
    }

    const newPost = {
        content: postContent,
        timestamp: new Date().toLocaleString(),
        userId: user.uid,
        userEmail: user.email,
        id: Date.now()
    };

    // Save to Firebase
    db.collection('posts').add(newPost)
        .then(() => {
            document.getElementById('postContent').value = '';
            loadPosts();
        })
        .catch((error) => {
            alert('Error posting: ' + error.message);
        });
}

function loadPosts() {
    db.collection('posts').orderBy('timestamp', 'desc').get()
        .then((querySnapshot) => {
            posts = [];
            querySnapshot.forEach((doc) => {
                posts.push(doc.data());
            });
            displayPosts();
        })
        .catch((error) => {
            console.log('Error loading posts:', error);
        });
}

function displayPosts() {
    const wall = document.getElementById('wall');
    wall.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <strong>${post.userEmail}</strong>
                <span class="timestamp">${post.timestamp}</span>
            </div>
            <p>${post.content}</p>
        `;
        wall.appendChild(postElement);
    });
}

// Initial load
showLoginScreen();
