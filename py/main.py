import pika
import time
import numpy as np
import base64
import io
import json
connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq'))
channel = connection.channel()


def callback(ch, method, properties, body):
    body = json.loads(body)
    content = body['content']
    from64 = base64.b64decode(content)
    toImg = io.BytesIO(from64)
    shape = body['shape']
    w, h = int(shape['width']), int(shape['height'])
    img = np.asarray(bytearray(toImg.read()), dtype=np.uint64)
    print(img.shape, w*h)
    # img = img.reshape((h, w, 3))
    print(img.shape)
    # time.sleep(50)
    # content = json.loads(content, encoding="ISO8859")
    print(content)
    print(f" [x] Received {type(content)} {w} {h}")
    # img = np.reshape(content, (-1, 20))
    # print(content.shape, w*h)

    print("ack")
    uuid = np.random.randint(0, 100)
    # save to file
    with open(f"./data_{uuid}_.jpg", "wb") as f:
        f.write(img)

    ch.basic_ack(delivery_tag=method.delivery_tag)
    print(method.delivery_tag)

    # time.sleep(5)


channel.queue_declare(queue='hello', durable=True)

channel.basic_consume(queue='hello',
                      auto_ack=False,
                      on_message_callback=callback)
print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()
