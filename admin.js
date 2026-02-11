// --- CONFIGURATION ---
// 1. Replace with your Project URL
const SUPABASE_URL = "https://zypuzywbcswjdnnrktan.supabase.co";

// 2. Replace with your ANON KEY (Starts with 'ey...')
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5cHV6eXdiY3N3amRubnJrdGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDc2NDksImV4cCI6MjA4NjMyMzY0OX0.Y7tg_nqa96rUacMbgj2pY5SML3cJwB3tMHb3B5WDRLg";


// --- INITIALIZATION ---
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- LOGIN ---
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await client.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert("Login Failed: " + error.message);
    } else {
        // Hide Login, Show Admin Panel
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        
        // Load the list of projects
        fetchProjects();
    }
}

// --- 1. UPLOAD OWNER PHOTO (Overwrites 'owner.png') ---
async function uploadOwner() {
    const file = document.getElementById('owner-image').files[0];
    if (!file) { alert("Please select a photo first!"); return; }

    const fileName = 'owner.png';

    // Upload with 'upsert' to overwrite existing file
    const { data, error } = await client
        .storage
        .from('jmech-assets')
        .upload(fileName, file, {
            upsert: true, 
            cacheControl: '0'
        });

    if (error) {
        alert("Error: " + error.message);
    } else {
        alert("Owner Photo Updated! (Refresh your main site to see changes)");
        // Clear input
        document.getElementById('owner-image').value = "";
    }
}

// --- 2. UPLOAD NEW PROJECT ---
async function uploadProject() {
    const title = document.getElementById('project-title').value;
    const category = document.getElementById('project-category').value;
    const file = document.getElementById('project-image').files[0];

    if (!file || !title) { alert("Please fill in all fields"); return; }

    const fileName = `proj-${Date.now()}.png`;

    // A. Upload Image
    const { error: uploadError } = await client.storage.from('jmech-assets').upload(fileName, file);
    if (uploadError) { alert("Upload Error: " + uploadError.message); return; }

    // B. Get Public URL
    const { data: urlData } = client.storage.from('jmech-assets').getPublicUrl(fileName);

    // C. Save to Database
    const { error: dbError } = await client.from('projects').insert([
        { title: title, category: category, image_url: urlData.publicUrl }
    ]);

    if (dbError) {
        alert("Database Error: " + dbError.message);
    } else {
        alert("Project Added Successfully!");
        // Refresh the list to show the new item
        fetchProjects();
        // Clear inputs
        document.getElementById('project-title').value = "";
        document.getElementById('project-image').value = "";
    }
}

// --- 3. FETCH & DISPLAY PROJECTS ---
async function fetchProjects() {
    const listDiv = document.getElementById('project-list');
    listDiv.innerHTML = "<p style='color:#666;'>Loading...</p>";

    const { data: projects, error } = await client
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        listDiv.innerHTML = "Error loading projects.";
        return;
    }

    listDiv.innerHTML = ""; // Clear list

    if (projects.length === 0) {
        listDiv.innerHTML = "<p>No projects found.</p>";
        return;
    }

    projects.forEach(proj => {
        const item = document.createElement('div');
        item.className = 'project-item';
        item.innerHTML = `
            <div>
                <strong style="display:block;">${proj.title}</strong>
                <span style="font-size:12px; color:#666;">${proj.category}</span>
            </div>
            <button class="delete-btn" onclick="deleteProject('${proj.id}')">DELETE</button>
        `;
        listDiv.appendChild(item);
    });
}

// --- 4. DELETE PROJECT ---
async function deleteProject(id) {
    if (!confirm("Are you sure you want to delete this project? This cannot be undone.")) return;

    const { error } = await client.from('projects').delete().eq('id', id);

    if (error) {
        alert("Delete failed: " + error.message);
    } else {
        // Refresh the list
        fetchProjects();
    }

}
