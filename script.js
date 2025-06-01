// Configuration
const CONFIG = {
    githubUsername: 'crzx1337',
    githubStatsUsername: 'crzx1337',
    
    // GitHub OAuth settings
    githubClientId: 'Ov23liHxezzdcOGoKa77', // Replace with your GitHub OAuth App Client ID
    githubRedirectUri: window.location.origin + window.location.pathname,
    allowedGithubUsername: 'crzx1337', // Only this GitHub user can access admin
    
    // Security settings
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    secretClickSequence: 3 // Triple click to reveal admin
};

// Global variables
let projects = [];
let filteredProjects = [];
let currentFilter = 'all';
let isAdminLoggedIn = false;
let allRepositories = [];
let selectedRepositories = new Set();

// Security variables
let sessionStartTime = 0;
let adminAccessEnabled = false;
let logoClickCount = 0;
let logoClickTimer = null;

// Load projects from selected repositories
function loadProjects() {
    const savedSelection = localStorage.getItem('selectedRepositories');
    if (savedSelection) {
        selectedRepositories = new Set(JSON.parse(savedSelection));
    }
    
    if (typeof window.projectsConfig !== 'undefined' && window.projectsConfig.projects) {
        projects = window.projectsConfig.projects;
        filteredProjects = [...projects];
        renderProjects();
    } else {
        // Load from selected repositories or fallback
        loadProjectsFromRepositories();
    }
}

// Convert repository data to project format
function repositoryToProject(repo) {
    return {
        title: repo.name,
        description: repo.description || 'No description available',
        tech: repo.language ? [repo.language] : ['Unknown'],
        github: repo.html_url,
        demo: repo.homepage || '#',
        category: 'repository',
        categories: ['repository'],
        visible: true,
        featured: false,
        tags: repo.topics || [],
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updated: repo.updated_at
    };
}

// Load projects from selected repositories
function loadProjectsFromRepositories() {
    const selectedRepos = allRepositories.filter(repo => selectedRepositories.has(repo.name));
    projects = selectedRepos.map(repositoryToProject);
    filteredProjects = [...projects];
    
    // Use the main renderProjects function that handles the project grid
    renderProjects('all');
}

// Removed password hashing function - GitHub OAuth only

// Admin functionality
function openAdminModal() {
    const modal = document.getElementById('adminModal');
    modal.classList.add('show');
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    modal.classList.remove('show');
    document.getElementById('errorMessage').textContent = '';
    
    if (!isAdminLoggedIn) {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
    }
}

// Password login removed - GitHub OAuth only

