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