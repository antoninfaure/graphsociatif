# :busts_in_silhouette: [EPFL Graphsociatif](https://antoninfaure.github.io/graphsociatif/)

A force graph visualization of the associative network at EPFL.

This project provides a set of Python scripts to retrieve, process, and visualize information about units and accreditations of associations at EPFL (École Polytechnique Fédérale de Lausanne).

## Prerequisites

To run the scripts, you need the following:

1. Python 3.x installed on your machine.
2. Access to the **EPFL network** via VPN or Wi-Fi. The scripts require network access to the EPFL LDAP server.

## Installation

1. Clone or download this repository to your local machine.
2. Make sure you have the `utils.py` script in the same directory.
3. Open a terminal or command prompt and navigate to the project directory.
4. Install the required Python packages by running:

```bash
pip install -r requirements.txt
```

## Usage

### Retrieving Unit and Accreditation Data

To retrieve and process unit and accreditation data, follow these steps:

1. Open a terminal or command prompt in the project directory.

2. Run the following command to execute the data retrieval and processing script:

```bash
python scrap.py
```

This script performs the following tasks:
- Retrieves the list of associations units and units groups from EPFL's search API and stores them in `units.json` and `groups.json`.
- Retrieves accreditations from the EPFL LDAP server and stores them in `accreds.json`.
- Computes the size of each unit and updates `units.json`.
- Computes user details and the number of accreditations for each user, saving the results in `users.json`.
- Computes links between units and users and saves them in `links.json`.
- Writes a consolidated data file named `data.json`.

## Visualization
To visualize the data just open the `index.html` file in a web browser with a web server. 

The HTML file provides an interactive visualization of the relationships between units and users. It uses [D3.js](https://d3js.org) with [d3-force](https://d3js.org/d3-force) to render the graph.

### Customization

You can further customize the visualization in the `index.html` file or modify D3.js parameters in the `network.js` file.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```