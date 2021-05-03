// RQ1
// Map visualization
map = d3.json("https://geo.datav.aliyun.com/areas/bound/geojson?code=110000").then(d => drawMap(d));

var coordinates = {
  "Aotizhongxin": [116.397,39.982],
  "Changping": [116.234,40.217],
  "Dingling": [116.22,40.292],
  "Dongsi": [116.417,39.929],
  "Guanyuan": [116.339,39.929],
  "Gucheng": [116.176,39.914],
  "Huairou": [116.628,40.328],
  "Nongzhanguan": [116.461,39.937],
  "Shunyi": [116.655,40.127],
  "Tiantan": [116.407,39.886],
  "Wanliu": [116.287,39.987],
  "Wanshouxigong": [116.352,39.878]
}

var all_sites = Object.keys(coordinates);
var mapText = false;
var params = {};
var chosen = {
  cluster: null,
  site: null
};
params.chosen = chosen;

function drawMap(data) {
  var width = 500,
      height = 500;

  var mapSVG = d3.select("#map")
      .append("svg")
      .attr("width",width)
      .attr("height",height);

  var projection = d3.geoMercator().center([116, 39]).scale(11000).translate([width/3, height + 100]);
  var path = d3.geoPath().projection(projection)

  var group = mapSVG.append("g")

  group.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("fill", "#eee")
        .attr("d", path)

  var names = Object.keys(coordinates)

  for(var i=0; i<names.length; i++) {
    var name = names[i];
    //console.log(coordinates[names[i]]);
    var proj = projection(coordinates[names[i]]);

    group.append("circle")  
        .attr("class", name)  
        .attr("cx",proj[0])  
        .attr("cy",proj[1])
        .attr("fill", "red") 
        .attr("fill-opacity", 0.3)
        .attr("r",8)
        .append("title")
        .text(name)
  }

  group.selectAll("circle")
       .on("mouseover",function(){
        d3.select(this).attr("fill","orange").attr("fill-opacity", 1);})
       .on("mouseout",function(){
         if(chosen.site == d3.select(this).attr("class")) {
          d3.select(this).attr("fill","orange").attr("fill-opacity", 1);
         } else {
          d3.select(this).attr("fill","red").attr("fill-opacity", 0.3);
         }})
       .on('click', function(d, i){
          var site_name = d3.select(this).attr("class");
          chosen.site = chosen.site === site_name ? null : site_name;
          params.chosen = chosen;
          if(chosen.site == null) {
            d3.select(this).attr("fill","red").attr("fill-opacity", 0.3).attr("stroke", null);
          } else {
            d3.select(this).attr("fill","orange").attr("fill-opacity", 1).attr("stroke", "brown");
          }
          initialize(params);
          update(params);
       })

}

// Stacked bar chart
data = d3.csv("data/PRSA_Data_20130301-20170228/data.csv").then(d => drawBars(d));

function drawBars(csv) {
  var input = {'data': csv, 'width': 500, 'height': 300};
  var margin = {top: 40, right: 60, bottom: 40, left: 40},
  width = input.width + margin.left + margin.right,
  height = input.height + margin.top + margin.bottom;

  var svg = d3.select("#stacked-bar-chart")
            .append("svg")
            .attr("viewBox", [0, 0, width, height]);

  var canvas = {svg: svg, margin: margin, width: width, height: height};

  //var params = {'input': input, 'canvas': canvas};
  params.input = input;
  params.canvas = canvas;

  initialize(params);
  update(params);

}

