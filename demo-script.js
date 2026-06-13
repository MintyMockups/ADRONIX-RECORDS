// script.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('demo-submission-form');
    const statusDiv = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (!form) return;

    // REPLACE THIS with your actual Cloudflare Worker domain URL
    const CLOUDFLARE_WORKER_URL = 'https://adronix-records-bot.yourname.workers.dev/api/submit-demo';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Retrieve all form values matching your HTML IDs
        const artistName = document.getElementById('artist-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const discordId = document.getElementById('discord-id').value.trim();
        const demoLink = document.getElementById('demo-link').value.trim();
        const genre = document.getElementById('genre').value.trim();
        const message = document.getElementById('message').value.trim();

        // 2. Validate Discord ID format
        const isNumericId = /^\d{17,19}$/.test(discordId);
        if (!isNumericId) {
            statusDiv.textContent = 'Invalid Discord ID format. It must be a 17-19 digit number.';
            statusDiv.style.display = 'block';
            statusDiv.className = 'form-status error';
            return;
        }

        // 3. Update button loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Demo...';
        statusDiv.style.display = 'none';

        try {
            // 4. Post JSON directly to the Cloudflare Worker submit endpoint
            const response = await fetch(CLOUDFLARE_WORKER_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    artistName,
                    email,
                    discordId,
                    demoLink,
                    genre,
                    message
                })
            });

            if (response.ok) {
                form.reset();
                statusDiv.textContent = 'Success! Your private review channel has been automatically created on our server.';
                statusDiv.style.display = 'block';
                statusDiv.className = 'form-status success';
            } else {
                const err = await response.json();
                throw new Error(err.error || 'Server error occurred during submission.');
            }
        } catch (error) {
            console.error(error);
            statusDiv.textContent = 'An error occurred. Please check your Discord ID or try again later.';
            statusDiv.style.display = 'block';
            statusDiv.className = 'form-status error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Demo';
        }
    });
});
