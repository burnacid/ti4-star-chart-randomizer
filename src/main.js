import tiles from './data/tiles.json'
import tileSelection from './data/tile-selection.json'

document.getElementById('loadButton').addEventListener('click', () => loadData());
document.getElementById('getTile').addEventListener('click', () => getTile());

export function loadJSON(path, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        success(JSON.parse(xhr.responseText));
      }
      else {
        error(xhr);
      }
    }
  };
  xhr.open('GET', path, true);
  xhr.send();
}

export function loadData() {
  var url = document.getElementById('miltyurl').value
  var miltyId = extractId(url)
  var apiUrl = "https://milty.shenanigans.be/api/data?draft="+miltyId

  //console.log('Reading data: '+apiUrl)
  loadJSON(apiUrl, miltyData,'jsonp')
}

function extractId(url) {
  const match = url.match(/\/d\/([a-f0-9]+)/);
  return match ? match[1] : null;
}

function miltyData(Data)
{
  if(Data['draft']['done'] !== true){
    alert('Draft is not done!')
    return
  }

  var players = Data['draft']['draft']['players']
  var playerIds = Object.keys(players)
  var pickedTiles = []
  playerIds.forEach((item) => {
    var selectedSlice = players[item]['slice'];
    pickedTiles = pickedTiles.concat(Data['draft']['slices'][selectedSlice]['tiles']);
  });

  pickedTiles.sort();
  document.getElementById('slices').value = pickedTiles;
  document.getElementById('pok-tiles').checked = Data['draft']['config']['include_pok'];
  document.getElementById('ds-tiles').checked = Data['draft']['config']['include_ds_tiles'];
}

export function getTile() {
  var slices = document.getElementById('slices').value
  var pokTiles = document.getElementById('pok-tiles').checked
  var dsTiles =document.getElementById('ds-tiles').checked
  var tileNumber = document.getElementById('number')
  var planetsInfoDiv = document.getElementById('planetsInfo')
  var possibleTiles = []
  var disallowedTiles = []

  console.log(planetsInfoDiv.innerHTML)

  if(pokTiles === false){
    console.log("No POK")
    Object.keys(tileSelection['pokTiers']).forEach((item) => {
      disallowedTiles = disallowedTiles.concat(tileSelection['pokTiers'][item]);
    })
  }

  if(dsTiles === false){
    console.log("No US")
    Object.keys(tileSelection['DSTiers']).forEach((item) => {
      disallowedTiles = disallowedTiles.concat(tileSelection['DSTiers'][item]);
    })
  }

  Object.keys(tiles).forEach((tileNumber) => {
    let tile = tiles[tileNumber];

    // Filter Mecatol Rex
    if(tileNumber === '18') {
      return;
    }

    if(tile['type'] !== 'blue') {
      return;
    }

    if(disallowedTiles.includes(parseInt(tileNumber))){
      return;
    }

    if(slices.includes(tileNumber)){
      return;
    }

    possibleTiles.push(tileNumber);
  })

  console.log("Disallowed Tiles because they are not selected in the game settings",disallowedTiles);
  console.log("Possible remaining tiles",possibleTiles);

  let planetInfo = ""

  let randomNumber = Math.floor(Math.random() * possibleTiles.length);
  let selectedTileNumber = possibleTiles[randomNumber];
  tileNumber.innerText = selectedTileNumber;

  let planets = tiles[selectedTileNumber]['planets']
  console.log(planets);

  planets.forEach(planet => {
    planetInfo += "<div class='planet'><span class='planetName'>"+planet['name']+"</span> ( <span class='resource'>"+planet['resources']+"</span> | <span class='influence'>"+planet['influence']+"</span> )</div>"
  })

  console.log(planetInfo);
  planetsInfoDiv.innerHTML = planetInfo



}