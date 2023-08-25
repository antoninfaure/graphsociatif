import json
import requests
from ldap3 import Server, Connection, SUBTREE

def list_units(write_groups_json=True, write_units_json=True):
    '''
    List all units and subunits of EPFL from the search-api.epfl.ch API.

    Input:
        write_groups_json (bool): write groups to groups.json (optional)
        write_units_json (bool): write units to units.json (optional)
        
    Output:
        units.json (file): list of units in json format (optional)
        groups.json (file): list of groups in json format (optional)

    Return:
        units (list): list of units
        groups (list): list of groups
    '''

    BASE_URL = "https://search-api.epfl.ch/api/unit?hl=en&showall=0&siteSearch=unit.epfl.ch&acro="

    res = requests.get(BASE_URL + 'ASSOCIATIONS')
    groups = json.loads(res.text)['subunits']

    units = []
    for i, group in enumerate(groups):
        res = requests.get(BASE_URL + group['acronym'])

        # Find child units of the group
        child_units = json.loads(res.text)['subunits']

        # Add id to groups
        groups[i] = {
            **group,
            'id': i
        }
        for unit in child_units:
            units.append({
                'group_name': group['acronym'],
                'group_id': i,
                **unit
            })

    # Add id and type to units
    for i, unit in enumerate(units):
        units[i] = {
            **unit,
            'id': i,
            'label': unit['acronym'],
            'type': 'unit'
        }
    
    if write_groups_json:
        with open("groups.json", "w", encoding='utf8') as outfile:
            json.dump(groups, outfile, ensure_ascii=False)

    if write_units_json:
        with open("units.json", "w", encoding='utf8') as outfile:
            json.dump(units, outfile, ensure_ascii=False)

    return units, groups

def list_accreds(units, write_accreds_json=False):
    '''
    List all accreditations of EPFL from the LDAP server of EPFL (ldap.epfl.ch).

    Input:
        units (list): list of units
        write_accreds_json (bool): write accreditations to accreds.json (optional)

    Output:
        accreds.json (file): list of accreditations (optional)

    Return:
        accreds (list): list of accreditations
    '''
    server = Server('ldaps://ldap.epfl.ch:636', connect_timeout=5)
    c = Connection(server)
    if not c.bind():
        print("Error: could not connect to ldap.epfl.ch", c.result)
        return

    accreds = []
    for unit in units:
        c.search(search_base = 'o=ehe,c=ch',
                search_filter = f"(&(ou={unit['acronym']})(objectClass=person))",
                search_scope = SUBTREE,
                attributes = '*')

        results = c.response
        for user in results:
            user = dict(user['attributes'])
            accreds.append({
                'sciper': int(user['uniqueIdentifier'][0]),
                'name': user['displayName'],
                'unit_name': unit['acronym'],
                'unit_id': unit['id']
            })

    if write_accreds_json:
        with open("accreds.json", "w", encoding='utf8') as outfile:
            json.dump(accreds, outfile, ensure_ascii=False)
        
    return accreds
    

def compute_unit_size(units, accreds):
    '''
    Compute the size of each unit

    Input:
        units (list): list of units
        accreds (list): list of accreditations

    Return:
        units (list): list of units with size
    '''
    unit_size = dict()
    for accred in accreds:
        unit_id = accred['unit_id']
        if(unit_id in unit_size):
            unit_size[unit_id] += 1
        else:
            unit_size[unit_id] = 1

    for i, unit in enumerate(units):
        if (unit['id'] not in unit_size):
            size = 0
        else:
            size = unit_size[unit['id']]
        units[i] = {
            **unit,
            'size': size
        }

    return units

def compute_users(accreds, write_users_json=True):
    '''
    Compute users from accreds and add number of accreds for each user.
    
    Input: 
        accreds (list): list of accreds
        write_users_json (bool): write users to users.json (optional)

    Output:
        users.json (file): list of users (optional)

    Return:
        users (list): list of users
    '''
    n_accreds = dict()
    for accred in accreds:
        if (accred['sciper'] in n_accreds):
            n_accreds[accred['sciper']] += 1
        else:
            n_accreds[accred['sciper']] = 1

    users = []
    for accred in accreds:
        if (n_accreds[accred['sciper']] > 1):
            user = {
                'id': accred['sciper'],
                'name': accred['name'],
                'type': 'user',
                'accreds': n_accreds[accred['sciper']]
            }
            if (user not in users):
                users.append(user)

    if write_users_json:
        with open("users.json", "w", encoding='utf8') as outfile:
            json.dump(users, outfile, ensure_ascii=False)

    return users

def compute_links(accreds, units, users, write_links_json=True):
    '''
    Compute links between units and users
    
    Input:
        accreds (list): list of accreds
        units (list): list of units
        users (list): list of users
        write_links_json (bool): write links to links.json (optional)

    Output:
        links.json (file): list of links (optional)
    
    Return:
        links (list): list of links
    '''

    links = []
    for i, accred in enumerate(accreds):
        for unit in units:
            if (unit['acronym'] == accred['unit_name']):
                unit_id = unit['id']
        for user in users:
            if (user['id'] == accred['sciper']):
                user_id = user['id']
                links.append({
                    'target': unit_id,
                    'source': user_id
                })

    if write_links_json:
        with open("links.json", "w", encoding='utf8') as outfile:
            json.dump(links, outfile, ensure_ascii=False)

    return links

def write_data(units, users, links):
    '''
        Write data to data.json
        
        Input:
            units (list): list of units
            users (list): list of users
            links (list): list of links

        Output:
            data.json (file): data in json format

        Return:
            None
    '''

    data = {
        'nodes': units + users,
        'links': links
    }

    with open("data.json", "w", encoding='utf8') as outfile:
        json.dump(data, outfile, ensure_ascii=False)
