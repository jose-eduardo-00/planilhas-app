import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/avatar/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (!file.originalname.match(/\.(png|jpg|jpeg|webp)$/)) {
    return cb(
      new Error("Apenas imagens (png, jpg, jpeg, webp) são permitidas!")
    );
  }
  cb(null, true);
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
});
