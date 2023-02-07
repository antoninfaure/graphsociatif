var ldap = require('ldapjs');
var fs = require('fs');
const Excel = require('exceljs')
const dotenv = require('dotenv')

// List of UNITS to query
var UNITS = JSON.parse(fs.readFileSync('roots.json'));
let PEOPLE = []

// Setup connection to EPFL LDAP
var client = ldap.createClient({ url: 'ldaps://ldap.epfl.ch:636' });

client.on('error', (err) => {
  console.error(err);
})
client.on('connectRefused', (err) => {
  console.error(err);
})
client.on('connectError', (err) => {
  console.error(err);
})

// Launch script
queryUnit(UNITS, 1);


// Query unit function
async function queryUnit(UNITS, i) {
  let UNIT = UNITS.shift();
  let unit_id = UNIT.id;
  var opts = { filter: `(ou=${UNIT.label})`, scope: 'sub',  attributes: ['*']};
  //var opts = { filter: `(cn=Medaric)`, scope: 'sub',  attributes: ['*']};

  // Query unit to LDAP
  client.search(`o=ehe,c=ch`, opts, function(err, res) {
    if (err) console.error(err);
    // For each result
    res.on('searchEntry', function(entry) {
      var e = entry.object;
      // If is a person then save
      if (e.objectClass.includes('person')) {
        i++;
        PEOPLE.push({
          id : i,
          unit_id : unit_id,
          sciper: e.uniqueIdentifier,
          name: ((Array.isArray(e.givenName) ? e.givenName[0] : e.givenName) + " " + (Array.isArray(e.sn) ? e.sn[0] : e.sn)),
        })
      }
    });

    res.on('error', function(err) {
      console.error('error: ' + err.message);
    });

    res.on('end', async function(result) {
    
      // If last unit
      if (UNITS.length == 0) {
        await fs.writeFileSync('people.json', JSON.stringify(PEOPLE));
        process.exit();
      } else queryUnit(UNITS, i)
    });
  });
}
