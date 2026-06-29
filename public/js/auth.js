document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    // Live Sign Up Handler
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('userName').value.trim();
            const email = document.getElementById('userEmail').value.trim();
            const password = document.getElementById('userPassword').value;

            try {
                const response = await fetch('http://localhost:3000/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (data.success) {
                    alert('Account successfully created and stored! Shifting to Login page...');
                    window.location.href = 'login.html';
                } else {
                    alert(data.message); // Displays error if user already exists
                }
            } catch (error) {
                console.error("Auth System Error:", error);
                alert("Could not connect to the authentication server.");
            }
        });
    }

    // Live Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (data.success) {
                    // Storing the logged-in user's name in session memory
                    localStorage.setItem('loggedInUser', data.userName);
                    window.location.href = 'index.html';
                } else {
                    alert(data.message); // Displays invalid password warnings
                }
            } catch (error) {
                console.error("Auth System Error:", error);
                alert("Could not connect to the authentication server.");
            }
        });
    }
});