import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        files: 5,
        fileSize: 3 * 1024 * 1024, // 3 MB per image
    },
});

export default upload;