// Add footnote previews on hover
document.addEventListener('DOMContentLoaded', function () {
    const footnoteRefs = document.querySelectorAll('.footnote-reference a');

    footnoteRefs.forEach(ref => {
        const href = ref.getAttribute('href');

        if (href && href.startsWith('#')) {
            const footnoteId = href.substring(1);
            const footnoteEl = document.getElementById(footnoteId);

            if (footnoteEl) {
                // Create preview element
                const preview = document.createElement('div');
                preview.className = 'footnote-preview';

                // Extract footnote content (everything after the label)
                const content = footnoteEl.cloneNode(true);
                const label = content.querySelector('.footnote-definition-label');
                if (label) label.remove();

                // Preserve HTML formatting including links
                preview.innerHTML = content.innerHTML.trim();

                // Add preview to the footnote reference parent (the <sup>)
                ref.parentElement.appendChild(preview);

                // Dynamically adjust transform on hover to avoid viewport edges
                const footnoteRef = ref.parentElement;
                footnoteRef.addEventListener('mouseenter', function () {
                    setTimeout(() => {
                        const refRect = footnoteRef.getBoundingClientRect();
                        const previewRect = preview.getBoundingClientRect();

                        // Check if preview would go off left edge
                        const leftEdge = refRect.left + refRect.width / 2 - previewRect.width / 2;
                        const rightEdge = refRect.left + refRect.width / 2 + previewRect.width / 2;
                        const margin = 10;

                        // Clear any previous overrides
                        preview.style.transform = '';
                        preview.style.left = '';
                        preview.style.position = '';

                        if (leftEdge < margin) {
                            // Adjust transform to prevent going off left edge
                            const offset = margin - leftEdge;
                            preview.style.transform = `translateX(calc(-50% + ${offset}px))`;
                        } else if (rightEdge > window.innerWidth - margin) {
                            // Adjust transform to prevent going off right edge
                            const offset = rightEdge - (window.innerWidth - margin);
                            preview.style.transform = `translateX(calc(-50% - ${offset}px))`;
                        }
                    }, 0);
                });
            }
        }
    });
});

// FIXME: wrong because of eccentric orbit, use a real lib for this?
function moonPhaseForDate(date) {
    // Full moon anchor: July 10th, 2025 at 4:37 PM ET
    const fullMoonAnchor = new Date('2025-07-10T16:37:00-04:00');
    const lunarMonth = 29.53058868; // days

    // Calculate days since the anchor full moon
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysSinceFullMoon = (date - fullMoonAnchor) / msPerDay;

    // Calculate phase (0 = new moon, 0.5 = full moon)
    let phase = (daysSinceFullMoon / lunarMonth) % 1;
    if (phase < 0) phase += 1;
    phase = (phase + 0.5) % 1;
    const moonPhases = [
        { emoji: '🌑', name: 'New Moon' },
        { emoji: '🌒', name: 'Waxing Crescent' },
        { emoji: '🌓', name: 'First Quarter' },
        { emoji: '🌔', name: 'Waxing Gibbous' },
        { emoji: '🌕', name: 'Full Moon' },
        { emoji: '🌖', name: 'Waning Gibbous' },
        { emoji: '🌗', name: 'Last Quarter' },
        { emoji: '🌘', name: 'Waning Crescent' }
    ];
    const index = Math.floor((phase + 1 / 16) * 8) % 8;
    return {
        emoji: moonPhases[index].emoji,
        name: moonPhases[index].name,
        phase: phase,
        daysSinceFullMoon: daysSinceFullMoon
    };
}

function updateMoonPhase() {
    const date = new Date();
    const moonData = moonPhaseForDate(date);

    const element = document.getElementById('moon-display');
    if (element) {
        element.textContent = moonData.emoji;// + '\uFE0E';
    } else {
        console.error("Where's #moon-display? :c", moonData.emoji);
    }
}
updateMoonPhase();
