L.Routing = L.Routing || {};
L.Routing.Nexogen = L.Class.extend({

  initialize: function (options) {
    L.Util.setOptions(this, options);
  },

  route: function (waypoints, callback, context, _options) {
    const origin = { latitude: waypoints[0].latLng.lat, longitude: waypoints[0].latLng.lng };
    const destination = { latitude: waypoints[waypoints.length - 1].latLng.lat, longitude: waypoints[waypoints.length - 1].latLng.lng };
    const queryCallback = (response) => {
      if (response.ok) {
        const route = response.body;
        const iroute = {};
        iroute.name = `${route.tollCost.amount} ${route.tollCost.currency}`;
        iroute.summary = {
          totalDistance: route.distance,
          totalTime: route.duration
        };
        iroute.coordinates = [];
        const indices = [];
        const legs = route.segments;
        for (let i = 0; i < legs.length; i++) {
          const indicesSecondary = [];
          const steps = legs[i].polyline;
          for (let j = 0; j < steps.length; j++) {
            indicesSecondary.push(iroute.coordinates.length);
            const step = steps[j];
            iroute.coordinates = iroute.coordinates.concat([new L.LatLng(step.latitude, step.longitude)]);
          }
          indices.push(indicesSecondary);
        }
        iroute.inputWaypoints = waypoints || [];
        iroute.waypoints = iroute.actualWaypoints = waypoints;
        iroute.waypointIndices = [0, iroute.coordinates.length - 1];
        iroute.instructions = []
        const maneuvers = route.maneuvers;
        for (let i = 0; i < maneuvers.length; i++) {
          const maneuver = maneuvers[i];
          iroute.instructions.push({
            type: 'Straight',
            text: maneuver.instruction, //.replace(/<(?:.|\n)*?>/gm, ''),
            distance: maneuver.distance,
            time: maneuver.duration,
            exit: null
          });
        }
        callback.call(context || callback, null, [iroute]);
      } else {
        callback.call(context, {
          status: response.status,
          message: `Failed to query route: ${response.status}`
        });
      }
    }
    const options = context.options.router.options;
    const baseUrl = options.baseUrl || '';
    if (!baseUrl) {
      callback.call(context, {
        status: 404,
        message: `404 Server Not Found: URL is undefined in options. You need to define 'baseUrl' property in routing options.`
      });
      return;
    }
    const bearerToken = options.bearerToken || '';
    if (!bearerToken) {
      callback.call(context, {
        status: 401,
        message: `401 Unauthorized: Authentication token is undefined in options. You need to define 'bearerToken' property in routing options.`
      });
      return;
    }
    const queryBody = {
      'from': origin,
      'to': destination,
      'vehicleProfile': options.vehicleProfile || 'Car',
      'provider': options.provider || 'ptv',
      'requiredResults': [
        "Distance", "Duration", "Segments", "Maneuvers", "TollCost"
      ]
    };
    const queryUrl = `${baseUrl}/gis/v2/routing/direct`;
    const postQuery = async (url, body, bearerToken) => {
      let results;
      let response = await fetch(url, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': (typeof (bearerToken) !== 'undefined' && bearerToken) ? `Bearer ${bearerToken}` : null
        },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        results = { 
          ok: true, 
          status: response.status, 
          body: await response.json() 
        };
      } else {
        return { 
          ok: false, 
          status: response.status 
        };
      }
      return results;
    };
    postQuery(queryUrl, queryBody, bearerToken).then(
      result => {
        queryCallback(result);
      },
      reason => {
        console.error(`Failed to query route: ${reason}`);
      });

    return this;
  }
});

L.Routing.nexogen = (options) => {
  return new L.Routing.Nexogen(options);
}