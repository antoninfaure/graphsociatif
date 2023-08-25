from utils import *

# Get the list of units and groups
units, groups = list_units(write_units_json=True, write_groups_json=True)

# Get the list of accreditations from LDAP
accreds = list_accreds(units, write_accreds_json=True)

# Compute the size of each unit
units = compute_units_size(units, accreds)

# Compute users from accreds and add number of accreds for each user.
users = compute_users_size(accreds, write_users_json=True)

# Compute links between units and users
links = compute_links(accreds, units, users, write_links_json=True)

# Write data to data.json
write_data(units, users, links)