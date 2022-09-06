//the API documentation site https://developers.themoviedb.org/3/

class App {
    static async run() {
        const movies = await APIService.fetchMovies()
        HomePage.renderMovies(movies);
        const gener = await APIService.fetchGenres()
        HomePage.renderGeners(gener);

    }
}

class APIService {
    static TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    static async fetchMovies() {
        const url = APIService._constructUrl(`movie/now_playing`)
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
    static _constructUrl(path) {
        return `${this.TMDB_BASE_URL}/${path}?api_key=cdeca57a6b1c37accb142bc8de4bf9e6`;
    }
    static async fetchGenres() {
        const url = APIService._constructUrl(`genre/movie/list`)
        const response = await fetch(url)
        const data = await response.json()
        console.log(data);
       // debugger;
        return data.genres.map(genre => new Genres(genre))
    }

    static async fetchMoviesByGenre(gener){
        const url = APIService._constructUrl(`discover/movie`);
        const fullUrl = `${url}&with_genres=${gener.id}`;
        console.log(url);
        //debugger;
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);
        return data.results.map(movie => new Movie(movie));
    }

}
class Genres {
    constructor(json) {
        this.id = json.id;
        this.name = json.name;
    }
    static async run(genre){
        const movies = await APIService.fetchMoviesByGenre(genre);
        HomePage.renderMovies(movies);

    }
}

class HomePage {
    static container = document.getElementById('container');
    static renderMovies(movies) {
        const row = document.createElement('div');
        row.className="row row-cols-lg-3 row-cols-md-2 row-cols-sm-1";
        movies.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.className="col card";
            const movieDiv = document.createElement("div");
            movieDiv.className="card-body";
            const movieImage = document.createElement("img");
           // movieImage.className = "card-img-top";
            movieImage.src = `${movie.backdropUrl}`;
            const movieTitle = document.createElement("h3");
            movieTitle.className = "card-title"; 
            movieTitle.textContent = `${movie.title}`;

            const rate = document.createElement('div');
            rate.innerHTML=`<span>Rate : ${movie.rate}</span>`;

            movieImage.addEventListener("click", function() {
                Movies.run(movie);
            });

            movieDiv.appendChild(movieTitle);
            movieDiv.appendChild(rate);
            movieDiv.appendChild(movieImage);

            movieCard.appendChild(movieDiv);
            row.appendChild(movieCard);
            this.container.appendChild(row);
        })
    }
    static genres = document.querySelector(".dropdown-menu");
    static renderGeners(genres) {
        genres.forEach(genre => {
            const genresLi = document.createElement("li")
            genresLi.textContent = `${genre.name}`;;

            genresLi.addEventListener("click", () => {
                Genres.run(genre)
                
            })
            this.genres.appendChild(genresLi);
        })
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
      <div class="row">
        <div class="col-md-4">
          <img id="movie-backdrop" src=${movie.backdropUrl}> 
        </div>
        <div class="col-md-8">
          <h2 id="movie-title">${movie.title}</h2>
          <p id="genres">${movie.genres}</p>
          <p id="movie-release-date">${movie.releaseDate}</p>
          <p id="movie-runtime">${movie.runtime}</p>
          <h3>Overview:</h3>
          <p id="movie-overview">${movie.overview}</p>
        </div>
      </div>
      <h3>Actors:</h3>
    `;
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
        this.genres = json.genres;
        console.log(this.genres)
        console.log(json);
    }

    get backdropUrl() {
        return this.backdropPath ? Movie.BACKDROP_BASE_URL + this.backdropPath : "";
    }
}

document.addEventListener("DOMContentLoaded", App.run);

