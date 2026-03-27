import { Sequelize } from 'sequelize';
import dotenv from "dotenv";

dotenv.config();

// Configuración de Sequelize
const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.USER,
  process.env.PASSWORD,
  {
    host: process.env.HOST,
    port: process.env.PORT,
    dialect: 'mysql',
    logging: (msg) => console.log(`[Sequelize Log]: ${msg}`), // Habilitar logs detallados de Sequelize
    dialectOptions: {
      // Eliminamos el ssl para que funcione en local
      ssl: false
    },
  }
);

// Probar la conexión a la base de datos
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente.');
    console.log("Detalles de conexión:");
    console.log(`  Host: ${process.env.HOST}`);
    console.log(`  Puerto: ${process.env.PORT}`);
    console.log(`  Base de datos: ${process.env.DATABASE}`);
    console.log(`  Usuario: ${process.env.USER}`);
  })
  .catch((err) => {
    console.error('No se pudo conectar a la base de datos:', err);
  });

// Escuchar eventos importantes
sequelize.addHook('beforeConnect', (config) => {
  console.log('[Sequelize Hook]: Intentando conectar a la base de datos...');
  console.log(`  Host: ${config.host}`);
  console.log(`  Puerto: ${config.port}`);
  console.log(`  Base de datos: ${config.database}`);
  console.log(`  Usuario: ${config.username}`);
});

sequelize.addHook('afterConnect', () => {
  console.log('[Sequelize Hook]: Conexión establecida con éxito.');
});

sequelize.addHook('beforeDisconnect', () => {
  console.log('[Sequelize Hook]: Cerrando conexión...');
});

sequelize.addHook('afterDisconnect', () => {
  console.log('[Sequelize Hook]: Conexión cerrada con éxito.');
});

// Exportar la instancia de Sequelize
export default sequelize;
