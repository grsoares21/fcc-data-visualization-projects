const month = [];

month[1] = "January";
month[2] = "February";
month[3] = "March";
month[4] = "April";
month[5] = "May";
month[6] = "June";
month[7] = "July";
month[8] = "August";
month[9] = "September";
month[10] = "October";
month[11] = "November";
month[12] = "December";

const headers = new Headers();
headers.append("Content-Type", "application/json");

fetch(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json",
  { method: "GET" }
)
  .then((response) => response.json())
  .then((data) => {
    // construir o grafico usando svg
    const dataArray = data.data;
    const minGdp = d3.min(dataArray, (d) => d[1]);
    const maxGdp = d3.max(dataArray, (d) => d[1]);

    const gdpScale = d3.scaleLinear().domain([maxGdp, 0]).range([0, 400]);

    const yAxis = d3.axisLeft(gdpScale);

    const minDateArr = dataArray[0][0].split("-"); // array in the format ['yyyy', 'mm', 'dd']
    const maxDateArr = dataArray[dataArray.length - 1][0].split("-"); // array in the format ['yyyy', 'mm', 'dd']

    const minDate = new Date(
      parseInt(minDateArr[0]),
      parseInt(minDateArr[1]) - 1,
      parseInt(minDateArr[2])
    );
    const maxDate = new Date(
      parseInt(maxDateArr[0]),
      parseInt(maxDateArr[1]) - 1,
      parseInt(maxDateArr[2])
    );

    const timeScale = d3
      .scaleTime()
      .domain([minDate, maxDate])
      .range([20, 750]);

    const xAxis = d3.axisBottom(timeScale);

    d3.select("#graphContainer").append("div").attr("id", "tooltip");

    const graphSvg = d3
      .select("#graphContainer")
      .append("svg")
      .attr("height", "600")
      .attr("width", "800")
      .attr("id", "svgGraph");

    graphSvg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", "translate(50,100)")
      .call(yAxis);

    graphSvg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", "translate(30,500)")
      .call(xAxis);

    graphSvg
      .selectAll("rect")
      .data(dataArray)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("width", 730 / dataArray.length + 1)
      .attr("height", (d) => gdpScale(maxGdp - d[1]))
      .attr("data-date", (d) => d[0])
      .attr("data-gdp", (d) => d[1])
      .attr("y", (d) => 500 - gdpScale(maxGdp - d[1]))
      .attr("x", (d, i) => i * (730 / dataArray.length) + 51)
      .on("mouseover", (d, i) => {
        let dateArray = d[0].split("-");

        d3.select("#tooltip")
          .attr("data-date", d[0])
          .style(
            "transform",
            `translate(${i * (730 / dataArray.length) + 75}px, 400px)`
          )
          .style("opacity", "1")
          .html(
            `\$${d[1].toLocaleString("en-US")} Billion<br>${
              month[parseInt(dateArray[1])]
            } ${dateArray[0]}`
          );
      })
      .on("mouseout", (d, i) => {
        d3.select("#tooltip").style("opacity", "0");
      });
  });
