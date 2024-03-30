let dplot, plot;

const ColourValues = [
    "FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF", "00FFFF", "000000",
    "800000", "008000", "000080", "808000", "800080", "008080", "808080",
    "C00000", "00C000", "0000C0", "C0C000", "C000C0", "00C0C0", "C0C0C0",
    "400000", "004000", "000040", "404000", "400040", "004040", "404040",
    "200000", "002000", "000020", "202000", "200020", "002020", "202020",
    "600000", "006000", "000060", "606000", "600060", "006060", "606060",
    "A00000", "00A000", "0000A0", "A0A000", "A000A0", "00A0A0", "A0A0A0",
    "E00000", "00E000", "0000E0", "E0E000", "E000E0", "00E0E0", "E0E0E0",
];

function isNotAllNull(subArray) {
    return subArray.some(element => element !== null);
}

function renderChart(name, dataRows, series) {

    // Filter data and series if they are entirely null
    const filteredData = dataRows.filter(isNotAllNull);
    const filteredSeries = series.filter((_, index) => isNotAllNull(dataRows[index]));

    let plotHeight = $(window).height() - 300;
    if (plotHeight < 400) plotHeight = 400;
    let opts = {
        title: name,
        id: "chart1",
        class: "my-chart",
        width: $("#uplot").innerWidth(),
        height: plotHeight,
        series: filteredSeries,
        axes: prepareAxis(filteredSeries),
    };
    if ($("#uplot").html() != "") {
        plot.setData(filteredData);
        return;
    }
    $("#uplot").html("");
    plot = new uPlot(opts, filteredData, $("#uplot")[0]);
}

function prepareAxis(series) {
    let axes = [{}];
    for (let seriesIdx = 1; seriesIdx < series.length; seriesIdx++) {
        let scale = series[seriesIdx].scale;

        const found = axes.some(axis => axis.scale === scale);

        const decimalPlaces = determineDecimalPlaces(scale);

        if (!found && decimalPlaces !== null) {
            axes.push({
                    labelSize: 15,
                    gap: 0,
                    size: 40,
                    side: 3,
                    grid: {show: false},
                    label: scale,
                    scale: scale,
                    values: (self, ticks) => ticks.map(rawValue => rawValue.toFixed(decimalPlaces)),
                }
            )
        }
    }

    let halfOfAxisCount = parseInt(axes.length / 2) + 1;
    for (let j = halfOfAxisCount; j < axes.length; j++) {
        axes[j].side = 1;
    }
    axes[1].grid.show = true;
    return axes;
}

function determineDecimalPlaces(scale) {
    let zeroPlaceScales = ["px", "Pressure"];
    let onePlaceScales = ["s", "mm", "°C"];

    if (zeroPlaceScales.includes(scale)) {
        return 0;
    } else if (onePlaceScales.includes(scale)) {
        return 1;
    } else {
        return null;
    }
}

function aggregateFunc(v, aggregate) {
    let val = parseFloat(v / 1000000000);
    if (aggregate == 0) return val;
    return Math.round(val / aggregate) * aggregate;
}

function getSeries() {
    let series = [{}];
    $("#uplot").data("axes").forEach((element, key) => {
        series.push({
            show: true,
            spanGaps: true,
            label: element.Name,
            scale: element.Type,
            value: (self, rawValue) => (rawValue != null ? rawValue.toFixed(element.Decimal) + element.Type : ""),
            stroke: "#" + ColourValues[key] + "88",
            width: 1,
        });
    });
    return series;
}

function downloadCSV(series, o) {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    let p = "";
    for (j = 0; j < series.length; j++) {
        if (j == 0) {
            p += "Timestamp,";
        } else {
            p += series[j].label + ",";
        }
    }
    p += "\n\r";
    let iT = o.length;
    let jT = o[0].length
    for (j = 0; j < jT; j++) {
        for (i = 0; i < iT; i++) {
            if (o[i][j] === null) p += ",";
            else p += o[i][j] + ",";
        }
        p += "\n\r";
    }
    const blob = new Blob([p], {type: "octet/stream"}),
        url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = "nanodlp.csv";
    a.click();
    window.URL.revokeObjectURL(url);
}

function buildChartFromData(name, dataResponse, exp) {
    if (dataResponse.length === 0) {
        return;
    }

    let series = getSeries();
    let previousAggregateValue;
    let dataPointIndex = 0;

    // Fill processed data with empty arrays
    let processedData = series.map(_serie => []);
    let aggregate = $("#aggregate").val();

    if (JSON.stringify(dplot) == JSON.stringify(dataResponse) && !exp) {
        return
    }
    dplot = dataResponse;

    dataResponse.forEach(responseItem => {
        let currentAggregateValue = aggregateFunc(responseItem["ID"], aggregate);
        if (currentAggregateValue != previousAggregateValue) {
            for (j = 0; j < series.length; j++) {
                processedData[j][dataPointIndex] = null;
            }
            processedData[0][dataPointIndex] = currentAggregateValue;
            previousAggregateValue = currentAggregateValue;
            dataPointIndex++;
        }
        processedData[responseItem["T"] + 1][dataPointIndex - 1] = responseItem["V"];
    })

    if (exp) return downloadCSV(series, processedData);
    renderChart(name, processedData, series);
}