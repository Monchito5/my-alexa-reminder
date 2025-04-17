import { MongoClient, ObjectId } from "mongodb"

let client, collection

export async function connect() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    collection = client.db("alexa").collection("reminders")
  }
  return collection
}

export async function create(entry) {
  const coll = await connect()
  return coll.insertOne(entry)
}

export async function list(userId) {
  const coll = await connect()
  return coll.find({ userId }).toArray()
}

export async function remove(userId, id) {
  const coll = await connect()
  return coll.deleteOne({ userId, _id: new ObjectId(id) })
}

export async function findById(userId, id) {
  const coll = await connect()
  return coll.findOne({ userId, _id: new ObjectId(id) })
}

// Función para cerrar la conexión cuando sea necesario
export async function close() {
  if (client) {
    await client.close()
    client = null
    collection = null
  }
}
