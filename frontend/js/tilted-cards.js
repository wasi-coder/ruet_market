// ===== Tilted Card Effect =====
class TiltedCard {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            rotateAmplitude: options.rotateAmplitude || 12,
            scaleOnHover: options.scaleOnHover || 1.1,
            ...options
        };

        this.init();
    }

    init() {
        this.element.style.transformStyle = 'preserve-3d';
        this.element.style.transition = 'transform 0.3s ease';

        this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.element.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
        this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }

    handleMouseMove(e) {
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const offsetX = e.clientX - centerX;
        const offsetY = e.clientY - centerY;

        const rotateX = (offsetY / (rect.height / 2)) * -this.options.rotateAmplitude;
        const rotateY = (offsetX / (rect.width / 2)) * this.options.rotateAmplitude;

        this.element.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${this.options.scaleOnHover})`;
    }

    handleMouseEnter() {
        this.element.style.transform = `perspective(800px) scale(${this.options.scaleOnHover})`;
    }

    handleMouseLeave() {
        this.element.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
}

// Initialize tilted cards on page load
document.addEventListener('DOMContentLoaded', () => {
    // Apply to department cards
    const departmentCards = document.querySelectorAll('.department-card');
    departmentCards.forEach(card => {
        new TiltedCard(card, { rotateAmplitude: 10, scaleOnHover: 1.05 });
    });

    // Apply to category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        new TiltedCard(card, { rotateAmplitude: 8, scaleOnHover: 1.03 });
    });

    // Apply to product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        new TiltedCard(card, { rotateAmplitude: 6, scaleOnHover: 1.02 });
    });
});