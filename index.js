let countyURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'
let educationURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'

let countyData;
let educationData;

const svg = d3.select('svg'),
    width = +svg.attr('width'),
    height = +svg.attr('heigth')




const colorScheme = d3.schemeReds[6];
colorScheme.unshift("#eee")
var colorScale = d3.scaleThreshold()
    .domain([3, 21, 30, 39, 48, 60])
    .range(colorScheme);

d3.json(countyURL).then(
    (data, error) => {
        if (error) {
            console.log(log)
        } else {
            countyData = topojson.feature(data, data.objects.counties).features
            console.log(countyData)

            d3.json(educationURL).then(
                (data, error) => {
                    if (error) {
                        console.log(error)
                    } else {
                        educationData = data
                        console.log(educationData)

                        const tooltip = d3.select("body")
                            .append("div")
                            .style("visibility", "hidden")
                            .attr('id', 'tooltip')
                            .attr("class", "tooltip")
                            .style("background-color", "beige")
                            .style("border", "solid")
                            .style("border-width", "2px")
                            .style("border-radius", "5px")
                            .style("padding", "5px")

                        let mouseOver = function (e, d) {

                            d3.selectAll(".Country")
                                .transition()
                                .duration(200)
                                .style("opacity", .5)
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .style("opacity", 1)
                                .style("stroke", "black");
                            tooltip.style("visibility", "visible")
                                .style("left", e.pageX + 10 + "px")
                                .style("top", e.pageY - 80 + "px")
                                .attr('data-education', () => {
                                    let eduMatch = educationData.filter(data => data.fips == d.id);
                                    if (eduMatch[0]) {
                                        return eduMatch[0].bachelorsOrHigher;
                                    }
                                    return 0;
                                })
                                .html(() => {
                                    let eduMatch = educationData.filter(data => data.fips == d.id);
                                    if (eduMatch[0]) {
                                        return `${eduMatch[0].area_name}, ${eduMatch[0].state}<br/> ${eduMatch[0].bachelorsOrHigher}%`
                                    }
                                    return 0;
                                })
                        }

                        let mouseLeave = function (d) {
                            d3.selectAll(".Country")
                                .transition()
                                .duration(200)
                                .style("opacity", .8)
                            d3.select(this)
                                .transition()
                                .duration(200)
                                .style("stroke", "transparent");
                            tooltip
                                .style('visibility', 'hidden')
                        }

                        svg.selectAll('path')
                            .data(countyData)
                            .enter()
                            .append('path')
                            .attr('d', d3.geoPath())
                            .attr('class', 'county')
                            .attr('fill', (countyDataItem) => {
                                let id = countyDataItem['id']
                                let county = educationData.find((item) => {
                                    return item['fips'] === id
                                })
                                let percentage = county['bachelorsOrHigher']
                                return colorScale(percentage)

                            })
                            .attr('data-fips', (countyDataItem) => {
                                return countyDataItem['id']
                            })
                            .attr('data-education', (countyDataItem) => {
                                let id = countyDataItem['id']
                                let county = educationData.find((item) => {
                                    return item['fips'] === id
                                })
                                let percentage = county['bachelorsOrHigher']
                                return percentage

                            })
                            .on("mouseover", mouseOver)
                            .on("mouseleave", mouseLeave)



                        //Legend
                        const g = svg.append('g')
                            .attr('class', "legendThreshold")
                            .attr('id', 'legend')
                            .attr('transform', "translate(20,20)");

                        g.append('text')
                            .attr('id', 'description')
                            .attr('class', 'caption')
                            .attr('x', 0)
                            .attr('y', -6)
                            .text('Education');

                        const labels = ['3%', '21%', '30%', '39%', '48%', '60%', '> 60%'];
                        const legend = d3.legendColor()
                            .labels(d => labels[d.i])
                            .shapePadding(4)
                            .scale(colorScale);
                        svg.select('.legendThreshold')
                            .call(legend);

                        g.append("text")
                            .attr('id', 'title')
                            .attr("x", (width / 2))
                            .attr("y", height + 10)
                            .attr("text-anchor", "middle")
                            .style("font-size", "32px")
                            .text("United States Educational Attainment");


                    }

                }
            )
        }
    }
)

/*const svg = d3.select('svg'),
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
})*/