var getCurrentLocation = function () {
    return new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej);
    });
}


var getDistanceMatrix = function (dataInput) {
    return new Promise((resolve, reject) => {
        //'21.031011,105.783206|21.022328,105.790480' data đầu vào api
        let arrayInput = dataInput.map(item => {
            return `${item.lat},${item.long}`
        });

        let destinationsString = arrayInput.join('|');

        getCurrentLocation().then(position => {
            let currentLocation = `${position.coords.latitude},${position.coords.longitude}`;
            if (currentLocation) {
                let param = {
                    api_key: "JEKmH2G9mNpdG5bbo62iMiu6qJgRO12PrBTrehJz",
                    origins: currentLocation,
                    vehicle: 'car',
                    destinations: destinationsString,
                };

                $.ajax({
                    url: "https://rsapi.goong.io/DistanceMatrix",
                    data: param,
                    type: "GET",
                    dataType: "json",
                    beforeSend: function () {
                    },
                    success: function (rs) {
                        if (rs.rows[0]?.elements) {
                            let res = rs.rows[0].elements;
                        let retVal = dataInput.map((item, index) => {
                            item.distance = res[index]?.distance.text;
                            item.duration = res[index]?.duration.text;
                            item.distanceMeter = res[index]?.distance.value;
                            item.durationSeconds = res[index]?.duration.value;
                            item.distanceFix = Ultis.formatFixDistance(res[index]?.distance.value) ;
                            item.durationFix = Ultis.formatFixDuration(res[index]?.duration.value) ;
                            return item;
                        });
                        retVal.sort((a, b) => a.distanceMeter - b.distanceMeter);
                        resolve(retVal);
                    }
                }
                });
        }
        });
});
    
}