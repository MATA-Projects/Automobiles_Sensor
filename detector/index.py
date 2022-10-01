
# Setting up the Logging
import logging
logger = logging.getLogger()
logging.basicConfig(level=logging.DEBUG)



##################################
# Object Tracking Setup
##################################
import pandas as pd
import os



sensors_table = pd.read_csv('./data/Group_349.csv', index_col='t')


class CornersData():

    def __init__(self, table=None, use_hackathon_column_name = True):
        self.corners = {}
        for column in table.columns:
            if 'cornerData' in column and 'cornerTimestamp' not in column:
                column_extracted = column.split('.')
                corner_id = int(column_extracted[-5][1])
                object_id = int(column_extracted[-2][1])
                measurement_type = column_extracted[-1][3:]
                corner_name = CornersData.corner_to_id(corner_id)
                if(corner_name not in self.corners):
                    self.corners[corner_name] = {"id" : corner_id, 'objects' : []}
                self.corners[CornersData.corner_to_id(corner_id)]['objects'].append({
                    "object_id" : object_id,
                    "measurement_type" : measurement_type,
                    "measurement_normalized" : table.iloc[0][column]
                })

        self._denormalize()

    def _denormalize(self):
        for corner, cdata in self.corners.items():
            for obj in cdata['objects']:
                if('d' in obj['measurement_type']): # Denormalizing Distance
                    obj['measurement_denormalized'] = obj['measurement_normalized'] / 128
                elif('v' in obj['measurement_type']): # Denormalizing Velocity
                    obj['measurement_denormalized'] = obj['measurement_normalized'] / 256
                elif('a' in obj['measurement_type']): # Denormalizing Acceleration
                    obj['measurement_denormalized'] = obj['measurement_normalized'] / 2048
                elif('prob' in obj['measurement_type']): # Denormalizing Obstacle Probability
                    obj['measurement_denormalized'] = obj['measurement_normalized'] / 128


    def get_corners(self):
        return self.corners

    @staticmethod
    def corner_to_id(id):
        if id == 0:
            return "LEFT_FRONT"
        if id == 1:
            return "RIGHT_FRONT"
        if id == 2:
            return "LEFT_BOTTOM"
        if id == 3:
            return "RIGHT_BOTTOM"
        else:
            raise Exception("ID OF THE CORNER IS NOT VALID")



data = CornersData(sensors_table)
print(data.get_corners())


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


# groups = load_datasets()

# print(groups[0][0].columns)






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
