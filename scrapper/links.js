let fs = require("fs");

let edges2 = JSON.parse(fs.readFileSync('edges2.json'));

console.log(edges2.links)

edges2.links.map(x => x= {...x, source: x.source--, target: x.target--})

fs.writeFileSync('edges2.json', ` links = ${JSON.stringify(edges2.links)}`);

/*

let people = JSON.parse(fs.readFileSync('people.json'));
let units = JSON.parse(fs.readFileSync('nodes_brut.json'));

let units_size = units.map(x => x = {...x, value: people.filter(y => y.unit_id == x.id).length });

console.log(units_size.sort((a, b) => (a.size < b.size) ? 1 : -1))

let traquenardes = people.map(person => person =
  {
    sciper : person.sciper,
    name : person.name,
    units: people.filter(x => x.sciper === person.sciper).map(x => x.unit_id).sort((a, b) => (a > b ? 1 : -1))
  }
).filter(y => y.units.length > 1);

traquenardes = [...new Map(traquenardes.map(item => [item["sciper"], item])).values()].sort((a, b) => (a.units.length > b.units.length) ? 1 : -1).reverse();


let LINKS = [];

for (let traquenard of traquenardes) {
  LINKS.push({...traquenard, pairs: pairs(traquenard.units)});
}
*/


/* Add other direction */
/*LINKS.map(x => {
  LINKS.push(x.reverse())
})*/
//console.log(LINKS)

/* Filter uniques */
/*var uniques = LINKS.filter((pair,i) => 
  LINKS.filter((x,b) => (x[0] == pair[0] && x[1] == pair[1] && b >= i)).length == 1
)*/
/*
let uniques = LINKS;

uniques.sort((a,b) => a[0] > b[0] ? 1 : -1)

let LINK_EDGES = [];
let i = 0;
uniques.map(person => person.pairs.map(pair => {
  i++;
  LINK_EDGES.push({
    id: i,
    from: pair[0],
    to: pair[1],
    label: person.name
  })
}))
*/
//console.log(LINK_EDGES)

//fs.writeFileSync('nodes.json', "nodes_data = " + JSON.stringify(units_size));
//fs.writeFileSync('link_edges.json', "link_edges_data = " + JSON.stringify(LINK_EDGES));

function pairs(arr) {
    var res = [],
        l = arr.length;
    for(var i=0; i<l; ++i)
        for(var j=i+1; j<l; ++j)
            res.push([arr[i], arr[j]]);
    return res;
}