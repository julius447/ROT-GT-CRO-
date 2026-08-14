
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-highlight]').forEach(function(el) {
        const config = el.dataset.highlight;
        const parts = config.split('-');
        const position = parts[0];
        const count = parseInt(parts[1]);

        const computed = window.getComputedStyle(el);
        const backgroundImage = computed.backgroundImage;
        const textDecoration = computed.textDecorationLine;
        const color = computed.color;

        const hasGradient = backgroundImage && backgroundImage !== 'none' && backgroundImage.includes('gradient');
        const hasUnderline = textDecoration && textDecoration.includes('underline');

        // NEW: Add a class to the parent element if it has a gradient
        if (hasGradient) {
            el.classList.add('has-gradient-highlight');
        }

        // Extract first color from gradient to use on underline
        let underlineColor = color;
        if (hasGradient) {
            const match = backgroundImage.match(/rgba?([^)]+)|#[0-9a-fA-F]+/);
            if (match) underlineColor = match[0];
        }

        let spanStyle = '';
        if (hasGradient) {
            spanStyle += `background: ${backgroundImage}; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;`;
        }
        if (hasUnderline) {
            spanStyle += `text-decoration: underline; text-decoration-color: ${underlineColor}; text-decoration-thickness: 2px; text-underline-offset: 5px;`;
        }

        const words = el.innerHTML.trim().split(' ');

        if (position === 'last') {
            const rest = words.slice(0, words.length - count).join(' ');
            const highlighted = `<span style="${spanStyle}">${words.slice(-count).join(' ')}</span>`;
            el.innerHTML = rest + (rest ? ' ' : '') + highlighted;
        } else if (position === 'first') {
            const highlighted = `<span style="${spanStyle}">${words.slice(0, count).join(' ')}</span>`;
            const rest = words.slice(count).join(' ');
            el.innerHTML = highlighted + (rest ? ' ' : '') + rest;
        }

        if (hasGradient) {
            el.style.backgroundImage = 'none';
            el.style.webkitTextFillColor = 'unset';
        }
        if (hasUnderline) {
            el.style.textDecoration = 'none';
        }
    });
});
