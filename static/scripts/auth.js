function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

document.addEventListener('DOMContentLoaded', function() {
    document.location.href = '#auth_form';
    
    let authLink = document.querySelector('.auth_link');
    let regLink = document.querySelector('.reg_link');
    let authForm = document.querySelector('#auth_form');
    let regForm = document.querySelector('#reg_form');

    let activeForm = getCookie('activeForm');

    regLink.addEventListener('click', function(e) {
        authLink.classList.remove('active');
        regLink.classList.add('active');

        document.cookie = `activeForm=registration`;
    });

    authLink.addEventListener('click', function(e) {
        regLink.classList.remove('active');
        authLink.classList.add('active');

        document.cookie = `activeForm=authorization`;
    });
});
