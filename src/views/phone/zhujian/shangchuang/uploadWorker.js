self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/spark-md5/3.0.0/spark-md5.min.js');

self.onmessage = async (event) => {
    const { type, data } = event.data;
    if (type === 'upload') {
        await uploadFile(data);
    }
};

async function uploadFile({ uid, file, md5, chunkIndex, chunkSize, filePid, fileId }) {
    alert("kkkk")
    const fileSize = file.size;
    const chunks = Math.ceil(fileSize / chunkSize);

    for (let i = chunkIndex; i < chunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start +   chunkSize, fileSize);
        const chunkFile = file.slice(start, end);

        try {
            const formData = new FormData();
            formData.append('file', chunkFile);
            formData.append('fileName', file.name);
            formData.append('fileMd5', md5);
            formData.append('chunkIndex', i.toString());
            formData.append('chunks', chunks.toString());
            formData.append('fileId', fileId || '');
            formData.append('filePid', filePid || 0);

            const response = await fetch('/api/file/uploadFile', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();

            const progress = Math.floor(((i + 1) / chunks) * 100);
            self.postMessage({ type: 'progress', data: { uid, progress } });

            if (result.data.status === 'upload_seconds' || result.data.status === 'upload_finish') {
                self.postMessage({ type: 'complete', data: { uid, status: result.data.status } });
                break;
            }
        } catch (error) {
            self.postMessage({ type: 'error', data: { uid, error: error.message } });
            break;
        }
    }
}