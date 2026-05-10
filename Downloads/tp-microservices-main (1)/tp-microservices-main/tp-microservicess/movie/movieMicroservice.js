const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');

const movieProtoPath = 'movie.proto';

const movieProtoDefinition = protoLoader.loadSync(movieProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const movieProto = grpc.loadPackageDefinition(movieProtoDefinition).movie;

mongoose
  .connect('mongodb://127.0.0.1:27017/tp_microservices')
  .then(() => console.log('MongoDB connecté pour MovieService'))
  .catch((err) => console.error('Erreur MongoDB MovieService:', err));

const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const Movie = mongoose.model('Movie', movieSchema);

const movieService = {
  getMovie: async (call, callback) => {
    try {
      const movie = await Movie.findById(call.request.movie_id);

      if (!movie) {
        return callback({
          code: grpc.status.NOT_FOUND,
          details: 'Film non trouvé',
        });
      }

      callback(null, {
        movie: {
          id: movie._id.toString(),
          title: movie.title,
          description: movie.description,
        },
      });
    } catch (err) {
      callback(err);
    }
  },

  searchMovies: async (call, callback) => {
    try {
      const query = call.request.query || '';

      const movies = await Movie.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      });

      callback(null, {
        movies: movies.map((movie) => ({
          id: movie._id.toString(),
          title: movie.title,
          description: movie.description,
        })),
      });
    } catch (err) {
      callback(err);
    }
  },

  createMovie: async (call, callback) => {
    try {
      const movie = new Movie({
        title: call.request.title,
        description: call.request.description,
      });

      const savedMovie = await movie.save();

      callback(null, {
        movie: {
          id: savedMovie._id.toString(),
          title: savedMovie.title,
          description: savedMovie.description,
        },
      });
    } catch (err) {
      callback(err);
    }
  },

  updateMovie: async (call, callback) => {
    try {
      const movie = await Movie.findByIdAndUpdate(
        call.request.id,
        {
          title: call.request.title,
          description: call.request.description,
        },
        { new: true }
      );

      if (!movie) {
        return callback({
          code: grpc.status.NOT_FOUND,
          details: 'Film non trouvé',
        });
      }

      callback(null, {
        movie: {
          id: movie._id.toString(),
          title: movie.title,
          description: movie.description,
        },
      });
    } catch (err) {
      callback(err);
    }
  },

  deleteMovie: async (call, callback) => {
    try {
      const movie = await Movie.findByIdAndDelete(call.request.id);

      if (!movie) {
        return callback({
          code: grpc.status.NOT_FOUND,
          details: 'Film non trouvé',
        });
      }

      callback(null, {
        message: 'Film supprimé avec succès',
      });
    } catch (err) {
      callback(err);
    }
  },
};

const server = new grpc.Server();
server.addService(movieProto.MovieService.service, movieService);

const port = 50051;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error('Échec de la liaison du serveur:', err);
      return;
    }

    console.log(`Microservice de films en cours d'exécution sur le port ${port}`);
  }
);