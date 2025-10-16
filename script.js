// Array to store our posts (in a real app, this would be a database)
let posts = [];

// Function to create a new post
function createPost() {
    const postContent = document.getElementById('postContent').value;
    
    if (postContent.trim() === '') {
        alert('Please write something first!');
        return;
    }

    // Create post object
    const newPost = {
        content: postContent,
        timestamp: new Date().toLocaleString(),
        id: Date.now() // Simple unique ID
    };

    // Add to our posts array
    posts.unshift(newPost); // Add to beginning so newest shows first

    // Clear the textarea
    document.getElementById('postContent').value = '';

    // Update the wall display
    displayPosts();
}

// Function to display all posts
function displayPosts() {
    const wall = document.getElementById('wall');
    
    // Clear current display
    wall.innerHTML = '';

    // Add each post to the wall
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <p>${post.content}</p>
            <div class="timestamp">Posted on ${post.timestamp}</div>
        `;
        wall.appendChild(postElement);
    });
}

// Load any existing posts when page loads (none for now)
displayPosts();
