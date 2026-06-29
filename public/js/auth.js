document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    console.log("🔒 Auth script initialized.");
    console.log("Signup Form Found:", !!signupForm, "| Login Form Found:", !!loginForm);

    // Live Sign Up Handler
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Halt native browser page reloads
            
            const nameEl = document.getElementById('userName');
            const emailEl = document.getElementById('userEmail');
            const passwordEl = document.getElementById('userPassword');

            // Quick sanity check to ensure the HTML elements exist
            if (!nameEl || !emailEl || !passwordEl) {
                console.error("❌ HTML ID Mismatch: One or more signup input IDs are missing from your signup.html markup.");
                alert("Frontend form configuration error. Check browser console.");
                return;
            }

            const name = nameEl.value.trim();
            const email = emailEl.value.trim();
            const password = passwordEl.value;

            console.log("Sending signup payload request details:", { name, email, password: "••••" });

            try {
                const response = await fetch('http://localhost:3000/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                console.log("Server HTTP status received:", response.status);
                const data = await response.json();

                if (data.success) {
                    alert('Account successfully created and stored! Shifting to Login page...');
                    window.location.href = 'login.html';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error("🔴 Network/Server Pipeline Breakdown Error:", error);
                alert("Could not connect to the authentication server. Verify terminal is running on port 3000.");
            }
        });
    }

    // Live Login Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Halt native browser page reloads
            
            const emailEl = document.getElementById('loginEmail');
            const passwordEl = document.getElementById('loginPassword');

            // Quick sanity check to ensure the HTML elements exist
            if (!emailEl || !passwordEl) {
                console.error("❌ HTML ID Mismatch: One or more login input IDs are missing from your login.html markup.");
                alert("Frontend form configuration error. Check browser console.");
                return;
            }

            const email = emailEl.value.trim();
            const password = passwordEl.value;

            console.log("Sending login payload request details:", { email });

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                console.log("Server HTTP status received:", response.status);
                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('loggedInUser', data.userName);
                    window.location.href = 'index.html';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error("🔴 Network/Server Pipeline Breakdown Error:", error);
                alert("Could not connect to the authentication server. Verify terminal is running on port 3000.");
            }
        });
    }
});