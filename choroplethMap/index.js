fetch(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
)
  .then((response) => response.json())
  .then((educationData) => {
    fetch(
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
    )
      .then((response) => response.json())
      .then((data) => {
        d3.select("#graphContainer").append("div").attr("id", "tooltip");

        const svg = d3
          .select("#graphContainer")
          .append("svg")
          .attr("viewBox", [0, 0, 960, 600])
          .attr("width", "960")
          .attr("height", "600");

        const nationGeoJson = topojson.feature(data, data.objects.nation)
          .features;
        const countiesGeoJson = topojson.feature(data, data.objects.counties)
          .features;
        const statesGeoJson = topojson.feature(data, data.objects.states)
          .features;

        const maxDegree = d3.max(educationData, (d) => d.bachelorsOrHigher);
        const minDegree = d3.min(educationData, (d) => d.bachelorsOrHigher);
        const degreeScale = d3
          .scaleLinear()
          .domain([minDegree, maxDegree])
          .range([0, 1]);

        svg
          .selectAll("path")
          .data(nationGeoJson)
          .enter()
          .append("path")
          .attr("d", d3.geoPath());

        const linearGradient = svg
          .append("defs")
          .append("linearGradient")
          .attr("id", "legendGradient")
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "100%")
          .attr("y2", "0%");

        linearGradient
          .append("stop")
          .attr("offset", "0%")
          .style("stop-color:rgb(0,0,0);stop-opacity:1");

        linearGradient
          .append("stop")
          .attr("offset", "100%")
          .attr("style", "stop-color:rgb(8,231,198);stop-opacity:1");

        svg
          .append("rect")
          .attrs({
            id: "legend",
            height: "15",
            width: "200",
            x: "630",
            y: "50",
            fill: "url(#legendGradient)",
          })
          .append("rect")
          .attr("fill", "rgba(111,111,11,0)")
          .append("rect")
          .attr("fill", "rgba(11,111,11,0)")
          .append("rect")
          .attr("fill", "rgba(11,11,11,0)")
          .append("rect")
          .attr("fill", "rgba(111,111,22,0)");

        let paths = null;
        let rects = null;
        let texts = null;
        let lines = null;
        const zoom = d3
          .zoom()
          .on("zoom", () => {
            paths = paths || d3.selectAll("path");
            rects = rects || d3.selectAll("rect");
            texts = texts || d3.selectAll("text");
            lines = lines || d3.selectAll("line");
            paths.attr("transform", d3.event.transform);
            rects.attr("transform", d3.event.transform);
            texts.attr("transform", d3.event.transform);
            lines.attr("transform", d3.event.transform);
          })
          .extent([
            [0, 0],
            [960, 600],
          ])
          .scaleExtent([1, 8]);

        svg.call(zoom);

        svg
          .append("g")
          .selectAll("path")
          .data(countiesGeoJson)
          .enter()
          .append("path")
          .attr("class", "county")
          .attr("d", d3.geoPath())
          .attr("data-fips", (d) => d.id)
          .attr(
            "data-education",
            (d) =>
              educationData.find((edData) => edData.fips === d.id)
                .bachelorsOrHigher
          )
          .attr("class", "county")
          .attr("fill", (d) => {
            let { bachelorsOrHigher } = educationData.find(
              (edData) => edData.fips === d.id
            );
            bachelorsOrHigher = degreeScale(bachelorsOrHigher);
            return `rgb(${bachelorsOrHigher * 8},${bachelorsOrHigher * 231},${
              bachelorsOrHigher * 198
            })`;
          })
          .on("mouseover", (d) => {
            console.log(d);
            let { bachelorsOrHigher, area_name, state } = educationData.find(
              (edData) => edData.fips === d.id
            );
            const countyPosition = d.geometry.coordinates[0][0];

            d3.select("#tooltip")
              .style(
                "transform",
                `translate(${countyPosition[0] + 25}px, ${
                  countyPosition[1] - 10
                }px)`
              )
              .style("opacity", "1")
              .text(`${area_name}, ${state}: ${bachelorsOrHigher}%`)
              .attr("data-education", bachelorsOrHigher);
          })
          .on("mouseout", () => {
            console.log("a");
            d3.select("#tooltip").style("opacity", "0");
          });

        svg
          .append("g")
          .selectAll("path")
          .data(statesGeoJson)
          .enter()
          .append("path")
          .attr("d", d3.geoPath())
          .attr("class", "state")
          .attr("fill", "rgba(0,0,0,0)")
          .attr("stroke", "black")
          .attr("stroke-width", "2");

        svg.append("line").attrs({
          x1: 630,
          y1: 40,
          x2: 630,
          y2: 65,
          stroke: "black",
        });
        svg.append("line").attrs({
          x1: 830,
          y1: 40,
          x2: 830,
          y2: 65,
          stroke: "rgb(8, 231, 198)",
        });

        svg
          .append("text")
          .text(minDegree + "%")
          .attr("fill", "black")
          .attr("font-weight", "bold")
          .attr("font-family", "Verdana")
          .attr("x", "615")
          .attr("y", "30");

        svg
          .append("text")
          .text(maxDegree + "%")
          .attr("fill", "rgb(8, 231, 198)")
          .attr("font-weight", "bold")
          .attr("font-family", "Verdana")
          .attr("x", "815")
          .attr("y", "30");
      });
  });
