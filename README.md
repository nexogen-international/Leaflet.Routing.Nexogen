A Leaflet Routing Machine plugin for NEXOGEN GIS Routing API v2. The package contains:

Plug-in for integration with
* NEXOGEN GIS Routing API v2

Plug-in was tested with the following dependencies:
* Leaflet 1.5.1+
* Leaflet Routing Machine 3.2.12+

You must use NEXOGEN GIS Routing API either via a local CORS proxy or your dedicated backend API to avoid CORS issues.

Usage:

To test the plug-in locally, you need to use a local CORS proxy first.
One suggestion is to install `local-cors-proxy` via `npm`.

```
npm install -g local-cors-proxy
lcp https://{api_url_placeholder}
```

where `{api_url_placeholder}` is your URL referring to your designated NEXOGEN GIS API endpoint.

The plug-in can be used in the following way:

```javascript=
L.Routing.control({
	addWaypoints: true,
	waypoints: [
		L.latLng(47.46072, 18.95798),
		L.latLng(46.2530102, 20.1414253)
	],
	router: L.Routing.nexogen({
		baseUrl: '{api_url_placeholder}',
		bearerToken: '{api_token_placeholder}',
		vehicleProfile: 'Truck_40t', // Car, etc.
	}),
	lineOptions: {
		styles: [
			{ color: '#0000F0', opacity: 0.5, weight: 7 }
		]
	}
}).addTo(map);
```
