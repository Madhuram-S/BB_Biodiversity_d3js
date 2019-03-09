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



function buildMetadata(sample) {
  // Function that takes sample id and provides the metadata for the sample
  
  // get the element for displaying metadata information
  var metadata_panel = d3.select("#sample-metadata");

  
  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`
    d3.json(`/metadata/${sample}`).then(function(data){
      
      metadata_panel.selectAll("span").remove();
      metadata_panel.selectAll("br").remove();
      Object.entries(data).forEach(([key, value]) => {
        metadata_panel.append("span")
                      .attr("style","font-size: 11px;")
                      .text(`${key} : ${value}`);
        metadata_panel.append("br");
      });
      
    });
    
     
    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
}

function buildPieChart(chartData){
  var pie_data = [{      
    values : chartData.map(d => d.sample_values),
    labels : chartData.map(d => d.otu_id),
    text : chartData.map(d => d.otu_label),
    hoverinfo : 'label+percent+text',
    textinfo:'percent',
    type : "pie"
  }];
  var layout = {
    height: 400,
    width: 600
  };
  Plotly.plot("pie", pie_data, layout);
}

function buildBubbleChart(chartData){
  var bubble_data = {
    x : chartData.map(d => d.otu_id),
    y : chartData.map(d => d.sample_values),
    type : "scatter",
    mode : "markers",
    marker : {size : chartData.map(d => d.sample_values), color : chartData.map(d => d.otu_id)},
    label: chartData.map(d => d.otu_label),
    text : chartData.map(d => d.otu_label)
  };

  var layout = {
    height : 600, 
    width : 1000
  };

  Plotly.plot("bubble", [bubble_data], layout);
}
function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots

    // @TODO: Build a Bubble Chart using the sample data

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
  

  d3.json(`/samples/${sample}`).then(function(data){
    console.log(data);
    pltData = SortSample_desc(data);
    
    // Build a Pie Chart
    //Only top 10 values are considered for pie chart
    buildPieChart(pltData.slice(0,10));
    
    buildBubbleChart(pltData);
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
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    
    // arrReShape(firstSample);
    buildCharts(firstSample);
    buildMetadata(firstSample);

  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
