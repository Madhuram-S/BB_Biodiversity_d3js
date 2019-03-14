// declare global variables
var metaDataUrl = "/metadata/"
var samplesUrl = "/samples/"

// get the element for displaying metadata information using d3
var metadata_panel = d3.select("#sample-metadata");

// wash frequency for building gauge
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

// function to sort the samples arr in desc order
function SortSample_desc(arr){
  return arr.sort(function(first, second) {
        return parseFloat(second.sample_values) - parseFloat(first.sample_values);
    });
}

// function to reshape array - not used
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
  // create the data trace
  var pie_data = [{      
    values : chartData.map(d => d.sample_values),
    labels : chartData.map(d => d.otu_id),
    hovertext : chartData.map(d => (d.otu_label).replace(/;/g,"<br>")),
    hoverinfo : 'label+percent+text',
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
  // provide the layout parameters
  var layout = {
    height: 350,
    width: 400,
    title : "Bio-Diversity Top 10",    
    margin: {
      l: 20,
      r: 20,
      b: 70,
      t: 60,
      pad: 0
    },
  };
  // plot the pie chart in the given div element
  Plotly.newPlot("pie", pie_data, layout);
}

function buildBubbleChart(chartData){
  const reducer = (accumulator, currentValue)=> accumulator + currentValue;
  // set bubble size - not used currently
  var bSize_sum = chartData.map(d => d.sample_values).reduce(reducer); 
  var bSize = chartData.map(d => {return (d.sample_values / bSize_sum)*600})

  // construct the buuble trace
  var bubble_data = {
    x : chartData.map(d => d.otu_id),
    y : chartData.map(d => d.sample_values),
    type : "scatter",
    mode : "markers",
    marker : {size : chartData.map(d => d.sample_values),
              sizemode:"diameter",
              sizeref : 2 * Math.max(chartData.map(d => d.sample_values)) / (2000 ** 2),
              color: chartData.map(d => d.otu_id),
              colorscale: 'Rainbow',
              cmin: 0,
              cmax: 3000
            },
    label: chartData.map(d => d.otu_label),
    text : chartData.map(d => d.otu_label)    
  };
  // set the layout parameters
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
// plot the bubble plot
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

    // Calculate the pointer position based on wash requency
    var needlePos_deg = 180;
    if(washFreq == null || washFreq === false || washFreq === 0 || washFreq === ""){
      needlePos_deg = 180;
      washFreq = 0;
    }
    else{      
      needlePos_deg = ((maxWashFreq-washFreq)/maxWashFreq).toFixed(2) * 172;      
    }
    var radius = .65;
    var radians = needlePos_deg * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: to create a pointer triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);
    // create the trace for gauge pointer
    var pntr_trace = { type: 'scatter',
    x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'Wash Frequency',
      text: washFreq,
      hoverinfo: 'text+name'};
    // provide the gauage trace (scale from 0 to 9)
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
    // add trace to data variable
    var data = [pntr_trace,gauge_trace];
    // add layout and style
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
      title: `Belly Button Washing Frequency <br> Sample Wash Frequency : ${washFreq} scrubs per week`,
      height: 400,
      width: 400,
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };

Plotly.newPlot('gauge', data, layout);
}

// function to read the jspn from samples/sample uri and plot the respective charts (pie and bubble)
function buildCharts(sample) {
// Use `d3.json` to fetch the sample data for the plots
//Build a Bubble Chart using the sample data and a Pie Chart only for Top 10 sample_values
  d3.json(`/samples/${sample}`).then(function(data){
    console.log(data);
    pltData = SortSample_desc(data);
    buildPieChart(pltData.slice(0,10));    // plot a pie with top 10 values
    buildBubbleChart(pltData); // plot a bubble chart with all values
    
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
          });
    });
  }

function getWFREQ(sample){
  // get the wash frequency for a given sample
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
