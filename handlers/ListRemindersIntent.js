import * as db from "../services/db"

const ListRemindersIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ListRemindersIntent"
    )
  },
  async handle(handlerInput) {
    const userId = handlerInput.requestEnvelope.session.user.userId

    try {
      // Obtener todos los recordatorios del usuario
      const reminders = await db.list(userId)

      if (reminders.length === 0) {
        return handlerInput.responseBuilder
          .speak('No tienes recordatorios guardados. Puedes crear uno diciendo "crear recordatorio".')
          .reprompt("¿Qué te gustaría hacer?")
          .getResponse()
      }

      // Construir el mensaje con la lista de recordatorios
      let speechText = "Estos son tus recordatorios: "

      reminders.forEach((reminder, index) => {
        speechText += `${index + 1}. ${reminder.medicine}, ${reminder.dosage}, a las ${reminder.time}. `
      })

      speechText += "¿Qué más te gustaría hacer?"

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt("¿Quieres crear un nuevo recordatorio o eliminar alguno existente?")
        .withSimpleCard("Tus Recordatorios", speechText)
        .getResponse()
    } catch (error) {
      console.error("Error listing reminders:", error)

      return handlerInput.responseBuilder
        .speak("Lo siento, ha ocurrido un error al listar tus recordatorios. Por favor, intenta de nuevo.")
        .getResponse()
    }
  },
}

export default ListRemindersIntentHandler
