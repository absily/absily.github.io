(function () {
    'use strict';

    const header = document.getElementById('header');
    const backBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', function () {
        header.classList.toggle('scrolled', window.pageYOffset > 80);
        if (backBtn) backBtn.classList.toggle('visible', window.pageYOffset > 400);
    }, { passive: true });

    if (backBtn) {
        backBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Accessibility toolbar variables
    var accToggle = document.getElementById('accToggle');
    var accPanel = document.getElementById('accPanel');
    var fontSize = 100;

    // Search variables
    var searchToggle = document.getElementById('searchToggle');
    var searchOverlay = document.getElementById('searchOverlay');
    var searchInput = document.getElementById('searchInput');
    var searchClose = document.getElementById('searchClose');
    var searchableElements = []; // To store references to searchable elements
    var isSearchActive = false;

    // Function to index searchable content on page load and language change
    function indexContent() {
        searchableElements = []; // Clear previous index
        document.querySelectorAll('[data-searchable="true"]').forEach(function(el) {
            // Store the element itself and its parent container for showing/hiding
            var parentContainer = el.closest('.course-card, .initiative-card, .timeline-item, .about-text, .about-info, blockquote, .blog-card, .contact-item, .footer-links a, .footer-bottom p, .hero-title-sub, .hero-subtitle, .hero-quote-card, .hero-milestone, .section-header, .blog-loading, .acc-group, .acc-header');
            if (!parentContainer) {
                // If no specific parent, use the element itself for showing/hiding
                parentContainer = el;
            }
            searchableElements.push({
                element: el,
                originalHTML: el.innerHTML,
                originalTextContent: el.textContent, // Store original text to reset highlights
                parentContainer: parentContainer
            });
        });
    }

    // Function to perform search and highlight results
    function performSearch(query) {
        isSearchActive = true;

        searchableElements.forEach(function(item) {
            var element = item.element;
            var parentContainer = item.parentContainer;
            var textContent = element.textContent;
            var originalHTML = item.originalHTML; // Use originalHTML for highlighting

            // Clear previous highlights and show element before processing
            element.innerHTML = originalHTML;
            if (parentContainer.classList.contains('hidden-search-result')) {
                parentContainer.classList.remove('hidden-search-result');
            }

            if (!query || query.trim() === '') {
                // If query is empty, just show all elements and clear highlights
                isSearchActive = false;
                return; // Continue to next item without hiding
            }

            var regex = new RegExp(query.trim(), 'gi');
            if (regex.test(textContent)) {
                // Match found: highlight and ensure element is visible
                var highlightedHTML = originalHTML.replace(regex, function(match) {
                    return '<span class="highlight">' + match + '</span>';
                });
                element.innerHTML = highlightedHTML;
                parentContainer.classList.remove('hidden-search-result');
            } else {
                // No match: hide the element's parent container
                parentContainer.classList.add('hidden-search-result');
            }
        });
    }

    // Function to reset search and show all content
    function resetSearch() {
        if (searchInput) searchInput.value = '';
        isSearchActive = false;
        searchableElements.forEach(function(item) {
            item.element.innerHTML = item.originalHTML; // Restore original HTML
            if (item.parentContainer.classList.contains('hidden-search-result')) {
                item.parentContainer.classList.remove('hidden-search-result');
            }
        });
    }

    // Language switch with translations
    function applyLanguage(lang) {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (translations[key] && translations[key][lang]) {
                if (el.tagName === 'TITLE') {
                    el.textContent = translations[key][lang];
                } else {
                    el.innerHTML = translations[key][lang];
                }
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-placeholder');
            if (translations[key] && translations[key][lang]) {
                el.setAttribute('placeholder', translations[key][lang]);
            }
        });
        document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-alt');
            if (translations[key] && translations[key][lang]) {
                el.setAttribute('alt', translations[key][lang]);
            }
        });
        document.querySelectorAll('[data-i18n-meta]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-meta');
            if (translations[key] && translations[key][lang]) {
                el.setAttribute('content', translations[key][lang]);
            }
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-aria');
            if (translations[key] && translations[key][lang]) {
                el.setAttribute('aria-label', translations[key][lang]);
            }
        });
        document.querySelectorAll('.mosaic-overlay span').forEach(function (el) {
            var txt = el.getAttribute('data-label');
            if (!txt) return;
            var key = '_gallery.' + txt;
            if (translations[key] && translations[key][lang]) {
                el.textContent = translations[key][lang];
            }
        });
        document.querySelectorAll('.mosaic-img').forEach(function (el) {
            var txt = el.getAttribute('data-label');
            if (!txt) return;
            var key = '_gallery.' + txt;
            if (translations[key] && translations[key][lang]) {
                el.setAttribute('alt', translations[key][lang]);
            }
        });

        // After applying language, re-index content and re-run search if active
        indexContent();
        if (isSearchActive && searchInput && searchInput.value.trim() !== '') {
            performSearch(searchInput.value);
        }
        
        // Also update accessibility button text
        updateLightModeBtn();
    }

    // Language switch helper button function
    function updateLightModeBtn() {
        var btn = document.querySelector('.acc-btn[data-action="lightmode"]');
        if (!btn) return;
        var lang = document.documentElement.lang || 'ar';
        var isLight = document.body.classList.contains('light-mode');
        var key = isLight ? 'acc.dark' : 'acc.light';
        if (translations[key] && translations[key][lang]) {
            btn.innerHTML = translations[key][lang];
        }
    }

    // Language switcher click handlers
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.lang-btn').forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            applyLanguage(this.dataset.lang);
        });
    });

    // Search event listeners
    if (searchToggle) {
        searchToggle.addEventListener('click', function() {
            if (searchOverlay) {
                searchOverlay.classList.toggle('open');
                if (searchOverlay.classList.contains('open') && searchInput) {
                    searchInput.focus();
                    resetSearch(); // Clear previous search when opening
                }
            }
        });
    }

    if (searchClose) {
        searchClose.addEventListener('click', function() {
            if (searchOverlay) searchOverlay.classList.remove('open');
            resetSearch();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            performSearch(this.value);
        });
    }

    document.addEventListener('keydown', function(e) {
        if (searchOverlay && searchOverlay.classList.contains('open') && e.key === 'Escape') {
            searchOverlay.classList.remove('open');
            resetSearch();
        }
    });

    // Accessibility toolbar event listeners
    if (accToggle) {
        accToggle.addEventListener('click', function () {
            this.classList.toggle('active');
            accPanel.classList.toggle('open');
        });

        document.addEventListener('click', function (e) {
            if (!e.target.closest('#accWrapper')) {
                accPanel.classList.remove('open');
                accToggle.classList.remove('active');
            }
        });

        document.querySelectorAll('.acc-btn[data-action]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var action = this.dataset.action;
                var body = document.body;

                switch (action) {
                    case 'font-plus':
                        fontSize = Math.min(fontSize + 10, 150);
                        body.style.fontSize = fontSize + '%';
                        body.classList.add('acc-large-text');
                        break;
                    case 'font-minus':
                        fontSize = Math.max(fontSize - 10, 80);
                        if (fontSize <= 100) {
                            body.style.fontSize = '';
                            body.classList.remove('acc-large-text');
                        } else {
                            body.style.fontSize = fontSize + '%';
                        }
                        break;
                    case 'contrast':
                        body.classList.toggle('acc-contrast');
                        this.classList.toggle('active');
                        break;
                    case 'grayscale':
                        body.classList.toggle('acc-grayscale');
                        this.classList.toggle('active');
                        break;
                    case 'lightmode':
                        body.classList.toggle('light-mode');
                        this.classList.toggle('active');
                        localStorage.setItem('lightMode', body.classList.contains('light-mode') ? '1' : '0');
                        updateLightModeBtn(); // Update button text after toggle
                        break;
                    case 'reset':
                        body.classList.remove('acc-contrast', 'acc-grayscale', 'acc-large-text', 'light-mode');
                        body.style.fontSize = '';
                        fontSize = 100;
                        document.querySelectorAll('.acc-btn.active').forEach(function (b) { b.classList.remove('active'); });
                        localStorage.removeItem('lightMode');
                        updateLightModeBtn(); // Update button text after reset
                        break;
                }
            });
        });
    }

    // Mobile nav
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            this.classList.toggle('active');
            navMenu.classList.toggle('open');
        });
    }

    document.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
            if (navToggle) navToggle.classList.remove('active');
            if (navMenu) navMenu.classList.remove('open');
        });
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Scroll reveal
    function isInView(el) {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight - 80 && rect.bottom > 0;
    }

    function handleReveal() {
        document.querySelectorAll('[data-aos]').forEach(function (el) {
            if (isInView(el)) el.classList.add('aos-animate');
        });
    }

    window.addEventListener('scroll', handleReveal, { passive: true });
    window.addEventListener('load', handleReveal);

    // Contact form with Formspree
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = this.querySelector('.btn');
            const original = btn.textContent;
            btn.textContent = 'جاري الإرسال...';
            btn.disabled = true;
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            fetch(this.action, {
                method: 'POST',
                body: new FormData(this),
                headers: { 'Accept': 'application/json' }
            }).then(function (res) {
                if (res.ok) {
                    formStatus.textContent = '✅ تم إرسال رسالتك! سأرد عليك قريباً.';
                    formStatus.className = 'form-status form-status-success';
                    contactForm.reset();
                } else {
                    res.json().then(function (data) {
                        if (data && data.errors) {
                            formStatus.textContent = '❌ ' + data.errors.map(function (e) { return e.message; }).join(', ');
                        } else {
                            formStatus.textContent = '❌ حدث خطأ. حاول مرة أخرى.';
                        }
                        formStatus.className = 'form-status form-status-error';
                    });
                }
            }).catch(function () {
                formStatus.textContent = '❌ فشل الاتصال. تحقق من اتصالك بالإنترنت.';
                formStatus.className = 'form-status form-status-error';
            }).finally(function () {
                btn.textContent = original;
                btn.disabled = false;
            });
        });
    }

    // Initial setup on page load
    indexContent();
    resetSearch();

    // Translations
    var translations = {
        'nav.about':     { ar: 'عنّي', en: 'About', sr: 'О мени', de: 'Über mich' },
        'nav.skills':    { ar: 'مهاراتي', en: 'Skills', sr: 'Вештине', de: 'Fähigkeiten' },
        'skills.tag':    { ar: 'مهاراتي وخبراتي المهنية', en: 'My Skills & Professional Expertise', sr: 'Моје вештине и професионална стручност', de: 'Meine Fähigkeiten & berufliche Expertise' },
        'skills.title':  { ar: 'البروفايل المهني <span class="gradient-text">& المهارات</span>', en: 'Professional Profile <span class="gradient-text">& Skills</span>', sr: 'Професионални профил <span class="gradient-text">и вештине</span>', de: 'Berufliches Profil <span class="gradient-text">& Fähigkeiten</span>' },
        'skills.desc':   { ar: 'نظرة عامة على مسيرتي التقنية، مهاراتي العملية، وإتقاني للغات منذ عام 2004', en: 'An overview of my technical journey, practical skills, and language proficiency since 2004', sr: 'Преглед мог техничког пута, практичних вештина и знања језика од 2004.', de: 'Ein Überblick über meine technische Reise, praktische Fähigkeiten und Sprachkenntnisse seit 2004' },
        'skills.profileTitle': { ar: 'من أنا؟', en: 'Who Am I?', sr: 'Ко сам ја?', de: 'Wer bin ich?' },
        'skills.p1':     { ar: 'أنا مطور ومصمم مواقع إلكترونية أمتلك خبرة طويلة في مجال تصميم وتطوير وإدارة المواقع الإلكترونية منذ عام 2004، حيث كانت بدايتي بإطلاق أول موقع إلكتروني لي تحت اسم "جنزور ماي هوم". خلال مسيرتي اكتسبت خبرة واسعة في تطوير المواقع باستخدام WordPress و Joomla، بالإضافة إلى إدارة المواقع وتحسين أدائها وتجربة المستخدم.', en: 'I am a web developer and designer with extensive experience in designing, developing, and managing websites since 2004, when I launched my first website "Janzour My Home". Throughout my career, I gained broad expertise in website development using WordPress and Joomla, in addition to site management, performance optimization, and user experience.', sr: 'Ја сам веб програмер и дизајнер са дугогодишњим искуством у дизајнирању, развоју и управљању веб-сајтовима од 2004, када сам покренуо свој први сајт "Џанзур Мој Дом". Током каријере стекао сам широку стручност у развоју сајтова користећи WordPress и Joomla, поред управљања сајтовима, оптимизације перформанси и корисничког искуства.', de: 'Ich bin Webentwickler und -designer mit umfangreicher Erfahrung im Design, der Entwicklung und Verwaltung von Websites seit 2004, als ich meine erste Website "Janzour My Home" startete. Im Laufe meiner Karriere habe ich breite Fachkenntnisse in der Website-Entwicklung mit WordPress und Joomla erworben, sowie in Site-Management, Leistungsoptimierung und Benutzererfahrung.' },
        'skills.p2':     { ar: 'أمتلك مهارات احترافية في تصميم المواقع الإلكترونية الحديثة وإنشاء واجهات عصرية ومتجاوبة مع جميع الأجهزة، إلى جانب خبرة في التصميم الجرافيكي وتصميم الهويات البصرية والإعلانات الرقمية.', en: 'I have professional skills in modern website design, creating modern, responsive interfaces for all devices, along with experience in graphic design, visual identity design, and digital advertising.', sr: 'Имам професионалне вештине у модерном веб дизајну, креирању модерних, responsive интерфејса за све уређаје, уз искуство у графичком дизајну, дизајну визуелног идентитета и дигиталном оглашавању.', de: 'Ich verfüge über professionelle Fähigkeiten im modernen Webdesign, der Erstellung moderner, responsiver Oberflächen für alle Geräte, sowie Erfahrung in Grafikdesign, visueller Identitätsgestaltung und digitaler Werbung.' },
        'skills.p3':     { ar: 'كما لدي خبرة جيدة في إدارة حسابات مواقع التواصل الاجتماعي، وإنشاء المحتوى الرقمي، وتنظيم الحملات التسويقية الإلكترونية، إضافة إلى خبرة في المونتاج وتحرير الفيديو والصوت والعمل على إنتاج محتوى احترافي.', en: 'I also have good experience in managing social media accounts, creating digital content, organizing digital marketing campaigns, in addition to experience in video and audio editing and producing professional content.', sr: 'Такође имам добро искуство у управљању налозима на друштвеним мрежама, креирању дигиталног садржаја, организовању дигиталних маркетиншких кампања, поред искуства у монтажи видеа и звука и продукцији професионалног садржаја.', de: 'Ich habe auch gute Erfahrung in der Verwaltung von Social-Media-Konten, der Erstellung digitaler Inhalte, der Organisation digitaler Marketingkampagnen sowie Erfahrung in der Video- und Audiobearbeitung und der Produktion professioneller Inhalte.' },
        'skills.p4':     { ar: 'وأستخدم تقنيات الذكاء الاصطناعي في برمجة وتصميم المواقع الإلكترونية وتطوير الحلول الرقمية الحديثة لتقديم خدمات متطورة تلبي احتياجات العملاء والشركات.', en: 'I use artificial intelligence technologies in programming and designing websites and developing modern digital solutions to provide advanced services that meet the needs of clients and businesses.', sr: 'Користим технологије вештачке интелигенције у програмирању и дизајнирању веб-сајтова и развоју модерних дигиталних решења за пружање напредних услуга које задовољавају потребе клијената и предузећа.', de: 'Ich nutze Technologien der künstlichen Intelligenz bei der Programmierung und Gestaltung von Websites und der Entwicklung moderner digitaler Lösungen, um fortschrittliche Dienstleistungen anzubieten, die die Bedürfnisse von Kunden und Unternehmen erfüllen.' },
        'skills.skillsTitle': { ar: 'المهارات والخبرات العملية', en: 'Skills & Practical Experience', sr: 'Вештине и практично искуство', de: 'Fähigkeiten & praktische Erfahrung' },
        'skills.s1':     { ar: 'تطوير وإدارة مواقع WordPress و Joomla', en: 'WordPress & Joomla Development and Management', sr: 'Развој и управљање WordPress и Joomla сајтовима', de: 'WordPress & Joomla Entwicklung und Verwaltung' },
        'skills.s2':     { ar: 'تصميم وتطوير المواقع الإلكترونية الحديثة', en: 'Modern Website Design and Development', sr: 'Модерни веб дизајн и развој', de: 'Modernes Webdesign und -entwicklung' },
        'skills.s3':     { ar: 'إدارة المواقع وتحسين الأداء وتجربة المستخدم', en: 'Site Management, Performance Optimization & UX', sr: 'Управљање сајтовима, оптимизација перформанси и UX', de: 'Site-Management, Leistungsoptimierung & UX' },
        'skills.s4':     { ar: 'إدارة حسابات مواقع التواصل الاجتماعي', en: 'Social Media Account Management', sr: 'Управљање налозима на друштвеним мрежама', de: 'Social-Media-Kontoverwaltung' },
        'skills.s5':     { ar: 'إنشاء المحتوى الرقمي والتسويق الإلكتروني', en: 'Digital Content Creation & E-Marketing', sr: 'Креирање дигиталног садржаја и е-маркетинг', de: 'Digitale Content-Erstellung & E-Marketing' },
        'skills.s6':     { ar: 'التصميم الجرافيكي والهويات البصرية', en: 'Graphic Design & Visual Identities', sr: 'Графички дизајн и визуелни идентитети', de: 'Grafikdesign & visuelle Identitäten' },
        'skills.s7':     { ar: 'المونتاج وتحرير الفيديو والصوت', en: 'Video and Audio Editing', sr: 'Монтажа видеа и звука', de: 'Video- und Audiobearbeitung' },
        'skills.s8':     { ar: 'استخدام تقنيات الذكاء الاصطناعي في البرمجة والتصميم', en: 'Using AI Technologies in Programming and Design', sr: 'Коришћење вештачке интелигенције у програмирању и дизајну', de: 'Nutzung von KI-Technologien in Programmierung und Design' },
        'skills.s9':     { ar: 'إدارة المشاريع والمحتوى الرقمي', en: 'Project Management & Digital Content', sr: 'Управљање пројектима и дигитални садржај', de: 'Projektmanagement & digitale Inhalte' },
        'skills.langsTitle': { ar: 'إتقان اللغات والتواصل', en: 'Language Proficiency & Communication', sr: 'Познавање језика и комуникација', de: 'Sprachkenntnisse & Kommunikation' },
        'skills.l1':     { ar: 'العربية: اللغة الأم', en: 'Arabic: Native Language', sr: 'Арапски: Матерњи језик', de: 'Arabisch: Muttersprache' },
        'skills.l2':     { ar: 'الألمانية: مستوى جيد في التحدث والتواصل', en: 'German: Good Level in Speaking and Communication', sr: 'Немачки: Добар ниво у говору и комуникацији', de: 'Deutsch: Gutes Niveau in Sprechen und Kommunikation' },
        'skills.l3':     { ar: 'الإنجليزية: مستوى جيد في التحدث والتواصل', en: 'English: Good Level in Speaking and Communication', sr: 'Енглески: Добар ниво у говору и комуникацији', de: 'Englisch: Gutes Niveau in Sprechen und Kommunikation' },
        'skills.l4':     { ar: 'الصربية: مستوى جيد في التحدث والتواصل', en: 'Serbian: Good Level in Speaking and Communication', sr: 'Српски: Добар ниво у говору и комуникацији', de: 'Serbisch: Gutes Niveau in Sprechen und Kommunikation' },
        'nav.journey':   { ar: 'رحلتي', en: 'My Journey', sr: 'Моје путовање', de: 'Mein Weg' },
        'nav.initiatives': { ar: 'مبادراتي', en: 'Initiatives', sr: 'Иницијативе', de: 'Initiativen' },
        'nav.courses':   { ar: 'الدورات', en: 'Courses', sr: 'Курсеви', de: 'Kurse' },
        'nav.gallery':   { ar: 'معرض الصور', en: 'Gallery', sr: 'Галерија', de: 'Galerie' },
        'nav.blog':      { ar: 'المدونة', en: 'Blog', sr: 'Блог', de: 'Blog' },
        'nav.contact':   { ar: 'تواصل', en: 'Contact', sr: 'Контакт', de: 'Kontakt' },
        'hero.badge':    { ar: '#أكون_أو_لا_أكون', en: '#ToBeOrNotToBe', sr: '#БитиИлиНеБити', de: '#SeinOderNichtSein' },
        'hero.subtitle': { ar: 'ناشط حقوق الإعاقة | مؤسس | مدون', en: 'Disability Rights Activist | Founder | Blogger', sr: 'Активиста за права особа са инвалидитетом | Оснивач | Блогер', de: 'Behindertenrechtsaktivist | Gründer | Blogger' },
        'hero.desc':     { ar: 'ناشط في مجال حقوق الأشخاص ذوي الإعاقة، مؤسس مبادرات رقمية وحقوقية. أؤمن بأن الإرادة تصنع المستحيل. شعاري: <strong>أكون أو لا أكون</strong>.', en: 'Disability rights activist, founder of digital and advocacy initiatives. I believe willpower makes the impossible possible. Motto: <strong>To be or not to be</strong>.', sr: 'Активиста за права особа са инвалидитетом, оснивач дигиталних и правних иницијатива. Верујем да воља чини немогуће могућим. Мото: <strong>Бити или не бити</strong>.', de: 'Behindertenrechtsaktivist, Gründer digitaler Initiativen. Ich glaube, dass Willenskraft das Unmögliche möglich macht. Motto: <strong>Sein oder nicht sein</strong>.' },
        'hero.motto':    { ar: 'أكون أو لا أكون', en: 'To be or not to be', sr: 'Бити или не бити', de: 'Sein oder nicht sein' },
        'hero.btnStory': { ar: 'اقرأ قصتي', en: 'Read My Story', sr: 'Прочитај моју причу', de: 'Meine Geschichte' },
        'hero.btnInit':  { ar: 'مبادراتي', en: 'My Initiatives', sr: 'Моје иницијативе', de: 'Meine Initiativen' },
        'hero.quote':    { ar: 'الإعاقة ليست عائقاً', en: 'Disability is not a barrier', sr: 'Инвалидитет није препрека', de: 'Behinderung ist kein Hindernis' },
        'hero.label1':   { ar: 'جنزور', en: 'Janzour', sr: 'Џанзур', de: 'Janzour' },
        'hero.label2':   { ar: 'أول موقع', en: 'First Site', sr: 'Први сајт', de: 'Erste Website' },
        'hero.label3':   { ar: 'عاماً', en: 'Years', sr: 'Година', de: 'Jahre' },
        'about.tag':     { ar: 'عنّي', en: 'About Me', sr: 'О мени', de: 'Über mich' },
        'about.title':   { ar: 'رحلة من <span class="gradient-text">التحدي إلى الأمل</span>', en: 'A Journey from <span class="gradient-text">Challenge to Hope</span>', sr: 'Путовање од <span class="gradient-text">Изазова до наде</span>', de: 'Eine Reise von <span class="gradient-text">Herausforderung zur Hoffnung</span>' },
        'about.desc':    { ar: 'من هنا بدأت قصتي...', en: 'This is where my story began...', sr: 'Овде је почела моја прича...', de: 'Hier begann meine Geschichte...' },
        'about.name':    { ar: 'ناشط حقوق الإعاقة | مؤسس | مدون', en: 'Disability Rights Activist | Founder | Blogger', sr: 'Активиста за права особа са инвалидитетом | Оснивач | Блогер', de: 'Behindertenrechtsaktivist | Gründer | Blogger' },
        'about.p1':      { ar: 'وُلدت في <strong>23 أكتوبر 1971</strong> في <strong>جنزور - المشاشطة</strong>. الأشهر الستة الأولى من حياتي كانت نقطة تحول، حيث تعرضت لحمى شديدة أدت لإصابتي بشلل الأطفال، مما فرض عليّ تحدياً صحياً مبكراً.', en: 'I was born on <strong>October 23, 1971</strong> in <strong>Janzour - Almashashta</strong>. The first six months of my life were a turning point, as I contracted a severe fever that led to polio, imposing an early health challenge.', sr: 'Рођен сам <strong>23. октобра 1971.</strong> у <strong>Џанзуру - Алмашашти</strong>. Првих шест месеци живота били су прекретница, када сам добио тешку грозницу која је довела до дечије парализе, намећући ми рани здравствени изазов.', de: 'Ich wurde am <strong>23. Oktober 1971</strong> in <strong>Janzour - Almashashta</strong> geboren. Die ersten sechs Monate meines Lebens waren ein Wendepunkt, da ich schweres Fieber bekam, das zu Kinderlähmung führte und mir eine frühe gesundheitliche Herausforderung auferlegte.' },
        'about.p2':      { ar: 'في عام <strong>1976</strong>، وبسن الخامسة، سافرت إلى <strong>بلغراد</strong> في رحلة علاجية استمرت ست سنوات، حيث درست الابتدائية هناك وأصبحت اللغة الصربية جزءاً من هويتي.', en: 'In <strong>1976</strong>, at age five, I traveled to <strong>Belgrade</strong> for a six-year medical treatment journey, where I attended primary school and Serbian became part of my identity.', sr: '<strong>1976.</strong> године, са пет година, отпутовао сам у <strong>Београд</strong> на шестогодишње лечење, где сам похађао основну школу и српски језик постао део мог идентитета.', de: '<strong>1976</strong> reiste ich im Alter von fünf Jahren nach <strong>Belgrad</strong> zu einer sechsjährigen medizinischen Behandlung, besuchte dort die Grundschule und Serbisch wurde Teil meiner Identität.' },
        'about.p3':      { ar: 'عدت إلى ليبيا عام <strong>1983</strong>، ثم إلى <strong>فيينا</strong> لفترة علاج قصيرة. عند استقراري في الوطن، واجهت واقعاً صعباً: غياب البنية التحتية والتعليم المدمج لذوي الإعاقة. لم أستسلم، بل صنعت مدرستي الخاصة من خلال البرامج الوثائقية والتعليمية مثل "افتح يا سمسم".', en: 'I returned to Libya in <strong>1983</strong>, then to <strong>Vienna</strong> for a short treatment. Back home, I faced a harsh reality: lack of infrastructure and inclusive education for people with disabilities. I didn\'t give up—I built my own school through documentaries and educational programs like "Sesame Street."', sr: 'Вратио сам се у Либију <strong>1983.</strong>, затим у <strong>Беч</strong> на кратко лечење. Код куће сам се суочио са тешком стварношћу: недостатком инфраструктуре и инклузивног образовања за особе са инвалидитетом. Нисам одустао—створио сам своју школу кроз документарне и образовне програме попут "Улице Сезам."', de: 'Ich kehrte <strong>1983</strong> nach Libyen zurück, dann nach <strong>Wien</strong> für eine kurze Behandlung. Zu Hause stand ich vor einer harten Realität: fehlende Infrastruktur und inklusive Bildung für Menschen mit Behinderungen. Ich gab nicht auf—ich baute meine eigene Schule durch Dokumentationen und Bildungsprogramme wie "Sesamstraße."' },
        'about.p4':      { ar: 'في <strong>2004</strong>، أطلقت أول موقع لي <strong>"جنزور ماي هوم"</strong>. ومن هناك انطلقت إلى عالم المنتديات ثم التواصل الاجتماعي. عملت مصمماً وناشطاً، وتركت بصمتي في اللجنة البارالمبية والأولمبياد الخاص الليبي.', en: 'In <strong>2004</strong>, I launched my first website <strong>"Janzour My Home"</strong>. From there I moved to forums and social media. I worked as a designer and activist, leaving my mark on the Libyan Paralympic Committee and Special Olympics Libya.', sr: '<strong>2004.</strong> покренуо сам свој први сајт <strong>"Џанзур Мој Дом"</strong>. Одатле сам прешао на форуме и друштвене мреже. Радио сам као дизајнер и активиста, остављајући траг у Либијском параолимпијском комитету и Специјалној олимпијади Либије.', de: '<strong>2004</strong> startete ich meine erste Website <strong>"Janzour My Home"</strong>. Von dort ging ich zu Foren und sozialen Medien. Ich arbeitete als Designer und Aktivist und hinterließ meine Spuren im Libyschen Paralympischen Komitee und den Special Olympics Libyen.' },
        'about.p5':      { ar: 'اليوم، من <strong>برمنغهام</strong>، أواصل رحلتي في الدفاع عن حقوق الإنسان والإعاقة، مؤمناً بأن <strong style="color: var(--primary-light);">الإرادة تصنع المستحيل</strong>.', en: 'Today, from <strong>Birmingham</strong>, I continue my journey defending human and disability rights, believing that <strong style="color: var(--primary-light);">willpower makes the impossible possible</strong>.', sr: 'Данас, из <strong>Бирмингема</strong>, настављам своје путовање у одбрани људских права и права особа са инвалидитетом, верујући да <strong style="color: var(--primary-light);">воља чини немогуће могућим</strong>.', de: 'Heute setze ich von <strong>Birmingham</strong> aus meine Reise fort, um Menschenrechte und Behindertenrechte zu verteidigen, im Glauben, dass <strong style="color: var(--primary-light);">Willenskraft das Unmögliche möglich macht</strong>.' },
        'info.name':     { ar: 'الاسم', en: 'Name', sr: 'Име', de: 'Name' },
        'info.birth':    { ar: 'تاريخ الميلاد', en: 'Date of Birth', sr: 'Датум рођења', de: 'Geburtsdatum' },
        'info.place':    { ar: 'مكان الولادة', en: 'Place of Birth', sr: 'Место рођења', de: 'Geburtsort' },
        'info.residence':{ ar: 'الإقامة', en: 'Residence', sr: 'Боравиште', de: 'Wohnsitz' },
        'info.langs':    { ar: 'لغات', en: 'Languages', sr: 'Језици', de: 'Sprachen' },
        'info.motto':    { ar: 'الشعار', en: 'Motto', sr: 'Мото', de: 'Motto' },
        'info.valName':  { ar: 'عبدالسلام شليبك', en: 'Abdusalam Shlebak', sr: 'Абдусалам Шлебак', de: 'Abdusalam Shlebak' },
        'info.valPlace': { ar: 'جنزور - المشاشطة، طرابلس', en: 'Janzour - Almashashta, Tripoli', sr: 'Џанзур - Алмашашта, Триполи', de: 'Janzour - Almashashta, Tripolis' },
        'info.valRes':   { ar: 'برمنغهام', en: 'Birmingham', sr: 'Бирмингем', de: 'Birmingham' },
        'info.valLangs': { ar: 'العربية، الصربية، الإنجليزية، الألمانية', en: 'Arabic, Serbian, English, German', sr: 'Арапски, Српски, Енглески, Немачки', de: 'Arabisch, Serbisch, Englisch, Deutsch' },
        'info.valMotto': { ar: 'أكون أو لا أكون', en: 'To be or not to be', sr: 'Бити или не бити', de: 'Sein oder nicht sein' },
        'info.valBirth': { ar: '23 أكتوبر 1971', en: 'October 23, 1971', sr: '23. октобар 1971.', de: '23. Oktober 1971' },
        'journey.tag':   { ar: 'رحلتي', en: 'My Journey', sr: 'Моје путовање', de: 'Mein Weg' },
        'journey.title': { ar: 'محطات من <span class="gradient-text">مسيرتي</span>', en: 'Milestones of <span class="gradient-text">My Journey</span>', sr: 'Прекретнице <span class="gradient-text">мог пута</span>', de: 'Meilensteine <span class="gradient-text">meines Weges</span>' },
        'journey.desc':  { ar: 'من التحدي إلى الأمل - رحلة حياة', en: 'From challenge to hope - a life journey', sr: 'Од изазова до наде - животно путовање', de: 'Von der Herausforderung zur Hoffnung - eine Lebensreise' },
        'journey.t1.date':    { ar: '23 أكتوبر 1971', en: 'October 23, 1971', sr: '23. октобар 1971.', de: '23. Oktober 1971' },
        'journey.t1.title':   { ar: 'الولادة', en: 'Birth', sr: 'Рођење', de: 'Geburt' },
        'journey.t1.company': { ar: 'جنزور - المشاشطة', en: 'Janzour - Almashashta', sr: 'Џанзур - Алмашашта', de: 'Janzour - Almashashta' },
        'journey.t1.desc':    { ar: 'وُلدت في جنزور. الأشهر الستة الأولى كانت نقطة تحول حيث تعرضت لحمى شديدة أدت لإصابتي بشلل الأطفال.', en: 'I was born in Janzour. The first six months were a turning point as I contracted a severe fever that led to polio.', sr: 'Рођен сам у Џанзуру. Првих шест месеци били су прекретница када сам добио тешку грозницу која је довела до дечије парализе.', de: 'Ich wurde in Janzour geboren. Die ersten sechs Monate waren ein Wendepunkt, als ich schweres Fieber bekam, das zu Kinderlähmung führte.' },
        'journey.t2.title':   { ar: 'العلاج والتعليم في بلغراد', en: 'Treatment and Education in Belgrade', sr: 'Лечење и образовање у Београду', de: 'Behandlung und Ausbildung in Belgrad' },
        'journey.t2.company': { ar: 'بلغراد', en: 'Belgrade', sr: 'Београд', de: 'Belgrad' },
        'journey.t2.desc':    { ar: 'سافرت إلى بلغراد في رحلة علاجية استمرت ست سنوات. درست الابتدائية هناك وأصبحت اللغة الصربية جزءاً من هويتي.', en: 'I traveled to Belgrade for a six-year medical treatment journey. I attended primary school there and Serbian became part of my identity.', sr: 'Отпутовао сам у Београд на шестогодишње лечење. Тамо сам похађао основну школу и српски језик је постао део мог идентитета.', de: 'Ich reiste nach Belgrad zu einer sechsjährigen medizinischen Behandlung. Ich besuchte dort die Grundschule und Serbisch wurde Teil meiner Identität.' },
        'journey.t3.title':   { ar: 'العودة إلى ليبيا والعلاج في فيينا', en: 'Return to Libya and Treatment in Vienna', sr: 'Повратак у Либију и лечење у Бечу', de: 'Rückkehr nach Libyen und Behandlung in Wien' },
        'journey.t3.company': { ar: 'ليبيا - فيينا', en: 'Libya - Vienna', sr: 'Либија - Беч', de: 'Libyen - Wien' },
        'journey.t3.desc':    { ar: 'عدت إلى ليبيا ثم سافرت إلى فيينا لفترة علاج قصيرة. عند الاستقرار في الوطن، واجهت غياب البنية التحتية لذوي الإعاقة.', en: 'I returned to Libya then traveled to Vienna for a short treatment. Settling back home, I faced the lack of infrastructure for people with disabilities.', sr: 'Вратио сам се у Либију, затим отпутовао у Беч на кратко лечење. По повратку кући, суочио сам се са недостатком инфраструктуре за особе са инвалидитетом.', de: 'Ich kehrte nach Libyen zurück und reiste dann für eine kurze Behandlung nach Wien. Zu Hause angekommen, stand ich vor dem Fehlen von Infrastruktur für Menschen mit Behinderungen.' },
        'journey.t4.date':    { ar: 'الثمانينيات والتسعينيات', en: '1980s & 1990s', sr: '1980-их и 1990-их', de: '1980er & 1990er' },
        'journey.t4.title':   { ar: 'التعليم الذاتي', en: 'Self-Education', sr: 'Самообразовање', de: 'Selbstbildung' },
        'journey.t4.company': { ar: 'ليبيا', en: 'Libya', sr: 'Либија', de: 'Libyen' },
        'journey.t4.desc':    { ar: 'صنعت مدرستي الخاصة من خلال البرامج الوثائقية والتعليمية مثل "افتح يا سمسم"، لم أستسلم لغياب التعليم المدمج.', en: 'I built my own school through documentaries and educational programs like "Sesame Street," I did not give up despite the lack of inclusive education.', sr: 'Створио сам своју школу кроз документарне и образовне програме попут "Улице Сезам," нисам одустао упркос недостатку инклузивног образовања.', de: 'Ich baute meine eigene Schule durch Dokumentationen und Bildungsprogramme wie "Sesamstraße," ich gab nicht auf trotz fehlender inklusiver Bildung.' },
        'journey.t5.title':   { ar: 'البداية الرقمية', en: 'Digital Beginning', sr: 'Дигитални почетак', de: 'Digitaler Anfang' },
        'journey.t5.company': { ar: 'عالم الإنترنت', en: 'The Internet World', sr: 'Свет интернета', de: 'Die Internetwelt' },
        'journey.t5.desc':    { ar: 'أطلقت أول موقع لي "جنزور ماي هوم". انطلقت إلى عالم المنتديات ثم التواصل الاجتماعي، مصمماً وناشطاً.', en: 'I launched my first website "Janzour My Home". I moved into forums then social media, as a designer and activist.', sr: 'Покренуо сам свој први сајт "Џанзур Мој Дом". Прешао сам на форуме, затим на друштвене мреже, као дизајнер и активиста.', de: 'Ich startete meine erste Website "Janzour My Home". Ich ging zu Foren und dann zu sozialen Medien, als Designer und Aktivist.' },
        'journey.t6.date':    { ar: 'العقد الأخير', en: 'The Last Decade', sr: 'Последња деценија', de: 'Das letzte Jahrzehnt' },
        'journey.t6.title':   { ar: 'العمل المؤسسي والنضال', en: 'Institutional Work & Advocacy', sr: 'Институционални рад и заступање', de: 'Institutionelle Arbeit & Einsatz' },
        'journey.t6.company': { ar: 'ليبيا - برمنغهام', en: 'Libya - Birmingham', sr: 'Либија - Бирмингем', de: 'Libyen - Birmingham' },
        'journey.t6.desc':    { ar: 'تركت بصمتي في اللجنة البارالمبية والأولمبياد الخاص الليبي. واليوم من برمنغهام أواصل الدفاع عن حقوق الإنسان والإعاقة.', en: 'I left my mark on the Libyan Paralympic Committee and Special Olympics Libya. Today from Birmingham I continue defending human and disability rights.', sr: 'Оставио сам траг у Либијском параолимпијском комитету и Специјалној олимпијади Либије. Данас из Бирмингема настављам да браним људска права и права особа са инвалидитетом.', de: 'Ich hinterließ meine Spuren im Libyschen Paralympischen Komitee und den Special Olympics Libyen. Heute setze ich von Birmingham aus meinen Einsatz für Menschenrechte und Behindertenrechte fort.' },
        'gallery.tag':   { ar: 'صور من المسيرة', en: 'Journey Gallery', sr: 'Галерија путовања', de: 'Galerie der Reise' },
        'gallery.title': { ar: 'ذكريات <span class="gradient-text">الرحلة</span>', en: 'Memories of <span class="gradient-text">the Journey</span>', sr: 'Успомене <span class="gradient-text">путовања</span>', de: 'Erinnerungen an <span class="gradient-text">die Reise</span>' },
        'gallery.desc':  { ar: 'لحظات خالدة من مسيرة التحدي والأمل', en: 'Timeless moments from a journey of challenge and hope', sr: 'Бесмртни тренуци из путовања изазова и наде', de: 'Zeitlose Momente einer Reise voller Herausforderung und Hoffnung' },
        'courses.tag':   { ar: 'مسيرتي المهنية', en: 'My Career', sr: 'Моја каријера', de: 'Meine Karriere' },
        'courses.title': { ar: 'دورات <span class="gradient-text">ومؤتمرات</span>', en: 'Courses <span class="gradient-text">& Conferences</span>', sr: 'Курсеви <span class="gradient-text">и конференције</span>', de: 'Kurse <span class="gradient-text">und Konferenzen</span>' },
        'courses.desc':  { ar: 'محطات علمية ومهنية في مسيرة النضال', en: 'Academic and professional milestones in the advocacy journey', sr: 'Академске и професионалне прекретнице на путу заступања', de: 'Akademische und berufliche Meilensteine auf dem Weg des Engagements' },
        'courses.c1.title': { ar: 'المؤتمر الأول للمرأة ذات الإعاقة بالمغرب العربي', en: 'First Conference for Women with Disabilities in the Maghreb', sr: 'Прва конференција за жене са инвалидитетом у Магребу', de: 'Erste Konferenz für Frauen mit Behinderungen im Maghreb' },
        'courses.c1.loc':   { ar: 'طرابلس', en: 'Tripoli', sr: 'Триполи', de: 'Tripolis' },
        'courses.c2.title': { ar: 'مؤتمر سياسات التعامل مع الإعاقات الذهنية بالوطن العربي', en: 'Conference on Policies for Intellectual Disabilities in the Arab World', sr: 'Конференција о политикама за интелектуалне потешкоће у арапском свету', de: 'Konferenz über Strategien für geistige Behinderungen in der arabischen Welt' },
        'courses.c2.loc':   { ar: 'بنغازي', en: 'Benghazi', sr: 'Бенгази', de: 'Benghasi' },
        'courses.c3.title': { ar: 'مرافق إعلامي لموقع اللجنة البارالمبية - بطولة العالم لكرة الجلوس', en: 'Media Officer for Paralympic Committee Website - World Sitting Volleyball Championship', sr: 'Медијски службеник за сајт Параолимпијског комитета - Светско првенство у седећој одбојци', de: 'Medienbeauftragter für die Website des Paralympischen Komitees - Weltmeisterschaft im Sitzvolleyball' },
        'courses.c3.loc':   { ar: 'أوكلاهوما، الولايات المتحدة', en: 'Oklahoma, USA', sr: 'Оклахома, САД', de: 'Oklahoma, USA' },
        'courses.c4.title': { ar: 'دورة في إدارة المحتوى (لوحة التحكم جملة)', en: 'Content Management Course (Joomla CMS)', sr: 'Курс управљања садржајем (Joomla CMS)', de: 'Content-Management-Kurs (Joomla CMS)' },
        'courses.c5.title': { ar: 'رحلة ميونخ الثقافية مع الشباب المتفوقين على مستوى ليبيا', en: 'Munich Cultural Trip with Top Libyan Youth', sr: 'Културно путовање у Минхен са најбољом либијском омладином', de: 'Kulturreise nach München mit libyschen Spitzenjugendlichen' },
        'courses.c5.loc':   { ar: 'ميونخ', en: 'Munich', sr: 'Минхен', de: 'München' },
        'courses.c6.title': { ar: 'مرافق إعلامي للجنة البارالمبية الليبية - الملتقى الدولي لألعاب القوى', en: 'Media Officer for Libyan Paralympic Committee - International Athletics Meet', sr: 'Медијски службеник за Либијски параолимпијски комитет - Међународни атлетски скуп', de: 'Medienbeauftragter des Libyschen Paralympischen Komitees - Internationales Leichtathletik-Treffen' },
        'courses.c6.loc':   { ar: 'تونس', en: 'Tunisia', sr: 'Тунис', de: 'Tunesien' },
        'courses.c7.title': { ar: 'ملتقى المنال للإعاقة والإعلام الاجتماعي', en: 'Al-Manāl Forum for Disability and Social Media', sr: 'Форум Ал-Манал за инвалидитет и друштвене медије', de: 'Al-Manāl-Forum für Behinderung und soziale Medien' },
        'courses.c7.loc':   { ar: 'الشارقة', en: 'Sharjah', sr: 'Шарџа', de: 'Sharjah' },
        'courses.c8.title': { ar: 'مرافق إعلامي لألعاب البارالمبية', en: 'Media Officer for the Paralympic Games', sr: 'Медијски службеник за Параолимпијске игре', de: 'Medienbeauftragter für die Paralympischen Spiele' },
        'courses.c8.loc':   { ar: 'لندن', en: 'London', sr: 'Лондон', de: 'London' },
        'courses.c9.title': { ar: 'الدورة الأخيرة للصحافة الإلكترونية (فرانس24)', en: 'Advanced Course in Digital Journalism (France24)', sr: 'Напредни курс дигиталног новинарства (France24)', de: 'Fortgeschrittenenkurs in digitalem Journalismus (France24)' },
        'courses.c10.title':{ ar: 'مشرف موقع ليبيا بلوق - مدونات ليبية', en: 'Site Supervisor for Libya Blog - Libyan Blogs', sr: 'Супервизор сајта Либија Блог - Либијски блогови', de: 'Webseitenbetreuer für Libya Blog - Libysche Blogs' },
        'courses.c11.title':{ ar: 'مرافق إعلامي - بطولة آسيا المفتوحة لرفعات القوة', en: 'Media Officer - Asia Open Powerlifting Championship', sr: 'Медијски службеник - Азијско отворено првенство у дизању тегова', de: 'Medienbeauftragter - Asiatische Offene Meisterschaft im Powerlifting' },
        'courses.c11.loc':  { ar: 'كوالالمبور، ماليزيا', en: 'Kuala Lumpur, Malaysia', sr: 'Куала Лумпур, Малезија', de: 'Kuala Lumpur, Malaysia' },
        'courses.c12.title':{ ar: 'الملتقى المغاربي حول مشروع القيادة للأشخاص ذوي الإعاقة', en: 'Maghreb Forum on Leadership for People with Disabilities', sr: 'Магрепски форум о лидерству за особе са инвалидитетом', de: 'Maghreb-Forum über Führung für Menschen mit Behinderungen' },
        'courses.c12.loc':  { ar: 'حمامات، تونس', en: 'Hammamet, Tunisia', sr: 'Хамамет, Тунис', de: 'Hammamet, Tunesien' },
        'courses.c13.title':{ ar: 'مؤتمر الحوار الإقليمي الثالث لإدماج الأشخاص ذوي الإعاقة في المشاركة الانتخابية', en: '3rd Regional Dialogue Conference for Including Persons with Disabilities in Electoral Participation', sr: '3. регионална дијалошка конференција за укључивање особа са инвалидитетом у изборну партиципацију', de: '3. Regionale Dialogkonferenz zur Einbeziehung von Menschen mit Behinderungen in die Wahlbeteiligung' },
        'courses.c13.loc':  { ar: 'جاكارتا', en: 'Jakarta', sr: 'Џакарта', de: 'Jakarta' },
        'courses.c14.title':{ ar: 'ورشة عمل حول السوشيال ميديا', en: 'Social Media Workshop', sr: 'Радионица о друштвеним медијима', de: 'Social-Media-Workshop' },
        'courses.c14.loc':  { ar: 'اسطنبول', en: 'Istanbul', sr: 'Истанбул', de: 'Istanbul' },
        'courses.c15.title':{ ar: 'بطولة أفريقيا لكرة السلة على الكراسي', en: 'Africa Wheelchair Basketball Championship', sr: 'Афричко првенство у кошарци у колицима', de: 'Afrikanische Meisterschaft im Rollstuhlbasketball' },
        'courses.c15.loc':  { ar: 'الجزائر', en: 'Algeria', sr: 'Алжир', de: 'Algerien' },
        'courses.c16.title':{ ar: 'ورشة عمل حول دور وسائل الإعلام في صياغة الدستور', en: 'Workshop on the Role of Media in Constitution Drafting', sr: 'Радионица о улози медија у изради устава', de: 'Workshop zur Rolle der Medien bei der Verfassungsgebung' },
        'courses.c16.loc':  { ar: 'تونس', en: 'Tunisia', sr: 'Тунис', de: 'Tunesien' },
        'courses.c17.title':{ ar: 'مخيم تيك كامب ليبيا', en: 'Tech Camp Libya', sr: 'Тех камп Либија', de: 'Tech Camp Libyen' },
        'courses.c17.loc':  { ar: 'تونس', en: 'Tunisia', sr: 'Тунис', de: 'Tunesien' },
        'courses.c18.title':{ ar: 'ورشة عمل لتعزيز إمكانية وسهولة الوصول للموقع الإلكتروني', en: 'Workshop on Enhancing Website Accessibility', sr: 'Радионица о унапређењу приступачности веб-сајтова', de: 'Workshop zur Verbesserung der Barrierefreiheit von Websites' },
        'courses.c18.loc':  { ar: 'تونس', en: 'Tunisia', sr: 'Тунис', de: 'Tunesien' },
        'courses.c19.title':{ ar: 'دورة تدريبية حول إعداد المدربين في مجال حقوق الأشخاص ذوي الإعاقة', en: 'Training of Trainers Course on Disability Rights', sr: 'Обука за тренере о правима особа са инвалидитетом', de: 'Train-the-Trainer-Kurs zu den Rechten von Menschen mit Behinderungen' },
        'courses.c19.loc':  { ar: 'تونس', en: 'Tunisia', sr: 'Тунис', de: 'Tunesien' },
        'courses.c20.title':{ ar: 'دور الإعلام في تعزيز مشاركة الأشخاص ذوي الإعاقة', en: 'The Role of Media in Enhancing Participation of Persons with Disabilities', sr: 'Улога медија у унапређењу учешћа особа са инвалидитетом', de: 'Die Rolle der Medien bei der Förderung der Teilhabe von Menschen mit Behinderungen' },
        'courses.c21.title':{ ar: 'اليوم العربي للأشخاص ذوي الإعاقة - مجمع ليبيا للدراسات المتقدمة', en: 'Arab Day for Persons with Disabilities - Libya Academy for Advanced Studies', sr: 'Арапски дан за особе са инвалидитетом - Либијска академија за напредне студије', de: 'Arabischer Tag für Menschen mit Behinderungen - Libysche Akademie für fortgeschrittene Studien' },
        'courses.c22.title':{ ar: 'مدرسة ليبيا لحوكمة الإنترنت: قضايا ذوي الإعاقة وإمكانية الوصول', en: 'Libya Internet Governance School: Disability Issues and Accessibility', sr: 'Либијска школа управљања интернетом: Питања инвалидитета и приступачност', de: 'Libysche Schule für Internet-Governance: Behindertenfragen und Barrierefreiheit' },
        'initiatives.tag':   { ar: 'مبادراتي', en: 'My Initiatives', sr: 'Моје иницијативе', de: 'Meine Initiativen' },
        'initiatives.title': { ar: 'مبادرات <span class="gradient-text">أحدثت فرقاً</span>', en: 'Initiatives <span class="gradient-text">That Made a Difference</span>', sr: 'Иницијативе <span class="gradient-text">које су направиле разлику</span>', de: 'Initiativen <span class="gradient-text">die einen Unterschied machten</span>' },
        'initiatives.desc':  { ar: 'مشاريع ومبادرات حقيقية أسستها وساهمت فيها لتمكين الأشخاص ذوي الإعاقة', en: 'Real projects and initiatives I founded and contributed to empowering persons with disabilities', sr: 'Стварни пројекти и иницијативе које сам основао и допринео оснаживању особа са инвалидитетом', de: 'Reale Projekte und Initiativen, die ich gründete und zur Stärkung von Menschen mit Behinderungen beitrug' },
        'initiatives.c1.title': { ar: 'مدونة absi.cc', en: 'absi.cc Blog', sr: 'absi.cc блог', de: 'absi.cc Blog' },
        'initiatives.c1.desc':  { ar: 'منصة إلكترونية لنشر الوعي بحقوق الأشخاص ذوي الإعاقة في ليبيا والعالم. أكثر من 100 مقال منذ 2009.', en: 'Online platform raising awareness about disability rights in Libya and worldwide. Over 100 articles since 2009.', sr: 'Онлајн платформа за подизање свести о правима особа са инвалидитетом у Либији и свету. Преко 100 чланака од 2009.', de: 'Online-Plattform zur Sensibilisierung für Behindertenrechte in Libyen und weltweit. Über 100 Artikel seit 2009.' },
        'initiatives.c1.tag':   { ar: 'إعلامي', en: 'Media', sr: 'Медији', de: 'Medien' },
        'initiatives.c2.title': { ar: 'اللجنة البارالمبية الليبية', en: 'Libyan Paralympic Committee', sr: 'Либијски параолимпијски комитет', de: 'Libysches Paralympisches Komitee' },
        'initiatives.c2.desc':  { ar: 'عضو مكتب الإعلام ومصمم الموقع الرسمي منذ 2008. مرافق إعلامي في بطولات عالمية.', en: 'Media office member and official website designer since 2008. Media escort in international championships.', sr: 'Члан медијског бироа и дизајнер званичног сајта од 2008. Медијски пратилац на међународним првенствима.', de: 'Mitglied des Medienbüros und Designer der offiziellen Website seit 2008. Medienbegleiter bei internationalen Meisterschaften.' },
        'initiatives.c2.tag':   { ar: 'رياضي', en: 'Sports', sr: 'Спорт', de: 'Sport' },
        'initiatives.c3.title': { ar: 'الأولمبياد الخاص الليبي', en: 'Special Olympics Libya', sr: 'Специјална олимпијада Либије', de: 'Special Olympics Libyen' },
        'initiatives.c3.desc':  { ar: 'عضو مكتب الإعلام، المساهمة في تغطية الفعاليات الرياضية لذوي الإعاقة الذهنية.', en: 'Media office member, contributing to coverage of sports events for people with intellectual disabilities.', sr: 'Члан медијског бироа, допринос покривању спортских догађаја за особе са интелектуалним потешкоћама.', de: 'Mitglied des Medienbüros, Beitrag zur Berichterstattung über Sportveranstaltungen für Menschen mit geistigen Behinderungen.' },
        'initiatives.c3.tag':   { ar: 'رياضي', en: 'Sports', sr: 'Спорт', de: 'Sport' },
        'initiatives.c4.title': { ar: 'موقع "جنزور ماي هوم"', en: '"Janzour My Home" Website', sr: '"Џанзур Мој Дом" сајт', de: '"Janzour My Home" Website' },
        'initiatives.c4.desc':  { ar: 'أول موقع إلكتروني شخصي أطلقته عام 2004، نقطة الانطلاق في العالم الرقمي.', en: 'My first personal website launched in 2004, the starting point in the digital world.', sr: 'Мој први лични сајт покренут 2004, полазна тачка у дигиталном свету.', de: 'Meine erste persönliche Website, gestartet 2004, der Ausgangspunkt in der digitalen Welt.' },
        'initiatives.c4.tag':   { ar: 'رقمي', en: 'Digital', sr: 'Дигитално', de: 'Digital' },
        'initiatives.c5.title': { ar: 'حملة التوعية بالإعاقة في المدارس', en: 'Disability Awareness in Schools Campaign', sr: 'Кампања подизања свести о инвалидитету у школама', de: 'Kampagne zur Sensibilisierung für Behinderungen in Schulen' },
        'initiatives.c5.desc':  { ar: 'حملة تطالب بإدراج التوعية بحقوق الإعاقة في المناهج التعليمية الليبية. منشورات على Substack.', en: 'A campaign demanding inclusion of disability rights awareness in Libyan school curricula. Posts on Substack.', sr: 'Кампања која захтева укључивање свести о правима особа са инвалидитетом у либијске школске програме. Објаве на Substack-у.', de: 'Eine Kampagne, die die Aufnahme von Behindertenrechtsbewusstsein in libysche Schullehrpläne fordert. Beiträge auf Substack.' },
        'initiatives.c5.tag':   { ar: 'تعليمي', en: 'Educational', sr: 'Образовно', de: 'Bildung' },
        'initiatives.c6.title': { ar: 'الحوار مع UNSMIL', en: 'Dialogue with UNSMIL', sr: 'Дијалог са UNSMIL', de: 'Dialog mit UNSMIL' },
        'initiatives.c6.desc':  { ar: 'مشاركة في اجتماع تشاوري مع بعثة الأمم المتحدة للدعم في ليبيا لضمان تمثيل ذوي الإعاقة.', en: 'Participation in a consultative meeting with the UN Support Mission in Libya to ensure disability representation.', sr: 'Учешће у консултативном састанку са Мисијом УН за подршку у Либији ради обезбеђивања заступљености особа са инвалидитетом.', de: 'Teilnahme an einem Konsultationstreffen mit der UN-Unterstützungsmission in Libyen zur Sicherstellung der Vertretung von Menschen mit Behinderungen.' },
        'initiatives.c6.tag':   { ar: 'حقوقي', en: 'Advocacy', sr: 'Заступање', de: 'Menschenrechte' },
        'initiatives.c7.title': { ar: 'حراك تصحيح المسار', en: 'Course Correction Movement', sr: 'Покрет за корекцију курса', de: 'Kurskorrekturbewegung' },
        'initiatives.c7.desc':  { ar: 'مقترح حقوقي لتسوية مستحقات الإعانة المنزلية المتأخرة للأشخاص ذوي الإعاقة في ليبيا.', en: 'An advocacy proposal to settle outstanding home allowance dues for persons with disabilities in Libya.', sr: 'Предлог заступања за решавање заосталих накнада за кућну негу за особе са инвалидитетом у Либији.', de: 'Ein Advocacy-Vorschlag zur Begleichung ausstehender Haushaltszulagen für Menschen mit Behinderungen in Libyen.' },
        'initiatives.c7.tag':   { ar: 'مناصرة', en: 'Advocacy', sr: 'Заступање', de: 'Interessenvertretung' },
        'initiatives.c7.link':  { ar: 'التفاصيل', en: 'Details', sr: 'Детаљи', de: 'Details' },
        'initiatives.c8.title': { ar: 'قناة "جنزور كوم"', en: '"Janzour Com" Channel', sr: 'Канал "Џанзур Ком"', de: 'Kanal "Janzour Com"' },
        'initiatives.c8.desc':  { ar: 'قناة يوتيوب أنتجت أكثر من 70 فيديو عن تحديات الإعاقة، تجارب شخصية، وتوعية شهرية.', en: 'A YouTube channel producing over 70 videos about disability challenges, personal experiences, and monthly awareness.', sr: 'Јутјуб канал са преко 70 видеа о изазовима инвалидитета, личним искуствима и месечном едукацијом.', de: 'Ein YouTube-Kanal mit über 70 Videos über Herausforderungen von Behinderungen, persönliche Erfahrungen und monatliche Aufklärung.' },
        'initiatives.c8.tag':   { ar: 'إعلامي', en: 'Media', sr: 'Медији', de: 'Medien' },
        'blog.tag':     { ar: 'المدونة', en: 'Blog', sr: 'Блог', de: 'Blog' },
        'blog.title':   { ar: 'أحدث <span class="gradient-text">التدوينات</span>', en: 'Latest <span class="gradient-text">Posts</span>', sr: 'Најновији <span class="gradient-text">постови</span>', de: 'Neueste <span class="gradient-text">Beiträge</span>' },
        'blog.desc':    { ar: 'أكثر من 100 مقال عن حقوق الأشخاص ذوي الإعاقة منذ 2009', en: 'Over 100 articles on disability rights since 2009', sr: 'Преко 100 чланака о правима особа са инвалидитетом од 2009.', de: 'Über 100 Artikel zu Behindertenrechten seit 2009' },
        'blog.loading': { ar: 'جاري تحميل أحدث التدوينات...', en: 'Loading latest posts...', sr: 'Учитавање најновијих постова...', de: 'Neueste Beiträge werden geladen...' },
        'blog.allPosts':{ ar: 'جميع التدوينات على absi.cc ←', en: 'All posts on absi.cc ←', sr: 'Сви постови на absi.cc ←', de: 'Alle Beiträge auf absi.cc ←' },
        'quote.text':   { ar: 'أكون أو لا أكون.<br>هذا ليس سؤالاً بالنسبة لي،<br>بل إعلان وجود وإرادة.', en: 'To be or not to be.<br>This is not a question for me,<br>but a declaration of existence and will.', sr: 'Бити или не бити.<br>То за мене није питање,<br>већ декларација постојања и воље.', de: 'Sein oder nicht sein.<br>Das ist für mich keine Frage,<br>sondern eine Erklärung der Existenz und des Willens.' },
        'quote.author': { ar: '— عبدالسلام شليبك', en: '— Abdusalam Shlebak', sr: '— Абдусалам Шлебак', de: '— Abdusalam Shlebak' },
        'contact.tag':        { ar: 'تواصل', en: 'Contact', sr: 'Контакт', de: 'Kontakt' },
        'contact.title':      { ar: 'تواصل <span class="gradient-text">معي</span>', en: 'Get in <span class="gradient-text">Touch</span>', sr: 'Ступите у <span class="gradient-text">контакт</span>', de: 'Nimm <span class="gradient-text">Kontakt</span> auf' },
        'contact.desc':       { ar: 'للمشاركة، التعاون، أو مجرد كلمة تشجيع', en: 'To share, collaborate, or just a word of encouragement', sr: 'Да поделите, сарађујете, или само реч подршке', de: 'Um zu teilen, zusammenzuarbeiten oder einfach ein Wort der Ermutigung' },
        'contact.emailLabel':   { ar: 'البريد الإلكتروني', en: 'Email', sr: 'Е-пошта', de: 'E-Mail' },
        'contact.xLabel':       { ar: 'منصة X', en: 'X Platform', sr: 'X платформа', de: 'X Plattform' },
        'contact.residenceLabel': { ar: 'الإقامة', en: 'Residence', sr: 'Боравиште', de: 'Wohnsitz' },
        'contact.residenceVal': { ar: 'برمنغهام', en: 'Birmingham', sr: 'Бирмингем', de: 'Birmingham' },
        'contact.mottoLabel':   { ar: 'الشعار', en: 'Motto', sr: 'Мото', de: 'Motto' },
        'contact.mottoVal':     { ar: '#أكون_أو_لا_أكون', en: '#ToBeOrNotToBe', sr: '#БитиИлиНеБити', de: '#SeinOderNichtSein' },
        'contact.submitBtn':    { ar: 'إرسال الرسالة', en: 'Send Message', sr: 'Пошаљи поруку', de: 'Nachricht senden' },
        'contact.namePlaceholder':    { ar: 'الاسم', en: 'Your Name', sr: 'Ваше име', de: 'Ihr Name' },
        'contact.emailPlaceholder':   { ar: 'البريد الإلكتروني', en: 'Your Email', sr: 'Ваша е-пошта', de: 'Ihre E-Mail' },
        'contact.subjectPlaceholder': { ar: 'الموضوع', en: 'Subject', sr: 'Наслов', de: 'Betreff' },
        'contact.messagePlaceholder': { ar: 'رسالتك...', en: 'Your message...', sr: 'Ваша порука...', de: 'Ihre Nachricht...' },
        'footer.desc':    { ar: 'ناشط حقوق الإعاقة | مؤسس | مدون<br>شعاري: أكون أو لا أكون', en: 'Disability Rights Activist | Founder | Blogger<br>Motto: To be or not to be', sr: 'Активиста за права особа са инвалидитетом | Оснивач | Блогер<br>Мото: Бити или не бити', de: 'Behindertenrechtsaktivist | Gründer | Blogger<br>Motto: Sein oder nicht sein' },
        'footer.copyright': { ar: '&copy; 2026 عبدالسلام شليبك. جميع الحقوق محفوظة.', en: '&copy; 2026 Abdusalam Shlebak. All rights reserved.', sr: '&copy; 2026 Абдусалам Шлебак. Сва права задржана.', de: '&copy; 2026 Abdusalam Shlebak. Alle Rechte vorbehalten.' },
        'footer.motto':   { ar: 'الإرادة تصنع المستحيل', en: 'Willpower makes the impossible possible', sr: 'Воља чини немогуће могућим', de: 'Willenskraft macht das Unmögliche möglich' },
        'acc.header':     { ar: 'قائمة الوصول', en: 'Accessibility Menu', sr: 'Мени приступачности', de: 'Barrierefreiheitsmenü' },
        'acc.fontPlus':   { ar: '🔤 تكبير الخط', en: '🔤 Increase Font', sr: '🔤 Повећај фонт', de: '🔤 Schrift vergrößern' },
        'acc.fontMinus':  { ar: '🔤 تصغير الخط', en: '🔤 Decrease Font', sr: '🔤 Смањи фонт', de: '🔤 Schrift verkleinern' },
        'acc.contrast':   { ar: '🌓 تباين عالي', en: '🌓 High Contrast', sr: '🌓 Високи контраст', de: '🌓 Hoher Kontrast' },
        'acc.grayscale':  { ar: '⚫ أبيض وأسود', en: '⚫ Grayscale', sr: '⚫ Сиви тонови', de: '⚫ Graustufen' },
        'acc.reset':      { ar: '🔄 إعادة ضبط', en: '🔄 Reset', sr: '🔄 Ресетовање', de: '🔄 Zurücksetzen' },
        'hero.firstName': { ar: 'عبدالسلام', en: 'Abdusalam', sr: 'Абдусалам', de: 'Abdusalam' },
        'hero.lastName':  { ar: 'شليبك', en: 'Shlebak', sr: 'Шлебак', de: 'Shlebak' },
        'logo.name':      { ar: 'عبدالسلام', en: 'Abdusalam', sr: 'Абдусалам', de: 'Abdusalam' },
        'site.title':     { ar: 'عبدالسلام شليبك | ناشط حقوق الإعاقة', en: 'Abdusalam Shlebak | Disability Rights Activist', sr: 'Абдусалам Шлебак | Активиста за права особа са инвалидитетом', de: 'Abdusalam Shlebak | Behindertenrechtsaktivist' },
        'site.desc':      { ar: 'الموقع الرسمي لعبدالسلام شليبك - ناشط حقوق الإعاقة، مؤسس، مدون', en: 'The official website of Abdusalam Shlebak - Disability Rights Activist, Founder, Blogger', sr: 'Званични сајт Абдусалама Шлебака - Активиста за права особа са инвалидитетом, оснивач, блогер', de: 'Die offizielle Website von Abdusalam Shlebak - Behindertenrechtsaktivist, Gründer, Blogger' },
        'img.logoAlt':    { ar: 'عبدالسلام شليبك', en: 'Abdusalam Shlebak', sr: 'Абдусалам Шлебак', de: 'Abdusalam Shlebak' },
        'img.heroAlt':    { ar: 'عبدالسلام شليبك', en: 'Abdusalam Shlebak', sr: 'Абдусалам Шлебак', de: 'Abdusalam Shlebak' },
        'img.aboutAlt':   { ar: 'عبدالسلام شليبك', en: 'Abdusalam Shlebak', sr: 'Абдусалам Шлебак', de: 'Abdusalam Shlebak' },
        'img.skillsAlt':  { ar: 'عبدالسلام شليبك - المهارات والخبرات', en: 'Abdusalam Shlebak - Skills & Expertise', sr: 'Абдусалам Шлебак - Вештине и стручност', de: 'Abdusalam Shlebak - Fähigkeiten & Fachkenntnisse' },
        'backToTop.aria': { ar: 'العودة للأعلى', en: 'Back to top', sr: 'Повратак на врх', de: 'Zurück nach oben' },
        'acc.ariaLabel':  { ar: 'قائمة الوصول', en: 'Accessibility menu', sr: 'Мени приступачности', de: 'Barrierefreiheitsmenü' },
        'acc.lightmode':  { ar: '☀️ فاتح', en: '☀️ Light', sr: '☀️ Светло', de: '☀️ Hell' },
        'social.twitter':    { ar: 'تويتر', en: 'Twitter', sr: 'Твитер', de: 'Twitter' },
        'social.linkedin':   { ar: 'لينكد إن', en: 'LinkedIn', sr: 'Линкедин', de: 'LinkedIn' },
        'social.facebook':   { ar: 'فيسبوك', en: 'Facebook', sr: 'Фејсбук', de: 'Facebook' },
        'social.instagram':  { ar: 'إنستغرام', en: 'Instagram', sr: 'Инстаграм', de: 'Instagram' },
        'social.youtube':    { ar: 'يوتيوب', en: 'YouTube', sr: 'Јутјуб', de: 'YouTube' },
        'social.tiktok':   { ar: 'تيك توك', en: 'TikTok', sr: 'ТикТок', de: 'TikTok' },
        'social.telegram': { ar: 'تيليجرام', en: 'Telegram', sr: 'Телеграм', de: 'Telegram' },
        'search.ariaLabel': { ar: 'بحث', en: 'Search', sr: 'Претрага', de: 'Suchen' },
        'search.placeholder': { ar: 'ابحث هنا...', en: 'Search here...', sr: 'Претражите овде...', de: 'Hier suchen...' },
        'search.inputAria': { ar: 'كلمة البحث', en: 'Search query', sr: 'Упит за претрагу', de: 'Suchanfrage' },
        'search.closeAria': { ar: 'إغلاق البحث', en: 'Close search', sr: 'Затвори претрагу', de: 'Suche schließen' },
        '_gallery.فعاليات':    { ar: 'فعاليات', en: 'Events', sr: 'Догађаји', de: 'Veranstaltungen' },
        '_gallery.ذكريات':     { ar: 'ذكريات', en: 'Memories', sr: 'Успомене', de: 'Erinnerungen' },
        '_gallery.محطات دولية': { ar: 'محطات دولية', en: 'International Milestones', sr: 'Међународне прекретнице', de: 'Internationale Meilensteine' },
        '_gallery.لندن 2012':  { ar: 'لندن 2012', en: 'London 2012', sr: 'Лондон 2012', de: 'London 2012' },
        '_gallery.مؤتمرات':    { ar: 'مؤتمرات', en: 'Conferences', sr: 'Конференције', de: 'Konferenzen' },
        '_gallery.برمنغهام':   { ar: 'برمنغهام', en: 'Birmingham', sr: 'Бирмингем', de: 'Birmingham' }
    };

    // Language switch with translations
    function applyLanguage(lang) {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            if (translations[key] && translations[key][lang]) {
                if (el.tagName === 'TITLE') {
                    el.textContent = translations[key][lang];
                } else {
                    el.innerHTML = translations[key][lang];
                }
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-placeholder');
            if (translations[key] && translations[key][lang]) {
                el.setAttribute('placeholder', translations[key][lang]);
            }
        });
        document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-alt');
            if (translations[key] && translations[key][lang]) {
                el.setAttribute('alt', translations[key][lang]);
            }
        });
        document.querySelectorAll('[data-i18n-meta]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-meta');
            if (translations[key] && translations[key][lang]) {
                el.setAttribute('content', translations[key][lang]);
            }
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
            var key = el.getAttribute('data-i18n-aria');
            if (translations[key] && translations[key][lang]) {
                el.setAttribute('aria-label', translations[key][lang]);
            }
        });
        document.querySelectorAll('.mosaic-overlay span').forEach(function (el) {
            var txt = el.getAttribute('data-label');
            if (!txt) return;
            var key = '_gallery.' + txt;
            if (translations[key] && translations[key][lang]) {
                el.textContent = translations[key][lang];
            }
        });
        document.querySelectorAll('.mosaic-img').forEach(function (el) {
            var txt = el.getAttribute('data-label');
            if (!txt) return;
            var key = '_gallery.' + txt;
            if (translations[key] && translations[key][lang]) {
                el.setAttribute('alt', translations[key][lang]);
            }
        });
    }

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.lang-btn').forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            applyLanguage(this.dataset.lang);
        });
    });

    // Parallax on hero avatar
    const hero = document.getElementById('hero');
    if (hero) {
        hero.addEventListener('mousemove', function (e) {
            const wrapper = this.querySelector('.hero-avatar-wrapper');
            if (!wrapper) return;
            const rect = this.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            wrapper.style.transform = 'translate(' + (x * 10) + 'px, ' + (y * 10) + 'px)';
        });
        hero.addEventListener('mouseleave', function () {
            const wrapper = this.querySelector('.hero-avatar-wrapper');
            if (wrapper) wrapper.style.transform = '';
        });
    }

    console.log('%c⛓️ ABSI %c Personal v1.0', 'color:#6C5CE7;font-weight:bold;font-size:16px;', 'color:#8888A0;font-size:12px;');

    // Blog posts loader from absi.cc
    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    window.renderPosts = function (data) {
        var container = document.getElementById('blogPosts');
        if (!container || !data.feed.entry) { return; }
        var entries = data.feed.entry;
        var html = '';
        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            var title = entry.title.$t;
            var content = entry.content.$t;
            var published = entry.published.$t;
            var links = entry.link;
            var categories = entry.category;

            var postUrl = '';
            for (var j = 0; j < links.length; j++) {
                if (links[j].rel === 'alternate') { postUrl = links[j].href; break; }
            }

            var category = (categories && categories[0]) ? categories[0].term : '';

            var imgSrc = '';
            var imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
            if (imgMatch) {
                imgSrc = imgMatch[1].replace(/=w\d+-h\d+(-c)?/, '=w800-h400-c');
            }

            var text = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
            var excerpt = escapeHtml(text.substring(0, 120)) + '...';

            var d = new Date(published);
            var months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            var dateStr = d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();

            html += '<article class="blog-card">';
            if (imgSrc) {
                html += '<div class="blog-card-img"><img src="' + imgSrc + '" alt="' + escapeHtml(title) + '"></div>';
            }
            html += '<span class="blog-category">' + escapeHtml(category) + '</span>';
            html += '<div class="blog-date">' + dateStr + '</div>';
            html += '<h3 class="blog-title">' + escapeHtml(title) + '</h3>';
            html += '<p class="blog-excerpt">' + excerpt + '</p>';
            html += '<a href="' + postUrl + '" target="_blank" class="blog-link">اقرأ المزيد ←</a>';
            html += '</article>';
        }
        container.innerHTML = html;
    };

    window.loadBlogPosts = function () {
        var s = document.createElement('script');
        s.src = 'https://www.absi.cc/feeds/posts/default?alt=json-in-script&callback=renderPosts&max-results=6';
        document.body.appendChild(s);
    };
    loadBlogPosts();

    // Fallback if feed fails
    setTimeout(function () {
        var container = document.getElementById('blogPosts');
        if (container && container.querySelector('.blog-loading')) {
            container.innerHTML = '<div class="blog-loading">تعذر تحميل التدوينات. <a href="https://www.absi.cc" style="color:var(--primary-light);">تصفح absi.cc ←</a></div>';
        }
        }, 8000);

    // Gallery data — edit visually: hover then click pencil ✏️
    var STORAGE_KEY = 'absi_gallery';
    var stored = localStorage.getItem(STORAGE_KEY);
    var galleryData = stored ? JSON.parse(stored) : [
        { src: 'assets/journey_01.png', label: 'مسيرة النضال', css: 'mosaic-hero' },
        { src: 'assets/album_9.png',   label: 'فعاليات' },
        { src: 'assets/album_6.jpg',   label: 'ذكريات',     css: 'mosaic-tall' },
        { src: 'assets/album_5.jpg',   label: 'محطات دولية' },
        { src: 'assets/album_10.jpg',  label: 'لندن 2012' },
        { src: 'assets/album_4.jpg',   label: 'محطات دولية' },
        { src: 'assets/album_8.jpg',   label: 'مؤتمرات',    css: 'mosaic-wide' },
        { src: 'assets/album_7.jpg',   label: 'محطات دولية' },
        { src: 'assets/album_12.jpg',  label: 'محطات دولية' },
        { src: 'assets/journey_02.png', label: 'محطات دولية' },
        { src: 'assets/album_13.jpg',  label: 'برمنغهام' }
    ];

    var editMode = false;
    var editorEnabled = window.location.search.indexOf('edit=1') > -1;

    function saveGallery() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(galleryData));
    }

    function renderGallery() {
        var container = document.getElementById('galleryMosaic');
        if (!container) return;
        var html = '';
        for (var i = 0; i < galleryData.length; i++) {
            var item = galleryData[i];
            var cls = 'mosaic-item';
            if (item.css) cls += ' ' + item.css;
            html += '<div class="' + cls + '" data-idx="' + i + '">';
            html += '<img src="' + item.src + '" alt="' + item.label + '" class="mosaic-img" data-label="' + item.label + '">';
            html += '<div class="mosaic-overlay"><span data-label="' + item.label + '">' + item.label + '</span></div>';
            if (editMode) {
                html += '<button class="gallery-edit-btn" data-idx="' + i + '" title="تعديل العنوان">✏️</button>';
                html += '<button class="gallery-del-btn" data-idx="' + i + '" title="حذف">🗑️</button>';
            }
            html += '</div>';
        }
        html += '<div class="gallery-edit-bar">';
        if (editMode) {
            html += '<button class="btn btn-sm gallery-add-btn">➕ إضافة صورة</button>';
            html += '<button class="btn btn-sm gallery-code-btn">📋 تصدير الكود</button>';
            html += '<button class="btn btn-sm gallery-done-btn">✔️ تم</button>';
        } else if (editorEnabled) {
            html += '<button class="btn btn-sm gallery-toggle-btn">✏️ تعديل</button>';
        }
        html += '</div>';
        container.innerHTML = html;
        if (editMode) bindEditorEvents();
    }
    renderGallery();

    function bindEditorEvents() {
        document.querySelectorAll('.gallery-edit-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var idx = parseInt(this.dataset.idx);
                var label = prompt('العنوان الجديد:', galleryData[idx].label);
                if (label && label.trim()) {
                    galleryData[idx].label = label.trim();
                    saveGallery();
                    renderGallery();
                }
            });
        });
        document.querySelectorAll('.gallery-del-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                var idx = parseInt(this.dataset.idx);
                if (confirm('حذف هذه الصورة؟')) {
                    galleryData.splice(idx, 1);
                    saveGallery();
                    renderGallery();
                }
            });
        });
    }

    document.getElementById('galleryMosaic').addEventListener('click', function (e) {
        if (editorEnabled) {
            var btn = e.target.closest('.gallery-toggle-btn');
            if (btn) { editMode = !editMode; renderGallery(); return; }
            var done = e.target.closest('.gallery-done-btn');
            if (done) { editMode = false; renderGallery(); return; }
            var code = e.target.closest('.gallery-code-btn');
            if (code) {
                var str = '// Paste this into js/main.js\nvar galleryData = ' + JSON.stringify(galleryData, null, 4) + ';';
                navigator.clipboard.writeText(str).then(function () {
                    alert('✅ تم نسخ الكود! الصقه في ملف js/main.js وارفع الموقع للسيرفر.');
                }, function () {
                    alert('❌ تعذر النسخ. انسخ الكود من console (F12)');
                    console.log(str);
                });
                return;
            }
            var add = e.target.closest('.gallery-add-btn');
            if (add) {
                var src = prompt('رابط الصورة (مثال: assets/album_14.jpg):');
                if (src) {
                    var label = prompt('عنوان الصورة:');
                    galleryData.push({ src: src, label: label || 'صورة' });
                    saveGallery();
                    renderGallery();
                }
                return;
            }
            if (editMode) return;
        }
        var item = e.target.closest('.mosaic-item');
        if (!item) return;
        var items = Array.from(this.querySelectorAll('.mosaic-item'));
        openLightbox(items.indexOf(item));
    });

    // Lightbox
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxCaption = document.getElementById('lightboxCaption');
    var currentIndex = 0;

    function getItemData(item) {
        var img = item.querySelector('.mosaic-img');
        var label = item.querySelector('.mosaic-overlay span');
        return {
            src: img ? img.src : '',
            caption: label ? label.textContent : ''
        };
    }

    function openLightbox(index) {
        var items = document.querySelectorAll('.mosaic-item');
        if (index < 0 || index >= items.length) return;
        currentIndex = index;
        var data = getItemData(items[currentIndex]);
        lightboxImg.src = data.src;
        lightboxCaption.textContent = data.caption;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function prevImage() {
        var items = document.querySelectorAll('.mosaic-item');
        var idx = currentIndex - 1;
        if (idx < 0) idx = items.length - 1;
        openLightbox(idx);
    }

    function nextImage() {
        var items = document.querySelectorAll('.mosaic-item');
        var idx = currentIndex + 1;
        if (idx >= items.length) idx = 0;
        openLightbox(idx);
    }

    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
            closeLightbox();
        }
    });

    document.querySelector('.lightbox-prev').addEventListener('click', function (e) {
        e.stopPropagation(); prevImage();
    });
    document.querySelector('.lightbox-next').addEventListener('click', function (e) {
        e.stopPropagation(); nextImage();
    });

    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'ArrowRight') nextImage();
    });

    // Apply active language on load
    var activeLang = document.querySelector('.lang-btn.active');
    if (activeLang) applyLanguage(activeLang.getAttribute('data-lang'));

    // Restore light mode
    if (localStorage.getItem('lightMode') === '1') {
        document.body.classList.add('light-mode');
        var lightBtn = document.querySelector('.acc-btn[data-action="lightmode"]');
        if (lightBtn) lightBtn.classList.add('active');
    }
})();
