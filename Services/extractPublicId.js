export default function extractPublicIdFromUrl(url) {
    // Extract public_id from Cloudinary URL
    // Example Cloudinary URL: https://res.cloudinary.com/demo/image/upload/v1620670029/public_id.jpg
    const parts = url?.split('/');
    const filename = parts.pop();
    const publicId = filename.split('.')[0]; // Remove file extension
    return publicId;
}