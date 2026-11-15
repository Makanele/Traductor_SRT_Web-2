document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileListContainer = document.getElementById('fileListContainer');
    const fileList = document.getElementById('fileList');
    const translateBtn = document.getElementById('translateBtn');
    const statusContainer = document.getElementById('statusContainer');
    
    let selectedFiles = [];

    // Clic en el área para subir archivos
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Manejo de drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });

    // Cuando se seleccionan archivos por input
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    });

    function handleFiles(files) {
        // Filtrar solo .srt
        const srtFiles = Array.from(files).filter(file => file.name.endsWith('.srt'));
        
        if (srtFiles.length === 0) {
            alert('Por favor, selecciona solo archivos con formato .srt');
            return;
        }

        selectedFiles = srtFiles;
        updateFileList();
    }

    function updateFileList() {
        fileList.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${file.name}</span>
                <span style="color: #94a3b8; font-size: 0.8rem;">${(file.size / 1024).toFixed(1)} KB</span>
            `;
            li.id = `file-${index}`;
            fileList.appendChild(li);
        });

        if (selectedFiles.length > 0) {
            fileListContainer.style.display = 'block';
            uploadArea.style.display = 'none';
        }
    }

    translateBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;

        translateBtn.disabled = true;
        statusContainer.style.display = 'block';

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const li = document.getElementById(`file-${i}`);
            
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/translate', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    // Obtener nombre de archivo original sugerido por el servidor
                    const contentDisposition = response.headers.get('Content-Disposition');
                    let filename = file.name.replace('.srt', '_es.srt');
                    if (contentDisposition && contentDisposition.includes('filename=')) {
                        filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
                    }

                    // Descargar el archivo
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    
                    li.classList.add('success');
                } else {
                    const err = await response.json();
                    alert(`Error en ${file.name}: ${err.error}`);
                    li.classList.add('error');
                }
            } catch (error) {
                console.error(error);
                alert(`Hubo un error traduciendo ${file.name}`);
                li.classList.add('error');
            }
        }

        translateBtn.disabled = false;
        statusContainer.style.display = 'none';
        alert('¡Traducción completada!');
        
        // Reset para otra traducción
        selectedFiles = [];
        fileInput.value = '';
        fileListContainer.style.display = 'none';
        uploadArea.style.display = 'block';
    });
});
