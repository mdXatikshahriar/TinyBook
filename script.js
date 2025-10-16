// Firebase Configuration - YOUR CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyBgk...",
  authDomain: "tinybook-1ac50.firebaseapp.com",
  projectId: "tinybook-1ac50",
  storageBucket: "tinybook-1ac50.appspot.com",
  messagingSenderId: "588288211737",
  appId: "1:588288211737:web:abc123..."
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Array to store our posts
let posts = [];

// Authentication Functions
function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            showAppScreen();
        })
        .catch((error) => {
            alert('Login failed: ' + error.message);
        });
}

function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    auth.createUserWithEmailAndPassword(email, password)
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
