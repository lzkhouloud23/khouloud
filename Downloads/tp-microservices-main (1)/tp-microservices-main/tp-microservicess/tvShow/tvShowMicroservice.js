const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');

const tvShowProtoPath = 'tvShow.proto';

const tvShowProtoDefinition = protoLoader.loadSync(tvShowProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const tvShowProto = grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;

mongoose
  .connect('mongodb://127.0.0.1:27017/tp_microservices')
  .then(() => console.log('MongoDB connecté pour TVShowService'))
  .catch((err) => console.error('Erreur MongoDB TVShowService:', err));

const tvShowSchema = new mongoose.Schema({
  title: String,
  description: String,
});

const TVShow = mongoose.model('TVShow', tvShowSchema);

const tvShowService = {
  getTvshow: async (call, callback) => {
    try {
      const tvShow = await TVShow.findById(call.request.tv_show_id);

      if (!tvShow) {
        return callback({
          code: grpc.status.NOT_FOUND,
          details: 'Série TV non trouvée',
        });
      }

      callback(null, {
        tv_show: {
          id: tvShow._id.toString(),
          title: tvShow.title,
          description: tvShow.description,
        },
      });
    } catch (err) {
      callback(err);
    }
  },

  searchTvshows: async (call, callback) => {
    try {
      const query = call.request.query || '';

      const tvShows = await TVShow.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      });

      callback(null, {
        tv_shows: tvShows.map((tvShow) => ({
          id: tvShow._id.toString(),
          title: tvShow.title,
          description: tvShow.description,
        })),
      });
    } catch (err) {
      callback(err);
    }
  },

  createTvshow: async (call, callback) => {
    try {
      const tvShow = new TVShow({
        title: call.request.title,
        description: call.request.description,
      });

      const savedTVShow = await tvShow.save();

      callback(null, {
        tv_show: {
          id: savedTVShow._id.toString(),
          title: savedTVShow.title,
          description: savedTVShow.description,
        },
      });
    } catch (err) {
      callback(err);
    }
  },

  updateTvshow: async (call, callback) => {
    try {
      const tvShow = await TVShow.findByIdAndUpdate(
        call.request.id,
        {
          title: call.request.title,
          description: call.request.description,
        },
        { new: true }
      );

      if (!tvShow) {
        return callback({
          code: grpc.status.NOT_FOUND,
          details: 'Série TV non trouvée',
        });
      }

      callback(null, {
        tv_show: {
          id: tvShow._id.toString(),
          title: tvShow.title,
          description: tvShow.description,
        },
      });
    } catch (err) {
      callback(err);
    }
  },

  deleteTvshow: async (call, callback) => {
    try {
      const tvShow = await TVShow.findByIdAndDelete(call.request.id);

      if (!tvShow) {
        return callback({
          code: grpc.status.NOT_FOUND,
          details: 'Série TV non trouvée',
        });
      }

      callback(null, {
        message: 'Série TV supprimée avec succès',
      });
    } catch (err) {
      callback(err);
    }
  },
};

const server = new grpc.Server();
server.addService(tvShowProto.TVShowService.service, tvShowService);

const port = 50052;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error('Échec de la liaison du serveur:', err);
      return;
    }

    console.log(`Microservice de séries TV en cours d'exécution sur le port ${port}`);
  }
);