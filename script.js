document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.cursor-follower');
    const links = document.querySelectorAll('a, button');

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Immediate update for the main cursor dot
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });

    // Smooth follow effect for the follower circle
    function animateFollower() {
        // Linear interpolation for smooth movement
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;

        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';

        requestAnimationFrame(animateFollower);
    }

    animateFollower();

    // Hover effects
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
            follower.style.transform = 'translate(-50%, -50%) scale(0.5)';
        });

        link.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
            follower.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });

    // Add entry animation classes if not already present
    // (CSS handles the animation, this ensures elements are ready)
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
        // Optional: add stagger effect via JS if CSS delays aren't enough
        // el.style.animationDelay = `${index * 0.1}s`;
    });
});
