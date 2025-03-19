import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    await client.connect();
    const database = client.db('portfolio');
    const collection = database.collection('contacts');

    const result = await collection.insertOne({
      name,
      email,
      message,
      createdAt: new Date(),
    });

    return res.status(200).json({ message: 'Datos guardados con éxito', id: result.insertedId });
  } catch (error) {
    console.error('Error al guardar en MongoDB:', error);
    return res.status(500).json({ error: 'Error al guardar los datos' });
  } finally {
    await client.close();
  }
};