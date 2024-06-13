function handleToHomepageClick() {
    const logo = document.querySelector('#logo');
    logo.addEventListener('click', () => {
        window.location.href = '/';
    })
}

function addListenerToBackButton() {
    const btn = document.querySelector('.back');
    btn.addEventListener('click', () => {
        history.back();
    })
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}