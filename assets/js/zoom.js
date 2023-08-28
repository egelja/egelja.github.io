// Initialize medium zoom.
$(document).ready(function() {
    medium_zoom = mediumZoom('[data-zoomable]', {
        background: getComputedStyle(document.documentElement)
            .getPropertyValue('--global-bg-color') + 'ee',  // + 'ee' for trasparency.
        container: {
            top: 64,
            bottom: 42,
        },
    })
});
