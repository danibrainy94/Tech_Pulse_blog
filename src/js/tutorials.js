$(document).ready(function() {
            // Initialize theme toggle
            initThemeToggle();
            initScrollProgress();
            initBackToTop();
            
            // Load tutorial data from JSON
            loadTutorialData();
            
            function initThemeToggle() {
                const themeToggle = $('#themeToggle');
                const currentTheme = localStorage.getItem('theme') || 'light';
                
                // Apply saved theme
                if (currentTheme === 'dark') {
                    $('body').addClass('dark-mode');
                }
                
                // Toggle theme on click
                themeToggle.click(function() {
                    $('body').toggleClass('dark-mode');
                    
                    // Save preference
                    const theme = $('body').hasClass('dark-mode') ? 'dark' : 'light';
                    localStorage.setItem('theme', theme);
                });
            }
            
            function initScrollProgress() {
                $(window).scroll(function() {
                    const scrollTop = $(this).scrollTop();
                    const scrollHeight = $('body').height() - $(window).height();
                    const scrollPercent = (scrollTop / scrollHeight) * 100;
                    $('#scrollProgress').width(scrollPercent + '%');
                });
            }
            
            function initBackToTop() {
                const backToTop = $('#backToTop');
                
                $(window).scroll(function() {
                    if ($(this).scrollTop() > 500) {
                        backToTop.addClass('show');
                    } else {
                        backToTop.removeClass('show');
                    }
                });
                
                backToTop.click(function() {
                    $('html, body').animate({
                        scrollTop: 0
                    }, 800);
                });
            }
            
            function loadTutorialData() {
                // In a real app, this would be an AJAX call to fetch the JSON
                // For this demo, we'll use a hardcoded version of the JSON data
                const tutorialData = {
                    "tutorials": [
                        {
                            "id": 101,
                            "title": "Building Your First React Component",
                            "category": "Web Development",
                            "level": "Beginner",
                            "duration": "30 min",
                            "excerpt": "Learn the fundamentals of React components, props, and state in this hands-on tutorial.",
                            "image": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
                            "steps": [
                                {
                                    "title": "Setting Up Your Environment",
                                    "content": "First, let's set up your development environment. Install Node.js and create a new React app using Create React App:",
                                    "code": "npx create-react-app my-first-component\ncd my-first-component\nnpm start"
                                },
                                {
                                    "title": "Creating a Basic Component",
                                    "content": "Components are the building blocks of React applications. Let's create a simple functional component:",
                                    "code": "import React from 'react';\n\nfunction Greeting() {\n  return <h1>Hello, React!</h1>;\n}\n\nexport default Greeting;"
                                },
                                {
                                    "title": "Adding Props",
                                    "content": "Props allow you to pass data to components. Let's modify our component to accept a name prop:",
                                    "code": "function Greeting({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\n// Usage:\n// <Greeting name=\"TechPulse\" />"
                                },
                                {
                                    "title": "Managing State",
                                    "content": "Let's add some interactivity using the useState hook:",
                                    "code": "import { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}"
                                },
                                {
                                    "title": "Styling Your Component",
                                    "content": "Let's add some basic styling using CSS modules:",
                                    "code": "// Counter.module.css\n.counter {\n  padding: 20px;\n  border: 1px solid #66999B;\n  border-radius: 8px;\n}\n\n.button {\n  background: #66999B;\n  color: white;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\n// Counter.js\nimport styles from './Counter.module.css';\n\nfunction Counter() {\n  // ... existing code\n  return (\n    <div className={styles.counter}>\n      <p>Count: {count}</p>\n      <button \n        className={styles.button}\n        onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}"
                                }
                            ]
                        },
                        {
                            "id": 102,
                            "title": "Implementing Authentication in React",
                            "category": "Web Development",
                            "level": "Intermediate",
                            "duration": "45 min",
                            "excerpt": "Learn how to add secure authentication to your React application using JWT and context API.",
                            "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
                            "steps": [
                                {
                                    "title": "Setting Up Authentication Context",
                                    "content": "We'll create an authentication context to manage user state throughout our application:",
                                    "code": "import React, { createContext, useState, useEffect, useContext } from 'react';\n\nconst AuthContext = createContext();\n\nexport function AuthProvider({ children }) {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    // Check if user is stored in localStorage\n    const storedUser = localStorage.getItem('user');\n    if (storedUser) {\n      setUser(JSON.parse(storedUser));\n    }\n    setLoading(false);\n  }, []);\n\n  // Login function\n  const login = (userData) => {\n    setUser(userData);\n    localStorage.setItem('user', JSON.stringify(userData));\n  };\n\n  // Logout function\n  const logout = () => {\n    setUser(null);\n    localStorage.removeItem('user');\n  };\n\n  const value = {\n    user,\n    loading,\n    login,\n    logout\n  };\n\n  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;\n}\n\nexport function useAuth() {\n  return useContext(AuthContext);\n}"
                                },
                                {
                                    "title": "Creating API Service",
                                    "content": "Let's create a service to handle authentication requests:",
                                    "code": "const API_URL = 'https://api.yourapp.com/auth';\n\nexport const authService = {\n  async login(email, password) {\n    const response = await fetch(`${API_URL}/login`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ email, password })\n    });\n\n    if (!response.ok) {\n      throw new Error('Login failed');\n    }\n\n    return response.json();\n  },\n\n  async register(userData) {\n    const response = await fetch(`${API_URL}/register`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(userData)\n    });\n\n    if (!response.ok) {\n      throw new Error('Registration failed');\n    }\n\n    return response.json();\n  },\n\n  async getCurrentUser() {\n    const token = localStorage.getItem('token');\n    if (!token) return null;\n\n    const response = await fetch(`${API_URL}/me`, {\n      headers: { 'Authorization': `Bearer ${token}` }\n    });\n\n    if (!response.ok) {\n      localStorage.removeItem('token');\n      return null;\n    }\n\n    return response.json();\n  }\n};"
                                }
                            ]
                        }
                    ]
                };
                
                // Get tutorial ID from URL (in a real app)
                const tutorialId = 101; // For demo purposes
                
                // Find the tutorial
                const tutorial = tutorialData.tutorials.find(t => t.id === tutorialId);
                
                if (tutorial) {
                    // Update header
                    $('#tutorialTitle').text(tutorial.title);
                    $('.tutorial-category').text(tutorial.category);
                    $('.tutorial-meta-row').html(`
                        <div class="tutorial-meta-item">
                            <i class="fas fa-layer-group"></i>
                            <span>${tutorial.category}</span>
                        </div>
                        <div class="tutorial-meta-item">
                            <i class="fas fa-signal"></i>
                            <span>${tutorial.level} Level</span>
                        </div>
                        <div class="tutorial-meta-item">
                            <i class="fas fa-clock"></i>
                            <span>${tutorial.duration} read</span>
                        </div>
                    `);
                    $('#tutorialExcerpt').text(tutorial.excerpt);
                    
                    // Generate steps
                    let stepsHtml = '';
                    tutorial.steps.forEach((step, index) => {
                        stepsHtml += `
                        <div class="step fade-in">
                            <h3 class="step-title">
                                <span class="step-number">${index + 1}</span>
                                ${step.title}
                            </h3>
                            <p>${step.content}</p>
                            <div class="code-block">
                                <code>${escapeHtml(step.code)}</code>
                            </div>
                        </div>
                        `;
                    });
                    
                    $('#tutorialSteps').html(stepsHtml);
                    
                    // Initialize fade-in animations
                    initAnimations();
                }
            }
            
            // Helper function to escape HTML for code display
            function escapeHtml(unsafe) {
                return unsafe
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "<")
                    .replace(/>/g, ">")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }
            
            function initAnimations() {
                // Fade-in animations
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            $(entry.target).addClass('appear');
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    threshold: 0.1
                });
                
                $('.fade-in').each(function() {
                    observer.observe(this);
                });
            }
        });