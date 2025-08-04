
class AdvancedPDFMerger {
    constructor() {
        this.files = [];
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.create3DScene();
        this.startStatsCounter();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadZone = document.getElementById('uploadZone');
        const mergeBtn = document.getElementById('mergeBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');
        const previewBtn = document.getElementById('previewBtn');
        const sortBtn = document.getElementById('sortBtn');

        // File input
        fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // Drag and drop with enhanced effects
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', (e) => {
            if (!uploadZone.contains(e.relatedTarget)) {
                uploadZone.classList.remove('dragover');
            }
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Button events
        mergeBtn.addEventListener('click', () => this.mergePDFs());
        clearAllBtn.addEventListener('click', () => this.clearAllFiles());
        previewBtn.addEventListener('click', () => this.previewFiles());
        sortBtn.addEventListener('click', () => this.sortFiles());
    }

    create3DScene() {
        const container = document.getElementById('canvasContainer');
        if (!container || window.innerWidth < 768) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // Create floating PDF icons
        const geometry = new THREE.BoxGeometry(1, 1.4, 0.1);
        const material = new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            transparent: true,
            opacity: 0.8
        });

        const pdfs = [];
        for (let i = 0; i < 5; i++) {
            const pdf = new THREE.Mesh(geometry, material);
            pdf.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5
            );
            pdf.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            scene.add(pdf);
            pdfs.push(pdf);
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        camera.position.z = 8;

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);

            pdfs.forEach((pdf, index) => {
                pdf.rotation.x += 0.01;
                pdf.rotation.y += 0.02;
                pdf.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
            });

            renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            if (container.offsetWidth > 0) {
                camera.aspect = container.offsetWidth / container.offsetHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.offsetWidth, container.offsetHeight);
            }
        });
    }

    startStatsCounter() {
        const counters = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    }

    initializeAnimations() {
        // Intersection Observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.feature-card, .glass, .donation-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
            el.style.transition = 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)';
            observer.observe(el);
        });
    }

    async handleFiles(fileList) {
        const pdfFiles = Array.from(fileList).filter(file =>
            file.type === 'application/pdf' && file.size <= 50 * 1024 * 1024 // 50MB limit
        );

        if (pdfFiles.length === 0) {
            this.showNotification('Please select valid PDF files (max 50MB each)', 'warning');
            return;
        }

        // Add files with duplicate check
        const newFiles = pdfFiles.filter(file =>
            !this.files.some(f => f.name === file.name && f.size === file.size)
        );

        this.files.push(...newFiles);
        this.updateFileList();

        if (newFiles.length > 0) {
            this.showNotification(`${newFiles.length} PDF file(s) added successfully!`, 'success');
        }
    }

    updateFileList() {
        const container = document.getElementById('fileListContainer');
        const filesList = document.getElementById('filesList');
        const fileCount = document.getElementById('fileCount');

        if (this.files.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        fileCount.textContent = this.files.length;
        filesList.innerHTML = '';

        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.draggable = true;
            fileItem.dataset.index = index;

            fileItem.innerHTML = `
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center">
                                <div class="file-icon me-3">
                                    <i class="bi bi-file-earmark-pdf"></i>
                                </div>
                                <div>
                                    <h6 class="mb-1 fw-semibold">${file.name}</h6>
                                    <div class="d-flex gap-3">
                                        <small class="opacity-75">
                                            <i class="bi bi-hdd me-1"></i>${this.formatFileSize(file.size)}
                                        </small>
                                        <small class="opacity-75">
                                            <i class="bi bi-calendar me-1"></i>${new Date(file.lastModified).toLocaleDateString()}
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-primary rounded-pill px-3 py-2">#${index + 1}</span>
                                <div class="btn-group">
                                    <button class="btn btn-outline-light btn-sm" onclick="pdfMerger.moveUp(${index})" ${index === 0 ? 'disabled' : ''}>
                                        <i class="bi bi-arrow-up"></i>
                                    </button>
                                    <button class="btn btn-outline-light btn-sm" onclick="pdfMerger.moveDown(${index})" ${index === this.files.length - 1 ? 'disabled' : ''}>
                                        <i class="bi bi-arrow-down"></i>
                                    </button>
                                </div>
                                <button class="btn btn-outline-danger btn-sm" onclick="pdfMerger.removeFile(${index})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;

            // Add drag and drop functionality
            fileItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
                fileItem.style.opacity = '0.5';
            });

            fileItem.addEventListener('dragend', () => {
                fileItem.style.opacity = '1';
            });

            fileItem.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileItem.style.borderColor = 'var(--primary)';
            });

            fileItem.addEventListener('dragleave', () => {
                fileItem.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            });

            fileItem.addEventListener('drop', (e) => {
                e.preventDefault();
                const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const dropIndex = index;

                if (dragIndex !== dropIndex) {
                    this.moveFile(dragIndex, dropIndex);
                }

                fileItem.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            });

            filesList.appendChild(fileItem);
        });
    }

    moveFile(fromIndex, toIndex) {
        const [movedFile] = this.files.splice(fromIndex, 1);
        this.files.splice(toIndex, 0, movedFile);
        this.updateFileList();
        this.showNotification('File reordered successfully!', 'success');
    }

    moveUp(index) {
        if (index > 0) {
            this.moveFile(index, index - 1);
        }
    }

    moveDown(index) {
        if (index < this.files.length - 1) {
            this.moveFile(index, index + 1);
        }
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFileList();
        this.showNotification('File removed successfully!', 'success');
    }

    clearAllFiles() {
        this.files = [];
        this.updateFileList();
        document.getElementById('fileInput').value = '';
        this.showNotification('All files cleared!', 'success');
    }

    sortFiles() {
        this.files.sort((a, b) => a.name.localeCompare(b.name));
        this.updateFileList();
        this.showNotification('Files sorted alphabetically!', 'success');
    }

    previewFiles() {
        if (this.files.length === 0) {
            this.showNotification('No files to preview', 'warning');
            return;
        }

        const fileNames = this.files.map((file, index) => `${index + 1}. ${file.name}`).join('\n');
        this.showNotification(`Preview:\n${fileNames}`, 'success');
    }

    async mergePDFs() {
        if (this.files.length < 2) {
            this.showNotification('Please select at least 2 PDF files to merge', 'warning');
            return;
        }

        if (this.isProcessing) return;

        this.isProcessing = true;
        this.showLoadingOverlay(true);
        this.showProgress(true);

        try {
            const mergedPdf = await PDFLib.PDFDocument.create();
            const totalFiles = this.files.length;

            for (let i = 0; i < totalFiles; i++) {
                const file = this.files[i];
                this.updateProgress((i / totalFiles) * 50, `Processing ${file.name}...`);

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

                pages.forEach((page) => mergedPdf.addPage(page));
                this.updateProgress(((i + 1) / totalFiles) * 50, `Processing ${file.name}...`);
            }

            this.updateProgress(75, 'Finalizing merged PDF...');

            // Optimize the merged PDF
            const pdfBytes = await mergedPdf.save({ useObjectStreams: true });
            this.updateProgress(90, 'Preparing download...');

            // Create download link
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Merged_PDF_${new Date().toISOString().slice(0, 10)}.pdf`;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.updateProgress(100, 'Merge completed!');
            this.showNotification('PDFs merged successfully!', 'success');

            // Reset after successful merge
            setTimeout(() => {
                this.files = [];
                this.updateFileList();
                document.getElementById('fileInput').value = '';
                this.showProgress(false);
                this.showLoadingOverlay(false);
                this.isProcessing = false;
            }, 1000);

        } catch (error) {
            console.error('Error merging PDFs:', error);
            this.showNotification('Error merging PDFs. Please try again.', 'error');
            this.showProgress(false);
            this.showLoadingOverlay(false);
            this.isProcessing = false;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in forwards';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    showLoadingOverlay(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.toggle('active', show);
    }

    showProgress(show) {
        const progressContainer = document.getElementById('progressContainer');
        progressContainer.style.display = show ? 'block' : 'none';
    }

    updateProgress(percentage, status) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressStatus = document.getElementById('progressStatus');

        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${Math.round(percentage)}%`;
        progressStatus.textContent = status;
    }
}

// Initialize the PDF merger
const pdfMerger = new AdvancedPDFMerger();

// Add CSS for notification slideOut animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
document.head.appendChild(styleSheet);