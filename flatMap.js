const flatMap = new mapboxgl.Map({
  container: 'flatmap',
  style: 'mapbox://styles/spectorr/clpnbyyzn001s01mrcowb6jc0',
  // center: [130, 35],
  zoom: 1.75
});

flatMap.scrollZoom.disable();
flatMap.addControl(new mapboxgl.NavigationControl());

flatMap.on('load', () => {
  flatMap.addSource('countries', {
    'type': 'geojson',
    'data': geojson2
  });

  const genreSelector = document.getElementById('genreSelector');
  let minPercentage = null;
  let maxPercentage = null;

  // Function to add a layer for a specific genre
  function addGenreLayer(genre) {
    geojson.features.forEach(feature => {
      const genreCount = feature.properties[genre] || 0;
      const totalCount = feature.properties.total || 1; // to avoid division by zero
      feature.properties[`${genre}Percentage`] = (genreCount / totalCount) * 100;
      // console.log("perc: ", feature.properties[`${genre}Percentage`]);
      //console.log(genre, feature.properties.name,feature.properties[`${genre}Percentage`]);

      // Update minPercentage and maxPercentage based on the calculated percentage
      if (minPercentage === null || feature.properties[`${genre}Percentage`] < minPercentage) {
        minPercentage = feature.properties[`${genre}Percentage`];
      }
      if (maxPercentage === null || feature.properties[`${genre}Percentage`] > maxPercentage) {
        maxPercentage = feature.properties[`${genre}Percentage`];
      }

    });
    console.log("geojson.features", genre, geojson.features);
    console.log("percentages:", minPercentage, maxPercentage);
    flatMap.addLayer({
      'id': `countries-${genre}`,
      'type': 'circle',
      'source': 'countries',
      'paint': {
        'circle-radius': {
          'property': `${genre}`,
          'type': 'exponential',
          'stops': [
            [{ zoom: 15, value: 1 }, 7],
            [{ zoom: 15, value: 10 }, 7],
            [{ zoom: 15, value: 20 }, 7],
            [{ zoom: 15, value: 50 }, 7],
            [{ zoom: 15, value: 100 }, 7]
          ]
        },
        'circle-color': {
          'property': `${genre}`,//`${genre}Percentage`,
          'type': 'exponential',
          'stops': [
            [0, '#00FF00'],    // Green
            [10, '#32CD32'],   // Lime Green
            [20, '#00FFFF'],   // Aqua
            [30, '#1E90FF'],   // Dodger Blue
            [40, '#0000FF'],   // Blue
            [50, '#8A2BE2'],   // Blue Violet
            [60, '#FF00FF'],   // Magenta
            [70, '#FF4500'],   // Orange Red
            [80, '#FF6347'],   // Tomato
            [90, '#FF8C00'],   // Dark Orange
            [100, '#FF0000']   // Red
          ]
          // 'stops': [
          //   [minPercentage, '#FEF001'],
          //   [minPercentage + (maxPercentage - minPercentage) * 0.25, '#FFCE03'],
          //   [minPercentage + (maxPercentage - minPercentage) * 0.5, '#FD9A01'],
          //   [minPercentage + (maxPercentage - minPercentage) * 0.75, '#FD6104'],
          //   [maxPercentage, '#F00505']
          // ]
        }
      },
      'layout': {
        'visibility': 'none' // Initially hide the layer
      }
    });
  }

  // Function to update the map based on the selected genre
  function updateMap(selectedGenre) {
    // Hide all existing genre layers
    genres.forEach(genre => {
      flatMap.setLayoutProperty(`countries-${genre}`, 'visibility', 'none');
    });

    // Show the selected genre layer
    flatMap.setLayoutProperty(`countries-${selectedGenre}`, 'visibility', 'visible');

    // Create a popup for hover, but don't add it to the map yet
    const hoverPopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    flatMap.on('mouseenter', `countries-${curGenre}`, (e) => {
      flatMap.getCanvas().style.cursor = 'pointer';
      const countryName = e.features[0].properties.name;
      const coordinates = e.features[0].geometry.coordinates.slice();
      const movieCount = e.features[0].properties.movieCount;
      let genreCount = e.features[0].properties[curGenre];
      console.log('e: ', e);

      if (genreCount == undefined) {
        genreCount = 0;
      }
      const genrePercentage = genreCount//(genreCount / movieCount); //* 100;
      const description = `${countryName} Percentage: ${genrePercentage.toFixed(2)}%` + ' Total movies: ' + movieCount;

      // Set the hover popup content and location
      hoverPopup
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(flatMap);
    });

    flatMap.on('mouseleave', `countries-${curGenre}`, () => {
      flatMap.getCanvas().style.cursor = '';
      hoverPopup.remove();
    });
  }

  // Event listener for dropdown change
  genreSelector.addEventListener('change', function() {
    const selectedGenre = genreSelector.value;
    curGenre = selectedGenre;
    //update map when dropdown is changed
    updateMap(selectedGenre);

  });

  // Add layers for each genre
  const genres = ["Action", "Crime", "History", "War", "Drama", "Thriller", "Fantasy", "Comedy", "Romance", "Adventure", "Western", "Horror", "Music", "Science Fiction", "Animation", "Family", "Mystery", "TV Movie"];

  genres.forEach(genre => {
    addGenreLayer(genre);
  });

  // Initial map update with the default genre (e.g., 'Drama')
  let curGenre = 'Action';
  updateMap(curGenre);

  // const legend = document.getElementById('legend');
  // // Create and append the legend title
  // const title = document.createElement('div');
  // title.className = 'legend-title';
  // title.textContent = 'Genre % (genre / total movies)';
  // legend.appendChild(title);
  // // const legendData = [
  // //   { range: '0', color: '#000000', size: 15 },
  // //   { range: '1-33', color: '#FFCE03', size: 15 },
  // //   { range: '34-66', color: '#FD9A01', size: 15 },
  // //   { range: '67-99', color: '#FD6104', size: 15 },
  // //   { range: '100', color: '#F00505', size: 15 }
  // // ];
  // const legendData = [
  //   { range: '0-10', color: '#00FF00', size: 15 },    // Green
  //   { range: '11-20', color: '#32CD32', size: 15 },   // Lime Green
  //   { range: '21-30', color: '#00FFFF', size: 15 },   // Aqua
  //   { range: '31-40', color: '#1E90FF', size: 15 },   // Dodger Blue
  //   { range: '41-50', color: '#0000FF', size: 15 },   // Blue
  //   { range: '51-60', color: '#8A2BE2', size: 15 },  // Blue Violet
  //   { range: '61-70', color: '#FF00FF', size: 15 },  // Magenta
  //   { range: '71-80', color: '#FF4500', size: 15 },  // Orange Red
  //   { range: '81-90', color: '#FF6347', size: 15 },  // Tomato
  //   { range: '91-100', color: '#FF8C00', size: 15 }, // Dark Orange
  //   { range: '100', color: '#FF0000', size: 15 }     // Red
  // ];

  // legendData.forEach(item => {
  //   const itemDiv = document.createElement('div');
  //   itemDiv.className = 'legend-item';

  //   const colorDiv = document.createElement('span');
  //   colorDiv.className = 'legend-key';
  //   colorDiv.style.backgroundColor = item.color;
  //   colorDiv.style.width = `${item.size}px`;
  //   colorDiv.style.height = `${item.size}px`;

  //   const textSpan = document.createElement('span');
  //   textSpan.className = 'legend-text';
  //   textSpan.textContent = item.range;

  //   itemDiv.appendChild(colorDiv);
  //   itemDiv.appendChild(textSpan);
  //   legend.appendChild(itemDiv);
  // });
  const legend = document.getElementById('legend');
  // Create and append the legend title
  const title = document.createElement('div');
  title.className = 'legend-title';
  title.textContent = 'Genre % (genre / total movies)';
  legend.appendChild(title);

  // Create the gradient bar
  const gradientBar = document.createElement('div');
  gradientBar.className = 'gradient-bar';
  legend.appendChild(gradientBar);

  // Create and append labels for 0%, 50%, 100%
  const labels = ['0%', '50%', '100%'];
  const labelsDiv = document.createElement('div');
  labelsDiv.className = 'gradient-labels';
  labels.forEach(label => {
    const labelSpan = document.createElement('span');
    labelSpan.className = 'gradient-label';
    labelSpan.textContent = label;
    labelsDiv.appendChild(labelSpan);
  });
  legend.appendChild(labelsDiv);
});
