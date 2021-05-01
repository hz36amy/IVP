console.log("Connect success!")

// data
data = d3.csv("data/PRSA_Data_20130301-20170228/human-factor.csv").then(d => RQ5(d));

// draw line chart RQ5
function RQ5(csv) {
    var input = {'data': csv, 'width': 500, 'height': 300};
    var margin = {top: 30, right: 60, bottom: 40, left: 120},
    width = input.width + margin.left + margin.right,
    height = input.height + margin.top + margin.bottom;
  
    var svgLineRQ5 = d3.select("#human-factor")
              .append("svg")
              .attr("viewBox", [0, 0, width, height])
              .attr("id", "human-factor-box");
  
    var canvas = {svg: svgLineRQ5, margin: margin, width: width, height: height};
  
    //var params = {'input': input, 'canvas': canvas};
    // params.input = input;
    // params.canvas = canvas;
  
    var params1 = {'input': input, 'canvas': canvas};
    initialize_RQ5(params1);
}

function initialize_RQ5(params) {
    var canvas = params.canvas,
    input = params.input;

    var svg = canvas.svg,
    margin = params.margin = canvas.margin,
    width = params.width = canvas.width,
    height = params.height = canvas.height;

    var csv = input.data;
    console.log(csv);
    dataRQ5 = sortdataRQ5(csv);

    //console.log(data)


    var Names =  ["Industrial", "GDP", "Population"];
    colorsRQ5 = d3.scaleOrdinal(Names, d3.schemeSet1);

    var p = dataRQ5.flat().map(d => d.growth);
    yMin = d3.min(p);
    yMax = d3.max(p);
    
    // Build y scale and axis
    y = params.y = d3.scaleLinear()
    .domain([yMin,yMax])
    .rangeRound([height - margin.bottom, margin.top]);

    yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call(g => g.select(".domain").remove());

    // Build x scale and axis
    startDate = data[0][0].year;
    endDate = data[0][3].year;
    const x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([margin.left, width - margin.right]);

    axis0 = svg.append("line")
               .attr("x1", margin.left)
               .attr("x2", width-margin.right)
               .attr("y1", y(0))
               .attr("y2", y(0))
               .style('stroke', 'gray')
               .style('stroke-width', 2)
               .attr("class", "dashed")

    // linear scale for tooltip position
    x_l = d3.scaleLinear()
    .domain([2013,2016])
    .range([margin.left, width - margin.right]);

    xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5));

    line = d3.line()
      .x(d => x(d.year))
      .y(d => y(d.growth));

    svg.append("text")
      .attr("transform", `translate(${margin.left + 3},${margin.top - 8})`)
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .text("(%)")
      .style("text-anchor", "end");



    // add lines
    var linechart = canvas.line = svg.selectAll('path')
      .data(dataRQ5)
      .join('path')
      .attr('d', line)
      .call(transition)
      .style('stroke-width',2)
      .style('stroke', d => colorsRQ5(`${d[0].type}`))
      .style('fill', 'none')
      .append("title")
      .text(d => `${d[0].type}`);
 
    svg.append("g")
      .call(xAxis);

    svg.append("g")
      .attr('class', 'axisY')
      .call(yAxis);

    var legend = params.legend = svg.selectAll('.legend')
      .data(Names)
      .enter().append('g')
      .attr('class', 'legend');

    legend.append('rect')
        .attr('x', margin.left - 46)
        .attr('y', function(d, i) {return 20 * (Names.length - 1.4 - i);})
        .attr('height', 10)
        .attr('width', 10)
        .attr('fill', function(d){ return colorsRQ5(d);});
  
    legend.append('text')
        .attr('x', margin.left - 50)
        .attr('y', function(d, i) { return 20 * (Names.length - 1 - i) ;})
        .text(function(d) {return d;})
        .style('font-size', '10px')
        .attr("font-family", "sans-serif")
        .style('text-anchor', 'end');
        
    legend.attr("transform", `translate(0, 120)`);

    tooltipLineRQ5 = svg.append('line');

    tipBoxRQ5 = svg.append('rect')
			    .attr('width', width - margin.left - margin.right)
			    .attr('height', height - margin.top - margin.bottom)
                .attr('x', margin.left)
                .attr('y', margin.top)
			    .attr('opacity', 0)
			    .on('mouseover', function(event, d) {
                    drawTooltipRQ5(event,dataRQ5);
                })
                .on('mouseout', removeTooltip)
                .attr("id", "tipBoxRQ5");

}

function sortdataRQ5(csv) {
    var new_csv = [];

    var Industrial = csv.filter(function(row) {
        return row['type'] == 'Industrial'
    });

    var GDP = csv.filter(function(row) {
        return row['type'] == 'GDP'
    });

    var Population = csv.filter(function(row) {
        return row['type'] == 'Population'
    });

    new_csv.push(Industrial);
    new_csv.push(GDP);
    new_csv.push(Population);

    parseDate = d3.timeParse("%Y-%m-%d");
    new_csv.forEach(element => parseDate(element["year"]));

    for(i = 0; i < new_csv.length; i++) {
      for(j = 0; j < new_csv[i].length; j++) {
          //console.log(new_csv.length)
          new_csv[i][j].year = parseDate(new_csv[i][j].year)
          new_csv[i][j].growth = parseFloat(new_csv[i][j].growth)
      }
    }

    //console.log(new_csv)
    return new_csv;
}

function drawTooltipRQ5(event, data) {

    var years = [2013, 2014, 2015, 2016];
    const[x_, y_] = d3.pointer(event);
    //console.log(x_);
    //console.log(y_);
    //console.log(d3.pointer(event,this)[0]);
    const year = Math.floor(x_l.invert(x_)+0.5);
    
    tooltipLineRQ5.attr('stroke', 'black')
      .attr('x1', x_l(year))
      .attr('x2', x_l(year))
      .attr('y1', 40)
      .attr('y2', 330);
    
    var box = document.getElementById("human-factor-box");
    left = box.getBoundingClientRect().left;
    top_ = box.getBoundingClientRect().top;
    //console.log(box.getBoundingClientRect().top);
    
    tooltip.html(year)
      .style('display', 'block')
      .style('left', x_ + left +'px')
      .style('top', y_ + top_ +'px')
      .selectAll()
      .data(data).enter()
      .append('div')
      .style('color', d => colorsRQ5(`${d[0].type}`))
      .html(function(d) {
              type = d[0].type;
              i = years.indexOf(year);
              perc = d[i].growth;
              text = type + ": " + perc;
              //console.log(text);
              return text;
          });

  }