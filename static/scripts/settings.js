document.addEventListener("DOMContentLoaded", () => {
    handleToHomepageClick();
    addListenerToBackButton();
    const itemContainer = document.querySelector('.quick_menu');
    let editProfile = document.querySelector('#edit_profile');
    let securitySettings = document.querySelector('#security_settings');
    const contentHeader = document.querySelector('.content_header span');

    itemContainer.addEventListener('click', function(event) {
        const group = event.target.closest('.group');
        const url = group.dataset.url;
        if (url.includes('edit')) {
            securitySettings.style.display = 'none';
            editProfile.style.display = 'flex';
            contentHeader.textContent = 'Редактирование профиля';
        } else {
            editProfile.style.display = 'none';
            securitySettings.style.display = 'flex';
            contentHeader.textContent = 'Безопасность';
        }
    });

})