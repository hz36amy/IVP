//map
var width = 800;
var height = 800;

var mapSVG = d3.select("#map")
    .append("svg")
    .attr("width",width)
    .attr("height",height);

var projection = d3.geoMercator().center([116, 39]).scale(10000).translate([width/3, height/1.5]);
var path = d3.geoPath().projection(projection)

var group = mapSVG.append("g")

var peking = [116.3, 39.9];  
var proPeking = projection(peking);  

d3.json("https://geo.datav.aliyun.com/areas/bound/geojson?code=110000").then(data => {
        group.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("fill", "#ddd")
            .attr("d", path)

            group.append("circle")  
            .attr("class","point")  
            .attr("cx",proPeking[0])  
            .attr("cy",proPeking[1])
            .attr("fill", "red") 
            .attr("fill-opacity", 0.4)
            .attr("r",8)
        })



//stacked bar chart
//choose site
data = d3.csv("data/PRSA_Data_20130301-20170228/PRSA_Data_Aotizhongxin_20130301-20170228.csv").then(d => drawBars(d));

function drawBars(csv) {
  var input = {'data': csv, 'width': 500, 'height': 300};
  var margin = {top: 10, right: 60, bottom: 20, left: 40},
  width = input.width + margin.left + margin.right,
  height = input.height + margin.top + margin.bottom;

  var svg = d3.select("#stacked-bar-chart")
            .append("svg")
            .attr("viewBox", [0, 0, width, height]);

  var canvas = {svg: svg, margin: margin, width: width, height: height};

  var params = {'input': input, 'canvas': canvas};
  initialize(params);
  update(params);

}

function initialize(params) {
  var canvas = params.canvas,
      input = params.input;

  var svg = canvas.svg,
      margin = params.margin = canvas.margin,
      width = params.width = canvas.width,
      height = params.height = canvas.height;

  var csv = input.data;
  
  var formattedData = formatData(csv);
  var new_csv = formattedData.csv;
  var clusterNames = params.clusterNames = formattedData.clusterNames;

  var chosen = params.chosen = {
    cluster: null
  };

  formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(null, "s"))
    .call(g => g.selectAll(".domain").remove())

  xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call(g => g.selectAll(".domain").remove())

  series = params.series = d3.stack()
    .keys(clusterNames)
  (new_csv)
    .map(d => (d.forEach(v => v.key = d.key), d))

  color = d3.scaleOrdinal()
    .domain(series.map(d => d.key))
    .range(d3.schemeSpectral[series.length])
    .unknown("#ccc")

  //console.log(series)
  
  // heights is a dictionary to store bar height by cluster
  params.heights = setUpHeights(clusterNames, new_csv);


  y = params.y = d3.scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
    .rangeRound([height - margin.bottom, margin.top])

  x = d3.scaleBand()
    .domain(new_csv.map(d => d.month))
    .range([margin.left, width - margin.right])
    .padding(0.1)

  var bar = canvas.bar = svg.selectAll('.bar')
    .enter()
    .append("g")
    .data(series)
    .join("g")
    .attr("class", "bar");

  bar.attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("x", (d, i) => x(d.data.month))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .on('click', function(d, i){
        chosen.cluster = chosen.cluster === i.key ? null : i.key;
        update(params);
    })
    .append("title")
      .text(d => `${d.data.name} ${d.key}
${formatValue(d.data[d.key])}`);

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .attr('class', 'axisY')
      .call(yAxis);

  var legend = params.legend = svg.selectAll('.legend')
      .data(clusterNames)
      .enter().append('g')
      .attr('class', 'legend');

  legend.append('rect')
        .attr('x', width - 18)
        .attr('y', function(d, i) {return 20 * (clusterNames.length - 1 - i);})
        .attr('height', 10)
        .attr('width', 10)
        .attr('fill', function(d){ return color(d);})
        .on('click', function(d, i){
              chosen.cluster = chosen.cluster === i ? null : i;
              update(params);
        });
  
  legend.append('text')
        .attr('x', width - 22)
        .attr('y', function(d, i) { return 20 * (clusterNames.length - 1 - i) ;})
        .text(function(d) {return d;})
        .attr('dy', '.8em')
        .style('text-anchor', 'end');
        
  legend.attr("transform", "translate(0, 100)");

}

