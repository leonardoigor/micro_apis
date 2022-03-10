var fs = require('fs');
const { join } = require('path');

function saveImage(img, filename) {
    var id = Math.floor(Math.random() * 1000000);
    let file_name = `images/${id}_${filename}`
    var path = join(__dirname, '../', 'public', file_name);
    return new Promise((resolve, reject) => {

        fs.writeFile(path, img, function (err) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log("The file was saved!");
                resolve(file_name);
            }
        });
    })
}

function deleteImage(file_name) {
    var path = join(__dirname, '../', 'public', 'images', file_name);
    let payload = { status: '' }
    return new Promise((resolve, reject) => {

        fs.unlink(path, function (err) {
            if (err) {
                payload.status = err.message;
            } else {
                payload.status = 'true';
            }
            resolve(payload);
        });
    })
}
module.exports = { saveImage, deleteImage };








