const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb://localhost:27017`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const serverCollection = client.db("RepairDoctor").collection("services");
    const bookingCollection = client.db("RepairDoctor").collection("bookings");

    app.get("/services", async (req, res) => {
      try {
        const cursor = serverCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/services/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const options = {
          projection: { _id: 1, title: 1, price: 1, service_id: 1, img: 1 },
        };
        const result = await serverCollection.findOne(query, options);
        result ? res.send(result) : res.status(404).send("Service Not Found");
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/booking", async (req, res) => {
      try {
        const email = req.query.email;
        if (!email)
          return res.status(400).send("Email query parameter is required");
        const query = { email };
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });

    app.post("/booking", async (req, res) => {
      try {
        const booking = req.body;
        const result = await bookingCollection.insertOne(booking);
        res.json(result);
      } catch (error) {
        res.status(500).send("Failed to create booking");
      }
    });

    app.delete("/booking/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await bookingCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send("Failed to delete booking");
      }
    });

    app.patch("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateBooking = req.body;
      const updateDoc = { $set: { status: updateBooking.status } };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Car repair service is running");
});

app.listen(port, () => {
  console.log(`Car repair server is running on port ${port}`);
});
