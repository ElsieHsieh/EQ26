

    $(function() {
        $("#gotop").click(function() {
            jQuery("html,body").animate({
                scrollTop: 0
            }, 1000);
        });
        $(window).scroll(function() {
            if ($(this).scrollTop() > 300) {
                $('#gotop').fadeIn("fast");
            } else {
                $('#gotop').stop().fadeOut("fast");
            }
        });
    });
    $(document).ready(function() {
        draw()
    });

    function draw() {

        var csv = d3.dsv(",", "text/csv;charset=big5");
        csv("Megi.csv", function(data) {

            var timeAllparse = d3.time.format("%Y-%m-%e %H:%M").parse,
                dateformat = d3.time.format("%Y/%m/%d"),
                timeformat = d3.time.format("%H:%M");

            data.forEach(function(d) {
                d.parseTime = timeAllparse(d.Time);
                d.date = dateformat(d.parseTime);
                d.tt = timeformat(d.parseTime);
                d.geo1 = d.Lat + "," + d.Lon;

                var distype = d["DisasterType"].split("&");
                
                var flood = 0;
                var road = 0;
                var landslide = 0;
                var bridge = 0;


             
                if (distype.indexOf("土石災情") > -1) {
                    landslide = landslide + 1;
                }
                if (distype.indexOf("橋梁災情") > -1) { 

                    bridge = bridge + 1;
                }
                if (distype.indexOf("積淹水災情") > -1) { 

                    flood = flood + 1;
                }
                if (distype.indexOf("道路、隧道災情") > -1) { 

                    road = road + 1;
                }
            
                d.landslide1 = landslide;
                d.bridge1 = bridge;
                d.flood1 = flood;
                d.road1 = road;

            });

            //以下順序調動
            var ndx = crossfilter(data);
            var ndxGroupAll = ndx.groupAll();

            var geo1Dim = ndx.dimension(function(d) {
                return d["geo1"]; }); //更改
            var geo1Group = geo1Dim.group().reduceCount(); //更改

            var countyDim = ndx.dimension(function(d) {
                return d["C_Name"]; });
            var countyDisastersGroup = countyDim.group().reduceCount(function(d) {
                return d.Flood1 + d.Landslide1 + d.Traffic1; }); //更改
            var townIdDim = ndx.dimension(function(d) {
                return d["TOWN_ID"]; }); //更改

            var timedim = ndx.dimension(function(d) {
                return d.parseTime; });
            var hourdim = ndx.dimension(function(d) {
                return d3.time.hour(d.parseTime); });
            var minTime = timedim.bottom(1)[0].parseTime;
            var maxTime = timedim.top(1)[0].parseTime;

            var disastertypes = ndx.dimension(function(d) {
                return d["DisasterType"] ; }); //return d["DisasterType"]?d["DisasterType"]:"其他災情"; });
            var disastertypesGroup = disastertypes.group().reduceCount();

            var hourdimGroup = hourdim.group()
                .reduceCount(function(d) { return d.Time; });

            
            var landslide1Group = hourdim.group().reduceSum(function(d) {
                return d.landslide1; });
            var bridge1Group = hourdim.group().reduceSum(function(d) {
                return d.bridge1; });
            var flood1Group = hourdim.group().reduceSum(function(d) {
                return d.flood1; });
            var road1Group = hourdim.group().reduceSum(function(d) {
                return d.road1; });

            //積淹水災情 道路、隧道災情 土石災情 橋梁災情 其他災情

            var colorScale = d3.scale.ordinal().domain(["積淹水災情", "道路、隧道災情", "土石災情", "橋梁災情"])
                .range(["#d7301f", "#ffbe4f", "#66cccc", "#4b86b4"]);

            var countycolor = d3.scale.ordinal().range(["#045a8d", "#2b8cbe", "#74a9cf", "#a6bddb", "#d9d9d9","#d0d1e6"]);
            

            //cluster map - leaflet
            var MKmarker = dc_leaflet.markerChart("#map")
                .dimension(geo1Dim) //更改
                .group(geo1Group) //更改
              
                .center([23.5, 121])
                .zoom(7)
                .cluster(true)
                .renderPopup(false)
                .filterByArea(true);

            //disaster type pie chart
            var pie = dc.pieChart("#dis_pie")
                .dimension(disastertypes)
                .group(disastertypesGroup) //更改
                .colors(function(disastertype) {
                    return colorScale(disastertype);
                })
                .width(200)
                .height(200)
                .renderLabel(true)
                .renderTitle(true)
                .cap(7)
                .ordering(function(d) {
                    return disastertypesGroup; //更改
                });

            //county row chart
            var countyRowChart = dc.rowChart("#chart-row-county")
                .width(420)
                .height(200)
                .margins({
                    top: 5,
                    left: 55,
                    right: 0,
                    bottom: 20
                })
                .dimension(countyDim)
                .group(countyDisastersGroup, "Disasters")
                .labelOffsetX(-45)
                .colors(function(countyDim) {
                    return countycolor(countyDim);
                })
                .elasticX(true)
                .controlsUseVisibility(true)
                .ordering(function(d) {
                    return countyDim;
                })
                .rowsCap(5);


            var timechart = dc.barChart("#dis_time")
                .width(700)
                .height(230)
                .transitionDuration(500)
                .margins({ top: 10, right: 0, bottom: 47, left: 35 })
                .dimension(hourdim)
                .group(hourdimGroup)
                .colors(969696)
                .elasticY(true)
                .renderHorizontalGridLines(true)
                .mouseZoomable(false)
                .x(d3.time.scale().domain([minTime, maxTime]))
                .xAxisLabel("Date")
                .centerBar(true)
                .xUnits(function(d) {
                    return 70 })
                .brushOn(true)
                .xAxis().tickFormat(d3.time.format('%m/%d %H:%M'));

            // data table
            var dataTable = dc.dataTable('#dc-table-graph')
                .width(680)
                .dimension(townIdDim) //更改
                .group(function(d) {
                    return d.date; })
                .size(Infinity)
                .columns([
                    function(d) {
                        return d.C_Name; },
                    function(d) {
                        return d.T_Name; },
                    function(d) {
                        return d.date; },
                    function(d) {
                        return d.tt; },
                    function(d) {
                        return d.DisasterSubType; },
                    function(d) {
                        return d.situation; },
                ])
                .sortBy(function(d) {
                    return d.parseTime;
                })
                .order(d3.ascending);

            dc.renderAll();
        });
    }
