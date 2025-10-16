// TinyBook - Complete Social Media App
class TinyBook {
    constructor() {
        this.currentUser = null;
        this.users = this.loadFromStorage('tinybook_users') || [];
        this.posts = this.loadFromStorage('tinybook_posts') || [];
        this.friends = this.loadFromStorage('tinybook_friends') || [];
        this.init();
    }

    init() {
        this.checkAuthState();
        this.displayPosts();
    }

    // Authentication Functions
    showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('signupScreen').classList.add('hidden');
        document.getElementById('appScreen').classList.add('hidden');
    }

    showSignup() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('signupScreen').classList.remove('hidden');
        document.getElementById('appScreen').classList.add('hidden');
    }

    showApp() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('signupScreen').classList.add('hidden');
        document.getElementById('appScreen').classList.remove('hidden');
        this.updateUI();
    }

    login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            this.saveToStorage('tinybook_current_user', user);
            this.showApp();
            this.showSuccess(`Welcome back, ${user.name}!`);
        } else {
            this.showError('Invalid email or password');
        }
    }

    signup() {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        if (!name.trim()) {
            this.showError('Please enter your name');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showError('Email already exists');
            return;
        }

        const newUser = {
            id: this.generateId(),
            name: name,
            email: email,
            password: password,
            joined: new Date().toLocaleDateString()
        };

        this.users.push(newUser);
        this.currentUser = newUser;
        
        this.saveToStorage('tinybook_users', this.users);
        this.saveToStorage('tinybook_current_user', newUser);
        
        this.showApp();
        this.showSuccess(`Welcome to TinyBook, ${name}!`);
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('tinybook_current_user');
        this.showLogin();
        this.showSuccess('Logged out successfully');
    }

    checkAuthState() {
        const savedUser = this.loadFromStorage('tinybook_current_user');
        if (savedUser) {
            this.currentUser = savedUser;
            this.showApp();
        } else {
            this.showLogin();
        }
    }

    // Post Functions
    createPost() {
        if (!this.currentUser) {
            this.showError('Please login first');
            return;
        }

        const content = document.getElementById('postContent').value.trim();
        
        if (!content) {
            this.showError('Please write something to post');
            return;
        }

        const newPost = {
            id: this.generateId(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            content: content,
            timestamp: new Date(),
            likes: [],
            comments: [],
            shares: 0
        };

        this.posts.unshift(newPost);
        this.saveToStorage('tinybook_posts', this.posts);
        
        document.getElementById('postContent').value = '';
        this.displayPosts();
        this.showSuccess('Post created successfully!');
    }

    displayPosts() {
        const container = document.getElementById('postsContainer');
        container.innerHTML = '';

        this.posts.forEach(post => {
            const postElement = this.createPostElement(post);
            container.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        
        const isLiked = post.likes.includes(this.currentUser?.id);
        const likeCount = post.likes.length;
        const commentCount = post.comments.length;

        postDiv.innerHTML = `
            <div class="post-header">
                <img src="https://via.placeholder.com/40" alt="Profile" class="profile-pic">
                <div>
                    <div class="post-user">${post.userName}</div>
                    <div class="post-time">${this.formatTime(post.timestamp)}</div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-stats">
                <span>${likeCount} likes</span>
                <span>${commentCount} comments</span>
                <span>${post.shares} shares</span>
            </div>
            <div class="post-actions-bar">
                <button class="post-action ${isLiked ? 'liked' : ''}" onclick="tinybook.likePost('${post.id}')">
                    <i class="fas fa-thumbs-up"></i> Like
                </button>
                <button class="post-action" onclick="tinybook.focusComment('${post.id}')">
                    <i class="fas fa-comment"></i> Comment
                </button>
                <button class="post-action" onclick="tinybook.sharePost('${post.id}')">
                    <i class="fas fa-share"></i> Share
                </button>
            </div>
            <div class="comments-section" id="comments-${post.id}">
                ${this.renderComments(post.comments)}
                <div class="comment-input">
                    <input type="text" id="comment-${post.id}" placeholder="Write a comment...">
                    <button onclick="tinybook.addComment('${post.id}')">Post</button>
                </div>
            </div>
        `;

        return postDiv;
    }

    // Like System
    likePost(postId) {
        if (!this.currentUser) {
            this.showError('Please login to like posts');
            return;
        }

        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const userIndex = post.likes.indexOf(this.currentUser.id);
        
        if (userIndex > -1) {
            post.likes.splice(userIndex, 1);
        } else {
            post.likes.push(this.currentUser.id);
        }

        this.saveToStorage('tinybook_posts', this.posts);
        this.displayPosts();
    }

    // Comment System
    focusComment(postId) {
        const commentInput = document.getElementById(`comment-${postId}`);
        if (commentInput) {
            commentInput.focus();
        }
    }

    addComment(postId) {
        if (!this.currentUser) {
            this.showError('Please login to comment');
            return;
        }

        const commentInput = document.getElementById(`comment-${postId}`);
        const content = commentInput.value.trim();

        if (!content) {
            this.showError('Please write a comment');
            return;
        }

        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const newComment = {
            id: this.generateId(),
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            content: content,
            timestamp: new Date()
        };

        post.comments.push(newComment);
        this.saveToStorage('tinybook_posts', this.posts);
        
        commentInput.value = '';
        this.displayPosts();
        this.showSuccess('Comment added!');
    }

    renderComments(comments) {
        return comments.map(comment => `
            <div class="comment">
                <strong>${comment.userName}</strong>
                <span>${comment.content}</span>
                <div class="comment-time">${this.formatTime(comment.timestamp)}</div>
            </div>
        `).join('');
    }

    // Share System
    sharePost(postId) {
        if (!this.currentUser) {
            this.showError('Please login to share posts');
            return;
        }

        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        post.shares += 1;
        this.saveToStorage('tinybook_posts', this.posts);
        
        this.displayPosts();
        this.showSuccess('Post shared!');
    }

    // UI Updates
    updateUI() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.name;
            document.getElementById('profileName').textContent = this.currentUser.name;
        }
    }

    // Utility Functions
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatTime(date) {
        const now = new Date();
        const postDate = new Date(date);
        const diff = now - postDate;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return postDate.toLocaleDateString();
    }

    showError(message) {
        alert(`Error: ${message}`);
    }

    showSuccess(message) {
        // In a real app, you'd use a toast notification
        console.log(`Success: ${message}`);
    }

    // Storage Functions
    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    loadFromStorage(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
}

// Initialize TinyBook
const tinybook = new TinyBook();

// Global functions for HTML onclick
function login() { tinybook.login(); }
function signup() { tinybook.signup(); }
function logout() { tinybook.logout(); }
function showLogin() { tinybook.showLogin(); }
function showSignup() { tinybook.showSignup(); }
function createPost() { tinybook.createPost(); }
function likePost(postId) { tinybook.likePost(postId); }
function addComment(postId) { tinybook.addComment(postId); }
function focusComment(postId) { tinybook.focusComment(postId); }
function sharePost(postId) { tinybook.sharePost(postId); }    }
    
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
