const express = require('express');
var amqp = require('amqplib/callback_api');
const formData = require('express-form-data');
const fs = require('fs');
const { saveImage, deleteImage } = require('./src/save_image');



const app = express();
const port = process.env.PORT || 3000;
const URI = process.env.Host || 'http://0.0.0.0';
const amqpURI = process.env.AMQP_URI || 'amqp://rabbitmq';



amqp.connect(amqpURI, function (error0, connection) {
    if (error0) {
        throw error0;
    }
    console.log('Connected to RabbitMQ');
    connection.createChannel(function (error1, channel) {
        console.log("Channel created");
        if (error1) {
            throw error1;
        }

        // static files
        app.use(express.static(__dirname + '/public'));
        app.use(express.json());
        app.use(formData.parse());


        //api routes
        app.post('/upload', async (req, res) => {
            console.log('upload');
            let queue = 'hello';
            let files = req.files;
            let img = files.file
            // let decode64 = new Buffer(img, 'base64');
            let path = img.path
            let img_loaded = fs.readFileSync(path);
            var path_saved = await saveImage(img_loaded, img.name);
            let host = `${path_saved}`;
            let payload = Buffer.from(host)
            channel.assertQueue(queue, { durable: true });
            channel.sendToQueue(queue, payload);


            res.send('upload');
        })
        app.post('/delete_img', async (req, res) => {
            console.log('delete');
            const { file_name } = req.body
            console.log(file_name);

            // delete file
            var result = await deleteImage(file_name);
            res.send(result);
        })
        // listen
        app.listen(port, () => {
            console.log(`Server running at ${URI}:${port}/`);
        });
    });

});
