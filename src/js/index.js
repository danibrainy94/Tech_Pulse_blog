$(document).ready(function() {
            // Initialize elements
            initThemeToggle();
            initAnimations();
            initScrollProgress();
            initBackToTop();
            initCategoryTags();
            initFormSubmissions();
            loadArticles();
            
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
            
            function initCategoryTags() {
                $('.category-tag').click(function(e) {
                    e.preventDefault();
                    $('.category-tag').removeClass('active');
                    $(this).addClass('active');
                    
                    const category = $(this).data('category');
                    filterArticles(category);
                });
            }
            
            function initFormSubmissions() {
                // Newsletter form submission
                $('.newsletter-form').submit(function(e) {
                    e.preventDefault();
                    
                    const email = $(this).find('input').val();
                    
                    if (email) {
                        $(this).html('<p style="color: white; font-size: 1.2rem;">✓ Thank you for subscribing!</p>');
                        
                        setTimeout(() => {
                            $(this).html(`
                                <input type="email" placeholder="Your email address" required>
                                <button type="submit">Subscribe</button>
                            `);
                            initFormSubmissions(); // Reinitialize
                        }, 3000);
                    }
                });
            }
            
            // In a real app, this would be an AJAX call to fetch the JSON
            // For this demo, we'll use a hardcoded version of the JSON data
            function loadArticles() {
                const articlesData = {
                    "articles": [
                        {
                            "id": 1,
                            "title": "The Evolution of Generative AI: Beyond ChatGPT",
                            "category": "Artificial Intelligence",
                            "excerpt": "Exploring the next generation of AI models that are transforming creative industries and pushing the boundaries of what's possible.",
                            "author": "Alex Johnson",
                            "authorInitials": "AJ",
                            "date": "June 15, 2023",
                            "image": "https://images.unsplash.com/photo-1667372393152-597576c7b44c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
                            "tags": ["AI", "Machine Learning", "Generative Models", "ChatGPT"]
                        },
                        {
                            "id": 2,
                            "title": "Building Responsive UIs with CSS Container Queries",
                            "category": "Web Development",
                            "excerpt": "Container queries are revolutionizing responsive design. Learn how to implement this powerful new CSS feature in your projects today.",
                            "author": "Sarah Rodriguez",
                            "authorInitials": "SR",
                            "date": "June 10, 2023",
                            "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
                            "tags": ["CSS", "Responsive Design", "Web Development", "Frontend"]
                        },
                        {
                            "id": 3,
                            "title": "Zero Trust Architecture: The Future of Enterprise Security",
                            "category": "Cybersecurity",
                            "excerpt": "As threats evolve, traditional security models fall short. Discover how Zero Trust is becoming the gold standard for protecting digital assets.",
                            "author": "Michael Thompson",
                            "authorInitials": "MT",
                            "date": "June 5, 2023",
                            "image": "https://images.unsplash.com/photo-1563013544-8249a7215d47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
                            "tags": ["Security", "Zero Trust", "Enterprise", "Network Security"]
                        },
                        {
                            "id": 4,
                            "title": "Beyond Cryptocurrency: Real-World Blockchain Applications",
                            "category": "Blockchain",
                            "excerpt": "Blockchain technology is finding applications far beyond digital currencies. Explore innovative use cases transforming supply chains, healthcare, and more.",
                            "author": "Jennifer Parker",
                            "authorInitials": "JP",
                            "date": "May 28, 2023",
                            "image": "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
                            "tags": ["Blockchain", "Distributed Ledger", "Supply Chain", "Healthcare"]
                        },
                        {
                            "id": 5,
                            "title": "Serverless Architecture: Myths vs. Reality",
                            "category": "Cloud Computing",
                            "excerpt": "Serverless computing promises scalability and cost efficiency, but it's not a silver bullet. We separate fact from fiction in this comprehensive guide.",
                            "author": "David Reynolds",
                            "authorInitials": "DR",
                            "date": "May 20, 2023",
                            "image": "https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
                            "tags": ["Cloud", "Serverless", "AWS", "Azure"]
                        },
                        {
                            "id": 6,
                            "title": "Wearable Tech 2023: Beyond Fitness Trackers",
                            "category": "Gadgets",
                            "excerpt": "The next generation of wearables is blurring the line between fashion and functionality. Discover the most innovative devices reshaping our relationship with technology.",
                            "author": "Karen Lee",
                            "authorInitials": "KL",
                            "date": "May 12, 2023",
                            "image": "https://images.unsplash.com/photo-1519389950473-47ba027bb1cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
                            "tags": ["Wearables", "IoT", "Smart Devices", "Health Tech"]
                        },
                        {
                            "id": 7,
                            "title": "The Future of Quantum Computing: What You Need to Know",
                            "category": "Emerging Tech",
                            "excerpt": "Quantum computing is moving from theoretical concept to practical application. Explore the current state and future potential of this revolutionary technology.",
                            "author": "Robert Chen",
                            "authorInitials": "RC",
                            "date": "May 4, 2023",
                            "image": "https://images.unsplash.com/photo-1616530985888-57b3e5bc1e7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
                            "tags": ["Quantum", "Emerging Tech", "Computing", "Future"]
                        },
                        {
                            "id": 8,
                            "title": "Mastering React Performance Optimization",
                            "category": "Web Development",
                            "excerpt": "Learn advanced techniques to optimize React applications for speed and efficiency, from memoization to code splitting and beyond.",
                            "author": "Priya Sharma",
                            "authorInitials": "PS",
                            "date": "April 27, 2023",
                            "image": "https://images.unsplash.com/photo-1611726110994-8a0d78e3b2b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
                            "tags": ["React", "JavaScript", "Performance", "Web Development"]
                        }
                    ]
                };
                
                // Store articles in a global variable for filtering
                window.allArticles = articlesData.articles;
                
                // Render all articles initially
                renderArticles(window.allArticles);
            }
            
            function renderArticles(articles) {
                const postsGrid = $('#postsGrid');
                postsGrid.empty();
                
                if (articles.length === 0) {
                    postsGrid.html(`
                        <div class="section-header" style="margin-top: 2rem;">
                            <h2>No articles found for this category</h2>
                            <p>Try selecting a different category or check back later for new content</p>
                        </div>
                    `);
                    return;
                }
                
                articles.forEach(article => {
                    // Create tag elements
                    let tagsHtml = '';
                    article.tags.forEach(tag => {
                        tagsHtml += `<span class="post-tag">${tag}</span>`;
                    });
                    
                    const articleHtml = `
                        <article class="post-card fade-in" data-id="${article.id}">
                            <div class="post-image">
                                <img src="${article.image}" alt="${article.title}">
                            </div>
                            <div class="post-content">
                                <span class="post-category">${article.category}</span>
                                <a href="#" class="post-title">${article.title}</a>
                                <p class="post-excerpt">${article.excerpt}</p>
                                <div class="post-meta">
                                    <div class="author">
                                        <div class="author-avatar">${article.authorInitials}</div>
                                        <span>${article.author}</span>
                                    </div>
                                    <span>${article.date}</span>
                                </div>
                            </div>
                        </article>
                    `;
                    
                    postsGrid.append(articleHtml);
                });
                
                // Reinitialize animations for new elements
                initAnimations();
            }
            
            function filterArticles(category) {
                if (category === 'all') {
                    renderArticles(window.allArticles);
                    return;
                }
                
                // Convert category to match article categories
                let categoryMap = {
                    'artificial-intelligence': 'Artificial Intelligence',
                    'web-development': 'Web Development',
                    'cybersecurity': 'Cybersecurity',
                    'blockchain': 'Blockchain',
                    'cloud-computing': 'Cloud Computing',
                    'gadgets': 'Gadgets',
                    'emerging-tech': 'Emerging Tech'
                };
                
                const targetCategory = categoryMap[category];
                
                // Filter articles by category
                const filteredArticles = window.allArticles.filter(article => 
                    article.category === targetCategory
                );
                
                renderArticles(filteredArticles);
            }
            
            // Smooth scrolling for navigation links
            $('a[href*="#"]').not('[href="#"]').not('[href="#0"]').click(function(event) {
                if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                    let target = $(this.hash);
                    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                    if (target.length) {
                        event.preventDefault();
                        $('html, body').animate({
                            scrollTop: target.offset().top - 80
                        }, 800);
                    }
                }
            });
        });