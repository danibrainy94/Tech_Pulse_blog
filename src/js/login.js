$(document).ready(function () {
  // Initialize theme toggle
  initThemeToggle()
  handleFormSubmission()

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

  function handleFormSubmission () {
    $('#loginForm').submit(function (e) {
      e.preventDefault()

      const email = $('#email').val()
      const password = $('#password').val()
      const errorMessage = $('#errorMessage')

      // Clear previous messages
      errorMessage.hide()
      errorMessage.text('')

      // Basic validation
      if (!email || !password) {
        errorMessage.text('Please enter both email and password')
        errorMessage.show()
        return
      }

      // Show loading state
      const submitBtn = $(this).find('button[type="submit"]')
      const originalText = submitBtn.html()
      submitBtn.html('<i class="fas fa-spinner fa-spin"></i> Signing In...')
      submitBtn.prop('disabled', true)

      // Simulate API call
      setTimeout(() => {
        // In a real app, you would validate with a server
        // For this demo, we'll check against a hardcoded user
        if (email === 'user@example.com' && password === 'password123') {
          // Successful login
          localStorage.setItem('isLoggedIn', 'true')
          localStorage.setItem('userEmail', email)
          localStorage.setItem('userName', 'John Doe')

          // Redirect to homepage
          window.location.href = '/src/index.html'
        } else {
          // Failed login
          errorMessage.text('Invalid email or password. Please try again.')
          errorMessage.show()
          submitBtn.html(originalText)
          submitBtn.prop('disabled', false)
        }
      }, 1000)
    })

    // Forgot password handling
    $('.forgot-password').click(function (e) {
      e.preventDefault()
      const email = $('#email').val()
      const errorMessage = $('#errorMessage')
      const successMessage = $('#successMessage')

      errorMessage.hide()
      successMessage.hide()

      if (!email) {
        errorMessage.text('Please enter your email address first')
        errorMessage.show()
        return
      }

      // Show loading
      $('.forgot-password').html('<i class="fas fa-spinner fa-spin"></i>')

      // Simulate password reset
      setTimeout(() => {
        successMessage.html(
          `Password reset instructions have been sent to <strong>${email}</strong>`
        )
        successMessage.show()
        $('.forgot-password').html('Forgot password?')
      }, 800)
    })
  }
})