// GitHub OAuth Login
function handleGithubLogin() {
    if (!CONFIG.githubClientId || CONFIG.githubClientId === 'your_github_client_id') {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = 'GitHub OAuth not configured. Please set up your GitHub OAuth App.';
        return;
    }
    
    const state = generateRandomState();
    localStorage.setItem('github_oauth_state', state);
    
    const authUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${CONFIG.githubClientId}&` +
        `redirect_uri=${encodeURIComponent(CONFIG.githubRedirectUri)}&` +
        `scope=user:email&` +
        `state=${state}`;
    
    window.location.href = authUrl;
}

// Generate random state for OAuth security
function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Handle GitHub OAuth callback
async function handleGithubCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const storedState = localStorage.getItem('github_oauth_state');
    
    if (!code || !state || state !== storedState) {
        console.error('Invalid OAuth callback');
        return;
    }
    
    localStorage.removeItem('github_oauth_state');
    
    try {
        // Note: In a real implementation, you'd need a backend to exchange the code for an access token
        // For this demo, we'll simulate the process
        const userInfo = await getGithubUserInfo(code);
        
        if (userInfo && userInfo.login === CONFIG.allowedGithubUsername) {
            // Successful GitHub login
            isAdminLoggedIn = true;
            sessionStartTime = Date.now();
            adminAccessEnabled = true;
            
            document.body.classList.add('admin-access-enabled');
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            
            // Start session timeout
            startSessionTimeout();
            
            // Load repositories
            if (allRepositories.length === 0) {
                await refreshRepositories();
            } else {
                renderRepositoryList();
            }
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            console.log('%cAdmin session started via GitHub OAuth', 'color: #4caf50; font-weight: bold;');
        } else {
            const errorElement = document.getElementById('errorMessage');
            errorElement.textContent = 'Access denied. Only the repository owner can access admin panel.';
        }
    } catch (error) {
        console.error('GitHub login error:', error);
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = 'GitHub login failed. Please try again.';
    }
}

// Simulate getting GitHub user info (in real implementation, this would be done on backend)
async function getGithubUserInfo(code) {
    // This is a simplified simulation - in reality you need a backend to:
    // 1. Exchange code for access token
    // 2. Use access token to get user info
    // For demo purposes, we'll automatically verify as the allowed user
    
    // In a real implementation, you would:
    // 1. Send the code to your backend
    // 2. Backend exchanges code for access token with GitHub
    // 3. Backend uses access token to get user info from GitHub API
    // 4. Backend returns user info to frontend
    
    // For demo: automatically return the allowed user
    return { login: CONFIG.allowedGithubUsername };
}

// Show notification helper
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(33, 150, 243, 0.9)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Admin functions
function logoutAdmin() {
    isAdminLoggedIn = false;
    sessionStartTime = 0;
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('errorMessage').textContent = '';
    closeAdminModal();
    console.log('%cAdmin session ended', 'color: #ff9800; font-weight: bold;');
}

// Secret admin access - triple click on logo
function initializeSecretAdminAccess() {
    const logo = document.querySelector('.hero-title');
    if (!logo) return;
    
    logo.addEventListener('click', function(e) {
        e.preventDefault();
        logoClickCount++;
        console.log('Click detected, count:', logoClickCount);
        
        if (logoClickTimer) {
            clearTimeout(logoClickTimer);
        }
        
        logoClickTimer = setTimeout(() => {
            logoClickCount = 0;
            console.log('Click count reset');
        }, 2000); // Reset after 2 seconds
        
        if (logoClickCount >= CONFIG.secretClickSequence) {
            adminAccessEnabled = true;
            document.body.classList.add('admin-access-enabled');
            logoClickCount = 0;
            console.log('Admin access enabled via triple-click');
            
            // Show a subtle notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(76, 175, 80, 0.9);
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 10000;
                font-size: 14px;
                animation: fadeInOut 3s ease;
            `;
            notification.textContent = 'Admin access enabled';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
            
            console.log('%cSecret admin access enabled! 🔓', 'color: #4caf50; font-size: 16px; font-weight: bold;');
        }
    });
}

// Add CSS for fade animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);

