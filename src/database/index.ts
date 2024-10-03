import { connect, set } from 'mongoose';
import { NODE_ENV, CONNECTION_URL } from '@config';

export const dbConnection = async () => {
  try {
    if (!CONNECTION_URL) {
      throw new Error('Connection URL not defined in the environment variable');
    }

    if (NODE_ENV === 'production' || NODE_ENV === 'development') {
      set('strictQuery', false);
    }

    const conn = await connect(CONNECTION_URL);
    console.log(`Database connected: ${conn.connection.host}, ${conn.connection.name}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
