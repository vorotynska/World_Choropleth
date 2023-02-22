const svg = d3.select('svg'),
    width = +svg.attr('width'),
    height = +svg.attr('heigth');

// Map and projetion
const path = d3.geoPath()
const projection = d3.geoMercator()
    .scale(width / 2 / Math.PI)
    .center([0, 20])
    .translate([width / 2, height / 2])


// Data and color scale
const data = new Map()
const colorScheme = d3.schemeReds[6];
colorScheme.unshift("#eee")
var colorScale = d3.scaleThreshold()
    .domain([1, 6, 11, 26, 101, 1001])
    .range(colorScheme);

//Legend
const g = svg.append('g')
    .attr('class', "legendThreshold")
    .attr('transform', "translate(20,20)");

g.append('text')
    .attr('class', 'caption')
    .attr('x', 0)
    .attr('y', -6)
    .text('Students');

const labels = ['0', '1-5', '6-7', '11-25', '26-100', '101-1000', '> 1000'];
const legend = d3.legendColor()
    .labels(d => labels[d.i])
    .shapePadding(4)
    .scale(colorScale);
svg.select('.legendThreshold')
    .call(legend);

// Load external data and boot
Promise.all([
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function (d) {
        data.set(d.code, +d.pop)
    })
]).then(function (loadData) {
    let topo = loadData[0]

    svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(topo.features)
        .enter().append("path")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr("fill", function (d) {
            // Pull data for this country
            d.total = data.get(d.id) || 0;
            // Set the color
            return colorScale(d.total);
        })
        .style("stroke", "transparent")
        .attr("class", function (d) {
            return "Country"
        })
})