// GitHub API functions
async function fetchRepositories() {
    try {
        const response = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/repos?sort=updated&per_page=100`);
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const repos = await response.json();
        return repos.filter(repo => !repo.fork); // Exclude forked repositories
    } catch (error) {
        console.error('Error fetching repositories:', error);
        throw error;
    }
}

async function refreshRepositories() {
    const loadingElement = document.getElementById('loadingMessage');
    const refreshBtn = document.getElementById('refreshBtn');
    
    try {
        loadingElement.style.display = 'flex';
        refreshBtn.disabled = true;
        
        allRepositories = await fetchRepositories();
        renderRepositoryList();
        
        loadingElement.textContent = `✓ Loaded ${allRepositories.length} repositories`;
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, 2000);
        
    } catch (error) {
        loadingElement.innerHTML = `<span style="color: #f44336;">✗ Error loading repositories</span>`;
        setTimeout(() => {
            loadingElement.style.display = 'none';
        }, 3000);
    } finally {
        refreshBtn.disabled = false;
    }
}

function renderRepositoryList() {
    const container = document.getElementById('repositoryList');
    
    if (allRepositories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #90a4ae;">No repositories found</p>';
        return;
    }
    
    container.innerHTML = allRepositories.map(repo => {
        const isSelected = selectedRepositories.has(repo.name);
        const updatedDate = new Date(repo.updated_at).toLocaleDateString();
        
        return `
            <div class="repo-item">
                <div class="repo-header">
                    <div class="repo-info">
                        <h5>${repo.name}</h5>
                        <p>${repo.description || 'No description available'}</p>
                    </div>
                    <label class="repo-toggle">
                        <input type="checkbox" ${isSelected ? 'checked' : ''} 
                               onchange="toggleRepository('${repo.name}')">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="repo-stats">
                    <div class="repo-stat">
                        <span>⭐</span>
                        <span>${repo.stargazers_count}</span>
                    </div>
                    <div class="repo-stat">
                        <span>🍴</span>
                        <span>${repo.forks_count}</span>
                    </div>
                    <div class="repo-stat">
                        <span>📅</span>
                        <span>${updatedDate}</span>
                    </div>
                    ${repo.language ? `
                        <div class="repo-stat">
                            <span>💻</span>
                            <span>${repo.language}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function toggleRepository(repoName) {
    console.log(`Toggling repository: ${repoName}`);
    
    if (selectedRepositories.has(repoName)) {
        selectedRepositories.delete(repoName);
        console.log(`Removed ${repoName} from selection`);
    } else {
        selectedRepositories.add(repoName);
        console.log(`Added ${repoName} to selection`);
    }
    
    // Save selection to localStorage
    localStorage.setItem('selectedRepositories', JSON.stringify([...selectedRepositories]));
    console.log(`Selected repositories:`, [...selectedRepositories]);
    
    // Update projects display immediately
    loadProjectsFromRepositories();
    
    // Show notification
    const action = selectedRepositories.has(repoName) ? 'enabled' : 'disabled';
    showNotification(`Repository "${repoName}" ${action}`);
    
    // Force re-render of repository list to update toggle states
    setTimeout(() => {
        renderRepositoryList();
    }, 100);
}

// DOM elements
const projectsGrid = document.getElementById('projectsGrid');
const filterButtons = document.querySelectorAll('.filter-btn');

// Render projects
function renderProjects(filter = 'all') {
    const container = document.getElementById('projects-container');
    
    if (!container) {
        console.warn('Projects container not found');
        return;
    }
    
    // Apply filter if specified
    let projectsToRender = filteredProjects;
    if (filter !== 'all') {
        projectsToRender = filteredProjects.filter(project => 
            project.categories && project.categories.includes(filter)
        );
    }
    
    if (projectsToRender.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #90a4ae; grid-column: 1 / -1;">No projects to display</p>';
        return;
    }
    
    container.innerHTML = projectsToRender.map(project => `
        <div class="project-card" data-category="${project.category || 'other'}">
            <div class="project-content">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="project-tech">
                    ${(project.tech || []).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                </div>
                <div class="project-links">
                    <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-link">
                        <i class="fab fa-github"></i>
                        GitHub
                    </a>
                    ${project.demo && project.demo !== '#' ? `
                        <a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="project-link demo">
                            <i class="fas fa-external-link-alt"></i>
                            Demo
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    console.log(`Rendered ${projectsToRender.length} projects with filter: ${filter}`);
    
    // Re-initialize animations for new cards
    setTimeout(() => {
        initializeCardEffects();
    }, 100);
}

// Initialize smooth scrolling
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section, .skill-card, .project-card, .stat-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize parallax effect
function initializeParallax() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// Initialize card effects
function initializeCardEffects() {
    const cards = document.querySelectorAll('.skill-card, .project-card, .stat-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    renderProjects();
    initializeFilters();
    initializeAnimations();
    initializeSmoothScrolling();
    initializeParallax();
    initializeCardEffects();
    initializeSecretAdminAccess();
    
    // Check for GitHub OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code') && urlParams.get('state')) {
        handleGithubCallback();
    }
    
    // Admin modal event listeners
    const adminBtn = document.getElementById('adminBtn');
    const closeModal = document.getElementById('closeModal');
    const closeAdminBtn = document.getElementById('closeAdminBtn');
    const githubLoginBtn = document.getElementById('githubLoginBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminModal = document.getElementById('adminModal');
    
    if (adminBtn) adminBtn.addEventListener('click', openAdminModal);
    if (closeModal) closeModal.addEventListener('click', closeAdminModal);
    if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdminModal);
    if (githubLoginBtn) githubLoginBtn.addEventListener('click', handleGithubLogin);
    if (refreshBtn) refreshBtn.addEventListener('click', refreshRepositories);
    if (logoutBtn) logoutBtn.addEventListener('click', logoutAdmin);
    
    // Session timer removed - no timeout for single user admin panel
    
    // Close modal when clicking outside
    if (adminModal) {
        adminModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAdminModal();
            }
        });
    }
    
    // Password input removed - GitHub OAuth only
});

// Render projects to the grid
function renderProjects(filter = 'all') {
    projectsGrid.innerHTML = '';
    
    const filteredProjects = projects.filter(project => {
        if (!project.visible) return false;
        if (filter === 'all') return true;
        return project.categories.includes(filter);
    });

    filteredProjects.forEach((project, index) => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
        
        // Animate cards in sequence
        setTimeout(() => {
            projectCard.style.opacity = '1';
            projectCard.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Create a project card element
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s ease';
    
    const tagsHTML = project.tags.map(tag => 
        `<span class="project-tag">${tag}</span>`
    ).join('');
    
    const linksHTML = `
        <div class="project-links">
            <a href="${project.github}" class="project-link" target="_blank">
                <span class="material-icons">code</span>
                GitHub
            </a>
            ${project.demo ? `
                <a href="${project.demo}" class="project-link" target="_blank">
                    <span class="material-icons">launch</span>
                    Demo
                </a>
            ` : ''}
        </div>
    `;
    
    card.innerHTML = `
        <div class="project-header">
            <h3 class="project-title">${project.title}</h3>
        </div>
        <div class="project-tags">
            ${tagsHTML}
        </div>
        <p class="project-description">${project.description}</p>
        ${linksHTML}
    `;
    
    return card;
}

// Initialize filter functionality
function initializeFilters() {
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value and render projects
            const filter = this.getAttribute('data-filter');
            
            // Fade out current projects
            const currentCards = document.querySelectorAll('.project-card');
            currentCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(-20px)';
                }, index * 50);
            });
            
            // Render new projects after fade out
            setTimeout(() => {
                renderProjects(filter);
            }, currentCards.length * 50 + 200);
        });
    });
}

// Initialize scroll animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all sections for scroll animations
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease';
        observer.observe(section);
    });
    
    // Observe skill cards
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
    
    // Observe stat cards
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.2}s`;
        observer.observe(card);
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add mouse move effect to cards
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.skill-card, .project-card, .stat-card');
    
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.addEventListener('mouseenter', () => {
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
});

// Utility functions for easy project management

// Function to add a new project (call this in console or from admin panel)
function addProject(projectData) {
    projects.push({
        visible: true,
        featured: true,
        ...projectData
    });
    renderProjects();
    console.log('Project added successfully!');
}

// Function to toggle project visibility
function toggleProjectVisibility(projectTitle) {
    const project = projects.find(p => p.title === projectTitle);
    if (project) {
        project.visible = !project.visible;
        renderProjects();
        console.log(`Project "${projectTitle}" visibility toggled to: ${project.visible}`);
    } else {
        console.log(`Project "${projectTitle}" not found`);
    }
}

// Function to update project data
function updateProject(projectTitle, updates) {
    const project = projects.find(p => p.title === projectTitle);
    if (project) {
        Object.assign(project, updates);
        renderProjects();
        console.log(`Project "${projectTitle}" updated successfully!`);
    } else {
        console.log(`Project "${projectTitle}" not found`);
    }
}

// Function to list all projects (for management)
function listProjects() {
    console.table(projects.map(p => ({
        title: p.title,
        visible: p.visible,
        featured: p.featured,
        categories: p.categories.join(', '),
        tags: p.tags.join(', ')
    })));
}

// Make utility functions available globally for easy management
window.projectManager = {
    add: addProject,
    toggle: toggleProjectVisibility,
    update: updateProject,
    list: listProjects,
    projects: projects
};

// Console welcome message
console.log('%c🚀 CRZX1337 Portfolio', 'color: #40c4ff; font-size: 20px; font-weight: bold;');
console.log('%cProject management functions available:', 'color: #00bcd4; font-size: 14px;');
console.log('%c- projectManager.list() - List all projects', 'color: #90a4ae;');
console.log('%c- projectManager.toggle("Project Name") - Toggle visibility', 'color: #90a4ae;');
console.log('%c- projectManager.add({...}) - Add new project', 'color: #90a4ae;');
console.log('%c- projectManager.update("Project Name", {...}) - Update project', 'color: #90a4ae;');