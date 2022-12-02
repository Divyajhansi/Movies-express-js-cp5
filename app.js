const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
module.exports = app;

//movie db

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    movieName: dbObject.movie_name,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
  };
};

//director db

const convertDirectorDbObjectToResponseObject = (dbObjectDir) => {
  return {
    directorId: dbObjectDir.director_id,
    directorName: dbObjectDir.director_name,
  };
};

//get all movie names

app.get("/movies/", async (request, response) => {
  const getmoviesList = `
  SELECT
   movie_name
    FROM 
    movie`;
  const moviesList = await db.all(getmoviesList);
  response.send(
    moviesList.map((eachMovie) =>
      convertMovieDbObjectToResponseObject(eachMovie)
    )
  );
});

//add new movie into the list

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO movie
       (director_id,movie_name,lead_actor)
       VALUES
      (
         '${directorId}',
          '${movieName}',
         '${leadActor}');`;

  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//GET single movie name

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesList = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = '${movieId}';`;
  const movie = await db.get(getMoviesList);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

//update movie list

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
  UPDATE
    movie
  SET
   director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  WHERE
    movie_id = '${movieId}';`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete a movie from the list

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
    movie
  WHERE
    movie_id = '${movieId}';`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//get all director names

app.get("/directors/", async (request, response) => {
  const getDirectorsList = `
  SELECT
   *
    FROM 
    director`;
  const directorsList = await db.all(getDirectorsList);
  response.send(
    directorsList.map((eachDir) =>
      convertDirectorDbObjectToResponseObject(eachDir)
    )
  );
});

//get list of movies directed by specified director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
