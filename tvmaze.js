"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL_SHOWS = 'http://api.tvmaze.com/search/shows';
const BASE_URL_EPISODES = 'http://api.tvmaze.com/shows'
const DEFAULT_IMG = 'https://tinyurl.com/tv-missing';

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {

  let response = await axios.get(BASE_URL_SHOWS, { params: { q: term } });

  let responseShows = response.data;

  let showsArray = [];

  // Get the data from each show
  for (let showData of responseShows) {
    let id = showData.show.id;
    let name = showData.show.name;
    let summary = showData.show.summary;
    let image = (showData.show.image)
      ? showData.show.image.original
      : DEFAULT_IMG;

    showsArray.push({
      id,
      name,
      summary,
      image
    });
  }

  return showsArray;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}"
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      [{ id, name, season, number }, ...]
 */

async function getEpisodesOfShow(id) {
  let response = await axios.get(`${BASE_URL_EPISODES}/${id}/episodes`);
  let episodesData = response.data;

  return episodesData.map(getEpisodeData)
}

/* Get specific episode data for a given episode */

function getEpisodeData(episode) {
  return {
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }
}

/* Given an array of episodes information, create HTML element for each and append to #episodesList in DOM */

function populateEpisodes(episodes) {
  const $episodesList = $('#episodesList');
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(`<li>${episode.name} 
    (season ${episode.season}, number ${episode.number})</li>`);
    $episodesList.append($episode);
  }

  $episodesArea.show();
}


/** Called when the episodes button is clicked and gets
 *  the episodes and places them in the episodes DOM element
*/

async function getsEpisodesAndDisplay(evt) {
  let $show = $(evt.target).closest(".Show");

  let id = $show.attr("data-show-id");
  // let id = $show.data("show-id"); 

  let episodes = await getEpisodesOfShow(id);

  populateEpisodes(episodes);
}

/** When "Episodes" button is clicked, display the episodes */

$("#showsList").on("click", "button", getsEpisodesAndDisplay);
