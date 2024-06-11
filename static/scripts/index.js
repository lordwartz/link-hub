document.addEventListener("DOMContentLoaded", function() {
    addItemListenerToContainer('.main_groups');
    addItemListenerToContainer('.quick_menu');
    addItemListenerToSideNavBtn();
    handleLogoCloseSideMenu();
});