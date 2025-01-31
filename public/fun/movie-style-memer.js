document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const previewCanvas = document.getElementById('previewCanvas');
    const ctx = previewCanvas.getContext('2d');
    const vintageLevel = document.getElementById('vintageLevel');
    const contrastLevel = document.getElementById('contrastLevel');
    const fontSize = document.getElementById('fontSize');
    const fontFamily = document.getElementById('fontFamily');

    let originalImage = null;

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
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    });

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

    // Generate image when text changes
    textInput.addEventListener('input', () => {
        if (originalImage) generateImage();
    });

    // Generate image when filters change
    vintageLevel.addEventListener('input', () => {
        if (originalImage) generateImage();
    });

    contrastLevel.addEventListener('input', () => {
        if (originalImage) generateImage();
    });

    function generateImage() {
        if (!originalImage) return;

        const lines = textInput.value.split('\n').filter(line => line.trim());
        const lineCount = lines.length;

        // Calculate dimensions for 16:9 aspect ratio
        let targetWidth, targetHeight;
        if (originalImage.width / originalImage.height > 16/9) {
            targetHeight = originalImage.height;
            targetWidth = targetHeight * (16/9);
        } else {
            targetWidth = originalImage.width;
            targetHeight = targetWidth * (9/16);
        }

        // Calculate extension height for subtitles
        const extensionHeight = Math.round(targetHeight * 0.1);
        const totalHeight = targetHeight + (extensionHeight * (lineCount - 1));

        // Set canvas dimensions
        previewCanvas.width = targetWidth;
        previewCanvas.height = totalHeight;

        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, previewCanvas.width, totalHeight);

        // Draw cropped and resized image
        const sx = (originalImage.width - targetWidth) / 2;
        const sy = (originalImage.height - targetHeight) / 2;
        ctx.drawImage(originalImage, sx, sy, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);

        // Apply vintage effect
        applyVintageEffect();

        // Draw extended sections and text
        const bottomSection = targetHeight - extensionHeight;
        for (let i = 0; i < lineCount - 1; i++) {
            ctx.drawImage(
                previewCanvas,
                0, bottomSection,
                targetWidth, extensionHeight,
                0, targetHeight + (i * extensionHeight),
                targetWidth, extensionHeight
            );
        }

        // Add text
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textSize = fontSize.value;
        ctx.font = `${textSize}px ${fontFamily.value}`;

        lines.forEach((line, index) => {
            const y = targetHeight - (extensionHeight / 2) + (index * extensionHeight);
            ctx.fillText(line, previewCanvas.width / 2, y);
        });

        downloadBtn.disabled = false;
    }

    function applyVintageEffect() {
        const imageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
        const data = imageData.data;
        const vintage = vintageLevel.value / 100;
        const contrast = contrastLevel.value / 100;

        for (let i = 0; i < data.length; i += 4) {
            // Apply sepia effect
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            data[i] = Math.min(255, (r * (1 - 0.607 * vintage) + (r * 0.769 + g * 0.686 + b * 0.534) * vintage) * contrast);
            data[i + 1] = Math.min(255, (g * (1 - 0.607 * vintage) + (r * 0.676 + g * 0.732 + b * 0.534) * vintage) * contrast);
            data[i + 2] = Math.min(255, (b * (1 - 0.607 * vintage) + (r * 0.545 + g * 0.686 + b * 0.686) * vintage) * contrast);
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Handle download
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'movie-style-meme.png';
        link.href = previewCanvas.toDataURL('image/png');
        link.click();
    });
});