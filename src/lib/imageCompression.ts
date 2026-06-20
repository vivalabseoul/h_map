/**
 * Compress an image file using HTML5 Canvas.
 * Goal: Resize the image so its maximum dimension is 800px and compress to ~100KB.
 */
export async function compressImage(file: File, maxWidthOrHeight = 800, initialQuality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = Math.round((height * maxWidthOrHeight) / width);
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = Math.round((width * maxWidthOrHeight) / height);
            height = maxWidthOrHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        let quality = initialQuality;
        const compress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
              }
              if (blob.size > 100 * 1024 && quality > 0.1) {
                quality -= 0.15;
                compress();
              } else {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              }
            },
            'image/jpeg',
            quality
          );
        };
        
        compress();
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
