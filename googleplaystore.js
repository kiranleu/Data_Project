// Function for the alert box that runs before the data is loaded
// We inform the user that mobile phone viewport is not advised!

//   Reload: resizing the window Width
let windowWidth = document.documentElement["clientWidth"];

window.onresize = function() {
    location.reload();
}

//Running queue to get the csv data document open
queue()
    .defer(d3.csv, "googleplaystore.csv")
    .await(makeCharts);

function makeCharts(error, transactionsData) {
    let ndx = crossfilter(transactionsData);

    let chartWidth = 300;

    if (windowWidth < 768) {
        chartWidth = windowWidth;

    }
    else {
        chartWidth = windowWidth / 3;
    }
    
    

    ///Review By Category Chart  Bar Chart//////////

    let categoryDim = ndx.dimension(dc.pluck("Category"));
    let totalAppDownloaded = categoryDim.group().reduceSum(dc.pluck("Reviews"));

    let appCategoryChart = dc.barChart("#appCategoryChart");
    let categoryColors = d3.scale.ordinal().range(["#00A1F1", "#7CBB00", "#FFBB00", "#F65314"]);

    appCategoryChart
        .width(600)
        .height(400)
        .colorAccessor(function(d) {
            return d.key
        })
        .colors(categoryColors)
        .dimension(categoryDim)
        .group(totalAppDownloaded)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Category")
        .renderlet(function(chart) {
            chart.selectAll("g.x text")
                .attr("y", -3)
        })
        .yAxisLabel("Reviews")
        .elasticY(true)
        .transitionDuration(500)
        .yAxis().ticks(3);

    /////Review By Content Chart    Pie Chart/////////
    let contentDim = ndx.dimension(dc.pluck("Size"));
    let ratingAppDownloaded = contentDim.group().reduceSum(dc.pluck("Reviews"));
    let ratingAppDownloaded2 = contentDim.group().reduceSum(dc.pluck("Reviews"));


    let appTypeChart = dc.pieChart("#appTypeChart");
    let categoryColors1 = d3.scale.ordinal().range(["#00A1F1", "#7CBB00", "#FFBB00", "#F65314", "red"])


    appTypeChart
        .width(600)
        .height(500)
        .radius(100)
        .slicesCap(4)
        .innerRadius(100)
     
        // .externalLabels(40)
        .externalRadiusPadding(-150)
        .drawPaths(true)
        .colorAccessor(function(d) {
            return d.key
        })
        .transitionDuration(1500)
        .colors(categoryColors1)
        .dimension(contentDim)
        .group(ratingAppDownloaded2)
        .on('pretransition', function(chart) {
        chart.selectAll('text.pie-slice').text(function(d) {
            return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
        });
    });



    /////Review By Category and Content Rating Chart  Linear Chart//////////
    let compAppCategoryChartByInstalls = dc.compositeChart("#installsByCategory");
    let categoryDim1 = ndx.dimension(dc.pluck("Category"));

    function reviewByAge(ageRating) {
        return function(d) {
            if (d.Content_Rating == ageRating) {
                return +d.Reviews;
            }
            else {
                return 0;
            }
        }
    }

    let InstallsByAdult = categoryDim1.group().reduceSum(reviewByAge("Adults only 18+"));
    let InstallsByEveryone = categoryDim1.group().reduceSum(reviewByAge("Everyone"));
    let InstallsByMature = categoryDim1.group().reduceSum(reviewByAge("Mature 17+"));
    let InstallsByTeen = categoryDim1.group().reduceSum(reviewByAge("Teen"));
    let InstallsByUnrated = categoryDim1.group().reduceSum(reviewByAge("Unrated"));
    let InstallsGroup = categoryDim1.group().reduceSum(dc.pluck("Installs"));
    console.log(InstallsByAdult);

//Composite Chart that allows all the charts being related in between them.

    compAppCategoryChartByInstalls
        .width(1000)
        .height(300)
        .dimension(categoryDim1)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Category")
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .group(totalAppDownloaded)
        .yAxisLabel("Content Rating")
        
        .legend(dc.legend().x(40).y(40).itemHeight(13).gap(15))
        .compose([
            dc.lineChart(compAppCategoryChartByInstalls)
            .colors("red")
            .group(InstallsByAdult, "Adults only 18+"),
            dc.lineChart(compAppCategoryChartByInstalls)
            .colors("blue")
            .group(InstallsByEveryone, "Everyone"),
            dc.lineChart(compAppCategoryChartByInstalls)
            .colors("orange")
            .group(InstallsByMature, "Mature 17+"),
            dc.lineChart(compAppCategoryChartByInstalls)
            .colors("green")
            .group(InstallsByTeen, "Teen"),
            dc.lineChart(compAppCategoryChartByInstalls)
            .colors("grey")
            .group(InstallsByUnrated, "Unrated")

        ])
        .render()
        .yAxis().ticks(3);







//Render all the previous chart.
    dc.renderAll();

}