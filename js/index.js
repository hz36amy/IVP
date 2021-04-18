//map
var width = 800;
var height = 800;
var mapSVG = d3.select("#map")
    .append("svg")
    .attr("width",width)
    .attr("height",height);
var projection = d3.geoMercator().center([116, 39]).scale(10000).translate([width/3, height/1.5]);
var path = d3.geoPath().projection(projection)

d3.json("https://geo.datav.aliyun.com/areas/bound/geojson?code=110000").then(data => {
        mapSVG.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("fill", "#ddd")
            .attr("d", path)
        })

//stacked bar chart

data = d3.csv("https://static.observableusercontent.com/files/cacf3b872e296fd3cf25b9b8762dc0c3aa1863857ecba3f23e8da269c584a4cea9db2b5d390b103c7b386586a1104ce33e17eee81b5cc04ee86929f1ee599bfe?response-content-disposition=attachment%3Bfilename*%3DUTF-8%27%27us-population-state-age.csv").then(d => chart(d))

function chart(csv) {
    margin = ({top: 10, right: 10, bottom: 20, left: 40})
    height = 600
    formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")
    yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call(g => g.selectAll(".domain").remove())
    xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call(g => g.selectAll(".domain").remove())

    series = d3.stack()
    .keys(csv.columns.slice(1))
  (csv)
    .map(d => (d.forEach(v => v.key = d.key), d))

    color = d3.scaleOrdinal()
    .domain(series.map(d => d.key))
    .range(d3.schemeSpectral[series.length])
    .unknown("#ccc")

    y = d3.scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
    .rangeRound([height - margin.bottom, margin.top])

    x = d3.scaleBand()
    .domain(csv.map(d => d.name))
    .range([margin.left, width - margin.right])
    .padding(0.1)

    svg = d3.select("#stacked-bar-chart")
      .append("svg")
      .attr("viewBox", [0, 0, width, height]);

  svg.append("g")
    .selectAll("g")
    .data(series)
    .join("g")
      .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("x", (d, i) => x(d.data.name))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
    .append("title")
      .text(d => `${d.data.name} ${d.key}
${formatValue(d.data[d.key])}`);

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

}

