// Image upload functionality
const imageUploadArea = document.getElementById('image-upload-area');
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removeImageBtn = document.getElementById('remove-image');
let selectedFile = null;

// Handle drag and drop
imageUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    imageUploadArea.style.borderColor = '#4682B4';
    imageUploadArea.style.background = '#f0f8ff';
});

imageUploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    imageUploadArea.style.borderColor = '#e5e7eb';
    imageUploadArea.style.background = '#f9fafb';
});

imageUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    imageUploadArea.style.borderColor = '#e5e7eb';
    imageUploadArea.style.background = '#f9fafb';

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

// Handle click to select
imageUploadArea.addEventListener('click', () => {
    imageInput.click();
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB.');
        return;
    }

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        imagePreview.style.display = 'block';
        imageUploadArea.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

removeImageBtn.addEventListener('click', () => {
    selectedFile = null;
    imagePreview.style.display = 'none';
    imageUploadArea.style.display = 'block';
    imageInput.value = '';
});

// Price input validation - only allow digits
document.getElementById('buy-request-form').max_price.addEventListener('input', function(e) {
    // Remove any non-digit characters
    this.value = this.value.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = this.value.split('.');
    if (parts.length > 2) {
        this.value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
        this.value = parts[0] + '.' + parts[1].substring(0, 2);
    }
});

// Prevent non-numeric keys
document.getElementById('buy-request-form').max_price.addEventListener('keypress', function(e) {
    // Allow: backspace, delete, tab, escape, enter, and .
    if ([46, 8, 9, 27, 13, 110, 190].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        (e.keyCode === 90 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        // Let it happen
        return;
    }

    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault();
    }
});

// Form validation
function validateForm(form) {
    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const category = form.category.value;

    if (!title) {
        document.getElementById('buy-request-msg').textContent = "Please enter a title.";
        return false;
    }

    if (!description) {
        document.getElementById('buy-request-msg').textContent = "Please enter a description.";
        return false;
    }

    if (!category || category === "") {
        document.getElementById('buy-request-msg').textContent = "Please select a category.";
        return false;
    }

    return true;
}

document.getElementById('buy-request-form').onsubmit = async function(e) {
    e.preventDefault();

    // Clear previous messages
    document.getElementById('buy-request-msg').textContent = "";

    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        document.getElementById('buy-request-msg').textContent = "Please login first.";
        return;
    }

    const form = e.target;

    // Validate form before submitting
    if (!validateForm(form)) {
        return;
    }

    const formData = new FormData();

    formData.append('user_id', user.id);
    formData.append('title', form.title.value.trim());
    formData.append('description', form.description.value.trim());
    formData.append('category', form.category.value.trim());
    formData.append('max_price', form.max_price.value.trim() || '');
    formData.append('contact_phone', form.contact_phone.value.trim() || '');

    if (selectedFile) {
        formData.append('image', selectedFile);
    }

    try {
        const res = await fetch('http://localhost:3001/api/buy-requests', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        document.getElementById('buy-request-msg').textContent = data.message || data.error;
        if (data.message) {
            form.reset();
            selectedFile = null;
            imagePreview.style.display = 'none';
            imageUploadArea.style.display = 'block';
        }
    } catch (error) {
        document.getElementById('buy-request-msg').textContent = "Error submitting buy request.";
    }
};