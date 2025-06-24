//This is the program on responding to the chatbot

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


const userSessions = {};

app.post("/whatsapp", (req, res) => {
  console.log("Received message:", req.body);

  const from = req.body.From;
  const message = req.body.Body?.toLowerCase().trim() || "";
  let response = "";

  if (!userSessions[from]) {
    userSessions[from] = {
      step: "start",
      data: {
        pickup: "",
        dropoff: "",
        name: "",
      },
    };
  }

  const session = userSessions[from];

  switch (session.step) {
    case "start":
      if (message.includes("ride")) {
        session.step = "awaiting_pickup";
        response = "Where should we pick you up?";
      } else {
        response = "Welcome to WelaCab. Type 'ride' to request a ride.";
      }
      break;

    case "awaiting_pickup":
      session.data.pickup = message;
      session.step = "awaiting_dropoff";
      response = "Got it. Where are you going?";
      break;

    case "awaiting_dropoff":
      session.data.dropoff = message;
      session.step = "complete";
      response = `Ride booked from *${session.data.pickup}* to *${session.data.dropoff}*. Driver is on the way `;
      break;

    case "complete":
      response =
        "You've already booked a ride. Type 'ride' again to start a new one.";
      break;

    default:
      response = "Welcome to WelaCab. Type 'ride' to start.";
  }

  res.set("Content-Type", "text/xml");
  res.send(`
    <Response>
      <Message>${response}</Message>
    </Response>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
