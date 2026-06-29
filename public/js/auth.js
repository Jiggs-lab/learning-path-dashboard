document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    console.log("🔒 Authentication handler initialized successfully.");

    // Modern Sign-Up Event Handler Interface
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop native browser window reloads
            
            const name = document.getElementById('userName').value.trim();
            const email = document.getElementById('userEmail').value.trim();
            const password = document.getElementById('userPassword').value;

            console.log("🚀 Attempting account registration for:", email);

            try {
                // FIXED: Changed to absolute URL pointing explicitly to your Node server on port 3000
                const response = await fetch('http://localhost:3000/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();
                console.log("📥 Server response payload received:", data);

                if (data.success) {
                    alert('Account successfully created! Redirecting to login screen...');
                    window.location.href = '/login.html'; // Dynamic target forward
                } else {
                    alert(data.message || 'Registration rejected by backend system.');
                }
            } catch (err) {
                console.error("🔴 Registration Pipeline Failure:", err);
                alert("Could not connect to the authentication server. Verify that your server terminal is active and listening on port 3000.");
            }
        });
    }

    // Modern Log-In Event Handler Interface
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Stop native browser window reloads
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            console.log("🔑 Attempting workspace login validation for:", email);

            try {
                // FIXED: Changed to absolute URL pointing explicitly to your Node server on port 3000
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                console.log("📥 Server response payload received:", data);

                if (data.success) {
                    // Lock down the secure user token identity to keep dashboard operations safe
                    localStorage.setItem('loggedInUser', data.userName);
                    window.location.href = '/dashboard.html'; // Forward to protective dashboard layout view
                } else {
                    alert(data.message || 'Invalid email credentials or mismatched password.');
                }
            } catch (err) {
                console.error("🔴 Authentication Login Pipeline Failure:", err);
                alert("Could not connect to the authentication server. Verify that your server terminal is active and listening on port 3000.");
            }
        });
    }
});