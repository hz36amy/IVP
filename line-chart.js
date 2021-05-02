console.log("Connect success!")

var tipBox;
var x_l;
var tooltipLine;
var tooltipLineRQ5;
var colors;

const tooltip = d3.select('#tooltip');
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
              .attr("viewBox", [0, 0, width, height])
              .attr("id", "line-chart-box");
  
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
    colors = d3.scaleOrdinal(pollutionNames, d3.schemeSpectral[pollutionNames.length]);

    var p = data.flat().map(d => parseFloat(d.percentage));
    // console.log(p)
    yMin = d3.min(p);
    yMax = d3.max(p);
    
    // Build y scale and axis
    y = params.y = d3.scaleLinear()
    .domain([yMin,yMax])
    .rangeRound([height - margin.bottom - 30, margin.top]);

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

    // linear scale for tooltip position
    x_l = d3.scaleLinear()
    .domain([2013,2016])
    .range([margin.left, width - margin.right]);

    xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(5));

    line = d3.line()
      .x(d => x(d.year))
      .y(d => y(parseFloat(d.percentage)))
      .curve(d3.curveBasis);

    svg.append("text")
      .attr("transform", `translate(${margin.left + 3},${margin.top - 8})`)
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .text("(%)")
      .style("text-anchor", "end");



    // add lines
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
      .call(d => transition(d, "RQ4-content"))
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

    tooltipLine = svg.append('line');

    tipBox = svg.append('rect')
			    .attr('width', width - margin.left - margin.right)
			    .attr('height', height - margin.top - margin.bottom)
                .attr('x', margin.left)
                .attr('y', margin.top)
			    .attr('opacity', 0)
                .on('mousemove', function(event, d) {
                    drawTooltip(event,data);
                })
			    .on('mouseover', function(event, d) {
                    drawTooltip(event,data);
                })
                .on('mouseout', removeTooltip)
                .attr('id', 'tipBox');


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
          //console.log(new_csv.length)
          new_csv[i][j].year = parseDate(new_csv[i][j].year)
      }
    }

    //console.log(new_csv);
    return new_csv;
}

function hover(svg, path) {

}

function transition(path, content) {
    thisDiv = document.getElementById(content);
    if(thisDiv.style.display == "block") {
        path.transition()
        .duration(10000)
        .attrTween("stroke-dasharray", tweenDash)
        .on("end", ()=>{d3.select(this).call(transition)});
    } 
}

function tweenDash() {
    const l = this.getTotalLength(),
        i = d3.interpolateString("0," + l, l + "," + l);
    return function(t) { return i(t) };
}

function removeTooltip() {

    if (tooltip) tooltip.style('display', 'none');
    if (tooltipLine) tooltipLine.attr('stroke', 'none');
    if (tooltipRQ5) tooltipRQ5.style('display', 'none');
    if (tooltipLineRQ5) tooltipLineRQ5.attr('stroke', 'none');
  }
  
function drawTooltip(event, data) {

    var years = [2013, 2014, 2015, 2016];
    const[x_, y_] = d3.pointer(event);
    //console.log(x_);
    //console.log(y_);
    //console.log(d3.pointer(event,this)[0]);
    const year = Math.floor(x_l.invert(x_)+0.5);
    //console.log(year);
    
    tooltipLine.attr('stroke', 'black')
      .attr('x1', x_l(year))
      .attr('x2', x_l(year))
      .attr('y1', 40)
      .attr('y2', 330);
    
    var box = document.getElementById("line-chart-box");
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
      .style('color', d => colors(`${d[0].pollution}`))
      .html(function(d) {
          if(d[0].pollution != "PM2.5 standard") {
              pollution = d[0].pollution;
              i = years.indexOf(year);
              perc = d[i].percentage;
              //console.log(typeof(perc));
              perc = perc.substr(0,5);
              text = pollution + ": " + perc;
              //console.log(text);
              return text;
          }
      });

  }