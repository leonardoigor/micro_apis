from uuid import uuid4
import pika
import time
import numpy as np

import requests
from PIL import Image
from io import BytesIO

connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
channel = connection.channel()


def callback(ch, method, properties, body):
    base_url = "http://node:3000/"
    try:
        url_from_micro = str(body.decode('utf-8'))
        url = f"{base_url}{url_from_micro}"
        extension = url.split('.')[-1]
        extension = extension.lower()
        res = requests.get(url)
        # img_arr = Image.open(BytesIO(res.content))

        uuid = str(uuid4())
        file_name = url_from_micro.split('/')[-1]
        # save image
        # img_arr.save(f"./uploads/data_{uuid}.{extension}")
        with(open(f"./uploads/data_{uuid}.{extension}", 'wb')) as f:
            f.write(res.content)

        url_del = f"{base_url}delete_img"
        response = requests.post(
            url_del, json={'file_name': file_name})

        print(response.text, url_del)
        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        ch.basic_nack(delivery_tag=method.delivery_tag)
        print(e)
        pass

    # time.sleep(5)


channel.queue_declare(queue='hello', durable=True)

channel.basic_consume(queue='hello',
                      auto_ack=False,
                      on_message_callback=callback)
print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()
