document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const previewCanvas = document.getElementById('previewCanvas');
    const ctx = previewCanvas.getContext('2d');

    let originalImage = null;

    // Set default text
    textInput.value = "This meme tool is pretty fun\nI actually said this.\nBelieve me.";

    // Load default image
    const defaultImg = new Image();
    defaultImg.onload = () => {
        originalImage = defaultImg;
        generateBtn.disabled = false;
        generateImage();
    };
    defaultImg.src = '/static/elon-musk-interview.jpg';

    // Handle drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary-color)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--border-color)';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });

    // Handle click to upload
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });

    // Handle image upload
    function handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                generateBtn.disabled = false;
                generateImage();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Generate image with text
    function generateImage() {
        if (!originalImage) return;

        const lines = textInput.value.split('\n').filter(line => line.trim());
        const lineCount = lines.length;

        // Calculate dimensions
        const originalHeight = originalImage.height;
        const extensionHeight = Math.round(originalHeight * 0.15);
        const totalHeight = originalHeight + (extensionHeight * (lineCount - 1));

        // Set canvas dimensions
        previewCanvas.width = originalImage.width;
        previewCanvas.height = totalHeight;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, previewCanvas.width, totalHeight);

        // Draw original image
        ctx.drawImage(originalImage, 0, 0);

        // Draw extended sections and text
        const bottomSection = originalHeight - extensionHeight;
        for (let i = 0; i < lineCount - 1; i++) {
            ctx.drawImage(
                previewCanvas,
                0, bottomSection,
                originalImage.width, extensionHeight,
                0, originalHeight + (i * extensionHeight),
                originalImage.width, extensionHeight
            );
        }

        // Add text
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const fontSize = Math.round(extensionHeight * 0.4);
        ctx.font = `${fontSize}px Arial`;

        lines.forEach((line, index) => {
            const y = originalHeight - (extensionHeight / 2) + (index * extensionHeight);
            ctx.fillText(line, previewCanvas.width / 2, y);
        });

        downloadBtn.disabled = false;
    }

    // Handle text input changes
    textInput.addEventListener('input', () => {
        if (originalImage) {
            generateImage();
        }
    });

    // Handle download
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'image-with-text.png';
        link.href = previewCanvas.toDataURL('image/png');
        link.click();
    });
});