/**
 * Gestatten, Takis - Portfolio Webpage Application Logic
 * Implements: Canvas magic particle systems, 3D card hover tilt, scroll-based parallax, 
 * IntersectionObserver scroll reveals, responsive header drawer, and the interactive card trick.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Mobile Menu Toggle & Navigation Scroll
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle-btn');
    const navMenu = document.getElementById('nav-menu-container');
    const navLinks = document.querySelectorAll('.nav-link');
    const mainHeader = document.getElementById('main-header');

    // Toggle menu
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Header scroll background shrink
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       2. Scroll Reveal Animations (Intersection Observer)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Reveal once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    /* ==========================================================================
       3. Parallax Scroll Effect
       ========================================================================== */
    const parallaxElements = document.querySelectorAll('.parallax-element');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.getAttribute('data-speed')) || 2;
            const yOffset = -(scrolled * speed / 15);
            el.style.transform = `translateY(${yOffset}px)`;
        });
    });

    /* ==========================================================================
       4. 3D Hover Tilt Effect
       ========================================================================== */
    const tiltElements = document.querySelectorAll('.service-card, .visual-card-inner');
    const cursorGlow = document.getElementById('cursor-glow');

    // Track global cursor coordinate for subtle glow element
    window.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
    });

    tiltElements.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x coordinate inside element
            const y = e.clientY - rect.top;  // y coordinate inside element

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate tilt angle based on distance from center (max 10 degrees)
            const rotateX = ((centerY - y) / centerY) * 8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none'; // Instant movement response
        });
    });

    /* ==========================================================================
       5. Interactive Canvas Background (Repelling Particles)
       ========================================================================== */
    const canvas = document.getElementById('magic-canvas');
    const ctx = canvas.getContext('2d');

    let particlesArray = [];
    const maxParticles = 65;

    // Mouse coords
    let mouse = {
        x: null,
        y: null,
        radius: 120 // Radius of influence around cursor
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
    resizeCanvas();

    // Particle Constructor
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
            this.baseSize = size;
            this.originalX = x;
            this.originalY = y;
        }

        // Draw particle
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // Update particle physics
        update() {
            // Screen limits bounce
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Normal drifting movement
            this.x += this.directionX;
            this.y += this.directionY;

            // Mouse interaction (Magic dust repelled from cursor)
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    let force = (mouse.radius - distance) / mouse.radius; // Stronger force closer to cursor
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;

                    // Repel particles away from cursor
                    this.x -= forceDirectionX * force * 4.5;
                    this.y -= forceDirectionY * force * 4.5;

                    // Light up particle under cursor influence
                    if (this.color.includes('155') || this.color.includes('9b')) {
                        this.size = this.baseSize * 1.5;
                    }
                } else {
                    // Slowly return size to base
                    if (this.size > this.baseSize) this.size -= 0.1;
                }
            } else {
                if (this.size > this.baseSize) this.size -= 0.1;
            }

            this.draw();
        }
    }

    // Initialize Particles
    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < maxParticles; i++) {
            let size = (Math.random() * 2.5) + 1.2;
            let x = Math.random() * (window.innerWidth - size * 2) + size;
            let y = Math.random() * (window.innerHeight - size * 2) + size;

            // Very slow, drifting speeds
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;

            // Mostly subtle off-blacks, with elegant dark bordeaux accents
            let colorVal = Math.random();
            let color;
            if (colorVal < 0.20) {
                color = 'rgba(155, 15, 22, 0.15)'; // Bordeaux transparent
            } else if (colorVal < 0.40) {
                color = 'rgba(155, 15, 22, 0.08)'; // Deeper bordeaux
            } else {
                color = 'rgba(18, 18, 18, 0.05)';  // Soft slate black
            }

            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Animation Loop
    function animateParticles() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }

        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    /* ==========================================================================
       6. The Gedankenexperiment (Mind Reading Trick Module)
       ========================================================================== */
    const stepChoose = document.getElementById('step-choose');
    const stepProcess = document.getElementById('step-process');
    const stepReveal = document.getElementById('step-reveal');

    const btnNextStep = document.getElementById('btn-next-step');
    const btnRestartTrick = document.getElementById('btn-restart-trick');
    const progressBarFill = document.getElementById('trick-progress');
    const deckCards = document.querySelectorAll('#step-choose .magic-card');

    // Subtle select effect on step 1
    deckCards.forEach(card => {
        card.addEventListener('click', () => {
            // Toggle highlight state on click just as a neat feedback loop, 
            // but the trick is completely mental so we do not save which card is chosen.
            deckCards.forEach(c => c.classList.remove('selected-card'));
            card.classList.add('selected-card');
        });
    });

    // Step 1 to Step 2: The Reading Process
    btnNextStep.addEventListener('click', () => {
        // Change screen with elegant fade
        fadeTransition(stepChoose, stepProcess, () => {
            runScannerProgress();
        });
    });

    // Step 3 Reset Button
    btnRestartTrick.addEventListener('click', () => {
        deckCards.forEach(c => c.classList.remove('selected-card'));
        fadeTransition(stepReveal, stepChoose);
    });

    // Handles elegant tab fading transition
    function fadeTransition(fromStep, toStep, callback) {
        fromStep.style.opacity = '0';
        fromStep.style.transform = 'translateY(-15px)';

        setTimeout(() => {
            fromStep.classList.remove('active');
            toStep.classList.add('active');

            // Force redraw/browser layouts
            toStep.offsetHeight;

            toStep.style.opacity = '1';
            toStep.style.transform = 'translateY(0)';
            if (callback) callback();
        }, 500);
    }

    // Progress Bar Scanning Engine
    function runScannerProgress() {
        let progress = 0;
        progressBarFill.style.width = '0%';

        const interval = setInterval(() => {
            // Speed up slightly as it goes, feeling realistic
            progress += Math.random() * 3 + 1;

            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);

                // Done reading mind, move to reveal step
                setTimeout(() => {
                    fadeTransition(stepProcess, stepReveal);
                }, 400);
            }

            progressBarFill.style.width = `${progress}%`;
        }, 70);
    }

    /* ==========================================================================
       7. Supabase Contact Form Integration
       ========================================================================== */
    const supabaseUrl = 'https://rcmpuqfqlhaioikkrmzm.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjbXB1cWZxbGhhaW9pa2tybXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDUxMDcsImV4cCI6MjA5NjU4MTEwN30.oNz3McJJKUH4KKyZgGHWNAup_Ngn64a0NtVz4oGbiAU';

    // Initialize Supabase only if the script loaded successfully
    if (window.supabase) {
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

        const bookingForm = document.getElementById('booking-form');
        const submitBtn = document.getElementById('form-submit-btn');

        if (bookingForm) {
            bookingForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Visual feedback during submission
                const originalBtnText = submitBtn.textContent;
                submitBtn.textContent = 'Wird gesendet...';
                submitBtn.disabled = true;

                // Gather data from form
                const formData = new FormData(bookingForm);
                const data = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    event_type: formData.get('event-type'),
                    message: formData.get('message')
                };

                try {
                    // Sende an Supabase
                    const supabasePromise = supabase
                        .from('contact_requests')
                        .insert([data]);

                    // Sende an n8n Webhook (OHNE CORS - Bypass)
                    const webhookUrl = 'https://greekdealki.app.n8n.cloud/webhook-test/KI-Takis';

                    // Um CORS zu umgehen, senden wir die Daten als normales Web-Formular (urlencoded)
                    // anstelle von JSON und nutzen den "no-cors" Modus.
                    const urlEncodedData = new URLSearchParams(formData).toString();

                    const n8nPromise = fetch(webhookUrl, {
                        method: 'POST',
                        mode: 'no-cors', // Zwingt den Browser, den CORS-Check zu überspringen
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: urlEncodedData
                    }).catch(e => {
                        console.warn('n8n Netzwerk Fehler:', e);
                        return { type: 'opaque', error: e };
                    });

                    // Warte auf Supabase und n8n
                    const [{ error }, n8nResponse] = await Promise.all([supabasePromise, n8nPromise]);

                    if (error) {
                        console.error('Supabase Error:', error);
                        throw error; // Nur Supabase-Fehler lösen die rote Warnung aus
                    }

                    // Bei "no-cors" können wir die Antwort von n8n nicht lesen (Sicherheit),
                    // aber die Daten kommen sicher an. Daher keine .ok Prüfung mehr.

                    // Success
                    alert('Vielen Dank! Ihre Anfrage wurde erfolgreich gesendet. Takis wird sich in Kürze mit Ihnen in Verbindung setzen.');
                    bookingForm.reset();

                } catch (error) {
                    console.error('Error submitting form:', error);
                    alert('Entschuldigung, es gab ein Problem beim Senden. Bitte überprüfen Sie Ihre Internetverbindung oder versuchen Sie es später noch einmal.');
                } finally {
                    // Restore button state
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }
            });
        }
    } else {
        console.warn('Supabase client could not be loaded.');
    }
});
