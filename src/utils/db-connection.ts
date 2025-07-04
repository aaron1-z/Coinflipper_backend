import * as mysql from 'mysql2/promise';
import { gameSettlementsTable } from '../db/table';
import { config } from "../config/env-config";

const pool = mysql.createPool(config.db);

export const executeQuery = async (query: string, params: any[] = []) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [results] = await connection.execute(query, params);
        return results;
    } catch (error) {
        console.error('DB_ERROR Query failed:', error);
        throw error;
    } finally {
        if (connection) connection.release();
    }
};

export const initializeDatabase = async () => {
    try {
        console.log('Connecting to database');
        await executeQuery(gameSettlementsTable);
        console.log('Database table `settlement` is ready.');
    } catch (error) {
        console.error('Could not initialize the database', error);
        process.exit(1);
    }
};

