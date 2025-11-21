document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    const messageDiv = document.getElementById('message');
    const captchaSvgDiv = document.getElementById('captchaSvg');
    const captchaTokenInput = document.getElementById('captchaToken');
    const refreshBtn = document.getElementById('refreshCaptcha');

    // Load Captcha
    function loadCaptcha() {
        fetch('/captcha')
            .then(response => response.json())
            .then(data => {
                captchaSvgDiv.innerHTML = data.svg;
                captchaTokenInput.value = data.token;
            })
            .catch(err => console.error('Error loading captcha:', err));
    }

    loadCaptcha();

    refreshBtn.addEventListener('click', loadCaptcha);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = 'جاري الإرسال...';
        messageDiv.classList.add('hidden');
        messageDiv.className = 'message hidden';

        const formData = {
            name: form.name.value,
            email: form.email.value,
            disability_type: form.disability_type.value,
            captcha: form.captcha.value,
            token: form.token.value
        };

        try {
            const response = await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                messageDiv.textContent = result.message;
                messageDiv.classList.remove('hidden');
                messageDiv.classList.add('success');
                form.reset();
                loadCaptcha(); // Reload captcha after success
            } else {
                messageDiv.textContent = result.message;
                messageDiv.classList.remove('hidden');
                messageDiv.classList.add('error');
                // Optionally reload captcha on error too if it was a captcha error
                if (result.message.includes('رمز التحقق')) {
                    loadCaptcha();
                }
            }
        } catch (error) {
            messageDiv.textContent = 'حدث خطأ أثناء الاتصال بالخادم';
            messageDiv.classList.remove('hidden');
            messageDiv.classList.add('error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }
    });
});
