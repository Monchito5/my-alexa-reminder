import { SkillBuilders } from "ask-sdk-core"
import LaunchRequestHandler from "../handlers/LaunchRequest"
import CreateReminderIntentHandler from "../handlers/CreateReminderIntent"
import ListRemindersIntentHandler from "../handlers/ListRemindersIntent"
import DeleteReminderIntentHandler from "../handlers/DeleteReminderIntent"
import SessionEndedRequestHandler from "../handlers/SessionEndedRequest"
import alexaValidator from "../utils/alexaValidator"

const skill = SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    CreateReminderIntentHandler,
    ListRemindersIntentHandler,
    DeleteReminderIntentHandler,
    SessionEndedRequestHandler,
  )
  .create()

export default async function handler(req, res) {
  // Verificar petición de Alexa
  if (!alexaValidator(req)) {
    return res.status(401).send("Unauthorized")
  }

  try {
    const response = await skill.invoke(req.body, req.headers)
    res.json(response)
  } catch (error) {
    console.error("Error handling Alexa request:", error)
    res.status(500).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Lo siento, ha ocurrido un error al procesar tu solicitud.",
        },
        shouldEndSession: true,
      },
    })
  }
}
