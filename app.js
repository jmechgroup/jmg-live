// ==========================================
// 1. CONFIGURATION
// ==========================================
// Go to Supabase > Project Settings > API to get these keys
const SUPABASE_URL = "https://zypuzywbcswjdnnrktan.supabase.co";
const SUPABASE_KEY = "sb_publishable_VsoMjmxXH2QBTMHlABvkUw_-AlWUgZM";

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 2. FETCH REAL DATA FROM DATABASE
// ==========================================

async function loadCertificates() {
    const container = document.getElementById('cert-grid');
    if (!container) return; // Exit if not on homepage

    // Fetch from 'certificates' table
    const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error loading certs:", error);
        container.innerHTML = '<p>Failed to load certificates.</p>';
        return;
    }

    // Render Items
    container.innerHTML = ''; 
    if (data.length === 0) {
        container.innerHTML = '<p>No certificates uploaded yet.</p>';
    }

    data.forEach(item => {
        container.innerHTML += `
            <div class="card">
                <img src="${item.image_url}" alt="${item.title}">
                <div class="card-body">
                    <h3>${item.title}</h3>
                </div>
            </div>
        `;
    });
}

async function loadGallery() {
    const container = document.getElementById('gallery-grid');
    if (!container) return; // Exit if not on gallery section/page

    // Fetch from 'gallery' table
    const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error loading gallery:", error);
        container.innerHTML = '<p>Failed to load gallery.</p>';
        return;
    }

    // Render Items
    container.innerHTML = '';
    if (data.length === 0) {
        container.innerHTML = '<p>No projects uploaded yet.</p>';
    }

    data.forEach(item => {
        container.innerHTML += `
            <div class="card">
                <img src="${item.image_url}" alt="Project">
                <div class="card-body">
                    <h4>${item.description}</h4>
                </div>
            </div>
        `;
    });
}

// ==========================================
// 3. CONTACT FORM (VERCEL BACKEND)
// ==========================================

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Stop page refresh

        const btn = document.getElementById('send-btn');
        const status = document.getElementById('form-status');
        
        // 1. UI Feedback (Loading)
        const originalText = btn.innerText;
        btn.innerText = 'Sending...';
        btn.disabled = true;
        status.innerText = "";

        // 2. Gather Data
        const formData = {
            name: document.getElementById('user_name').value,
            email: document.getElementById('user_email').value,
            message: document.getElementById('message').value
        };

        try {
            // 3. Send to Vercel Serverless Function
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            // 4. Handle Response
            if (response.ok) {
                btn.innerText = 'Sent!';
                status.innerText = "Message sent successfully!";
                status.style.color = "green";
                contactForm.reset();
                
                // Reset button after 3 seconds
                setTimeout(() => { 
                    btn.innerText = originalText; 
                    btn.disabled = false; 
                }, 3000);
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error(error);
            btn.innerText = 'Try Again';
            btn.disabled = false;
            status.innerText = "Error sending message. Please email us directly.";
            status.style.color = "red";
        }
    });
}

// ==========================================
// 4. INITIALIZATION
// ==========================================
window.onload = function() {
    // Load Data
    loadCertificates();
    loadGallery();
    
    // Setup Listeners
    setupContactForm();
}