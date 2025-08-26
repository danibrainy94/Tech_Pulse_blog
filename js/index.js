$(document).ready(function () {
  // Initialize elements
  initThemeToggle()
  initAnimations()
  initScrollProgress()
  initBackToTop()
  initCategoryTags()
  initFormSubmissions()
  loadArticles()

  function initThemeToggle () {
    const themeToggle = $('#themeToggle')
    const currentTheme = localStorage.getItem('theme') || 'light'

    // Apply saved theme
    if (currentTheme === 'dark') {
      $('body').addClass('dark-mode')
    }

    // Toggle theme on click
    themeToggle.click(function () {
      $('body').toggleClass('dark-mode')

      // Save preference
      const theme = $('body').hasClass('dark-mode') ? 'dark' : 'light'
      localStorage.setItem('theme', theme)
    })
  }

  function initAnimations () {
    // Fade-in animations
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            $(entry.target).addClass('appear')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1
      }
    )

    $('.fade-in').each(function () {
      observer.observe(this)
    })
  }

  function initScrollProgress () {
    $(window).scroll(function () {
      const scrollTop = $(this).scrollTop()
      const scrollHeight = $('body').height() - $(window).height()
      const scrollPercent = (scrollTop / scrollHeight) * 100
      $('#scrollProgress').width(scrollPercent + '%')
    })
  }

  function initBackToTop () {
    const backToTop = $('#backToTop')

    $(window).scroll(function () {
      if ($(this).scrollTop() > 500) {
        backToTop.addClass('show')
      } else {
        backToTop.removeClass('show')
      }
    })

    backToTop.click(function () {
      $('html, body').animate(
        {
          scrollTop: 0
        },
        900
      )
    })
  }

  function initCategoryTags () {
    $('.category-tag').click(function (e) {
      e.preventDefault()
      $('.category-tag').removeClass('active')
      $(this).addClass('active')

      const category = $(this).data('category')
      filterArticles(category)
    })
  }

  function initFormSubmissions () {
    // Newsletter form submission
    $('.newsletter-form').submit(function (e) {
      e.preventDefault()

      const email = $(this).find('input').val()

      if (email) {
        $(this).html(
          '<p style="color: white; font-size: 1.2rem;">✓ Thank you for subscribing!</p>'
        )

        setTimeout(() => {
          $(this).html(`
                                <input type="email" placeholder="Your email address" required>
                                <button type="submit">Subscribe</button>
                            `)
          initFormSubmissions() // Reinitialize
        }, 3000)
      }
    })
  }

  function loadArticles () {
    $.ajax({
      url: 'articles.json',
      method: 'GET',
      dataType: 'json',
      success: function (articlesData) {
        window.allArticles = articlesData.articles
        renderArticles(window.allArticles)
      },
      error: function () {
        $('#postsGrid').html(`
                            <div class="section-header" style="margin-top: 2rem;">
                                <h2>Failed to load articles</h2>
                                <p>Please try again later.</p>
                            </div>
                        `)
      }
    })
  }

  function renderArticles (articles) {
    const postsGrid = $('#postsGrid')
    postsGrid.empty()

    if (articles.length === 0) {
      postsGrid.html(`
                        <div class="section-header" style="margin-top: 2rem;">
                            <h2>No articles found for this category</h2>
                            <p>Try selecting a different category or check back later for new content</p>
                        </div>
                    `)
      return
    }

    articles.forEach(article => {
      // Create tag elements
      let tagsHtml = ''
      article.tags.forEach(tag => {
        tagsHtml += `<span class="post-tag">${tag}</span>`
      })

      const articleHtml = `
                        <article class="post-card fade-in" data-id="${article.id}">
                            <div class="post-image">
                                <img src="${article.image}" alt="${article.title}">
                            </div>
                            <div class="post-content">
                                <span class="post-category">${article.category}</span>
                                <a href="#" class="post-title" id="post-title">${article.title}</a>
                                <p class="post-excerpt">${article.excerpt}</p>
                                <div class="post-tags">${tagsHtml}</div>
                                <div class="post-meta">
                                    <div class="author">
                                        <div class="author-avatar">${article.authorInitials}</div>
                                        <span>${article.author}</span>
                                    </div>
                                    <span>${article.date}</span>
                                </div>
                            </div>
                        </article>
                    `

      postsGrid.append(articleHtml)
    })

    // Reinitialize animations for new elements
    initAnimations()
  }

  function filterArticles (category) {
    if (category === 'all') {
      renderArticles(window.allArticles)
      return
    }

    // Convert category to match article categories
    let categoryMap = {
      'artificial-intelligence': 'Artificial Intelligence',
      'web-development': 'Web Development',
      cybersecurity: 'Cybersecurity',
      blockchain: 'Blockchain',
      'cloud-computing': 'Cloud Computing',
      gadgets: 'Gadgets',
      'emerging-tech': 'Emerging Tech'
    }

    const targetCategory = categoryMap[category]

    // Filter articles by category
    const filteredArticles = window.allArticles.filter(
      article => article.category === targetCategory
    )

    renderArticles(filteredArticles)
  }

  // Smooth scrolling for navigation links
  $('a[href*="#"]')
    .not('[href="#"]')
    .not('[href="#0"]')
    .click(function (event) {
      if (
        location.pathname.replace(/^\//, '') ==
          this.pathname.replace(/^\//, '') &&
        location.hostname == this.hostname
      ) {
        let target = $(this.hash)
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']')
        if (target.length) {
          event.preventDefault()
          $('html, body').animate(
            {
              scrollTop: target.offset().top - 80
            },
            800
          )
        }
      }
    })
})


