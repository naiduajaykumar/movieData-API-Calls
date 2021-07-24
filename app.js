const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMovieDbObjectToResponseObject = (dbObjectMovie) => {
  return {
    movieId: dbObjectMovie.movie_id,
    directorId: dbObjectMovie.director_id,
    movieName: dbObjectMovie.movie_name,
    leadActor: dbObjectMovie.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObjectDirector) => {
  return {
    directorId: dbObjectDirector.director_id,
    directorName: dbObjectDirector.director_name,
  };
};

/**API-1 */
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        select movie_name
        from movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) =>
      convertMovieDbObjectToResponseObject(eachMovie)
    )
  );
});

/**API -2 */
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
        insert into
            movie (director_id,movie_name,lead_actor)
        values
            ('${directorId}','${movieName}','${leadActor}');`;
  const movie = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

/**API-3 */
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `
        select *
        from movie
        where 
            movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

/**API-4 */
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;

  const updateMovieQuery = `
        update movie
        set 
            director_id = '${directorId}',
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        where 
            movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

/**API-5 */
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        delete from movie
        where 
            movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

/**API-6 */
app.get("/directors/", async (request, response) => {
  const getMoviesQuery = `
        select *
        from director;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) =>
      convertDirectorDbObjectToResponseObject(eachMovie)
    )
  );
});

/**API-7 */
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId, movies } = request.params;
  const getDirectorMoviesQuery = `
  select movie_name
        from movie 
        where
           director_id= '${directorId}' `;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
