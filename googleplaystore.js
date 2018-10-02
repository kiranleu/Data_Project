let windowWidth = document.documentElement["clientWidth"];

window.onresize = function(){
    location.reload();
}

queue()
.defer(d3.csv, "googleplaystore.csv")
.await(makeCharts);

function makeCharts(error, transactionsData){
    let ndx = crossfilter(transactionsData);
    
    let chartWidth = 300;
    
    if( windowWidth < 768) {
         chartWidth = windowWidth;

    }else{
        chartWidth = windowWidth / 5;
    }


let categoryDim = ndx.dimension(dc.pluck("Category"));
let totalAppDownloaded = categoryDim.group().reduceSum(dc.pluck("Reviews"));

let appCategoryChart = dc.barChart("#appCategoryChart");
let categoryColors = d3.scale.ordinal().range(["#00A1F1", "#7CBB00", "#FFBB00","#F65314"]);

appCategoryChart
    .width (900)
    .height (500)
    .colorAccessor(function(d){
        return d.key
    })
    .colors(categoryColors)
    .dimension(categoryDim)
    .group(totalAppDownloaded)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .xAxisLabel("Category")
    .yAxisLabel( "Reviews")
   
    .elasticY(true)
    .transitionDuration(500)
    .yAxis().ticks(4);


let typeDim = ndx.dimension(dc.pluck("Content Rating"));
let ratingAppDownloaded = typeDim.group().reduceSum(dc.pluck("Reviews"));

let appTypeChart = dc.barChart("#appTypeChart");
let categoryColors1 = d3.scale.ordinal().range(["#00A1F1", "#7CBB00", "#FFBB00","#F65314"])


appTypeChart
    .width (500)
    .height (300)
     .colorAccessor(function(d){
        return d.key
    })
    .colors(categoryColors1)
    .dimension(typeDim)
    .group(ratingAppDownloaded)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .xAxisLabel("Content Rating")
    .elasticY(true)
    .yAxisLabel("Reviews")
    .transitionDuration(500)
    .yAxis().ticks(3);
    
    
    





     dc.renderAll();
}