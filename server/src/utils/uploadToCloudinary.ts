import cloudinary from "../config/cloudinary.js"

const uploadToCloudinary = async (fileBuffer: any, folder: any) => {
    return await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder },
            (err: any, result: unknown) => {
                if (err) reject(err)
                else resolve(result)
            }
        ).end(fileBuffer)
    })
}

export default uploadToCloudinary