var monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
)
  .then((response) => response.json())
  .then((data) => {
    const minYear = Math.min(
      ...data.monthlyVariance.map((variance) => variance.year)
    );
    const maxYear = Math.max(
      ...data.monthlyVariance.map((variance) => variance.year)
    );

    const minVariance = Math.min(
      ...data.monthlyVariance.map((variance) => variance.variance)
    );
    const maxVariance = Math.max(
      ...data.monthlyVariance.map((variance) => variance.variance)
    );

    const svg = d3
      .select("#graphContainer")
      .append("svg")
      .attr("height", "600")
      .attr("width", "1400");

    const yScale = d3.scaleLinear().domain([0, 12]).range([0, 400]);

    const xScale = d3.scaleLinear().domain([minYear, maxYear]).range([0, 1200]);

    const rectHeight = 400 / 12;
    const rectWidth = 1200 / 262;

    const colorArray = [
      "#a50026",
      "#d73027",
      "#f46d43",
      "#fdae61",
      "#fee090",
      "#ffffbf",
      "#e0f3f8",
      "#abd9e9",
      "#74add1",
      "#4575b4",
      "#313695",
    ];

    const colorScale = d3
      .scaleLinear()
      .domain([minVariance, maxVariance])
      .range([10, 0]);

    svg
      .append("g")
      .selectAll("rect")
      .data(data.monthlyVariance)
      .enter()
      .append("rect")
      .attr("height", rectHeight + 1)
      .attr("width", rectWidth + 1)
      .attr("fill", (d) => colorArray[Math.round(colorScale(d.variance))])
      .attr("x", (d) => 100 + (d.year - minYear) * rectWidth)
      .attr("y", (d) => 20 + (d.month - 1) * rectHeight)
      .attr("class", "cell")
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => d.variance)
      .on("mouseover", (d) => {
        let { variance, year, month } = d;

        d3.select("#tooltip")
          .style(
            "transform",
            `translate(${125 + (year - minYear) * rectWidth}px, ${
              20 + (month - 1) * rectHeight
            }px)`
          )
          .style("opacity", "1")
          .html(
            `${year} - ${monthNames[month - 1]}<br>${(
              data.baseTemperature + variance
            ).toFixed(2)}°C<br>${variance.toFixed(2)}°C`
          )
          .attr("data-year", year);
      })
      .on("mouseout", (d) => {
        d3.select("#tooltip").style("opacity", "0");
      });

    const yAxis = d3
      .axisLeft(yScale)
      .tickValues([
        0.5,
        1.5,
        2.5,
        3.5,
        4.5,
        5.5,
        6.5,
        7.5,
        8.5,
        9.5,
        10.5,
        11.5,
      ])
      .tickFormat((tickValue, monthIndex) => monthNames[monthIndex]);

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(20)
      .tickFormat((d) => `${d}`);

    svg
      .append("g")
      .call(yAxis)
      .attr("transform", "translate(100,20)")
      .attr("id", "y-axis");

    svg
      .append("g")
      .call(xAxis)
      .attr("transform", "translate(100,420)")
      .attr("id", "x-axis");

    svg
      .append("g")
      .attr("id", "legend")
      .selectAll("rect")
      .data(colorArray)
      .enter()
      .append("rect")
      .attr("height", "30")
      .attr("width", "30")
      .attr("y", "475")
      .attr("x", (d, i) => 480 + i * 30)
      .attr("fill", (d) => d);

    svg
      .select("#legend")
      .selectAll("line")
      .data(colorArray)
      .enter()
      .append("line")
      .attr("x1", (d, i) => 480 + i * 30)
      .attr("y1", 475)
      .attr("x2", (d, i) => 480 + i * 30)
      .attr("y2", 525)
      .attr("stroke", "black")
      .attr("stroke-width", "1");

    const inverseColorScale = d3
      .scaleLinear()
      .domain([10, 0])
      .range([minVariance, maxVariance]);

    svg
      .select("#legend")
      .selectAll("text")
      .data(colorArray)
      .enter()
      .append("text")
      .attr("x", (d, i) => 475 + i * 30)
      .attr("y", 540)
      .text((d, i) => (inverseColorScale(i) + data.baseTemperature).toFixed(1));
  });
