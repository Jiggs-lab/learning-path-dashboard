document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    // Handle Registration Submission Event Logic Loop
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('userName').value.trim();
            const email = document.getElementById('userEmail').value.trim();
            const password = document.getElementById('userPassword').value;

            // Simple basic local authentication state placeholder mock
            alert(`Account created successfully for ${name}! Redirection initialized...`);
            
            // Redirect smoothly into index portal view window
            window.location.href = 'index.html';
        });
    }

    // Handle Login Submission Event Logic Loop
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            // Simple validation simulation
            if(email && password) {
                window.location.href = 'index.html';
            }
        });
    }
});