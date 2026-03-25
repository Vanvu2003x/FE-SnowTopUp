
export const getImageSrc = (path, defaultImage = "/imgs/image.png") => {
    if (!path) return defaultImage;
    if (path.startsWith("http")) return path;

    // Clean up path - remove leading slash if present to avoid double slash
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${apiUrl}${cleanPath}`;
};
