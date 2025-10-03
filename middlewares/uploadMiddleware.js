const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // куди зберігати картинки
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // унікальне ім’я
  }
});

const upload = multer({ storage }).fields([
  { name: 'images', maxCount: 5 } // максимум 5 картинок
]);

module.exports = { upload };