$('#postsGrid').on('click', '.post-title', function(e) {
    e.preventDefault();
    const articleId = $(this).closest('.post-card').data('id');
    window.location.href = `./article-info.html?id=${articleId}`;
});



// $('#postsGrid').on('click', '.post-title', function(e) {
//     e.preventDefault();
//     window.location.href = './article-info.html';
// });

//   "tutorials": [
//     {
//       "id": 101,
//       "title": "Building Your First React Component",
//       "category": "Web Development",
//       "level": "Beginner",
//       "duration": "30 min",
//       "excerpt": "Learn the fundamentals of React components, props, and state in this hands-on tutorial.",
//       "image": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
//       "steps": [
//         {
//           "title": "Setting Up Your Environment",
//           "content": "First, let's set up your development environment. Install Node.js and create a new React app using Create React App:\n\n```bash\nnpx create-react-app my-first-component\ncd my-first-component\nnpm start\n```",
//           "code": "npx create-react-app my-first-component\ncd my-first-component\nnpm start"
//         },
//         {
//           "title": "Creating a Basic Component",
//           "content": "Components are the building blocks of React applications. Let's create a simple functional component:",
//           "code": "import React from 'react';\n\nfunction Greeting() {\n  return <h1>Hello, React!</h1>;\n}\n\nexport default Greeting;"
//         },
//         {
//           "title": "Adding Props",
//           "content": "Props allow you to pass data to components. Let's modify our component to accept a name prop:",
//           "code": "function Greeting({ name }) {\n  return <h1>Hello, {name}!</h1>;\n}\n\n// Usage:\n// <Greeting name=\"TechPulse\" />"
//         },
//         {
//           "title": "Managing State",
//           "content": "Let's add some interactivity using the useState hook:",
//           "code": "import { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}"
//         },
//         {
//           "title": "Styling Your Component",
//           "content": "Let's add some basic styling using CSS modules:",
//           "code": "// Counter.module.css\n.counter {\n  padding: 20px;\n  border: 1px solid #66999B;\n  border-radius: 8px;\n}\n\n.button {\n  background: #66999B;\n  color: white;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\n// Counter.js\nimport styles from './Counter.module.css';\n\nfunction Counter() {\n  // ... existing code\n  return (\n    <div className={styles.counter}>\n      <p>Count: {count}</p>\n      <button \n        className={styles.button}\n        onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}"
//         }
//       ]
//     },
//     {
//       "id": 102,
//       "title": "Implementing Authentication in React",
//       "category": "Web Development",
//       "level": "Intermediate",
//       "duration": "45 min",
//       "excerpt": "Learn how to add secure authentication to your React application using JWT and context API.",
//       "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
//       "steps": [
//         {
//           "title": "Setting Up Authentication Context",
//           "content": "We'll create an authentication context to manage user state throughout our application:",
//           "code": "import React, { createContext, useState, useEffect, useContext } from 'react';\n\nconst AuthContext = createContext();\n\nexport function AuthProvider({ children }) {\n  const [user, setUser] = useState(null);\n  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {\n    // Check if user is stored in localStorage\n    const storedUser = localStorage.getItem('user');\n    if (storedUser) {\n      setUser(JSON.parse(storedUser));\n    }\n    setLoading(false);\n  }, []);\n\n  // Login function\n  const login = (userData) => {\n    setUser(userData);\n    localStorage.setItem('user', JSON.stringify(userData));\n  };\n\n  // Logout function\n  const logout = () => {\n    setUser(null);\n    localStorage.removeItem('user');\n  };\n\n  const value = {\n    user,\n    loading,\n    login,\n    logout\n  };\n\n  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;\n}\n\nexport function useAuth() {\n  return useContext(AuthContext);\n}"
//         },
//         {
//           "title": "Creating API Service",
//           "content": "Let's create a service to handle authentication requests:",
//           "code": "const API_URL = 'https://api.yourapp.com/auth';\n\nexport const authService = {\n  async login(email, password) {\n    const response = await fetch(`${API_URL}/login`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ email, password })\n    });\n\n    if (!response.ok) {\n      throw new Error('Login failed');\n    }\n\n    return response.json();\n  },\n\n  async register(userData) {\n    const response = await fetch(`${API_URL}/register`, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify(userData)\n    });\n\n    if (!response.ok) {\n      throw new Error('Registration failed');\n    }\n\n    return response.json();\n  },\n\n  async getCurrentUser() {\n    const token = localStorage.getItem('token');\n    if (!token) return null;\n\n    const response = await fetch(`${API_URL}/me`, {\n      headers: { 'Authorization': `Bearer ${token}` }\n    });\n\n    if (!response.ok) {\n      localStorage.removeItem('token');\n      return null;\n    }\n\n    return response.json();\n  }\n};"
//         },
//         {
//           "title": "Building Login Form",
//           "content": "Create a login form component that uses our authentication service:",
//           "code": "import React, { useState } from 'react';\nimport { authService } from '../services/authService';\nimport { useAuth } from '../context/AuthContext';\n\nfunction LoginForm() {\n  const [email, setEmail] = useState('');\n  const [password, setPassword] = useState('');\n  const [error, setError] = useState('');\n  const { login } = useAuth();\n\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    \n    try {\n      const data = await authService.login(email, password);\n      login(data.user);\n      // Redirect to dashboard\n    } catch (err) {\n      setError('Invalid email or password');\n    }\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n      {error && <div className=\"error\">{error}</div>}\n      \n      <div className=\"form-group\">\n        <label>Email</label>\n        <input \n          type=\"email\"\n          value={email}\n          onChange={(e) => setEmail(e.target.value)}\n          required\n        />\n      </div>\n\n      <div className=\"form-group\">\n        <label>Password</label>\n        <input\n          type=\"password\"\n          value={password}\n          onChange={(e) => setPassword(e.target.value)}\n          required\n        />\n      </div>\n\n      <button type=\"submit\" className=\"btn\">Login</button>\n    </form>\n  );\n}"
//         },
//         {
//           "title": "Protecting Routes",
//           "content": "Create a higher-order component to protect routes that require authentication:",
//           "code": "import React from 'react';\nimport { Redirect, Route } from 'react-router-dom';\nimport { useAuth } from '../context/AuthContext';\n\nexport function PrivateRoute({ children, ...rest }) {\n  const { user, loading } = useAuth();\n\n  if (loading) {\n    return <div>Loading...</div>;\n  }\n\n  return (\n    <Route\n      {...rest}\n      render={({ location }) =>\n        user ? (\n          children\n        ) : (\n          <Redirect\n            to={{\n              pathname: '/login',\n              state: { from: location }\n            }}\n          />\n        )\n      }\n    />\n  );\n}\n\n// Usage:\n// <PrivateRoute path=\"/dashboard\">\n//   <Dashboard />\n// </PrivateRoute>"
//         },
//         {
//         "title": "Adding Authentication to API Calls",
//         "content": "Create an axios instance that automatically adds the authentication token to requests:",
//           "code": "import axios from 'axios';\nimport { useAuth } from './context/AuthContext';\n\nconst api = axios.create({\n  baseURL: 'https://api.yourapp.com',\n});\n\n// Request interceptor to add auth token\napi.interceptors.request.use(\n  (config) => {\n    const { user } = useAuth();\n    if (user && user.token) {\n      config.headers.Authorization = `Bearer ${user.token}`;\n    }\n    return config;\n  },\n  (error) => {\n    return Promise.reject(error);\n  }\n);\n\n// Response interceptor to handle token expiration\napi.interceptors.response.use(\n  (response) => response,\n  async (error) => {\n    const originalRequest = error.config;\n\n    if (error.response.status === 401 && !originalRequest._retry) {\n      originalRequest._retry = true;\n      \n      // Try to refresh token\n      try {\n        const { data } = await authService.refreshToken();\n        // Save new token\n        // Retry original request\n        return api(originalRequest);\n      } catch (err) {\n        // Logout user if refresh fails\n        const { logout } = useAuth();\n        logout();\n        return Promise.reject(err);\n      }\n    }\n\n    return Promise.reject(error);\n  }\n);\n\nexport default api;"
//         }
//       ]
//     }
//   ]
// }
