// const multer = require("multer");
// var path = require('path');

// module.exports = multer({
//     storage: multer.diskStorage({}),
//     fileFilter: (req, file, cb) => {
//         let ext = path.extname(file.originalname);
//         if(ext !== ".jpg" && ext != ".jpeg" && ext != ".png") {
//             cb(new Error("File type is not supported"),false);
//             return;
//         }
//         cb(null,true);

//     }

// });


const multer = require("multer");
var path = require('path');

module.exports = multer({
    storage: multer.diskStorage({}),
    limits: { fileSize: 101000 }, // Setting the file size limit to 101 KB
    fileFilter: (req, file, cb) => {
        let ext = path.extname(file.originalname);
        if (ext !== ".jpg" && ext != ".jpeg" && ext != ".png") {
            cb(new Error("File type is not supported"), false);
            return;
        }
        cb(null, true);
    },
    onError: function (err, next) {
        if (err) {
            next(new Error("File size limit exceeded. Maximum file size allowed is 101 KB."));
        }
    }
});
 