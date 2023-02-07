var ldap = require('ldapjs');
var fs = require('fs');
const Excel = require('exceljs')
const dotenv = require('dotenv')
dotenv.config()

// List of UNITS to query
var UNITS = [
  'ar-ma3',
  'cgc-ma3',
  'el-ma3',
  'gc-ma3',
  'gm-ma3',
  'in-ma3',
  'sc-ma3',
  'ma-ma3',
  'mt-ma3',
  'mx-ma3',
  'ph-ma3',
  'sie-ma3',
  'sv-ma3'
];

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

// Create EXCEL file
var workbook = new Excel.Workbook();

// Launch script
queryUnit("a", 0);


// Query unit function
async function queryUnit(UNIT, index) {
  var iObjectsFound = 0;
  var opts = { filter: `(ou=ehe)`, scope: 'sub',  attributes: ['*']};
  //var opts = { filter: `(cn=Pardou)`, scope: 'sub',  attributes: ['*']};

  // Create unit sheet
  let worksheet = workbook.addWorksheet(UNIT)
  worksheet.columns = [
      {header: 'Sciper', key: 'sciper'},
      {header: 'Sexe', key: 'sex'},
      {header: 'Firstname', key: 'firstname'},
      {header: 'Name', key: 'name'},
      {header: 'Email', key: 'email'}
  ]

  // Query unit to LDAP
  client.search(`o=epfl,c=ch`, opts, function(err, res) {
    if (err) console.error(err);

    // For each result
    res.on('searchEntry', function(entry) {
      iObjectsFound = iObjectsFound +1;
      var e = entry.object;
      // If is a person then save
      console.log(e)
      /*if (e.objectClass.includes('person')) {
        worksheet.addRow({
          sciper: e.uniqueIdentifier,
          name: Array.isArray(e.sn) ? e.sn[0] : e.sn,
          sex: e.personalTitle,
          firstname: Array.isArray(e.givenName) ? e.givenName[0] : e.givenName,
          email: e.mail
        })
      }*/
    });
    res.on('error', function(err) {
      console.error('error: ' + err.message);
    });
    res.on('end', async function(result) {
      console.log(`${UNIT} : ${iObjectsFound}`);
      // If last unit
      if (0 == index) {
        await workbook.xlsx.writeFile('USERS.xlsx')
        process.exit();
      } else queryUnit(UNITS[index - 1], index - 1)
    });
  });
}
