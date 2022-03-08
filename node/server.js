const express = require('express');
var amqp = require('amqplib/callback_api');
const formData = require('express-form-data');
const fs = require('fs');
var sizeOf = require('image-size');



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
        app.post('/upload', (req, res) => {
            console.log('upload');
            let queue = 'hello';
            let files = req.files;
            let img = files.file
            // let decode64 = new Buffer(img, 'base64');
            let path = img.path
            let img_loaded = fs.readFileSync(path);
            img_loaded = {
                content: img_loaded.toString('base64'),
                shape: img.originalname
            }
            let shape = {
                width: 0,
                height: 0
            }
            sizeOf(path, function (err, dimensions) {
                shape.width = dimensions.width;
                shape.height = dimensions.height;
                img_loaded['shape'] = shape;
                console.log(img_loaded)
                img_loaded = Buffer.from(JSON.stringify(img_loaded));
                channel.assertQueue(queue, { durable: true });
                channel.sendToQueue(queue, img_loaded);
            });

            res.send('upload');
        })

        // listen
        app.listen(port, () => {
            console.log(`Server running at ${URI}:${port}/`);
        });
    });

});
