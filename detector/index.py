
# Setting up the Logging
import logging
logger = logging.getLogger()
logging.basicConfig(level=logging.DEBUG)



##################################
# Object Tracking Setup
##################################
import pandas as pd
import os



# sensors_table = pd.read_csv('./data/Group_349.csv', index_col='t')


input_values = {
    "corner_id" : "cid",

    # Objects Parameters
    "object_id" : "oid",
    "object_distance_x" : "odx",
    "object_distance_y" : "ody",
    "object_acceleration_x" : "oax",
    "object_acceleration_y" : "oay",
    "object_velocity_x" : "ovx",
    "object_velocity_y" : "ovy",

    # Host parameters
    "host_velocity_x" : "hvx", 
    "host_velocity_y" : "hvy",
    "host_acceleration_x" : "hax",
    "host_acceleration_y" : "hay"
}

class CornersData():
    def __init__(self, table=None, use_hackathon_column_name = True):
        self.corners = {}
        if use_hackathon_column_name:
            for column in table.columns:
                if 'cornerData' in column and 'cornerTimestamp' not in column:
                    column_extracted = column.split('.')
                    corner_id = int(column_extracted[-5][1])
                    object_id = str(int(column_extracted[-2][1]))
                    measurement_type = column_extracted[-1][3:]
                    corner_name = CornersData.corner_to_id(corner_id)
                    if(corner_name not in self.corners):
                        self.corners[corner_name] = {"id" : corner_id, 'objects' : {}}
                    if(object_id not in self.corners[CornersData.corner_to_id(corner_id)]['objects']):
                        self.corners[CornersData.corner_to_id(corner_id)]['objects'][object_id] = {'object_id': object_id}
                    self.corners[CornersData.corner_to_id(corner_id)]['objects'][object_id][str(measurement_type+"_normalized")] = table.iloc[0][column]
        else:
            # Grab corners
            cids = table[input_values['corner_id']].unique()
            for cid in cids: # foreach corner
                corner_name = CornersData.corner_to_id(cid)
                if(corner_name not in self.corners):
                    self.corners[corner_name] = {"id" : cid, 'objects' : {}}
                crd = table.loc[table[input_values['corner_id']] == cid] # corner relevant data
                
                for index, row in crd.iterrows(): # Objects' columns
                    oid = row[input_values['object_id']]
                    obj = {
                        "object_id" : oid,
                        "dx_normalized": row[input_values['object_distance_x']],
                        "dy_normalized": row[input_values['object_distance_y']],
                        "vx_normalized": row[input_values['object_velocity_x']],
                        "vy_normalized": row[input_values['object_velocity_y']],
                        "ax_normalized": row[input_values['object_acceleration_x']],
                        "ay_normalized": row[input_values['object_acceleration_y']]
                    }
                    if (oid not in self.corners[corner_name]['objects'] ):
                        self.corners[corner_name]['objects'][oid] = {}
                    self.corners[corner_name]['objects'][oid] = obj

        self._denormalize()



    '''
        Insert a denormalized solution to the python
    '''
    def _denormalize(self):

        for corner, cdata in self.corners.items():
            for obj in cdata['objects']:
                robj = cdata['objects'][obj]
                d_keys = [key for key in robj.keys() if 'dx' in key or 'dy' in key]
                v_keys = [key for key in robj.keys() if 'vx' in key or 'vy' in key]
                a_keys = [key for key in robj.keys() if 'ax' in key or 'ay' in key]
                for key in d_keys: # Denormalizing Distance
                    robj[key.split('_')[0]+"_denormalized"] = robj[key] / 128

                for key in v_keys: # Denormalizing Velocity
                    robj[key.split('_')[0]+"_denormalized"] = robj[key] / 256

                for key in a_keys: # Denormalizing Acceleration
                    robj[key.split('_')[0]+"_denormalized"] = robj[key] / 2048 
                
                # for key in a_keys: # Denormalizing Acceleration
                #     obj[key.split('_')[0]] = obj[key] / 128


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



# data = CornersData(sensors_table)
# print(data.get_corners()["LEFT_FRONT"]["objects"].keys())


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
Returns the available options for the api predict call

Return:
{
    description: key
}
'''
@app.get('/')
def get_parameters():
    return {input_values}



'''
This endpoint receives a sensor input data at a given timestamp and produces an output. 


# Input:
#     sensor_data : []

Output:
    {}
'''
@app.route('/predict', methods=['post'])
def predict():
    data = request.json
    #logger.debug(f'Received args: {request.kwargs}')
    data_order = data.get('inputorder').split(",")
    data_input = list(map(lambda x: x.split(",") , data.get('sensors_content').split("\n")))
    tableMap = {}
    for i in range(len(data_order)):
        tableMap[data_order[i]] = []
        for j in range(len(data_input)):
            tableMap[data_order[i]].append(int(data_input[j][i]))
    
    df = pd.DataFrame(tableMap)
    logger.debug(f'{df}')

    cd = CornersData(df, False)
    cornersVar = cd.get_corners()
    logger.debug(f'{cornersVar}')


    
    if data_input and data_order:
        new_data_order = data_order[::-1]

        return jsonify({'input_order': new_data_order})
    return jsonify({'error': 'Missing data!'}) 
    


if __name__ == '__main__':
    app.run(port=50003, debug=True)
