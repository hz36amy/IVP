console.log("Connect success!")

// var params = {};
// var chosen = {
//   cluster: null,
//   site: null
// };
// params.chosen = chosen;

// data
data = d3.csv("data/PRSA_Data_20130301-20170228/air-quality-overall.csv").then(d => drawLines(d));

// draw line chart
function drawLines(csv) {
    var input = {'data': csv, 'width': 500, 'height': 300};
    var margin = {top: 30, right: 60, bottom: 40, left: 120},
    width = input.width + margin.left + margin.right,
    height = input.height + margin.top + margin.bottom;
  
    var svgLine = d3.select("#line-chart")
              .append("svg")
              .attr("viewBox", [0, 0, width, height]);
  
    var canvas = {svg: svgLine, margin: margin, width: width, height: height};
  
    //var params = {'input': input, 'canvas': canvas};
    // params.input = input;
    // params.canvas = canvas;
  
    var params1 = {'input': input, 'canvas': canvas};
    initialize_line(params1);
    // update(params);
}

function initialize_line(params) {
    var canvas = params.canvas,
    input = params.input;

    var svg = canvas.svg,
    margin = params.margin = canvas.margin,
    width = params.width = canvas.width,
    height = params.height = canvas.height;

    var csv = input.data;
    data = sortdata(csv);


    var pollutionNames =  ["PM2.5", "PM10", "SO2", "NO2", "CO", "O3"];
    var colors = d3.scaleOrdinal(pollutionNames, d3.schemeSpectral[pollutionNames.length]);


    startDate = data[0][0].year;
    endDate = data[0][3].year;
    x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([margin.left, width - margin.right])

    var p = data.flat().map(d => parseFloat(d.percentage));
    // console.log(p)
    yMin = d3.min(p);
    yMax = d3.max(p);
    
    y = params.y = d3.scaleLinear()
    .domain([yMin,yMax])
    .rangeRound([height - margin.bottom - 30, margin.top])

    yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call(g => g.select(".domain").remove())

    xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5))

    line = d3.line()
      .x(d => x(d.year))
      .y(d => y(parseFloat(d.percentage)))
      .curve(d3.curveBasis)

    svg.append("text")
      .attr("transform", `translate(${margin.left + 3},${margin.top - 8})`)
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .text("(%)")
      .style("text-anchor", "end");

    var linechart = canvas.line = svg.selectAll('path')
      .data(data)
      .join('path')
      .attr('class', function(d) {
          if(d[0].pollution == "PM2.5 standard") {
              return 'dashed';
          } else {
              return 'solid';
          }
      })
      .attr('d', line)
      .call(transition)
      .style('stroke-width',2)
      .style('stroke', d => colors(`${d[0].pollution}`))
      .style('fill', 'none')
      .append("title")
      .text(d => `${d[0].pollution}`);
 
    

    svg.append("g")
      .call(xAxis);

    svg.append("g")
      .attr('class', 'axisY')
      .call(yAxis);

    svg.call(hover, linechart);

    var legend = params.legend = svg.selectAll('.legend')
      .data(pollutionNames)
      .enter().append('g')
      .attr('class', 'legend');

    legend.append('rect')
        .attr('x', margin.left - 46)
        .attr('y', function(d, i) {return 20 * (pollutionNames.length - 1.4 - i);})
        .attr('height', 10)
        .attr('width', 10)
        .attr('fill', function(d){ return colors(d);});
  
    legend.append('text')
        .attr('x', margin.left - 50)
        .attr('y', function(d, i) { return 20 * (pollutionNames.length - 1 - i) ;})
        .text(function(d) {return d;})
        .style('font-size', '10px')
        .attr("font-family", "sans-serif")
        .style('text-anchor', 'end');
        
    legend.attr("transform", `translate(0, 120)`);

}

function sortdata(csv) {
    var new_csv = [];

    var PM25 = csv.filter(function(row) {
        return row['pollution'] == 'PM2.5'
    });

    var PM10 = csv.filter(function(row) {
        return row['pollution'] == 'PM10'
    });

    var SO2 = csv.filter(function(row) {
        return row['pollution'] == 'SO2'
    });

    var NO2 = csv.filter(function(row) {
        return row['pollution'] == 'NO2'
    });

    var CO = csv.filter(function(row) {
        return row['pollution'] == 'CO'
    });

    var O3 = csv.filter(function(row) {
        return row['pollution'] == 'O3'
    });

    var standard = csv.filter(function(row) {
        return row['pollution'] == 'PM2.5 standard'
    });

    new_csv.push(PM25);
    new_csv.push(PM10);
    new_csv.push(SO2);
    new_csv.push(NO2);
    new_csv.push(CO);
    new_csv.push(O3);
    new_csv.push(standard);

    parseDate = d3.timeParse("%Y-%m-%d");
    new_csv.forEach(element => parseDate(element["year"]));

    for(i = 0; i < new_csv.length; i++) {
      for(j = 0; j < new_csv[i].length; j++) {
          console.log(new_csv.length)
          new_csv[i][j].year = parseDate(new_csv[i][j].year)
      }
    }

    console.log(new_csv);
    return new_csv;
}

function hover(svg, path) {

}

function transition(path) {
    path.transition()
        .duration(10000)
        .attrTween("stroke-dasharray", tweenDash)
        .on("end", ()=>{d3.select(this).call(transition)});
}

function tweenDash() {
    const l = this.getTotalLength(),
        i = d3.interpolateString("0," + l, l + "," + l);
    return function(t) { return i(t) };
}