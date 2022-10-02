
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
    "object_distance_z" : "odz",
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



'''
Creates a structure as follows from the given data:

Corners : {
    <radar position>:
        {
            cid: <radar id> 
            objects : {
                <object id> : {
                    <*x|y_(de)*normalized> : float
                }
            }
        }
}

'''

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
                        self.corners[corner_name] = {"cid" : corner_id, 'objects' : {}}
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
                        "dz_normalized": row[input_values['object_distance_z']],
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
                d_keys = [key for key in robj.keys() if 'dx' in key or 'dy' in key or 'dz' in key]
                v_keys = [key for key in robj.keys() if 'vx' in key or 'vy' in key or 'vz' in key]
                a_keys = [key for key in robj.keys() if 'ax' in key or 'ay' in key or 'az' in key]
                for key in d_keys: # Denormalizing Distance
                    robj[key.split('_')[0]+"_denormalized"] = robj[key] / 128

                for key in v_keys: # Denormalizing Velocity
                    robj[key.split('_')[0]+"_denormalized"] = robj[key] / 256

                for key in a_keys: # Denormalizing Acceleration
                    robj[key.split('_')[0]+"_denormalized"] = robj[key] / 2048 
                
                # for key in a_keys: # Denormalizing Acceleration
                #     obj[key.split('_')[0]] = obj[key] / 128


    def get_shared_sensors(self, cname, oid):
        common = [(cname,oid)]
        cdata = self.corners[cname]
        odata = cdata["objects"][oid]

        for cname_, cdata_ in self.corners.items():
            if(cname != cname_):
                for oid_, odata_ in cdata_["objects"].items():
                    logger.debug(f'Comparing Objects: {oid} & {oid_} from {cname} & {cname_}') 
                    if(self.compare_objects(odata_, odata) > 0.5):
                        common.append((cname_,oid_))
                        logger.debug(f'Similar Objects Found in: {cname} & {cname_}') 
                    else:
                        logger.debug(f'No Similar Found in: {cname} & {cname_}') 
        return common 


    def compare_objects(self, o1, o2):
        score = 0
        epsilon = 0.01
        tests = 0
        # Velocity Absolute difference
        tests+=1
        if(abs(o1['vx_denormalized'] - o2['vx_denormalized']) < epsilon):
            score += 1

        tests+=1
        if(abs(o1['vy_denormalized'] - o2['vy_denormalized']) < epsilon):
            score += 1

        tests+=1
        v1_vec_sq = o1['vx_denormalized'] *  o1['vx_denormalized'] + o1['vy_denormalized']*o1['vy_denormalized']
        v2_vec_sq = o2['vx_denormalized'] *  o2['vx_denormalized'] + o2['vy_denormalized']*o2['vy_denormalized']
        if(abs(v1_vec_sq - v2_vec_sq) < epsilon):
            score += 1

        tests+=1
        # Acceleration Absolute difference
        if(abs(o1['ax_denormalized'] - o2['ax_denormalized']) < epsilon):
            score += 1

        tests+=1
        if(abs(o1['ay_denormalized'] - o2['ay_denormalized']) < epsilon):
            score += 1

        tests+=1
        a1_vec_sq = o1['ax_denormalized'] *  o1['ax_denormalized'] + o1['ay_denormalized']*o1['ay_denormalized']
        a2_vec_sq = o2['ax_denormalized'] *  o2['ax_denormalized'] + o2['ay_denormalized']*o2['ay_denormalized']
        if(abs(a1_vec_sq - a2_vec_sq) < epsilon):
            score += 1

        return score / tests


    def estimate_dimensions(self, shared_sensors):
        founds = sorted([ corn for corn, id in shared_sensors])
        
        shared_bottoms = len([bottom for bottom in founds if 'BOTTOM' in bottom ])
        shared_fronts = len([front for front in founds if 'FRONT' in front ])
        
        shared_lefts = len([left for left in founds if 'LEFT' in left ])
        shared_rights = len([right for right in founds if 'RIGHT' in right ])

        logger.debug(f'(lefts, rights, fronts, bottoms): {(shared_lefts,shared_rights, shared_fronts, shared_bottoms)}')

        return [max(shared_lefts, shared_rights),0, max(shared_bottoms, shared_fronts)]
        

    def get_corners(self):
        return self.corners

    def is_empty(self, cname, oid):
        odata = self.corners[cname]["objects"][oid]
        epsilon = 0.01

        v_vec_sq = odata['vx_denormalized'] *  odata['vx_denormalized'] + odata['vy_denormalized']*odata['vy_denormalized']
        a_vec_sq = odata['ax_denormalized'] *  odata['ax_denormalized'] + odata['ay_denormalized']*odata['ay_denormalized']
        d_vec_sq = odata['dx_denormalized'] *  odata['dx_denormalized'] + odata['dy_denormalized']*odata['dy_denormalized'] 
        
        if( abs(v_vec_sq) < epsilon and abs(a_vec_sq) < epsilon and abs(d_vec_sq) < epsilon):
            return True
        else:
            return False


    @staticmethod
    def corner_to_id(id):
        if id == 0:
            return "LEFT_FRONT"
        if id == 2:
            return "RIGHT_FRONT"
        if id == 1:
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

PRODUCTION=False

'''
This endpoint receives a sensor input data at a given timestamp and produces an output. 


# Input:
#     sensor_data : []

Output:
    {}
'''
@app.route('/predict', methods=['post'])
def predict():
    cd = {}
    cornersVar = {}
    if(PRODUCTION):
        data = request.json
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
        cornersVar = dict(cd.get_corners()).copy()
    else:
        df = pd.read_csv('./data/Group_349.csv', index_col='t')
        cd = CornersData(df)
        cornersVar = dict(cd.get_corners()).copy()
    logger.debug(f'{cornersVar}')

    
    # Returning the processed objects to the frontend to be rendered
    # Get A sensor data
    returned_entities = []
    for corner_name, corner_data in cornersVar.items():
        for object_id , object_data in corner_data['objects'].items():
            if(cd.is_empty(corner_name, object_id)):
                continue

            shared_sensors = cd.get_shared_sensors(corner_name, object_id)            
            dims = cd.estimate_dimensions(shared_sensors)
            obj = {
                "dx" : object_data['dx_denormalized'],
                "dy" : object_data['dy_denormalized'],
                "dz" : object_data['dz_denormalized'],

                "vx" : object_data['vx_denormalized'],
                "vy" : object_data['vy_denormalized'],

                "ax" : object_data['ax_denormalized'],
                "ay" : object_data['ay_denormalized'],

                "length": dims[0],
                "width" : dims[2],
                "height": dims[1],

                "found_in": shared_sensors
            }
            
            returned_entities.append(obj)


    # Remove Redundent Entities
    final_returned = []
    for idx in range(len(returned_entities)) :
        cur_obj = returned_entities[idx]
        found = False
        if(len(cur_obj["found_in"]) < 2):
            final_returned.append(cur_obj)
            continue

        for itm in returned_entities[idx+1:]:
            if(len(itm["found_in"]) < 2):
                continue
            
            founds_cur1 = sorted([ corn for corn, id in cur_obj["found_in"]])
            founds_cur2 = sorted([ corn for corn, id in itm["found_in"]])
            if(founds_cur1 == founds_cur2):
                logger.debug(f'Found Shared Entities At {founds_cur1} == {founds_cur2}')
                found = True
                break

        if(not found):
            final_returned.append(cur_obj)
            
    return final_returned
    


if __name__ == '__main__':
    app.run(port=50003, debug=True)
