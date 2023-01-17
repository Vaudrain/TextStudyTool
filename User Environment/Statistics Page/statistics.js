/* adds dropdown functionality to accordions, accordian functionality from W3schools */
function registerAccordions() {
  var acc = document.getElementsByClassName("accordion");
  var i;

  for (i = 0; i < acc.length; i++) {
    acc[i].removeEventListener("click", function() {});
    acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight){
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }
}

/* Post call to server to get token data, then build clientside graphs */
function retrieveStatistics() {
  $.post("/statisticsData", function(data,status) {
    if (status == "success") {
      statistics = JSON.parse(data);

      for (scheme in statistics) {
        var numTests = {};
        for (tokenType in statistics[scheme]) {
          margin = {top: $(window).height() * 0.02, right: $(window).width() * 0.04, bottom: $(window).height() * 0.12, left: $(window).width() * 0.03};
          width = $(window).width() * 0.8;
          height = $(window).height() * 0.6;
          if ($("#" + scheme.replace(/ /g,'')).length == 0) { // does not exist
            $("body").append("<button id=\"" + scheme.replace(/ /g,'') + "\" class=\"accordion\"> Statistics for the scheme \"" + scheme + "\"</button><div class=\"panel\"></div>");
          }
          if ($("#" + scheme.replace(/ /g,'') + tokenType.replace(/ /g,'')).length == 0) {
            $("#" + scheme.replace(/ /g,'')).next().append("<svg id=" + scheme.replace(/ /g,'') + tokenType.replace(/ /g,'') + " width=\"960\" height=\"500\"></svg>");
          }
          var svg = d3.select("#" + scheme.replace(/ /g,'') + tokenType.replace(/ /g,''))
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");
                      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          width = $("#" + scheme.replace(/ /g,'') + tokenType.replace(/ /g,'')).width() - margin.right * 3;

          var x = d3.scaleLinear()
          .rangeRound([0, width]);

          var y = d3.scaleLinear()
          .rangeRound([height, 0]);

          var y2 = d3.scaleLinear()
          .rangeRound([height, 0]);

          var index = 0;

          var lineCorrect = d3.line()
          .x(function(data) { for (d in data) {return x(data.number) }; })
          .y(function(data) { for (d in data) {return y(data.correct);} });

          var lineError = d3.line()
          .x(function(data) { for (d in data) {return x(data.number) }; })
          .y(function(data) { for (d in data) {return y2(data.error);} });

          var div = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

          dataCorrect = statistics[scheme][tokenType].Correct;
          dataError = statistics[scheme][tokenType].Error;
          dataCorrectAvg = statistics[scheme][tokenType].CorrectAvg;
          dataErrorAvg = statistics[scheme][tokenType].ErrorAvg;
                  x.domain(d3.extent(dataCorrect, function(data) { for (d in data) {return data.number;} }));
                  // Opted to use static y axes for consistency
                  y.domain([0,100]);
                  y2.domain([0,100]);

                  g.append("rect")
                      .attr("width", width)
                      .attr("height", height)
                      .attr("fill", "#414141");

                  g.append("g")
                  .style("fill","white")
                  .style("stroke","white")
                  .attr("transform", "translate(0," + parseInt(height+10) + ")")
                  .call(d3.axisBottom(x).ticks(x.domain()[1]))
                  .append("text")
                  .attr("fill", "#eee")
                  .attr("dy", "3em")
                  .attr("dx", parseInt(width / 2))
                  .style("font-size", "14px")
                  .attr("text-anchor", "middle")
                  .text("Test Number");

                  g.append("g")
                  .style("fill","steelblue")
                  .style("stroke","white")
                  .attr("transform", "translate(" + parseInt(-10) + ",0)")
                  .call(d3.axisLeft(y))
                  .append("text")
                  .attr("fill", "#eee")
                  .attr("transform", "rotate(-90)")
                  .attr("dy", "-3.5em")
                  .style("font-size", "14px")
                  .attr("text-anchor", "end")
                  .text("Number of Correct Inputs (per minute)");

                  g.append("g")
                  .style("fill","red")
                  .style("stroke","white")
                  .attr("class", "y axis")
                  .attr("transform", "translate(" + parseInt(width + 10) + ",0)")
                  .call(d3.axisRight(y2))
                  .append("text")
                  .attr("fill", "#eee")
                  .attr("transform", "rotate(-90)")
                  .attr("dy", "3.5em")
                  .style("font-size", "14px")
                  .attr("text-anchor", "end")
                  .text("Error Rate (%)");

                  g.selectAll("dot")
                  .data(dataCorrect)
                  .enter().append("circle")
                  .style("fill","steelblue")
                  .style("zindex","50")
                  .attr("r", 5)
                  .attr("cx", function(d) { return x(d.number); })
                  .attr("cy", function(d) { return y(d.correct); })
                  .on("mouseover", function(d) {
                      div.transition()
                          .duration(200)
                          .style("opacity", .9);
                      div	.html("Test Number: " + d.number + "<br/> Correct Inputs: "  + d.correct)
                          .style("left", (d3.event.pageX) + "px")
                          .style("top", (d3.event.pageY - 28) + "px")
                          .style("background", "steelblue");
                      })
                  .on("mouseout", function(d) {
                      div.transition()
                          .duration(500)
                          .style("opacity", 0);
                  });;

                  g.selectAll("dot")
                  .data(dataError)
                  .enter().append("circle")
                  .style("fill","red")
                  .style("zindex","50")
                  .attr("r", 5)
                  .attr("cx", function(d) { return x(d.number); })
                  .attr("cy", function(d) { return y2(d.error); })
                  .on("mouseover", function(d) {
                      div.transition()
                          .duration(200)
                          .style("opacity", .9);
                      div	.html("Test Number: " + d.number + "<br/> Error Rate: "  + d.error + "%")
                          .style("left", (d3.event.pageX) + "px")
                          .style("top", (d3.event.pageY - 28) + "px")
                          .style("background", "red");
                      })
                  .on("mouseout", function(d) {
                      div.transition()
                          .duration(500)
                          .style("opacity", 0);
                  });;

                  g.append("path")
                  .datum(dataCorrectAvg)
                  .attr("fill", "none")
                  .attr("stroke", "steelblue")
                  .attr("stroke-linejoin", "round")
                  .attr("stroke-linecap", "round")
                  .attr("stroke-width", 1.5)
                  .attr("d", lineCorrect);

                  g.append("path")
                  .datum(dataErrorAvg)
                  .attr("fill", "none")
                  .attr("stroke", "red")
                  .attr("stroke-linejoin", "round")
                  .attr("stroke-linecap", "round")
                  .attr("stroke-width", 1.5)
                  .attr("d", lineError);

                  g.append("text")
                  .attr("x", (width / 2))
                  .attr("y", 0 - (margin.top / 2))
                  .attr("text-anchor", "middle")
                  .style("font-size", "16px")
                  .style("stroke","white")
                  .style("fill","white")
                  .style("text-decoration", "underline")
                  .text(scheme +" Scheme Performance with Token Type : \"" + tokenType + "\"");
        }
      }
      // When finished, register accordion functionality and remove loading element
      registerAccordions();
      $("#loading").text("");
    } else {
      console.error("Failed to retrive statistics.");
      $post(this);
    }
  });
}

retrieveStatistics();
