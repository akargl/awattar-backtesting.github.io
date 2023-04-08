document.addEventListener("DOMContentLoaded", function() {
    fetch('https://api.awattar.at/v1/marketdata?start=1561932000000')
        .then((response) => response.json())
        .then((data) => console.log(data));

    console.log("" + document.getElementById('submit'));

    const fileInputs = document.getElementById('file-form');

    fileInputs.onchange = () => {
        console.log("fileInputs: " + fileInputs[0].files);

        const reader = new FileReader();

        reader.onload = (event) => {
            const fileContent = event.target.result;
            Papa.parse(fileContent, {
                header: true,
                complete: (results) => {
                    d = results.data;
                    console.log("length: " + d.length);
                    var i = 0;
                    labels = []
                    consumption = []
                    while (i < d.length) {
                        const {date, usage} = NetzNOE.processEntry(d[i]);
                        labels.push(date)
                        consumption.push(usage);
                        i++;
                    }

                    var ctx = document.getElementById('awattarChart').getContext('2d');

                    var data = {
                        // labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                        labels: labels,
                        datasets: [{
                            label: 'Electricity Usage',
                            // data: [150, 200, 180, 220, 250, 230, 240],
                            data: consumption,
                            fill: false,
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }]
                    };

                    // Define chart options
                    var options = {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    };

                    // Create chart
                    var myChart = new Chart(ctx, {
                        type: 'line',
                        data: data,
                        options: options
                    });
                }
            });
        };

        for (let file of fileInputs[0].files) {
            reader.readAsText(file)
        }
    };


});


class Netzbetreiber {
    name = "name";
    descriptorUsage = "usage";
    descriptorTimestamp = "timestamp";

    constructor(name, descriptorUsage, descriptorTimestamp) {
        this.name = name;
        this.descriptorUsage = descriptorUsage;
        this.descriptorTimestamp = descriptorTimestamp;
    }

    processEntry(entry) {
        var valueUsage = entry[this.descriptorUsage];
        var valueTimestamp = entry[this.descriptorTimestamp];

        return {
            timestamp: valueTimestamp,
            usage: valueUsage,
        }
    }
};

const NetzNOE = new Netzbetreiber("NetzNÖ", "Gemessene Menge (kWh)", "Messzeitpunkt");
