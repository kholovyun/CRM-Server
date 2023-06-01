import fs from "fs";
import path from "path";

export const deleteFile = (fileName: string | File) => {
    const imagePath = path.resolve("./") + "/public/uploads/childrenImgs/";
    fs.unlink(imagePath + fileName, (err) => {
        if (err) {
            throw err;
        }
        console.log("Image deleted");
    });
};