function update(params) {
  var chosen = params.chosen,
      svg = params.canvas.svg,
      bar = params.canvas.bar,
      margin = params.canvas.margin,
      y = params.y,
      width = params.width,
      height = params.height,
      heights = params.heights,
      series = params.series,
      legend = params.legend,
      clusterNames = params.clusterNames;
  var transDuration = 700;

  //y axis update
  if(chosen.cluster == null) {   
    y.domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
     .rangeRound([height - margin.bottom, margin.top])
  }
  else {
    y.domain([0, d3.max(heights[chosen.cluster])])
    .rangeRound([height - margin.bottom, margin.top]);
  }

  svg.selectAll('.axisY')
        .transition()
        .duration(transDuration)
        .call(yAxis);
 
  // update legend
  legend.selectAll('rect')
        .transition()
        .duration(transDuration)
        .attr('height', function(d) {return choice(chosen.cluster, d, 10, 10, 0);})
        .attr('y', function(d) {
            var i = clusterNames.indexOf(d);
            if (i > clusterNames.indexOf(chosen.cluster)){
                return choice(chosen.cluster, d, 20 * (clusterNames.length - 1 - i) , 0, 0);
            }
            else {
                return choice(chosen.cluster, d, 20 * (clusterNames.length - 1 - i) , 0,  18);
            }
        });
  legend.selectAll('text')
        .transition()
        .duration(transDuration)
        .attr('y', function(d) {
            var i = clusterNames.indexOf(d);
            if (i > clusterNames.indexOf(chosen.cluster)){
                return choice(chosen.cluster, d, 20 * (clusterNames.length - 1 - i) , 0, 0);
            }
            else {
                return choice(chosen.cluster, d, 20 * (clusterNames.length - 1 - i) , 0,  18);
            }
        })
        .style('font-size' ,function(d, i) {return choice(chosen.cluster, d, '10px', '10px', '0px');})
        .attr('x', function(d) {return choice(chosen.cluster, d, 
            width - 22,
            width - 22,
            width - 22 - this.getComputedTextLength()/2);});

  // update bars
  bar.selectAll('rect')
     .transition()
     .duration(transDuration)
     .attr("y", function(d) {
       console.log(d)
       if (!chosen.cluster) {
        return y(d[1]);} 
       else if (d.key == chosen.cluster) {
        return height - margin.bottom - (y(d[0]) - y(d[1])); // todo
       }
       else {
          return y(0);
        }
       })
     .attr("height", function(d) {
      if (!chosen.cluster) {
        return y(d[0]) - y(d[1]);}
      else if (d.key == chosen.cluster){
        return y(d[0]) - y(d[1]);
      }
      else {
         return 0;
       }
      });

}

function formatData(csv) {
  var new_csv = [];
  new_csv.columns = ["month","PM2.5","PM10","SO2","NO2","CO","O3"];

  var clusterNames = new_csv.columns.slice(1);

  for (var i=1;i<=12;i++)
  { 
    month_data = csv.filter(function(row) {
    return row['month'] == i;
    })

    var PM2_5 = [], PM10 = [], SO2 = [], NO2 = [], CO = [], O3 = [];
    month_data.forEach(element => PM2_5.push(parseFloat(element["PM2.5"])))
    month_data.forEach(element => PM10.push(parseFloat(element.PM10)))
    month_data.forEach(element => SO2.push(parseFloat(element.SO2)))
    month_data.forEach(element => NO2.push(parseFloat(element.NO2)))
    month_data.forEach(element => CO.push(parseFloat(element.CO)))
    month_data.forEach(element => O3.push(parseFloat(element.O3)))

    var obj = {month: i, "PM2.5": d3.mean(PM2_5), PM10: d3.mean(PM10), SO2: d3.mean(SO2), NO2: d3.mean(NO2), CO: d3.mean(CO), O3: d3.mean(O3)}
    new_csv.push(obj)
  }
  return {
    csv: new_csv,
    clusterNames: clusterNames,
  };
}

// handy function to play the update game with the bars and legend
function choice(variable, target, nullCase, targetCase, notTargetCase){
  switch(variable) {
  case null:
      return nullCase;
  case target:
      return targetCase;
  default:
      return notTargetCase;
  }
}

function setUpHeights(clusterNames, csv) {
  var heights = {};
  clusterNames.forEach(function(cluster) { 
      var clusterVec = [];
      csv.forEach(d => clusterVec.push(d[cluster]));
      heights[cluster] = clusterVec;
  });
  return heights;
}

