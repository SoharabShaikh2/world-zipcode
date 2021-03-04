
var mainUrl = 'https://worldpostalcode.com/';

function updateCountry() {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": mainUrl,
        "method": "GET",
        "headers": {
            "cache-control": "no-cache",
            "postman-token": "8f50604a-4657-361b-544c-d17a80c61e75",
            'Access-Control-Allow-Origin': 'https://worldpostalcode.com'
        }
    }
    $.ajax(settings).done(function (response) {
        var countryList = [];
        console.log(response);
        var data = document.getElementById('data');
        data.innerHTML = response;
        var country = data.getElementsByClassName('regions');
        console.log(country);
        if (country.length > 0) {
            for (let c = 0; c < country.length; c++) {
                if (country[c].children.length > 0) {
                    for (let i = 0; i < country[c].children.length; i++) {
                        let e = country[c].children[i].children[1];
                        if (e) {
                            countryList.push({ CountryCode: zeroPad(c + 1, 2) + zeroPad(i + 1, 2), Country: e.innerText, url: getURL(e.href) })
                        }
                    }
                }
            }
        }
        console.log(countryList);
        saveData(countryList, 'country.json');
        //CreateFile('country.json', countryList);
    });
}

function updateState() {
    var regionList = [];

    readTextFile("files/country.json", function (text) {
        var countryList = JSON.parse(text);
        var countryAdded = 0;
        countryList.forEach(country => {
            setTimeout(() => {
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": country.url,
                    "method": "GET",
                    "headers": {
                        "cache-control": "no-cache",
                        "postman-token": "8f50604a-4657-361b-544c-d17a80c61e75",
                        'Access-Control-Allow-Origin': 'https://worldpostalcode.com'
                    }
                }
                $.ajax(settings).done(function (response) {
                    var data = document.getElementById('data');
                    data.innerHTML = response;
                    var regions = data.getElementsByClassName('regions');
                    if (regions.length > 0 && regions[0].children.length > 0) {
                        for (let i = 0; i < regions[0].children.length; i++) {
                            let e = regions[0].children[i];
                            regionList.push({ CountryCode: country.CountryCode, Country: country.Country, RegionCode: country.CountryCode + zeroPad((i + 1), 3), Region: e.innerText, url: getURL(e.href) })
                        }
                    }
                    console.log(regionList);
                    countryAdded += 1;

                    if (countryAdded == countryList.length) {
                        saveData(regionList, 'region.json');
                    }
                });

            }, 2000);
        });
    });
}

function updateDistrict() {
    var districtList = [];
    var NoDistrictState = [];

    readTextFile("files/region.json", function (text) {
        var stateList = JSON.parse(text);
        var stateAdded = 0;
        stateList.forEach(state => {
            setTimeout(() => {
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": state.url,
                    "method": "GET",
                    "headers": {
                        "cache-control": "no-cache",
                        "postman-token": "8f50604a-4657-361b-544c-d17a80c61e75",
                        'Access-Control-Allow-Origin': 'https://worldpostalcode.com'
                    }
                }
                $.ajax(settings).done(function (response) {
                    var data = document.getElementById('data');
                    data.innerHTML = response;
                    var regions = data.getElementsByClassName('regions');
                    if (regions.length > 0 && regions[0].children.length > 0) {
                        for (let i = 0; i < regions[0].children.length; i++) {
                            let e = regions[0].children[i];
                            districtList.push({ RegionCode: state.RegionCode, Region: state.Region, DistrictCode: state.RegionCode + zeroPad((i + 1), 3), District: e.innerText, url: getURL(e.href) })
                        }
                    }
                    else {
                        NoDistrictState.push(state);
                        //console.log(NoDistrictState);
                    }
                    console.log(districtList);
                    stateAdded += 1;

                    if (stateAdded == stateList.length) {
                        //saveData(districtList, 'district.json');
                        saveData(NoDistrictState, 'NoDistrictState.json');
                    }
                });

            }, 2000);
        });
    });
}

function updateAreaWithZip() {
    var areaList = [];

    readTextFile("files/district.json", function (text) {
        var districtList = JSON.parse(text);
        var districtAdded = 0;
        districtList.forEach(dist => {
            setTimeout(() => {
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": dist.url,
                    "method": "GET",
                    async: false,
                    "headers": {
                        "cache-control": "no-cache",
                        "postman-token": "8f50604a-4657-361b-544c-d17a80c61e75",
                        'Access-Control-Allow-Origin': 'https://worldpostalcode.com'
                    }
                }
                $.ajax(settings).done(function (response) {
                    var data = document.getElementById('data');
                    data.innerHTML = response;
                    var units = data.getElementsByClassName('unit');
                    if (units.length > 0) {
                        for (let i = 0; i < units.length; i++) {
                            let e = units[i].children[0];
                            if (e.children[1]) {
                                var zipCode = e.children[1].innerText;
                                var zipCodes = zipCode.split(" ");
                                if (zipCodes.length > 1) {
                                    areaList.push(
                                        {
                                            RegionCode: dist.RegionCode,
                                            Region: dist.Region,
                                            DistrictCode: dist.DistrictCode,
                                            District: dist.District,
                                            Area: e.children[0].innerText,
                                            Zip: zipCodes[0],
                                            Zip2: zipCodes[1]
                                        }
                                    );
                                }
                                else {
                                    areaList.push(
                                        {
                                            RegionCode: dist.RegionCode,
                                            Region: dist.Region,
                                            DistrictCode: dist.DistrictCode,
                                            District: dist.District,
                                            Area: e.children[0].innerText,
                                            Zip: zipCode,
                                            Zip2: null
                                        }
                                    );
                                }
                            }

                        }
                    }
                    console.log(districtAdded);
                    districtAdded += 1;

                    if (districtAdded == districtList.length) {
                        saveData(districtAreaList, 'district-area.json');
                        //saveData(NoDistrictState, 'NoDistrictState.json');
                    }
                });

            }, 2000);
        });
    });
}
function getURL(url) {
    return url.replace('http://localhost:8080/', mainUrl);
}

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}

function saveData(data, fileName) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";

    var json = JSON.stringify(data),
        blob = new Blob([json], { type: "octet/stream" }),
        url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function CreateFile(fileName, data) {
    var blob = new Blob([data], { type: "octet/stream" });
    fs.writeFile(fileName, blob).then(() => {
        return fs.readString(fileName);
    });
}


//usage:
