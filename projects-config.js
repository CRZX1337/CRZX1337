// Projects Configuration File
// This file makes it easy to add, remove, or modify projects without touching the main code
// Simply edit this file and your changes will be reflected on the website

// How to add a new project:
// 1. Copy the template below
// 2. Fill in your project details
// 3. Add it to the projects array
// 4. Set visible: true to show it, false to hide it

/*
Project Template:
{
    title: "Your Project Name",
    description: "Detailed description of your project. Explain what it does, key features, and technologies used.",
    tags: ["tag1", "tag2", "tag3"], // Technologies, languages, or keywords
    categories: ["android", "automation", "security"], // Used for filtering (android, automation, security, web, etc.)
    github: "https://github.com/CRZX1337/your-repo",
    demo: "https://your-demo-url.com", // Optional - remove if no demo
    featured: true, // Show in featured section
    visible: true // Show/hide project (easy toggle)
}
*/

// Your Projects - Edit this array to manage your projects
const projectsConfig = [
    {
        title: "DashTime",
        description: "DashTime is a high-precision Android app that tracks vehicle acceleration performance using advanced GPS diagnostics and sensor data. It offers features like precise acceleration timing (0-60 mph/0-100 kmh), detailed performance analysis, dark/light themes, modern Material 3 design, and a demo mode for testing.",
        tags: ["Android", "Kotlin", "Material Design", "GPS", "Performance"],
        categories: ["android"],
        github: "https://github.com/CRZX1337/DashTime",
        featured: true,
        visible: true
    },
    {
        title: "HorizonRevamped",
        description: "A simple Material You app for Android that makes flashing AnyKernel flashable zips easy. Effortlessly install custom kernels and enhance your Android experience with a beautiful, intuitive interface.",
        tags: ["Android", "Kotlin", "Kernel", "Material You", "Root"],
        categories: ["android"],
        github: "https://github.com/CRZX1337/HorizonRevamped",
        featured: true,
        visible: true
    },
    {
        title: "Keybox Generator Bot",
        description: "A Telegram bot providing on-demand generation of secure keyboxes, aimed at improving digital security practices. Features automated keybox creation, secure handling, and easy integration.",
        tags: ["Python", "Telegram", "Security", "Cryptography", "Bot"],
        categories: ["security", "automation"],
        github: "https://github.com/CRZX1337/Keybox-Generator-Telegram-Bot",
        featured: true,
        visible: true
    },
    {
        title: "Termux Start Script",
        description: "An automation script designed for rapid setup of Termux environments, streamlining initial configurations and tool installations. Perfect for penetration testing and development setups.",
        tags: ["Bash", "Automation", "Termux", "Linux", "Setup"],
        categories: ["automation"],
        github: "https://github.com/CRZX1337/Termux-Start-Script",
        featured: true,
        visible: true
    }
    
    // Add your new projects here following the template above
    // Example:
    // {
    //     title: "My New Project",
    //     description: "Description of my awesome new project...",
    //     tags: ["React", "Node.js", "MongoDB"],
    //     categories: ["web"],
    //     github: "https://github.com/CRZX1337/my-new-project",
    //     demo: "https://my-project-demo.com",
    //     featured: true,
    //     visible: true
    // }
];

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = projectsConfig;
} else {
    window.projectsConfig = projectsConfig;
}