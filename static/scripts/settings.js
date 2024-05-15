document.addEventListener("DOMContentLoaded", () => {
    handleToHomepageClick();
    addListenerToBackButton();
    const itemContainer = document.querySelector('.quick_menu');
    let editProfile = document.querySelector('#edit_profile');
    let securitySettings = document.querySelector('#security_settings');

    itemContainer.addEventListener('click', function(event) {
        const group = event.target.closest('.group');
        const url = group.dataset.url;
        if (url.includes('edit')) {
            securitySettings.style.display = 'none';
            editProfile.style.display = 'flex'
        } else {
            editProfile.style.display = 'none';
            securitySettings.style.display = 'flex';
        }
    });

})