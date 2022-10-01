
# Setting up the Logging
import logging
logger = logging.getLogger()
logging.basicConfig(level=logging.DEBUG)



##################################
# Object Tracking Setup
##################################
import pandas as pd
import os



'''
    Loads all CSV files in a given directory
'''
def load_csvs_from_dir(directory):
    logger.debug(f'Loading CSV files from {directory}...')
    csvs = []
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        if os.path.isfile(f):
            logger.debug(f'Loading {f}...')
            csvs.append(pd.read_csv(f))
            logger.debug(f'Finished Loading {f}')
    return csvs



'''
    A static function to load the tasks related datasets
'''
def load_datasets():
    directory = 'datasets'
    groups = []
    for filename in os.listdir(directory):
        f = os.path.join(directory, filename)
        if os.path.isdir(f):
            groups.append(load_csvs_from_dir(f))
    return groups


groups = load_datasets()

print(groups[0][0].columns)




##################################
# Setting Up the Endpoints
##################################

# Setting up the FLASK Server
# from flask import Flask, request
# app = Flask(__name__)

from flask import Flask, request, jsonify

app = Flask(__name__)
'''
This endpoint receives a sensor input data at a given timestamp and produces an output. 


# Input:
#     sensor_data : []

Output:
    {}
'''

@app.route('/')
def index():
    return 'hello'

@app.route('/predict', methods=['post'])
def predict():
    print('hihi')
    return {'hi':'hi'}
    data_order = request.form.get('input_order')
    data_input = request.form.get('sensors_content')
    if data_input and data_order:
        new_data_order = data_order[::-1]

        return jsonify({'input_order': new_data_order})
    return jsonify({'error': 'Missing data!'}) 
    


if __name__ == '__main__':
    app.run(port=50003, debug=True)
