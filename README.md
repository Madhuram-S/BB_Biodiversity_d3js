# Belly Button Biodiversity

This exercise aims to build an interactive dashboard to explore the [Belly Button Biodiversity DataSet](http://robdunnlab.com/projects/belly-button-biodiversity/).

Application uses Flask to deliver the data in JSON format to create plots through the usage of flask routes 

## Step 1 - Creating interactive Plots using Plotly.js

* A PIE chart that uses data from your samples route (`/samples/<sample>`) to display the top 10 samples. The pie uses

  * `sample_values` as the values for the PIE chart

  * `otu_ids` as the labels for the pie chart

  * `otu_labels` as the hovertext for the chart

  ![PIE Chart](Images/pie_chart.png)

* Build a Bubble Chart that uses data from samples route (`/samples/<sample>`) to display each sample using,

  * `otu_ids` for the x values

  * `sample_values` for the y values

  * `sample_values` for the marker size

  * `otu_ids` for the marker colors

  * `otu_labels` for the text values

  ![Bubble Chart](Images/bubble.png)

* Drop Down selection of various sample metadata from the route `/metadata/<sample>` giving interactivity to user

  * Display each key/value pair from the metadata JSON object somewhere on the page

* Update all of the plots any time that a new sample is selected.

* Adaptation of Gauge Chart (code based on <https://plot.ly/javascript/gauge-charts/>) to plot the Weekly Washing Frequency obtained from the route `/wfreq/<sample>`

* The gauge shows the wash frequency that has values ranging from 0 - 9.

* Gauge is updated when a new sample is selected

![Weekly Washing Frequency Gauge](Images/gauge.png)

## Step 2 - Heroku Deployment

Deploy your Flask app to Heroku.

- - -
### Copyright

Data Boot Camp © 2018. All Rights Reserved.
