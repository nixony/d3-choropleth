jQuery(document).ready(function($) {

  var width = 960,
    height = 500;
   
  var quantize = d3.scale.quantize()
          .domain([7, 13])
          .range(d3.range(10).map(function(i) { return "q" + i; }));

  var projection = d3.geo.albersUsa().translate([width/2, height/2]).scale([500]);

  var path = d3.geo.path();

  var svg = d3.select('body')
              .append('svg')
              .attr('width', width)
              .attr('height', height);              

  var g = svg.append('g')
          .attr('class', 'states') 
          .call(d3.behavior.zoom()
          .scaleExtent([1, 10])
          .on('zoom', zoom));
          

  queue()
    .defer(d3.json, 'data/states.json')
    .defer(d3.csv, 'data/internet-data.csv')
    .await(ready);

  function ready(error, us, speed) {
    
    // Initialize tooltip
    var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset(function(){
            
            var x1 = this.getBBox().x;
            var y1 = this.getBBox().y;

            var coordinates = [0, 0];
            coordinates = d3.mouse(this);
            var x2 = coordinates[0];
            var y2 = coordinates[1];

            // var offsetX = this.getBBox().width;
            // var offsetY = this.getBBox().height;
            // if(offsetX < 70) {
            //   offsetX = 100;              
            // } else if(offsetX > 160) {
            //   offsetX = 160;
            // } else {
            //   offsetX = 120;
            // }

            // if(offsetY > 70) {
            //   offsetY = offsetY/2;              
            // } 

            return [0,0];
          })
          .html(function(d) {            

            var html = '';
            speed.forEach(function(item) {
              if(item.state == d.properties.name) {
                html = '<div>State: '+item.state+'</div><div>Speed: '+item.mbps+'</div>'
              }
            });
            return html;
          });    

    g.selectAll('path')      
      .data(topojson.feature(us, us.objects.states).features)
      .enter().append('path')
      .attr('d', path)
      // .attr('class', 'state')
      .attr('class', function(d) { 
        var styleClass = 'state ';

        speed.forEach(function(item) {
          if(item.state == d.properties.name) {          
            styleClass += quantize(item.mbps);
          } 
        });
        return styleClass;
      })
      .call(tip)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  }

  function zoom() {
    g.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
  }

  

});