document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewCanvas = document.getElementById('previewCanvas');
    const ctx = previewCanvas.getContext('2d');
    const cropOverlay = document.getElementById('cropOverlay');
    const resetButton = document.getElementById('resetButton');
    const downloadButton = document.getElementById('downloadButton');

    let originalImage = null;
    let currentPreset = null;

    // Filter presets
    const presets = {
        modern: {
            contrast: 20,
            brightness: 10,
            saturation: 15,
            temperature: 5,
            filters: ['brightness(1.1)', 'contrast(1.2)', 'saturate(1.15)']
        },
        noir: {
            contrast: 40,
            brightness: -10,
            saturation: -100,
            temperature: -20,
            filters: ['grayscale(1)', 'contrast(1.4)', 'brightness(0.9)']
        },
        vintage: {
            contrast: 10,
            brightness: 5,
            saturation: -20,
            temperature: 15,
            filters: ['sepia(0.3)', 'contrast(1.1)', 'brightness(1.05)']
        },
        scifi: {
            contrast: 30,
            brightness: 15,
            saturation: 20,
            temperature: -30,
            filters: ['hue-rotate(180deg)', 'contrast(1.3)', 'brightness(1.15)']
        },
        horror: {
            contrast: 50,
            brightness: -20,
            saturation: -30,
            temperature: -40,
            filters: ['contrast(1.5)', 'brightness(0.8)', 'saturate(0.7)']
        },
        western: {
            contrast: 25,
            brightness: 5,
            saturation: -10,
            temperature: 30,
            filters: ['sepia(0.4)', 'contrast(1.25)', 'brightness(1.05)']
        }
    };

    // Setup event listeners
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', handleFileDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // Setup control listeners
    document.querySelectorAll('.preset-button').forEach(button => {
        button.addEventListener('click', () => applyPreset(button.dataset.preset));
    });

    document.querySelectorAll('input[type="range"]').forEach(input => {
        input.addEventListener('input', updateImage);
    });

    resetButton.addEventListener('click', resetSettings);
    downloadButton.addEventListener('click', downloadImage);

    function handleFileDrop(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            loadImage(file);
        }
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            loadImage(file);
        }
    }

    function loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalImage = img;
                resetSettings();
                updateImage();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function updateImage() {
        if (!originalImage) return;

        // Calculate 16:9 dimensions
        const targetAspectRatio = 16 / 9;
        let width = originalImage.width;
        let height = originalImage.height;
        let x = 0;
        let y = 0;

        if (width / height > targetAspectRatio) {
            width = height * targetAspectRatio;
            x = (originalImage.width - width) / 2;
        } else {
            height = width / targetAspectRatio;
            y = (originalImage.height - height) / 2;
        }

        // Set canvas size
        previewCanvas.width = 1280; // Standard HD width
        previewCanvas.height = 720; // Standard HD height

        // Clear canvas
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        // Draw image with 16:9 crop
        ctx.drawImage(originalImage, x, y, width, height, 0, 0, previewCanvas.width, previewCanvas.height);

        // Apply filters
        const filterIntensity = document.getElementById('filterIntensity').value / 100;
        const contrast = document.getElementById('contrast').value;
        const brightness = document.getElementById('brightness').value;
        const saturation = document.getElementById('saturation').value;
        const temperature = document.getElementById('temperature').value;

        // Apply basic adjustments
        ctx.filter = `brightness(${1 + brightness/100}) contrast(${1 + contrast/100}) saturate(${1 + saturation/100})`;

        // Apply preset filters if active
        if (currentPreset && presets[currentPreset]) {
            const preset = presets[currentPreset];
            ctx.filter += ' ' + preset.filters.join(' ').replace(/[\d.]+/g, m => m * filterIntensity);
        }

        // Reapply image with filters
        ctx.drawImage(previewCanvas, 0, 0);
        ctx.filter = 'none';

        // Apply temperature (color balance)
        if (temperature !== 0) {
            const imageData = ctx.getImageData(0, 0, previewCanvas.width, previewCanvas.height);
            const data = imageData.data;
            const factor = temperature / 100;

            for (let i = 0; i < data.length; i += 4) {
                data[i] += factor > 0 ? factor * 25.5 : 0; // Red
                data[i + 2] += factor < 0 ? -factor * 25.5 : 0; // Blue
            }

            ctx.putImageData(imageData, 0, 0);
        }
    }

    function applyPreset(preset) {
        document.querySelectorAll('.preset-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === preset);
        });

        if (presets[preset]) {
            currentPreset = preset;
            const settings = presets[preset];

            // Update sliders
            document.getElementById('contrast').value = settings.contrast;
            document.getElementById('brightness').value = settings.brightness;
            document.getElementById('saturation').value = settings.saturation;
            document.getElementById('temperature').value = settings.temperature;

            updateImage();
        }
    }

    function resetSettings() {
        currentPreset = null;
        document.querySelectorAll('.preset-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('input[type="range"]').forEach(input => {
            if (input.id === 'filterIntensity') {
                input.value = 100;
            } else {
                input.value = 0;
            }
        });
        updateImage();
    }

    function downloadImage() {
        if (!originalImage) return;

        const link = document.createElement('a');
        link.download = 'movie-style-image.jpg';
        link.href = previewCanvas.toDataURL('image/jpeg', 0.9);
        link.click();
    }
});