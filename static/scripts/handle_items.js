function deleteItem(item) {
    item.remove();
    console.log('Delete item:', item);
}

function changePathTo(item, prefix) {
    let hash = item.dataset.url;
    console.log('Redirect to ' + hash);
    window.location.href = `/${prefix}${hash}`;
}

function addItemListenerToContainer(container) {
    const itemContainer = document.querySelector(container);

    itemContainer.addEventListener('click', function (event) {
        const item = event.target.closest('.item');
        if (!item) return;

        if (event.target.classList.contains('delete_button')) {
            deleteItem(item);
        } else if (item.classList.contains('link')) {
            let url = item.dataset.url;
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }
            window.open(url, '_blank');
        } else if (item.classList.contains('group')) {
            changePathTo(item, 'group/');
        }
    });
}