
# Setting up the Logging
import logging
logger = logging.getLogger()
logging.basicConfig(level=logging.DEBUG)



# Setting up the FLASK Server
from flask import Flask, request
app = Flask(__name__)


'''
This endpoint receives a sensor input data at a given timestamp and produces an output. 


Input:
    sensor_data : []

Output:
    {}
'''
@app.post("/predict")
def predict():
    logger.debug(f"Predicting the given data: {request.form.get('sensor_data')}")
    return "<p>Hello, World!</p>"


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=50001)