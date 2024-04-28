function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

document.addEventListener('DOMContentLoaded', function() {
    let logLink = document.querySelector('.auth_link');
    let regLink = document.querySelector('.reg_link');
    let loginForm = document.querySelector('.login_form');
    let regForm = document.querySelector('.reg_form');
    let regLine = document.querySelector('.line#reg');
    let loginLine = document.querySelector('.line#login');

    let activeForm = getCookie('activeForm');

    regLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        regForm.style.display = 'flex';
        logLink.classList.add('inactive');
        regLink.classList.remove('inactive');
        loginLine.classList.add('inactive');
        regLine.classList.remove('inactive');

        document.cookie = `activeForm=registration`;
    });

    logLink.addEventListener('click', function(e) {
        e.preventDefault();
        regForm.style.display = 'none';
        loginForm.style.display = 'flex';
        regLink.classList.add('inactive');
        logLink.classList.remove('inactive');
        regLine.classList.add('inactive');
        loginLine.classList.remove('inactive');

        document.cookie = `activeForm=authorization`;
    });

    if (activeForm !== 'registration') {
        logLink.click();
    }
});
