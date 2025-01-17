//the API documentation site https://developers.themoviedb.org/3/

class App {
    static async run() {
        const gener = await APIService.fetchGenres()
        Genre.renderGeners(gener);
        const movies = await APIService.fetchMovies()
        HomePage.renderMovies(movies);

    }
}

class APIService {
    static TMDB_BASE_URL = 'https://api.themoviedb.org/3';

    static _constructUrl(path) {
        return `${this.TMDB_BASE_URL}/${path}?api_key=cdeca57a6b1c37accb142bc8de4bf9e6`;
    }

    static async fetchMovies(filter = "now_playing") {
        const url = APIService._constructUrl(`movie/${filter}`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }

    static async fetchMovie(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}`)
        const response = await fetch(url)
        const data = await response.json()
        return new Movie(data)
    }

    static async fetchGenres() {
        const url = APIService._constructUrl(`genre/movie/list`)
        const response = await fetch(url)
        const data = await response.json()
        Genres.genresList = [...data.genres];
        return data.genres.map(genre => new Genre(genre))
    }

    static async fetchMoviesByGenre(gener) {
        const url = APIService._constructUrl(`discover/movie`);
        const fullUrl = `${url}&with_genres=${gener.id}`;
        const response = await fetch(fullUrl);
        const data = await response.json();
        return data.results.map(movie => new Movie(movie));
    }

    static async fetchActors() {
        const url = APIService._constructUrl(`person/popular`);
        const response = await fetch(url);
        const data = await response.json();
        return data.results.map(actor => new Actor(actor));
    }

    static async fetchRelatedMovie(movie_id) {
        const url = APIService._constructUrl(`movie/${movie_id}/similar`);
        const response = await fetch(url);
        const data = await response.json();
        return data.results.map(movie => new Movie(movie));
    }

    static async fetchVideos(movie_id) {
        const url = APIService._constructUrl(`movie/${movie_id}/videos`);
        const response = await fetch(url);
        const data = await response.json();
        return data.results.map(movie => new Trailer(movie));
    }

    static async fetchActorsByMovie(movie_id) {
        const url = APIService._constructUrl(`movie/${movie_id}/credits`);
        const response = await fetch(url);
        const data = await response.json();
        return data.cast.map(movie => new Actor(movie));
    }

    static async fetchSearchMovie(query) {
        const url = APIService._constructUrl(`search/movie`);
        const fullUrl = url + `&query=${query}`;
        const response = await fetch(fullUrl);
        const data = await response.json();
        return data.results.map(movie => new Movie(movie));
    }

    static async fetchActorDetails(actorId) {
        const url = APIService._constructUrl(`person/${actorId}`);
        const response = await fetch(url);
        const data = await response.json();
        return new Actor(data);

    }
}

class Genres {
    static genresList = [];
}
class Genre {
    constructor(json) {
        this.id = json.id;
        this.name = json.name;
    }
    static async run(genre) {
        const movies = await APIService.fetchMoviesByGenre(genre);
        HomePage.renderMovies(movies);


    }
    static genres = document.querySelector(".dropdown-menu");

    static renderGeners(genres) {
        genres.forEach(genre => {
            const genresLi = document.createElement("li")
            genresLi.textContent = `${genre.name}`;;

            genresLi.addEventListener("click", () => {
                Genre.run(genre)

            })
            this.genres.appendChild(genresLi);
        })
    }
}

class Actors {
    static container = document.getElementById('container');
    static async run() {
        const actors = await APIService.fetchActors()
        this.renderActors(actors);
    }

    static renderActors(actors) {
        this.container.innerHTML = '';
        const row = document.createElement('div');
        row.className = "row row-cols-lg-3 row-cols-md-2 row-cols-sm-1";
        actors.forEach(actor => {
            const actorCard = document.createElement("div");
            actorCard.className = "col card";
            actorCard.id = "actor";
            const actorDiv = document.createElement("div");
            actorDiv.className = "card-body";
            const actorImage = document.createElement("img");
            actorImage.className = "card-img-top";
            actorImage.src = `${actor.ProfileUrl}`;
            const nameTitle = document.createElement("h3");
            nameTitle.className = "card-title";
            nameTitle.textContent = `${actor.name}`;



            const popularity = document.createElement('div');
            popularity.innerHTML = `<span>Popularity: ${actor.popularity}</span>`;



            actorImage.addEventListener("click", function () {
                Actor.run(actor);
            });

            actorDiv.appendChild(nameTitle);

            actorDiv.appendChild(popularity);
            actorDiv.appendChild(actorImage);


            actorCard.appendChild(actorDiv);
            row.appendChild(actorCard);
            this.container.appendChild(row);
        })
    }


    static renderMovieActors(actor) {
        const actorsDiv = document.getElementById('movie-actors');

        const card = document.createElement('div');
        card.className = "col card";
        card.id = "movie-actor";
        card.addEventListener('click', () => {
            Actor.run(actor);
        });
        const actorImg = document.createElement('img');
        actorImg.className = "card-img-top";
        actorImg.src = ProdCompany.LOGO_BASE_URL + actor.profile_path;
        const title = document.createElement('p');
        title.className = "card-text";
        title.innerText = actor.name;

        card.appendChild(actorImg);
        card.appendChild(title);

        actorsDiv.appendChild(card);
    }


}

class Filter {
    static async filterMovies(filter) {
        const movies = await APIService.fetchMovies(filter)
        HomePage.renderMovies(movies);
    }
}

class Actor {
    static PROFILE_BASE_URL = 'http://image.tmdb.org/t/p/w780';
    static container = document.getElementById('container');

    constructor(json) {
        this.id = json.id;
        this.name = json.name;
        this.popularity = json.popularity
        this.profile_path = json.profile_path
        this.birthday = json.birthday;
        this.biography = json.biography;
        this.gender = json.gender;
        this.placeOfBirth = json.place_of_birth;
    }
    get ProfileUrl() {
        return this.profile_path ? Actor.PROFILE_BASE_URL + this.profile_path : "";
    }

    static async run(actor) {
        const actorDetails = await APIService.fetchActorDetails(actor.id);
        Actor.renderActor(actorDetails);
    }

    static renderActor(actor) {
        this.container.innerHTML = `
      <div class="row actor-page">
        <div class="col-md-4">
          <img id="Actor-profile" src=${actor.ProfileUrl}> 
        </div>
        <div class="col-md-8">
          <h2 id="actor-title">${actor.name}</h2>
          <table class="table table-borderless">
          <tr>
            <td>
                Gender
            </td>
            <td>
            <div id="genres">${actor.gender !== 2 ? 'Female' : 'Male'}</div>
            </td>
          </tr>
          <tr>
            <td>Birthdate </td>
            <td><p id="movie-release-date">${actor.birthday}</p></td>
          </tr>
          <tr>
            <td>Place of birth</td>
            <td><p id="movie-runtime">${actor.placeOfBirth}</p></td>
          </tr>
          <tr>
            <td>Popularity</td>
            <td>
            <p id="movie-vote">${actor.popularity}</p></td>
          </tr>
          </table>
          <h3 class="movie-sections">Overview</h3>
          <p id="movie-overview">${actor.biography}</p>
          
         
    
        </div>
      </div>
    `;
    }
}



class HomePage {
    static container = document.getElementById('container');
    static renderMovies(movies) {

        this.container.innerHTML = '';

        const row = document.createElement('div');
        row.className = "row row-cols-lg-3 row-cols-md-2 row-cols-sm-1";

        movies.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.className = "col card";
            movieCard.id = "movie";
            const movieDiv = document.createElement("div");
            movieDiv.className = "card-body";
            const movieImage = document.createElement("img");
            movieImage.className = "card-img-top";
            movieImage.src = `${movie.backdropUrl}`;
            const movieTitle = document.createElement("h3");
            movieTitle.className = "card-title";
            movieTitle.textContent = `${movie.title}`;

            const genres = document.createElement('div');
            genres.innerHTML = this.renderMoviesGenre(movie);

            const rate = document.createElement('div');
            rate.innerHTML = `<span>Rate : ${movie.rate}</span>`;

            const description = document.createElement('div');
            description.innerHTML = `<p>${movie.overview}</p>`;
            description.id = "desc";

            movieImage.addEventListener("click", function () {
                Movies.run(movie);
            });

            movieDiv.appendChild(movieTitle);
            movieDiv.appendChild(genres);
            movieDiv.appendChild(rate);
            movieDiv.appendChild(movieImage);
            movieDiv.appendChild(description);

            movieCard.appendChild(movieDiv);
            row.appendChild(movieCard);
            this.container.appendChild(row);
        })
    }
    static renderMoviesGenre(movie) {
        let genreList = '<span>';

        movie.genres.forEach(id => {
            let genreName = Genres.genresList.find(genre => {
                return genre.id === id;
            });
            genreList += ` ${genreName.name} , `;
        });
        return genreList + '</span>';
    }
}


class Movies {
    static async run(movie) {
        const movieData = await APIService.fetchMovie(movie.id)
        MoviePage.renderMovieSection(movieData);
        APIService.fetchActors(movieData)

    }
}

class MoviePage {
    static container = document.getElementById('container');
    static renderMovieSection(movie) {
        MovieSection.renderMovie(movie);
    }
}



class MovieSection {
    static renderMovie(movie) {

        MoviePage.container.innerHTML = `
      <div class="row movie-sections">
        <div class="col-md-5">
          <img id="movie-backdrop" src=${movie.backdropUrl}> 
        </div>
        <div class="col-md-7">
          <h2 id="movie-title">${movie.title}</h2>
          <table class="table table-borderless">
          <tr>
            <td>
                Categories
            </td>
            <td>
            <div id="genres">${MovieSection.renderMoviesGenre(movie)}</div>
            </td>
          </tr>
          <tr>
            <td>Released on </td>
            <td><p id="movie-release-date">${movie.releaseDate}</p></td>
          </tr>
          <tr>
            <td>Time length</td>
            <td><p id="movie-runtime">${movie.runtime}</p></td>
          </tr>
          <tr>
            <td>Language</td>
            <td><p id="movie-language">${movie.language}</p></td>
          </tr>
          <tr>
            <td>Avgerage Rate</td>
            <td>
            <p id="movie-vote">${movie.rate}</p></td>
          </tr>
          <tr>
            <td>Voters Count</td>
            <td><p id="movie-vote-count">${movie.vote_count}</p></td>
          </tr>
          </table>
          <h3 class="movie-sections">Overview</h3>
          <p id="movie-overview">${movie.overview}</p>
          
        </div>
      </div>
      <div id="movie-actors" class="row movie-sections">
      <h3>Actors</h3>
      </div>
      <div id="movie-related" class="row movie-sections">
      <h3>Related Movies</h3>
      </div>
      <div id="trailer" class="movie-sections">
      <h3>Trailer</h3>
      </div>
      <div id="production-company" class="row movie-sections">
      <h3>Production Companies</h3>
      </div>
    `;
        this.GetMovieActors(movie);
        this.GetRelatedMovie(movie);
        this.GetTrailer(movie);
        this.GetProdCompany(movie);

    }

    static async GetMovieActors(movie) {

        const actorsList = await APIService.fetchActorsByMovie(movie.id);
        const mainActors = actorsList.slice(0, 5);
        mainActors.forEach(actor => Actors.renderMovieActors(actor));
    }
    static async GetRelatedMovie(movie) {
        const relatedMovies = document.getElementById("movie-related");
        const movies = await APIService.fetchRelatedMovie(movie.id);
        const mainMovies = movies.slice(0, 5);
        console.log(movies);
        mainMovies.forEach(movie => {
            const card = document.createElement('div');
            card.className = "col card";
            card.id = "related-movie";
            card.addEventListener('click', () => {
                debugger
                Movies.run(movie);
            });
            const movieImg = document.createElement('img');
            movieImg.className = "card-img-top";
            movieImg.src = movie.backdropUrl;

            const title = document.createElement('p');
            title.className = "card-text";
            title.innerText = movie.title;

            card.appendChild(movieImg);
            card.appendChild(title);

            relatedMovies.appendChild(card);
        })
        relatedMovies;
    }
    static async GetTrailer(movie) {
        const trailers = await APIService.fetchVideos(movie.id);
        const youtubeTrailer = trailers.find(video => {
            return video.site === "YouTube"
                && video.type === "Trailer";
        });
        Trailer.run(youtubeTrailer);
    }
    static renderMoviesGenre(movie) {
        let genreList = '<span>';
        movie.genres.forEach(genre => {

            genreList += ` ${genre.name} , `;
        });
        return genreList + '</span>';
    }
    static GetProdCompany(movie) {
        const prodCompanies = movie.ProductionCompany;
        const filteredList = prodCompanies.filter(
            x => x.logo_path !== null
        );
        filteredList.forEach(x => ProdCompany.run(x));
    }
}
class Trailer {
    constructor(json) {
        this.key = json.key;
        this.id = json.id;
        this.type = json.type;
        this.site = json.site;
    }

    static run() {
        const trailerDiv = document.getElementById('trailer');
        const video = document.createElement('div');
        video.innerHTML = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${this.key}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        trailerDiv.appendChild(video);
    }

}
class ProdCompany {
    static LOGO_BASE_URL = 'http://image.tmdb.org/t/p/w780';

    constructor(json) {
        this.id = json.id;
        this.name = json.name;
        this.logo_path = json.logo_path;
    }

    static run(company) {
        const companyContainer = document.getElementById('production-company');
        const card = document.createElement('div');
        card.className = "col card";
        card.id = "prod-company";
        const companyImg = document.createElement('img');
        companyImg.className = "card-img-top";
        companyImg.src = ProdCompany.LOGO_BASE_URL + company.logo_path;
        const title = document.createElement('p');
        title.className = "card-text";
        title.innerText = company.name;

        card.appendChild(companyImg);
        card.appendChild(title);

        companyContainer.appendChild(card);
    }
}
class Movie {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780';
    constructor(json) {
        this.id = json.id;
        this.title = json.title;
        this.releaseDate = json.release_date;
        this.runtime = json.runtime + " minutes";
        this.overview = json.overview;
        this.backdropPath = json.backdrop_path;
        this.rate = json.vote_average;
        this.genres = json.genre_ids ?? json.genres;
        this.language = json.original_language;
        this.vote_count = json.vote_count;
        this.prodCompany = json.production_companies;
    }

    get backdropUrl() {
        return this.backdropPath ? Movie.BACKDROP_BASE_URL + this.backdropPath : "";
    }

    get ProductionCompany() {
        return this.prodCompany ? this.prodCompany.map(comp => new ProdCompany(comp)) : "";
    }
}

class Search {
    static async run(event) {
        event.preventDefault();
        const searchInput = document.getElementById("search-input");
        const searchValue = searchInput.value;
        const result = await APIService.fetchSearchMovie(searchValue);
        HomePage.renderMovies(result);

    }
}
class AboutPage {
    static container = document.getElementById('container');
    static renderAbout() {
        this.container.innerHTML = `
        <div class="row">
            <div class="col-3">
            <img
                class="img-fluid" width="140"
                src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_1-5bdc75aaebeb75dc7ae79426ddd9be3b2be1e342510f8202baf6bffa71d7f5c4.svg"
                alt="TMBD logo">
            </div>
            <div class="col-8">
            <p class="about">Thia wbsite provided you all the movies you looking for and with all info you need to know from trailers to rates and descriptions about it</p>
            </div>
        </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", App.run);

