document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    const messageDiv = document.getElementById('message');
    const captchaCanvas = document.getElementById('captchaCanvas');
    const refreshBtn = document.getElementById('refreshCaptcha');
    const captchaInput = document.getElementById('captchaInput');

    // ---------------------------------------------------------
    // IMPORTANT: PASTE YOUR GOOGLE SCRIPT WEB APP URL BELOW
    // ---------------------------------------------------------
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYyj_-GKMHOhgHCHKu4HQ6XKrEzLQHVSxZhwHhLT_38KAby4KXqejiw4HCHxMVZQv1_Q/exec';
    // Example: 'https://script.google.com/macros/s/AKfycbx.../exec'
    // ---------------------------------------------------------

    let captchaText = '';

    // Generate Random Captcha
    function generateCaptcha() {
        const ctx = captchaCanvas.getContext('2d');
        ctx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);

        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        captchaText = result;

        // Draw background
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, captchaCanvas.width, captchaCanvas.height);

        // Draw text
        ctx.font = '30px Tajawal, sans-serif';
        ctx.fillStyle = '#2563eb';
        ctx.textBaseline = 'middle';

        // Add some noise/lines
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height);
            ctx.lineTo(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height);
            ctx.strokeStyle = '#cbd5e1';
            ctx.stroke();
        }

        // Draw characters with slight rotation/offset
        let x = 20;
        for (let i = 0; i < result.length; i++) {
            ctx.save();
            ctx.translate(x, 25);
            ctx.rotate((Math.random() - 0.5) * 0.4);
            ctx.fillText(result[i], 0, 0);
            ctx.restore();
            x += 25;
        }
    }

    generateCaptcha();
    refreshBtn.addEventListener('click', generateCaptcha);

    let submitted = false;

    form.addEventListener('submit', (e) => {
        // Validate Captcha
        if (captchaInput.value.toUpperCase() !== captchaText) {
            e.preventDefault(); // Stop submission if captcha is wrong
            messageDiv.textContent = 'رمز التحقق غير صحيح';
            messageDiv.classList.remove('hidden');
            messageDiv.className = 'message error';
            return;
        }

        // If Captcha is correct, we let the form submit naturally to the iframe.
        // We just update the UI to show "Sending..."

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = 'جاري الإرسال...';
        messageDiv.classList.add('hidden');
        submitted = true;
    });

    // Listen for the iframe to load (which means response came back)
    const iframe = document.getElementById('hidden_iframe');
    iframe.addEventListener('load', () => {
        if (submitted) {
            const submitBtn = form.querySelector('button[type="submit"]');

            // Show success message
            messageDiv.textContent = 'تم إرسال البيانات بنجاح';
            messageDiv.classList.remove('hidden');
            messageDiv.className = 'message success';

            // Reset form
            form.reset();
            generateCaptcha();

            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerText = 'إرسال البيانات';
            submitted = false;
        }
    });

    // Update Time Display
    function updateTime() {
        const timeDisplay = document.getElementById('current-time');
        if (timeDisplay) {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            };
            timeDisplay.textContent = now.toLocaleDateString('ar-LY', options);
        }
    }

    setInterval(updateTime, 1000);
    updateTime(); // Initial call

    // Disclaimer Dismiss Logic
    const closeDisclaimerBtn = document.getElementById('closeDisclaimer');
    const disclaimerBanner = document.getElementById('disclaimerBanner');

    if (closeDisclaimerBtn && disclaimerBanner) {
        closeDisclaimerBtn.addEventListener('click', () => {
            disclaimerBanner.style.opacity = '0';
            setTimeout(() => {
                disclaimerBanner.style.display = 'none';
            }, 300); // Wait for transition if any, or just remove
        });
    }
});
