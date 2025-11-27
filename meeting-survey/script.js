const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzCZ5WcRbRmA21efs3cu1hhaHtCG1OvlTYit_DQ09EimJkWEo8Fy5n3TBgTSTYMcUA-gg/exec';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');
    const citySelect = document.getElementById('city');
    const otherCityInput = document.getElementById('otherCity');
    const captchaCode = document.getElementById('captchaCode');
    const captchaInput = document.getElementById('captchaInput');

    // Captcha State
    let captchaResult = '';

    // Initialize Captcha
    generateCaptcha();

    // Handle "Other" City Toggle
    citySelect.addEventListener('change', () => {
        if (citySelect.value === 'أخرى') {
            otherCityInput.classList.remove('hidden');
            otherCityInput.required = true;
        } else {
            otherCityInput.classList.add('hidden');
            otherCityInput.required = false;
            otherCityInput.value = '';
        }
    });

    // Check if already submitted
    if (localStorage.getItem('surveySubmitted')) {
        showSuccess();
    }

    form.addEventListener('submit', e => {
        e.preventDefault();

        // Validate Captcha
        if (captchaInput.value.toUpperCase() !== captchaResult) {
            alert('رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.');
            generateCaptcha();
            captchaInput.value = '';
            return;
        }

        if (localStorage.getItem('surveySubmitted')) {
            alert('لقد قمت بالتسجيل مسبقاً.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>جاري الإرسال...</span><i class="fa-solid fa-spinner fa-spin"></i>';

        // Fetch IP first
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                const userIp = data.ip;
                submitForm(userIp);
            })
            .catch(error => {
                console.error('Error fetching IP:', error);
                // Proceed even if IP fetch fails (optional: or block)
                submitForm('Unknown');
            });
    });

    function submitForm(ipAddress) {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => data[key] = value);

        // Handle "Other" City
        if (data.city === 'أخرى') {
            data.city = data.otherCity;
        }
        delete data.otherCity; // Clean up

        // Add metadata
        data.timestamp = new Date().toLocaleString('ar-LY');
        data.ip_address = ipAddress;

        if (SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
            // Simulation mode
            console.log('Form Data:', data);
            setTimeout(() => {
                completeSubmission();
            }, 1500);
        } else {
            fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
                body: JSON.stringify(data)
            })
                .then(() => {
                    // With no-cors, we get an opaque response and cannot read the result.
                    // We assume success if the request completes.
                    completeSubmission();
                })
                .catch(error => {
                    console.error('Error!', error.message);
                    alert('حدث خطأ أثناء الإرسال: ' + error.message);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<span>إرسال الاستبيان</span><i class="fa-solid fa-paper-plane"></i>';
                });
        }
    }

    function generateCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like I, 1, O, 0
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        captchaResult = result;
        captchaCode.textContent = result;
    }

    function completeSubmission() {
        localStorage.setItem('surveySubmitted', 'true');
        showSuccess();
    }

    function showSuccess() {
        form.classList.add('hidden');
        successMessage.classList.remove('hidden');
    }

    // Reset button for testing/demo purposes
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            localStorage.removeItem('surveySubmitted');
            location.reload();
        });
    }
});
