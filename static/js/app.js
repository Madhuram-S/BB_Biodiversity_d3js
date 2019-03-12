// declare global variables
var metaDataUrl = "/metadata/"
var samplesUrl = "/samples/"
// get the element for displaying metadata information using d3
var metadata_panel = d3.select("#sample-metadata");

var maxWashFreq = 9;
var washFreq = 0;

// gauge Colors set
gaugeColors = ['#cc9900','#e6ac00','#ffbf00','#ffc61a','#ffcc33','#ffd24d','#ffdf80','#ffe699',
 '#fff2cc', '#ffffff']
// pie Color Set

pieColors = ['rgba(244, 185, 66,0.6)',
'rgba(65, 217, 244,0.6)',
'rgba(65, 244, 223,0.6)',
'rgba(66, 134, 244,0.6)',
'rgba(123, 140, 131,0.6)',
'rgba(234, 145, 207,0.6)',
'rgba(185, 100, 219,0.6)',
'rgba(35, 11, 22,0.6)',
'rgba(186, 100, 29,0.6)',
'rgba(186, 138, 27,0.6)'];

function SortSample_desc(arr){
  return arr.sort(function(first, second) {
        return parseFloat(second.sample_values) - parseFloat(first.sample_values);
    });
}

function arrReShape(sample){
  newArr = [];
  d3.json(`/samples/${sample}`).then(function(data){
    var val  = data;
    console.log(val);
    keyValues = Object.keys(val);
    console.log(keyValues);

    for(i = 0; i < val.otu_ids.length; i++)
    {
      var tmp = {};
      tmp[keyValues[0]] =  val.otu_ids[i];
      tmp[keyValues[1]] = val.otu_labels[i];
      tmp[keyValues[2]] = val.sample_values[i];
      newArr.push(tmp);
      // newArr.push(`{${keyValues[0]} : ${val.otu_ids[i]}, ${keyValues[1]} : ${val.otu_labels[i]}, ${keyValues[2]} : ${val.sample_values[i]}}`)
    }
    
  console.log(newArr);
  });
  
  
}

function buildPieChart(chartData){
  var pie_data = [{      
    values : chartData.map(d => d.sample_values),
    labels : chartData.map(d => d.otu_id),
    text : chartData.map(d => d.otu_label),
    hoverinfo : 'text+label+percent',
    textinfo:'percent',
    type : "pie",
    marker : {colors: pieColors,
              line : {
                width: 1, color: "white"
              }
            },
    hole: 0.3,
    textfont: {
      size: 10
    }
  }];
  var layout = {
    height: 350,
    width: 400,
    title : "Bio-Diversity Top 10",
    
    margin: {
      l: 20,
      r: 20,
      b: 70,
      t: 30,
      pad: 0
    },
  };
  Plotly.newPlot("pie", pie_data, layout);
}

function buildBubbleChart(chartData){
  
  var bubble_data = {
    x : chartData.map(d => d.otu_id),
    y : chartData.map(d => d.sample_values),
    type : "scatter",
    mode : "markers",
    marker : {size : chartData.map(d => d.sample_values),
              color: chartData.map(d => d.otu_id),
              colorscale: 'Rainbow',
              cmin: 0,
              cmax: 3000
            },
    label: chartData.map(d => d.otu_label),
    text : chartData.map(d => d.otu_label)    
  };

  var layout = {
    height : 500, 
    width : 1200,
    title: "Diversity of Micro-organism in the sample",
    xaxis: {title : "OTU ID",},
    yaxis : {autorange:true},
    margin: {
      l: 90,
      r: 90,
      b: 50,
      t: 90,
      pad: 4
    }
    
  };

  Plotly.newPlot("bubble", [bubble_data], layout);
}

function buildGaugeChart(washFreq){
  
    // calc pie wedge size value
    var pie_values = []; 
    var pie_text = [];
    for(let i=maxWashFreq-1; i >= 0; i--){
      //50% of the pie - just the top semi-circle allocated for the gauge values
      pie_values.push(+50/maxWashFreq),
      pie_text.push(`${i}-${i+1}`)
    }
    // finally add the last wedge of pie that is hidden
    pie_values.push(50),
    pie_text.push("")

    console.log(pie_text);
    
    // Calculate the pointer position based on wash requency
    var needlePos_deg = 180;
    if(washFreq == null || washFreq === false || washFreq === 0 || washFreq === ""){
      needlePos_deg = 180;
    }
    else{      
      needlePos_deg = ((maxWashFreq-washFreq)/maxWashFreq).toFixed(2) * 172;      
    }
    var radius = .65;
    var radians = needlePos_deg * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);
    var pntr_trace = { type: 'scatter',
    x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'Wash Frequency',
      text: washFreq,
      hoverinfo: 'text+name'};
    
    var gauge_trace = { values: pie_values,
      rotation: 90,
      text: pie_text,
      textinfo: 'text',
      textposition:'inside',
      marker: {colors : gaugeColors, alpha: 0.5},
      labels: pie_text,
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    };

    var data = [pntr_trace,gauge_trace];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '850000',
          line: {
            color: '850000'
          }
        }],
        margin: {
          l: 10,
          r: 10,
          b: 10,
          t: 90,
          pad: 4
        },
      title: 'Belly Button Washing Frequency <br> (scrubs per week)',
      height: 400,
      width: 400,
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

Plotly.newPlot('gauge', data, layout);
}

function buildCharts(sample) {

  // Use `d3.json` to fetch the sample data for the plots

    //Build a Bubble Chart using the sample data

    // Build a Pie Chart only for Top 10 sample_values
    
    // Build Gauge chart for displaying washing Frequency

  d3.json(`/samples/${sample}`).then(function(data){
    console.log(data);
    pltData = SortSample_desc(data);
    
    // Build a Pie Chart
    //Only top 10 values are considered for pie chart
    buildPieChart(pltData.slice(0,10));    
    buildBubbleChart(pltData);
    
  });
}

function buildMetadata(sample) {
  // using d3.json retrieve metadata for sample using FLASK Call. 
  // once data is received, remove existing displayed info and display the new metadata
  
    d3.json(metaDataUrl.concat(sample)).then(function(data){
      // remove already displayed
      metadata_panel.selectAll("span").remove();
      
      // For each entries in metadata, display the information
      d3.select("#sample-num").html(sample); // Print the sample number selected
      Object.entries(data).forEach(([key, value]) => {
        if(key !== "sample" && key !== "WFREQ")
          metadata_panel.append("span")
                      .attr("style","font-size: 11px;")
                      .text(`${key} : ${value} | `);
          // metadata_panel.append("br");
          // key === "WFREQ"? washFreq = value: washFreq = washFreq;
        
      });
    });
  }

function getWFREQ(sample){
  d3.json(`/wfreq/${sample}`).then(function(data){
    // Build the Gauge Chart showing number of scrubs per day            
    buildGaugeChart(data);

  });
}


function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(`Sample # ${sample}`)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    
    // arrReShape(firstSample);
    // mapSort(firstSample);
    
    buildCharts(firstSample);
    buildMetadata(firstSample);    
    getWFREQ(firstSample)
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
  getWFREQ(newSample);
  
  
}

// Initialize the dashboard
init();
