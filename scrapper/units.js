var ldap = require('ldapjs');
var fs = require('fs');
const dotenv = require('dotenv')
const axios = require('axios');
dotenv.config()


let BASE_URL = "https://search-api.epfl.ch/api/unit?hl=en&showall=0&siteSearch=unit.epfl.ch&acro="

let NODES = [{
  id: 1,
  label: "ASSOCIATIONS"
}];
let UNITS = [...NODES]

let EDGES = []
let ROOTS = [];
async function queryUnits(UNITS, i) {
  let UNIT = UNITS.shift();
  let parent_id = UNIT.id;
  axios.get(BASE_URL + UNIT.label)
    .then(response => {
      if (response.data) {
        let subunits = response.data.subunits;
        if (subunits && subunits.length != 0) {
          for (unit of subunits) {
            i++;
            UNITS.push({
              id: i,
              label: unit.acronym
            })
            NODES.push({
              id: i,
              label: unit.acronym
            })
            EDGES.push({
              id: i,
              from: parent_id,
              to: i
            })
          }
        } else ROOTS.push(UNIT);
        //console.log(UNITS)
        if (UNITS.length != 0) queryUnits(UNITS, i);
        else writeJSON();
      }
    })
}

function writeJSON() {
  fs.writeFileSync('nodes.json', "nodes_data = " + JSON.stringify(NODES));
  fs.writeFileSync('edges.json', "edges_data = " + JSON.stringify(EDGES));
  fs.writeFileSync('roots.json', JSON.stringify(ROOTS));
}

// Launch script
queryUnits(UNITS, 1);



