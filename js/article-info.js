// open up the articles page at the click of the title

$('#postsGrid').on('click', '.post-title', function(e) {
    e.preventDefault();
    window.location.href = './article-info.html';
});