function initialize(params) {
  d3.select('#stacked-bar-chart svg')
      .selectAll('*')
      .remove();

  var canvas = params.canvas,
      input = params.input;

  var svg = canvas.svg,
      margin = params.margin = canvas.margin,
      width = params.width = canvas.width,
      height = params.height = canvas.height;

  var site = chosen.site;

  var csv = input.data;

  var site_max = findMax(csv).max;
  var site_min = findMax(csv).min;
  var site_mean = findMax(csv).mean_list;
  //console.log(site_max);

  if (site == null) {
    site = "All sites";
  } else {
    site = site;
    new_csv = [];
    for(var i=0; i<csv.length; i++) {
      if(csv[i].station == site) {
        new_csv.push(csv[i]);
      }    
    }
    csv = new_csv;
  }

  var radius = [5, 9, 13, 15];
  var rScale = d3.scaleQuantize()
                 .domain([site_min, site_max])
                 .range(radius);

  changeCircles(rScale, site_mean);

  // circle legend
  var mapLegend = d3.select("#map svg")
                    .append("g")
                    .attr("class", "legend")
                    .attr("transform", `translate(${margin.left},${margin.top+50})`)

  var legendData = [
    {value: 15, d: 'Most polluted'},
    {value: 13, d: ''},
    {value: 9, d: ''},
    {value: 5, d: ''}
  ];

  var dy = 20;

  mapLegend.selectAll("circle.legend-element")
           .data(legendData)
           .enter().append("circle")
           .attr("class", "legend-element")
           .attr("cx", 0)
           .attr("cy", function(d,i) {
             return i * dy;
           })
           .attr("r", function(d) {
             return d.value;
           });

  if(!mapText) {
    mapLegend.selectAll("text.legend-element")
           .data(legendData)
           .enter().append("text")
           .attr("x", 20)
           .attr("y", function(d,i) {
             return i * dy + 5;
           })
           .attr("font-size", "13px")
           .attr("font-family", "sans-serif")
           .text(function(d) {
             return d.d;
           });
    mapText = true;
  }

  var formattedData = formatData(csv);
  var new_csv = formattedData.csv;
  var clusterNames = params.clusterNames = formattedData.clusterNames;

  formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  yAxis0 = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y0).ticks(null, "s"))
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
  
  // heights is a dictionary to store bar height by cluster
  params.heights = setUpHeights(clusterNames, new_csv);


  y0 = params.y = d3.scaleLinear()
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
    .rangeRound([height - margin.bottom, margin.top])

  x = d3.scaleBand()
    .domain(new_csv.map(d => d.month))
    .range([margin.left, width - margin.right])
    .padding(0.2)
 

  // Tooltip
  var div = d3.select("#RQ1").append("div")
              .attr("class","d3-tip")
              .style("opacity",0);

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
      .attr("y", d => y0(d[1]))
      .attr("height", d => y0(d[0]) - y0(d[1]))
      .attr("width", x.bandwidth())
      .on('click', function(d, i){
        chosen.cluster = chosen.cluster === i.key ? null : i.key;
        update(params);
    })
    .append("title")
      .text(d => `${site} ${d.key}
${formatValue(d.data[d.key])}`);

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .attr('class', 'axisY')
      .call(yAxis0);

  svg.append("text")
     .attr("transform", `translate(${width-margin.right},${height-margin.bottom+5})`)
     .attr("font-size", 10)
     .attr("font-family", "sans-serif")
     .text("Month");

  svg.append("text")
     .attr("transform", `translate(${(width+margin.left-margin.right)/2},${margin.top/2})`)
     .attr("dy", ".3em")
     .style("text-anchor", 'middle')
     .attr("font-family", "sans-serif")
     .text(site);

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
        //.style('font-size', '10px')
        .style('text-anchor', 'end')
        .attr("font-family", "sans-serif");
        
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

  // update circles
  d3.selectAll("circle")
       .attr("fill", function() {
        if(chosen.site != d3.select(this).attr("class")) {
          return "red";
         }})
       .attr("fill-opacity", function() {
          if(chosen.site != d3.select(this).attr("class")) {
            return 0.3;
           }})
       .attr("stroke", function() {
        if(chosen.site != d3.select(this).attr("class")) {
          return null;
         } else {
           return "brown";
         }})
       .attr("mouse-over", function() {
        if(chosen.site == d3.select(this).attr("class")) {
          d3.select(this).attr("fill","orange").attr("fill-opacity", 1);
        }});


  // update y-axis
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
        .call(yAxis0);
 
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
        return choice(chosen.cluster, d.key, y(d[1]), height - margin.bottom - (y(d[0]) - y(d[1])), y(0));
       })
     .attr("height", function(d) {
         return choice(chosen.cluster, d.key, y(d[0]) - y(d[1]), y(d[0]) - y(d[1]), 0);
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

  //console.log(new_csv)
  var sum = [];
  for (var i=0; i<new_csv.length; i++){
    sum.push(new_csv[i]['PM2.5'] + new_csv[i]['PM10'] + new_csv[i]['SO2'] + new_csv[i]['NO2'] + new_csv[i]['CO'] + new_csv[i]['O3']);
  }
  var mean = d3.mean(sum)

  return {
    csv: new_csv,
    clusterNames: clusterNames,
    mean: mean
  };
}

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

function findMax(csv) {
  var mean_list = [];

  for(var i=0; i<all_sites.length; i++) {
    new_csv = [];
    site = all_sites[i];
    for(var j=0; j<csv.length; j++) {
      if(csv[j].station == site) {
        new_csv.push(csv[j]);
      }    
    }
    mean = formatData(new_csv).mean;
    mean_list.push(mean);
  }

  //console.log(mean_list)

  return {
    max: d3.max(mean_list),
    mean_list: mean_list,
    min: d3.min(mean_list)
  }
}

function changeCircles(rScale, site_mean) {

  d3.selectAll("circle")
    .attr('r', function(d, i){
      var site_name = d3.select(this).attr("class");
      //console.log(site_mean[all_sites.indexOf(site_name)]);
      return rScale(site_mean[all_sites.indexOf(site_name)]);
 })
}