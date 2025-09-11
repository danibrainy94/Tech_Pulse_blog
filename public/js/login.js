$(document).ready(function () {
  // Initialize all components
  initThemeToggle()
  initLoginTypeToggle()
  initPasswordToggles()
  initUserLoginForm()
  initAdminLoginForm()
  initForgotPassword()
})

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

function initPasswordToggles() {
  $('.password-toggle').click(function() {
    const targetId = $(this).data('target')
    const input = $('#' + targetId)
    const icon = $(this).find('i')

    if (input.attr('type') === 'password') {
      input.attr('type', 'text')
      icon.removeClass('fa-eye').addClass('fa-eye-slash')
    } else {
      input.attr('type', 'password')
      icon.removeClass('fa-eye-slash').addClass('fa-eye')
    }
  })
}

function initLoginTypeToggle() {
  const userLoginBtn = $('#userLoginBtn')
  const adminLoginBtn = $('#adminLoginBtn')
  const userForm = $('#userLoginForm')
  const adminForm = $('#adminLoginForm')
  const socialLogin = $('#socialLogin')
  const userFooter = $('#userFooter')
  const adminFooter = $('#adminFooter')
  const loginTitle = $('#loginTitle')
  const loginSubtitle = $('#loginSubtitle')

  userLoginBtn.click(function() {
    // Switch to user login
    userLoginBtn.addClass('active')
    adminLoginBtn.removeClass('active')

    userForm.addClass('active')
    adminForm.removeClass('active')

    socialLogin.show()
    userFooter.show()
    adminFooter.hide()

    loginTitle.text('Welcome Back')
    loginSubtitle.text('Sign in to access your personalized tech experience')
  })

  adminLoginBtn.click(function() {
    // Switch to admin login
    adminLoginBtn.addClass('active')
    userLoginBtn.removeClass('active')

    adminForm.addClass('active')
    userForm.removeClass('active')

    socialLogin.hide()
    adminFooter.show()
    userFooter.hide()

    loginTitle.text('Admin Access')
    loginSubtitle.text('Administrative login for content management')
  })
}

function initUserLoginForm() {
  $('#userLoginForm').submit(function (e) {
    e.preventDefault()

    const email = $('#userEmail').val().trim()
    const password = $('#userPassword').val()
    const errorMessage = $('#errorMessage')
    const successMessage = $('#successMessage')

    // Clear previous messages
    errorMessage.hide()
    successMessage.hide()

    // Basic validation
    if (!email || !password) {
      errorMessage.html('<i class="fas fa-exclamation-triangle"></i> Please enter both email and password')
      errorMessage.show()
      return
    }

    // Show loading state
    const submitBtn = $(this).find('button[type="submit"]')
    submitBtn.addClass('loading')
    submitBtn.prop('disabled', true)

    // Make API call to backend
    fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.user) {
        // Successful login
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userEmail', data.user.email)
        localStorage.setItem('userName', data.user.name)

        // Show success message
        successMessage.html('<i class="fas fa-check-circle"></i> Login successful! Redirecting...')
        successMessage.show()

        // Redirect to homepage after a short delay
        setTimeout(() => {
          window.location.href = './index.html'
        }, 1500)
      } else {
          // Failed login
          const errorMsg = data.error || 'Invalid email or password. Please try again.'
          if (errorMsg.includes('verify your email')) {
              errorMessage.html('<i class="fas fa-exclamation-triangle"></i> ' + errorMsg +
                  '<br><br><a href="./register.html" style="color: var(--accent); text-decoration: underline;">Resend verification code</a>')
          } else {
              errorMessage.html('<i class="fas fa-exclamation-triangle"></i> ' + errorMsg)
          }
          errorMessage.show()
          submitBtn.removeClass('loading')
          submitBtn.prop('disabled', false)
      }
    })
    .catch(error => {
      console.error('Login error:', error)
      errorMessage.html('<i class="fas fa-exclamation-triangle"></i> Login failed. Please try again.')
      errorMessage.show()
      submitBtn.removeClass('loading')
      submitBtn.prop('disabled', false)
    })
  })
}

function initAdminLoginForm() {
  $('#adminLoginForm').submit(function (e) {
    e.preventDefault()

    const username = $('#adminUsername').val().trim()
    const password = $('#adminPassword').val()
    const errorMessage = $('#errorMessage')
    const successMessage = $('#successMessage')

    // Clear previous messages
    errorMessage.hide()
    successMessage.hide()

    // Basic validation
    if (!username || !password) {
      errorMessage.html('<i class="fas fa-exclamation-triangle"></i> Please enter both username and password')
      errorMessage.show()
      return
    }

    // Show loading state
    const submitBtn = $(this).find('button[type="submit"]')
    submitBtn.addClass('loading')
    submitBtn.prop('disabled', true)

    // Make API call to backend
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.admin) {
        // Successful admin login
        localStorage.setItem('isAdminLoggedIn', 'true')
        localStorage.setItem('adminUsername', data.admin.username)

        // Show success message
        successMessage.html('<i class="fas fa-crown"></i> Admin login successful! Redirecting...')
        successMessage.show()

        // Redirect to admin dashboard after a short delay
        setTimeout(() => {
          window.location.href = './admin.html'
        }, 1500)
      } else {
        // Failed login
        errorMessage.html('<i class="fas fa-exclamation-triangle"></i> ' + (data.error || 'Invalid admin credentials. Please try again.'))
        errorMessage.show()
        submitBtn.removeClass('loading')
        submitBtn.prop('disabled', false)
      }
    })
    .catch(error => {
      console.error('Admin login error:', error)
      errorMessage.html('<i class="fas fa-exclamation-triangle"></i> Admin login failed. Please try again.')
      errorMessage.show()
      submitBtn.removeClass('loading')
      submitBtn.prop('disabled', false)
    })
  })
}

function initForgotPassword() {
  $('.forgot-password').click(function (e) {
    e.preventDefault()
    const email = $('#userEmail').val()
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

// Global function for switching back to user login
function switchToUserLogin() {
  $('#userLoginBtn').click()
}
