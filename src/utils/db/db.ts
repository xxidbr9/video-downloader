import fs from 'fs';
import path from 'path';

const dbFilePath = path.join(__dirname, '../db.json');

export async function writeToDatabase(key: string, value: { name: string, path: string }) {
  try {
    const data: Record<string, any> = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
    data[key] = value;
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
    console.log('Data written to the database.');
  } catch (error) {
    console.error('Error writing to the database:', error);
  }
}


export async function readFromDatabase(key: string) {
  try {
    const data: Record<string, any> = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
    if (data.hasOwnProperty(key)) {
      return data[key];
    } else {
      console.log(`Key '${key}' not found in the database.`);
      return null;
    }
  } catch (error) {
    console.error('Error reading from the database:', error);
    return null;
  }
}