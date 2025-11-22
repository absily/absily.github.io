document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    const messageDiv = document.getElementById('message');
    const captchaCanvas = document.getElementById('captchaCanvas');
    const refreshBtn = document.getElementById('refreshCaptcha');
    const captchaInput = document.getElementById('captchaInput');

    // ---------------------------------------------------------
    // IMPORTANT: PASTE YOUR GOOGLE SCRIPT WEB APP URL BELOW
    // ---------------------------------------------------------
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyfzkcEMur4GsdfnLYwWXfaec143sTseusyqhnKjhRWGdkBoIOLphZ50Vso7hwjGA2Q/exec';
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate Captcha
        if (captchaInput.value.toUpperCase() !== captchaText) {
            messageDiv.textContent = 'رمز التحقق غير صحيح';
            messageDiv.classList.remove('hidden');
            messageDiv.className = 'message error';
            return;
        }

        if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
            messageDiv.textContent = 'خطأ: لم يتم إعداد رابط Google Script بعد.';
            messageDiv.classList.remove('hidden');
            messageDiv.className = 'message error';
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = 'جاري الإرسال...';
        messageDiv.classList.add('hidden');

        // Create FormData for Google Sheets
        // We use URLSearchParams to send as x-www-form-urlencoded or just append to URL
        // Google Apps Script doPost(e) handles parameters well.
        const formData = new FormData();
        formData.append('name', form.name.value);
        formData.append('email', form.email.value);
        formData.append('disability_type', form.disability_type.value);

        try {
            // Using no-cors mode because Google Scripts redirects and CORS can be tricky.
            // However, with no-cors we can't read the response JSON.
            // Standard practice for simple forms is to assume success if no network error,
            // or use a hidden iframe, or use a proxy. 
            // For this simple task, we will try standard fetch. If CORS fails, we might need a workaround.
            // Actually, Google Apps Script Web Apps *do* support CORS if you return the right headers,
            // but the redirect (302) often causes issues in fetch.
            // The most reliable way for simple static sites is often sending data and assuming success,
            // or using ContentService.createTextOutput with JSONP (older way).
            // Let's try standard fetch with redirect: 'follow'.

            const url = new URL(GOOGLE_SCRIPT_URL);
            url.searchParams.append('name', form.name.value);
            url.searchParams.append('email', form.email.value);
            url.searchParams.append('disability_type', form.disability_type.value);

            // Prepare data for Body as well (Double assurance)
            const formData = new URLSearchParams();
            formData.append('name', form.name.value);
            formData.append('email', form.email.value);
            formData.append('disability_type', form.disability_type.value);

            await fetch(url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });

            // Since we use no-cors, we can't check response.ok. We assume it went through.
            messageDiv.textContent = 'تم إرسال البيانات بنجاح';
            messageDiv.classList.remove('hidden');
            messageDiv.className = 'message success';
            form.reset();
            generateCaptcha();

        } catch (error) {
            console.error(error);
            messageDiv.textContent = 'حدث خطأ أثناء الاتصال بالخادم';
            messageDiv.classList.remove('hidden');
            messageDiv.className = 'message error';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    });
});
