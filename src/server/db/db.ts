import mysql from 'mysql2/promise';

const mysqlString = GetConvar('mysql_connection_string', null);

export function generateConnectionPool() {
  const split = mysqlString.split(';');
  const hostName = split[0].split('=')[1];
  const database = split[1].split('=')[1];
  const userid = split[2].split('=')[1];
  const password = split[3].split('=')[1];
  return mysql.createPool({
    host: hostName,
    user: userid,
    port: 3306,
    password: password,
    database: database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

export const pool = generateConnectionPool();
